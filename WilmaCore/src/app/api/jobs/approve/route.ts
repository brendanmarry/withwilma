import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getAdminTokenFromRequest } from "@/lib/auth";
import { z } from "zod";
import { ensureOrganisationByRootUrl } from "@/lib/organisation";
import { prisma } from "@/lib/db";
import { indexJobDescription } from "@/lib/vector/retriever";
import { ingestDocuments } from "@/lib/llm/pipelines/ingestion";
import { logger, serializeError } from "@/lib/logger";

const approveJobSchema = z.object({
  rootUrl: z.string().url(),
  jobUrl: z.string().url(),
  title: z.string().min(1),
  location: z.string().optional(),
  department: z.string().optional(),
  employmentType: z.string().optional(),
  description: z.string().min(1),
  normalizedJson: z.record(z.unknown()).optional(),
  wilmaEnabled: z.boolean().default(true),
});

export const POST = async (request: Request) => {
  const admin = await getAdminTokenFromRequest();
  if (!admin) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
    const input = approveJobSchema.parse(rawBody);

    const organisation = await ensureOrganisationByRootUrl(input.rootUrl);

    // Create or get job source for URL-based jobs
    const jobSource = await prisma.jobSource.upsert({
      where: {
        organisationId_url: {
          organisationId: organisation.id,
          url: input.jobUrl,
        },
      },
      update: {
        type: "manual",
        label: "Job posting URL",
        lastFetchedAt: new Date(),
      },
      create: {
        organisationId: organisation.id,
        url: input.jobUrl,
        type: "manual",
        label: "Job posting URL",
        lastFetchedAt: new Date(),
      },
    });

    // Create or update the job
    const job = await prisma.job.upsert({
      where: {
        organisationId_title_location: {
          organisationId: organisation.id,
          title: input.title,
          location: input.location || "",
        },
      },
      update: {
        department: input.department,
        employmentType: input.employmentType,
        description: input.description,
        normalizedJson: input.normalizedJson as Prisma.InputJsonValue,
        jobSourceId: jobSource.id,
        sourceUrl: input.jobUrl,
        status: "open",
        wilmaEnabled: input.wilmaEnabled,
      },
      create: {
        organisationId: organisation.id,
        title: input.title,
        location: input.location || "",
        department: input.department,
        employmentType: input.employmentType,
        description: input.description,
        normalizedJson: input.normalizedJson as Prisma.InputJsonValue,
        jobSourceId: jobSource.id,
        sourceUrl: input.jobUrl,
        status: "open",
        wilmaEnabled: input.wilmaEnabled,
      },
    });

    // Index the job description for RAG
    await indexJobDescription(job, input.description);

    // Optionally ingest the job page as a document for additional context
    try {
      const response = await fetch(input.jobUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      });
      if (response.ok) {
        const html = await response.text();
        const { documents } = await ingestDocuments({
          organisationId: organisation.id,
          items: [
            {
              type: "html",
              content: html,
              sourceUrl: input.jobUrl,
              metadata: {
                jobId: job.id,
                category: "job",
              },
            },
          ],
        });

        // Link the document to the job
        if (documents.length > 0) {
          await prisma.jobDocument.create({
            data: {
              jobId: job.id,
              documentId: documents[0].id,
              metadata: {
                sourceUrl: input.jobUrl,
              },
            },
          });
        }
      }
    } catch (docError) {
      logger.warn("Failed to ingest job page as document", {
        error: serializeError(docError),
        jobId: job.id,
        jobUrl: input.jobUrl,
      });
      // Don't fail the whole request if document ingestion fails
    }

    return NextResponse.json({ job }, { status: 201 });
  } catch (error) {
    logger.error("Failed to approve job", {
      error: serializeError(error),
      request: {
        rawBody,
      },
    });
    return new NextResponse("Failed to approve job", { status: 500 });
  }
};

