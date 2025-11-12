import { NextRequest, NextResponse } from "next/server";
import { getAdminTokenFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { findOrganisationByRootUrl } from "@/lib/organisation";

export const GET = async (request: NextRequest) => {
  const admin = await getAdminTokenFromRequest();
  if (!admin) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const rootUrl = searchParams.get("rootUrl");
  const organisationIdParam = searchParams.get("organisationId");

  let organisationId: string | null = null;
  if (organisationIdParam) {
    organisationId = organisationIdParam;
  } else if (rootUrl) {
    const organisation = await findOrganisationByRootUrl(rootUrl);
    organisationId = organisation?.id ?? null;
  } else {
    const first = await prisma.organisation.findFirst({
      orderBy: { createdAt: "asc" },
    });
    organisationId = first?.id ?? null;
  }

  if (!organisationId) {
    return NextResponse.json({
      organisation: null,
      sources: [],
      jobs: [],
      documents: [],
    });
  }

  const organisation = await prisma.organisation.findUnique({
    where: { id: organisationId },
    select: {
      id: true,
      name: true,
      rootUrl: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!organisation) {
    return NextResponse.json({
      organisation: null,
      sources: [],
      jobs: [],
      documents: [],
    });
  }

  const [sources, jobs, documents] = await Promise.all([
    prisma.jobSource.findMany({
      where: { organisationId },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { jobs: true } },
      },
    }),
    prisma.job.findMany({
      where: { organisationId },
      orderBy: { updatedAt: "desc" },
      include: {
        jobSource: true,
        _count: { select: { attachments: true, candidates: true } },
      },
    }),
    prisma.jobDocument.findMany({
      where: {
        document: {
          organisationId,
        },
      },
      orderBy: { createdAt: "desc" },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        document: {
          select: {
            id: true,
            sourceType: true,
            sourceUrl: true,
            mimeType: true,
            createdAt: true,
            metadata: true,
          },
        },
      },
    }),
  ]);

  return NextResponse.json({
    organisation,
    sources,
    jobs,
    documents,
  });
};

