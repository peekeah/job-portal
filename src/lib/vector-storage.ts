import { Prisma } from '@prisma/client';
import { prisma } from './db';
import type { SectionalEmbedding, SectionName } from './embeddings';

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
  storeSectionalEmbeddings(
    resumeId: string,
    embeddings: SectionalEmbedding[],
    tx?: VectorClient,
  ): Promise<void>;
  storeJobEmbedding(
    jobId: string,
    embedding: number[],
    tx?: VectorClient,
  ): Promise<void>;
  getResumeEmbedding(resumeId: string): Promise<number[] | null>;
  getJobEmbedding(jobId: string): Promise<number[] | null>;
  retrieveRelevantSections(
    jobDescriptionEmbedding: number[],
    resumeId: string,
    topK?: number,
  ): Promise<
    Array<{ section: SectionName; content: string; similarity: number }>
  >;
  findSimilarResumes(
    queryEmbedding: number[],
    limit?: number,
  ): Promise<Array<{ resume: ResumeWithApplicant; similarity: number }>>;
  findSimilarJobs(
    queryEmbedding: number[],
    limit?: number,
  ): Promise<Array<{ job: JobWithCompany; similarity: number }>>;
}

const validateEmbedding = (embedding: number[]) => {
  if (!Array.isArray(embedding) || embedding.length === 0) {
    throw new Error('Embedding must be a non-empty array of finite numbers');
  }
  if (!embedding.every(Number.isFinite)) {
    throw new Error('Embedding values must all be finite numbers');
  }
};

