import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { findOrganisationByRootUrl } from "@/lib/organisation";

export async function getOrganisationFromRequest(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    let organisationId = searchParams.get("organisationId");

    if (organisationId) {
        return prisma.organisation.findUnique({ where: { id: organisationId } });
    }

    // Check Slug Header
    const slug = request.headers.get("x-tenant-id");
    if (slug) {
        const org = await prisma.organisation.findUnique({
            where: { slug },
        });
        if (org) return org;
    }

    // Check RootUrl Param
    const rootUrl = searchParams.get("rootUrl");
    if (rootUrl) {
        return findOrganisationByRootUrl(rootUrl);
    }

    // Fallback (Deprecate this eventually)
    return prisma.organisation.findFirst({
        orderBy: { createdAt: "asc" },
    });
}
