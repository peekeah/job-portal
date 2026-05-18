import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { errorHandler, CustomError } from '@/lib/errorHandler';
import { authMiddleware } from '@/lib/auth-middleware';
import { prisma } from '@/lib/db';
import {
  calculateJobMatchScore,
  getApplicantResumeEmbedding,
} from '@/lib/match-score';

const requestSchema = z.object({
  resumeId: z.string(),
  coverLetter: z.string().min(50, 'Cover letter must be at least 50 characters'),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: jobId } = await params;

    if (!jobId) throw new CustomError('Job id missing', 400);

    const token = await authMiddleware(req, 'applicant');
    const body = await req.json();
    const { resumeId, coverLetter } = requestSchema.parse(body);

    const studentData = await prisma.applicant.findUnique({
      where: {
        email: token.email,
      },
    });

    if (!studentData) {
      throw new CustomError('Student not found', 403);
    }

    if (!studentData?.id) throw new CustomError('Student data missing', 400);

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

    const resume = await prisma.resume.findFirst({
      where: {
        id: resumeId,
        applicant_id: studentData.id,
      },
    });

    if (!resume) {
      throw new CustomError('Resume not found', 404);
    }

    const matchScore = await calculateJobMatchScore(resumeId, jobId);

    await prisma.appliedJob.create({
      data: {
        status: 'applied',
        applicant_id: studentData.id,
        jobId,
        applied_resume_id: resumeId,
        match_score: matchScore,
        cover_letter: coverLetter,
      },
    });

    return NextResponse.json({
      status: true,
      data: 'Successfully applied with cover letter',
    });
  } catch (err) {
    const [res, status] = errorHandler(err);
    return NextResponse.json(res, status);
  }
}
