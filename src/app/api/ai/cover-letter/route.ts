import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { authMiddleware } from '@/lib/auth-middleware';
import { prisma } from '@/lib/db';
import { CustomError, errorHandler } from '@/lib/errorHandler';
import { parseResumeFromPdf } from '@/lib/resume-parser';
import { createChatCompletionStream } from '@/lib/ai';
import { getCoverLetterPrompt } from '@/constant/ai-prompts';
import {
  extractResumeSections,
  generateJobEmbedding,
  prepareResumeContent,
} from '@/lib/embeddings';
import { vectorStorage } from '@/lib/vector-storage';

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

    // Generate job description embedding
    const jobEmbedding = await generateJobEmbedding({
      job_role: job.job_role,
      description: job.description,
      skills_required: job.skills_required,
      location: job.location,
      ctc: job.ctc,
      stipend: job.stipend,
    });

    // Retrieve top-3 most relevant resume sections
    const relevantSections = await vectorStorage.retrieveRelevantSections(
      jobEmbedding,
      resumeId,
      3,
    );

    const resumeSections =
      relevantSections.length > 0
        ? relevantSections
        : getFallbackResumeSections(resumeJson);

    const prompt = getCoverLetterPrompt({
      jobTitle: job.job_role,
      companyName: job.company.name,
      jobDescription: job.description,
      retrievedSections: resumeSections,
    });

    const stream = await createChatCompletionStream(
      [{ role: 'user', content: prompt }],
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
