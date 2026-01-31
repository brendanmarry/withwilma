import { NextRequest, NextResponse } from "next/server";
import { getAdminTokenFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { updateFaqSchema } from "@/lib/validators";
import { logger, serializeError } from "@/lib/logger";

export const PUT = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {

  const { id } = await params;
  const admin = await getAdminTokenFromRequest();
  if (!admin) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
    const input = updateFaqSchema.parse(rawBody);
    const updated = await prisma.fAQ.update({
      where: { id },
      data: {
        question: input.question ?? undefined,
        answer: input.answer ?? undefined,
        recruiterApproved: input.recruiterApproved ?? undefined,
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    logger.error("Failed to update FAQ", {
      error: serializeError(error),
      request: {
        faqId: id,
        rawBody,
      },
    });
    return new NextResponse("Failed to update FAQ", { status: 500 });
  }
};

