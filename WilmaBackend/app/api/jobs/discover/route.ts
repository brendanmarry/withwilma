import { NextResponse } from "next/server";
import { getAdminTokenFromRequest } from "@/lib/auth";
import { z } from "zod";
import { discoverJobUrls } from "@/lib/jobs/discover-urls";
import { logger, serializeError } from "@/lib/logger";

const discoverSchema = z.object({
  rootUrl: z.string().url(),
  maxUrls: z.number().int().min(1).max(100).optional().default(50),
});

export const POST = async (request: Request) => {
  const admin = await getAdminTokenFromRequest();
  if (!admin) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
    const input = discoverSchema.parse(rawBody);

    const discovered = await discoverJobUrls(input.rootUrl, input.maxUrls);

    return NextResponse.json({ urls: discovered });
  } catch (error) {
    logger.error("Failed to discover job URLs", {
      error: serializeError(error),
      request: {
        rawBody,
      },
    });
    return new NextResponse("Failed to discover job URLs", { status: 500 });
  }
};

