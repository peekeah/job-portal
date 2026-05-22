import { NextRequest, NextResponse } from 'next/server';

import { authMiddleware } from '@/lib/auth-middleware';
import { prisma } from '@/lib/db';
import { errorHandler } from '@/lib/errorHandler';
import { parseResumeFromPdf } from '@/lib/resume-parser';
import { createChatCompletionStream } from '@/lib/ai';
import { getResumeCritiquePrompt } from '@/constant/ai-prompts';
import { CustomError } from '@/lib/errors';

export async function POST(req: NextRequest) {
  try {
    const token = await authMiddleware(req, 'applicant');
    const body = await req.json();
    const resumeId = body?.resumeId as string | undefined;

    if (!resumeId) {
      throw new CustomError('Resume id is required', 400);
    }

    const applicant = await prisma.applicant.findFirst({
        where: {
            email: token.email
        }
    })

    if (!applicant) {
      throw new CustomError('user does not exist', 403);
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

    let parsedResume: unknown;
    if (resume.json) {
      parsedResume = resume.json;
    } else {
      if (resume.type !== 'pdf' || !resume.url) {
        throw new CustomError('Resume content is unavailable', 404);
      }
      parsedResume = await parseResumeFromPdf(resume.url);
    }

    const prompt = getResumeCritiquePrompt(JSON.stringify(parsedResume));
    const stream = await createChatCompletionStream(
      [{ role: 'user', content: prompt }],
      'gpt-4o',
      0.3,
      0.85,
    );

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  } catch (err) {
    const [resBody, status] = errorHandler(err);
    return NextResponse.json(resBody, status);
  }
}
