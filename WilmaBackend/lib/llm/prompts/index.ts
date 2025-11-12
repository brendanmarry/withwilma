import { readFile } from "fs/promises";
import { join } from "path";

const cache = new Map<string, string>();

const promptsDir = join(process.cwd(), "lib", "llm", "prompts");

export const loadPrompt = async (fileName: string): Promise<string> => {
  if (cache.has(fileName)) {
    return cache.get(fileName)!;
  }
  const filePath = join(promptsDir, fileName);
  const content = await readFile(filePath, "utf-8");
  cache.set(fileName, content);
  return content;
};

