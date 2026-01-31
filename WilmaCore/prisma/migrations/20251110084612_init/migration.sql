-- CreateEnum
CREATE TYPE "DocumentSourceType" AS ENUM ('upload', 'crawl', 'news');

-- CreateTable
CREATE TABLE "Organisation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rootUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organisation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "sourceType" "DocumentSourceType" NOT NULL,
    "sourceUrl" TEXT,
    "mimeType" TEXT,
    "textContent" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FAQ" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "recruiterApproved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FAQ_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "department" TEXT,
    "location" TEXT,
    "employmentType" TEXT,
    "description" TEXT NOT NULL,
    "normalizedJson" JSONB,
    "embedding" JSONB,
    "wilmaEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Candidate" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "linkedin" TEXT,
    "linkedinPhotoUrl" TEXT,
    "cvUrl" TEXT,
    "matchScore" INTEGER,
    "summary" TEXT,
    "extractedSkills" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Candidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FollowUpQuestion" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "reason" TEXT,
    "competencyTargeted" TEXT,
    "transcript" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FollowUpQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoAnswer" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "followupQuestionId" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "transcript" TEXT,
    "analysis" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VideoAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentChunk" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "chunkId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "metadata" JSONB,
    "embedding" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentChunk_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Document_organisationId_idx" ON "Document"("organisationId");

-- CreateIndex
CREATE INDEX "Job_organisationId_idx" ON "Job"("organisationId");

-- CreateIndex
CREATE INDEX "Job_wilmaEnabled_idx" ON "Job"("wilmaEnabled");

-- CreateIndex
CREATE INDEX "Candidate_jobId_idx" ON "Candidate"("jobId");

-- CreateIndex
CREATE INDEX "DocumentChunk_documentId_idx" ON "DocumentChunk"("documentId");

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FAQ" ADD CONSTRAINT "FAQ_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUpQuestion" ADD CONSTRAINT "FollowUpQuestion_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoAnswer" ADD CONSTRAINT "VideoAnswer_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoAnswer" ADD CONSTRAINT "VideoAnswer_followupQuestionId_fkey" FOREIGN KEY ("followupQuestionId") REFERENCES "FollowUpQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentChunk" ADD CONSTRAINT "DocumentChunk_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
