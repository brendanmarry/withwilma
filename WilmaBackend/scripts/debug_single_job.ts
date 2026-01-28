
import fs from 'fs';
import path from 'path';
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
                    const val = values.join('=').replace(/^["'](.*)["']$/, '$1');
                    process.env[key.trim()] = val;
                }
            }
        });
    }
};

loadEnv(path.resolve(process.cwd(), '.env.local'));
loadEnv(path.resolve(process.cwd(), '.env'));

const TARGET_URL = "https://babus.ch/pages/hilfskraft-reinigung-60-80";

async function main() {
    console.log(`Fetching ${TARGET_URL}...`);
    const response = await fetch(TARGET_URL);
    if (!response.ok) throw new Error("Failed to fetch");
    const html = await response.text();

    console.log("Extracting...");
    const jobs = await extractStructuredJobs(html);

    console.log(`Found ${jobs.length} jobs.`);
    jobs.forEach((j, i) => {
        console.log(`\nJob ${i + 1}:`);
        console.log(`Title: ${j.normalised.title}`);
        console.log(`Clean Text Length: ${j.normalised.clean_text.length}`);
        console.log(`Clean Text Preview: ${j.normalised.clean_text.slice(0, 200)}...`);
        console.log(`Original Description Length: ${j.raw.description.length}`);
        console.log(`Original Description Preview: ${j.raw.description.slice(0, 200)}...`);
    });
}

main().catch(console.error);
