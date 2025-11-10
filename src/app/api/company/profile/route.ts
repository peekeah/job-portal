import { NextRequest, NextResponse } from "next/server";

import { authMiddleware } from "@/lib/token";
import { hashPassword } from "@/utils/bcrypt";
import { errorHandler } from "@/utils/errorHandler";
import { prisma } from "@/lib/db";

async function getProfile(req: NextRequest) {
  try {

    const token = await authMiddleware(req, "company")

    // FIXME: Fix this type error
    // const companyData = await company.findOne({ email: token?.email }).select("-password");
    const companyData = await prisma.company.findFirstOrThrow(
      { where: { email: token?.email } }
    )
    return NextResponse.json({
      status: true,
      data: companyData,
    });
  } catch (err) {
    const [res, status] = errorHandler(err);
    return NextResponse.json(res, status)
  }
}

async function postProfile(req: NextRequest) {
  try {

    const token = await authMiddleware(req, "company")

    const body = await req.json()

    if (body.password) {
      body.password = await hashPassword(body.password);
    }

    const updated = await company.findOneAndUpdate(
      { email: token.email },
      body,
      { new: true }
    );

    return NextResponse.json({
      status: true,
      data: updated,
    });
  } catch (err) {
    const [res, status] = errorHandler(err);
    return NextResponse.json(res, status)
  }
}

export const GET = getProfile
export const POST = postProfile

