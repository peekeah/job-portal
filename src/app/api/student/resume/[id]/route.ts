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
      throw new CustomError('Unauthorized', 401);
    }

    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, applicant_id: student.id },
      include: {
        _count: {
          select: { appliedJobs: true },
        },
      },
    });

    if (!resume) throw new CustomError('Resume not found', 404);

    if (resume._count.appliedJobs > 0) {
      throw new CustomError(
        'Cannot delete resume that has been used for job applications',
        409,
      );
    }

    // Fetch remaining resumes before deletion (excluding the one being deleted)
    const remainingResumes = await prisma.resume.findMany({
      where: {
        applicant_id: student.id,
        id: { not: resumeId },
      },
      orderBy: { created_at: 'desc' },
    });

    // Delete file from UploadThing if it exists
    if (resume.url) {
      const fileKey = resume.url.split('/f/')[1];
      if (fileKey) await utapi.deleteFiles(fileKey);
    }

    // Delete resume and update active_resume_id atomically
    await prisma.$transaction([
      prisma.resume.delete({
        where: {
          id: resumeId,
          applicant_id: student.id,
        },
      }),
      prisma.applicant.update({
        where: { id: student.id },
        data: { active_resume_id: remainingResumes[0]?.id ?? null },
      }),
    ]);

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
