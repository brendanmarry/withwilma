import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { prisma } from "@/lib/db";
import { followupQuestionSchema } from "@/lib/validators";
import { uploadBuffer } from "@/lib/storage";
import { getOpenAIClient } from "@/lib/llm/client";
import { summariseTranscript } from "@/lib/llm/pipelines/transcript_summary";
import { logger, serializeError } from "@/lib/logger";
import { corsOptionsResponse, withCors } from "@/app/api/_utils/cors";
import { env } from "@/lib/env";

export const POST = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const { id } = await params;
  let questionIdValue: string | null = null;
  try {
    const formData = await request.formData();
    const questionId = formData.get("questionId");
    const video = formData.get("video");

    if (typeof questionId === "string") {
      questionIdValue = questionId;
    }

    if (!(video instanceof File)) {
      return withCors(new NextResponse("Video file is required", { status: 400 }));
    }

    const parsed = followupQuestionSchema.parse({ questionId });

    const followup = await prisma.followUpQuestion.findUnique({
      where: { id: parsed.questionId, candidateId: id },
      include: { candidate: { include: { job: true } } },
    });

    if (!followup) {
      return withCors(new NextResponse("Follow-up question not found", { status: 404 }));
    }

    const buffer = Buffer.from(await video.arrayBuffer());

    const videoUrl = await uploadBuffer({
      fileName: video.name,
      contentType: video.type,
      buffer,
      folder: `videos/${id}`,
    });

    let summary: Awaited<ReturnType<typeof summariseTranscript>> | null = null;
    try {
      const envVars = env();
      const client = getOpenAIClient();
      const transcription = await client.audio.transcriptions.create({
        file: await OpenAI.toFile(buffer, video.name, { type: video.type }),
        model: envVars.OPENAI_TRANSCRIBE_MODEL ?? "gpt-4o-mini-transcribe",
        response_format: "text",
      });

      summary = await summariseTranscript({
        transcript: transcription ?? "",
        question: followup.question,
        jobDescription: followup.candidate.job.description,
      });
    } catch (llmError) {
      logger.warn("Video processing fallback: transcription disabled", {
        error: serializeError(llmError),
        candidateId: id,
        questionId: followup.id,
      });
    }

    const videoAnswer = await prisma.videoAnswer.create({
      data: {
        candidateId: followup.candidateId,
        followupQuestionId: followup.id,
        videoUrl,
        transcript: summary?.clean_transcript,
        analysis: summary
          ? {
              keyPoints: summary.key_points,
              recruiterSummary: summary.recruiter_summary,
            }
          : null,
      },
    });

    return withCors(NextResponse.json(videoAnswer, { status: 201 }));
  } catch (error) {
    logger.error("Failed to upload follow-up video", {
      error: serializeError(error),
      request: {
        candidateId: id,
        questionId: questionIdValue,
      },
    });
    return withCors(new NextResponse("Failed to upload video", { status: 500 }));
  }
};

export const OPTIONS = () => corsOptionsResponse();

