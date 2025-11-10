import { NextRequest, NextResponse } from "next/server";

import { authMiddleware } from "@/lib/token"
import { errorHandler } from "@/utils/errorHandler";
import { prisma } from "@/lib/db"

export async function GET(req: NextRequest) {

  try {

    const token = await authMiddleware(req, "company")

    const existCompany = await prisma.applicant.findFirstOrThrow({
      where: { email: token.email }
    })

    const result = await prisma.job.findFirstOrThrow({ where: { company_id: existCompany.id } })

    return NextResponse.json({
      status: true,
      data: result,
    });
  } catch (err) {
    const [res, status] = errorHandler(err);
    return NextResponse.json(res, status)
  }
}
