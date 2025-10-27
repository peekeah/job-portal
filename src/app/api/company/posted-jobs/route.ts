import company from "@/models/company";
import job from "@/models/job";
import { errorHandler, CustomError } from "@/utils/errorHandler";
import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/lib/token"

export async function GET(req: NextRequest) {

  try {

    const token = await authMiddleware(req, "company")

    const existCompany = await company.findOne({ email: token.email });
    if (!existCompany) throw new CustomError("Company not found", 404);

    const result = await job.find({ company: existCompany._id }).populate("company");

    return NextResponse.json({
      status: true,
      data: result,
    });
  } catch (err) {
    const [res, status] = errorHandler(err);
    return NextResponse.json(res, status)
  }
}
