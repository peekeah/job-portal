import { NextRequest, NextResponse } from "next/server";

import { authMiddleware } from "@/lib/token";
import { prisma } from "@/lib/db";
import { CustomError, errorHandler } from "@/lib/errorHandler";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {

    const token = await authMiddleware(req, "applicant");
    // 1. First save the html content in the db.
    // 2. Apply with latest resume

  } catch (err) {
    const [resBody, status] = errorHandler(err);
    return NextResponse.json(resBody, status);
  }
}
