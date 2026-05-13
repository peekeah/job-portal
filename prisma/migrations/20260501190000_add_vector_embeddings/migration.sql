-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateTable
CREATE TABLE "ResumeEmbedding" (
    "id" TEXT NOT NULL,
    "resume_id" TEXT NOT NULL,
    "embedding" vector(1536) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResumeEmbedding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobEmbedding" (
    "id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "embedding" vector(1536) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobEmbedding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ResumeEmbedding_resume_id_key" ON "ResumeEmbedding"("resume_id");

-- CreateIndex
CREATE UNIQUE INDEX "JobEmbedding_job_id_key" ON "JobEmbedding"("job_id");

-- AddForeignKey
ALTER TABLE "ResumeEmbedding" ADD CONSTRAINT "ResumeEmbedding_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobEmbedding" ADD CONSTRAINT "JobEmbedding_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
