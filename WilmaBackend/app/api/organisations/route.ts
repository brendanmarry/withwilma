import { NextRequest, NextResponse } from "next/server";
import { getAdminTokenFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { normaliseOrganisationRootUrl } from "@/lib/organisation";

const formatOrganisation = (
  organisation: Awaited<
    ReturnType<typeof prisma.organisation.findFirst>
  > & { _count?: { documents: number; faqs: number; jobs: number } },
) => {
  if (!organisation) {
    return null;
  }
  return {
    id: organisation.id,
    name: organisation.name,
    rootUrl: organisation.rootUrl,
    createdAt: organisation.createdAt,
    updatedAt: organisation.updatedAt,
    counts: organisation._count ?? {
      documents: 0,
      faqs: 0,
      jobs: 0,
    },
  };
};

export const GET = async (request: NextRequest) => {
  const admin = await getAdminTokenFromRequest();
  if (!admin) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const rootUrlParam = request.nextUrl.searchParams.get("rootUrl");

  if (rootUrlParam) {
    const normalized = normaliseOrganisationRootUrl(rootUrlParam);
    const organisation = await prisma.organisation.findUnique({
      where: { rootUrl: normalized },
      include: {
        _count: {
          select: {
            documents: true,
            faqs: true,
            jobs: true,
          },
        },
      },
    });
    return NextResponse.json(formatOrganisation(organisation));
  }

  const organisations = await prisma.organisation.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          documents: true,
          faqs: true,
          jobs: true,
        },
      },
    },
  });

  return NextResponse.json(organisations.map(formatOrganisation));
};

export const DELETE = async (request: NextRequest) => {
  const admin = await getAdminTokenFromRequest();
  if (!admin) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const rootUrlParam = request.nextUrl.searchParams.get("rootUrl");
  const organisationIdParam = request.nextUrl.searchParams.get("organisationId");

  if (!rootUrlParam && !organisationIdParam) {
    return new NextResponse("rootUrl or organisationId is required", {
      status: 400,
    });
  }
  let organisation = null;

  if (organisationIdParam) {
    organisation = await prisma.organisation.findUnique({
      where: { id: organisationIdParam },
    });
  } else if (rootUrlParam) {
    const normalized = normaliseOrganisationRootUrl(rootUrlParam);
    organisation = await prisma.organisation.findUnique({
      where: { rootUrl: normalized },
    });
  }

  if (!organisation) {
    return new NextResponse("Organisation not found", { status: 404 });
  }

  await prisma.organisation.delete({
    where: { id: organisation.id },
  });

  return NextResponse.json({ success: true });
};

