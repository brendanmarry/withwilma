
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("--- Attempting to Delete a REAL Scraped Job ---");

    // 1. Find the Babus organisation
    // 1. Find the Babus organisation by rootUrl
    const org = await prisma.organisation.findFirst({
        where: { rootUrl: "https://babus.ch" }
    });

    if (!org) {
        console.log("Babus organisation not found. Listing all orgs...");
        const orgs = await prisma.organisation.findMany();
        orgs.forEach(o => console.log(`- ${o.name} (${o.slug})`));
        return;
    }

    console.log(`Found Org: ${org.name} (${org.id})`);

    // 2. Find a job for this org that has a Source (meaning it was scraped)
    const job = await prisma.job.findFirst({
        where: {
            organisationId: org.id,
            jobSourceId: { not: null }
        },
        include: {
            jobSource: true,
            attachments: true
        }
    });

    if (!job) {
        throw new Error("No scraped jobs found for Babus to test deletion on.");
    }

    console.log(`Found Scraped Job: ${job.title} (ID: ${job.id})`);
    console.log(`- Source: ${job.jobSource?.url}`);
    console.log(`- Attachments: ${job.attachments.length}`);

    // 3. Attempt Delete with full logic
    console.log("Attempting delete transaction...");
    try {
        const attachments = await prisma.jobDocument.findMany({
            where: { jobId: job.id },
            select: { documentId: true },
        });

        console.log(`- Found ${attachments.length} documents to cleanup.`);

        await prisma.$transaction(async (tx) => {
            if (attachments.length) {
                const documentIds = attachments.map((attachment) => attachment.documentId);
                // Delete JobDocuments
                await tx.jobDocument.deleteMany({
                    where: { jobId: job.id },
                });
                console.log("  - Deleted JobDocuments");

                // Delete Documents
                // WARNING: This assumes strictly 1:1 mapping for scraped jobs. 
                // If this fails, it's likely because the Document is being used elsewhere?
                // But scraped docs are usually unique.
                await tx.document.deleteMany({
                    where: { id: { in: documentIds } },
                });
                console.log("  - Deleted Documents");
            }

            await tx.job.delete({
                where: { id: job.id },
            });
            console.log("  - Deleted Job");
        });

        console.log("SUCCESS: Real scraped job deleted.");

    } catch (e) {
        console.error("FAILURE: Could not delete scraped job.");
        console.error(e);
        throw e;
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
