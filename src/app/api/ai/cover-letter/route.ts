import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { authMiddleware } from '@/lib/auth-middleware';
import { prisma } from '@/lib/db';
import { CustomError, errorHandler } from '@/lib/errorHandler';
import { parseResumeFromPdf } from '@/lib/resume-parser';
import { createChatCompletionStream } from '@/lib/ai';
import { getCoverLetterPrompt } from '@/constant/ai-prompts';

const requestSchema = z.object({
  jobId: z.string(),
  resumeId: z.string(),
});

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

    let resumeContent = '';
    if (resume.json) {
      if (typeof resume.json === 'string') {
        resumeContent = resume.json;
      } else {
        resumeContent = JSON.stringify(resume.json);
      }
    } else {
      if (resume.type !== 'pdf' || !resume.url) {
        throw new CustomError('Resume content is unavailable', 404);
      }
      const parsedResume = await parseResumeFromPdf(resume.url);
      resumeContent = JSON.stringify(parsedResume);
    }

    const prompt = getCoverLetterPrompt({
      jobTitle: job.job_role,
      companyName: job.company.name,
      jobDescription: job.description,
      resumeContent,
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
