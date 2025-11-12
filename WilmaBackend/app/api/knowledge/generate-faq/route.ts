import { NextResponse } from "next/server";
import { getAdminTokenFromRequest } from "@/lib/auth";
import { generateFaqSchema } from "@/lib/validators";
import { generateFAQs } from "@/lib/llm/pipelines/question_generation";
import { ensureOrganisationByRootUrl } from "@/lib/organisation";
import { logger, serializeError } from "@/lib/logger";

export const POST = async (request: Request) => {
  const admin = await getAdminTokenFromRequest();
  if (!admin) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
    const input = generateFaqSchema.parse(rawBody);
    const organisation = await ensureOrganisationByRootUrl(input.rootUrl);
    const faqs = await generateFAQs({
      organisationId: organisation.id,
      maxItems: input.maxItems,
    });
    return NextResponse.json({ faqs });
  } catch (error) {
    logger.error("Failed to generate FAQs", {
      error: serializeError(error),
      request: {
        rawBody,
      },
    });
    return new NextResponse("Failed to generate FAQs", { status: 500 });
  }
};

