import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { prisma } from "@/lib/db";
import { followupQuestionSchema } from "@/lib/validators";
import { uploadBuffer } from "@/lib/storage";
import { getOpenAIClient } from "@/lib/llm/client";
import { summariseTranscript } from "@/lib/llm/pipelines/transcript_summary";
import { detectAIGeneratedContent } from "@/lib/llm/pipelines/ai_detection";
import { scoreMatch } from "@/lib/llm/pipelines/match_scoring";
import { logger, serializeError } from "@/lib/logger";
import { corsOptionsResponse, withCors } from "@/app/api/_utils/cors";
import { env } from "@/lib/env";
import { parseS3Url, downloadBuffer } from "@/lib/storage";
import { pdfToText } from "@/lib/parsing/pdf";
import { docxToText } from "@/lib/parsing/docx";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const extractTranscriptText = (transcription: unknown): string => {
  if (!transcription) {
    return "";
  }
  if (typeof transcription === "string") {
    return transcription;
  }
  if (typeof transcription === "object") {
    const candidate = transcription as Record<string, unknown>;
    if (typeof candidate.text === "string") {
      return candidate.text;
    }
    if (typeof candidate.transcription === "string") {
      return candidate.transcription;
    }
    if (Array.isArray(candidate.segments)) {
      return candidate.segments
        .map((segment) => {
          if (segment && typeof segment === "object" && "text" in segment && typeof segment.text === "string") {
            return segment.text;
          }
          return "";
        })
        .filter((value) => value.length > 0)
        .join(" ");
    }
  }

  return "";
};

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

    const videoAnswer = await prisma.videoAnswer.create({
      data: {
        candidateId: followup.candidateId,
        followupQuestionId: followup.id,
        videoUrl,
      },
    });

    void processVideoAnswer({
      buffer,
      fileName: video.name,
      mimeType: video.type,
      followupId: followup.id,
      candidateId: followup.candidateId,
      videoUrl,
      videoAnswerId: videoAnswer.id,
    }).catch((processError) => {
      logger.error("Background video processing failed", {
        error: serializeError(processError),
        candidateId: followup.candidateId,
        questionId: followup.id,
        videoAnswerId: videoAnswer.id,
      });
    });

    return withCors(
      NextResponse.json(
        {
          ...videoAnswer,
          processing: true,
        },
        { status: 202 },
      ),
    );
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

type ProcessVideoArgs = {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
  followupId: string;
  candidateId: string;
  videoUrl: string;
  videoAnswerId: string;
};

