import { Prisma, ResumeType, CompanySize } from '@prisma/client';
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

const toVectorString = (embedding: number[]) => `[${embedding.join(',')}]`;

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
    const vectorString = toVectorString(embedding);
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
      const vectorString = toVectorString(sectionEmbedding.embedding);
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
    const vectorString = toVectorString(embedding);
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
    const vectorString = toVectorString(jobDescriptionEmbedding);

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
               1 - (embedding <=> ${vectorString}::vector) as similarity
        FROM "ResumeEmbedding"
        WHERE resume_id = ${resumeId}
          AND section != 'full'
          AND section_text IS NOT NULL
          AND btrim(section_text) != ''
        ORDER BY embedding <=> ${vectorString}::vector
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
    const vectorString = toVectorString(queryEmbedding);

    const results = await prisma.$queryRaw<
      Array<{
        id: string;
        title: string;
        type: string;
        url: string | null;
        json: Prisma.JsonValue;
        applicant_id: string;
        created_at: Date;
        updated_at: Date;
        similarity: number;
        // Applicant fields
        a_id: string;
        a_name: string;
        a_email: string;
        a_mobile: string | null;
        a_location: string | null;
        a_profile_pic: string | null;
        a_bio: string | null;
        a_college_name: string | null;
        a_college_branch: string | null;
        a_college_joining_year: string | null;
        a_active_resume_id: string | null;
        a_created_at: Date;
        a_updated_at: Date;
      }>
    >(
      Prisma.sql`
        SELECT r.*,
               a.id as a_id, a.name as a_name, a.email as a_email, a.mobile as a_mobile,
               a.location as a_location, a.profile_pic as a_profile_pic, a.bio as a_bio,
               a.college_name as a_college_name, a.college_branch as a_college_branch,
               a.college_joining_year as a_college_joining_year, a.active_resume_id as a_active_resume_id,
               a.created_at as a_created_at, a.updated_at as a_updated_at,
               1 - (re.embedding <=> ${vectorString}::vector) as similarity
        FROM "Resume" r
        JOIN "ResumeEmbedding" re ON r.id = re.resume_id
        JOIN "Applicant" a ON r.applicant_id = a.id
        WHERE re.section = 'full'
        ORDER BY re.embedding <=> ${vectorString}::vector
        LIMIT ${limit}
      `,
    );

    return results.map((result) => ({
      resume: {
        id: result.id,
        title: result.title,
        type: result.type as ResumeType,
        url: result.url,
        json: result.json,
        applicant_id: result.applicant_id,
        created_at: result.created_at,
        updated_at: result.updated_at,
        applicant: {
          id: result.a_id,
          name: result.a_name,
          email: result.a_email,
          mobile: result.a_mobile,
          location: result.a_location,
          profile_pic: result.a_profile_pic,
          bio: result.a_bio,
          college_name: result.a_college_name,
          college_branch: result.a_college_branch,
          college_joining_year: result.a_college_joining_year,
          active_resume_id: result.a_active_resume_id,
          created_at: result.a_created_at,
          updated_at: result.a_updated_at,
        },
      },
      similarity: result.similarity,
    }));
  }

  async findSimilarJobs(
    queryEmbedding: number[],
    limit: number = 10,
  ): Promise<Array<{ job: JobWithCompany; similarity: number }>> {
    validateEmbedding(queryEmbedding);
    const vectorString = toVectorString(queryEmbedding);

    const results = await prisma.$queryRaw<
      Array<{
        id: string;
        company_id: string;
        job_role: string;
        description: string;
        ctc: number;
        stipend: number;
        location: string;
        skills_required: Prisma.JsonValue;
        created_at: Date;
        updated_at: Date;
        similarity: number;
        // Company fields
        c_id: string;
        c_name: string;
        c_email: string;
        c_founding_year: number;
        c_profile_pic: string | null;
        c_company_type: string;
        c_contact_no: string;
        c_website: string | null;
        c_linkedIn: string | null;
        c_twitter: string | null;
        c_address: string;
        c_size: string | null;
        c_bio: string | null;
        c_created_at: Date;
        c_updated_at: Date;
      }>
    >(
      Prisma.sql`
        SELECT j.*,
               c.id as c_id, c.name as c_name, c.email as c_email, c.founding_year as c_founding_year,
               c.profile_pic as c_profile_pic, c.company_type as c_company_type, c.contact_no as c_contact_no,
               c.website as c_website, c.linkedIn as c_linkedIn, c.twitter as c_twitter,
               c.address as c_address, c.size as c_size, c.bio as c_bio,
               c.created_at as c_created_at, c.updated_at as c_updated_at,
               1 - (je.embedding <=> ${vectorString}::vector) as similarity
        FROM "Job" j
        JOIN "JobEmbedding" je ON j.id = je.job_id
        JOIN "Company" c ON j.company_id = c.id
        ORDER BY je.embedding <=> ${vectorString}::vector
        LIMIT ${limit}
      `,
    );

    return results.map((result) => ({
      job: {
        id: result.id,
        company_id: result.company_id,
        job_role: result.job_role,
        description: result.description,
        ctc: result.ctc,
        stipend: result.stipend,
        location: result.location,
        skills_required: result.skills_required,
        created_at: result.created_at,
        updated_at: result.updated_at,
        company: {
          id: result.c_id,
          name: result.c_name,
          email: result.c_email,
          founding_year: result.c_founding_year,
          profile_pic: result.c_profile_pic,
          company_type: result.c_company_type,
          contact_no: result.c_contact_no,
          website: result.c_website,
          linkedIn: result.c_linkedIn,
          twitter: result.c_twitter,
          address: result.c_address,
          size: result.c_size as CompanySize,
          bio: result.c_bio,
          created_at: result.c_created_at,
          updated_at: result.c_updated_at,
        },
      },
      similarity: result.similarity,
    }));
  }
}

// Export the vector storage instance
export const vectorStorage = new PgVectorStorage();
