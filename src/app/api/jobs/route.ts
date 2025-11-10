import { NextRequest, NextResponse } from "next/server"

import { authMiddleware } from "@/lib/token";
import { prisma } from "@/lib/db";
import { errorHandler, CustomError } from "@/utils/errorHandler";

export async function GET(req: NextRequest) {
  try {
    await authMiddleware(req)
    const jobs = await job.find().populate("company", "-password");
    return NextResponse.json({ status: true, data: jobs });
  } catch (err) {
    const [resp, status] = errorHandler(err)
    return NextResponse.json(resp, status)
  }
}

export async function POST(req: NextRequest) {
  try {

    const token = await authMiddleware(req, "company");

    const companyData = await prisma.company.findUnique({ email: token.email });
    if (!companyData) throw new CustomError("Company not found", 403);

    const payload = await req.json()
    payload.company = companyData._id;
    await new job(payload).save();

    return NextResponse.json({ status: true, data: "successfully posted job" }, { status: 201 });
  } catch (err) {
    const [resp, status] = errorHandler(err)
    return NextResponse.json(resp, status)
  }
}

