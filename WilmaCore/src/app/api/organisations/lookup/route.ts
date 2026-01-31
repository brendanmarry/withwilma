import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withCors } from "@/app/api/_utils/cors";

export const GET = async (request: NextRequest) => {
    const searchParams = request.nextUrl.searchParams;
    const slug = searchParams.get("slug");

    if (!slug) {
        return withCors(new NextResponse("Slug required", { status: 400 }));
    }

    const organisation = await prisma.organisation.findUnique({
        where: { slug },
        select: {
            id: true,
            name: true,
            slug: true,
            branding: true,
            rootUrl: true,
        }
    });

    if (!organisation) {
        return withCors(new NextResponse("Organisation not found", { status: 404 }));
    }

    return withCors(NextResponse.json(organisation));
};

export const OPTIONS = () => withCors(new NextResponse(null, { status: 204 }));
