import { NextRequest, NextResponse } from 'next/server';

import { authMiddleware } from '@/lib/auth-middleware';
import { prisma } from '@/lib/db';
import { errorHandler, CustomError } from '@/lib/errorHandler';
import { jobSchema } from '@/lib/schema';

export async function GET(req: NextRequest) {
  try {
    const token = await authMiddleware(req);

    let jobs;
    if (token.user_type === 'applicant') {
      const applicant = await prisma.applicant.findFirstOrThrow({
        where: { email: token.email },
      });

      jobs = await prisma.job.findMany({
        include: {
          company: true,
        },
        where: {
          NOT: {
            applied_jobs: {
              some: {
                applicant_id: applicant.id,
              },
            },
          },
        },
      });
    } else {
      jobs = await prisma.job.findMany({
        include: {
          company: true,
        },
      });
    }

    return NextResponse.json({ status: true, data: jobs });
  } catch (err) {
    const [resp, status] = errorHandler(err);
    return NextResponse.json(resp, status);
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = await authMiddleware(req, 'company');
    const rawPayload = await req.json();
    const payload = jobSchema.parse(rawPayload);

    const companyData = await prisma.company.findFirst({
      where: { email: token.email },
    });

    if (!companyData) throw new CustomError('Company not found', 403);

    await prisma.job.create({
      data: {
        ...payload,
        company_id: companyData.id,
      },
    });

    return NextResponse.json(
      { status: true, data: 'successfully posted job' },
      { status: 201 },
    );
  } catch (err) {
    const [resp, status] = errorHandler(err);
    return NextResponse.json(resp, status);
  }
}
