import { z } from "zod";
import { getOpenAIClient } from "@/lib/llm/client";
import { logger, serializeError } from "@/lib/logger";

const DEFAULT_MODEL = "gpt-4o-mini";

type JsonSchema<T> = z.ZodType<T>;

export class LLMJsonError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = "LLMJsonError";
  }
}

export const callJsonLLM = async <T>({
  systemPrompt,
  userContent,
  schema,
  model = DEFAULT_MODEL,
  temperature = 0.3,
}: {
  systemPrompt: string;
  userContent: string;
  schema: JsonSchema<T>;
  model?: string;
  temperature?: number;
}): Promise<T> => {
  const client = getOpenAIClient();
  const context = {
    model,
    temperature,
  };
  logger.info("Calling OpenAI JSON LLM", {
    ...context,
    systemPrompt,
    userContent,
  });
  try {
    const response = await client.chat.completions.create({
      model,
      temperature,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      response_format: { type: "json_object" },
    });

    const rawOutput = response.choices[0]?.message?.content ?? "";
    const output = extractJsonPayload(rawOutput);

    logger.info("Received OpenAI JSON LLM response", {
      ...context,
      usage: response.usage,
      responseId: response.id,
    });

    const parsed = schema.safeParse(JSON.parse(output));
    if (!parsed.success) {
      logger.warn("JSON Parse specific error", { rawOutput, error: parsed.error });
      throw new LLMJsonError("Failed to parse LLM JSON", parsed.error);
    }
    return parsed.data;
  } catch (error) {
    logger.error("OpenAI JSON LLM call failed", {
      ...context,
      error: serializeError(error),
    });
    throw new LLMJsonError("LLM call failed", error);
  }
};

const extractJsonPayload = (raw: string): string => {
  const trimmed = raw.trim();
  if (!trimmed) {
    return trimmed;
  }

  const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```$/i);
  if (fenceMatch) {
    return fenceMatch[1].trim();
  }

  const inlineFenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*)/i);
  if (inlineFenceMatch) {
    return inlineFenceMatch[1].replace(/```$/, "").trim();
  }

  return trimmed;
};

