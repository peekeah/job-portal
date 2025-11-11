import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { hashPassword } from "@/utils/bcrypt";
import { errorHandler } from "@/utils/errorHandler";
import { prisma } from "@/lib/db";
import { CompanySize, UserType } from "@/generated/prisma";

export const companySizeMap = new Map([
  ["1-10", CompanySize.SIZE_1_10],
  ["10-50", CompanySize.SIZE_10_50],
  ["50-100", CompanySize.SIZE_50_100],
  ["100+", CompanySize.SIZE_100_PLUS],
])

const payloadSchema = z.object({
  email: z.email().min(5).max(25),
  password: z.string().min(5).max(20),
  user_type: z.enum(UserType).optional(),
});

const applicantSchema = z.object({
  name: z.string(),
  mobile: z.string(),
  email: z.string(),
  profile_pic: z.string().optional(),
  bio: z.string().optional(),
  college_name: z.string().optional(),
  college_branch: z.string().optional(),
  college_joining_year: z.string().optional(),
});

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

export async function POST(req: NextRequest) {

  try {
    const payload = await req.json();
    const { email, password: rawPwd, user_type } = payloadSchema.parse(payload);
    const { password: _, ...leftPayload } = payload;

    const password = await hashPassword(rawPwd);
    let res;

    if (!user_type || user_type === "applicant") {
      const parsedPayload = applicantSchema.parse(leftPayload)

      const [dbRes, _] = await prisma.$transaction([
        prisma.auth.create({
          data: { email, password, user_type: UserType.applicant }
        }),
        prisma.applicant.create({
          data: {
            ...parsedPayload
          }
        }),
      ])
      res = dbRes;
    } else if (user_type === "company") {
      const companyPayload = companySchema.parse(leftPayload)

      const [dbRes, _] = await prisma.$transaction([
        prisma.auth.create({
          data: { email, password, user_type: UserType.company }
        }),
        prisma.company.create({
          data: { ...companyPayload }
        }),
      ])

      res = dbRes;
    } else {
      res = prisma.auth.create({
        data: { email, password, user_type: UserType.admin }
      })
    }

    return NextResponse.json({
      status: true,
      data: "signup successfully",
    }, { status: 201 });

  } catch (err) {
    console.log("err::", err)
    const [resp, status] = errorHandler(err)
    return NextResponse.json(resp, status)
  }
}

