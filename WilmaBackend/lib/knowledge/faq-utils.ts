import { createHash } from "crypto";

export const normalizeQuestion = (question: string): string =>
  question
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();

export const hashQuestion = (normalizedQuestion: string): string =>
  createHash("sha256").update(normalizedQuestion).digest("hex");

export const computeQuestionHash = (question: string): string =>
  hashQuestion(normalizeQuestion(question));

export const confidenceScore = (confidence?: string): number => {
  switch ((confidence ?? "medium").toLowerCase()) {
    case "high":
      return 3;
    case "medium":
      return 2;
    case "low":
    default:
      return 1;
  }
};

export const mergeAnswers = (existing: string, incoming: string): string => {
  if (!incoming.trim()) {
    return existing;
  }
  if (!existing.trim()) {
    return incoming;
  }
  const normalizedExisting = existing.trim().toLowerCase();
  const normalizedIncoming = incoming.trim().toLowerCase();

  if (
    normalizedExisting.includes(normalizedIncoming) ||
    normalizedIncoming.includes(normalizedExisting)
  ) {
    return normalizedIncoming.length > normalizedExisting.length
      ? incoming
      : existing;
  }

  const existingLines = new Set(
    existing
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean),
  );
  const incomingLines = incoming
    .split(/\n+/)
    .map((line) => line.trim())
    .filter((line) => line && !existingLines.has(line));

  if (!incomingLines.length) {
    return existing;
  }

  return `${existing.trim()}\n\n${incomingLines.join("\n")}`.trim();
};

