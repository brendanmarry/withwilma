import type { Document, Job } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { getOpenAIClient } from "@/lib/llm/client";
import { prisma } from "@/lib/db";
import { logger, serializeError } from "@/lib/logger";

const EMBEDDING_MODEL = "text-embedding-3-large";

export const embedText = async (text: string): Promise<number[]> => {
  const client = getOpenAIClient();
  try {
    logger.debug("Requesting single text embedding", {
      model: EMBEDDING_MODEL,
      textLength: text.length,
    });
    const response = await client.embeddings.create({
      model: EMBEDDING_MODEL,
      input: text,
    });
    const embedding = response.data[0]?.embedding ?? [];
    logger.debug("Received single text embedding", {
      model: EMBEDDING_MODEL,
      dimensions: embedding.length,
    });
    return embedding;
  } catch (error) {
    logger.error("Failed to generate single text embedding", {
      model: EMBEDDING_MODEL,
      error: serializeError(error),
    });
    throw error;
  }
};

export const embedTexts = async (texts: string[]): Promise<number[][]> => {
  if (!texts.length) return [];
  const client = getOpenAIClient();
  try {
    logger.debug("Requesting batch text embeddings", {
      model: EMBEDDING_MODEL,
      batchSize: texts.length,
      textLengths: texts.map((item) => item.length),
    });
    const response = await client.embeddings.create({
      model: EMBEDDING_MODEL,
      input: texts,
    });
    const embeddings = response.data.map((item) => item.embedding);
    logger.debug("Received batch text embeddings", {
      model: EMBEDDING_MODEL,
      batchSize: embeddings.length,
      dimensions: embeddings[0]?.length ?? 0,
    });
    return embeddings;
  } catch (error) {
    logger.error("Failed to generate batch text embeddings", {
      model: EMBEDDING_MODEL,
      batchSize: texts.length,
      error: serializeError(error),
    });
    throw error;
  }
};

export const indexDocumentChunks = async (
  document: Document,
  chunks: Array<{ chunkId: string; text: string; metadata: Record<string, unknown> }>,
): Promise<void> => {
  try {
    const embeddings = await embedTexts(chunks.map((chunk) => chunk.text));

    await prisma.documentChunk.deleteMany({
      where: { documentId: document.id },
    });

    if (!embeddings.length) {
      logger.info("Knowledge base not updated because no embeddings were generated", {
        documentId: document.id,
        organisationId: document.organisationId,
        chunkCount: chunks.length,
      });
      return;
    }

    await prisma.documentChunk.createMany({
      data: chunks.map((chunk, index) => ({
        documentId: document.id,
        chunkId: chunk.chunkId,
        text: chunk.text,
        metadata:
          chunk.metadata !== undefined
            ? (chunk.metadata as Prisma.InputJsonValue)
            : undefined,
        embedding: (embeddings[index] ?? []) as Prisma.InputJsonValue,
      })),
    });

    logger.info("Knowledge base document indexed", {
      documentId: document.id,
      organisationId: document.organisationId,
      chunkCount: chunks.length,
    });
  } catch (error) {
    logger.error("Failed to index knowledge base document", {
      documentId: document.id,
      organisationId: document.organisationId,
      chunkCount: chunks.length,
      error: serializeError(error),
    });
    throw error;
  }
};

export const searchSimilar = async (
  query: string,
  organisationId: string,
  topK = 5,
): Promise<
  Array<{
    id: string;
    score: number;
    metadata: Record<string, unknown>;
  }>
> => {
  const embedding = await embedText(query);
  const chunks = await prisma.documentChunk.findMany({
    where: {
      document: {
        organisationId,
      },
    },
    include: {
      document: true,
    },
  });

  const scored = chunks
    .map((chunk) => ({
      id: chunk.id,
      score: cosineSimilarity(embedding, chunk.embedding as number[]),
      metadata: {
        ...(chunk.metadata as Record<string, unknown>),
        documentId: chunk.documentId,
        sourceType: chunk.document.sourceType,
        text: chunk.text,
      },
    }))
    .filter((item) => Number.isFinite(item.score))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  return scored;
};

export const indexJobDescription = async (
  job: Job,
  text: string,
): Promise<void> => {
  try {
    const embedding = await embedText(text);
    await prisma.job.update({
      where: { id: job.id },
      data: {
        embedding: embedding as Prisma.InputJsonValue,
      },
    });
    logger.info("Knowledge base job embedding updated", {
      jobId: job.id,
      organisationId: job.organisationId,
      embeddingDimensions: embedding.length,
    });
  } catch (error) {
    logger.error("Failed to update job embedding", {
      jobId: job.id,
      organisationId: job.organisationId,
      error: serializeError(error),
    });
    throw error;
  }
};

const cosineSimilarity = (a: number[], b: number[]): number => {
  if (!a.length || !b?.length || a.length !== b.length) return -1;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i]! * b[i]!;
    normA += a[i]! * a[i]!;
    normB += b[i]! * b[i]!;
  }
  if (!normA || !normB) return -1;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
};

