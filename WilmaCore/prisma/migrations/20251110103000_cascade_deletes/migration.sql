-- Update foreign keys to cascade deletes when an organisation or job is removed

-- Document -> Organisation
ALTER TABLE "Document" DROP CONSTRAINT IF EXISTS "Document_organisationId_fkey";
ALTER TABLE "Document"
  ADD CONSTRAINT "Document_organisationId_fkey"
  FOREIGN KEY ("organisationId")
  REFERENCES "Organisation"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- FAQ -> Organisation
ALTER TABLE "FAQ" DROP CONSTRAINT IF EXISTS "FAQ_organisationId_fkey";
ALTER TABLE "FAQ"
  ADD CONSTRAINT "FAQ_organisationId_fkey"
  FOREIGN KEY ("organisationId")
  REFERENCES "Organisation"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- Job -> Organisation
ALTER TABLE "Job" DROP CONSTRAINT IF EXISTS "Job_organisationId_fkey";
ALTER TABLE "Job"
  ADD CONSTRAINT "Job_organisationId_fkey"
  FOREIGN KEY ("organisationId")
  REFERENCES "Organisation"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- DocumentChunk -> Document
ALTER TABLE "DocumentChunk" DROP CONSTRAINT IF EXISTS "DocumentChunk_documentId_fkey";
ALTER TABLE "DocumentChunk"
  ADD CONSTRAINT "DocumentChunk_documentId_fkey"
  FOREIGN KEY ("documentId")
  REFERENCES "Document"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- Candidate -> Job
ALTER TABLE "Candidate" DROP CONSTRAINT IF EXISTS "Candidate_jobId_fkey";
ALTER TABLE "Candidate"
  ADD CONSTRAINT "Candidate_jobId_fkey"
  FOREIGN KEY ("jobId")
  REFERENCES "Job"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- FollowUpQuestion -> Candidate
ALTER TABLE "FollowUpQuestion" DROP CONSTRAINT IF EXISTS "FollowUpQuestion_candidateId_fkey";
ALTER TABLE "FollowUpQuestion"
  ADD CONSTRAINT "FollowUpQuestion_candidateId_fkey"
  FOREIGN KEY ("candidateId")
  REFERENCES "Candidate"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- VideoAnswer -> Candidate
ALTER TABLE "VideoAnswer" DROP CONSTRAINT IF EXISTS "VideoAnswer_candidateId_fkey";
ALTER TABLE "VideoAnswer"
  ADD CONSTRAINT "VideoAnswer_candidateId_fkey"
  FOREIGN KEY ("candidateId")
  REFERENCES "Candidate"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- VideoAnswer -> FollowUpQuestion
ALTER TABLE "VideoAnswer" DROP CONSTRAINT IF EXISTS "VideoAnswer_followupQuestionId_fkey";
ALTER TABLE "VideoAnswer"
  ADD CONSTRAINT "VideoAnswer_followupQuestionId_fkey"
  FOREIGN KEY ("followupQuestionId")
  REFERENCES "FollowUpQuestion"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

