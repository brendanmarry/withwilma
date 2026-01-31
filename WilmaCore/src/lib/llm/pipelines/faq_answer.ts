import { z } from "zod";
import { prisma } from "@/lib/db";
import { loadPrompt } from "@/lib/llm/prompts";
import { callJsonLLM } from "@/lib/llm/utils";

const faqAnswerSchema = z.object({
  answer: z.string(),
  confidence: z.enum(["high", "medium", "low"]).optional(),
  source_evidence: z.string().optional(),
});

export type FAQAnswerResult = z.infer<typeof faqAnswerSchema>;

const MAX_COMBINED_LENGTH = 40000;
const MAX_DOCUMENTS = 25;

export const regenerateFaqAnswer = async ({
  organisationId,
  question,
}: {
  organisationId: string;
  question: string;
}): Promise<FAQAnswerResult> => {
  const documents = await prisma.document.findMany({
    where: { organisationId },
    orderBy: { createdAt: "desc" },
    take: MAX_DOCUMENTS,
  });

  if (documents.length === 0) {
    throw new Error("No documents available for FAQ regeneration");
  }

  const combinedText = documents
    .map((doc) => doc.textContent)
    .join("\n\n")
    .slice(0, MAX_COMBINED_LENGTH);

  const systemPrompt = await loadPrompt("rag-ingestion.md");
  const prompt = `${systemPrompt}\nYou are now focusing on crafting a single recruiter-facing FAQ answer.\nReturn JSON matching { "answer": string, "confidence": "high" | "medium" | "low", "source_evidence": string } where source_evidence is an optional short quote or reference.\nKeep the answer concise (3-6 sentences) and factual.`;

  return callJsonLLM({
    systemPrompt: prompt,
    userContent: JSON.stringify(
      {
        question,
        context: combinedText,
      },
      null,
      2,
    ),
    schema: faqAnswerSchema,
  });
};

