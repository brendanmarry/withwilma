import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export const GET = async () => {
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

    const formatted = organisations.map((org) => ({
        id: org.id,
        name: org.name,
        rootUrl: org.rootUrl,
        createdAt: org.createdAt,
        updatedAt: org.updatedAt,
        counts: org._count ?? { documents: 0, faqs: 0, jobs: 0 },
    }));

    return NextResponse.json(formatted);
};
