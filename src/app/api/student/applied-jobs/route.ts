import { NextRequest, NextResponse } from "next/server";

import { errorHandler } from "@/utils/errorHandler";
import { authMiddleware } from "@/lib/token"
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {

  try {

    const token = await authMiddleware(req, "applicant")
    const studentData = await prisma.applicant.findUniqueOrThrow({
      where: {
        email: token.email
      }
    });

    const appliedJobs = await prisma.appliedJob.findMany({
      where: {
        applicant_id: studentData.id
      },
      include: {
        job: true
      }
    })

    return NextResponse.json({ status: true, data: appliedJobs });
  } catch (err) {
    const [res, status] = errorHandler(err);
    return NextResponse.json(res, status)
  }
}
