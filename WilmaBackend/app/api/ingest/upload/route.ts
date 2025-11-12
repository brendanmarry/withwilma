import { NextResponse } from "next/server";
import { getAdminTokenFromRequest } from "@/lib/auth";
import { ingestDocuments } from "@/lib/llm/pipelines/ingestion";
import { ensureOrganisationByRootUrl } from "@/lib/organisation";
import { z } from "zod";
import { logger, serializeError } from "@/lib/logger";

const detectType = (fileName: string, mimeType: string | undefined) => {
  if (mimeType?.includes("pdf") || fileName.endsWith(".pdf")) return "pdf";
  if (
    mimeType?.includes("vnd.openxmlformats-officedocument.wordprocessingml.document") ||
    fileName.endsWith(".docx")
  )
    return "docx";
  return "text";
};

export const POST = async (request: Request) => {
  const admin = await getAdminTokenFromRequest();
  if (!admin) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  let rootUrl: string | null = null;
  let fileNames: string[] = [];
  try {
    const formData = await request.formData();
    const rootUrlField = formData.get("rootUrl");
    const parsedRoot = z.string().url().safeParse(rootUrlField);

    if (!parsedRoot.success) {
      return new NextResponse("Invalid rootUrl", { status: 400 });
    }

    const organisation = await ensureOrganisationByRootUrl(parsedRoot.data);

    const files = formData.getAll("files");
    if (!files.length) {
      return new NextResponse("No files uploaded", { status: 400 });
    }

    rootUrl = parsedRoot.data;
    fileNames = files
      .map((file) => (file instanceof File ? file.name : null))
      .filter((name): name is string => Boolean(name));

    await ingestDocuments({
      organisationId: organisation.id,
      items: await Promise.all(
        files.map(async (file) => {
          if (!(file instanceof File)) {
            throw new Error("Invalid file upload");
          }
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          return {
            type: detectType(file.name, file.type),
            buffer,
            mimeType: file.type,
            metadata: { originalName: file.name },
          };
        }),
      ),
    });

    return NextResponse.json({ uploaded: files.length }, { status: 201 });
  } catch (error) {
    logger.error("Failed to ingest documents", {
      error: serializeError(error),
      request: {
        rootUrl,
        fileNames,
      },
    });
    return new NextResponse("Failed to ingest documents", { status: 500 });
  }
};

