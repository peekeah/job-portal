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

/**
 * Find the most similar jobs to a resume embedding using pgvector
 */
export async function findSimilarJobs(
  resumeEmbedding: number[],
  maxResults: number = 10,
  minSimilarity: number = 0.5,
): Promise<Array<{ job: JobWithCompany; similarity: number }>> {
  // Use the pgvector storage implementation for efficient similarity search
  const { vectorStorage } = await import('./vector-storage');

  const similarJobs = await vectorStorage.findSimilarJobs(
    resumeEmbedding,
    maxResults,
  );

  // Filter by minimum similarity threshold
  return similarJobs.filter((item) => item.similarity >= minSimilarity);
}

/**
 * Find the most similar resumes to a job embedding using pgvector
 */
export async function findSimilarResumes(
  jobEmbedding: number[],
  maxResults: number = 10,
  minSimilarity: number = 0.5,
): Promise<Array<{ resume: ResumeWithApplicant; similarity: number }>> {
  // Use the pgvector storage implementation for efficient similarity search
  const { vectorStorage } = await import('./vector-storage');

  const similarResumes = await vectorStorage.findSimilarResumes(
    jobEmbedding,
    maxResults,
  );

  // Filter by minimum similarity threshold
  return similarResumes.filter((item) => item.similarity >= minSimilarity);
}
