import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { z } from 'zod';
import { tool } from '@langchain/core/tools';
import { StateGraph, MessagesAnnotation } from '@langchain/langgraph';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

import { authMiddleware } from '@/lib/auth-middleware';
import { prisma } from '@/lib/db';
import { errorHandler } from '@/lib/errorHandler';
import { CustomError } from '@/lib/errors';
import { groupTextItemsIntoLines } from '@/lib/resume-parser/group-text-items-into-lines';
import { groupLinesIntoSections } from '@/lib/resume-parser/group-lines-into-sections';
import { extractResumeFromSections } from '@/lib/resume-parser/extract-resume-from-sections';
import { readPdf } from '@/lib/resume-parser/read-pdf';
import { llm } from '@/lib/ai';
import { getResumeBuilderPrompt } from '@/constant/ai-prompts';
import { initialResume, Resume } from '@/mock/resume';
import { resumeSchema } from '@/lib/resume-schema';
import {
  generateResumeEmbedding,
  generateSectionalEmbeddings,
  generateJobEmbedding,
  extractResumeSections,
  prepareResumeContent,
} from '@/lib/embeddings';
import { vectorStorage } from '@/lib/vector-storage';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: jobId } = await params;
    if (!jobId) throw new CustomError('Job id missing', 400);

    const token = await authMiddleware(req, 'applicant');

    const applicant = await prisma.applicant.findUnique({
      where: { email: token.email },
      include: { resume: true },
    });
    if (!applicant) throw new CustomError('Applicant not found', 404);

    // Validate job exists
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { company: true },
    });
    if (!job) throw new CustomError('Job not found', 404);

    // validate if jobs is applied
    const isApplied = await prisma.appliedJob.findFirst({
      where: {
        jobId,
        applicant_id: applicant.id,
      },
    });

    if (isApplied) {
      throw new CustomError('You already applied for this job', 403);
    }

    const existResume = await prisma.resume.findFirst({
      where: {
        type: 'pdf',
        applicant_id: applicant.id,
      },
    });

    if (!existResume?.url) {
      throw new CustomError(
        'Resume is not uploaded, upload the resume first',
        403,
      );
    }

    const pdfContent = await readPdf(existResume?.url);

    // Resume parser: Parse the resume & extract the content
    const lines = groupTextItemsIntoLines(pdfContent);
    const sections = groupLinesIntoSections(lines);
    const resumeJson = extractResumeFromSections(sections);

    const profileOriginal = { ...resumeJson.profile };
    resumeJson.profile = { ...initialResume.profile };
    resumeJson.profile.summary = profileOriginal.summary;

    // --- LangGraph Implementation ---

    // 1. Define Retrieval Tool
    const relevantExperienceTool = tool(
      async ({ job_description }) => {
        const jobEmbedding = await generateJobEmbedding({
          job_role: job.job_role,
          description: job_description,
          skills_required: job.skills_required,
          location: job.location,
          ctc: job.ctc,
          stipend: job.stipend,
        });

        const relevantSections = await vectorStorage.retrieveRelevantSections(
          jobEmbedding,
          existResume.id,
          3,
        );

        const sections = relevantSections.length > 0
          ? relevantSections
          : (() => {
              const extractedSections = extractResumeSections(resumeJson);
              const sections = Object.entries(extractedSections)
                .map(([section, content]) => ({
                  section,
                  content,
                }))
                .filter((section) => section.content.trim().length > 0);

              if (sections.length > 0) return sections;

              const fullResumeContent = prepareResumeContent(resumeJson);
              return [{ section: 'resume', content: fullResumeContent }];
            })();

        return JSON.stringify({ sections });
      },
      {
        name: 'get_relevant_experience',
        description: 'Retrieve relevant resume sections for enhancement.',
        schema: z.object({
          job_description: z.string().describe('The job description to use for retrieval.'),
        }),
      }
    );

    const tools = [relevantExperienceTool];
    const toolNode = new ToolNode(tools);
    const modelWithTools = llm.bindTools(tools);

    // 2. Graph Nodes
    const callModel = async (state: typeof MessagesAnnotation.State) => {
      const response = await modelWithTools.invoke(state.messages);
      return { messages: [response] };
    };

    const shouldContinue = (state: typeof MessagesAnnotation.State) => {
      const { messages } = state;
      const lastMessage = messages[messages.length - 1];
      if ('tool_calls' in lastMessage && Array.isArray(lastMessage.tool_calls) && lastMessage.tool_calls.length > 0) {
        return 'tools';
      }
      return '__end__';
    };

    // 3. Define Graph
    const workflow = new StateGraph(MessagesAnnotation)
      .addNode('agent', callModel)
      .addNode('tools', toolNode)
      .addEdge('__start__', 'agent')
      .addConditionalEdges('agent', shouldContinue)
      .addEdge('tools', 'agent');

    const app = workflow.compile();

    // 4. Run Graph to get context
    const finalState = await app.invoke({
      messages: [
        new SystemMessage('You prepare context for resume enhancement. Call get_relevant_experience first.'),
        new HumanMessage(`Find sections for: ${job.job_role}\n\n${job.description}`)
      ]
    });

    // Extract sections from tool output
    const toolMessage = finalState.messages.find(m => m.getType() === 'tool');
    const retrievedSections = toolMessage ? JSON.parse(toolMessage.content as string).sections : [];

    // 5. Final Generation with Structured Output
    const prompt = getResumeBuilderPrompt(
      JSON.stringify(resumeJson),
      job.description,
      retrievedSections
    );

    const structuredLlm = llm.withStructuredOutput(resumeSchema);
    const enhancedResume = await structuredLlm.invoke([
      new SystemMessage('You are an expert resume optimizer. Return ONLY the enhanced resume JSON.'),
      new HumanMessage(prompt)
    ]) as Resume;

    // --- Post-Processing & Storage ---
    enhancedResume.profile.name = profileOriginal.name;
    enhancedResume.profile.email = profileOriginal.email;
    enhancedResume.profile.phone = profileOriginal.phone;
    enhancedResume.profile.url = profileOriginal.url;
    enhancedResume.profile.location = profileOriginal.location;

    const resumeTitle = existResume.title.replace('.pdf', '') + '-' + Date.now();

    const [resumeEmbedding, sectionalEmbeddings] = await Promise.all([
      generateResumeEmbedding(enhancedResume),
      generateSectionalEmbeddings(enhancedResume),
    ]);

    const dbRes = await prisma.$transaction(async (tx) => {
      await tx.resume.deleteMany({
        where: {
          applicant_id: applicant.id,
          type: 'json',
          appliedJobs: { none: {} },
        },
      });

      const newResume = await tx.resume.create({
        data: {
          title: resumeTitle,
          type: 'json',
          json: enhancedResume as unknown as Prisma.InputJsonValue,
          applicant_id: applicant.id,
        },
      });

      await vectorStorage.storeSectionalEmbeddings(newResume.id, sectionalEmbeddings, tx);
      await vectorStorage.storeResumeEmbedding(newResume.id, resumeEmbedding, tx);

      return newResume;
    });

    return NextResponse.json({ status: true, data: dbRes });
  } catch (err) {
    const [resBody, status] = errorHandler(err);
    return NextResponse.json(resBody, status);
  }
}
