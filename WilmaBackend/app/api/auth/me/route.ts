import { NextResponse } from "next/server";
import { getAdminTokenFromRequest } from "@/lib/auth";
import { findUserByEmail } from "@/lib/users";

export async function GET() {
    try {
        const payload = await getAdminTokenFromRequest();
        if (!payload) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await findUserByEmail(payload.email);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                organisationId: user.organisationId,
            },
        });
    } catch (error) {
        console.error("Me endpoint error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
