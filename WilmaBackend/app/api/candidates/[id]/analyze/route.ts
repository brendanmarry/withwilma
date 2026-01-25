import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateScreeningQuestion } from "@/lib/llm/pipelines/cv_analysis";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const candidate = await prisma.candidate.findUnique({
            where: { id },
            include: { job: true },
        });

        if (!candidate || !candidate.job) {
            return NextResponse.json({ error: "Candidate or Job not found" }, { status: 404 });
        }

        // In a real scenario, we would download the CV content from the URL (MinIO/S3).
        // For this MVP, we might assume text is extracted or just use a placeholder if extraction isn't ready.
        // However, the prompt implies we have text. 
        // Let's assume 'extractedSkills' or similar might hold text, or we mock it for now if we don't have a file reader here.
        // For MVP robustness, let's mock the text extraction if 'cvUrl' exists, or default to checking the summary.

        // TODO: Integrate actual File Parsing (PDF/Docx) here using 'candidate.cvUrl'
        const mockCvText = candidate.summary || "Candidate CV content placeholder.";

        const question = await generateScreeningQuestion(
            mockCvText,
            candidate.job.description
        );

        // Save the question
        const followUp = await prisma.followUpQuestion.create({
            data: {
                candidateId: candidate.id,
                question: question,
                reason: "Generated from CV vs JD gap analysis",
            },
        });

        return NextResponse.json({ question: followUp });
    } catch (error) {
        console.error("Error analyzing candidate:", error);
        return NextResponse.json(
            { error: "Failed to analyze candidate" },
            { status: 500 }
        );
    }
}
