import { hashPassword } from '@/lib/bcrypt';
import { prisma } from '@/lib/db';
import { CustomError, errorHandler } from '@/lib/errorHandler';
import { verifyToken } from '@/lib/jwt';
import { JwtPayload } from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import z from 'zod';

const schema = z.object({
  token: z.string(),
  password: z.string().min(5).max(20),
});

const resetPassword = async (req: NextRequest) => {
  try {
    const rawPayload = await req.json();
    const payload = schema.parse(rawPayload);

    const token = verifyToken(payload.token) as JwtPayload;
    const email = token?.data?.email;

    if (!email) throw new Error('Invalid request');

    const user = await prisma.auth.findFirst({
      where: { email: token.email },
    });

    if (user?.reset_hash !== payload.token) {
      throw new CustomError(
        'Reset link expired, regenerate the reset link',
        403,
      );
    }

    const hashedPwd = await hashPassword(payload.password);

    await prisma.auth.update({
      data: { password: hashedPwd, reset_hash: null },
      where: { email },
    });

    return NextResponse.json({
      status: true,
      data: 'Successfully updated password',
    });
  } catch (err) {
    const [resp, status] = errorHandler(err);
    return NextResponse.json(resp, status);
  }
};

export const POST = resetPassword;
