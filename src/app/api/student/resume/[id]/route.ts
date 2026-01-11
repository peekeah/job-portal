import { prisma } from "@/lib/db";
import { CustomError, errorHandler } from "@/lib/errorHandler";
import { authMiddleware } from "@/lib/token";
import { NextRequest, NextResponse } from "next/server";

async function deleteResume(req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resumeId = (await params).id;
    const token = await authMiddleware(req, "applicant");

    const student = await prisma.applicant.findFirst({
      where: {
        email: token.email
      }
    })

    if (!student) {
      throw new CustomError("Unauthoriaed", 409)
    }

    await prisma.resume.delete({
      where: {
        id: resumeId,
        applicant_id: student.id
      }
    });

    return NextResponse.json({ status: true, data: "successfully deleted resume" }, { status: 200 });
  } catch (err) {
    const [res, status] = errorHandler(err);
    return NextResponse.json(res, status);
  }
}

export const DELETE = deleteResume;
