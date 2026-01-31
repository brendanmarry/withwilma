import { load } from "cheerio";
import { normaliseJob } from "@/lib/llm/pipelines/job_normalisation";
import { validateJobDescription } from "@/lib/llm/pipelines/job_validation";
import { htmlToText } from "@/lib/parsing/html";

export type ParsedJobPreview = {
  title: string;
  location?: string;
  department?: string;
  employmentType?: string;
  description: string;
  normalised: Awaited<ReturnType<typeof normaliseJob>>;
  validation: Awaited<ReturnType<typeof validateJobDescription>>;
  sourceUrl: string;
};

const tidyParagraphs = (text: string | null | undefined): string => {
  if (!text) return "";
  return text
    .replace(/\n{2,}/g, "\n\n")
    .replace(/\t+/g, " ")
    .trim();
};

/**
 * Parse a single job posting page from HTML
 */
export const parseSingleJobPosting = async (
  html: string,
  sourceUrl: string,
): Promise<ParsedJobPreview> => {
  const $ = load(html);

  // Try to find job-specific content areas
  const jobContainer =
    $('[data-testid*="job"], [class*="job-description"], [class*="job-detail"], article, main').first() ||
    $("body");

  // Extract title
  const title =
    jobContainer
      .find('h1, h2, [data-testid="job-title"], [class*="job-title"], [class*="role-title"]')
      .first()
      .text()
      .trim() ||
    $("title").text().trim() ||
    "Untitled Job";

  // Extract location
  const location =
    jobContainer
      .find('[data-testid*="location"], [class*="job-location"], [class*="location"], .location')
      .first()
      .text()
      .trim() || undefined;

  // Extract full description
  const bulletText = jobContainer
    .find("li")
    .map((_i, li) => $(li).text().trim())
    .get()
    .filter(Boolean)
    .join("\n");

  const paragraphText = jobContainer
    .find("p")
    .map((_i, p) => $(p).text().trim())
    .get()
    .filter(Boolean)
    .join("\n");

  const rawDescription =
    [tidyParagraphs(paragraphText), bulletText]
      .filter(Boolean)
      .join("\n")
      .trim() || htmlToText(html);

  // Normalize and validate using LLM
  const normalised = await normaliseJob({ raw: rawDescription });
  const finalTitle = normalised.title?.trim() || title;
  const finalLocation = normalised.location?.trim() || location;
  const finalDescription = normalised.clean_text?.trim() || rawDescription.slice(0, 12000);

  const validation = await validateJobDescription({
    title: finalTitle,
    location: finalLocation,
    description: finalDescription,
    normalised,
  });

  return {
    title: finalTitle,
    location: finalLocation,
    department: normalised.department?.trim(),
    employmentType: normalised.employment_type?.trim(),
    description: finalDescription,
    normalised,
    validation,
    sourceUrl,
  };
};

