import { NextRequest, NextResponse } from 'next/server';

import { authMiddleware } from '@/lib/auth-middleware';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { errorHandler } from '@/lib/errorHandler';
import { CustomError } from '@/lib/errors';
import { calculateJobMatchScore } from '@/lib/match-score';
import {
  generateResumeEmbedding,
  generateSectionalEmbeddings,
} from '@/lib/embeddings';
import { vectorStorage } from '@/lib/vector-storage';
import z from 'zod';

const payloadSchema = z.object({
  resumeId: z.uuid(),
  resumeData: z.string(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: jobId } = await params;

    if (!jobId) throw new CustomError('Job id missing', 400);

    const token = await authMiddleware(req, 'applicant');

    const rawPayload = await req.json();
    const payload = payloadSchema.parse(rawPayload);

    const studentData = await prisma.applicant.findUnique({
      where: {
        email: token.email,
      },
    });

    if (!studentData) {
      throw new CustomError('student not found', 403);
    }

    if (!studentData?.id) throw new CustomError('Student data missing', 400);

    // Validate applicant resume
    const existResume = await prisma.resume.findFirst({
      where: {
        id: payload.resumeId,
        applicant_id: studentData.id,
      },
    });

    if (!existResume) {
      throw new CustomError('resume does not exist', 403);
    }

    const existJob = await prisma.job.findFirst({
      where: {
        id: jobId,
      },
    });

    if (!existJob) {
      throw new CustomError('Job not found', 403);
    }

    const appliedJob = await prisma.appliedJob.findFirst({
      where: {
        jobId,
        applicant_id: studentData.id,
      },
    });

    if (appliedJob) {
      throw new CustomError('You already applied for this job', 403);
    }

    let resumeJson: unknown;
    try {
      resumeJson = JSON.parse(payload.resumeData);
    } catch (_err) {
      throw new CustomError('Invalid resume data', 400);
    }

    const [resumeEmbedding, sectionalEmbeddings] = await Promise.all([
      generateResumeEmbedding(resumeJson),
      generateSectionalEmbeddings(resumeJson),
    ]);

    const dbRes = await prisma.$transaction(async (tx) => {
      const updatedResume = await tx.resume.update({
        where: {
          id: payload.resumeId,
        },
        data: {
          json: resumeJson as Prisma.InputJsonValue,
        },
      });

      await vectorStorage.storeResumeEmbedding(
        updatedResume.id,
        resumeEmbedding,
        tx,
      );
      await vectorStorage.storeSectionalEmbeddings(
        updatedResume.id,
        sectionalEmbeddings,
        tx,
      );

      return updatedResume;
    });

    const matchScore = await calculateJobMatchScore(dbRes.id, jobId);

    await prisma.appliedJob.create({
      data: {
        status: 'applied',
        applicant_id: studentData.id,
        jobId,
        applied_resume_id: dbRes.id,
        match_score: matchScore,
      },
    });

    return NextResponse.json({
      status: true,
      data: 'successfully applied for the job',
    });
  } catch (err) {
    const [resBody, status] = errorHandler(err);
    return NextResponse.json(resBody, status);
  }
}
