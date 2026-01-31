import { NextRequest, NextResponse } from "next/server";
import { getAdminTokenFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { findOrganisationByRootUrl } from "@/lib/organisation";

export const GET = async (request: NextRequest) => {
  const admin = await getAdminTokenFromRequest();
  if (!admin) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const organisationIdParam = request.nextUrl.searchParams.get("organisationId");
  const rootUrl = request.nextUrl.searchParams.get("rootUrl");

  if (!organisationIdParam && !rootUrl) {
    return new NextResponse("organisationId or rootUrl is required", {
      status: 400,
    });
  }

  const approved = request.nextUrl.searchParams.get("approved");
  const organisation =
    organisationIdParam !== null
      ? await prisma.organisation.findUnique({
          where: { id: organisationIdParam },
        })
      : await findOrganisationByRootUrl(rootUrl!);

  if (!organisation) {
    return NextResponse.json({ organisation: null, faqs: [], documents: [] });
  }

  const [faqs, counts, documents] = await Promise.all([
    prisma.fAQ.findMany({
      where: {
        organisationId: organisation.id,
        recruiterApproved: approved ? approved === "true" : undefined,
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.organisation.findUnique({
      where: { id: organisation.id },
      include: {
        _count: {
          select: {
            documents: true,
            faqs: true,
            jobs: true,
          },
        },
      },
    }),
    prisma.document.findMany({
      where: { organisationId: organisation.id },
      orderBy: { createdAt: "desc" },
      take: 25,
      select: {
        id: true,
        sourceType: true,
        sourceUrl: true,
        mimeType: true,
        createdAt: true,
        metadata: true,
      },
    }),
  ]);

  const summary = counts
    ? {
        id: organisation.id,
        name: organisation.name,
        rootUrl: organisation.rootUrl,
        createdAt: organisation.createdAt,
        updatedAt: organisation.updatedAt,
        counts: counts._count,
      }
    : null;

  return NextResponse.json({
    organisation: summary,
    faqs,
    documents,
  });
};

