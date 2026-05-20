-- CreateEnum
CREATE TYPE "ResumeSection" AS ENUM ('experience', 'skills', 'projects', 'education', 'summary', 'full');

-- AlterTable
ALTER TABLE "ResumeEmbedding"
ADD COLUMN "section" "ResumeSection" NOT NULL DEFAULT 'full',
ADD COLUMN "section_text" TEXT;

-- DropIndex
DROP INDEX "ResumeEmbedding_resume_id_key";

-- CreateIndex
CREATE UNIQUE INDEX "ResumeEmbedding_resume_id_section_key" ON "ResumeEmbedding"("resume_id", "section");
