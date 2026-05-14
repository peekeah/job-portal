import type { Prisma } from '@prisma/client';

type JobWithCompany = Prisma.JobGetPayload<{
  include: { company: true };
}>;

type ResumeWithApplicant = Prisma.ResumeGetPayload<{
  include: { applicant: true };
}>;

/**
 * Calculate cosine similarity between two vectors (fallback for non-pgvector operations)
 */
export function cosineSimilarity(vectorA: number[], vectorB: number[]): number {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vectorA.length; i++) {
    dotProduct += vectorA[i] * vectorB[i];
    normA += vectorA[i] * vectorA[i];
    normB += vectorB[i] * vectorB[i];
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
