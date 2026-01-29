import { NextResponse } from "next/server";
import { getAdminTokenFromRequest } from "@/lib/auth";
import { jobsFetchSchema } from "@/lib/validators";
import { extractStructuredJobs } from "@/lib/jobs/scrape";
import { discoverJobUrls } from "@/lib/jobs/discover-urls";
import { prisma } from "@/lib/db";
import { indexJobDescription } from "@/lib/vector/retriever";
import { ensureOrganisationByRootUrl } from "@/lib/organisation";
import { logger, serializeError } from "@/lib/logger";

export const POST = async (request: Request) => {
  const admin = await getAdminTokenFromRequest();
  if (!admin) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
    const input = jobsFetchSchema.parse(rawBody);

    // Use the logged-in admin's organisation ID
    // We already checked if (!admin) return 401 above.
    const organisation = await prisma.organisation.findUniqueOrThrow({
      where: { id: admin.organisationId }
    });

    // Simplified Logic: Strictly extract from the provided URL.
    // No discovery loop. 

    // We prioritize careersUrl as the "Job URL". If not present, fallback to rootUrl.
    const targetUrl = input.careersUrl || input.rootUrl;
    const urlsToProcess = [{ url: targetUrl, label: input.label }];

    // Do NOT discover other URLs. The user wants to scan THIS specific page.

    const activeJobIds: string[] = [];
    const seenKeys: Set<string> = new Set(); // Per request deduplication

    // Process each URL (now just one)
    for (const { url, label } of urlsToProcess) {
      try {
        const jobSource = await prisma.jobSource.upsert({
          where: {
            organisationId_url: {
              organisationId: organisation.id,
              url: url,
            },
          },
          update: {
            label: label ?? undefined,
            type: "crawl",
            lastFetchedAt: new Date(),
          },
          create: {
            organisationId: organisation.id,
            url: url,
            label: label,
            type: "crawl",
            lastFetchedAt: new Date(),
          },
        });

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout
        const response = await fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 WilmaBot/1.0",
          },
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (!response.ok) {
          logger.warn(`Failed to fetch ${url}`, { status: response.status });
          continue;
        }
        const html = await response.text();

        // Force single page extraction since we are targeting a specific URL
        const jobs = await extractStructuredJobs(html, { forceSinglePage: true });

        const upsertedJobs = await Promise.all(
          jobs.map(async ({ raw, normalised }) => {
            const title = (normalised.title || raw.title || "").trim();
            const location =
              (normalised.location || raw.location || "").trim() || "";
            const department = normalised.department ?? undefined;
            const employmentType = normalised.employment_type ?? undefined;
            const description =
              normalised.clean_text || raw.description || title || "";

            if (!title) {
              return null;
            }

            // Simple deduplication key
            const key = `${title.toLowerCase()}::${location.toLowerCase()}`;
            if (seenKeys.has(key)) {
              return null;
            }
            seenKeys.add(key);

            // SMART UPSERT STRATEGY
            // 1. Try to find by sourceUrl (most reliable for re-crawls)
            // 2. Try to find by Title/Location (case-insensitive)

            let existingJob = null;

            // Check by sourceUrl first if we have a specific one
            if (url && url !== input.rootUrl) { // Don't match on rootUrl if it was somehow passed
              existingJob = await prisma.job.findFirst({
                where: {
                  organisationId: organisation.id,
                  sourceUrl: url
                },
                select: { id: true }
              });
            }

            // Fallback to Title/Location match
            if (!existingJob) {
              existingJob = await prisma.job.findFirst({
                where: {
                  organisationId: organisation.id,
                  title: { equals: title, mode: "insensitive" },
                  location: { equals: location, mode: "insensitive" }
                },
                select: { id: true }
              });
            }

            let job;
            const jobData = {
              title,
              location,
              department,
              employmentType,
              description,
              normalizedJson: normalised as any,
              jobSourceId: jobSource.id,
              sourceUrl: url,
              status: "open" as const,
              // Note: We might want to be careful overwriting everything if we found it by URL
              // but typically re-crawl means "update to latest".
            };

            if (existingJob) {
              job = await prisma.job.update({
                where: { id: existingJob.id },
                data: {
                  ...jobData,
                  // Don't overwrite createdAt, but update updatedAt is auto
                }
              });
            } else {
              job = await prisma.job.create({
                data: {
                  organisationId: organisation.id,
                  ...jobData,
                  wilmaEnabled: false, // Default to false for new imports? Or true? 
                  // Previous code didn't specify for create in upsert (so it used default false)
                  // Wait, previous code HAD create block. Let's check defaults.
                  // Schema says default(false).
                }
              });
            }

            // Re-index only if needed (could optimise this)
            await indexJobDescription(job, job.description);
            return job;
          }),
        );

        upsertedJobs.forEach((job) => {
          if (job) activeJobIds.push(job.id);
        });

      } catch (err) {
        logger.error(`Error processing URL ${url}`, { error: serializeError(err) });
      }
    }

    // Optional: Close jobs that were NOT found in this scrape session?
    // WARNING: If we iterate multiple pages, 'existingForSource' logic needs to be careful.
    // If we have multiple sources, we should only close jobs for the sources we processed.
    // For now, let's strictly close jobs ONLY if we provided a specific careersUrl and found 0 jobs?
    // OR: Logic to close missing jobs is tricky with multi-page crawl. 
    // If I crawl page A and find Job 1, and page B and find Job 2. 
    // If next time I only crawl page A (because page B wasn't discovered), Job 2 shouldn't be closed!
    // Safest approach for now: Do NOT close missing jobs automatically for auto-discovery mode.
    // Only close if we are targeting a specific careersUrl and we are confident only that page matters.

    // Logic: If user provided 'careersUrl', we treat that as authoritative source for THAT url.
    // But we might have other sources. 
    // Let's simplified: We updated 'lastFetchedAt' for the sources we touched.
    // Maybe we just return the active jobs for now and don't auto-close others to prevent data loss.

    // Returning the list of found/active jobs
    return NextResponse.json({
      jobs: activeJobIds.length
        ? await prisma.job.findMany({
          where: { id: { in: activeJobIds } },
          include: {
            jobSource: true,
            _count: { select: { attachments: true } },
          },
        })
        : [],
    });
  } catch (error) {
    logger.error("Failed to fetch jobs", {
      error: serializeError(error),
      request: {
        rawBody,
      },
    });
    return new NextResponse("Failed to fetch jobs", { status: 500 });
  }
};

