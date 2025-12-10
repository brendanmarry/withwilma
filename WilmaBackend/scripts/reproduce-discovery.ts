
import { discoverJobUrls } from "../lib/jobs/discover-urls";

const main = async () => {
    const url = process.argv[2] || "https://babus.ch";
    console.log(`Discovering jobs at ${url}...`);

    try {
        const results = await discoverJobUrls(url);
        console.log(`Found ${results.length} URLs:`);
        results.forEach(res => {
            console.log(`- [${res.confidence}] ${res.title} (${res.url})`);
        });
    } catch (error) {
        console.error("Error:", error);
    }
};

main();
