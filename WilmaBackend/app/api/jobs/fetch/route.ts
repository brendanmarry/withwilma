import { NextResponse } from "next/server";
import { getAdminTokenFromRequest } from "@/lib/auth";
import { jobsFetchSchema } from "@/lib/validators";
import { extractStructuredJobs } from "@/lib/jobs/scrape";
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
    const organisation = await ensureOrganisationByRootUrl(input.rootUrl);

    const jobSource = await prisma.jobSource.upsert({
      where: {
        organisationId_url: {
          organisationId: organisation.id,
          url: input.careersUrl,
        },
      },
      update: {
        label: input.label ?? undefined,
        type: "crawl",
        lastFetchedAt: new Date(),
      },
      create: {
        organisationId: organisation.id,
        url: input.careersUrl,
        label: input.label,
        type: "crawl",
        lastFetchedAt: new Date(),
      },
    });

    const response = await fetch(input.careersUrl);
    if (!response.ok) {
      return new NextResponse("Failed to fetch careers page", { status: 400 });
    }
    const html = await response.text();
    const jobs = await extractStructuredJobs(html);

    const existingForSource = await prisma.job.findMany({
      where: { jobSourceId: jobSource.id },
      select: { id: true, title: true, location: true },
    });

    const seenKeys: Set<string> = new Set();

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

        const key = `${title.toLowerCase()}::${location.toLowerCase()}`;
        if (seenKeys.has(key)) {
          return null;
        }
        seenKeys.add(key);

        const job = await prisma.job.upsert({
          where: {
            organisationId_title_location: {
              organisationId: organisation.id,
              title,
              location,
            },
          },
          update: {
            department,
            employmentType,
            description,
            normalizedJson: normalised,
            jobSourceId: jobSource.id,
            sourceUrl: input.careersUrl,
            status: "open",
          },
          create: {
            organisationId: organisation.id,
            title,
            location,
            department,
            employmentType,
            description,
            normalizedJson: normalised,
            jobSourceId: jobSource.id,
            sourceUrl: input.careersUrl,
            status: "open",
          },
        });
        await indexJobDescription(job, job.description);
        return job;
      }),
    );

    const activeIds = upsertedJobs
      .filter((job): job is NonNullable<typeof job> => Boolean(job))
      .map((job) => job.id);

    if (existingForSource.length) {
      const toClose = existingForSource
        .filter((job) => !activeIds.includes(job.id))
        .map((job) => job.id);
      if (toClose.length) {
        await prisma.job.updateMany({
          where: { id: { in: toClose } },
          data: { status: "closed", wilmaEnabled: false },
        });
      }
    }

    await prisma.jobSource.update({
      where: { id: jobSource.id },
      data: { lastFetchedAt: new Date() },
    });

    return NextResponse.json({
      jobs: activeIds.length
        ? await prisma.job.findMany({
            where: { id: { in: activeIds } },
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

