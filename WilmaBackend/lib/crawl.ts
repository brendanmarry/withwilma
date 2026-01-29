import { JSDOM } from "jsdom";
import { htmlToText } from "@/lib/parsing/html";

export type CrawlResult = {
  url: string;
  text: string;
  html: string;
};

const isSameOrigin = (base: URL, target: URL) => base.origin === target.origin;

const sanitizeUrl = (url: string): string | null => {
  try {
    const parsed = new URL(url);
    if (["http:", "https:"].includes(parsed.protocol)) {
      parsed.hash = "";
      return parsed.toString();
    }
    return null;
  } catch {
    return null;
  }
};

export const crawlSite = async ({
  rootUrls,
  depth = 2,
  maxPages = 30,
}: {
  rootUrls: string[];
  depth?: number;
  maxPages?: number;
}): Promise<CrawlResult[]> => {
  const visited = new Set<string>();
  const queue: Array<{ url: string; level: number; origin: URL }> = [];

  for (const root of rootUrls) {
    const sanitized = sanitizeUrl(root);
    if (!sanitized) continue;
    const origin = new URL(sanitized);
    queue.push({ url: sanitized, level: 0, origin });
  }

  const results: CrawlResult[] = [];

  while (queue.length && results.length < maxPages) {
    const { url, level, origin } = queue.shift()!;
    if (visited.has(url) || level > depth) continue;
    visited.add(url);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 WilmaBot/1.0",
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!response.ok) continue;
      const html = await response.text();
      const text = htmlToText(html);
      results.push({ url, text, html });

      if (level === depth) continue;

      const dom = new JSDOM(html);
      const anchors = dom.window.document.querySelectorAll("a[href]");

      anchors.forEach((anchor) => {
        const href = anchor.getAttribute("href");
        if (!href) return;
        const resolved = sanitizeUrl(new URL(href, origin).toString());
        if (!resolved) return;
        const target = new URL(resolved);
        if (!isSameOrigin(origin, target)) return;
        if (!visited.has(resolved)) {
          queue.push({ url: resolved, level: level + 1, origin });
        }
      });
    } catch (error) {
      console.error("Failed to crawl url", url, error);
    }
  }

  return results;
};

