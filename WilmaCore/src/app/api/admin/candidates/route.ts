import { NextRequest, NextResponse } from "next/server";
import { getAdminTokenFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { findOrganisationByRootUrl } from "@/lib/organisation";

export const GET = async (request: NextRequest) => {
  const admin = await getAdminTokenFromRequest();
  if (!admin) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const rootUrl = request.nextUrl.searchParams.get("rootUrl");
  if (!rootUrl) {
    return new NextResponse("rootUrl is required", { status: 400 });
  }

  const page = Number(request.nextUrl.searchParams.get("page") ?? 1);
  const pageSize = Number(request.nextUrl.searchParams.get("pageSize") ?? 20);
  const skip = (page - 1) * pageSize;
  const jobId = request.nextUrl.searchParams.get("jobId");

  const organisation = await findOrganisationByRootUrl(rootUrl);
  if (!organisation) {
    return NextResponse.json({ items: [], total: 0, page, pageSize });
  }

  const whereClause: {
    job: { organisationId: string; id?: string };
  } = {
    job: { organisationId: organisation.id },
  };

  if (jobId) {
    whereClause.job.id = jobId;
  }

  const [items, total] = await Promise.all([
    prisma.candidate.findMany({
      where: whereClause,
      include: { job: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.candidate.count({
      where: whereClause,
    }),
  ]);

  return NextResponse.json({ items, total, page, pageSize });
};

