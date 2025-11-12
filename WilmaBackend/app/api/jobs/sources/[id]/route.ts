import { NextRequest, NextResponse } from "next/server";
import { getAdminTokenFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { logger, serializeError } from "@/lib/logger";

type Params = {
  params: { id: string };
};

export const DELETE = async (_request: NextRequest, { params }: Params) => {
  const admin = await getAdminTokenFromRequest();
  if (!admin) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = params;

  try {
    const source = await prisma.jobSource.findUnique({
      where: { id },
      select: {
        id: true,
        organisationId: true,
        jobs: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!source) {
      return new NextResponse("Job source not found", { status: 404 });
    }

    const jobIds = source.jobs.map((job) => job.id);

    if (jobIds.length) {
      const attachments = await prisma.jobDocument.findMany({
        where: { jobId: { in: jobIds } },
        select: { documentId: true },
      });
      const documentIds = attachments.map((attachment) => attachment.documentId);

      await prisma.$transaction(async (tx) => {
        if (documentIds.length) {
          await tx.jobDocument.deleteMany({
            where: { jobId: { in: jobIds } },
          });
          await tx.document.deleteMany({
            where: { id: { in: documentIds } },
          });
        }
        await tx.job.deleteMany({
          where: { id: { in: jobIds } },
        });
        await tx.jobSource.delete({
          where: { id },
        });
      });
    } else {
      await prisma.jobSource.delete({
        where: { id },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Failed to delete job source", {
      error: serializeError(error),
      request: { id },
    });
    return new NextResponse("Failed to delete job source", { status: 500 });
  }
};

