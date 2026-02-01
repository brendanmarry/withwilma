import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withCors } from "@/app/api/_utils/cors";
import { parseS3Url, getPublicUrl } from "@/lib/storage";

export const GET = async (request: NextRequest) => {
    const searchParams = request.nextUrl.searchParams;
    const slug = searchParams.get("slug");

    if (!slug) {
        return withCors(new NextResponse("Slug required", { status: 400 }), request);
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
        return withCors(new NextResponse("Organisation not found", { status: 404 }), request);
    }

    // Sign logo URL if it's an S3 URL
    const branding = organisation.branding as any;
    if (branding?.logoUrl?.startsWith("s3://")) {
        try {
            const { key } = parseS3Url(branding.logoUrl);
            const publicUrl = getPublicUrl(key);
            branding.logoUrl = publicUrl;
        } catch (e) {
            console.error("Failed to generate public logo URL", e);
        }
    }

    return withCors(NextResponse.json(organisation), request);
};

export const OPTIONS = async (request: NextRequest) => withCors(new NextResponse(null, { status: 204 }), request);
