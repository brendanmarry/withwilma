import { prisma } from "../lib/db";

async function main() {
    const jobId = "f5799dda-8282-489f-bace-4c7c7a4ba069";
    const job = await prisma.job.findUnique({
        where: { id: jobId }
    });

    if (!job) {
        console.log("Job not found");
        return;
    }

    console.log("Layout Config:", JSON.stringify(job.layoutConfig, null, 2));
    console.log("Normalized JSON Keys:", Object.keys(job.normalizedJson || {}));
}

main();
