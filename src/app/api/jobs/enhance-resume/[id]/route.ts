import { NextRequest, NextResponse } from 'next/server';

import { authMiddleware } from '@/lib/auth-middleware';
import { prisma } from '@/lib/db';
import { CustomError, errorHandler } from '@/lib/errorHandler';
import { groupTextItemsIntoLines } from '@/lib/resume-parser/group-text-items-into-lines';
import { groupLinesIntoSections } from '@/lib/resume-parser/group-lines-into-sections';
import { extractResumeFromSections } from '@/lib/resume-parser/extract-resume-from-sections';
import { readPdf } from '@/lib/resume-parser/read-pdf';
import { callLLm } from '@/lib/ai';
import { getResumeBuilderPrompt } from '@/constant/ai-prompts';
import { initialResume, Resume } from '@/mock/resume';
import { generateResumeEmbedding } from '@/lib/embeddings';
import { vectorStorage } from '@/lib/vector-storage';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: jobId } = await params;
    if (!jobId) throw new CustomError('Job id missing', 400);

    const token = await authMiddleware(req, 'applicant');

    const applicant = await prisma.applicant.findUnique({
      where: { email: token.email },
      include: { resume: true },
    });
    if (!applicant) throw new CustomError('Applicant not found', 404);

    // Validate job exists
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new CustomError('Job not found', 404);

    // validate if jobs is applied
    const isApplied = await prisma.appliedJob.findFirst({
      where: {
        jobId,
        applicant_id: applicant.id,
      },
    });

    if (isApplied) {
      throw new CustomError('You already applied for this job', 403);
    }

    const existResume = await prisma.resume.findFirst({
      where: {
        type: 'pdf',
        applicant_id: applicant.id,
      },
    });

    if (!existResume?.url) {
      throw new CustomError(
        'Resume is not uploaded, upload the resume first',
        403,
      );
    }

    const pdfContent = await readPdf(existResume?.url);

    // Resume parser: Parse the resume & exctract the content
    const lines = groupTextItemsIntoLines(pdfContent);
    const sections = groupLinesIntoSections(lines);
    const resume = extractResumeFromSections(sections);

    const profile = { ...resume.profile };
    resume.profile = { ...initialResume.profile };
    resume.profile.summary = profile.summary;

    const llmInput = getResumeBuilderPrompt(
      JSON.stringify(resume),
      job.description,
    );

    const response = await callLLm(llmInput, 'gpt-5.2', 0.3, 0.85);

    let output = response.output[0].content[0].text;
    const cleanedOutput = output
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    const extractJsonPayload = (text: string) => {
      const firstBrace = text.indexOf('{');
      const firstBracket = text.indexOf('[');
      const startIndex = [firstBrace, firstBracket]
        .filter((index) => index !== -1)
        .sort((a, b) => a - b)[0];

      if (startIndex === undefined) return text;

      const endBrace = text.lastIndexOf('}');
      const endBracket = text.lastIndexOf(']');
      const endIndex = Math.max(endBrace, endBracket);

      return endIndex > startIndex ? text.slice(startIndex, endIndex + 1) : text;
    };

    let enhancedResume: Resume;
    try {
      enhancedResume = JSON.parse(extractJsonPayload(cleanedOutput)) as Resume;
    } catch (_err) {
      throw new CustomError('LLM returned unparseable response', 502);
    }

    enhancedResume.profile.name = profile.name;
    enhancedResume.profile.email = profile.email;
    enhancedResume.profile.phone = profile.phone;
    enhancedResume.profile.url = profile.url;
    enhancedResume.profile.location = profile.location;

    const resumeTitle = existResume.title.replace('.pdf', '') + Date.now();

    const resumeEmbedding = await generateResumeEmbedding(enhancedResume);

    // Save in the DB
    const dbRes = await prisma.$transaction(async (tx) => {
      const newResume = await tx.resume.create({
        data: {
          title: resumeTitle,
          type: 'json',
          json: JSON.stringify(enhancedResume),
          applicant_id: applicant.id,
        },
      });

      await vectorStorage.storeResumeEmbedding(
        newResume.id,
        resumeEmbedding,
        tx,
      );

      return newResume;
    });

    return NextResponse.json({ status: true, data: dbRes });
  } catch (err) {
    const [resBody, status] = errorHandler(err);
    return NextResponse.json(resBody, status);
  }
}
