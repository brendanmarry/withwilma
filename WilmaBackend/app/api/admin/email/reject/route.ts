import { NextResponse } from "next/server";
import { getAdminTokenFromRequest } from "@/lib/auth";
import { emailTemplateSchema } from "@/lib/validators";
import { generateEmailTemplate } from "@/lib/llm/pipelines/email_templates";
import { logger, serializeError } from "@/lib/logger";

export const POST = async (request: Request) => {
  const admin = await getAdminTokenFromRequest();
  if (!admin) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
    const input = emailTemplateSchema.parse({ ...rawBody, type: "reject" });
    const template = await generateEmailTemplate(input);
    return NextResponse.json(template);
  } catch (error) {
    logger.error("Failed to generate rejection email", {
      error: serializeError(error),
      request: {
        rawBody,
      },
    });
    return new NextResponse("Failed to generate rejection email", {
      status: 500,
    });
  }
};

