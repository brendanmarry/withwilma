import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail, verifyUserPassword } from "@/lib/users";
import { createAdminToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 }
            );
        }

        const user = await findUserByEmail(email);
        if (!user) {
            return NextResponse.json(
                { error: "Invalid credentials" },
                { status: 401 }
            );
        }

        const isValid = await verifyUserPassword(user, password);
        if (!isValid) {
            return NextResponse.json(
                { error: "Invalid credentials" },
                { status: 401 }
            );
        }

        // Role is guaranteed to be "admin" | "recruiter" by my earlier change to auth.ts??
        // Wait, DB role is just string. I should cast or validate.
        // In schema user.role default is "recruiter". 
        // And in tokens, it accepts "admin" | "recruiter".
        const validRole = (user.role === "admin" || user.role === "recruiter") ? user.role : "recruiter";

        const token = await createAdminToken({
            sub: user.id,
            organisationId: user.organisationId,
            email: user.email,
            role: validRole,
        });

        const cookieStore = await cookies();
        cookieStore.set("wilma-admin-token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24, // 24 hours
            path: "/",
        });

        return NextResponse.json({ success: true, user: { email: user.email, name: user.name, role: user.role } });
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
