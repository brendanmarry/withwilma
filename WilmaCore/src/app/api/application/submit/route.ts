import { NextResponse } from "next/server";
import { applicationSubmitSchema } from "@/lib/validators";
import { prisma } from "@/lib/db";
import { uploadBuffer } from "@/lib/storage";
import { pdfToText } from "@/lib/parsing/pdf";
import { docxToText } from "@/lib/parsing/docx";
import { scoreMatch } from "@/lib/llm/pipelines/match_scoring";
import { generateFollowUps } from "@/lib/llm/pipelines/followups";
import { logger, serializeError } from "@/lib/logger";
import { corsOptionsResponse, withCors } from "@/app/api/_utils/cors";

export const OPTIONS = (request: Request) => corsOptionsResponse(request);

const FALLBACK_FOLLOW_UPS = [
  {
    question: "Can you walk us through a project you are most proud of and why it mattered?",
    reason:
      "We want to understand the type of work you enjoy and how you measure success when stakes are high.",
    competencyTargeted: "Storytelling & Impact",
    fallbackLabel: "Wilma default follow-up",
  },
  {
    question: "What aspects of this role or company excite you the most right now?",
    reason: "Helps the hiring team gauge motivation even when the tailored questions are unavailable.",
    competencyTargeted: "Motivation & Culture Add",
    fallbackLabel: "Wilma default follow-up",
  },
  {
    question: "Tell us about a time you navigated ambiguity and still shipped something valuable.",
    reason:
      "Gives the team a sense of your resilience and ability to execute without perfect information.",
    competencyTargeted: "Execution in Ambiguity",
    fallbackLabel: "Wilma default follow-up",
  },
];

const bufferToText = async (buffer: Buffer, fileName: string, mimeType: string) => {
  if (mimeType.includes("pdf") || fileName.endsWith(".pdf")) {
    return pdfToText(buffer);
  }
  if (
    mimeType.includes(
      "vnd.openxmlformats-officedocument.wordprocessingml.document",
    ) ||
    fileName.endsWith(".docx")
  ) {
    return docxToText(buffer);
  }
  return buffer.toString("utf-8");
};

export const POST = async (request: Request) => {
  let jobId: string | null = null;
  let candidateEmail: string | null = null;
  let fileName: string | null = null;
  try {
    const formData = await request.formData();
    const file = formData.get("cv");
    if (!(file instanceof File)) {
      return withCors(new NextResponse("CV file is required", { status: 400 }), request);
    }

    const fields = applicationSubmitSchema.parse({
      jobId: formData.get("jobId"),
      name: formData.get("name"),
      email: formData.get("email"),
      linkedin: formData.get("linkedin") ?? undefined,
      screeningData: formData.get("screeningData") ?? undefined,
    });

    jobId = fields.jobId;
    candidateEmail = fields.email;
    fileName = file.name;

    const job = await prisma.job.findUnique({
      where: { id: fields.jobId },
      include: { organisation: true },
    });

    if (!job) {
      return withCors(new NextResponse("Job not found", { status: 404 }), request);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const cvUrl = await uploadBuffer({
      fileName: file.name,
      contentType: file.type,
      buffer,
      folder: `candidates/${fields.jobId}`,
    });

    const cvText = await bufferToText(buffer, file.name, file.type);

    const knowledgeDocs = await prisma.document.findMany({
      where: { organisationId: job.organisationId },
      orderBy: { createdAt: "desc" },
      take: 3,
    });
    const companyKnowledge = knowledgeDocs.map((doc) => doc.textContent).join("\n\n");

    const match = await scoreMatch({
      jobDescription: job.description,
      cvText,
      companyKnowledge,
    });

    const candidate = await prisma.candidate.create({
      data: {
        jobId: job.id,
        name: fields.name,
        email: fields.email,
        linkedin: fields.linkedin,
        cvUrl,
        matchScore: Math.round(match.match_score),
        summary: match.role_alignment_summary,
        extractedSkills: match.extracted_skills ?? [],
        matchStrengths: match.strengths ?? [],
        matchGaps: match.gaps ?? [],
        matchSummary: match.experience_summary || match.role_alignment_summary,
        screeningData: fields.screeningData ? JSON.parse(fields.screeningData as string) : undefined,
      },
    });

    let followupRecords: Array<
      Awaited<ReturnType<(typeof prisma)["followUpQuestion"]["create"]>> & {
        isFallback?: boolean;
        fallbackLabel?: string;
      }
    > = [];
    try {
      const followUps = await generateFollowUps({
        matchSummary: {
          ...match,
          instruction: "Identify ONE key skill or experience gap in the CV related to the JD and ask an insightful question to address it. Keep it to exactly 1 question."
        },
        count: 1
      });
      const records = await prisma.$transaction(
        followUps.follow_up_questions.map((item) =>
          prisma.followUpQuestion.create({
            data: {
              candidateId: candidate.id,
              question: item.question,
              reason: item.why_this_question,
              competencyTargeted: item.competency_targeted,
            },
          }),
        ),
      );
      followupRecords = records.map((record) => ({
        ...record,
        isFallback: false,
        fallbackLabel: undefined,
      }));
    } catch (generateError) {
      logger.error("Failed to generate follow up questions", {
        error: serializeError(generateError),
        candidateId: candidate.id,
      });
      const records = await prisma.$transaction(
        FALLBACK_FOLLOW_UPS.map((item) =>
          prisma.followUpQuestion.create({
            data: {
              candidateId: candidate.id,
              question: item.question,
              reason: item.reason,
              competencyTargeted: item.competencyTargeted,
            },
          }),
        ),
      );
      followupRecords = records.map((record, index) => ({
        ...record,
        isFallback: true,
        fallbackLabel: FALLBACK_FOLLOW_UPS[index]?.fallbackLabel ?? "Wilma default follow-up",
      }));
    }

    return withCors(
      NextResponse.json({
        applicationId: candidate.id,
        matchScore: candidate.matchScore,
        recommendedQuestions: followupRecords,
      }),
      request
    );
  } catch (error: any) {
    logger.error("Failed to submit application", {
      error: serializeError(error),
      request: {
        jobId,
        candidateEmail,
        fileName,
      },
    });

    if (error.name === "ZodError" || error.issues) {
      return withCors(new NextResponse(JSON.stringify({ error: "Validation failed", details: error.issues }), { status: 400 }), request);
    }

    return withCors(new NextResponse(JSON.stringify({ error: "Failed to submit application", details: error.message }), { status: 500 }), request);
  }
};

