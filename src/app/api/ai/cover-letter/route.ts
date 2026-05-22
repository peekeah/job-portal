import { NextRequest, NextResponse } from 'next/server';
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
import { parseResumeFromPdf } from '@/lib/resume-parser';
import { createChatCompletionStream, createToolCallingStream } from '@/lib/ai';
import { getCoverLetterPrompt } from '@/constant/ai-prompts';
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
        resumeId,
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
          'You prepare context for cover letters. Before writing anything, call get_relevant_experience with the exact job description.',
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
    const resumeSections = await retrieveSectionsForJob(
      toolCall
        ? getToolJobDescription(toolCall, job.description)
        : job.description,
    );

    const prompt = getCoverLetterPrompt({
      jobTitle: job.job_role,
      companyName: job.company.name,
      jobDescription: job.description,
      retrievedSections: resumeSections,
    });

    const finalMessages: ChatCompletionMessageParam[] = toolCall
      ? [
          ...toolMessages,
          {
            role: 'assistant',
            content: toolResponse.content,
            tool_calls: [toolCall],
          },
          {
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify({ sections: resumeSections }),
          },
          { role: 'user', content: prompt },
        ]
      : [{ role: 'user', content: prompt }];

    const stream = await createChatCompletionStream(
      finalMessages,
      'gpt-4o-mini',
      0.7,
      0.1,
    );

    return new Response(stream, {
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
