import { NextRequest, NextResponse } from 'next/server';

import { hashPassword } from '@/lib/bcrypt';
import { errorHandler, CustomError } from '@/lib/errorHandler';
import { authMiddleware } from '@/lib/auth-middleware';
import { prisma } from '@/lib/db';

async function getProfile(req: NextRequest) {
  try {
    const token = await authMiddleware(req, 'applicant');

    const studentData = await prisma.applicant.findUnique({
      where: {
        email: token?.email,
      },
      include: {
        resume: true,
      },
    });

    if (!studentData) throw new CustomError('Student not found', 404);

    return NextResponse.json({ status: true, data: studentData });
  } catch (err) {
    const [res, status] = errorHandler(err);
    return NextResponse.json(res, status);
  }
}

async function postProfile(req: NextRequest) {
  try {
    const token = await authMiddleware(req, 'applicant');
    const body = await req.json();

    const {
      name,
      mobile,
      bio,
      location,
      profile_pic,
      college_name,
      college_branch,
      college_joining_year,
    } = body;

    let hashedPassword = '';

    if (body.password) {
      hashedPassword = await hashPassword(body.password);
    }

    const profileData = {
      ...(name && { name }),
      ...(mobile && { mobile }),
      ...(location && { location }),
      ...(bio && { bio }),
      ...(profile_pic && { profile_pic }),
      ...(college_name && { college_name }),
      ...(college_branch && { college_branch }),
      ...(college_joining_year && { college_joining_year }),
      ...(profile_pic && { profile_pic }),
    };

    const updated = await prisma.applicant.update({
      where: {
        email: token.email,
      },
      data: profileData,
    });

    if (hashedPassword) {
      await prisma.auth.update({
        where: { id: token.id },
        data: { password: hashedPassword },
      });
    }

    return NextResponse.json({ status: true, data: updated });
  } catch (err) {
    const [res, status] = errorHandler(err);
    return NextResponse.json(res, status);
  }
}

export const GET = getProfile;
export const POST = postProfile;
