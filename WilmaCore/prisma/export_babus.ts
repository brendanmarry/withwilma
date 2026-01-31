
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://wilma:wilma@127.0.0.1:5432/wilma",
        },
    },
});

async function main() {
    console.log("Exporting Babus data...");

    // Try to find 'babus' or related slugs
    const slugs = ['babus', 'babus-z4k9'];

    let org = await prisma.organisation.findFirst({
        where: { slug: { in: slugs } },
        include: {
            users: true,
            jobs: {
                include: {
                    candidates: {
                        include: {
                            videos: true,
                            followups: true
                        }
                    },
                    attachments: true
                }
            },
            documents: true,
            faqs: true,
            jobSources: true
        }
    });

    if (!org) {
        console.error("No Babus organisation found locally.");
        process.exit(1);
    }

    console.log(`Found organisation: ${org.name} (${org.slug})`);

    // Clean data for export (remove IDs if we want to regenerate, but keeping them maintains relations)
    // We will use upserts with IDs to maintain integrity if possible, or mapping.
    // For simplicity, we'll keep IDs and rely on clean target or upsert.

    const exportPath = path.join(__dirname, 'babus_data.json');
    fs.writeFileSync(exportPath, JSON.stringify(org, null, 2));

    console.log(`Exported data to ${exportPath}`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
