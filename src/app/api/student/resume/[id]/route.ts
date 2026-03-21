import { prisma } from '@/lib/db';
import { CustomError, errorHandler } from '@/lib/errorHandler';
import { authMiddleware } from '@/lib/auth-middleware';
import { NextRequest, NextResponse } from 'next/server';
import { UTApi } from 'uploadthing/server';

const utapi = new UTApi();

async function deleteResume(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const resumeId = (await params).id;
    const token = await authMiddleware(req, 'applicant');

    const student = await prisma.applicant.findFirst({
      where: {
        email: token.email,
      },
    });

    if (!student) {
      throw new CustomError('Unauthoriaed', 409);
    }

    const whereQuery = student.active_resume_id
      ? { id: student.active_resume_id }
      : { applicant_id: student.id };

    const resume = await prisma.resume.findFirst({
      where: whereQuery,
      orderBy: { created_at: 'desc' },
      include: {
        _count: {
          select: { appliedJobs: true }, // check if resume is used in any applications
        },
      },
    });

    if (!resume) throw new CustomError('Resume not found', 404);

    // Block deletion if resume is linked to any job applications
    if (resume._count.appliedJobs > 0) {
      throw new CustomError(
        'Cannot delete resume that has been used for job applications',
        409,
      );
    }

    if (resume.url) {
      const fileKey = resume.url.split('/f/')[1];
      if (fileKey) await utapi.deleteFiles(fileKey);
    }

    await prisma.resume.delete({
      where: {
        id: resumeId,
        applicant_id: student.id,
      },
    });

    return NextResponse.json(
      { status: true, data: 'successfully deleted resume' },
      { status: 200 },
    );
  } catch (err) {
    const [res, status] = errorHandler(err);
    return NextResponse.json(res, status);
  }
}

export const DELETE = deleteResume;
