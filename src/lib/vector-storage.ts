import type { Prisma } from '@prisma/client';
import { prisma } from './db';

type ResumeWithApplicant = Prisma.ResumeGetPayload<{
  include: { applicant: true };
}>;

type JobWithCompany = Prisma.JobGetPayload<{
  include: { company: true };
}>;

type VectorClient = typeof prisma | Prisma.TransactionClient;

/**
 * Vector storage abstraction layer
 * Currently uses JSON storage but designed to easily migrate to pgvector
 */

export interface VectorStorage {
  storeResumeEmbedding(
    resumeId: string,
    embedding: number[],
    tx?: VectorClient,
  ): Promise<void>;
  storeJobEmbedding(
    jobId: string,
    embedding: number[],
    tx?: VectorClient,
  ): Promise<void>;
  getResumeEmbedding(resumeId: string): Promise<number[] | null>;
  getJobEmbedding(jobId: string): Promise<number[] | null>;
  findSimilarResumes(
    queryEmbedding: number[],
    limit?: number,
  ): Promise<Array<{ resume: ResumeWithApplicant; similarity: number }>>;
  findSimilarJobs(
    queryEmbedding: number[],
    limit?: number,
  ): Promise<Array<{ job: JobWithCompany; similarity: number }>>;
}

/**
 * Pgvector-based storage implementation
 * Uses raw SQL for vector operations as per Prisma pgvector documentation
 */
class PgVectorStorage implements VectorStorage {
  async storeResumeEmbedding(
    resumeId: string,
    embedding: number[],
    tx?: VectorClient,
  ): Promise<void> {
    const vectorString = `[${embedding.join(',')}]`;
    const embeddingId = crypto.randomUUID();
    const client = tx || prisma;
    await client.$executeRaw`
      INSERT INTO "ResumeEmbedding" (id, resume_id, embedding, created_at, updated_at) 
      VALUES (${embeddingId}, ${resumeId}, ${vectorString}::vector, NOW(), NOW())
      ON CONFLICT (resume_id) 
      DO UPDATE SET embedding = ${vectorString}::vector, updated_at = NOW()
    `;
  }

  async storeJobEmbedding(
    jobId: string,
    embedding: number[],
    tx?: VectorClient,
  ): Promise<void> {
    const vectorString = `[${embedding.join(',')}]`;
    const embeddingId = crypto.randomUUID();
    const client = tx || prisma;
    await client.$executeRaw`
      INSERT INTO "JobEmbedding" (id, job_id, embedding, created_at, updated_at) 
      VALUES (${embeddingId}, ${jobId}, ${vectorString}::vector, NOW(), NOW())
      ON CONFLICT (job_id) 
      DO UPDATE SET embedding = ${vectorString}::vector, updated_at = NOW()
    `;
  }

  async getResumeEmbedding(resumeId: string): Promise<number[] | null> {
    const result = await prisma.$queryRawUnsafe<Array<{ embedding: string }>>(
      'SELECT embedding::text FROM "ResumeEmbedding" WHERE resume_id = $1',
      resumeId,
    );

    if (!result[0]) return null;

    // Parse vector string back to array
    const vectorText = result[0].embedding;
    return JSON.parse(vectorText.replace(/</g, '[').replace(/>/g, ']'));
  }

  async getJobEmbedding(jobId: string): Promise<number[] | null> {
    const result = await prisma.$queryRawUnsafe<Array<{ embedding: string }>>(
      'SELECT embedding::text FROM "JobEmbedding" WHERE job_id = $1',
      jobId,
    );

    if (!result[0]) return null;

    // Parse vector string back to array
    const vectorText = result[0].embedding;
    return JSON.parse(vectorText.replace(/</g, '[').replace(/>/g, ']'));
  }

  async findSimilarResumes(
    queryEmbedding: number[],
    limit: number = 10,
  ): Promise<Array<{ resume: ResumeWithApplicant; similarity: number }>> {
    const vectorArray = queryEmbedding;

    const results = await prisma.$queryRawUnsafe<
      Array<{
        id: string;
        title: string;
        applicant_id: string;
        similarity: number;
      }>
    >(
      `SELECT r.id, r.title, r.applicant_id, 1 - (re.embedding <=> ARRAY[${vectorArray.join(', ')}]::vector) as similarity
       FROM "Resume" r
       JOIN "ResumeEmbedding" re ON r.id = re.resume_id
       ORDER BY re.embedding <=> ARRAY[${vectorArray.join(', ')}]::vector
       LIMIT $1`,
      limit,
    );

    // Fetch full resume data
    const resumeIds = results.map((r) => r.id);
    const resumes = await prisma.resume.findMany({
      where: { id: { in: resumeIds } },
      include: { applicant: true },
    });

    return results.map((result) => {
      const resume = resumes.find((r) => r.id === result.id);
      if (!resume) {
        throw new Error(`Resume ${result.id} not found for similarity result`);
      }

      return {
        resume,
        similarity: result.similarity,
      };
    });
  }

  async findSimilarJobs(
    queryEmbedding: number[],
    limit: number = 10,
  ): Promise<Array<{ job: JobWithCompany; similarity: number }>> {
    const vectorArray = queryEmbedding;

    const results = await prisma.$queryRawUnsafe<
      Array<{
        id: string;
        job_role: string;
        company_id: string;
        similarity: number;
      }>
    >(
      `SELECT j.id, j.job_role, j.company_id, 1 - (je.embedding <=> ARRAY[${vectorArray.join(', ')}]::vector) as similarity
       FROM "Job" j
       JOIN "JobEmbedding" je ON j.id = je.job_id
       ORDER BY je.embedding <=> ARRAY[${vectorArray.join(', ')}]::vector
       LIMIT $1`,
      limit,
    );

    // Fetch full job data
    const jobIds = results.map((j) => j.id);
    const jobs = await prisma.job.findMany({
      where: { id: { in: jobIds } },
      include: { company: true },
    });

    return results.map((result) => {
      const job = jobs.find((j) => j.id === result.id);
      if (!job) {
        throw new Error(`Job ${result.id} not found for similarity result`);
      }

      return {
        job,
        similarity: result.similarity,
      };
    });
  }
}

// Export the vector storage instance
export const vectorStorage = new PgVectorStorage();
