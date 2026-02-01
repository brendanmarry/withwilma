import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminTokenFromRequest } from "@/lib/auth";
import { parseS3Url, getDownloadUrl } from "@/lib/storage";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const admin = await getAdminTokenFromRequest();
    if (!admin) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const { id } = await params;
        const body = await request.json();

        // Ensure same organisation or super admin
        if (admin.role !== 'admin' && admin.organisationId !== id) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const { name, rootUrl, slug, branding, careersPageUrl } = body;

        const data: any = {};
        if (name !== undefined) data.name = name;
        if (rootUrl !== undefined) data.rootUrl = rootUrl;
        if (slug !== undefined) data.slug = slug;
        if (branding !== undefined) data.branding = branding;
        if (careersPageUrl !== undefined) data.careersPageUrl = careersPageUrl;

        const updated = await prisma.organisation.update({
            where: { id },
            data,
        });

        // Sign logo URL if it exists
        const updatedBranding = updated.branding as any;
        if (updatedBranding?.logoUrl?.startsWith("s3://")) {
            try {
                const { key } = parseS3Url(updatedBranding.logoUrl);
                const signedUrl = await getDownloadUrl(key, 3600);
                updatedBranding.logoUrl = signedUrl;
            } catch (e) {
                console.error("Failed to sign logo URL", e);
            }
        }

        return NextResponse.json(updated);
    } catch (error: any) {
        console.error("Error updating organisation:", error);

        if (error.code === 'P2002') {
            return NextResponse.json(
                { error: "Unique constraint failed (likely slug or rootUrl already taken)" },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: "Failed to update organisation" },
            { status: 500 }
        );
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const admin = await getAdminTokenFromRequest();
    if (!admin) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;

    try {
        const organisation = await prisma.organisation.findUnique({
            where: { id },
        });

        if (!organisation) {
            return new NextResponse("Not Found", { status: 404 });
        }

        // Sign logo URL if it's an S3 URL
        const branding = organisation.branding as any;
        if (branding?.logoUrl?.startsWith("s3://")) {
            try {
                const { key } = parseS3Url(branding.logoUrl);
                const signedUrl = await getDownloadUrl(key, 3600);
                branding.logoUrl = signedUrl;
            } catch (e) {
                console.error("Failed to sign logo URL", e);
            }
        }

        return NextResponse.json(organisation);
    } catch (error) {
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
