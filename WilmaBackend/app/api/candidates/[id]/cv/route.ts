import { NextRequest, NextResponse } from "next/server";
import { getAdminTokenFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseS3Url, getDownloadUrl } from "@/lib/storage";
import { logger, serializeError } from "@/lib/logger";

export const GET = async (
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const { id } = await params;
  const admin = await getAdminTokenFromRequest();
  if (!admin) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const candidate = await prisma.candidate.findUnique({
      where: { id },
      select: { cvUrl: true },
    });

    if (!candidate || !candidate.cvUrl) {
      return new NextResponse("CV not found", { status: 404 });
    }

    // Parse the S3 URL and generate a signed download URL
    const { key } = parseS3Url(candidate.cvUrl);
    const downloadUrl = await getDownloadUrl(key, 60 * 60); // 1 hour expiry

    // Redirect to the signed URL
    return NextResponse.redirect(downloadUrl);
  } catch (error) {
    logger.error("Failed to get CV download URL", {
      error: serializeError(error),
      request: { candidateId: id },
    });
    return new NextResponse("Failed to get CV", { status: 500 });
  }
};

