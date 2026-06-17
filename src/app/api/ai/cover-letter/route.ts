import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { tool } from '@langchain/core/tools';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

import { authMiddleware } from '@/lib/auth-middleware';
import { prisma } from '@/lib/db';
import { errorHandler } from '@/lib/errorHandler';
import { parseResumeFromPdf } from '@/lib/resume-parser';
import { createReActAgent } from '@/lib/langgraph';
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
    const app = createReActAgent(tools);

    const profile = (resumeJson as { profile?: Record<string, string> })?.profile || {};

    // 2. Execute Graph
    const systemPrompt = new SystemMessage(
      `You are a professional cover letter writer for ${profile.name || 'a candidate'}. ` +
      `Candidate Details:
       - Name: ${profile.name || ''}
       - Email: ${profile.email || ''}
       - Phone: ${profile.phone || ''}
       - Location: ${profile.location || ''}
      
      First, call get_relevant_experience with the job description to find matching skills. ` +
      'Then, use the retrieved sections and the candidate details provided above to write a tailored, professional cover letter. ' +
      'DO NOT use placeholders like [Your Name], [Your Email], or [Date] if you can avoid it; use the provided details or leave them out if they would look like a placeholder.'
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
            // Only stream back the final assistant's content to the client.
            // Skip chunks that are part of a tool call.
            const isToolCall = data.chunk.tool_call_chunks && data.chunk.tool_call_chunks.length > 0;
            if (!isToolCall) {
              controller.enqueue(encoder.encode(data.chunk.content));
            }
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
