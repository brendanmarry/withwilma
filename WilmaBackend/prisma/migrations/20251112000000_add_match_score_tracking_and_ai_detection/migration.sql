-- AlterTable
ALTER TABLE "Candidate" ADD COLUMN "originalMatchScore" INTEGER,
ADD COLUMN "updatedMatchScore" INTEGER,
ADD COLUMN "aiGeneratedDetected" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "VideoAnswer" ADD COLUMN "aiGeneratedDetected" BOOLEAN NOT NULL DEFAULT false;

