
import { NextRequest, NextResponse } from "next/server";
import { getAdminTokenFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { logger, serializeError } from "@/lib/logger";

type Params = {
    params: Promise<{ id: string }>;
};

export const GET = async (_request: NextRequest, { params }: Params) => {
    const { id } = await params;
    const admin = await getAdminTokenFromRequest();

    if (!admin) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const candidates = await prisma.candidate.findMany({
            where: { jobId: id },
            include: {
                videos: true
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(candidates);
    } catch (error) {
        logger.error("Failed to fetch candidates", {
            error: serializeError(error),
            request: { jobId: id },
        });
        return new NextResponse("Internal Server Error", { status: 500 });
    }
};
