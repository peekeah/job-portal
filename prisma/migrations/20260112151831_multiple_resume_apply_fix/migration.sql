/*
  Warnings:

  - Added the required column `applied_resume_id` to the `AppliedJob` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AppliedJob" ADD COLUMN     "applied_resume_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "AppliedJob" ADD CONSTRAINT "AppliedJob_applied_resume_id_fkey" FOREIGN KEY ("applied_resume_id") REFERENCES "Resume"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
