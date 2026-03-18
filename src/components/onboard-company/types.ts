import { CompanySize } from "@prisma/client";
import * as z from "zod";

export const companyProfileSchema = z.object({
  name: z
    .string()
    .nonempty({ message: "Company name is required" })
    .max(100, { message: "Company name cannot exceed 100 characters" }),
  founding_year: z
    .number()
    .int({ message: "Founding year must be an integer" })
    .min(1800, { message: "Founding year seems invalid" })
    .max(new Date().getFullYear(), {
      message: "Founding year cannot be in the future",
    }),
  company_type: z.string().nonempty({ message: "Company type is required" }),
  size: z.enum(CompanySize),
});

export const companyAccountSchema = z.object({
  email: z
    .email({ message: "Please enter a valid email address" })
    .nonempty({ message: "Company email is required" }),
  password: z
    .string()
    .nonempty({ message: "Password is required" })
    .min(8, { message: "Password must be at least 8 characters long" })
    .max(20, { message: "Password cannot exceed 20 characters" })
    .regex(/[A-Z]/, {
      message: "Password must contain at least one uppercase letter",
    })
    .regex(/[a-z]/, {
      message: "Password must contain at least one lowercase letter",
    })
    .regex(/[0-9]/, { message: "Password must contain at least one number" }),
  contact_no: z
    .string()
    .nonempty({ message: "Contact number is required" })
    .min(7, { message: "Contact number is too short" })
    .max(15, { message: "Contact number is too long" })
    .regex(/^\+?\d+$/, {
      message: "Contact number must contain only digits",
    }),
});

const companyMetadataSchema = z.object({
  website: z
    .url({ message: "Please enter a valid website URL" })
    .refine((val) => !val || val.startsWith("https://"), {
      message: "Website must start with https://",
    })
    .optional()
    .nullable(),
  linkedIn: z
    .url({ message: "Please enter a valid website URL" })
    .refine((val) => !val || val.startsWith("https://"), {
      message: "Website must start with https://",
    })
    .optional()
    .nullable()
    .or(z.literal("")),
  twitter: z
    .url({ message: "Please enter a valid website URL" })
    .refine((val) => !val || val.startsWith("https://"), {
      message: "Website must start with https://",
    })
    .optional()
    .nullable()
    .or(z.literal("")),
  address: z
    .string()
    .nonempty({ message: "Address is required" })
    .max(255, { message: "Address cannot exceed 255 characters" }),

  bio: z
    .string()
    .max(500, { message: "Bio cannot exceed 500 characters" })
    .optional()
    .nullable(),
});

export const combinedCompanySchema = companyProfileSchema
  .extend(companyAccountSchema.shape)
  .extend(companyMetadataSchema.shape);

export const companyProfileInputKeys = companyProfileSchema.keyof()
  .options as CompanyCombinedInputKeys[];
export const companyAccountInputKeys = companyAccountSchema.keyof()
  .options as CompanyCombinedInputKeys[];
export const companyMetadataInputKeys = companyMetadataSchema.keyof()
  .options as CompanyCombinedInputKeys[];
export const combinedCompanyInputKeys = combinedCompanySchema.keyof()
  .options as CompanyCombinedInputKeys[];

export type CompanySignupPayload = z.infer<typeof combinedCompanySchema>;
export type CompanyCombinedInputKeys = z.infer<
  ReturnType<typeof combinedCompanySchema.keyof>
>;
