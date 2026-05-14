import { NextRequest, NextResponse } from 'next/server';
import { getEmbeddings } from '@/lib/ai';
import {
  buildJdEmbeddingString,
  buildResumeEmbeddingString,
  extractSkillsRuleBased,
  normalizeText,
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

export async function POST(req: NextRequest) {
  try {
    const { type, data } = await req.json();

    let cleanedText: string;
    let signal: string;
    let extracted: JsonObject;

    if (type === 'resume') {
      cleanedText = stripResumeNoise(normalizeText(resumeTextFromData(data)));
      const resumeExtracted = extractSkillsRuleBased(cleanedText);
      extracted = resumeExtracted;
      signal = buildResumeEmbeddingString(resumeExtracted);
    } else if (type === 'job') {
      cleanedText = stripJdNoise(normalizeText(jobTextFromData(data)));
      const ruleBased = extractSkillsRuleBased(cleanedText);
      const requiredSkills = isObject(data)
        ? unique([...asStringArray(data.skills_required), ...ruleBased.skills])
        : ruleBased.skills;
      const jobExtracted = {
        role_title: isObject(data) ? asString(data.job_role) || null : null,
        seniority: ruleBased.seniority,
        required_skills: requiredSkills,
        min_years_experience: ruleBased.years_experience,
      };
      extracted = jobExtracted;
      signal = buildJdEmbeddingString(jobExtracted);
    } else {
      return NextResponse.json(
        { status: false, error: 'Invalid type. Must be "resume" or "job"' },
        { status: 400 },
      );
    }

    if (!signal) {
      return NextResponse.json(
        { status: false, error: 'No normalized signal could be built' },
        { status: 400 },
      );
    }

    const embedding = await getEmbeddings(signal);

    return NextResponse.json({
      status: true,
      data: {
        type,
        cleaned_text: cleanedText,
        extracted,
        signal,
        embedding_length: embedding.length,
        sample_values: embedding.slice(0, 5),
        embedding_preview: `${embedding.slice(0, 3).join(', ')}...[${embedding.length} total]`,
      },
    });
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
