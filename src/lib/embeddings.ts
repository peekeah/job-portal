import { getEmbeddings } from './ai';

/**
 * Prepares resume content for embedding generation from parsed resume JSON
 */
export const prepareResumeContent = (resumeJson: any): string => {
  if (!resumeJson) return '';

  const sections = [];
  
  // Extract personal information
  if (resumeJson.personalInfo) {
    const { name, email, phone, location } = resumeJson.personalInfo;
    sections.push(`Name: ${name || ''}`);
    sections.push(`Email: ${email || ''}`);
    sections.push(`Phone: ${phone || ''}`);
    sections.push(`Location: ${location || ''}`);
  }

  // Extract work experience
  if (resumeJson.workExperience && Array.isArray(resumeJson.workExperience)) {
    sections.push('Work Experience:');
    resumeJson.workExperience.forEach((exp: any, index: number) => {
      sections.push(`${index + 1}. ${exp.jobTitle || ''} at ${exp.company || ''}`);
      if (exp.duration) sections.push(`Duration: ${exp.duration}`);
      if (exp.description) sections.push(`Description: ${exp.description}`);
      if (exp.responsibilities && Array.isArray(exp.responsibilities)) {
        exp.responsibilities.forEach((resp: string) => {
          sections.push(`- ${resp}`);
        });
      }
    });
  }

  // Extract education
  if (resumeJson.education && Array.isArray(resumeJson.education)) {
    sections.push('Education:');
    resumeJson.education.forEach((edu: any, index: number) => {
      sections.push(`${index + 1}. ${edu.degree || ''} from ${edu.institution || ''}`);
      if (edu.graduationYear) sections.push(`Graduation Year: ${edu.graduationYear}`);
      if (edu.gpa) sections.push(`GPA: ${edu.gpa}`);
    });
  }

  // Extract skills
  if (resumeJson.skills) {
    sections.push('Skills:');
    if (typeof resumeJson.skills === 'string') {
      sections.push(resumeJson.skills);
    } else if (Array.isArray(resumeJson.skills)) {
      resumeJson.skills.forEach((skill: string) => {
        sections.push(`- ${skill}`);
      });
    } else if (resumeJson.technical || resumeJson.soft) {
      if (resumeJson.technical) {
        sections.push('Technical Skills:');
        if (Array.isArray(resumeJson.technical)) {
          resumeJson.technical.forEach((skill: string) => sections.push(`- ${skill}`));
        }
      }
      if (resumeJson.soft) {
        sections.push('Soft Skills:');
        if (Array.isArray(resumeJson.soft)) {
          resumeJson.soft.forEach((skill: string) => sections.push(`- ${skill}`));
        }
      }
    }
  }

  // Extract projects
  if (resumeJson.projects && Array.isArray(resumeJson.projects)) {
    sections.push('Projects:');
    resumeJson.projects.forEach((project: any, index: number) => {
      sections.push(`${index + 1}. ${project.name || ''}`);
      if (project.description) sections.push(`Description: ${project.description}`);
      if (project.technologies) {
        sections.push(`Technologies: ${project.technologies}`);
      }
    });
  }

  // Extract summary/objective
  if (resumeJson.summary || resumeJson.objective) {
    sections.push('Summary:');
    sections.push(resumeJson.summary || resumeJson.objective);
  }

  return sections.filter(section => section && section.trim()).join('\n');
};

/**
 * Prepares job content for embedding generation from job data
 */
export const prepareJobContent = (job: {
  job_role: string;
  description: string;
  skills_required: any;
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
          skillArray.forEach((skill: string) => {
            sections.push(`- ${skill}`);
          });
        }
      });
    }
  }

  return sections.filter(section => section && section.trim()).join('\n');
};

/**
 * Generates embeddings for resume content
 */
export const generateResumeEmbedding = async (resumeJson: any): Promise<number[]> => {
  const content = prepareResumeContent(resumeJson);
  if (!content.trim()) {
    throw new Error('No content available for embedding generation');
  }
  
  return await getEmbeddings(content);
};

/**
 * Generates embeddings for job content
 */
export const generateJobEmbedding = async (job: {
  job_role: string;
  description: string;
  skills_required: any;
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
