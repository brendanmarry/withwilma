import { NextRequest, NextResponse } from "next/server";
import { getAdminTokenFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { logger, serializeError } from "@/lib/logger";

type Params = {
  params: Promise<{ id: string }>;
};

export const DELETE = async (_request: NextRequest, { params }: Params) => {
  const { id } = await params;
  const admin = await getAdminTokenFromRequest();
  if (!admin) {
    return new NextResponse("Unauthorized", { status: 401 });
  }



  try {
    const attachment = await prisma.jobDocument.findUnique({
      where: { id },
      select: { documentId: true, jobId: true },
    });

    if (!attachment) {
      return new NextResponse("Job document not found", { status: 404 });
    }

    // Delete JobDocument first, then the Document (cascade will handle chunks)
    await prisma.$transaction(async (tx) => {
      await tx.jobDocument.delete({
        where: { id },
      });
      await tx.document.delete({
        where: { id: attachment.documentId },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Failed to delete job document", {
      error: serializeError(error),
      request: { id },
    });
    return new NextResponse("Failed to delete job document", { status: 500 });
  }
};

