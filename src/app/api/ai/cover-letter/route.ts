import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { tool } from '@langchain/core/tools';
import { StateGraph, MessagesAnnotation } from '@langchain/langgraph';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

import { authMiddleware } from '@/lib/auth-middleware';
import { prisma } from '@/lib/db';
import { errorHandler } from '@/lib/errorHandler';
import { parseResumeFromPdf } from '@/lib/resume-parser';
import { llm } from '@/lib/ai';
import {
  extractResumeSections,
  generateJobEmbedding,
  prepareResumeContent,
} from '@/lib/embeddings';
import { vectorStorage } from '@/lib/vector-storage';
import { CustomError } from '@/lib/errors';

const requestSchema = z.object({
  jobId: z.string(),
  resumeId: z.string(),
});

const parseStoredResumeJson = (value: unknown) => {
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch (_err) {
    return value;
  }
};

const stringifyResumeJson = (value: unknown) => {
  if (typeof value === 'string') return value;
  return JSON.stringify(value, null, 2) ?? '';
};

const getFallbackResumeSections = (resumeJson: unknown) => {
  const extractedSections = extractResumeSections(resumeJson);
  const sections = Object.entries(extractedSections)
    .map(([section, content]) => ({
      section,
      content,
    }))
    .filter((section) => section.content.trim().length > 0);

  if (sections.length > 0) return sections;

  const fullResumeContent = prepareResumeContent(resumeJson);
  if (fullResumeContent.trim()) {
    return [{ section: 'resume', content: fullResumeContent }];
  }

  const resumeJsonContent = stringifyResumeJson(resumeJson);
  if (resumeJsonContent.trim()) {
    return [{ section: 'resume_json', content: resumeJsonContent }];
  }

  return [];
};

export async function POST(req: NextRequest) {
  try {
    const token = await authMiddleware(req, 'applicant');
    const body = await req.json();
    const { jobId, resumeId } = requestSchema.parse(body);

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { company: true },
    });

    if (!job) {
      throw new CustomError('Job not found', 404);
    }

    const applicant = await prisma.applicant.findFirst({
      where: {
        email: token.email,
      },
    });

    if (!applicant) {
      throw new CustomError('Applicant not found', 404);
    }

    const resume = await prisma.resume.findFirst({
      where: {
        id: resumeId,
        applicant_id: applicant.id,
      },
    });

    if (!resume) {
      throw new CustomError('Resume not found', 404);
    }

    let resumeJson: unknown;
    if (resume.json) {
      resumeJson = parseStoredResumeJson(resume.json);
    } else {
      if (resume.type !== 'pdf' || !resume.url) {
        throw new CustomError('Resume content is unavailable', 404);
      }
      resumeJson = await parseResumeFromPdf(resume.url);
    }

    // --- LangGraph Implementation ---

    // 1. Define Tools
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
          resumeId,
          3,
        );

        const sections = relevantSections.length > 0
          ? relevantSections
          : getFallbackResumeSections(resumeJson);

        return JSON.stringify({ sections });
      },
      {
        name: 'get_relevant_experience',
        description: 'Retrieve the resume sections that are most relevant to the provided job description.',
        schema: z.object({
          job_description: z.string().describe('The job description to use for retrieval.'),
        }),
      }
    );

    const tools = [relevantExperienceTool];
    const toolNode = new ToolNode(tools);
    const modelWithTools = llm.bindTools(tools);

    // 2. Define Graph Logic
    const callModel = async (state: typeof MessagesAnnotation.State) => {
      const { messages } = state;
      const response = await modelWithTools.invoke(messages);
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

    // 3. Build Graph
    const workflow = new StateGraph(MessagesAnnotation)
      .addNode('agent', callModel)
      .addNode('tools', toolNode)
      .addEdge('__start__', 'agent')
      .addConditionalEdges('agent', shouldContinue)
      .addEdge('tools', 'agent');

    const app = workflow.compile();

    // 4. Execute Graph
    const systemPrompt = new SystemMessage(
      'You are a professional cover letter writer. ' +
      'First, call get_relevant_experience with the job description to find matching skills. ' +
      'Then, use the retrieved sections to write a tailored, professional cover letter.'
    );

    const userMessage = new HumanMessage(
      `Write a cover letter for:
      Position: ${job.job_role}
      Company: ${job.company.name}
      Job Description:
      ${job.description}`
    );

    const stream = await app.streamEvents(
      { messages: [systemPrompt, userMessage] },
      { version: 'v2' }
    );

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const { event, data } of stream) {
          if (event === 'on_chat_model_stream' && data.chunk?.content) {
            // Only stream back the final assistant's content to the client
            controller.enqueue(encoder.encode(data.chunk.content));
          }
        }
        controller.close();
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err) {
    const [resBody, status] = errorHandler(err);
    return NextResponse.json(resBody, status);
  }
}
