import { corsOptionsResponse, withCors } from "@/app/api/_utils/cors";

// ... existing imports

export const POST = async (request: Request) => {
  const admin = await getAdminTokenFromRequest();
  if (!admin) {
    return withCors(new NextResponse("Unauthorized", { status: 401 }), request);
  }

  let rawBody: unknown;
  let crawlTargets: string[] = [];
  try {
    rawBody = await request.json();
    const input = ingestUrlSchema.parse(rawBody);

    // ... logic ...
    const organisation = await ensureOrganisationByRootUrl(input.rootUrl);
    crawlTargets = [
      input.rootUrl,
      ...(input.additionalUrls ?? []),
    ];

    const crawled = await crawlSite({
      rootUrls: crawlTargets,
      depth: input.depth,
    });

    // ... branding extraction ...
    const rootPage = crawled.find(p => p.url === input.rootUrl) || crawled[0];
    if (rootPage && rootPage.html) {
      // ...
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

    return withCors(
      NextResponse.json(
        {
          pagesProcessed: crawled.length,
        },
        { status: 202 },
      ),
      request
    );
  } catch (error) {
    logger.error("Failed to ingest URLs", {
      error: serializeError(error),
      request: {
        rawBody,
        crawlTargets,
      },
    });
    return withCors(new NextResponse("Failed to ingest URLs", { status: 500 }), request);
  }
};

export const OPTIONS = async (request: Request) => corsOptionsResponse(request);

