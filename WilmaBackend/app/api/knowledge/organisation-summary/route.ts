import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAdminTokenFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { findOrganisationByRootUrl } from "@/lib/organisation";
import { loadPrompt } from "@/lib/llm/prompts";
import { callJsonLLM, LLMJsonError } from "@/lib/llm/utils";
import { logger, serializeError } from "@/lib/logger";

const organisationProfileSchema = z.object({
  overview: z.string().min(1, "overview is required"),
  products_and_services: z.array(z.string()).optional(),
  history_highlights: z.array(z.string()).optional(),
  leadership_team: z.array(z.string()).optional(),
  funding_status: z.string().optional(),
  ownership_structure: z.string().optional(),
  confidence: z.enum(["high", "medium", "low"]).optional(),
  notes: z.array(z.string()).optional(),
});

type OrganisationProfileResult = z.infer<typeof organisationProfileSchema>;

const MAX_DOCUMENTS = 6;
const MAX_SNIPPET_LENGTH = 1400;

const truncate = (value: string, length: number) => {
  if (value.length <= length) return value;
  return `${value.slice(0, length)}…`;
};

const buildSourceLabel = (input: {
  sourceUrl: string | null;
  metadata: Record<string, unknown> | null;
  index: number;
}) => {
  if (input.sourceUrl) return input.sourceUrl;
  const originalName =
    input.metadata && typeof input.metadata === "object" && "originalName" in input.metadata
      ? String(input.metadata.originalName)
      : null;
  if (originalName) return originalName;
  return `Document ${input.index + 1}`;
};

const normaliseProfile = (raw: OrganisationProfileResult) => ({
  overview: raw.overview.trim(),
  productsAndServices: raw.products_and_services?.map((item) => item.trim()).filter(Boolean) ?? [],
  historyHighlights: raw.history_highlights?.map((item) => item.trim()).filter(Boolean) ?? [],
  leadershipTeam: raw.leadership_team?.map((item) => item.trim()).filter(Boolean) ?? [],
  fundingStatus: raw.funding_status?.trim() || "unknown",
  ownershipStructure: raw.ownership_structure?.trim() || "unknown",
  confidence: raw.confidence ?? "medium",
  notes: raw.notes?.map((item) => item.trim()).filter(Boolean) ?? [],
});

export const GET = async (request: NextRequest) => {
  const admin = await getAdminTokenFromRequest();
  if (!admin) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const organisationIdParam = request.nextUrl.searchParams.get("organisationId");
  const rootUrlParam = request.nextUrl.searchParams.get("rootUrl");

  if (!organisationIdParam && !rootUrlParam) {
    return new NextResponse("organisationId or rootUrl is required", {
      status: 400,
    });
  }

  const organisation =
    organisationIdParam !== null
      ? await prisma.organisation.findUnique({
          where: { id: organisationIdParam },
        })
      : await findOrganisationByRootUrl(rootUrlParam!);

  if (!organisation) {
    return NextResponse.json({ profile: null, reason: "organisation_not_found" });
  }

  const documents = await prisma.document.findMany({
    where: { organisationId: organisation.id },
    orderBy: { createdAt: "desc" },
    take: MAX_DOCUMENTS,
    select: {
      id: true,
      textContent: true,
      sourceUrl: true,
      metadata: true,
      createdAt: true,
    },
  });

  if (documents.length === 0) {
    return NextResponse.json({ profile: null, reason: "no_documents" });
  }

  const sources = documents.map((doc, index) => ({
    id: doc.id,
    label: buildSourceLabel({ sourceUrl: doc.sourceUrl, metadata: doc.metadata, index }),
    snippet: truncate(doc.textContent, MAX_SNIPPET_LENGTH),
    createdAt: doc.createdAt,
  }));

  const systemPrompt = await loadPrompt("organisation-summary.md");
  const userContent = JSON.stringify(
    {
      organisation: {
        name: organisation.name,
        rootUrl: organisation.rootUrl,
      },
      sources: sources.map((source, index) => ({
        id: source.id,
        label: source.label,
        snippet: source.snippet,
        order: index + 1,
      })),
    },
    null,
    2,
  );

  try {
    const result = await callJsonLLM({
      systemPrompt,
      userContent,
      schema: organisationProfileSchema,
    });
    const profile = normaliseProfile(result);
    return NextResponse.json({
      profile: {
        ...profile,
        generatedAt: new Date().toISOString(),
        sourceCount: sources.length,
      },
      sources: sources.map((source) => ({
        id: source.id,
        label: source.label,
        createdAt: source.createdAt,
      })),
    });
  } catch (error) {
    if (error instanceof LLMJsonError) {
      logger.warn("Failed to generate organisation profile", {
        error: serializeError(error),
        organisationId: organisation.id,
      });
      return NextResponse.json(
        {
          profile: null,
          reason: "llm_failed",
        },
        { status: 502 },
      );
    }

    logger.error("Unexpected error generating organisation profile", {
      error: serializeError(error),
      organisationId: organisation.id,
    });
    return new NextResponse("Failed to generate organisation profile", { status: 500 });
  }
};

