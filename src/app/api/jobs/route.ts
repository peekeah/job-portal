import { NextRequest, NextResponse } from 'next/server';

import { authMiddleware } from '@/lib/auth-middleware';
import { prisma } from '@/lib/db';
import { errorHandler, CustomError } from '@/lib/errorHandler';
import { jobSchema } from '@/lib/schema';
import { generateJobEmbedding } from '@/lib/embeddings';
import { vectorStorage } from '@/lib/vector-storage';
import { cosineSimilarity } from '@/lib/cosine-similarity';

export async function GET(req: NextRequest) {
  try {
    const token = await authMiddleware(req);

    let jobs;
    if (token.user_type === 'applicant') {
      const applicant = await prisma.applicant.findFirstOrThrow({
        where: { email: token.email },
      });

      jobs = await prisma.job.findMany({
        include: {
          company: true,
          embedding: true,
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

      // Get applicant's active resume embedding for matching
      const activeResume = (await prisma.resume.findFirst({
        where: {
          applicant_id: applicant.id,
          ...(applicant.active_resume_id && { id: applicant.active_resume_id }),
        },
        include: { embedding: true },
      })) as any;

      if (activeResume?.embedding && activeResume.embedding.embedding) {
        // Calculate cosine similarity for each job
        const resumeEmbedding: number[] = JSON.parse(
          activeResume.embedding.embedding
            .replace(/</g, '[')
            .replace(/>/g, ']'),
        );

        jobs = (jobs as any[]).map((job: any) => {
          if (job.embedding && job.embedding.embedding) {
            const jobEmbedding: number[] = JSON.parse(
              job.embedding.embedding.replace(/</g, '[').replace(/>/g, ']'),
            );

            const similarity = cosineSimilarity(resumeEmbedding, jobEmbedding);

            return {
              ...job,
              matchScore: isNaN(similarity) ? 0 : (similarity * 100).toFixed(2),
            };
          }
          return {
            ...job,
            matchScore: 0,
          };
        });

        // Sort jobs by match score (highest first)
        jobs.sort(
          (a: any, b: any) =>
            parseFloat(b.matchScore) - parseFloat(a.matchScore),
        );
      } else {
        // No resume embedding available, add 0 match score
        jobs = jobs.map((job) => ({
          ...job,
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
    const result = await prisma.$transaction(async (tx) => {
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
      } catch (embeddingError) {
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
