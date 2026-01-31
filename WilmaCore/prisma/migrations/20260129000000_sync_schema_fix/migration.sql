-- AlterTable
ALTER TABLE "Candidate" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'new';

-- AlterTable
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "layoutConfig" JSONB;

-- AlterTable
ALTER TABLE "Organisation" ADD COLUMN IF NOT EXISTS "careersPageUrl" TEXT,
ADD COLUMN IF NOT EXISTS "jobParsingConfig" JSONB;