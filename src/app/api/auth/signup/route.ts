import jwt from "jsonwebtoken";
import student from "@/models/student";
import { hashPassword } from "@/utils/bcrypt";
import { errorHandler, CustomError } from "@/utils/errorHandler";
import company from "@/models/company";
import { NextRequest, NextResponse } from "next/server";
import user from "@/models/user";
import { connectToDatabase } from "@/utils/db"

export async function POST(req: NextRequest) {

  try {
    await connectToDatabase()
    const { email, password, userType, ...rest } = await req.json();

    if (!email) throw new CustomError("Email is required", 400);
    if (!password) throw new CustomError("Password is required", 400);

    const existUser = await user.findOne({ email });
    if (existUser) throw new CustomError("user already exists", 403);

    const hashedPassword = await hashPassword(password);

    if (userType === "student") {
      // student signup
      // #TODO: Implement transaction
      await new user({ email, password: hashedPassword, userType: "student" }).save()
      await new student({ email, password: hashedPassword, ...rest }).save()

      const token = jwt.sign({ email }, process.env.JWT_SECRET || "secret");

      return NextResponse.json({
        status: true,
        data: { token },
      }, { status: 201 });
    } else {
      // company signup
      await new user({ email, password: hashedPassword, userType: "company" }).save();
      await new company({ email, password: hashedPassword, ...rest }).save()

      const token = jwt.sign({ email }, process.env.JWT_SECRET || "secret");

      return NextResponse.json({
        status: true,
        data: { token },
      }, { status: 201 });
    }
  } catch (err) {
    const [resp, status] = errorHandler(err)
    return NextResponse.json(resp, status)
  }
}