const processVideoAnswer = async ({
  buffer,
  fileName,
  mimeType,
  followupId,
  candidateId,
  videoUrl,
  videoAnswerId,
}: ProcessVideoArgs) => {
  try {
    const followup = await prisma.followUpQuestion.findUnique({
      where: { id: followupId },
      include: { candidate: { include: { job: true } } },
    });

    if (!followup) {
      logger.error("Follow-up missing during background processing", {
        followupId,
        candidateId,
        videoAnswerId,
      });
      return;
    }

    const envVars = env();
    const client = getOpenAIClient();
    const lowerFileName = fileName.toLowerCase();
    let fileMimeType = mimeType;

    if (!fileMimeType || fileMimeType === "application/octet-stream") {
      if (lowerFileName.endsWith(".webm")) {
        fileMimeType = "video/webm";
      } else if (lowerFileName.endsWith(".mp4")) {
        fileMimeType = "video/mp4";
      } else if (lowerFileName.endsWith(".m4a")) {
        fileMimeType = "audio/m4a";
      } else if (lowerFileName.endsWith(".mp3")) {
        fileMimeType = "audio/mpeg";
      } else if (lowerFileName.endsWith(".wav")) {
        fileMimeType = "audio/wav";
      }
    }

    const model = envVars.OPENAI_TRANSCRIBE_MODEL ?? "whisper-1";

    const transcribeWithRetry = async (): Promise<string> => {
      const maxAttempts = 3;
      for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        try {
          logger.info("Starting transcription", {
            candidateId,
            questionId: followup.id,
            fileName,
            fileSize: buffer.length,
            mimeType: fileMimeType,
            model,
            attempt,
          });

          const transcription = await client.audio.transcriptions.create({
            file: await OpenAI.toFile(buffer, fileName, { type: fileMimeType }),
            model,
            response_format: "text",
            language: "en",
          });

          const extracted = extractTranscriptText(transcription).trim();
          logger.info("Transcription completed", {
            candidateId,
            questionId: followup.id,
            transcriptLength: extracted.length,
            attempt,
          });
          return extracted;
        } catch (error) {
          const serialised = serializeError(error) as any;
          const isNetworkError =
            serialised.code === "ECONNRESET" ||
            serialised.code === "ETIMEDOUT" ||
            serialised.message?.includes("fetch failed") ||
            serialised.message?.includes("network");

          logger.warn("Transcription attempt failed", {
            candidateId,
            questionId: followup.id,
            attempt,
            error: serialised,
          });

          if (!isNetworkError || attempt === maxAttempts) {
            throw error;
          }

          const backoff = 500 * attempt;
          logger.info("Retrying transcription after backoff", {
            candidateId,
            questionId: followup.id,
            attempt,
            backoff,
          });
          await wait(backoff);
        }
      }
      return "";
    };

    let transcriptText = "";
    let summary: Awaited<ReturnType<typeof summariseTranscript>> | null = null;
    let aiDetectionResult: Awaited<ReturnType<typeof detectAIGeneratedContent>> | null = null;

    try {
      transcriptText = await transcribeWithRetry();

      try {
        aiDetectionResult = await detectAIGeneratedContent({
          transcript: transcriptText,
          audioMetadata: { duration: undefined },
        });
      } catch (aiError) {
        logger.warn("AI detection failed", {
          error: serializeError(aiError),
          candidateId,
        });
      }

      summary = await summariseTranscript({
        transcript: transcriptText,
        question: followup.question,
        jobDescription: followup.candidate.job.description,
      });
    } catch (transcriptionError) {
      const errorDetails = serializeError(transcriptionError);
      logger.error("Video transcription failed", {
        error: errorDetails,
        candidateId,
        questionId: followup.id,
        fileName,
        fileSize: buffer.length,
        mimeType,
      });

      if (errorDetails.message?.includes("Unsupported file format")) {
        logger.error("File format not supported by OpenAI transcription API", {
          fileName,
          mimeType,
          supportedFormats: ["mp3", "mp4", "mpeg", "mpga", "m4a", "wav", "webm"],
        });
      }
    }

    const transcriptForStorage =
      summary && summary.clean_transcript && summary.clean_transcript.trim().length > 0
        ? summary.clean_transcript.trim()
        : transcriptText;

    await prisma.videoAnswer.update({
      where: { id: videoAnswerId },
      data: {
        transcript: transcriptForStorage.length > 0 ? transcriptForStorage : undefined,
        aiGeneratedDetected: aiDetectionResult?.isAiGenerated ?? false,
        analysis: summary
          ? {
            keyPoints: summary.key_points,
            recruiterSummary: summary.recruiter_summary,
            aiDetection: aiDetectionResult
              ? {
                isAiGenerated: aiDetectionResult.isAiGenerated,
                confidence: aiDetectionResult.confidence,
                reasoning: aiDetectionResult.reasoning,
                indicators: aiDetectionResult.indicators,
              }
              : undefined,
          }
          : aiDetectionResult
            ? {
              aiDetection: {
                isAiGenerated: aiDetectionResult.isAiGenerated,
                confidence: aiDetectionResult.confidence,
                reasoning: aiDetectionResult.reasoning,
                indicators: aiDetectionResult.indicators,
              },
            }
            : undefined,
      },
    });

    try {
      const candidate = await prisma.candidate.findUnique({
        where: { id: followup.candidateId },
        include: {
          job: { include: { organisation: true } },
          videos: { where: { transcript: { not: null } } },
        },
      });

      if (candidate && candidate.cvUrl && candidate.job) {
        const needsOriginalScore = candidate.originalMatchScore === null && candidate.matchScore !== null;

        let cvText = "";
        try {
          const { key } = parseS3Url(candidate.cvUrl);
          const cvBuffer = await downloadBuffer(key);
          const cvUrlLower = candidate.cvUrl.toLowerCase();
          if (cvUrlLower.endsWith(".pdf")) {
            cvText = await pdfToText(cvBuffer);
          } else if (cvUrlLower.endsWith(".docx")) {
            cvText = await docxToText(cvBuffer);
          } else {
            cvText = cvBuffer.toString("utf-8");
          }
        } catch (cvError) {
          logger.warn("Could not fetch/parse CV for score recalculation", {
            error: serializeError(cvError),
            candidateId: candidate.id,
          });
        }

        const allVideoTranscripts = [
          ...candidate.videos.map((v) => v.transcript).filter((t): t is string => !!t),
          transcriptText || summary?.clean_transcript || "",
        ].filter((t) => t.length > 0);

        if (allVideoTranscripts.length > 0 && cvText) {
          const knowledgeDocs = await prisma.document.findMany({
            where: { organisationId: candidate.job.organisationId },
            orderBy: { createdAt: "desc" },
            take: 10,
          });
          const companyKnowledge = knowledgeDocs.map((doc) => doc.textContent).join("\n\n");

          let screeningAnswers = "";
          if (candidate.screeningData) {
            try {
              const data = typeof candidate.screeningData === 'string'
                ? JSON.parse(candidate.screeningData)
                : candidate.screeningData;

              // Assuming screeningData is a key-value pair or array of objects. 
              // If it's a simple object:
              if (typeof data === 'object' && data !== null) {
                screeningAnswers = Object.entries(data)
                  .map(([k, v]) => `Q: ${k}\nA: ${v}`)
                  .join("\n\n");
              }
            } catch (e) {
              logger.warn("Failed to parse screening data for scoring", { candidateId: candidate.id });
            }
          }

          const updatedMatch = await scoreMatch({
            jobDescription: candidate.job.description,
            cvText,
            companyKnowledge,
            videoTranscripts: allVideoTranscripts,
            linkedinUrl: candidate.linkedin || undefined,
            screeningAnswers: screeningAnswers || undefined,
          });

          await prisma.candidate.update({
            where: { id: candidate.id },
            data: {
              originalMatchScore: needsOriginalScore ? candidate.matchScore : candidate.originalMatchScore,
              updatedMatchScore: Math.round(updatedMatch.match_score),
              matchScore: Math.round(updatedMatch.match_score),
              aiGeneratedDetected: candidate.aiGeneratedDetected || (aiDetectionResult?.isAiGenerated ?? false),
              matchStrengths: updatedMatch.strengths,
              matchGaps: updatedMatch.gaps,
              matchSummary: updatedMatch.experience_summary || updatedMatch.role_alignment_summary,
            },
          });
        }
      }
    } catch (scoreError) {
      logger.error("Failed to recalculate match score", {
        error: serializeError(scoreError),
        candidateId: followup.candidateId,
      });
    }

    logger.info("Background video processing completed", {
      candidateId,
      questionId: followup.id,
      videoAnswerId,
      videoUrl,
    });
  } catch (error) {
    logger.error("Unhandled error during background video processing", {
      error: serializeError(error),
      followupId,
      candidateId,
      videoAnswerId,
      videoUrl,
    });
  }
};

