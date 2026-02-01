import { NextRequest, NextResponse } from "next/server"; // Updated import to include NextRequest
import { getAdminTokenFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { withCors, corsOptionsResponse } from "@/app/api/_utils/cors";
import { parseS3Url, getDownloadUrl } from "@/lib/storage";

export async function GET(req: NextRequest) {
    try {
        const payload = await getAdminTokenFromRequest();
        if (!payload) {
            return withCors(NextResponse.json({ error: "Unauthorized" }, { status: 401 }), req);
        }

        const user = await prisma.user.findUnique({
            where: { email: payload.email },
            include: { organisation: true }
        });

        if (!user) {
            return withCors(NextResponse.json({ error: "User not found" }, { status: 404 }), req);
        }

        // Sign logo URL if it exists
        const org = user.organisation as any;
        if (org?.branding?.logoUrl?.startsWith("s3://")) {
            try {
                const { key } = parseS3Url(org.branding.logoUrl);
                const signedUrl = await getDownloadUrl(key, 3600);
                org.branding.logoUrl = signedUrl;
            } catch (e) {
                console.error("Failed to sign logo URL in me endpoint", e);
            }
        }

        return withCors(NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                organisationId: user.organisationId,
                organisation: org,
            },
        }), req);
    } catch (error) {
        console.error("Me endpoint error:", error);
        return withCors(NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        ), req);
    }
}

export const OPTIONS = async (req: NextRequest) => {
    return corsOptionsResponse(req);
};
