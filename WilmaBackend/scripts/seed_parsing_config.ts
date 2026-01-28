
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const slug = 'babus';
    const org = await prisma.organisation.findUnique({ where: { slug } });
    if (!org) return;

    // Example custom instruction: 
    // "Please ensure 'What we offer' sections are mapped to 'benefits' (if we had that field) or 'nice_to_have' 
    // and be very strict about extracting the specific bakery location."

    // Since our schema is fixed, we can mainly guide the mapping or style.
    // e.g. "Summarize the role in a playful tone."
    await prisma.organisation.update({
        where: { id: org.id },
        data: {
            jobParsingConfig: {
                customInstructions: "This employer loves minimal summaries. Keep the summary under 2 sentences. Map 'Our DNA' section to 'company_values_alignment'."
            }
        }
    });

    console.log(`Updated parsing config for ${slug}`);
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
