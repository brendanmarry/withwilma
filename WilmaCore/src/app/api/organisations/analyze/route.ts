import { NextRequest, NextResponse } from "next/server";
import { getAdminTokenFromRequest } from "@/lib/auth";
import { crawlSite } from "@/lib/crawl";
import { analyzeBusinessWebsite } from "@/lib/llm/pipelines/analyze";

export const POST = async (request: NextRequest) => {
    try {
        const admin = await getAdminTokenFromRequest();
        if (!admin) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { url } = await request.json();

        if (!url) {
            return new NextResponse("URL is required", { status: 400 });
        }

        // Crawl the site (shallow crawl just to get the homepage and maybe one level deep for context if needed, 
        // but analyze pipeline limits context anyway, so a single page might be enough. 
        // crawlSite default is depth 2, maxPages 30. Let's limit it for speed).
        const crawlResults = await crawlSite({
            rootUrls: [url],
            depth: 1,
            maxPages: 5,
        });

        if (crawlResults.length === 0) {
            return new NextResponse("Failed to crawl the website. Please check the URL.", { status: 400 });
        }

        // Aggregate text content (homepage is usually first/most important)
        const combinedText = crawlResults.map((r) => r.text).join("\n\n");

        const analysis = await analyzeBusinessWebsite(url, combinedText);

        return NextResponse.json(analysis);
    } catch (error) {
        console.error("Error analyzing organisation:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
};
