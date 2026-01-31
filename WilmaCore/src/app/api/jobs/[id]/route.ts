import { NextRequest, NextResponse } from "next/server";
import { getAdminTokenFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { jobUpdateSchema } from "@/lib/validators";
import { logger, serializeError } from "@/lib/logger";

type Params = {
  params: Promise<{ id: string }>;
};

export const GET = async (_request: NextRequest, { params }: Params) => {
  const { id } = await params;
  try {
    const job = await prisma.job.findUnique({
      where: { id },
    });
    if (!job) {
      return new NextResponse("Job not found", { status: 404 });
    }
    return NextResponse.json(job);
  } catch (error) {
    logger.error("Failed to fetch job", {
      error: serializeError(error),
      request: { jobId: id },
    });
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

export const PATCH = async (request: NextRequest, { params }: Params) => {
  const { id } = await params;
  const admin = await getAdminTokenFromRequest();
  if (!admin) {
    return new NextResponse("Unauthorized", { status: 401 });
  }


  let rawBody: unknown;

  try {
    rawBody = await request.json();
    const updates = jobUpdateSchema.parse(rawBody);

    const job = await prisma.job.findUnique({
      where: { id },
    });

    if (!job) {
      return new NextResponse("Job not found", { status: 404 });
    }

    // If status is being set to closed, disable Wilma
    // Otherwise, use the provided wilmaEnabled value or keep current
    const wilmaEnabledValue =
      updates.status === "closed"
        ? false
        : updates.wilmaEnabled !== undefined
          ? updates.wilmaEnabled
          : job.wilmaEnabled;

    // Exclude wilmaEnabled from updates spread to avoid conflicts
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { wilmaEnabled: _, ...otherUpdates } = updates;

    const result = await prisma.job.update({
      where: { id },
      data: {
        ...otherUpdates,
        wilmaEnabled: wilmaEnabledValue,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    logger.error("Failed to update job", {
      error: serializeError(error),
      request: { jobId: id, rawBody },
    });
    return new NextResponse("Failed to update job", { status: 500 });
  }
};

export const DELETE = async (_request: NextRequest, { params }: Params) => {
  const { id } = await params;
  const admin = await getAdminTokenFromRequest();
  if (!admin) {
    return new NextResponse("Unauthorized", { status: 401 });
  }



  try {
    const attachments = await prisma.jobDocument.findMany({
      where: { jobId: id },
      select: { documentId: true },
    });

    await prisma.$transaction(async (tx) => {
      if (attachments.length) {
        const documentIds = attachments.map((attachment) => attachment.documentId);
        await tx.jobDocument.deleteMany({
          where: { jobId: id },
        });
        await tx.document.deleteMany({
          where: { id: { in: documentIds } },
        });
      }
      await tx.job.delete({
        where: { id },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Failed to delete job", {
      error: serializeError(error),
      request: { jobId: id },
    });
    return new NextResponse("Failed to delete job", { status: 500 });
  }
};

