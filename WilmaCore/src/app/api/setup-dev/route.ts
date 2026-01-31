import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createUser, findUserByEmail } from "@/lib/users";

export async function GET() {
    if (process.env.NODE_ENV === "production") {
        return NextResponse.json({ error: "Not allowed in production" }, { status: 403 });
    }

    try {
        // 1. Create Organisation
        let org = await prisma.organisation.findFirst({
            where: { rootUrl: "wilma.com" },
        });

        if (!org) {
            org = await prisma.organisation.create({
                data: {
                    name: "Wilma HQ",
                    rootUrl: "wilma.com",
                    slug: "wilma-hq",
                },
            });
        }

        // 2. Create User
        const email = "employer@wilma.com";
        let user = await findUserByEmail(email);

        if (!user) {
            user = await createUser({
                email,
                password: "password123",
                name: "Demo Employer",
                organisationId: org.id,
                role: "recruiter",
            });
        }

        // 3. Create Jobs
        const existingJobs = await prisma.job.count({
            where: { organisationId: org.id },
        });

        if (existingJobs === 0) {
            await prisma.job.create({
                data: {
                    organisationId: org.id,
                    title: "Senior Product Manager",
                    department: "Product",
                    location: "Remote - North America",
                    description: "We are looking for a Senior Product Manager...",
                    wilmaEnabled: true,
                    status: "open",
                },
            });

            await prisma.job.create({
                data: {
                    organisationId: org.id,
                    title: "Full Stack Engineer",
                    department: "Engineering",
                    location: "Hybrid - Dublin, IE",
                    description: "Join the founding engineering team...",
                    wilmaEnabled: true,
                    status: "open",
                },
            });
        }

        return NextResponse.json({
            success: true,
            message: "Setup complete. Organisation, User, and Jobs seeded.",
            credentials: {
                email: "recruiter@wilma.com",
                password: "password123",
            },
        });
    } catch (error) {
        console.error("Setup error:", error);
        return NextResponse.json({ error: "Setup failed" }, { status: 500 });
    }
}
