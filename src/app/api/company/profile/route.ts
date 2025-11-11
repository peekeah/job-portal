import { NextRequest, NextResponse } from "next/server";

import { authMiddleware } from "@/lib/token";
import { CustomError, errorHandler } from "@/lib/errorHandler";
import { prisma } from "@/lib/db";
import { companySchema } from "@/lib/schema";

async function getProfile(req: NextRequest) {
  try {

    const token = await authMiddleware(req, "company")

    const companyData = await prisma.company.findFirst(
      { where: { email: token?.email } }
    )

    if (!companyData) {
      throw new CustomError("company not found", 403);
    }

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
    const postSchema = companySchema.partial();
    const payload = postSchema.parse(body);

    const updated = await prisma.company.updateMany(
      {
        data: {
          ...payload,
        },
        where: {
          email: token.email
        }
      }
    );

    return NextResponse.json({
      status: true,
      data: updated,
    });
  } catch (err) {
    console.log("err:", err)
    const [res, status] = errorHandler(err);
    return NextResponse.json(res, status)
  }
}

export const GET = getProfile
export const POST = postProfile

