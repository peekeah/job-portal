import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import type {
  ChatCompletionMessageFunctionToolCall,
  ChatCompletionMessageParam,
  ChatCompletionMessageToolCall,
  ChatCompletionTool,
} from 'openai/resources/chat/completions';
import { z } from 'zod';

import { authMiddleware } from '@/lib/auth-middleware';
import { prisma } from '@/lib/db';
import { errorHandler } from '@/lib/errorHandler';
import { CustomError } from '@/lib/errors';
import { groupTextItemsIntoLines } from '@/lib/resume-parser/group-text-items-into-lines';
import { groupLinesIntoSections } from '@/lib/resume-parser/group-lines-into-sections';
import { extractResumeFromSections } from '@/lib/resume-parser/extract-resume-from-sections';
import { readPdf } from '@/lib/resume-parser/read-pdf';
import { callLLm, createToolCallingStream } from '@/lib/ai';
import { getResumeBuilderPrompt } from '@/constant/ai-prompts';
import { initialResume, Resume } from '@/mock/resume';
import {
  generateResumeEmbedding,
  generateSectionalEmbeddings,
  generateJobEmbedding,
  extractResumeSections,
  prepareResumeContent,
} from '@/lib/embeddings';
import { vectorStorage } from '@/lib/vector-storage';

const relevantExperienceToolName = 'get_relevant_experience';

const relevantExperienceToolInputSchema = z.object({
  job_description: z.string().min(1),
});

const relevantExperienceTool: ChatCompletionTool = {
  type: 'function',
  function: {
    name: relevantExperienceToolName,
    description:
      'Retrieve the resume sections that are most relevant to the provided job description.',
    parameters: {
      type: 'object',
      properties: {
        job_description: {
          type: 'string',
          description:
            'The exact job description to use when retrieving relevant resume sections.',
        },
      },
      required: ['job_description'],
      additionalProperties: false,
    },
  },
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

const findRelevantExperienceToolCall = (
  toolCalls?: ChatCompletionMessageToolCall[],
): ChatCompletionMessageFunctionToolCall | undefined =>
  toolCalls?.find(
    (toolCall): toolCall is ChatCompletionMessageFunctionToolCall =>
      toolCall.type === 'function' &&
      toolCall.function.name === relevantExperienceToolName,
  );

const getToolJobDescription = (
  toolCall: ChatCompletionMessageFunctionToolCall,
  fallbackJobDescription: string,
) => {
  try {
    const parsedArguments = relevantExperienceToolInputSchema.safeParse(
      JSON.parse(toolCall.function.arguments),
    );

    if (parsedArguments.success) {
      return parsedArguments.data.job_description;
    }
  } catch (_err) {
    return fallbackJobDescription;
  }

  return fallbackJobDescription;
};

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

    // Resume parser: Parse the resume & exctract the content
    const lines = groupTextItemsIntoLines(pdfContent);
    const sections = groupLinesIntoSections(lines);
    const resumeJson = extractResumeFromSections(sections);

    const profile = { ...resumeJson.profile };
    resumeJson.profile = { ...initialResume.profile };
    resumeJson.profile.summary = profile.summary;

    const retrieveSectionsForJob = async (jobDescription: string) => {
      const jobEmbedding = await generateJobEmbedding({
        job_role: job.job_role,
        description: jobDescription,
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

      return relevantSections.length > 0
        ? relevantSections
        : getFallbackResumeSections(resumeJson);
    };

    const toolMessages: ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content:
          'You prepare context for resume enhancement. Before continuing, call get_relevant_experience with the exact job description.',
      },
      {
        role: 'user',
        content: `Find the candidate resume sections most relevant to this role.

Position: ${job.job_role}
Company: ${job.company.name}
Job Description:
${job.description}`,
      },
    ];

    const toolResponse = await createToolCallingStream(
      toolMessages,
      [relevantExperienceTool],
      'gpt-4o-mini',
      0.2,
      0.1,
      {
        type: 'function',
        function: { name: relevantExperienceToolName },
      },
    );

    const toolCall = findRelevantExperienceToolCall(toolResponse.tool_calls);
    const retrievedSections = await retrieveSectionsForJob(
      toolCall
        ? getToolJobDescription(toolCall, job.description)
        : job.description,
    );

    const llmInput = getResumeBuilderPrompt(
      JSON.stringify(resumeJson),
      job.description,
      retrievedSections,
    );

    const response = await callLLm(llmInput, 'gpt-5.2', 0.3, 0.85);

    const output = response.output[0].content[0].text;
    const cleanedOutput = output
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    const extractJsonPayload = (text: string) => {
      const firstBrace = text.indexOf('{');
      const firstBracket = text.indexOf('[');
      const startIndex = [firstBrace, firstBracket]
        .filter((index) => index !== -1)
        .sort((a, b) => a - b)[0];

      if (startIndex === undefined) return text;

      const endBrace = text.lastIndexOf('}');
      const endBracket = text.lastIndexOf(']');
      const endIndex = Math.max(endBrace, endBracket);

      return endIndex > startIndex
        ? text.slice(startIndex, endIndex + 1)
        : text;
    };

    let enhancedResume: Resume;
    try {
      enhancedResume = JSON.parse(extractJsonPayload(cleanedOutput)) as Resume;
    } catch (_err) {
      throw new CustomError('LLM returned unparseable response', 502);
    }

    enhancedResume.profile.name = profile.name;
    enhancedResume.profile.email = profile.email;
    enhancedResume.profile.phone = profile.phone;
    enhancedResume.profile.url = profile.url;
    enhancedResume.profile.location = profile.location;

    const resumeTitle = existResume.title.replace('.pdf', '') + Date.now();

    const [resumeEmbedding, sectionalEmbeddings] = await Promise.all([
      generateResumeEmbedding(enhancedResume),
      generateSectionalEmbeddings(enhancedResume),
    ]);

    // Save in the DB
    const dbRes = await prisma.$transaction(async (tx) => {
      // Cleanup orphaned json resumes (not used in any application)
      await tx.resume.deleteMany({
        where: {
          applicant_id: applicant.id,
          type: 'json',
          appliedJobs: {
            none: {},
          },
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

      await vectorStorage.storeSectionalEmbeddings(
        newResume.id,
        sectionalEmbeddings,
        tx,
      );
      await vectorStorage.storeResumeEmbedding(
        newResume.id,
        resumeEmbedding,
        tx,
      );

      return newResume;
    });

    return NextResponse.json({ status: true, data: dbRes });
  } catch (err) {
    const [resBody, status] = errorHandler(err);
    return NextResponse.json(resBody, status);
  }
}
