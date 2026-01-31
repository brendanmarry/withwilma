import { z } from "zod";
import { loadPrompt } from "@/lib/llm/prompts";
import { callJsonLLM } from "@/lib/llm/utils";

const validationSchema = z.object({
  is_valid: z.boolean(),
  reasons: z.array(z.string()).optional().default([]),
  suggested_improvements: z.array(z.string()).optional().default([]),
});

export type JobValidationResult = z.infer<typeof validationSchema>;

type JobValidationInput = {
  title: string;
  location?: string | null;
  description: string;
  normalised?: Record<string, unknown>;
};

export const validateJobDescription = async (
  input: JobValidationInput,
): Promise<JobValidationResult> => {
  const prompt = await loadPrompt("job-validation.md");
  const payload = {
    title: input.title,
    location: input.location ?? null,
    description: input.description,
    normalised: input.normalised ?? null,
  };

  const raw = await callJsonLLM({
    systemPrompt: prompt,
    userContent: JSON.stringify(payload, null, 2),
    schema: validationSchema,
  });

  return validationSchema.parse(raw);
};

