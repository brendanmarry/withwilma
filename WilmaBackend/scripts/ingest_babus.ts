import fs from 'fs';
import path from 'path';
import { PrismaClient } from "@prisma/client";
import { extractStructuredJobs } from "@/lib/jobs/scrape";

// Manual Env Loading
const loadEnv = (filePath: string) => {
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        content.split('\n').forEach(line => {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
                const [key, ...values] = trimmed.split('=');
                if (key && values.length > 0) {
                    const val = values.join('=').replace(/^["'](.*)["']$/, '$1'); // Remove quotes
                    process.env[key.trim()] = val;
                    console.log(`Loaded env key: ${key.trim()}`);
                }
            }
        });
    }
};

loadEnv(path.resolve(process.cwd(), '.env.local'));
loadEnv(path.resolve(process.cwd(), '.env'));

const prisma = new PrismaClient();

const BABUS_ROOT = "https://babus.ch";
const CAREERS_URL = "https://babus.ch/pages/career-opportunities";

async function main() {
    console.log("Starting ingestion for Babu's...");

    // 1. Ensure Organisation
    let org = await prisma.organisation.findFirst({
        where: { rootUrl: BABUS_ROOT },
    });

    if (!org) {
        org = await prisma.organisation.create({
            data: {
                name: "Babu's",
                rootUrl: BABUS_ROOT,
                slug: "babus",
                ingestionStatus: "PENDING"
            },
        });
    }
    console.log(`Organisation ID: ${org.id}`);

    // 2. Ensure Job Source
    const jobSource = await prisma.jobSource.upsert({
        where: {
            organisationId_url: {
                organisationId: org.id,
                url: CAREERS_URL,
            }
        },
        update: { lastFetchedAt: new Date() },
        create: {
            organisationId: org.id,
            url: CAREERS_URL,
            type: "crawl",
            label: "Careers Page",
            lastFetchedAt: new Date()
        }
    });

    // 3. Fetch & Scrape
    console.log(`Fetching ${CAREERS_URL}...`);
    const response = await fetch(CAREERS_URL);
    if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);
    const html = await response.text();

    console.log("Extracting jobs (this uses LLM)...");
    const jobs = await extractStructuredJobs(html);

    console.log(`Found ${jobs.length} potential jobs.`);

    // 4. Upsert Jobs
    for (const { raw, normalised } of jobs) {
        const title = (normalised.title || raw.title || "").trim();
        const location = (normalised.location || raw.location || "").trim();

        if (!title) continue;

        console.log(`Upserting job: ${title} (${location})`);

        await prisma.job.upsert({
            where: {
                organisationId_title_location: {
                    organisationId: org.id,
                    title,
                    location,
                }
            },
            update: {
                description: normalised.clean_text || raw.description,
                normalizedJson: normalised as any,
                status: "open",
                updatedAt: new Date(),
                wilmaEnabled: true // Enable by default for demo
            },
            create: {
                organisationId: org.id,
                jobSourceId: jobSource.id,
                title,
                location,
                employmentType: normalised.employment_type,
                department: normalised.department,
                description: normalised.clean_text || raw.description,
                normalizedJson: normalised as any,
                status: "open",
                wilmaEnabled: true, // Enable by default for demo
                sourceUrl: CAREERS_URL
            }
        });
    }

    console.log("Ingestion complete.");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
