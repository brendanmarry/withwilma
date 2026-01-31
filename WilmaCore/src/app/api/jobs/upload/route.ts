import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminTokenFromRequest } from "@/lib/auth";
import { ensureOrganisationByRootUrl } from "@/lib/organisation";
import { ingestDocuments, type IngestSourceType } from "@/lib/llm/pipelines/ingestion";
import { normaliseJob } from "@/lib/llm/pipelines/job_normalisation";
import { generateJobLayout } from "@/lib/llm/pipelines/job_layout";
import { validateJobDescription } from "@/lib/llm/pipelines/job_validation";
import { prisma } from "@/lib/db";
import { logger, serializeError } from "@/lib/logger";
import { indexJobDescription } from "@/lib/vector/retriever";

const uploadSchema = z.object({
  rootUrl: z.string().url(),
  jobId: z.string().uuid().optional(),
});

const detectType = (fileName: string, mimeType: string | undefined): IngestSourceType => {
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
  let jobId: string | null = null;
  let fileNames: string[] = [];

  try {
    const formData = await request.formData();
    const rawJobId = formData.get("jobId");
    const payload = uploadSchema.safeParse({
      rootUrl: formData.get("rootUrl"),
      jobId: rawJobId ? String(rawJobId) : undefined,
    });

    if (!payload.success) {
      return new NextResponse("Invalid upload payload", { status: 400 });
    }

    rootUrl = payload.data.rootUrl;
    jobId = payload.data.jobId ?? null;

    const organisation = await ensureOrganisationByRootUrl(rootUrl);

    if (jobId) {
      const job = await prisma.job.findFirst({
        where: {
          id: jobId,
          organisationId: organisation.id,
        },
      });
      if (!job) {
        return new NextResponse("Job not found for organisation", { status: 404 });
      }
    }

    const files = formData.getAll("files");
    if (!files.length) {
      return new NextResponse("No files uploaded", { status: 400 });
    }

    const preparedItems = await Promise.all(
      files.map(async (entry) => {
        if (!(entry instanceof File)) {
          throw new Error("Invalid file upload");
        }
        const arrayBuffer = await entry.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        return {
          type: detectType(entry.name, entry.type),
          buffer,
          mimeType: entry.type,
          metadata: {
            originalName: entry.name,
            category: "job",
            jobId,
          },
        };
      }),
    );

    fileNames = preparedItems.map((item) => String(item.metadata?.originalName ?? ""));

    const { documents } = await ingestDocuments({
      organisationId: organisation.id,
      items: preparedItems,
    });

    // Create or update JobDocument links, avoiding duplicates
    const jobDocuments = await Promise.all(
      documents.map(async (document, index) => {
        const originalName = preparedItems[index]?.metadata?.originalName as
          | string
          | undefined;

        if (jobId) {
          // Check if JobDocument already exists for this job
          const existing = await prisma.jobDocument.findFirst({
            where: {
              jobId,
              documentId: document.id,
            },
          });

          if (existing) {
            // Update existing link
            return prisma.jobDocument.update({
              where: { id: existing.id },
              data: {
                metadata: {
                  originalName,
                },
              },
            });
          }

          // Create new link (use upsert to handle race conditions)
          return prisma.jobDocument.upsert({
            where: {
              jobId_documentId: {
                jobId,
                documentId: document.id,
              },
            },
            update: {
              metadata: {
                originalName,
              },
            },
            create: {
              jobId,
              documentId: document.id,
              metadata: {
                originalName,
              },
            },
          });
        }

        // No jobId - check if document already has a JobDocument link
        const existing = await prisma.jobDocument.findFirst({
          where: {
            documentId: document.id,
            jobId: null,
          },
        });

        if (existing) {
          // Update existing unassigned link
          return prisma.jobDocument.update({
            where: { id: existing.id },
            data: {
              metadata: {
                originalName,
              },
            },
          });
        }

        // Create new unassigned link
        return prisma.jobDocument.create({
          data: {
            jobId: null,
            documentId: document.id,
            metadata: {
              originalName,
            },
          },
        });
      }),
    );

    const createdJobs: string[] = [];

    if (!jobId) {
      const uploadSourceUrl = `${organisation.rootUrl}#job-upload`;
      const uploadSource = await prisma.jobSource.upsert({
        where: {
          organisationId_url: {
            organisationId: organisation.id,
            url: uploadSourceUrl,
          },
        },
        update: {
          type: "upload",
          label: "Uploaded job documents",
          lastFetchedAt: new Date(),
        },
        create: {
          organisationId: organisation.id,
          url: uploadSourceUrl,
          type: "upload",
          label: "Uploaded job documents",
          lastFetchedAt: new Date(),
        },
      });

      for (let index = 0; index < documents.length; index += 1) {
        const document = documents[index];
        const attachment = jobDocuments[index];
        const text = document.textContent;
        if (!text?.trim()) {
          logger.warn("Uploaded job document missing text content", {
            documentId: document.id,
            organisationId: organisation.id,
          });
          continue;
        }

        try {
          const parsingConfig = organisation.jobParsingConfig as any;
          const customInstructions = parsingConfig?.customInstructions;

          // Run both pipelines in parallel
          const [normalised, layoutConfig] = await Promise.all([
            normaliseJob({ raw: text, customInstructions }),
            generateJobLayout({ raw: text })
          ]);

          const title =
            normalised.title?.trim() ||
            (attachment.metadata as any)?.originalName?.replace(/\.[^/.]+$/, "") ||
            "";
          if (!title) {
            logger.warn("Unable to derive job title from uploaded document", {
              documentId: document.id,
              organisationId: organisation.id,
            });
            continue;
          }

          const location = normalised.location?.trim() ?? "";
          const description =
            normalised.clean_text?.trim() || text.trim().slice(0, 12000);
          const employmentType = normalised.employment_type?.trim() || undefined;
          const department = normalised.department?.trim() || undefined;

          const validation = await validateJobDescription({
            title,
            location,
            description,
            normalised,
          });

          if (!validation.is_valid) {
            logger.warn("Job validation failed for uploaded document", {
              documentId: document.id,
              organisationId: organisation.id,
              reasons: validation.reasons,
            });
          }

          const job = await prisma.job.upsert({
            where: {
              organisationId_title_location: {
                organisationId: organisation.id,
                title,
                location,
              },
            },
            update: {
              department,
              employmentType,
              description,
              normalizedJson: normalised as any,
              layoutConfig: layoutConfig as any,
              jobSourceId: uploadSource.id,
              sourceUrl: uploadSource.url,
              status: "open",
            },
            create: {
              organisationId: organisation.id,
              title,
              location,
              department,
              employmentType,
              description,
              normalizedJson: normalised as any,
              layoutConfig: layoutConfig as any,
              jobSourceId: uploadSource.id,
              sourceUrl: uploadSource.url,
              status: "open",
            },
          });

          await prisma.jobDocument.update({
            where: { id: attachment.id },
            data: { jobId: job.id },
          });

          await indexJobDescription(job, description);

          createdJobs.push(job.id);
        } catch (innerError) {
          logger.error("Failed to create job from uploaded document", {
            error: serializeError(innerError),
            documentId: document.id,
            organisationId: organisation.id,
          });
        }
      }
    }

    return NextResponse.json(
      {
        uploaded: documents.length,
        createdJobs,
      },
      { status: 201 },
    );
  } catch (error) {
    logger.error("Failed to upload job documents", {
      error: serializeError(error),
      request: {
        rootUrl,
        jobId,
        fileNames,
      },
    });
    return new NextResponse("Failed to upload job documents", { status: 500 });
  }
};

