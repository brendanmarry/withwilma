-- AlterTable
ALTER TABLE "Candidate" ADD COLUMN     "matchGaps" JSONB,
ADD COLUMN     "matchStrengths" JSONB,
ADD COLUMN     "matchSummary" TEXT;
