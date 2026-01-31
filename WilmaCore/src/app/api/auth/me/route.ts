import { NextRequest, NextResponse } from "next/server"; // Updated import to include NextRequest
import { getAdminTokenFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { withCors, corsOptionsResponse } from "@/app/api/_utils/cors";

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

        return withCors(NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                organisationId: user.organisationId,
                organisation: user.organisation,
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
