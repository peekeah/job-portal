import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import student from "@/models/student";
import { hashPassword } from "@/utils/bcrypt";
import { errorHandler, CustomError } from "@/utils/errorHandler";
import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/lib/token";

async function getProfile(req: NextRequest) {
  try {

    const token = await authMiddleware(req, "student")

    const studentData = await student.findOne({ email: token?.email }).select("-password");
    if (!studentData) throw new CustomError("Student not found", 404);

    return NextResponse.json({ status: true, data: studentData });
  } catch (err) {
    const [res, status] = errorHandler(err);
    return NextResponse.json(res, status)
  }

}

async function postProfile(req: NextRequest) {
  try {
    const token = await authMiddleware(req, "student")

    const body = await req.json()

    if (body.password) {
      body.password = await hashPassword(body.password);
    }

    const updated = await student.findOneAndUpdate({ email: token.email }, body, { new: true });

    return NextResponse.json({ status: true, data: updated });

  } catch (err) {
    const [res, status] = errorHandler(err);
    return NextResponse.json(res, status)
  }
}

export const GET = getProfile
export const POST = postProfile
