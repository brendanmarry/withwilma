import { NextResponse } from "next/server";
import { getAdminTokenFromRequest } from "@/lib/auth";
import { ensureOrganisationByRootUrl } from "@/lib/organisation";
import { z } from "zod";
import { logger } from "@/lib/logger";

const enrichSchema = z.object({
  rootUrl: z.string().url(),
  signals: z
    .array(z.enum(["news", "funding", "social", "blog", "press"]))
    .optional(),
});

export const POST = async (request: Request) => {
  const admin = await getAdminTokenFromRequest();
  if (!admin) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const raw = await request.json();
    const input = enrichSchema.parse(raw);
    const organisation = await ensureOrganisationByRootUrl(input.rootUrl);

    logger.info("Queued knowledge enrichment task", {
      organisationId: organisation.id,
      rootUrl: organisation.rootUrl,
      signals: input.signals ?? ["news", "funding", "social"],
    });

    // In a full implementation we would enqueue a background job that:
    // - performs web searches and news lookups
    // - extracts insights and stores the additional documents
    // - regenerates FAQs leveraging the newly gathered context

    return NextResponse.json(
      {
        status: "queued",
        message:
          "Knowledge enrichment request accepted. You will see new content once the external sources are processed.",
      },
      { status: 202 },
    );
  } catch (error) {
    logger.error("Failed to enqueue knowledge enrichment", { error });
    return new NextResponse("Failed to enqueue enrichment", { status: 500 });
  }
};

