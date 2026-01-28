
import fs from 'fs';
import path from 'path';
import { extractStructuredJobs } from "@/lib/jobs/scrape";
import { discoverJobUrls } from "@/lib/jobs/discover-urls";

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

const TARGET_URL = "https://babus.ch/pages/career-opportunities";

async function main() {
    console.log(`\n--- Testing Extraction for ${TARGET_URL} ---\n`);

    // 1. Discover URLs
    console.log("1. Discovering URLs...");
    // Just like the route, we seed with the target URL
    const allDiscoveredUrls: string[] = [TARGET_URL];

    try {
        const discovered = await discoverJobUrls(TARGET_URL, 20);
        console.log(`   Found ${discovered.length} discovered links.`);
        discovered.forEach(d => {
            if (d.url !== TARGET_URL) {
                console.log(`   - Discovered: ${d.url} (Confidence: ${d.confidence})`);
                allDiscoveredUrls.push(d.url);
            }
        });
    } catch (e) {
        console.error("Discovery failed:", e);
    }

    // 2. Extract from each
    console.log(`\n2. Extracting & Validating Jobs from ${allDiscoveredUrls.length} pages...`);

    let totalValid = 0;

    for (const url of allDiscoveredUrls) {
        console.log(`\n   Processing: ${url}`);
        try {
            const response = await fetch(url);
            if (!response.ok) {
                console.log(`   FAILED to fetch: ${response.status}`);
                continue;
            }
            const html = await response.text();
            const jobs = await extractStructuredJobs(html);

            if (jobs.length > 0) {
                console.log(`   ✅ Found ${jobs.length} VALID job(s):`);
                jobs.forEach(j => {
                    console.log(`      - [${j.normalised.title}] (${j.normalised.location})`);
                    console.log(`        Confidence: ${j.normalised.confidence}%`);
                });
                totalValid += jobs.length;
            } else {
                console.log(`   ❌ No valid jobs found.`);
            }

        } catch (e) {
            console.error(`   Error processing ${url}:`, e);
        }
    }

    console.log(`\n--- Test Complete. Total Valid Jobs: ${totalValid} ---\n`);
}

main().catch(console.error);
