import { z } from "zod";
import { loadPrompt } from "@/lib/llm/prompts";
import { callJsonLLM } from "@/lib/llm/utils";

export const normalisedJobSchema = z.object({
  title: z.string().optional().default(""),
  department: z.string().optional().default(""),
  location: z.string().optional().default(""),
  employment_type: z.string().optional().default(""),
  summary: z.string().optional().default(""),
  responsibilities: z.array(z.string()).optional().default([]),
  requirements: z.array(z.string()).optional().default([]),
  nice_to_have: z.array(z.string()).optional().default([]),
  seniority_level: z.string().optional().default(""),
  company_values_alignment: z.string().optional().default(""),
  clean_text: z.string().optional().default(""),
});

export type NormalisedJob = z.infer<typeof normalisedJobSchema>;

export const normaliseJob = async ({
  raw,
}: {
  raw: string;
}): Promise<NormalisedJob> => {
  const prompt = await loadPrompt("job-normalisation.md");
  const result = await callJsonLLM({
    systemPrompt: prompt,
    userContent: raw,
    schema: normalisedJobSchema,
  });
  return normalisedJobSchema.parse(result);
};

