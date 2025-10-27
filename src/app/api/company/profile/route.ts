import { getToken } from "@/lib/token";
import company from "@/models/company";
import { hashPassword } from "@/utils/bcrypt";
import { CustomError, errorHandler } from "@/utils/errorHandler";
import { NextRequest, NextResponse } from "next/server";

async function getProfile(req: NextRequest) {
  try {

    const token = await getToken(req)

    if (!token) {
      throw new CustomError("Unauthenticated", 401)
    }

    const companyData = await company.findOne({ email: token?.email }).select("-password");
    if (!companyData) throw new CustomError("Company not found", 404);

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

    const token = await getToken(req)

    if (!token) {
      throw new CustomError("Unauthenticated", 401)
    }

    const body = await req.json()

    if (body.password) {
      body.password = await hashPassword(body.password);
    }

    console.log("dd:", body)

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

