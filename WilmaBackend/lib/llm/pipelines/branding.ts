import { z } from "zod";
import { loadPrompt } from "@/lib/llm/prompts";
import { callJsonLLM } from "@/lib/llm/utils";

const brandingSchema = z.object({
    logoUrl: z.string().nullable(),
    primaryColor: z.string().nullable(),
});

export const extractBrandingFromHtml = async (
    html: string,
    baseUrl: string
): Promise<{ logoUrl: string | null; primaryColor: string | null }> => {
    // Truncate HTML to save tokens, focusing on head and early body where logo/styles usually live
    const truncatedHtml = html.substring(0, 15000);

    const systemPrompt = await loadPrompt("branding-extraction.md");
    const userContent = `BASE URL: ${baseUrl}\n\nHTML SNIPPET:\n${truncatedHtml}`;

    try {
        const result = await callJsonLLM({
            systemPrompt,
            userContent,
            schema: brandingSchema,
            model: "gpt-4o-mini", // Fast model is sufficient for extraction
        });

        // Simple post-processing to ensure absolute URLs
        let logoUrl = result.logoUrl;
        if (logoUrl && !logoUrl.startsWith("http")) {
            try {
                logoUrl = new URL(logoUrl, baseUrl).toString();
            } catch {
                // Keep as is or nullify if invalid
            }
        }

        return { ...result, logoUrl };
    } catch (error) {
        console.warn("Branding extraction failed", error);
        return { logoUrl: null, primaryColor: null };
    }
};
