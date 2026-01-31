import { NextRequest, NextResponse } from "next/server";
import { getAdminTokenFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseS3Url, getDownloadUrl } from "@/lib/storage";
import { logger, serializeError } from "@/lib/logger";

export const GET = async (
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; videoId: string }> },
) => {

  const { id, videoId } = await params;
  const admin = await getAdminTokenFromRequest();
  if (!admin) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const video = await prisma.videoAnswer.findFirst({
      where: {
        id: videoId,
        candidateId: id,
      },
      select: { videoUrl: true },
    });

    if (!video || !video.videoUrl) {
      return new NextResponse("Video not found", { status: 404 });
    }

    // Parse the S3 URL and generate a signed download URL
    const { key } = parseS3Url(video.videoUrl);
    const downloadUrl = await getDownloadUrl(key, 60 * 60); // 1 hour expiry

    // Redirect to the signed URL
    return NextResponse.redirect(downloadUrl);
  } catch (error) {
    logger.error("Failed to get video download URL", {
      error: serializeError(error),
      request: { candidateId: id, videoId },
    });
    return new NextResponse("Failed to get video", { status: 500 });
  }
};

