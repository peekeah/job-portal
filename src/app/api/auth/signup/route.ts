import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { hashPassword } from "@/utils/bcrypt";
import { errorHandler } from "@/utils/errorHandler";
import { prisma } from "@/lib/db";
import { CompanySize, UserType } from "@/generated/prisma";

const Roles = ["applicant", "company", "admin"];

const companySizeMap = new Map([
  ["1_10", CompanySize.SIZE_1_10],
  ["10_50", CompanySize.SIZE_10_50],
  ["50_100", CompanySize.SIZE_50_100],
  ["100+", CompanySize.SIZE_100_PLUS],
])

const payloadSchema = z.object({
  email: z.email().min(5).max(25),
  password: z.string().min(5).max(20),
  user_type: z.enum(Roles).optional(),
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

const companySchema = z.object({
  name: z.string(),
  founding_year: z.number(),
  company_type: z.string(),
  contact_no: z.string(),
  website: z.string().optional(),
  address: z.string(),
  size: z.enum(["1-10", "10-50", "50-100", "100+"]).optional(),
  bio: z.string().optional()
})

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
      const companySize = companyPayload.size ? companySizeMap.get(companyPayload.size) : null;

      const [dbRes, _] = await prisma.$transaction([
        prisma.auth.create({
          data: { email, password, user_type: UserType.company }
        }),
        prisma.company.create({
          data: { ...companyPayload, size: companySize }
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

