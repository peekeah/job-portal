import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, readFile } from "fs/promises";
import path from "path";

import { authMiddleware } from "@/lib/token";
import { prisma } from "@/lib/db";
import { CustomError, errorHandler } from "@/lib/errorHandler";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: jobId } = await params;
    if (!jobId) throw new CustomError("Job id missing", 400);

    const token = await authMiddleware(req, "applicant");
    const body = await req.json().catch(() => ({}));
    const enhance = !!body?.enhance;

    const applicant = await prisma.applicant.findUnique({
      where: { email: token.email },
    });
    if (!applicant) throw new CustomError("Applicant not found", 404);

    // Validate existing resume
    if (!applicant.resume_url) {
      throw new CustomError("No resume uploaded. Please upload a resume first.", 400);
    }

    // Validate job exists
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new CustomError("Job not found", 404);

    // Determine resume to use
    let resumeUrlToUse: string = applicant.resume_url;

    if (enhance) {
      if (!applicant.resume_url.toLowerCase().endsWith(".pdf")) {
        throw new CustomError("Enhancement supports PDF resumes only.", 400);
      }

      // Map public URL to filesystem path
      const publicRelative = applicant.resume_url.startsWith("/")
        ? applicant.resume_url.substring(1)
        : applicant.resume_url;
      const fileFsPath = path.join(process.cwd(), "public", publicRelative);
      const pdfBytes = await readFile(fileFsPath);

      // Call internal mock process API to enhance PDF
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
      const res = await fetch(`${baseUrl}/api/student/process-resume`, {
        method: "POST",
        headers: { "Content-Type": "application/pdf" },
        body: pdfBytes,
      });
      if (!res.ok) throw new CustomError("Failed to enhance resume", 500);
      const enhancedBytes = new Uint8Array(await res.arrayBuffer());

      // Save enhanced PDF under public/resumes
      const uploadDir = path.join(process.cwd(), "public", "resumes");
      await mkdir(uploadDir, { recursive: true });
      const filename = `${applicant.id}-${Date.now()}-enhanced.pdf`;
      const filepath = path.join(uploadDir, filename);
      await writeFile(filepath, enhancedBytes);
      resumeUrlToUse = `/resumes/${filename}`;
    }

    // Upsert or update application record
    const existing = await prisma.appliedJob.findFirst({
      where: { applicant_id: applicant.id, jobId },
    });

    let application;
    if (!existing) {
      application = await prisma.appliedJob.create({
        data: {
          applicant_id: applicant.id,
          jobId,
          status: "applied",
          resume_url_used: resumeUrlToUse,
        },
      });
    } else {
      application = await prisma.appliedJob.update({
        where: { id: existing.id },
        data: {
          status: "applied",
          resume_url_used: resumeUrlToUse,
        },
      });
    }

    return NextResponse.json({ status: true, data: application });
  } catch (err) {
    const [resBody, status] = errorHandler(err);
    return NextResponse.json(resBody, status);
  }
}
