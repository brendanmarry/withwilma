import { z } from "zod";
import { loadPrompt } from "@/lib/llm/prompts";
import { callJsonLLM } from "@/lib/llm/utils";

const matchSchema = z.object({
  match_score: z.number().min(0).max(100),
  strengths: z.array(z.string()),
  gaps: z.array(z.string()),
  role_alignment_summary: z.string(),
  recommended_questions: z
    .array(
      z.object({
        question: z.string(),
        reason: z.string().optional(),
      }),
    )
    .length(3),
  extracted_skills: z.array(z.string()).optional().default([]),
  experience_summary: z.string().optional().default(""),
  confidence: z.enum(["high", "medium", "low"]).optional().default("medium"),
});

export type MatchScoreResult = z.infer<typeof matchSchema>;

export const scoreMatch = async ({
  jobDescription,
  cvText,
  companyKnowledge,
}: {
  jobDescription: string;
  cvText: string;
  companyKnowledge: string;
}): Promise<MatchScoreResult> => {
  const prompt = await loadPrompt("cv-job-matching.md");
  const userContent = JSON.stringify(
    {
      job_description: jobDescription,
      cv_text: cvText,
      company_knowledge: companyKnowledge,
    },
    null,
    2,
  );

  const result = await callJsonLLM({
    systemPrompt: prompt,
    userContent,
    schema: matchSchema,
  });
  return matchSchema.parse(result);
};

