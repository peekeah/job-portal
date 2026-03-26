import { z } from 'zod';

export const resumeSchema = z.object({
  id: z.uuid(),
  title: z.string().min(3).max(255),
  type: z.enum(['pdf', 'json']),
  url: z.string().nullable(),
  json: z.string().nullable(),
  applicant_id: z.uuid(),
});

export const profileSchema = z.object({
  id: z.uuid(),
  name: z.string().min(2).max(100),
  email: z.email().min(5).max(100),
  mobile: z.string().regex(/^\d{10,12}$/, 'Invalid mobile number'),
  location: z.string().min(3).max(15),
  active_resume_id: z.string().optional(),
  profile_pic: z.string().nullable(),
  college_name: z.string().min(2).max(150),
  college_branch: z.string().min(2).max(100),
  college_joining_year: z.string().regex(/^(19|20)\d{2}$/),
  resume: z.array(resumeSchema),
});

export type Profile = z.infer<typeof profileSchema>;
