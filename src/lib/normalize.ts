type ExtractedResumeData = {
  seniority?: string | string[] | null;
  job_titles?: string[] | null;
  skills?: string[] | null;
  years_experience?: number | null;
  certifications?: string[] | null;
};

type ExtractedJobData = {
  role_title?: string | null;
  seniority?: string | string[] | null;
  required_skills?: string[] | null;
  preferred_skills?: string[] | null;
  min_years_experience?: number | null;
};

type RuleBasedSkills = {
  skills: string[];
  years_experience: number | null;
  seniority: string[];
};

type MatchScoreResult = {
  score: number;
  raw_cosine: number;
  resume_signal: string;
  jd_signal: string;
  resume_skills: string[];
  jd_required: string[];
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const NOISE_PHRASES = [
  'equal opportunity employer',
  'we offer competitive',
  'benefits include',
  'about our company',
  'we are an equal',
  '401k',
  'dental and vision',
  'unlimited pto',
  'we celebrate diversity',
];

const SKILL_DICT = {
  languages: [
    'python',
    'javascript',
    'typescript',
    'java',
    'go',
    'rust',
    'c++',
    'c#',
    'sql',
    'r',
  ],
  frameworks: [
    'react',
    'fastapi',
    'django',
    'flask',
    'nextjs',
    'spring',
    'express',
    'rails',
  ],
  cloud: ['aws', 'gcp', 'azure', 'docker', 'kubernetes', 'terraform'],
  data: ['postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch', 'kafka'],
  ml: ['pytorch', 'tensorflow', 'scikit-learn', 'huggingface', 'langchain'],
  tools: ['git', 'ci/cd', 'jenkins', 'github actions', 'jira', 'figma'],
} as const;

// Stored as strings so a fresh RegExp is compiled each call — avoids /g lastIndex statefulness
const EXPERIENCE_PATTERN_STRINGS = [
  String.raw`(\d+)\+?\s*years?\s+(?:of\s+)?experience`,
  String.raw`(\d+)\+?\s*yrs?\s+(?:of\s+)?experience`,
];

const SENIORITY_KEYWORDS = [
  'senior',
  'lead',
  'staff',
  'principal',
  'junior',
  'mid-level',
  'entry',
];

// Skills whose names end with a special char — word boundary \b breaks for these
const SPECIAL_CHAR_SKILL_SUFFIX = /[+#]$/;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const formatStringList = (value: string | string[]): string =>
  Array.isArray(value) ? value.join(', ') : value;

/**
 * Build a skill-matching pattern that correctly handles:
 *   - Normal skills  → \bskill\b
 *   - c++, c#        → no leading boundary needed; just assert no trailing alnum
 */
const buildSkillPattern = (skill: string): RegExp => {
  const escaped = escapeRegExp(skill);
  return SPECIAL_CHAR_SKILL_SUFFIX.test(skill)
    ? new RegExp(`${escaped}(?![a-z0-9])`)
    : new RegExp(`\\b${escaped}\\b`);
};

// ---------------------------------------------------------------------------
// Normalization
// ---------------------------------------------------------------------------

export const normalizeText = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/[^a-z0-9\s+#.]/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();

export const stripResumeNoise = (text: string): string =>
  text
    .replace(/\S+@\S+\.\S+/g, '') // emails
    .replace(/(\+?\d[\d\s\-()\s]{8,})/g, '') // phone numbers
    .replace(/https?:\/\/\S+/g, '') // URLs
    .replace(
      /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+\d{4}/gi,
      '',
    ); // dates

/**
 * Strip JD boilerplate. Lowercases before matching so "Equal Opportunity Employer"
 * and "equal opportunity employer" are both caught.
 */
export const stripJdNoise = (text: string): string => {
  const lowerText = text.toLowerCase();
  return NOISE_PHRASES.reduce(
    (cleaned, phrase) => cleaned.replaceAll(phrase, ''),
    lowerText,
  );
};

// ---------------------------------------------------------------------------
// Rule-based skill extraction
// ---------------------------------------------------------------------------

export const extractSkillsRuleBased = (text: string): RuleBasedSkills => {
  const normalizedText = normalizeText(text);
  const foundSkills = new Set<string>();

  Object.values(SKILL_DICT).forEach((skills) => {
    skills.forEach((skill) => {
      if (buildSkillPattern(skill).test(normalizedText)) {
        foundSkills.add(skill);
      }
    });
  });

  // Compile fresh RegExp each call to avoid /g lastIndex statefulness
  const years = EXPERIENCE_PATTERN_STRINGS.flatMap((patternStr) =>
    [...normalizedText.matchAll(new RegExp(patternStr, 'g'))].map((m) =>
      Number(m[1]),
    ),
  );

  const seniority = SENIORITY_KEYWORDS.filter((kw) =>
    normalizedText.includes(kw),
  );

  return {
    skills: [...foundSkills],
    years_experience: years.length > 0 ? Math.max(...years) : null,
    seniority,
  };
};

export const extractJdRuleBased = (text: string): ExtractedJobData => {
  const extracted = extractSkillsRuleBased(text);

  return {
    seniority: extracted.seniority,
    required_skills: extracted.skills,
    min_years_experience: extracted.years_experience,
  };
};

// ---------------------------------------------------------------------------
// Embedding string builders
// ---------------------------------------------------------------------------

export const buildResumeEmbeddingString = (
  extracted: ExtractedResumeData,
): string => {
  const parts: string[] = [];

  if (extracted.seniority) {
    parts.push(`${formatStringList(extracted.seniority)} level engineer`);
  }

  if (extracted.job_titles?.length) {
    parts.push(`Roles: ${extracted.job_titles.join(', ')}`);
  }

  if (extracted.skills?.length) {
    parts.push(`Skills: ${extracted.skills.join(', ')}`);
  }

  if (
    extracted.years_experience !== null &&
    extracted.years_experience !== undefined
  ) {
    parts.push(`${extracted.years_experience} years of experience`);
  }

  if (extracted.certifications?.length) {
    parts.push(`Certifications: ${extracted.certifications.join(', ')}`);
  }

  return parts.join('. ');
};

export const buildJdEmbeddingString = (extracted: ExtractedJobData): string => {
  const parts: string[] = [];

  if (extracted.role_title) {
    parts.push(`Role: ${extracted.role_title}`);
  }

  if (extracted.seniority) {
    parts.push(`Seniority: ${formatStringList(extracted.seniority)}`);
  }

  if (extracted.required_skills?.length) {
    parts.push(`Required: ${extracted.required_skills.join(', ')}`);
  }

  if (extracted.preferred_skills?.length) {
    parts.push(`Preferred: ${extracted.preferred_skills.join(', ')}`);
  }

  if (
    extracted.min_years_experience !== null &&
    extracted.min_years_experience !== undefined
  ) {
    parts.push(`Minimum ${extracted.min_years_experience} years experience`);
  }

  return parts.join('. ');
};

// ---------------------------------------------------------------------------
// Cosine similarity
// ---------------------------------------------------------------------------

export const cosineSimilarity = (a: number[], b: number[]): number => {
  if (a.length !== b.length) throw new Error('Vectors must be the same length');

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  if (denom === 0) return 0;

  return dot / denom;
};

// ---------------------------------------------------------------------------
// Score calibration
// Raw cosine between extracted skill strings clusters in ~0.50–0.92.
// Map that range onto 0–100 so the number is human-readable.
// Replace MIN/MAX_OBSERVED once you have labeled data to fit against.
// ---------------------------------------------------------------------------

const MIN_OBSERVED = 0.5; // worst real match cosine you've seen
const MAX_OBSERVED = 0.92; // best real match cosine you've seen

export const calibrateScore = (rawCosine: number): number => {
  const calibrated =
    ((rawCosine - MIN_OBSERVED) / (MAX_OBSERVED - MIN_OBSERVED)) * 100;
  return Math.round(Math.max(0, Math.min(100, calibrated)) * 10) / 10; // 1 dp, clamped
};

// ---------------------------------------------------------------------------
// Top-level scorer  (wire in your own embed() function)
// ---------------------------------------------------------------------------

/**
 * Compute a 0–100 job match score between a resume and a job description.
 *
 * @param resumeText   Raw resume text (already parsed from PDF/DOCX)
 * @param jdText       Raw job description text
 * @param embed        Async function that returns an embedding vector for a string.
 *                     Plug in OpenAI, Cohere, your own model, etc.
 * @param extractResume  Optional — swap in LLM-based extraction for higher quality.
 *                       Defaults to rule-based (zero cost).
 * @param extractJd      Optional — same as above for the JD side.
 */
export const scoreMatch = async (
  resumeText: string,
  jdText: string,
  embed: (text: string) => Promise<number[]>,
  extractResume: (text: string) => ExtractedResumeData = extractSkillsRuleBased,
  extractJd: (text: string) => ExtractedJobData = extractJdRuleBased,
): Promise<MatchScoreResult> => {
  // 1. Normalize + strip noise
  const resumeClean = stripResumeNoise(normalizeText(resumeText));
  const jdClean = stripJdNoise(normalizeText(jdText));

  // 2. Extract structured signal
  const resumeExtracted = extractResume(resumeClean);
  const jdExtracted = extractJd(jdClean);

  // 3. Serialize to embedding strings
  const resumeStr = buildResumeEmbeddingString(resumeExtracted);
  const jdStr = buildJdEmbeddingString(jdExtracted);

  // 4. Embed (in parallel — saves latency when both are cache misses)
  const [resumeVec, jdVec] = await Promise.all([
    embed(resumeStr),
    embed(jdStr),
  ]);

  // 5. Score
  const rawCosine = cosineSimilarity(resumeVec, jdVec);

  return {
    score: calibrateScore(rawCosine),
    raw_cosine: Math.round(rawCosine * 10_000) / 10_000,
    resume_signal: resumeStr,
    jd_signal: jdStr,
    resume_skills: (resumeExtracted as RuleBasedSkills).skills ?? [],
    jd_required: (jdExtracted as ExtractedJobData).required_skills ?? [],
  };
};
