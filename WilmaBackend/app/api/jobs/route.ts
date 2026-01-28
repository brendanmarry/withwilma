import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getOrganisationFromRequest } from "@/lib/tenant";
import { corsOptionsResponse, withCors } from "@/app/api/_utils/cors";

export const dynamic = 'force-dynamic';

export const GET = async (request: NextRequest) => {
  const organisation = await getOrganisationFromRequest(request);

  if (!organisation) {
    return withCors(NextResponse.json([]));
  }

  const organisationId = organisation.id;
  const searchParams = request.nextUrl.searchParams;

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

import { getAdminTokenFromRequest } from "@/lib/auth";
import { jobCreateSchema } from "@/lib/validators";
import { normaliseJob } from "@/lib/llm/pipelines/job_normalisation";
import { indexJobDescription } from "@/lib/vector/retriever";

export const POST = async (request: NextRequest) => {
  const admin = await getAdminTokenFromRequest();

  // NOTE: In production, we should strict check auth. 
  // For now, if no admin token, we might default to the dev-admin if in dev mode, 
  // but let's be strict if we can. The frontend should pass cookies.

  if (!admin) {
    return withCors(new NextResponse("Unauthorized", { status: 401 }));
  }

  try {
    const rawBody = await request.json();
    const input = jobCreateSchema.parse(rawBody);

    let finalTitle = input.title;
    let finalLocation = input.location || "";
    let finalDepartment = input.department;
    let finalEmploymentType = input.employmentType;
    let finalDescription = input.description;
    let normalisedData = undefined;

    if (input.autoNormalise) {
      const normalised = await normaliseJob({ raw: input.description });
      normalisedData = normalised;

      // If the user provided specific overrides, keep them, otherwise use LLM inferred values
      // But usually for "Manual Entry" the user's input is king for title/loc
      // We might just want to use the cleaned text description

      finalDescription = normalised.clean_text || input.description;
      // We can also allow the LLM to fill in gaps if the user left them blank
      if (!finalLocation && normalised.location) finalLocation = normalised.location;
      if (!finalDepartment && normalised.department) finalDepartment = normalised.department;
      if (!finalEmploymentType && normalised.employment_type) finalEmploymentType = normalised.employment_type;
    }

    const job = await prisma.job.create({
      data: {
        organisationId: admin.organisationId,
        title: finalTitle,
        location: finalLocation,
        department: finalDepartment,
        employmentType: finalEmploymentType,
        description: finalDescription,
        normalizedJson: normalisedData as any,
        status: "open",
        wilmaEnabled: true,
      },
    });

    await indexJobDescription(job, job.description);

    return withCors(NextResponse.json(job));
  } catch (error) {
    console.error("Failed to create job", error);
    return withCors(new NextResponse("Invalid request", { status: 400 }));
  }
};

export const OPTIONS = () => corsOptionsResponse();

