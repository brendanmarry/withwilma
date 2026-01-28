import { z } from "zod";
import { loadPrompt } from "@/lib/llm/prompts";
import { callJsonLLM } from "@/lib/llm/utils";

const followupSchema = (count: number) => z.object({
  follow_up_questions: z
    .array(
      z.object({
        question: z.string(),
        why_this_question: z.string(),
        competency_targeted: z.string(),
      }),
    )
    .length(count),
});

export type FollowupResult = {
  follow_up_questions: Array<{
    question: string;
    why_this_question: string;
    competency_targeted: string;
  }>;
};

export const generateFollowUps = async ({
  matchSummary,
  count = 3,
}: {
  matchSummary: unknown;
  count?: number;
}): Promise<FollowupResult> => {
  const prompt = await loadPrompt("followup-generator.md");
  return callJsonLLM({
    systemPrompt: prompt,
    userContent: JSON.stringify(matchSummary, null, 2),
    schema: followupSchema(count),
  });
};

