import { NextRequest, NextResponse } from "next/server";
import { getAdminTokenFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { normaliseOrganisationRootUrl } from "@/lib/organisation";

const formatOrganisation = (
  organisation:
    | (NonNullable<Awaited<ReturnType<typeof prisma.organisation.findFirst>>> & {
      _count?: { documents: number; faqs: number; jobs: number };
    })
    | null,
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


export const POST = async (request: NextRequest) => {
  const admin = await getAdminTokenFromRequest();
  if (!admin) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { name, rootUrl, initialKnowledge } = await request.json();

    if (!name || !rootUrl) {
      return new NextResponse("Name and Root URL are required", { status: 400 });
    }

    const normalizedRootUrl = normaliseOrganisationRootUrl(rootUrl);

    // Check if exists
    const existing = await prisma.organisation.findUnique({
      where: { rootUrl: normalizedRootUrl },
    });

    if (existing) {
      return new NextResponse("Organisation with this Root URL already exists", {
        status: 409,
      });
    }

    const organisation = await prisma.organisation.create({
      data: {
        name,
        rootUrl: normalizedRootUrl,
      },
    });

    if (initialKnowledge) {
      const knowledgeEntries = Object.entries(initialKnowledge as Record<string, string>);

      for (const [category, content] of knowledgeEntries) {
        if (!content || content.trim() === "") continue;

        await prisma.document.create({
          data: {
            organisationId: organisation.id,
            sourceType: "upload", // Using 'upload' as these are manually confirmed/uploaded text blocks
            textContent: content,
            metadata: {
              title: `Initial Knowledge: ${category.charAt(0).toUpperCase() + category.slice(1)}`,
              type: "initial_knowledge",
              category: category,
            },
          },
        });
      }
    }

    return NextResponse.json(formatOrganisation(organisation));

  } catch (error) {
    console.error("Error creating organisation:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
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


