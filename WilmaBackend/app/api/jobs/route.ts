import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { findOrganisationByRootUrl } from "@/lib/organisation";
import { corsOptionsResponse, withCors } from "@/app/api/_utils/cors";

export const GET = async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const organisationIdParam = searchParams.get("organisationId");
  const rootUrl = searchParams.get("rootUrl");

  let organisationId: string | null = null;

  if (organisationIdParam) {
    organisationId = organisationIdParam;
  } else if (rootUrl) {
    const organisation = await findOrganisationByRootUrl(rootUrl);
    organisationId = organisation?.id ?? null;
  } else {
    const firstOrganisation = await prisma.organisation.findFirst({
      orderBy: { createdAt: "asc" },
    });
    organisationId = firstOrganisation?.id ?? null;
  }

  if (!organisationId) {
    return withCors(NextResponse.json([]));
  }

  const wilmaEnabledParam = searchParams.get("wilmaEnabled");
  const wilmaEnabled = wilmaEnabledParam !== null ? wilmaEnabledParam === "true" : undefined;
  const statusParam = searchParams.get("status");
  const status =
    statusParam && (statusParam === "open" || statusParam === "closed") ? statusParam : undefined;

  const jobs = await prisma.job.findMany({
    where: {
      organisationId,
      status,
      wilmaEnabled,
    },
    orderBy: { createdAt: "desc" },
  });

  return withCors(NextResponse.json(jobs));
};

export const OPTIONS = () => corsOptionsResponse();

