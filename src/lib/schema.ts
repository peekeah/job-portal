import { CompanySize } from "@prisma/client";
import z from "zod";

export const companySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Company name is required"),
  email: z.string().email("Invalid email address"),
  founding_year: z
    .number()
    .int("Founding year must be an integer")
    .min(1800, "Founding year seems invalid")
    .max(new Date().getFullYear(), "Founding year cannot be in the future"),
  company_type: z.string().min(1, "Company type is required"),
  contact_no: z
    .string()
    .min(7, "Contact number too short")
    .max(15, "Contact number too long")
    .refine((val) => /^\+?\d+$/.test(val), "Contact number must contain only digits"),
  website: z
    .string()
    .url("Invalid URL")
    .optional()
    .nullable()
    .refine((val) => !val || val.startsWith("https://"), "Website must start with https://"),
  address: z.string().min(1, "Address is required"),
  size: z.enum(CompanySize).optional().nullable(),
  bio: z.string().max(500, "Bio cannot exceed 500 characters").optional().nullable(),
});

export const jobSchema = z.object({
  job_role: z
    .string({ error: "Job role is required" })
    .min(2, { message: "Job role must be at least 2 characters long" }),

  description: z
    .string({ error: "Description is required" })
    .min(10, { message: "Description must be at least 10 characters long" }),

  ctc: z
    .coerce.number({ error: "CTC is required" }),

  stipend: z
    .coerce.number({ error: "Stipend is required" }),

  location: z
    .string({ error: "Location is required" })
    .min(2, { message: "Location must be at least 2 characters long" }),

  skills_required: z
    .array(
      z.string().min(1, { message: "Skill cannot be empty" })
    )
    .min(1, { message: "At least one skill is required" })
});
