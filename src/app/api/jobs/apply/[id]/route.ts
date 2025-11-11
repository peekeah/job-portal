import { NextRequest, NextResponse } from "next/server"

import { errorHandler, CustomError } from "@/lib/errorHandler";
import { authMiddleware } from "@/lib/token"
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {

  try {
    const { id: jobId } = await params

    if (!jobId) throw new CustomError("Job id missing", 400);

    const token = await authMiddleware(req, "applicant");

    const studentData = await prisma.applicant.findUnique({
      where: {
        email: token.email
      }
    })

    if (!studentData) {
      throw new CustomError("student not found", 403)
    }

    if (!studentData?.id) throw new CustomError("Student data missing", 400);


    const job = await prisma.appliedJob.findFirst({
      where: {
        jobId
      }
    })

    if (job?.status === "applied") {
      throw new CustomError("You already applied for this job", 403);
    }

    await prisma.appliedJob.updateMany({
      where: {
        applicant_id: studentData.id,
        jobId: jobId,
      },
      data: {
        status: "applied",
      },
    })

    return NextResponse.json({ status: true, data: "successfully applied for the job" });
  } catch (err) {
    const [res, status] = errorHandler(err);
    return NextResponse.json(res, status)
  }
}


