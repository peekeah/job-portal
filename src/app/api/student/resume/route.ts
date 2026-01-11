import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { errorHandler, CustomError } from "@/lib/errorHandler";
import { authMiddleware } from "@/lib/token";
import { prisma } from "@/lib/db";

async function postResume(req: NextRequest) {
  try {

    const token = await authMiddleware(req, "applicant");

    const formData = await req.formData();
    const file = formData.get("resume") as File;

    if (!file) {
      throw new CustomError("No file provided", 400);
    }

    // Validate file type
    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!validTypes.includes(file.type)) {
      throw new CustomError("Only PDF and Word documents are allowed", 400);
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new CustomError("File size must be less than 5MB", 400);
    }

    // Get existing student data to check for old resume
    const student = await prisma.applicant.findUnique({
      where: { email: token.email },
    });

    if (!student) {
      throw new CustomError("Student not found", 404);
    }

    // Generate unique filename
    const filename = `${student.id}-${Date.now()}-${file.name}`;
    const uploadDir = path.join(process.cwd(), "public/resumes");
    const filepath = path.join(uploadDir, filename);
    const publicUrl = path.join("/resumes", filename)

    // Create directory if it doesn't exist
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (err) {
      console.error("Error creating directory:", err);
    }

    // Save file
    const bytes = await file.arrayBuffer();
    await writeFile(filepath, Buffer.from(bytes));

    // Update database
    const newResume = await prisma.resume.create({
      data: {
        title: filename,
        type: "pdf",
        url: publicUrl,
        applicant_id: student.id
      }
    })

    return NextResponse.json(
      { status: true, data: newResume },
      { status: 200 }
    );
  } catch (err) {
    const [res, status] = errorHandler(err);
    return NextResponse.json(res, status);
  }
}

export const POST = postResume;
