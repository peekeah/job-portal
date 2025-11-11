import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { hashPassword } from "@/lib/bcrypt";
import { errorHandler } from "@/lib/errorHandler";
import { prisma } from "@/lib/db";
import { UserType } from "@prisma/client";
import { companySchema } from "@/lib/schema";

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


export async function POST(req: NextRequest) {

  try {
    const payload = await req.json();
    const { email, password: rawPwd, user_type } = payloadSchema.parse(payload);
    const { password: _password, ...leftPayload } = payload;

    const password = await hashPassword(rawPwd);
    let res;

    if (!user_type || user_type === "applicant") {
      const parsedPayload = applicantSchema.parse(leftPayload)

      const [dbRes, _createRes] = await prisma.$transaction([
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

      const [dbRes, _createRes] = await prisma.$transaction([
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

