import { NextRequest, NextResponse } from 'next/server';
import { vectorStorage } from '@/lib/vector-storage';
import { getEmbeddings } from '@/lib/ai';
import {
  buildJdEmbeddingString,
  buildResumeEmbeddingString,
  extractSkillsRuleBased,
  normalizeText,
  scoreMatch,
  stripJdNoise,
  stripResumeNoise,
} from '@/lib/normalize';

type JsonObject = Record<string, unknown>;

const isObject = (value: unknown): value is JsonObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const asString = (value: unknown): string =>
  typeof value === 'string' ? value : '';

const asStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string');
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const unique = (values: string[]): string[] => [...new Set(values)];

const resumeTextFromData = (data: unknown): string => {
  if (typeof data === 'string') return data;
  if (!isObject(data)) return '';

  const personalInfo = isObject(data.personalInfo) ? data.personalInfo : {};
  const skills = asStringArray(data.skills).join(', ');
  const summary = asString(data.summary) || asString(data.objective);
  const experience = Array.isArray(data.workExperience)
    ? data.workExperience
        .filter(isObject)
        .map((item) =>
          [
            asString(item.jobTitle),
            asString(item.company),
            asString(item.duration),
            asString(item.description),
          ]
            .filter(Boolean)
            .join(' '),
        )
        .join(' ')
    : '';

  return [
    asString(personalInfo.name),
    asString(personalInfo.email),
    summary,
    experience,
    skills,
  ]
    .filter(Boolean)
    .join(' ');
};

const jobTextFromData = (data: unknown): string => {
  if (typeof data === 'string') return data;
  if (!isObject(data)) return '';

  return [
    asString(data.job_role),
    asString(data.location),
    asString(data.description),
    asStringArray(data.skills_required).join(', '),
  ]
    .filter(Boolean)
    .join(' ');
};

const buildResumeSignal = (data: unknown) => {
  const cleanedText = stripResumeNoise(normalizeText(resumeTextFromData(data)));
  const extracted = extractSkillsRuleBased(cleanedText);

  return {
    cleanedText,
    extracted,
    signal: buildResumeEmbeddingString(extracted),
  };
};

const buildJobSignal = (data: unknown) => {
  const cleanedText = stripJdNoise(normalizeText(jobTextFromData(data)));
  const ruleBased = extractSkillsRuleBased(cleanedText);
  const requiredSkills = isObject(data)
    ? unique([...asStringArray(data.skills_required), ...ruleBased.skills])
    : ruleBased.skills;
  const extracted = {
    role_title: isObject(data) ? asString(data.job_role) || null : null,
    seniority: ruleBased.seniority,
    required_skills: requiredSkills,
    min_years_experience: ruleBased.years_experience,
  };

  return {
    cleanedText,
    extracted,
    signal: buildJdEmbeddingString(extracted),
  };
};

export async function POST(req: NextRequest) {
  try {
    const { action, data } = await req.json();

    switch (action) {
      case 'test-resume-similarity': {
        const normalized = buildResumeSignal(data.resume);
        if (!normalized.signal)
          throw new Error('No resume signal could be built');

        const embedding = await getEmbeddings(normalized.signal);

        // Find similar resumes
        const similarResumes = await vectorStorage.findSimilarResumes(
          embedding,
          5,
        );

        return NextResponse.json({
          status: true,
          data: {
            query_resume:
              isObject(data.resume) && isObject(data.resume.personalInfo)
                ? asString(data.resume.personalInfo.name) || 'Unknown'
                : 'Unknown',
            cleaned_text: normalized.cleanedText,
            extracted: normalized.extracted,
            signal: normalized.signal,
            embedding_length: embedding.length,
            similar_resumes: similarResumes.map((item) => ({
              resume_id: item.resume.id,
              applicant_name: item.resume.applicant?.name || 'Unknown',
              similarity: item.similarity,
            })),
          },
        });
      }

      case 'test-job-similarity': {
        const normalized = buildJobSignal(data.job);
        if (!normalized.signal) throw new Error('No job signal could be built');

        const embedding = await getEmbeddings(normalized.signal);

        // Find similar jobs
        const similarJobs = await vectorStorage.findSimilarJobs(embedding, 5);

        return NextResponse.json({
          status: true,
          data: {
            query_job: isObject(data.job) ? asString(data.job.job_role) : '',
            cleaned_text: normalized.cleanedText,
            extracted: normalized.extracted,
            signal: normalized.signal,
            embedding_length: embedding.length,
            similar_jobs: similarJobs.map((item) => ({
              job_id: item.job.id,
              job_role: item.job.job_role,
              company: item.job.company?.name || 'Unknown',
              similarity: item.similarity,
            })),
          },
        });
      }

      case 'test-match-score': {
        const resumeText = resumeTextFromData(data.resume);
        const jobText = jobTextFromData(data.job);
        const match = await scoreMatch(resumeText, jobText, getEmbeddings);

        return NextResponse.json({
          status: true,
          data: match,
        });
      }

      case 'test-storage': {
        const { type, id, embedding } = data;

        if (
          typeof id !== 'string' ||
          !Array.isArray(embedding) ||
          !embedding.every((item) => typeof item === 'number')
        ) {
          throw new Error(
            'Storage test requires string id and numeric embedding[]',
          );
        }

        if (type === 'resume') {
          await vectorStorage.storeResumeEmbedding(id, embedding);
          const retrieved = await vectorStorage.getResumeEmbedding(id);

          return NextResponse.json({
            status: true,
            data: {
              stored: true,
              retrieved_length: retrieved?.length || 0,
              matches_original: retrieved?.length === embedding.length,
            },
          });
        } else if (type === 'job') {
          await vectorStorage.storeJobEmbedding(id, embedding);
          const retrieved = await vectorStorage.getJobEmbedding(id);

          return NextResponse.json({
            status: true,
            data: {
              stored: true,
              retrieved_length: retrieved?.length || 0,
              matches_original: retrieved?.length === embedding.length,
            },
          });
        }

        throw new Error('Invalid type. Must be "resume" or "job"');
      }

      default:
        throw new Error(
          'Invalid action. Must be "test-resume-similarity", "test-job-similarity", "test-match-score", or "test-storage"',
        );
    }
  } catch (err) {
    return NextResponse.json(
      {
        status: false,
        error: err instanceof Error ? err.message : 'Unknown error occurred',
      },
      { status: 500 },
    );
  }
}
