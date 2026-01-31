import { z } from "zod";
import { prisma } from "@/lib/db";
import { loadPrompt } from "@/lib/llm/prompts";
import { callJsonLLM } from "@/lib/llm/utils";

const faqSchema = z.object({
  faqs: z
    .array(
      z.object({
        question: z.string(),
        answer: z.string(),
        confidence: z.enum(["high", "medium", "low"]).optional(),
        source_evidence: z.string().optional(),
      }),
    )
    .min(3),
});

export const generateFAQs = async ({
  organisationId,
  maxItems = 30,
}: {
  organisationId: string;
  maxItems?: number;
}) => {
  const documents = await prisma.document.findMany({
    where: { organisationId },
    orderBy: { createdAt: "desc" },
    take: 25,
  });

  if (!documents.length) {
    throw new Error("No documents available for FAQ generation");
  }

  const combinedText = documents
    .map((doc) => doc.textContent)
    .join("\n\n")
    .slice(0, 40000);

  const systemPrompt = await loadPrompt("rag-ingestion.md");
  const result = await callJsonLLM({
    systemPrompt: `${systemPrompt}\nYou are now focusing on generating FAQs only. Return JSON with "faqs". Limit to ${maxItems} items.`,
    userContent: combinedText,
    schema: faqSchema,
  });

  const created = await prisma.$transaction(
    result.faqs.slice(0, maxItems).map((faq) =>
      prisma.fAQ.create({
        data: {
          organisationId,
          question: faq.question,
          answer: faq.answer,
          recruiterApproved: false,
        },
      }),
    ),
  );

  return created;
};

