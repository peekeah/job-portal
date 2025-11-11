import { NextRequest, NextResponse } from "next/server";

import { hashPassword } from "@/lib/bcrypt";
import { errorHandler, CustomError } from "@/lib/errorHandler";
import { authMiddleware } from "@/lib/token";
import { prisma } from "@/lib/db";

async function getProfile(req: NextRequest) {
  try {

    const token = await authMiddleware(req, "applicant")

    const studentData = await prisma.applicant.findUnique({
      where: {
        email: token?.email
      }
    });

    if (!studentData) throw new CustomError("Student not found", 404);

    return NextResponse.json({ status: true, data: studentData });
  } catch (err) {
    const [res, status] = errorHandler(err);
    return NextResponse.json(res, status)
  }

}

async function postProfile(req: NextRequest) {
  try {
    const token = await authMiddleware(req, "applicant")

    const body = await req.json()

    if (body.password) {
      body.password = await hashPassword(body.password);
    }

    const updated = await prisma.applicant.update({
      where: {
        email: token.email
      },
      data: body
    });

    return NextResponse.json({ status: true, data: updated });

  } catch (err) {
    const [res, status] = errorHandler(err);
    return NextResponse.json(res, status)
  }
}

export const GET = getProfile
export const POST = postProfile
