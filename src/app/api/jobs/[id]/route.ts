import { NextRequest, NextResponse } from "next/server";

import { authMiddleware } from "@/lib/token";
import { CustomError, errorHandler } from "@/utils/errorHandler";
import { prisma } from "@/lib/db"

async function getJobById(req: NextRequest, { params }: { params: { id: string } }) {

  try {

    await authMiddleware(req, "company")

    const jobId = params.id
    if (!jobId) throw new CustomError('job id not provided', 400);

    const job = await prisma.job.findUniqueOrThrow({ where: { id: jobId } })

    const applicantsIds = job.applicants

    const applicants = await prisma.applicant.findMany({
      where: {
        id: { in: applicantsIds },
      },
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        college: true,
        bio: true,
      }
    })

    const studentsList = { ...job, applicants }

    return NextResponse.json({
      status: true,
      data: studentsList.applicants || []
    })

  } catch (err) {
    const [resp, status] = errorHandler(err)
    return NextResponse.json(resp, status)
  }
}

export const GET = getJobById
