import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';

import { authMiddleware } from '@/lib/auth-middleware';
import { prisma } from '@/lib/db';
import { errorHandler, CustomError } from '@/lib/errorHandler';
import { jobSchema } from '@/lib/schema';
import { generateJobEmbedding } from '@/lib/embeddings';
import { vectorStorage } from '@/lib/vector-storage';
import {
  calculateJobMatchScoreFromResumeEmbedding,
  getApplicantResumeEmbedding,
} from '@/lib/match-score';

type JobWithCompany = Prisma.JobGetPayload<{
  include: { company: true };
}>;

type JobWithMatchScore = JobWithCompany & {
  embedding: null;
  matchScore: number;
  hasJobEmbedding?: boolean;
  hasResumeEmbedding?: boolean;
  matchedResumeId?: string | null;
};

export async function GET(req: NextRequest) {
  try {
    const token = await authMiddleware(req);

    let jobs: JobWithCompany[] | JobWithMatchScore[];
    if (token.user_type === 'applicant') {
      const applicant = await prisma.applicant.findFirstOrThrow({
        where: { email: token.email },
      });

      const availableJobs = await prisma.job.findMany({
        include: {
          company: true,
        },
        where: {
          NOT: {
            applied_jobs: {
              some: {
                applicant_id: applicant.id,
              },
            },
          },
        },
      });

      const resumeMatchSource = await getApplicantResumeEmbedding(
        applicant.id,
        applicant.active_resume_id,
      );

      if (resumeMatchSource) {
        // Calculate cosine similarity for each job
        const jobsWithScores: JobWithMatchScore[] = [];

        for (const job of availableJobs) {
          const { matchScore, hasJobEmbedding } =
            await calculateJobMatchScoreFromResumeEmbedding(
              resumeMatchSource.embedding,
              job.id,
            );

          jobsWithScores.push({
            ...job,
            embedding: null,
            matchScore,
            hasJobEmbedding,
            hasResumeEmbedding: true,
            matchedResumeId: resumeMatchSource.resumeId,
          });
        }

        // Sort jobs by match score (highest first)
        jobsWithScores.sort((a, b) => b.matchScore - a.matchScore);
        jobs = jobsWithScores;
      } else {
        // No resume embedding available, add 0 match score
        jobs = availableJobs.map((job) => ({
          ...job,
          embedding: null,
          hasResumeEmbedding: false,
          matchScore: 0,
        }));
      }
    } else {
      jobs = await prisma.job.findMany({
        include: {
          company: true,
        },
      });
    }

    return NextResponse.json({ status: true, data: jobs });
  } catch (err) {
    const [resp, status] = errorHandler(err);
    return NextResponse.json(resp, status);
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = await authMiddleware(req, 'company');
    const rawPayload = await req.json();
    const payload = jobSchema.parse(rawPayload);

    const companyData = await prisma.company.findFirst({
      where: { email: token.email },
    });

    if (!companyData) throw new CustomError('Company not found', 403);

    // Use transaction to ensure atomicity: create job -> embed -> commit
    await prisma.$transaction(async (tx) => {
      // Create job record
      const newJob = await tx.job.create({
        data: {
          ...payload,
          company_id: companyData.id,
        },
      });

      // Generate embeddings from job content
      let embedding;
      try {
        embedding = await generateJobEmbedding(payload);
      } catch (_err) {
        throw new CustomError('Failed to generate job embeddings', 500);
      }

      // Store embeddings using vector storage abstraction
      await vectorStorage.storeJobEmbedding(newJob.id, embedding, tx);

      return newJob;
    });

    return NextResponse.json(
      { status: true, data: 'successfully posted job' },
      { status: 201 },
    );
  } catch (err) {
    const [resp, status] = errorHandler(err);
    return NextResponse.json(resp, status);
  }
}
