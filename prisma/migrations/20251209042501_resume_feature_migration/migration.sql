/*
  Warnings:

  - You are about to drop the column `collegeId` on the `Applicant` table. All the data in the column will be lost.
  - You are about to drop the column `applicantId` on the `AppliedJob` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `companyId` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the `College` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `applicant_id` to the `AppliedJob` table without a default value. This is not possible if the table is not empty.
  - Added the required column `address` to the `Company` table without a default value. This is not possible if the table is not empty.
  - Added the required column `company_id` to the `Job` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Applicant" DROP CONSTRAINT "Applicant_collegeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."AppliedJob" DROP CONSTRAINT "AppliedJob_applicantId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Job" DROP CONSTRAINT "Job_companyId_fkey";

-- AlterTable
ALTER TABLE "Applicant" DROP COLUMN "collegeId",
ADD COLUMN     "college_branch" TEXT,
ADD COLUMN     "college_joining_year" TEXT,
ADD COLUMN     "college_name" TEXT,
ADD COLUMN     "resume_url" TEXT,
ALTER COLUMN "mobile" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "AppliedJob" DROP COLUMN "applicantId",
ADD COLUMN     "applicant_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Company" DROP COLUMN "state",
ADD COLUMN     "address" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Job" DROP COLUMN "companyId",
ADD COLUMN     "company_id" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."College";

-- DropTable
DROP TABLE "public"."User";

-- CreateTable
CREATE TABLE "Auth" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "user_type" "UserType" NOT NULL DEFAULT 'applicant',
    "user_id" TEXT,
    "reset_hash" TEXT,

    CONSTRAINT "Auth_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Auth_email_key" ON "Auth"("email");

-- AddForeignKey
ALTER TABLE "AppliedJob" ADD CONSTRAINT "AppliedJob_applicant_id_fkey" FOREIGN KEY ("applicant_id") REFERENCES "Applicant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
