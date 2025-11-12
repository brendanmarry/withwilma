import type { Result } from "mammoth";
import mammoth from "mammoth";

export const docxToText = async (buffer: Buffer): Promise<string> => {
  const result = (await mammoth.extractRawText({ buffer })) as Result;
  return result.value?.replace(/\s+\n/g, "\n").trim() ?? "";
};

