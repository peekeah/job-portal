import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { cosineSimilarity } from '@/lib/cosine-similarity';
import { calibrateScore } from '@/lib/normalize';
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
  if (Number.isNaN(similarity)) return 0;
  return Number(calibrateScore(similarity).toFixed(1));
};

export const calculateMatchScoreFromEmbeddings = (
  resumeEmbedding: number[] | null,
  jobEmbedding: number[] | null,
) => ({
  matchScore: toMatchScore(resumeEmbedding, jobEmbedding) ?? 0,
  hasJobEmbedding: Boolean(jobEmbedding),
});

const findLatestEmbeddedResumeId = async (
  applicantId: string,
  excludeResumeId?: string | null,
) => {
  const rows = await prisma.$queryRaw<Array<{ id: string }>>(
    Prisma.sql`
      SELECT r.id
      FROM "Resume" r
      JOIN "ResumeEmbedding" re ON re.resume_id = r.id
      WHERE r.applicant_id = ${applicantId}
        AND re.section = 'full'
        AND (
          ${excludeResumeId ?? null}::text IS NULL
          OR r.id <> ${excludeResumeId ?? null}::text
        )
      ORDER BY r.updated_at DESC
      LIMIT 1
    `,
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

  return calculateMatchScoreFromEmbeddings(resumeEmbedding, jobEmbedding)
    .matchScore;
};
