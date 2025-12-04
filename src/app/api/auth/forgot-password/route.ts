import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import crypto from "crypto";
import { Resend } from "resend";

import { CustomError, errorHandler } from "@/lib/errorHandler";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/bcrypt";
import { signToken } from "@/lib/jwt";

function getEmailText(name: string, hash: string) {
  const CLIENT_HOST = process.env.CLIENT_HOST || "http://localhost:3000";
  const resetLink = CLIENT_HOST + "/reset-password?token=" + hash;

  return `Hi ${name},\nPlease find reset link below to reset the password\n${resetLink}`;
}

const payloadSchema = z.object({
  email: z.string(),
});

async function forgotPassword(req: NextRequest) {
  try {
    const payload = await req.json();
    const { email } = payloadSchema.parse(payload);

    const existUser = await prisma.auth.findFirst({
      where: {
        email,
      },
    });

    if (!existUser) {
      throw new CustomError("user doest not exist", 403);
    }

    // Generate random password
    const token = signToken({ email: existUser.email });

    // save in the db
    await prisma.auth.update({
      data: { reset_hash: token },
      where: { email },
    });

    let userName = "User";

    if (existUser.user_type === "applicant") {
      const userData = await prisma.applicant.findFirst({
        where: { email },
      });

      userName = userData?.name || userName;
    } else {
      const userData = await prisma.company.findFirst({
        where: { email },
      });

      userName = userData?.name || userName;
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "testmail9174@gmail.com",
      subject: "Password Reset Link",
      text: getEmailText(userName, token),
    });

    if (error) {
      throw new CustomError("error password reset", 500);
    }

    return NextResponse.json({
      status: true,
      data: "successfully sent password to email",
    });
  } catch (err) {
    console.log("ee:", err);

    const [resp, status] = errorHandler(err);
    return NextResponse.json(resp, status);
  }
}

export const POST = forgotPassword;
