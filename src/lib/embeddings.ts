import { getEmbeddings } from './ai';

type JsonRecord = Record<string, unknown>;

export type SectionName =
  | 'experience'
  | 'skills'
  | 'projects'
  | 'education'
  | 'summary';

export type SectionalEmbedding = {
  section: SectionName;
  text: string;
  embedding: number[];
};

const isRecord = (value: unknown): value is JsonRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const asString = (value: unknown): string =>
  typeof value === 'string' ? value : '';

const asNumber = (value: unknown): number | undefined =>
  typeof value === 'number' ? value : undefined;

const asRecordArray = (value: unknown): JsonRecord[] =>
  Array.isArray(value) ? value.filter(isRecord) : [];

const appendStringList = (sections: string[], values: unknown) => {
  if (typeof values === 'string') {
    sections.push(values);
    return;
  }

  if (Array.isArray(values)) {
    values.forEach((value) => {
      if (typeof value === 'string') sections.push(`- ${value}`);
    });
  }
};

/**
 * Extracts individual sections from resume JSON for sectional embedding
 */
export const extractResumeSections = (
  resumeJson: unknown,
): Record<SectionName, string> => {
  if (!isRecord(resumeJson)) {
    return {
      experience: '',
      skills: '',
      projects: '',
      education: '',
      summary: '',
    };
  }

  const sections: Record<SectionName, string> = {
    experience: '',
    skills: '',
    projects: '',
    education: '',
    summary: '',
  };

  // Extract summary
  const personalInfo = isRecord(resumeJson.personalInfo)
    ? resumeJson.personalInfo
    : isRecord(resumeJson.profile)
      ? resumeJson.profile
      : null;

  if (personalInfo) {
    const summary =
      asString(personalInfo.summary) ||
      asString(resumeJson.summary) ||
      asString(resumeJson.objective);
    sections.summary = summary;
  }

  // Extract experience
  const workExperience = [
    ...asRecordArray(resumeJson.workExperience),
    ...asRecordArray(resumeJson.workExperiences),
  ];

  if (workExperience.length) {
    const expSections: string[] = [];
    workExperience.forEach((exp, index) => {
      expSections.push(
        `${index + 1}. ${asString(exp.jobTitle)} at ${asString(exp.company)}`,
      );

      const duration = asString(exp.duration) || asString(exp.date);
      if (duration) expSections.push(`Duration: ${duration}`);

      const description = asString(exp.description);
      if (description) expSections.push(`Description: ${description}`);

      appendStringList(expSections, exp.responsibilities);
      appendStringList(expSections, exp.descriptions);
    });
    sections.experience = expSections.join('\n');
  }

  // Extract education
  const education = [
    ...asRecordArray(resumeJson.education),
    ...asRecordArray(resumeJson.educations),
  ];

  if (education.length) {
    const eduSections: string[] = [];
    education.forEach((edu, index) => {
      const institution = asString(edu.institution) || asString(edu.school);
      eduSections.push(
        `${index + 1}. ${asString(edu.degree)} from ${institution}`,
      );

      const graduationYear =
        asNumber(edu.graduationYear)?.toString() || asString(edu.date);
      if (graduationYear)
        eduSections.push(`Graduation Year: ${graduationYear}`);
      if (edu.gpa) eduSections.push(`GPA: ${asString(edu.gpa)}`);
      appendStringList(eduSections, edu.descriptions);
    });
    sections.education = eduSections.join('\n');
  }

  // Extract skills
  const skillSections: string[] = [];
  if (resumeJson.skills) {
    if (typeof resumeJson.skills === 'string') {
      skillSections.push(resumeJson.skills);
    } else if (Array.isArray(resumeJson.skills)) {
      appendStringList(skillSections, resumeJson.skills);
    } else if (isRecord(resumeJson.skills)) {
      appendStringList(skillSections, resumeJson.skills.descriptions);

      asRecordArray(resumeJson.skills.featuredSkills).forEach((skill) => {
        const skillName = asString(skill.skill);
        if (skillName) skillSections.push(`- ${skillName}`);
      });
    }
  }

  appendStringList(skillSections, resumeJson.technical);
  appendStringList(skillSections, resumeJson.soft);
  sections.skills = skillSections.join('\n');

  // Extract projects
  const projects = asRecordArray(resumeJson.projects);
  if (projects.length) {
    const projectSections: string[] = [];
    projects.forEach((project, index) => {
      const projectName = asString(project.name) || asString(project.project);
      projectSections.push(`${index + 1}. ${projectName}`);

      if (project.description) {
        projectSections.push(`Description: ${asString(project.description)}`);
      }

      if (project.technologies) {
        projectSections.push(`Technologies: ${asString(project.technologies)}`);
      }

      appendStringList(projectSections, project.descriptions);
    });
    sections.projects = projectSections.join('\n');
  }

  return sections;
};

/**
 * Prepares resume content for embedding generation from parsed resume JSON
 */
