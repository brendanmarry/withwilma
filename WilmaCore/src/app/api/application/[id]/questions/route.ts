import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { corsOptionsResponse, withCors } from "@/app/api/_utils/cors";

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {

  const { id } = await params;
  const followups = await prisma.followUpQuestion.findMany({
    where: { candidateId: id },
    orderBy: { createdAt: "asc" },
  });
  return withCors(NextResponse.json(followups), request);
};

export const OPTIONS = async (request: NextRequest) => corsOptionsResponse(request);

