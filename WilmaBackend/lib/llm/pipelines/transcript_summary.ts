import { z } from "zod";
import { loadPrompt } from "@/lib/llm/prompts";
import { callJsonLLM } from "@/lib/llm/utils";

const transcriptSchema = z.object({
  clean_transcript: z.string(),
  key_points: z.array(z.string()),
  recruiter_summary: z.string(),
});

export type TranscriptSummary = z.infer<typeof transcriptSchema>;

export const summariseTranscript = async ({
  transcript,
  question,
  jobDescription,
}: {
  transcript: string;
  question: string;
  jobDescription?: string;
}): Promise<TranscriptSummary> => {
  const prompt = await loadPrompt("video-transcription-summary.md");
  return callJsonLLM({
    systemPrompt: prompt,
    userContent: JSON.stringify(
      {
        transcript,
        question,
        job_description: jobDescription,
      },
      null,
      2,
    ),
    schema: transcriptSchema,
  });
};

