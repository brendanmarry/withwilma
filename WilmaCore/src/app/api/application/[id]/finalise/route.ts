import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { corsOptionsResponse, withCors } from "@/app/api/_utils/cors";

export const POST = async (
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {

  const { id } = await params;
  const candidate = await prisma.candidate.findUnique({
    where: { id },
    include: {
      job: true,
      followups: true,
      videos: true,
    },
  });
  if (!candidate) {
    return withCors(new NextResponse("Candidate not found", { status: 404 }));
  }

  await prisma.candidate.update({
    where: { id },
    data: {
      summary: candidate.summary ?? "Application finalised",
    },
  });

  return withCors(NextResponse.json(candidate));
};

export const OPTIONS = () => corsOptionsResponse();

