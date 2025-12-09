import { getOpenAIClient } from "../client";
import { SystemMessage, UserMessage } from "../utils";

export type BusinessAnalysis = {
    summary: string;
    roles: string;
    values: string;
    norms: string;
    culture: string;
};

export const analyzeBusinessWebsite = async (
    url: string,
    textContent: string,
): Promise<BusinessAnalysis> => {
    const client = getOpenAIClient();

    const systemPrompt = `You are an expert business analyst and I/O psychologist.
Your task is to analyze the content of a business website and extract key organizational characteristics.
You will be provided with the text content of the website.

Please generate a JSON object with the following fields:
- summary: A concise professional summary of what the business does, its industry, and main products/services (approx 3-4 sentences).
- roles: A description of the types of roles and departments this company likely recruits for, based on its business model (e.g., "Engineering, Sales, Customer Success").
- values: The stated or implied core values of the company (e.g., "Innovation, Customer Obsession, Integrity").
- norms: Behavioral norms and expectations (e.g., "Fast-paced environment, remote-first, collaborative").
- culture: A description of the overall organizational culture (e.g., "A startup culture focused on rapid growth and autonomy").

If the text content is insufficient to determine any specific field, provide a reasonable inference based on the industry and type of business, but prefer specific details found in the text.`;

    const userPrompt = `Website URL: ${url}

Website Content:
${textContent.slice(0, 15000)} // Limit context window usage
`;

    const response = await client.chat.completions.create({
        model: "gpt-4o",
        messages: [
            SystemMessage(systemPrompt),
            UserMessage(userPrompt),
        ],
        response_format: { type: "json_object" },
        temperature: 0.5,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");

    return {
        summary: result.summary || "Could not generate summary.",
        roles: result.roles || "Could not identify roles.",
        values: result.values || "Could not identify values.",
        norms: result.norms || "Could not identify norms.",
        culture: result.culture || "Could not identify culture.",
    };
};
