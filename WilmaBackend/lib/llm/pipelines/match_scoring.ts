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
  videoTranscripts,
  linkedinUrl,
  screeningAnswers,
}: {
  jobDescription: string;
  cvText: string;
  companyKnowledge: string;
  videoTranscripts?: string[];
  linkedinUrl?: string;
  screeningAnswers?: string;
}): Promise<MatchScoreResult> => {
  const prompt = await loadPrompt("cv-job-matching.md");

  let additionalContext = "";

  if (videoTranscripts && videoTranscripts.length > 0) {
    additionalContext += `\n\nADDITIONAL CONTEXT - Video Interview Responses:\n${videoTranscripts.map((t, i) => `Response ${i + 1}:\n${t}`).join("\n\n")}`;
  }

  if (linkedinUrl) {
    additionalContext += `\n\nADDITIONAL CONTEXT - LinkedIn Profile:\nURL: ${linkedinUrl}\n(Use this contexts if useful, e.g. for verifying seniority or recent roles not on CV)`;
  }

  if (screeningAnswers) {
    additionalContext += `\n\nADDITIONAL CONTEXT - Screening Questions & Answers:\n${screeningAnswers}`;
  }

  if (additionalContext) {
    additionalContext += `\n\nWhen scoring, consider the CV content along with ALL additional context provided (Video responses, LinkedIn, Screening answers). These provide critical evidence of skills, communication ability, and cultural fit.`;
  }

  const userContent = JSON.stringify(
    {
      job_description: jobDescription,
      cv_text: cvText,
      company_knowledge: companyKnowledge,
      video_responses: videoTranscripts || [],
      linkedin_url: linkedinUrl,
      screening_answers: screeningAnswers,
    },
    null,
    2,
  ) + additionalContext;

  const result = await callJsonLLM({
    systemPrompt: prompt,
    userContent,
    schema: matchSchema,
  });
  return matchSchema.parse(result);
};

