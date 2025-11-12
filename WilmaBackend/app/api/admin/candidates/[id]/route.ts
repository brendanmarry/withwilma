import { NextRequest, NextResponse } from "next/server";
import { getAdminTokenFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const GET = async (
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const { id } = await params;
  const admin = await getAdminTokenFromRequest();
  if (!admin) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const candidate = await prisma.candidate.findUnique({
    where: { id },
    include: {
      job: true,
      followups: true,
      videos: true,
    },
  });

  if (!candidate) {
    return new NextResponse("Candidate not found", { status: 404 });
  }

  return NextResponse.json(candidate);
};

