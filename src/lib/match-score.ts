import { prisma } from '@/lib/db';
import { cosineSimilarity } from '@/lib/cosine-similarity';
import { vectorStorage } from '@/lib/vector-storage';

type ApplicantResumeEmbedding = {
  resumeId: string;
  embedding: number[];
};

const toMatchScore = (
  resumeEmbedding: number[] | null,
  jobEmbedding: number[] | null,
) => {
  if (!resumeEmbedding || !jobEmbedding) return null;

  const similarity = cosineSimilarity(resumeEmbedding, jobEmbedding);
  return Number.isNaN(similarity) ? 0 : Number((similarity * 100).toFixed(2));
};

const findLatestEmbeddedResumeId = async (
  applicantId: string,
  excludeResumeId?: string | null,
) => {
  const rows = await prisma.$queryRawUnsafe<Array<{ id: string }>>(
    `
      SELECT r.id
      FROM "Resume" r
      JOIN "ResumeEmbedding" re ON re.resume_id = r.id
      WHERE r.applicant_id = $1
        AND ($2::text IS NULL OR r.id <> $2::text)
      ORDER BY r.updated_at DESC
      LIMIT 1
    `,
    applicantId,
    excludeResumeId ?? null,
  );

  return rows[0]?.id ?? null;
};

export const getApplicantResumeEmbedding = async (
  applicantId: string,
  activeResumeId?: string | null,
): Promise<ApplicantResumeEmbedding | null> => {
  if (activeResumeId) {
    const activeEmbedding =
      await vectorStorage.getResumeEmbedding(activeResumeId);
    if (activeEmbedding) {
      return {
        resumeId: activeResumeId,
        embedding: activeEmbedding,
      };
    }
  }

  const fallbackResumeId = await findLatestEmbeddedResumeId(
    applicantId,
    activeResumeId,
  );

  if (!fallbackResumeId) return null;

  const fallbackEmbedding =
    await vectorStorage.getResumeEmbedding(fallbackResumeId);
  if (!fallbackEmbedding) return null;

  return {
    resumeId: fallbackResumeId,
    embedding: fallbackEmbedding,
  };
};

export const calculateJobMatchScore = async (
  resumeId: string,
  jobId: string,
) => {
  const [resumeEmbedding, jobEmbedding] = await Promise.all([
    vectorStorage.getResumeEmbedding(resumeId),
    vectorStorage.getJobEmbedding(jobId),
  ]);

  return toMatchScore(resumeEmbedding, jobEmbedding);
};

export const calculateJobMatchScoreFromResumeEmbedding = async (
  resumeEmbedding: number[],
  jobId: string,
) => {
  const jobEmbedding = await vectorStorage.getJobEmbedding(jobId);

  return {
    matchScore: toMatchScore(resumeEmbedding, jobEmbedding) ?? 0,
    hasJobEmbedding: Boolean(jobEmbedding),
  };
};
