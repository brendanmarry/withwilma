import { JSDOM } from "jsdom";

export type DiscoveredJobUrl = {
  url: string;
  title: string;
  snippet: string;
  confidence: number;
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

/**
 * Check if URL is from a known job board platform
 */
const isJobBoardDomain = (url: string): boolean => {
  const lowerUrl = url.toLowerCase();
  const jobBoardDomains = [
    "jobs.lever.co",
    "boards.greenhouse.io",
    "apply.workable.com",
    "jobs.ashbyhq.com",
    "jobs.smartrecruiters.com",
    "careers.smartrecruiters.com",
    "jobs.recruitee.com",
    "jobs.bamboohr.com",
    "jobs.icims.com",
    "careers-page.com",
    "talent.workday.com",
    "jobs.jobvite.com",
  ];

  return jobBoardDomains.some((domain) => lowerUrl.includes(domain));
};

/**
 * Score a URL based on how likely it is to be a job posting page
 */
const scoreJobUrl = (url: string, anchorText: string, pageTitle: string): number => {
  let score = 0;
  const lowerUrl = url.toLowerCase();
  const lowerText = anchorText.toLowerCase();
  const lowerTitle = pageTitle.toLowerCase();

  // High confidence for known job board domains
  if (isJobBoardDomain(url)) {
    return 100; // Immediate match for known boards
  }

  // URL patterns that suggest job postings
  const jobPatterns = [
    /\/job[s]?/,
    /\/career[s]?/,
    /\/position[s]?/,
    /\/role[s]?/,
    /\/opportunit[y|ies]/,
    /\/vacanc[y|ies]/,
    /\/opening[s]?/,
    /\/apply/,
    /\/hiring/,
    /\/stellen/, // German
    /\/offene-stellen/,
    /\/jobs/,
    /\/karriere/,
    /\/work-at/,
    /\/join/,
    /\/p\//, // common for 'posting'
    /\/o\//, // common for 'opening' (e.g. lever)
    /\/jobs\//,
    /\/careers\//,
    /\/positions\//,
  ];

  // Check URL patterns
  for (const pattern of jobPatterns) {
    if (pattern.test(lowerUrl)) {
      score += 20; // Increased from 10
    }
  }

  // Check anchor text patterns
  const anchorPatterns = [
    /apply/i,
    /job/i,
    /position/i,
    /role/i,
    /career/i,
    /opportunity/i,
    /vacancy/i,
    /opening/i,
    /hiring/i,
    /work with/i,
    /join/i,
    /stelle/i, // German
    /karriere/i,
    // Common Job Title Keywords
    /engineer/i,
    /developer/i,
    /manager/i,
    /director/i,
    /specialist/i,
    /consultant/i,
    /analyst/i,
    /designer/i,
    /product/i,
    /marketing/i,
    /sales/i,
    /account/i,
    /success/i,
    /support/i,
    /operations/i,
    /admin/i,
    /recruiter/i,
    /hr/i,
    /finance/i,
    /legal/i,
    /counsel/i,
    /officer/i,
    /vp/i,
    /head of/i,
    /lead/i,
    /senior/i,
    /junior/i,
    /intern/i,
  ];

  for (const pattern of anchorPatterns) {
    if (pattern.test(lowerText)) {
      score += 15; // Increased from 5
    }
  }

  // Check page title patterns
  for (const pattern of anchorPatterns) {
    if (pattern.test(lowerTitle)) {
      score += 10; // Increased from 3
    }
  }

  // Boost score if URL contains job-related keywords in path
  const pathSegments = lowerUrl.split("/");
  for (const segment of pathSegments) {
    if (segment.match(/^(job|career|position|role|opportunity|vacancy|opening|apply|hiring|stellen|karriere|work)/)) {
      score += 15; // Increased from 8
    }
  }

  // Penalize common non-job pages
  const excludePatterns = [
    /\/contact/,
    /\/blog/,
    /\/news/,
    /\/press/,
    /\/(terms|privacy|legal)/,
    /\/login/,
    /\/signup/,
  ];

  for (const pattern of excludePatterns) {
    if (pattern.test(lowerUrl)) {
      score -= 30; // Increased penalty
    }
  }

  return Math.max(0, score);
};

/**
 * Discover potential job posting URLs on an organization's website
 */
export const discoverJobUrls = async (
  rootUrl: string,
  maxUrls: number = 50,
): Promise<DiscoveredJobUrl[]> => {
  const visited = new Set<string>();
  const candidates: DiscoveredJobUrl[] = [];
  const queue: Array<{ url: string; level: number; origin: URL }> = [];

  const sanitized = sanitizeUrl(rootUrl);
  if (!sanitized) return [];

  const origin = new URL(sanitized);
  queue.push({ url: sanitized, level: 0, origin });

  // Common careers page paths to check first
  const careersPaths = [
    "/careers",
    "/jobs",
    "/careers/",
    "/jobs/",
    "/careers/open-positions",
    "/jobs/open-positions",
    "/join-us",
    "/work-with-us",
  ];

  for (const path of careersPaths) {
    try {
      const url = new URL(path, origin).toString();
      const sanitized = sanitizeUrl(url);
      if (sanitized && !visited.has(sanitized)) {
        queue.push({ url: sanitized, level: 0, origin });
      }
    } catch {
      // Ignore invalid URLs
    }
  }

  const externalJobUrls: Array<{ url: string; anchorText: string; linkScore: number }> = [];

  while (queue.length && candidates.length < maxUrls) {
    const { url, level, origin } = queue.shift()!;
    if (visited.has(url) || level > 3) continue;
    visited.add(url);

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      });

      if (!response.ok) continue;

      const html = await response.text();
      const dom = new JSDOM(html);
      const document = dom.window.document;
      const pageTitle = document.querySelector("title")?.textContent || "";

      // Extract text snippet from the page
      const bodyText = document.body?.textContent || "";
      const snippet = bodyText.slice(0, 200).replace(/\s+/g, " ").trim();

      // Score this page as a potential job posting
      const score = scoreJobUrl(url, pageTitle, pageTitle);

      if (score > 5) { // Kept low to catch potential pages
        candidates.push({
          url,
          title: pageTitle || url,
          snippet,
          confidence: Math.min(100, score),
        });
      }

      // If this looks like a careers listing page, crawl deeper
      // Relaxed condition: level < 2 OR score > 5 (even if low confidence, crawl a bit)
      if (level < 2) {
        const anchors = document.querySelectorAll("a[href]");
        anchors.forEach((anchor) => {
          const href = anchor.getAttribute("href");
          if (!href) return;

          try {
            const resolved = sanitizeUrl(new URL(href, origin).toString());
            if (!resolved) return;

            const target = new URL(resolved);
            const anchorText = anchor.textContent?.trim() || "";
            const linkScore = scoreJobUrl(resolved, anchorText, pageTitle);

            // Check if it's an external URL (job board or high-scoring job URL)
            const isExternal = !isSameOrigin(origin, target);
            const isExternalJobBoard = isExternal && isJobBoardDomain(resolved);
            // Relaxed: Capture external if score > 10 (was 20)
            const isHighScoringExternalJob = isExternal && linkScore > 10;

            // Collect external job URLs to fetch later
            if ((isExternalJobBoard || isHighScoringExternalJob) && !visited.has(resolved)) {
              visited.add(resolved);
              externalJobUrls.push({
                url: resolved,
                anchorText,
                linkScore,
              });
            } else if (isSameOrigin(origin, target)) {
              // Internal links 
              // Relaxed: Follow almost all internal links at level 0/1 to find hidden careers pages
              // Stricter at deeper levels
              const shouldFollow =
                (level === 0 && linkScore >= 0) ||
                (level === 1 && linkScore > 5) ||
                (linkScore > 10);

              if (shouldFollow && !visited.has(resolved)) {
                queue.push({ url: resolved, level: level + 1, origin });
              }
            }
          } catch {
            // Ignore invalid URLs
          }
        });
      }
    } catch (error) {
      // Silently continue on errors
      console.error("Failed to discover job URL", url, error);
    }
  }

  // Fetch external job board URLs in parallel
  if (externalJobUrls.length > 0) {
    const externalCandidates = await Promise.all(
      externalJobUrls.map(async ({ url, anchorText, linkScore }) => {
        try {
          const response = await fetch(url, {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
          });

          if (response.ok) {
            const html = await response.text();
            const externalDom = new JSDOM(html);
            const externalDoc = externalDom.window.document;
            const externalTitle = externalDoc.querySelector("title")?.textContent || anchorText || url;
            const externalBodyText = externalDoc.body?.textContent || "";
            const externalSnippet = externalBodyText.slice(0, 200).replace(/\s+/g, " ").trim();

            return {
              url,
              title: externalTitle,
              snippet: externalSnippet,
              confidence: Math.min(100, linkScore + 20), // Boost confidence for job board URLs
            };
          }
        } catch {
          // If fetch fails, still add with available info
        }

        return {
          url,
          title: anchorText || url,
          snippet: "",
          confidence: Math.min(100, linkScore),
        };
      }),
    );

    candidates.push(...externalCandidates);
  }

  // Sort by confidence score (highest first)
  return candidates.sort((a, b) => b.confidence - a.confidence).slice(0, maxUrls);
};

