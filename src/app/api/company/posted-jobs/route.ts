import { NextRequest, NextResponse } from "next/server";

import { authMiddleware } from "@/lib/token"
import { CustomError, errorHandler } from "@/lib/errorHandler";
import { prisma } from "@/lib/db"

export async function GET(req: NextRequest) {

  try {

    const token = await authMiddleware(req, "company")

    const existCompany = await prisma.company.findFirst({
      where: { email: token.email }
    })

    if (!existCompany) {
      throw new CustomError("Company not found", 403);
    }

    const result = await prisma.job.findMany({
      where: { company_id: existCompany.id },
      include: {
        _count: {
          select: {
            applied_jobs: true
          }
        }
      }
    })

    return NextResponse.json({
      status: true,
      data: result,
    });
  } catch (err) {
    const [res, status] = errorHandler(err);
    return NextResponse.json(res, status)
  }
}
