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
): Promise<RawJob[]> => {
  const $ = load(html);
  const jobSections = $(
    [
      '[data-testid*="job"]',
      '[class*="job-card"]',
      '[class*="career-card"]',
      "article",
      "section",
    ].join(","),
  );
  const jobs: RawJob[] = [];

  jobSections.each((_index, element) => {
    const title =
      $(element)
        .find(
          'h1, h2, h3, [data-testid="job-title"], [class*="job-title"], [class*="role-title"]',
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

    if (title && description.length > 200) {
      jobs.push({ title, location, description });
    }
  });

  if (!jobs.length) {
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
): Promise<
  Array<{
    raw: RawJob;
    normalised: Awaited<ReturnType<typeof normaliseJob>>;
  }>
> => {
  const rawJobs = await scrapeJobsFromHtml(html);
  const items = await Promise.all(
    rawJobs.map(async (job) => ({
      raw: job,
      normalised: await normaliseJob({ raw: job.description }),
    })),
  );
  return items;
};

