import { NextRequest, NextResponse } from "next/server";

import { errorHandler, CustomError } from "@/lib/errorHandler";
import { authMiddleware } from "@/lib/auth-middleware";
import { prisma } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: jobId } = await params;

    if (!jobId) throw new CustomError("Job id missing", 400);

    const token = await authMiddleware(req, "applicant");

    const studentData = await prisma.applicant.findUnique({
      where: {
        email: token.email,
      },
    });

    if (!studentData) {
      throw new CustomError("student not found", 403);
    }

    if (!studentData?.id) throw new CustomError("Student data missing", 400);

    const existJob = await prisma.job.findFirst({
      where: {
        id: jobId,
      },
    });

    if (!existJob) {
      throw new CustomError("Job not found", 403);
    }

    const appliedJob = await prisma.appliedJob.findFirst({
      where: {
        jobId: jobId,
        applicant_id: studentData.id,
      },
    });

    if (appliedJob) {
      throw new CustomError("You already applied for this job", 403);
    }

    const dbRes = await prisma.resume.findFirst({
      where: {
        applicant_id: studentData.id,
      },
    });

    if (!dbRes) {
      throw new CustomError("upload resume first", 400);
    }

    await prisma.appliedJob.create({
      data: {
        status: "applied",
        applicant_id: studentData.id,
        jobId: jobId,
        applied_resume_id: dbRes.id,
      },
    });

    return NextResponse.json({
      status: true,
      data: "successfully applied for the job",
    });
  } catch (err) {
    const [res, status] = errorHandler(err);
    return NextResponse.json(res, status);
  }
}
