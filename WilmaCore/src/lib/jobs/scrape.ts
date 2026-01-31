import { load } from "cheerio";
import { normaliseJob } from "@/lib/llm/pipelines/job_normalisation";

export type RawJob = {
  title: string;
  location?: string;
  description: string;
};

const tidyParagraphs = (text: string | null | undefined): string => {
  if (!text) return "";
  return text
    .replace(/\n{2,}/g, "\n\n")
    .replace(/\t+/g, " ")
    .trim();
};

export const scrapeJobsFromHtml = async (
  html: string,
  options: { forceSinglePage?: boolean } = {}
): Promise<RawJob[]> => {
  const $ = load(html);
  const jobs: RawJob[] = [];

  // If we are forcing single page (e.g. user provided a direct URL),
  // we treat the entire body as a primary candidate.
  if (options.forceSinglePage) {
    const fallbackTitle = $("title").text();
    const bodyText = $("body").text();
    jobs.push({
      title: fallbackTitle || "Job", // LLM will fix title
      description: bodyText,
      location: undefined
    });
  }

  const jobSections = $(
    [
      '[data-testid*="job"]',
      '[class*="job"]', // Catch-all for job-*, *job*, etc.
      '[class*="career"]',
      '[class*="position"]',
      '[class*="role"]',
      "article",
      "section",
      "li", // Often used in lists
    ].join(","),
  );

  jobSections.each((_index, element) => {
    // Avoid nested finding (e.g. finding a card inside a section that was already processed?)
    // Cheerio's 'each' iterates all matches. We might want to be careful about overlapping.
    // For now, let's just proceed.

    const title =
      $(element)
        .find(
          'h1, h2, h3, h4, h5, [data-testid="job-title"], [class*="job-title"], [class*="role-title"], [class*="title"], a',
        )
        .first()
        .text()
        .trim() || $(element).attr("aria-label") || "";

    const location =
      $(element)
        .find(
          '[data-testid*="location"], [class*="job-location"], [class*="location"], .location',
        )
        .first()
        .text()
        .trim() || undefined;

    const bulletText = $(element)
      .find("li")
      .map((_i, li) => $(li).text().trim())
      .get()
      .filter(Boolean)
      .join("\n");

    const paragraphText = $(element)
      .find("p")
      .map((_i, p) => $(p).text().trim())
      .get()
      .filter(Boolean)
      .join("\n");

    const description =
      [tidyParagraphs(paragraphText), bulletText]
        .filter(Boolean)
        .join("\n")
        .trim() || $(element).text().trim();

    // Relaxed threshold: 40 chars should cover even short summaries
    if (title && description.length > 40) {
      jobs.push({ title, location, description });
    }
  });

  // Only use fallback if we didn't force single page AND found nothing
  if (!options.forceSinglePage && !jobs.length) {
    const fallbackTitle = $("title").text();
    if (fallbackTitle) {
      jobs.push({
        title: fallbackTitle,
        description: $("body").text(),
      });
    }
  }

  return jobs;
};

export const extractStructuredJobs = async (
  html: string,
  options: { forceSinglePage?: boolean } = {}
): Promise<
  Array<{
    raw: RawJob;
    normalised: Awaited<ReturnType<typeof normaliseJob>>;
  }>
> => {
  const rawJobs = await scrapeJobsFromHtml(html, options);
  const items = await Promise.all(
    rawJobs.map(async (job) => {
      const normalised = await normaliseJob({ raw: job.description });
      return { raw: job, normalised };
    }),
  );

  // Filter out invalid job postings
  const validJobs = items.filter(item => item.normalised.is_valid_job_posting);

  // Deduplicate: If multiple jobs have the same Normalized Title, keep the one with the longest description
  const uniqueJobs = new Map<string, typeof validJobs[0]>();

  for (const job of validJobs) {
    const key = job.normalised.title.toLowerCase().trim();
    const existing = uniqueJobs.get(key);

    if (!existing) {
      uniqueJobs.set(key, job);
    } else {
      // If we already have this title, keep the one with more content (longer clean_text)
      const existingLen = existing.normalised.clean_text.length;
      const newLen = job.normalised.clean_text.length;

      if (newLen > existingLen) {
        uniqueJobs.set(key, job);
      }
    }
  }

  return Array.from(uniqueJobs.values());
};

