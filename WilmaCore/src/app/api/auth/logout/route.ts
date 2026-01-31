import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { withCors, corsOptionsResponse } from "@/app/api/_utils/cors";

export async function POST(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        cookieStore.delete({
            name: "wilma-admin-token",
            path: "/",
            domain: process.env.NODE_ENV === "production" ? ".withwilma.com" : undefined,
        });

        return withCors(NextResponse.json({ success: true }), req);
    } catch (error) {
        console.error("Logout error:", error);
        return withCors(NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        ), req);
    }
}

export const OPTIONS = async (req: NextRequest) => {
    return corsOptionsResponse(req);
};
