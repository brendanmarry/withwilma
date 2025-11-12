import { z } from "zod";
import { loadPrompt } from "@/lib/llm/prompts";
import { callJsonLLM } from "@/lib/llm/utils";

const followupSchema = z.object({
  follow_up_questions: z
    .array(
      z.object({
        question: z.string(),
        why_this_question: z.string(),
        competency_targeted: z.string(),
      }),
    )
    .length(3),
});

export type FollowupResult = z.infer<typeof followupSchema>;

export const generateFollowUps = async ({
  matchSummary,
}: {
  matchSummary: unknown;
}): Promise<FollowupResult> => {
  const prompt = await loadPrompt("followup-generator.md");
  return callJsonLLM({
    systemPrompt: prompt,
    userContent: JSON.stringify(matchSummary, null, 2),
    schema: followupSchema,
  });
};

