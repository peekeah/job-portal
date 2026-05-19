import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { errorHandler, CustomError } from '@/lib/errorHandler';
import { authMiddleware } from '@/lib/auth-middleware';
import { prisma } from '@/lib/db';
import { UTApi } from 'uploadthing/server';
import { parseResumeFromPdf } from '@/lib/resume-parser';
import { generateSectionalEmbeddings } from '@/lib/embeddings';
import { vectorStorage } from '@/lib/vector-storage';

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

    // Use transaction to ensure atomicity: upload -> parse -> embed -> commit
    const result = await prisma.$transaction(async (tx) => {
      // Create resume record
      const newResume = await tx.resume.create({
        data: {
          title: filename,
          type: 'pdf',
          url: response.data.ufsUrl,
          applicant_id: student.id,
        },
      });

      // Parse resume PDF to extract structured content
      let parsedResume: unknown;
      try {
        parsedResume = await parseResumeFromPdf(response.data.ufsUrl);
      } catch (_parseError) {
        throw new CustomError('Failed to parse resume PDF', 500);
      }

      // Store parsed JSON in resume record
      await tx.resume.update({
        where: { id: newResume.id },
        data: { json: parsedResume as Prisma.InputJsonValue },
      });

      // Generate sectional embeddings from parsed content
      let sectionalEmbeddings;
      try {
        sectionalEmbeddings = await generateSectionalEmbeddings(parsedResume);
      } catch (_embeddingError) {
        throw new CustomError('Failed to generate resume embeddings', 500);
      }

      // Store sectional embeddings using vector storage abstraction
      await vectorStorage.storeSectionalEmbeddings(newResume.id, sectionalEmbeddings, tx);

      // Update applicant's active resume if needed
      if (!student.active_resume_id) {
        await tx.applicant.update({
          where: { id: student.id },
          data: { active_resume_id: newResume.id },
        });
      }

      return newResume;
    });

    return NextResponse.json({ status: true, data: result }, { status: 200 });
  } catch (err) {
    const [res, status] = errorHandler(err);
    return NextResponse.json(res, status);
  }
}

export const POST = postResume;
