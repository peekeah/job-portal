import { z } from 'zod';

export const resumeProfileSchema = z.object({
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  url: z.string(),
  summary: z.string(),
  location: z.string(),
});

export const resumeWorkExperienceSchema = z.object({
  company: z.string(),
  jobTitle: z.string(),
  date: z.string(),
  descriptions: z.array(z.string()),
});

export const resumeEducationSchema = z.object({
  school: z.string(),
  degree: z.string(),
  date: z.string(),
  gpa: z.string(),
  descriptions: z.array(z.string()),
});

export const resumeProjectSchema = z.object({
  project: z.string(),
  date: z.string(),
  descriptions: z.array(z.string()),
});

export const featuredSkillSchema = z.object({
  skill: z.string(),
});

export const resumeSkillsSchema = z.object({
  featuredSkills: z.array(featuredSkillSchema),
  descriptions: z.array(z.string()),
});

export const resumeCustomSchema = z.object({
  descriptions: z.array(z.string()),
});

export const resumeSchema = z.object({
  profile: resumeProfileSchema,
  workExperiences: z.array(resumeWorkExperienceSchema),
  educations: z.array(resumeEducationSchema),
  projects: z.array(resumeProjectSchema),
  skills: resumeSkillsSchema,
  custom: resumeCustomSchema,
});
