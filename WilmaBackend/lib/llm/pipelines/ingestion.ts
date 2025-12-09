import { Prisma } from "@prisma/client";
import type { DocumentSourceType } from "@prisma/client";
import { createHash } from "crypto";
import { prisma } from "@/lib/db";
import { htmlToText } from "@/lib/parsing/html";
import { docxToText } from "@/lib/parsing/docx";
import { pdfToText } from "@/lib/parsing/pdf";
import { indexDocumentChunks } from "@/lib/vector/retriever";

export type IngestSourceType = "html" | "pdf" | "docx" | "text";

export type IngestItem = {
  type: IngestSourceType;
  content?: string;
  buffer?: Buffer;
  sourceUrl?: string;
  mimeType?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
};

const CHUNK_SIZE = 2000;
const CHUNK_OVERLAP = 200;

const toDocumentSourceType = (type: IngestSourceType): DocumentSourceType => {
  if (type === "html") return "crawl";
  if (type === "pdf" || type === "docx" || type === "text") return "upload";
  return "news";
};

const hashText = (text: string): string =>
  createHash("sha256").update(text.trim()).digest("hex");

const chunkText = (text: string): string[] => {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(text.length, start + CHUNK_SIZE);
    const chunk = text.slice(start, end);
    chunks.push(chunk);
    start += CHUNK_SIZE - CHUNK_OVERLAP;
  }
  return chunks;
};

const extractText = async (item: IngestItem): Promise<string> => {
  switch (item.type) {
    case "html":
      return htmlToText(item.content ?? "");
    case "pdf":
      if (!item.buffer) {
        throw new Error("PDF ingestion requires buffer");
      }
      return pdfToText(item.buffer);
    case "docx":
      if (!item.buffer) {
        throw new Error("DOCX ingestion requires buffer");
      }
      return docxToText(item.buffer);
    case "text":
      return item.content ?? "";
    default:
      return "";
  }
};

export const ingestDocuments = async ({
  organisationId,
  items,
}: {
  organisationId: string;
  items: IngestItem[];
}) => {
  const processed = await Promise.all(
    items.map(async (item) => {
      const text = await extractText(item);
      return { ...item, text };
    }),
  );

  // Check for existing documents to update instead of creating duplicates
  const documents = await Promise.all(
    processed.map(async (item) => {
      const text = item.text ?? "";
      const textHash = hashText(text);
      const originalName = item.metadata?.originalName as string | undefined;
      const sourceType = toDocumentSourceType(item.type);

      // Try to find existing document by:
      // 1. Source URL (if available) - most reliable
      // 2. Original filename (if available) - check metadata
      // 3. Content hash (fallback) - check all documents
      let existingDoc = null;

      // First try by source URL (most reliable)
      if (item.sourceUrl) {
        existingDoc = await prisma.document.findFirst({
          where: {
            organisationId,
            sourceType,
            sourceUrl: item.sourceUrl,
          },
          orderBy: { createdAt: "desc" },
        });
      }

      // If not found and we have original filename, check metadata
      if (!existingDoc && originalName) {
        const candidates = await prisma.document.findMany({
          where: {
            organisationId,
            sourceType,
          },
        });

        existingDoc =
          candidates.find(
            (doc) =>
              doc.metadata &&
              typeof doc.metadata === "object" &&
              "originalName" in doc.metadata &&
              doc.metadata.originalName === originalName,
          ) ?? null;
      }

      // Last resort: check by content hash
      if (!existingDoc) {
        const candidates = await prisma.document.findMany({
          where: {
            organisationId,
            sourceType,
          },
        });

        existingDoc =
          candidates.find((doc) => hashText(doc.textContent) === textHash) ?? null;
      }

      if (existingDoc) {
        // Update existing document and delete old chunks
        await prisma.documentChunk.deleteMany({
          where: { documentId: existingDoc.id },
        });

        const updated = await prisma.document.update({
          where: { id: existingDoc.id },
          data: {
            textContent: text,
            mimeType: item.mimeType,
            sourceUrl: item.sourceUrl,
            metadata:
              item.metadata !== undefined
                ? (item.metadata as Prisma.InputJsonValue)
                : undefined,
          },
        });

        // Re-index chunks
        const chunks = chunkText(text).map((chunk, chunkIndex) => ({
          chunkId: `${chunkIndex}`,
          text: chunk,
          metadata: {
            source_url: item.sourceUrl,
            tags: item.tags ?? [],
            document_id: updated.id,
          },
        }));
        await indexDocumentChunks(updated, chunks);

        return updated;
      }

      // Create new document
      const newDoc = await prisma.document.create({
        data: {
          organisationId,
          sourceType,
          sourceUrl: item.sourceUrl,
          mimeType: item.mimeType,
          textContent: text,
          metadata:
            item.metadata !== undefined
              ? (item.metadata as Prisma.InputJsonValue)
              : undefined,
        },
      });

      // Index chunks
      const chunks = chunkText(text).map((chunk, chunkIndex) => ({
        chunkId: `${chunkIndex}`,
        text: chunk,
        metadata: {
          source_url: item.sourceUrl,
          tags: item.tags ?? [],
          document_id: newDoc.id,
        },
      }));
      await indexDocumentChunks(newDoc, chunks);

      return newDoc;
    }),
  );

  return {
    documents,
  };
};

