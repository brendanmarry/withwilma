-- Add reviewedAt column to Candidate for tracking first review time
ALTER TABLE "Candidate"
ADD COLUMN "reviewedAt" TIMESTAMP(3);

