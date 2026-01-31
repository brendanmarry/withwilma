import OpenAI from "openai";
import { env } from "@/lib/env";

let cachedClient: OpenAI | null = null;

export const getOpenAIClient = (): OpenAI => {
  if (cachedClient) {
    return cachedClient;
  }
  cachedClient = new OpenAI({
    apiKey: env().OPENAI_API_KEY,
  });
  return cachedClient;
};

