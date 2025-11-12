import { NextResponse } from "next/server";
import { getAdminTokenFromRequest } from "@/lib/auth";
import { jobsSelectSchema } from "@/lib/validators";
import { prisma } from "@/lib/db";
import { logger, serializeError } from "@/lib/logger";

export const POST = async (request: Request) => {
  const admin = await getAdminTokenFromRequest();
  if (!admin) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
    const input = jobsSelectSchema.parse(rawBody);
    const result = await prisma.job.updateMany({
      where: { id: { in: input.jobIds } },
      data: { wilmaEnabled: input.wilmaEnabled },
    });
    return NextResponse.json({ updatedCount: result.count });
  } catch (error) {
    logger.error("Failed to update jobs selection", {
      error: serializeError(error),
      request: {
        rawBody,
      },
    });
    return new NextResponse("Failed to update jobs", { status: 500 });
  }
};

