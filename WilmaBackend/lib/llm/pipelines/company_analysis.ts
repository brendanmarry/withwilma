import { getOpenAIClient } from "@/lib/llm/client";

export interface CompanyAnalysisResult {
    cultureValues: string[];
    benefits: string[];
    techStack: string[];
    tone: string | null;
}

export const analyzeCompanyWebsite = async (text: string): Promise<CompanyAnalysisResult> => {
    const openai = getOpenAIClient();

    const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            {
                role: "system",
                content: `
      You are an expert Talent Acquisition Strategist. 
      Your goal is to analyze the text content of a company's career page or home page and extract its "Company DNA".
      
      Focus on finding:
      - Core Values (what they stand for)
      - Benefits & Perks (what they offer employees)
      - Technology Stack (if mentioned)
      - Brand Tone (how they sound, e.g. "Formal", "Playful")
      
      Return the result as a Valid JSON object with keys: "cultureValues" (array of strings), "benefits" (array of strings), "techStack" (array of strings), "tone" (string or null).
      If information is missing, do not hallucinate. Return empty arrays or null.
        `
            },
            {
                role: "user",
                content: `Analyze the following text from a company website:\n\n${text.slice(0, 15000)}`
            }
        ],
        response_format: { type: "json_object" }
    });

    const content = completion.choices[0].message.content;
    if (!content) {
        throw new Error("No content received from LLM");
    }

    return JSON.parse(content) as CompanyAnalysisResult;
};
