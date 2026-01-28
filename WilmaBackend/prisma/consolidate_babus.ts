
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Starting tenant consolidation...");

    const targetSlug = 'babus';
    const sourceSlug = 'babus-z4k9';

    // 1. Check if the target 'babus' tenant exists
    const existingTarget = await prisma.organisation.findUnique({
        where: { slug: targetSlug }
    });

    if (existingTarget) {
        console.log(`Found existing '${targetSlug}' tenant. Deleting it...`);
        // Delete it properly
        await prisma.organisation.delete({
            where: { id: existingTarget.id }
        });
        console.log(`Deleted '${targetSlug}'.`);
    }

    // 2. Find the source 'babus-z4k9' tenant
    const sourceTenant = await prisma.organisation.findUnique({
        where: { slug: sourceSlug }
    });

    if (sourceTenant) {
        console.log(`Found '${sourceSlug}'. Renaming to '${targetSlug}'...`);
        await prisma.organisation.update({
            where: { id: sourceTenant.id },
            data: { slug: targetSlug }
        });
        console.log(`Successfully renamed '${sourceSlug}' to '${targetSlug}'.`);
    } else {
        console.log(`Source tenant '${sourceSlug}' not found. No rename performed.`);
        // If neither existed (cleaning up from a clean slate), maybe create it?
        // But assuming the user wants to keep the data from z4k9.
        if (!existingTarget) {
            console.log("No tenants found to consolidate.");
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
