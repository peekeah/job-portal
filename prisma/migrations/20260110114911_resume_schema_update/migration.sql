/*
  Warnings:

  - You are about to drop the column `resume_url` on the `Applicant` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ResumeType" AS ENUM ('pdf', 'json');

-- AlterTable
ALTER TABLE "Applicant" DROP COLUMN "resume_url";

-- CreateTable
CREATE TABLE "Resume" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "ResumeType" NOT NULL DEFAULT 'pdf',
    "url" TEXT,
    "json" JSONB,
    "applicant_id" TEXT NOT NULL,

    CONSTRAINT "Resume_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Resume" ADD CONSTRAINT "Resume_applicant_id_fkey" FOREIGN KEY ("applicant_id") REFERENCES "Applicant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
