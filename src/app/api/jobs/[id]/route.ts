import { NextRequest, NextResponse } from "next/server";

import { authMiddleware } from "@/lib/token";
import { CustomError, errorHandler } from "@/utils/errorHandler";
import { prisma } from "@/lib/db"

type Status = "applied" | "shortlisted" | "hired";

async function getJobById(req: NextRequest, { params }: { params: { id: string } }) {

  try {
    const token = await authMiddleware(req, "company")

    const jobId = params.id
    if (!jobId) throw new CustomError('job id not provided', 400);

    const company = await prisma.company.findFirst({ where: { email: token?.email } })

    if (!company) throw new CustomError("Company not found", 403);

    const job = await prisma.job.findUnique({ where: { id: jobId, company_id: company.id } });

    if (!job) throw new CustomError("job not found", 403);

    const applicants = await prisma.appliedJob.findMany({
      where: {
        jobId: job.id,
      },
      include: {
        applicant: true
      },
    });

    const result: Record<Status, any[]> = {
      applied: [],
      shortlisted: [],
      hired: []
    }

    applicants.forEach((el) => {
      result[el.status].push(el);
    })

    return NextResponse.json({
      status: true,
      data: result
    })

  } catch (err) {
    const [resp, status] = errorHandler(err)
    return NextResponse.json(resp, status)
  }
}

export const GET = getJobById
