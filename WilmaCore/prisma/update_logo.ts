
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const targetSlug = 'babus';
    // Use the local file path served by Next.js public folder
    // Since we copied it to public/babus-logo.png, it's accessible at /babus-logo.png
    // However, for the tenant landing page which might be on a subdomain or different port, 
    // ideally we use an absolute URL or ensure relative paths work. 
    // For dev, we'll assume the frontend server serves this.
    const logoUrl = 'http://localhost:3000/babus-logo.png';

    const tenant = await prisma.organisation.findUnique({
        where: { slug: targetSlug }
    });

    if (tenant) {
        console.log(`Updating logo for '${targetSlug}'...`);
        await prisma.organisation.update({
            where: { id: tenant.id },
            data: {
                branding: {
                    upsert: {
                        create: {
                            logoUrl: logoUrl,
                            primaryColor: '#616E24', // Keeping existing colors just in case
                            secondaryColor: '#BFCC80'
                        },
                        update: {
                            logoUrl: logoUrl
                        }
                    }
                }
            }
        });
        console.log(`Updated logo to: ${logoUrl}`);
    } else {
        console.log(`Tenant '${targetSlug}' not found.`);
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
