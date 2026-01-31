import { z } from "zod";
import { loadPrompt } from "@/lib/llm/prompts";
import { callJsonLLM } from "@/lib/llm/utils";

// Schema for a single section in the layout
export const layoutSectionSchema = z.object({
    type: z.enum(["header", "text", "list", "key_value"]),
    title: z.string().optional().describe("Title of the section to display, e.g. 'Responsibilities'"),
    dataKey: z.enum([
        "summary",
        "responsibilities",
        "requirements",
        "nice_to_have",
        "description",
        "location",
        "employment_type",
        "department"
    ]).optional().describe("The key in the normalized data to bind to this section"),
    staticContent: z.string().optional().describe("Static text content if not bound to data"),
    style: z.enum(["standard", "bullet", "numbered", "pill", "centered"]).optional().default("standard")
});

export const jobLayoutSchema = z.object({
    sections: z.array(layoutSectionSchema),
    theme: z.object({
        primaryColor: z.string().optional(),
        secondaryColor: z.string().optional(),
        details: z.string().optional().describe("Layout style description detected, e.g. 'minimalist', 'corporate'")
    }).optional()
});

export type JobLayout = z.infer<typeof jobLayoutSchema>;

export const generateJobLayout = async ({
    raw,
}: {
    raw: string;
}): Promise<JobLayout> => {
    const prompt = await loadPrompt("job-layout-analysis.md");

    // We want the AI to look at the raw text and infer the visual structure.
    // It should map "Data" (like specific responsibilities) to our known keys (dataKey),
    // but keep the Section Headers and Order as they appear in the doc.

    const result = await callJsonLLM({
        systemPrompt: prompt,
        userContent: raw,
        schema: jobLayoutSchema,
    });

    return jobLayoutSchema.parse(result);
};
