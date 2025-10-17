import { z } from "zod";

/**
 * Core Job schema
 */
export const JobSchema = z.object({
  id: z.number().int().positive(), // e.g. 1, 2, 3
  companyName: z.string().min(1, "Company name is required"),
  jobRole: z.string().min(1, "Job role is required"),
  description: z
    .string()
    .min(10, "Description too short")
    .max(2000, "Description too long"),
  ctc: z.string().min(1, "CTC is required"), // keep as string to support "6 LPA" etc.
  stipend: z.string().optional().nullable(), // optional, e.g. "₹20,000/month" or null
  location: z.string().min(1, "Location is required"),
  requiredSkills: z
    .array(z.string().min(1))
    .min(1, "At least one skill is required"),
});

/**
 * Input schema for creating a job (client sends this)
 * - id is optional because backend typically generates it
 */
export const CreateJobSchema = JobSchema.omit({ id: true });

/**
 * Useful derived types
 */
export type Job = z.infer<typeof JobSchema>;
export type CreateJobInput = z.infer<typeof CreateJobSchema>;

