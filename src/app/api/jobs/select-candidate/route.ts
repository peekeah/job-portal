import { NextRequest, NextResponse } from "next/server";
import z from "zod";

import { CustomError, errorHandler } from "@/lib/errorHandler";
import { prisma } from "@/lib/db";
import { authMiddleware } from "@/lib/token";

const schema = z.object({
  jobId: z.string(),
  studentId: z.string(),
  applicantStatus: z.enum(["applied", "shortlisted", "hired"])
})

const selectCandidates = async (req: NextRequest) => {

  try {

    const token = await authMiddleware(req, "company");

    const rawPayload = await req.json();
    const payload = schema.parse(rawPayload);

    const company = await prisma.company.findFirst({
      where: { email: token.email }
    });

    if (!company) {
      throw new CustomError("Company not found", 403);
    }

    const job = await prisma.job.findFirst({
      where: { id: payload.jobId, company_id: company.id }
    })

    if (!job) {
      throw new CustomError("job not found", 403)
    }

    await prisma.appliedJob.updateMany({
      data: {
        status: payload.applicantStatus
      },
      where: {
        jobId: payload.jobId,
        applicant_id: payload.studentId
      }
    });

    return NextResponse.json({ status: true, data: "successfully updated status" })

  } catch (err) {
    const [resp, status] = errorHandler(err)
    return NextResponse.json(resp, status)
  }
}

export const POST = selectCandidates;
