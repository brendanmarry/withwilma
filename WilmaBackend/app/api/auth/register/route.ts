import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/users";
import { createAdminToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { findOrganisationByRootUrl } from "@/lib/organisation";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, password, website } = body;

        if (!email || !password || !website) {
            return NextResponse.json(
                { error: "Email, password, and website are required" },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "User already exists with this email" },
                { status: 409 }
            );
        }

        // Handle Organisation
        // Try to find by rootUrl first
        let rootUrl = website.toLowerCase();
        if (!rootUrl.startsWith("http")) {
            rootUrl = `https://${rootUrl}`;
        }
        try {
            const urlObj = new URL(rootUrl);
            // Normalize to origin
            rootUrl = urlObj.origin;
        } catch (e) {
            // If invalid URL, maybe use as is (though should validate)
        }

        // Simple name derivation from domain
        const hostname = new URL(rootUrl).hostname;
        const name = hostname.replace("www.", "").split(".")[0];
        const derivedName = name.charAt(0).toUpperCase() + name.slice(1);
        const randomSuffix = Math.random().toString(36).substring(2, 6);
        const slug = `${name.toLowerCase().replace(/[^a-z0-9]/g, "")}-${randomSuffix}`;

        let organisation = await findOrganisationByRootUrl(rootUrl);

        if (!organisation) {
            organisation = await prisma.organisation.create({
                data: {
                    name: derivedName,
                    rootUrl: rootUrl,
                    slug: slug,
                    ingestionStatus: "PENDING"
                }
            });
        }

        // Create User
        const hashedPassword = await hashPassword(password);
        const user = await prisma.user.create({
            data: {
                email,
                passwordHash: hashedPassword,
                organisationId: organisation.id,
                role: "recruiter",
                name: email.split("@")[0] // Default name
            }
        });

        // Auto-login (Create Token)
        const token = await createAdminToken({
            sub: user.id,
            organisationId: organisation.id,
            email: user.email,
            role: "recruiter",
        });

        const cookieStore = await cookies();
        cookieStore.set("wilma-admin-token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24, // 24 hours
            path: "/",
            domain: process.env.NODE_ENV === "production" ? ".withwilma.com" : undefined,
        });

        return NextResponse.json({
            success: true,
            user: {
                email: user.email,
                name: user.name,
                role: user.role,
                organisationId: user.organisationId
            },
            redirectTo: '/employer/onboarding' // Signal frontend to go to calibration
        });

    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
