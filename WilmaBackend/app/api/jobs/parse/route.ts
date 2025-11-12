import { NextResponse } from "next/server";
import { getAdminTokenFromRequest } from "@/lib/auth";
import { z } from "zod";
import { parseSingleJobPosting } from "@/lib/jobs/parse-single";
import { logger, serializeError } from "@/lib/logger";

const parseJobSchema = z.object({
  jobUrl: z.string().url(),
});

export const POST = async (request: Request) => {
  const admin = await getAdminTokenFromRequest();
  if (!admin) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
    const input = parseJobSchema.parse(rawBody);

    // Fetch the job posting page
    const response = await fetch(input.jobUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    if (!response.ok) {
      return new NextResponse(
        `Failed to fetch job posting: ${response.statusText}`,
        { status: 400 },
      );
    }

    const html = await response.text();
    const preview = await parseSingleJobPosting(html, input.jobUrl);

    return NextResponse.json(preview);
  } catch (error) {
    logger.error("Failed to parse job posting", {
      error: serializeError(error),
      request: {
        rawBody,
      },
    });
    return new NextResponse("Failed to parse job posting", { status: 500 });
  }
};

