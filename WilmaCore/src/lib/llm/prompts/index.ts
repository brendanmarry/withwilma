import { readFile } from "fs/promises";
import { join } from "path";

const cache = new Map<string, string>();

import { existsSync } from "fs";

// Docker container copies prompts to /lib/llm/prompts
// Local development keeps them at /src/lib/llm/prompts
const prodPath = join(process.cwd(), "lib", "llm", "prompts");
const devPath = join(process.cwd(), "src", "lib", "llm", "prompts");

const promptsDir = existsSync(prodPath) ? prodPath : devPath;

export const loadPrompt = async (fileName: string): Promise<string> => {
  if (cache.has(fileName)) {
    return cache.get(fileName)!;
  }
  const filePath = join(promptsDir, fileName);
  const content = await readFile(filePath, "utf-8");
  cache.set(fileName, content);
  return content;
};

