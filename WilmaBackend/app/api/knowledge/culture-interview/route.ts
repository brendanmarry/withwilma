import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAdminTokenFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { loadPrompt } from "@/lib/llm/prompts";
import { callJsonLLM, LLMJsonError } from "@/lib/llm/utils";
import { logger, serializeError } from "@/lib/logger";

const chatInputSchema = z.object({
    organisationId: z.string(),
    history: z.array(z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string()
    })),
    currentProfile: z.any().optional(), // Pass current known profile context
});

const chatOutputSchema = z.object({
    message: z.string(),
    analysis: z.string().optional(),
    topic: z.string().optional(),
    isComplete: z.boolean().default(false),
});

export const POST = async (request: NextRequest) => {
    const admin = await getAdminTokenFromRequest();
    if (!admin) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const json = await request.json();
        const { organisationId, history, currentProfile } = chatInputSchema.parse(json);

        // Fetch documents to give context
        // We limit this to save tokens, maybe top 5 most recent or relevant?
        // For now, let's just grab the latest 3 documents as "recent context"
        const recentDocs = await prisma.document.findMany({
            where: { organisationId },
            orderBy: { createdAt: "desc" },
            take: 3,
            select: { textContent: true, metadata: true }
        });

        const docContext = recentDocs.map(d =>
            `Source: ${JSON.stringify(d.metadata)}\nContent: ${d.textContent.substring(0, 500)}...`
        ).join("\n\n");

        const systemPromptTemplate = await loadPrompt("culture-interview.md");

        // We don't have a template engine for system prompts yet in the utils, 
        // but usually we pass structured data in the user message or pre-append to history.
        // Let's create a "Context" system message.

        const contextBlock = `
    CURRENT ORGANISATION CONTEXT:
    Profile Summary: ${JSON.stringify(currentProfile)}
    Recent Knowledge Sources:
    ${docContext}
    `;

        // Construct the full conversation for the LLM
        // We merge the context into the system prompt or the first message
        const fullSystemPrompt = `${systemPromptTemplate}\n\n${contextBlock}`;

        // We only send the last few turns to keep it focused if history is long, 
        // but for an interview, context is key. Let's send full history but be mindful of limits.
        // `callJsonLLM` helper takes `userContent`. 
        // It seems `callJsonLLM` is designed for single-turn JSON extraction tasks, taking `systemPrompt` and `userContent`.
        // It enters them as [ {role: system}, {role: user} ].
        // We need to pass a chat history. 
        // The current `callJsonLLM` implementation in `utils.ts` is rigid: 
        // input: [{ role: "system", content: systemPrompt }, { role: "user", content: userContent }]
        //
        // I need to use `getOpenAIClient` directly or modify `callJsonLLM` to support history.
        // Given the constraints and the desire not to break existing utils, I'll instantiate the client here directly
        // mimicking `callJsonLLM` but with history support.

        // Wait, let's look at `callJsonLLM` again. It returns `T`. 
        // I'll write a local version here or genericize it later if needed.

        const client = (await import("@/lib/llm/client")).getOpenAIClient();

        const messages: any[] = [
            { role: "system", content: fullSystemPrompt },
            ...history
        ];

        logger.info("Calling Culture Interview LLM", { messagesCount: messages.length });

        const response = await client.responses.create({
            model: "gpt-4o", // Use a smart model for conversation
            temperature: 0.7,
            input: messages,
        });

        const rawOutput = response.output_text ?? "";

        // Extract JSON
        let jsonString = rawOutput.trim();
        const fenceMatch = jsonString.match(/^```(?:json)?\s*([\s\S]*?)```$/i);
        if (fenceMatch) jsonString = fenceMatch[1].trim();

        const parsed = chatOutputSchema.safeParse(JSON.parse(jsonString));

        if (!parsed.success) {
            logger.error("Failed to parse chat response", { error: parsed.error, rawOutput });
            return NextResponse.json({
                message: "I'm having trouble analyzing that. Could you rephrase?",
                isComplete: false
            });
        }

        // Optionally save the analysis as a new document or just return it?
        // If analysis is present, we could save it as an "Interview Insight".
        // For now, we return it to the frontend to accumulate.

        return NextResponse.json(parsed.data);

    } catch (error) {
        logger.error("Culture Interview API error", { error: serializeError(error) });
        return new NextResponse("Internal Server Error", { status: 500 });
    }
};
