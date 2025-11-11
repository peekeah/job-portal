import { NextRequest, NextResponse } from "next/server"

import { authMiddleware } from "@/lib/token";
import { prisma } from "@/lib/db";
import { errorHandler, CustomError } from "@/utils/errorHandler";
import z from "zod";

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

export async function GET(req: NextRequest) {
  try {
    await authMiddleware(req)
    const jobs = await prisma.job.findMany();
    return NextResponse.json({ status: true, data: jobs });
  } catch (err) {
    const [resp, status] = errorHandler(err)
    return NextResponse.json(resp, status)
  }
}

export async function POST(req: NextRequest) {
  try {

    const token = await authMiddleware(req, "company");
    const rawPayload = await req.json();
    const payload = jobSchema.parse(rawPayload);

    const companyData = await prisma.company.findFirst({
      where:
        { email: token.email }
    });

    if (!companyData) throw new CustomError("Company not found", 403);

    await prisma.job.create({
      data: {
        ...payload,
        company_id: companyData.id,
      }
    })

    return NextResponse.json({ status: true, data: "successfully posted job" }, { status: 201 });
  } catch (err) {
    const [resp, status] = errorHandler(err)
    return NextResponse.json(resp, status)
  }
}

