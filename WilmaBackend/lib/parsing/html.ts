import { load } from "cheerio";

const BLOCKED_SELECTORS = [
  "script",
  "style",
  "nav",
  "footer",
  "header",
  "noscript",
  "iframe",
  "svg",
  ".cookie",
  ".banner",
];

const cleanText = (text: string): string =>
  text
    .replace(/\s+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();

export const htmlToText = (html: string): string => {
  const $ = load(html);
  BLOCKED_SELECTORS.forEach((selector) => $(selector).remove());
  const text = $("body").text();
  return cleanText(text);
};

