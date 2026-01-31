import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getOrganisationFromRequest } from "@/lib/tenant";
import { corsOptionsResponse, withCors } from "@/app/api/_utils/cors";

export const dynamic = 'force-dynamic';

export const GET = async (request: NextRequest) => {
  const organisation = await getOrganisationFromRequest(request);

  if (!organisation) {
    return withCors(NextResponse.json([]), request);
  }

  // ... (lines 15-32)

  return withCors(NextResponse.json(jobs), request);
};

// ... (lines 36-47)

if (!admin) {
  return withCors(new NextResponse("Unauthorized", { status: 401 }), request);
}

try {
  // ... (lines 53-93)

  return withCors(NextResponse.json(job), request);
} catch (error) {
  console.error("Failed to create job", error);
  return withCors(new NextResponse("Invalid request", { status: 400 }), request);
}
};

export const OPTIONS = async (request: NextRequest) => corsOptionsResponse(request);

