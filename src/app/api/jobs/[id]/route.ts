import { authMiddleware } from "@/lib/token";
import job from "@/models/job";
import { CustomError, errorHandler } from "@/utils/errorHandler";
import { NextRequest, NextResponse } from "next/server";

async function getJobById(req: NextRequest, { params }: { params: { id: string } }) {

  try {

    await authMiddleware(req, "company")

    const jobId = params.id
    if (!jobId) throw new CustomError('job id not provided', 400);

    const studentsList = await job.findOne({ _id: jobId })
      .populate('applicants.applied', '-applied_jobs')
      .populate('applicants.shortlisted')
      .populate('applicants.hired')

    if (!studentsList) throw new CustomError('Job does not exist', 403);

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
