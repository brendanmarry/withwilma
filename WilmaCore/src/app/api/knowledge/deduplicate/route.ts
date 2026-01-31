import { NextResponse } from "next/server";
import { getAdminTokenFromRequest } from "@/lib/auth";
import { ensureOrganisationByRootUrl } from "@/lib/organisation";
import { deduplicateOrganisationKnowledge } from "@/lib/knowledge/deduplicate";
import { logger, serializeError } from "@/lib/logger";
import { prisma } from "@/lib/db";
import { z } from "zod";

const dedupeSchema = z
  .object({
    rootUrl: z.string().url().optional(),
    organisationId: z.string().min(1).optional(),
  })
  .refine(
    (value) => value.rootUrl || value.organisationId,
    "rootUrl or organisationId is required",
  );

export const POST = async (request: Request) => {
  const admin = await getAdminTokenFromRequest();
  if (!admin) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
    const input = dedupeSchema.parse(rawBody);
    let organisation = null;

    if (input.organisationId) {
      organisation = await prisma.organisation.findUnique({
        where: { id: input.organisationId },
      });
      if (!organisation) {
        return new NextResponse("Organisation not found", { status: 404 });
      }
    } else if (input.rootUrl) {
      organisation = await ensureOrganisationByRootUrl(input.rootUrl);
    }

    if (!organisation) {
      return new NextResponse("Organisation not found", { status: 404 });
    }

    const result = await deduplicateOrganisationKnowledge(organisation.id);

    logger.info("Knowledge deduplication completed", {
      organisationId: organisation.id,
      rootUrl: organisation.rootUrl,
      result,
    });

    return NextResponse.json({
      status: "ok",
      result,
    });
  } catch (error) {
    logger.error("Failed to deduplicate knowledge", {
      error: serializeError(error),
      request: { rawBody },
    });
    return new NextResponse("Failed to deduplicate knowledge", { status: 500 });
  }
};

