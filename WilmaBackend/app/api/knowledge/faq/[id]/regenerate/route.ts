import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminTokenFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { regenerateFaqAnswer } from "@/lib/llm/pipelines/faq_answer";
import { logger, serializeError } from "@/lib/logger";

const regenerateInputSchema = z.object({
  question: z.string().optional(),
});

export const POST = async (
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) => {
  const { id } = await params;
  const admin = await getAdminTokenFromRequest();
  if (!admin) {
    return new NextResponse("Unauthorized", { status: 401 });
  }



  let faq = await prisma.fAQ.findUnique({
    where: { id },
    include: { organisation: true },
  });

  if (!faq) {
    return new NextResponse("FAQ not found", { status: 404 });
  }

  let requestQuestion = faq.question;
  try {
    if (request.headers.get("content-type")?.includes("application/json")) {
      const body = await request.json();
      const parsed = regenerateInputSchema.safeParse(body);
      if (parsed.success && parsed.data.question) {
        requestQuestion = parsed.data.question;
      }
    }
  } catch {
    // Ignore invalid JSON – fall back to stored question
  }

  try {
    const answer = await regenerateFaqAnswer({
      organisationId: faq.organisationId,
      question: requestQuestion,
    });

    faq = await prisma.fAQ.update({
      where: { id },
      data: {
        question: requestQuestion,
        answer: answer.answer,
        recruiterApproved: false,
      },
      include: { organisation: true },
    });

    return NextResponse.json({
      faq,
      metadata: {
        confidence: answer.confidence ?? "medium",
        sourceEvidence: answer.source_evidence ?? null,
      },
    });
  } catch (error) {
    logger.error("Failed to regenerate FAQ answer", {
      error: serializeError(error),
      request: {
        faqId: id,
      },
    });
    return new NextResponse("Failed to regenerate FAQ answer", { status: 500 });
  }
};

