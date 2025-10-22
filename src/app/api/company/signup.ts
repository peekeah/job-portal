import jwt from "jsonwebtoken";
import company from "@/models/company";
import { hashPassword } from "@/utils/bcrypt";
import { errorHandler, CustomError } from "@/utils/errorHandler";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {


  try {
    const payload = await req.json();

    if (!payload.email) throw new CustomError("email is required", 400);

    const existCompany = await company.findOne({ email: payload.email });
    if (existCompany) throw new CustomError("Company already exists", 403);

    if (!payload.password) throw new CustomError("password is required", 400);

    payload.password = await hashPassword(payload.password);
    await new company(payload).save();

    const token = jwt.sign({ email: payload.email }, process.env.JWT_SECRET || "secret");

    NextResponse.json({
      status: true,
      data: { token },
    });
  } catch (err) {
    console.log("hiee:", err)
    NextResponse.json(errorHandler(err))
  }
}
