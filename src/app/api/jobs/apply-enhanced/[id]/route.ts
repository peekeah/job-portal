import { NextRequest, NextResponse } from "next/server";

import { authMiddleware } from "@/lib/token";
import { prisma } from "@/lib/db";
import { CustomError, errorHandler } from "@/lib/errorHandler";
import { groupTextItemsIntoLines } from "@/lib/resume-parser/group-text-items-into-lines";
import { groupLinesIntoSections } from "@/lib/resume-parser/group-lines-into-sections";
import { extractResumeFromSections } from "@/lib/resume-parser/extract-resume-from-sections";
import { readPdf } from "@/lib/resume-parser/read-pdf";
import path from "node:path";
import { callLLm } from "@/lib/ai";
import { getResumeBuilderPrompt } from "@/constant/ai-prompts";
import { initialResume, Resume } from "@/mock/resume";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params;
    if (!jobId) throw new CustomError("Job id missing", 400);

    const token = await authMiddleware(req, "applicant");

    const applicant = await prisma.applicant.findUnique({
      where: { email: token.email },
    });
    if (!applicant) throw new CustomError("Applicant not found", 404);

    // Validate existing resume
    if (!applicant.resume_url) {
      throw new CustomError(
        "No resume uploaded. Please upload a resume first.",
        400
      );
    }

    // Validate job exists
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new CustomError("Job not found", 404);

    const fileFsPath = path.join(process.cwd(), "public", applicant.resume_url);

    if (!applicant.resume_url.toLowerCase().endsWith(".pdf")) {
      throw new CustomError("Enhancement supports PDF resumes only.", 400);
    }

    const pdfContent = await readPdf(fileFsPath);

    // Resume parser: Parse the resume & exctract the content
    const lines = groupTextItemsIntoLines(pdfContent);
    const sections = groupLinesIntoSections(lines);
    const resume = extractResumeFromSections(sections);

    const profile = { ...resume.profile }
    resume.profile = { ...initialResume.profile }
    resume.profile.summary = profile.summary

    const llmInput = getResumeBuilderPrompt(JSON.stringify(resume), job.description)

    // #TODO: Make AI call for enhancement
    const response = await callLLm(llmInput)
    let output = response.output[0].content[0].text;
    output = output.replace("```json", "").replace("```", "")

    const enhancedResume = JSON.parse(output) as Resume
    enhancedResume.profile.name = profile.name
    enhancedResume.profile.email = profile.email
    enhancedResume.profile.phone = profile.phone
    enhancedResume.profile.url = profile.url
    enhancedResume.profile.location = profile.location

    return NextResponse.json({ status: true, data: enhancedResume });
  } catch (err) {
    console.log("ee:", err)
    const [resBody, status] = errorHandler(err);
    return NextResponse.json(resBody, status);
  }
}
