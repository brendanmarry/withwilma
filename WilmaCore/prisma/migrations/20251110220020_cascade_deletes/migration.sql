-- DropForeignKey
ALTER TABLE "Candidate" DROP CONSTRAINT "Candidate_jobId_fkey";

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_organisationId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentChunk" DROP CONSTRAINT "DocumentChunk_documentId_fkey";

-- DropForeignKey
ALTER TABLE "FAQ" DROP CONSTRAINT "FAQ_organisationId_fkey";

-- DropForeignKey
ALTER TABLE "FollowUpQuestion" DROP CONSTRAINT "FollowUpQuestion_candidateId_fkey";

-- DropForeignKey
ALTER TABLE "Job" DROP CONSTRAINT "Job_organisationId_fkey";

-- DropForeignKey
ALTER TABLE "VideoAnswer" DROP CONSTRAINT "VideoAnswer_candidateId_fkey";

-- DropForeignKey
ALTER TABLE "VideoAnswer" DROP CONSTRAINT "VideoAnswer_followupQuestionId_fkey";

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
