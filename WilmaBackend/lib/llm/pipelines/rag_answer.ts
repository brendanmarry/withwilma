import { prisma } from "@/lib/db";
import { searchSimilar } from "@/lib/vector/retriever";
import { loadPrompt } from "@/lib/llm/prompts";
import { callJsonLLM } from "@/lib/llm/utils";
import { z } from "zod";

const answerSchema = z.object({
  answer: z.string(),
  sources_used: z.array(z.string()).optional().default([]),
});

type RAGAnswerParams = {
  organisationId: string;
  question: string;
  jobId?: string;
};

export const ragAnswer = async ({
  organisationId,
  question,
  jobId,
}: RAGAnswerParams) => {
  const [faqs, job] = await Promise.all([
    prisma.fAQ.findMany({
      where: { organisationId, recruiterApproved: true },
      take: 10,
    }),
    jobId
      ? prisma.job.findUnique({
          where: { id: jobId },
        })
      : null,
  ]);

  const matches = await searchSimilar(question, organisationId, 6);

  const textContext = matches
    .map((match) => {
      const metadata = match.metadata ?? {};
      return `Chunk ${match.id} (score ${match.score?.toFixed(2)}): ${
        (metadata.text as string) ?? ""
      }`;
    })
    .join("\n\n");

  const prompt = await loadPrompt("rag-search.md");

  return callJsonLLM({
    systemPrompt: prompt,
    userContent: JSON.stringify(
      {
        question,
        faqs,
        job,
        context_text: textContext,
      },
      null,
      2,
    ),
    schema: answerSchema,
  });
};

