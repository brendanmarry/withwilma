import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { callJsonLLM } from "@/lib/llm/utils";
import { z } from "zod";

const chatSchema = z.object({
    message: z.string(),
});

export const POST = async (request: NextRequest, { params }: { params: { id: string } }) => {
    const { id: organisationId } = params;

    try {
        const { message } = chatSchema.parse(await request.json());

        const organisation = await prisma.organisation.findUnique({
            where: { id: organisationId },
            include: {
                documents: { take: 10 },
                faqs: { where: { recruiterApproved: true } }
            }
        });

        if (!organisation) {
            return new NextResponse("Organisation not found", { status: 404 });
        }

        const context = [
            `Organisation Name: ${organisation.name}`,
            `Culture & Values: ${organisation.cultureValues?.join(", ")}`,
            `Benefits: ${organisation.benefits?.join(", ")}`,
            `Tech Stack: ${organisation.techStack?.join(", ")}`,
            ...organisation.faqs.map(f => `Q: ${f.question}\nA: ${f.answer}`),
            ...organisation.documents.map(d => d.textContent)
        ].join("\n\n");

        const response = await callJsonLLM({
            systemPrompt: `You are Wilma, a recruitment assistant for ${organisation.name}. 
            Answer questions from potential candidates based on the provided company knowledge. 
            Be helpful, warm, and professional. 
            If you don't know the answer, be honest and suggest they apply to find out more from the team.
            
            Company Context:
            ${context}`,
            userContent: message,
            schema: z.object({ answer: z.string() })
        });

        return NextResponse.json(response);
    } catch (error) {
        console.error("Chat error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
};
