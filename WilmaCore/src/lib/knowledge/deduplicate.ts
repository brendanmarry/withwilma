import { createHash } from "crypto";
import { prisma } from "@/lib/db";
import { computeQuestionHash, mergeAnswers } from "@/lib/knowledge/faq-utils";

type DeduplicateResult = {
  organisationId: string;
  removedDocuments: number;
  removedDocumentChunks: number;
  removedFaqs: number;
  updatedFaqs: number;
};

const hashText = (text: string): string =>
  createHash("sha256").update(text.trim()).digest("hex");

export const deduplicateOrganisationKnowledge = async (
  organisationId: string,
): Promise<DeduplicateResult> => {
  const [documents, faqs] = await Promise.all([
    prisma.document.findMany({
      where: { organisationId },
      select: {
        id: true,
        sourceType: true,
        sourceUrl: true,
        textContent: true,
        createdAt: true,
      },
    }),
    prisma.fAQ.findMany({
      where: { organisationId },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const docMap = new Map<string, { id: string; createdAt: Date }>();
  const docsToDelete: string[] = [];
  let removedChunksViaDocuments = 0;

  documents.forEach((doc) => {
    const key =
      doc.sourceUrl?.trim() && doc.sourceUrl.length > 8
        ? `${doc.sourceType ?? "unknown"}::${doc.sourceUrl.trim()}`
        : `${doc.sourceType ?? "unknown"}::${hashText(doc.textContent)}`;

    const existing = docMap.get(key);
    if (!existing) {
      docMap.set(key, { id: doc.id, createdAt: doc.createdAt });
    } else {
      // Keep the earliest document to preserve historical data
      if (existing.createdAt <= doc.createdAt) {
        docsToDelete.push(doc.id);
      } else {
        docsToDelete.push(existing.id);
        docMap.set(key, { id: doc.id, createdAt: doc.createdAt });
      }
    }
  });

  if (docsToDelete.length) {
    removedChunksViaDocuments += await prisma.documentChunk.count({
      where: { documentId: { in: docsToDelete } },
    });

    await prisma.document.deleteMany({
      where: { id: { in: docsToDelete } },
    });
  }

  const chunks = await prisma.documentChunk.findMany({
    where: { document: { organisationId } },
    select: {
      id: true,
      documentId: true,
      chunkId: true,
      text: true,
      metadata: true,
      createdAt: true,
    },
  });

  const chunkMap = new Map<string, { id: string; createdAt: Date }>();
  const chunksToDelete: string[] = [];

  chunks.forEach((chunk) => {
    const metadataSignature = chunk.metadata
      ? JSON.stringify(chunk.metadata)
      : "";
    const key = [
      chunk.documentId,
      (chunk.chunkId ?? "").toLowerCase(),
      hashText(chunk.text ?? ""),
      metadataSignature ? hashText(metadataSignature) : "",
    ].join("::");

    const existing = chunkMap.get(key);
    if (!existing) {
      chunkMap.set(key, { id: chunk.id, createdAt: chunk.createdAt });
      return;
    }

    if (existing.createdAt <= chunk.createdAt) {
      chunksToDelete.push(chunk.id);
    } else {
      chunksToDelete.push(existing.id);
      chunkMap.set(key, { id: chunk.id, createdAt: chunk.createdAt });
    }
  });

  if (chunksToDelete.length) {
    await prisma.documentChunk.deleteMany({
      where: { id: { in: chunksToDelete } },
    });
  }

  const faqMap = new Map<
    string,
    {
      id: string;
      question: string;
      mergedAnswer: string;
      recruiterApproved: boolean;
      changed: boolean;
    }
  >();
  const faqsToDelete: string[] = [];

  faqs.forEach((faq) => {
    const hash = computeQuestionHash(faq.question);
    const existing = faqMap.get(hash);

    if (!existing) {
      faqMap.set(hash, {
        id: faq.id,
        question: faq.question,
        mergedAnswer: faq.answer,
        recruiterApproved: faq.recruiterApproved,
        changed: false,
      });
    } else {
      const mergedAnswer = mergeAnswers(existing.mergedAnswer, faq.answer);
      const recruiterApproved =
        existing.recruiterApproved || faq.recruiterApproved;
      const changed =
        mergedAnswer !== existing.mergedAnswer ||
        recruiterApproved !== existing.recruiterApproved;

      faqMap.set(hash, {
        ...existing,
        mergedAnswer,
        recruiterApproved,
        changed: existing.changed || changed,
      });
      faqsToDelete.push(faq.id);
    }
  });

  let faqUpdates = 0;
  await Promise.all(
    Array.from(faqMap.values()).map(async (entry) => {
      if (entry.changed) {
        await prisma.fAQ.update({
          where: { id: entry.id },
          data: {
            answer: entry.mergedAnswer,
            recruiterApproved: entry.recruiterApproved,
          },
        });
        faqUpdates += 1;
      }
    }),
  );

  if (faqsToDelete.length) {
    await prisma.fAQ.deleteMany({
      where: { id: { in: faqsToDelete } },
    });
  }

  return {
    organisationId,
    removedDocuments: docsToDelete.length,
    removedDocumentChunks:
      removedChunksViaDocuments + chunksToDelete.length,
    removedFaqs: faqsToDelete.length,
    updatedFaqs: faqUpdates,
  };
};