const parsePgVectorText = (vectorText: string): number[] => {
  const trimmed = vectorText.trim();
  const normalized =
    trimmed.startsWith('<') && trimmed.endsWith('>')
      ? `[${trimmed.slice(1, -1)}]`
      : trimmed;

  const parsed = JSON.parse(normalized);
  if (!Array.isArray(parsed) || !parsed.every(Number.isFinite)) {
    throw new Error('Invalid vector text returned by database');
  }

  return parsed;
};

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
    validateEmbedding(embedding);
    const vectorString = `[${embedding.join(',')}]`;
    const embeddingId = crypto.randomUUID();
    const client = tx || prisma;
    await client.$executeRaw`
      INSERT INTO "ResumeEmbedding" (id, resume_id, section, embedding, created_at, updated_at)
      VALUES (${embeddingId}, ${resumeId}, 'full'::"ResumeSection", ${vectorString}::vector, NOW(), NOW())
      ON CONFLICT (resume_id, section)
      DO UPDATE SET embedding = ${vectorString}::vector, updated_at = NOW()
    `;
  }

  async storeSectionalEmbeddings(
    resumeId: string,
    embeddings: SectionalEmbedding[],
    tx?: VectorClient,
  ): Promise<void> {
    const client = tx || prisma;

    // Delete existing sectional embeddings for this resume (excluding 'full')
    await client.$executeRaw`
      DELETE FROM "ResumeEmbedding"
      WHERE resume_id = ${resumeId} AND section != 'full'
    `;

    // Insert new sectional embeddings with the source text used for retrieval.
    for (const sectionEmbedding of embeddings) {
      if (sectionEmbedding.embedding.length === 0) continue;

      validateEmbedding(sectionEmbedding.embedding);
      const vectorString = `[${sectionEmbedding.embedding.join(',')}]`;
      const embeddingId = crypto.randomUUID();

      await client.$executeRaw`
        INSERT INTO "ResumeEmbedding" (id, resume_id, section, section_text, embedding, created_at, updated_at)
        VALUES (${embeddingId}, ${resumeId}, ${sectionEmbedding.section}::"ResumeSection", ${sectionEmbedding.text}, ${vectorString}::vector, NOW(), NOW())
        ON CONFLICT (resume_id, section)
        DO UPDATE SET
          section_text = ${sectionEmbedding.text},
          embedding = ${vectorString}::vector,
          updated_at = NOW()
      `;
    }
  }

  async storeJobEmbedding(
    jobId: string,
    embedding: number[],
    tx?: VectorClient,
  ): Promise<void> {
    validateEmbedding(embedding);
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
    const result = await prisma.$queryRaw<Array<{ embedding: string }>>(
      Prisma.sql`
        SELECT embedding::text as embedding
        FROM "ResumeEmbedding"
        WHERE resume_id = ${resumeId} AND section = 'full'
      `,
    );

    if (!result[0]) return null;

    const vectorText = result[0].embedding;
    return parsePgVectorText(vectorText);
  }

  async getJobEmbedding(jobId: string): Promise<number[] | null> {
    const result = await prisma.$queryRaw<Array<{ embedding: string }>>(
      Prisma.sql`SELECT embedding::text as embedding FROM "JobEmbedding" WHERE job_id = ${jobId}`,
    );

    if (!result[0]) return null;

    const vectorText = result[0].embedding;
    return parsePgVectorText(vectorText);
  }

  async getJobEmbeddings(jobIds: string[]): Promise<Record<string, number[]>> {
    if (!jobIds.length) return {};

    const rows = await prisma.$queryRaw<
      Array<{ job_id: string; embedding: string }>
    >(
      Prisma.sql`
        SELECT job_id, embedding::text as embedding
        FROM "JobEmbedding"
        WHERE job_id IN (${Prisma.join(jobIds)})
      `,
    );

    return rows.reduce<Record<string, number[]>>((acc, row) => {
      acc[row.job_id] = parsePgVectorText(row.embedding);
      return acc;
    }, {});
  }

  async retrieveRelevantSections(
    jobDescriptionEmbedding: number[],
    resumeId: string,
    topK: number = 3,
  ): Promise<
    Array<{ section: SectionName; content: string; similarity: number }>
  > {
    validateEmbedding(jobDescriptionEmbedding);
    const vectorParams = Prisma.join(jobDescriptionEmbedding);

    const results = await prisma.$queryRaw<
      Array<{
        section: string;
        section_text: string;
        similarity: number;
      }>
    >(
      Prisma.sql`
        SELECT section,
               section_text,
               1 - (embedding <=> ARRAY[${vectorParams}]::vector) as similarity
        FROM "ResumeEmbedding"
        WHERE resume_id = ${resumeId}
          AND section != 'full'
          AND section_text IS NOT NULL
          AND btrim(section_text) != ''
        ORDER BY embedding <=> ARRAY[${vectorParams}]::vector
        LIMIT ${topK}
      `,
    );

    return results.map((result) => ({
      section: result.section as SectionName,
      content: result.section_text,
      similarity: result.similarity,
    }));
  }

  async findSimilarResumes(
    queryEmbedding: number[],
    limit: number = 10,
  ): Promise<Array<{ resume: ResumeWithApplicant; similarity: number }>> {
    validateEmbedding(queryEmbedding);
    const vectorParams = Prisma.join(queryEmbedding);

    const results = await prisma.$queryRaw<
      Array<{
        id: string;
        title: string;
        applicant_id: string;
        similarity: number;
      }>
    >(
      Prisma.sql`
        SELECT r.id, r.title, r.applicant_id,
               1 - (re.embedding <=> ARRAY[${vectorParams}]::vector) as similarity
        FROM "Resume" r
        JOIN "ResumeEmbedding" re ON r.id = re.resume_id
        WHERE re.section = 'full'
        ORDER BY re.embedding <=> ARRAY[${vectorParams}]::vector
        LIMIT ${limit}
      `,
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
    validateEmbedding(queryEmbedding);
    const vectorParams = Prisma.join(queryEmbedding);

    const results = await prisma.$queryRaw<
      Array<{
        id: string;
        job_role: string;
        company_id: string;
        similarity: number;
      }>
    >(
      Prisma.sql`
        SELECT j.id, j.job_role, j.company_id,
               1 - (je.embedding <=> ARRAY[${vectorParams}]::vector) as similarity
        FROM "Job" j
        JOIN "JobEmbedding" je ON j.id = je.job_id
        ORDER BY je.embedding <=> ARRAY[${vectorParams}]::vector
        LIMIT ${limit}
      `,
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
