import { getOpenAIClient } from "@/lib/llm/client";

export const generateScreeningQuestion = async (
    cvText: string,
    jobDescription: string
): Promise<string> => {
    const openai = getOpenAIClient();

    const systemPrompt = `
    You are an expert Technical Recruiter.
    Your goal is to compare a Candidate's CV against a Job Description.
    Identify **one key skill or requirement** from the JD that is NOT clearly evident or is weak in the CV.
    
    Generate **one specific video interview question** (max 2 sentences) to ask the candidate about this gap.
    The question should be friendly but direct.
    
    Example:
    "I noticed you have great experience with React, but the role requires deeper knowledge of Next.js server actions. Can you tell us about a time you implemented advanced server-side logic?"
  `;

    const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            { role: "system", content: systemPrompt },
            {
                role: "user",
                content: `
        JOB DESCRIPTION:
        ${jobDescription.slice(0, 5000)}

        CANDIDATE CV:
        ${cvText.slice(0, 5000)}
        `,
            },
        ],
    });

    return completion.choices[0].message.content || "Could you tell us more about your experience relevant to this role?";
};
