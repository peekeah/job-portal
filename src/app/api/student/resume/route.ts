import { NextRequest, NextResponse } from 'next/server';
import { errorHandler, CustomError } from '@/lib/errorHandler';
import { authMiddleware } from '@/lib/auth-middleware';
import { prisma } from '@/lib/db';
import { UTApi } from 'uploadthing/server';

const utapi = new UTApi();

async function postResume(req: NextRequest) {
  try {
    const token = await authMiddleware(req, 'applicant');

    const formData = await req.formData();
    const file = formData.get('resume') as File;

    if (!file) {
      throw new CustomError('No file provided', 400);
    }

    // Allowed types
    const validTypes = ['application/pdf'];

    if (!validTypes.includes(file.type)) {
      throw new CustomError('Only PDF documents are allowed', 400);
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new CustomError('File size must be less than 5MB', 400);
    }

    const student = await prisma.applicant.findUnique({
      where: { email: token.email },
    });

    if (!student) {
      throw new CustomError('Student not found', 404);
    }

    const response = await utapi.uploadFiles(file);

    if (response.error) {
      throw new CustomError('Failed to upload file', 500);
    }

    const filename = `${student.id}-${Date.now()}-${file.name}`;

    const newResume = await prisma.resume.create({
      data: {
        title: filename,
        type: 'pdf',
        url: response.data.ufsUrl,
        applicant_id: student.id,
      },
    });

    return NextResponse.json(
      { status: true, data: newResume },
      { status: 200 },
    );
  } catch (err) {
    const [res, status] = errorHandler(err);
    return NextResponse.json(res, status);
  }
}

export const POST = postResume;