export const prepareResumeContent = (resumeJson: unknown): string => {
  if (!isRecord(resumeJson)) return '';

  const sections: string[] = [];

  // Extract personal information from both parser and builder shapes.
  const personalInfo = isRecord(resumeJson.personalInfo)
    ? resumeJson.personalInfo
    : isRecord(resumeJson.profile)
      ? resumeJson.profile
      : null;

  if (personalInfo) {
    sections.push(`Name: ${asString(personalInfo.name)}`);
    sections.push(`Email: ${asString(personalInfo.email)}`);
    sections.push(`Phone: ${asString(personalInfo.phone)}`);
    sections.push(`Location: ${asString(personalInfo.location)}`);

    const summary =
      asString(personalInfo.summary) ||
      asString(resumeJson.summary) ||
      asString(resumeJson.objective);
    if (summary) {
      sections.push('Summary:');
      sections.push(summary);
    }
  }

  const workExperience = [
    ...asRecordArray(resumeJson.workExperience),
    ...asRecordArray(resumeJson.workExperiences),
  ];

  if (workExperience.length) {
    sections.push('Work Experience:');
    workExperience.forEach((exp, index) => {
      sections.push(
        `${index + 1}. ${asString(exp.jobTitle)} at ${asString(exp.company)}`,
      );

      const duration = asString(exp.duration) || asString(exp.date);
      if (duration) sections.push(`Duration: ${duration}`);

      const description = asString(exp.description);
      if (description) sections.push(`Description: ${description}`);

      appendStringList(sections, exp.responsibilities);
      appendStringList(sections, exp.descriptions);
    });
  }

  const education = [
    ...asRecordArray(resumeJson.education),
    ...asRecordArray(resumeJson.educations),
  ];

  if (education.length) {
    sections.push('Education:');
    education.forEach((edu, index) => {
      const institution = asString(edu.institution) || asString(edu.school);
      sections.push(
        `${index + 1}. ${asString(edu.degree)} from ${institution}`,
      );

      const graduationYear =
        asNumber(edu.graduationYear)?.toString() || asString(edu.date);
      if (graduationYear) sections.push(`Graduation Year: ${graduationYear}`);
      if (edu.gpa) sections.push(`GPA: ${asString(edu.gpa)}`);
      appendStringList(sections, edu.descriptions);
    });
  }

  if (resumeJson.skills) {
    sections.push('Skills:');
    if (typeof resumeJson.skills === 'string') {
      sections.push(resumeJson.skills);
    } else if (Array.isArray(resumeJson.skills)) {
      appendStringList(sections, resumeJson.skills);
    } else if (isRecord(resumeJson.skills)) {
      appendStringList(sections, resumeJson.skills.descriptions);

      asRecordArray(resumeJson.skills.featuredSkills).forEach((skill) => {
        const skillName = asString(skill.skill);
        if (skillName) sections.push(`- ${skillName}`);
      });
    }
  }

  appendStringList(sections, resumeJson.technical);
  appendStringList(sections, resumeJson.soft);

  const projects = asRecordArray(resumeJson.projects);
  if (projects.length) {
    sections.push('Projects:');
    projects.forEach((project, index) => {
      const projectName = asString(project.name) || asString(project.project);
      sections.push(`${index + 1}. ${projectName}`);

      if (project.description) {
        sections.push(`Description: ${asString(project.description)}`);
      }

      if (project.technologies) {
        sections.push(`Technologies: ${asString(project.technologies)}`);
      }

      appendStringList(sections, project.descriptions);
    });
  }

  if (isRecord(resumeJson.custom)) {
    appendStringList(sections, resumeJson.custom.descriptions);
  }

  return sections.filter((section) => section && section.trim()).join('\n');
};

/**
 * Prepares job content for embedding generation from job data
 */
export const prepareJobContent = (job: {
  job_role: string;
  description: string;
  skills_required: unknown;
  location?: string;
  ctc?: number;
  stipend?: number;
}): string => {
  const sections = [];

  // Job role
  if (job.job_role) {
    sections.push(`Job Role: ${job.job_role}`);
  }

  // Location
  if (job.location) {
    sections.push(`Location: ${job.location}`);
  }

  // Compensation
  if (job.ctc) {
    sections.push(`CTC: ${job.ctc}`);
  }
  if (job.stipend) {
    sections.push(`Stipend: ${job.stipend}`);
  }

  // Job description
  if (job.description) {
    sections.push('Job Description:');
    sections.push(job.description);
  }

  // Skills required
  if (job.skills_required) {
    sections.push('Skills Required:');
    if (Array.isArray(job.skills_required)) {
      job.skills_required.forEach((skill: string) => {
        sections.push(`- ${skill}`);
      });
    } else if (typeof job.skills_required === 'string') {
      sections.push(job.skills_required);
    } else if (typeof job.skills_required === 'object') {
      // Handle if skills_required is an object with skill arrays
      Object.values(job.skills_required).forEach((skillArray) => {
        if (Array.isArray(skillArray)) {
          skillArray.forEach((skill) => {
            if (typeof skill === 'string') sections.push(`- ${skill}`);
          });
        }
      });
    }
  }

  return sections.filter((section) => section && section.trim()).join('\n');
};

/**
 * Generates embeddings for resume content
 */
export const generateResumeEmbedding = async (
  resumeJson: unknown,
): Promise<number[]> => {
  const content = prepareResumeContent(resumeJson);
  if (!content.trim()) {
    throw new Error('No content available for embedding generation');
  }

  return await getEmbeddings(content);
};

/**
 * Generates sectional embeddings for resume sections
 */
export const generateSectionalEmbeddings = async (
  resumeJson: unknown,
): Promise<SectionalEmbedding[]> => {
  const sections = extractResumeSections(resumeJson);

  return await Promise.all(
    Object.entries(sections)
      .filter(([, content]) => content.trim())
      .map(async ([sectionName, content]) => ({
        section: sectionName as SectionName,
        text: content,
        embedding: await getEmbeddings(content),
      })),
  );
};

/**
 * Generates embeddings for job content
 */
export const generateJobEmbedding = async (job: {
  job_role: string;
  description: string;
  skills_required: unknown;
  location?: string;
  ctc?: number;
  stipend?: number;
}): Promise<number[]> => {
  const content = prepareJobContent(job);
  if (!content.trim()) {
    throw new Error('No content available for embedding generation');
  }

  return await getEmbeddings(content);
};
