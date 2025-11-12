-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('open', 'closed');

-- CreateEnum
CREATE TYPE "JobSourceType" AS ENUM ('crawl', 'upload', 'manual');

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "jobSourceId" TEXT,
ADD COLUMN     "sourceUrl" TEXT,
ADD COLUMN     "status" "JobStatus" NOT NULL DEFAULT 'open';

-- CreateTable
CREATE TABLE "JobSource" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "type" "JobSourceType" NOT NULL DEFAULT 'crawl',
    "url" TEXT NOT NULL,
    "label" TEXT,
    "lastFetchedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobDocument" (
    "id" TEXT NOT NULL,
    "jobId" TEXT,
    "documentId" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "JobSource_organisationId_url_key" ON "JobSource"("organisationId", "url");

-- CreateIndex
CREATE UNIQUE INDEX "JobDocument_jobId_documentId_key" ON "JobDocument"("jobId", "documentId");

-- CreateIndex
CREATE INDEX "Job_jobSourceId_idx" ON "Job"("jobSourceId");

-- CreateIndex
CREATE UNIQUE INDEX "Job_organisationId_title_location_key" ON "Job"("organisationId", "title", "location");

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_jobSourceId_fkey" FOREIGN KEY ("jobSourceId") REFERENCES "JobSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSource" ADD CONSTRAINT "JobSource_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobDocument" ADD CONSTRAINT "JobDocument_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobDocument" ADD CONSTRAINT "JobDocument_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

