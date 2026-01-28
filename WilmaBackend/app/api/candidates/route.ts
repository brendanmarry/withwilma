import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getOrganisationFromRequest } from "@/lib/tenant";

export const GET = async (request: NextRequest) => {
    const organisation = await getOrganisationFromRequest(request);

    if (!organisation) {
        return NextResponse.json({ items: [] });
    }

    const organisationId = organisation.id;
    const searchParams = request.nextUrl.searchParams;
    const jobId = searchParams.get("jobId");

    try {
        const candidates = await prisma.candidate.findMany({
            where: {
                job: {
                    organisationId: organisationId,
                    ...(jobId ? { id: jobId } : {}),
                },
            },
            include: {
                job: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
                videos: true,
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ items: candidates });
    } catch (error) {
        console.error("Failed to fetch candidates", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
};
