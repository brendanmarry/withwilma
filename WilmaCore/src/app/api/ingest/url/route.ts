import { NextResponse } from "next/server";
import { getAdminTokenFromRequest } from "@/lib/auth";
import { ingestUrlSchema } from "@/lib/validators";
import { ensureOrganisationByRootUrl } from "@/lib/organisation";
import { crawlSite } from "@/lib/crawl";
import { ingestDocuments } from "@/lib/llm/pipelines/ingestion";
import { extractBrandingFromHtml } from "@/lib/llm/pipelines/branding";
import { prisma } from "@/lib/db";
import { logger, serializeError } from "@/lib/logger";

export const POST = async (request: Request) => {
  const admin = await getAdminTokenFromRequest();
  if (!admin) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  let rawBody: unknown;
  let crawlTargets: string[] = [];
  try {
    rawBody = await request.json();
    const input = ingestUrlSchema.parse(rawBody);
    const organisation = await ensureOrganisationByRootUrl(input.rootUrl);
    crawlTargets = [
      input.rootUrl,
      ...(input.additionalUrls ?? []),
    ];

    const crawled = await crawlSite({
      rootUrls: crawlTargets,
      depth: input.depth,
    });

    // Extract branding from the root page (first result typically, or finding exact match)
    const rootPage = crawled.find(p => p.url === input.rootUrl) || crawled[0];
    if (rootPage && rootPage.html) {
      // Run in background / non-blocking if speed is critical, 
      // but here we wait to ensure it's saved.
      const branding = await extractBrandingFromHtml(rootPage.html, input.rootUrl);

      if (branding.logoUrl || branding.primaryColor) {
        await prisma.organisation.update({
          where: { id: organisation.id },
          data: {
            branding: {
              logoUrl: branding.logoUrl ?? undefined,
              primaryColor: branding.primaryColor ?? undefined
            }
          }
        });
      }
    }

    await ingestDocuments({
      // ...
      organisationId: organisation.id,
      items: crawled.map((page) => ({
        type: "html" as const,
        content: page.text,
        sourceUrl: page.url,
        metadata: { tags: input.tags ?? [] },
      })),
    });

    return NextResponse.json(
      {
        pagesProcessed: crawled.length,
      },
      { status: 202 },
    );
  } catch (error) {
    logger.error("Failed to ingest URLs", {
      error: serializeError(error),
      request: {
        rawBody,
        crawlTargets,
      },
    });
    return new NextResponse("Failed to ingest URLs", { status: 500 });
  }
};

