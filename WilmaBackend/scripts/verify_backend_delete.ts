
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("--- Verifying Job Deletion Logic ---");

    // 1. Setup: Create a dummy organisation if needed
    const org = await prisma.organisation.findFirst();
    if (!org) throw new Error("No organisation found to test with");

    // 2. Create a dummy job to delete
    const job = await prisma.job.create({
        data: {
            title: "DELETE ME TEST JOB",
            description: "This job is transient and should be deleted.",
            location: "Void",
            organisationId: org.id,
            status: "open",
            wilmaEnabled: false
        }
    });
    console.log(`Created Job: ${job.id} - ${job.title}`);

    // 3. Verify it exists
    const check1 = await prisma.job.findUnique({ where: { id: job.id } });
    if (!check1) throw new Error("Failed to create test job");
    console.log("Job verified in DB.");

    // 4. Execute Deletion Logic (Simulating the API route)
    // The route logic:
    /*
    const attachments = await prisma.jobDocument.findMany({
      where: { jobId: id },
      select: { documentId: true },
    });

    await prisma.$transaction(async (tx) => {
      if (attachments.length) {
        ... delete attachments ...
      }
      await tx.job.delete({
        where: { id },
      });
    });
    */

    console.log("Executing deletion transaction...");
    try {
        const attachments = await prisma.jobDocument.findMany({
            where: { jobId: job.id },
            select: { documentId: true },
        });

        await prisma.$transaction(async (tx) => {
            if (attachments.length) {
                const documentIds = attachments.map((attachment) => attachment.documentId);
                await tx.jobDocument.deleteMany({
                    where: { jobId: job.id },
                });
                await tx.document.deleteMany({
                    where: { id: { in: documentIds } },
                });
            }
            await tx.job.delete({
                where: { id: job.id },
            });
        });
        console.log("Deletion successful.");
    } catch (e) {
        console.error("Deletion failed:", e);
        throw e;
    }

    // 5. Verify it's gone
    const check2 = await prisma.job.findUnique({ where: { id: job.id } });
    if (check2) throw new Error("Job still exists after deletion!");

    console.log("SUCCESS: Job was permanently deleted.");
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
