import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { UserType } from '@prisma/client';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { errorHandler } from '@/lib/errorHandler';
import { companySchema } from '@/lib/schema';
import { CustomError } from '@/lib/errors';

const applicantOnboardingSchema = z.object({
  name: z.string().min(1),
  mobile: z.string().min(10),
  college_name: z.string().min(1),
  college_branch: z.string().min(1),
  college_joining_year: z.string().min(4),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const { user_type, ...profileData } = payload;

    if (!Object.values(UserType).includes(user_type)) {
      throw new CustomError('Invalid user type', 400);
    }

    const result = await prisma.$transaction(async (tx) => {
      // Check if profile already exists to prevent duplicate creation error
      if (session.user.id) {
        const currentAuth = await tx.auth.findUnique({ where: { id: session.user.id } });
        if (currentAuth?.user_id) {
          throw new CustomError('Profile already exists', 400);
        }
      }

      let profile;

      if (user_type === UserType.applicant) {
        const validated = applicantOnboardingSchema.parse(profileData);
        profile = await tx.applicant.create({
          data: {
            ...validated,
            email: session.user.email!,
          },
        });
      } else if (user_type === UserType.company) {
        // Ensure founding_year is a number
        if (profileData.founding_year) {
          profileData.founding_year = Number(profileData.founding_year);
        }

        // Use session email to ensure it cannot be changed during onboarding
        profileData.email = session.user.email;
        
        const validated = companySchema.parse(profileData);
        profile = await tx.company.create({
          data: {
            ...validated,
          },
        });
      }

      if (!profile) {
        throw new CustomError('Failed to create profile', 500);
      }

      await tx.auth.update({
        where: { id: session.user.id },
        data: {
          user_id: profile.id,
          user_type: user_type,
        },
      });

      return profile;
    });

    return NextResponse.json({ status: true, data: result }, { status: 200 });
  } catch (err) {
    const [resp, status] = errorHandler(err);
    return NextResponse.json(resp, status);
  }
}
