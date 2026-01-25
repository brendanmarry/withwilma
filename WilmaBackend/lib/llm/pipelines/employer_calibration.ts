import { getOpenAIClient } from "@/lib/llm/client";

interface CompanyContext {
    cultureValues: string[];
    benefits: string[];
    tone: string | null;
    techStack: string[];
}

export const generateCalibrationQuestion = async (
    context: CompanyContext,
    chatHistory: Array<{ role: "system" | "user" | "assistant"; content: string }>
) => {
    const openai = getOpenAIClient();

    const systemPrompt = `
    You are Wilma, an expert AI Recruiter interacting with a Hiring Manager or Head of Talent.
    
    Your goal is to "Calibrate" your understanding of the company.
    You have extracted some initial data (Values, Benefits, Tone) from their website.
    
    Now, you must ask engaging, specific, and strategic questions to:
    1. Validate what you found (e.g., "I saw 'Innovation' is a value. How does that look in practice?").
    2. Dig deeper into "Must-haves" vs "Nice-to-haves" for candidates.
    3. Uncover the "unwritten rules" of the company culture.
    
    Current Extracted Context:
    - Values: ${context.cultureValues.join(", ")}
    - Benefits: ${context.benefits.join(", ")}
    - Tone: ${context.tone || "Unknown"}
    
    Keep your questions conversational, short, and impactful. Ask one question at a time.
  `;

    const messages = [
        { role: "system", content: systemPrompt },
        ...chatHistory,
    ];

    const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: messages as any,
    });

    return completion.choices[0].message.content;
};
