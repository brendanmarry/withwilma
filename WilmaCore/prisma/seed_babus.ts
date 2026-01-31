
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const slug = 'babus';
    const name = "Babu's";
    const rootUrl = 'https://babus.ch';
    const branding = {
        primaryColor: '#616E24',
        logoUrl: 'https://cdn.shopify.com/s/files/1/0554/7881/2764/files/Babus_Logo_600x.png?v=1620658421'
    };

    const existing = await prisma.organisation.findUnique({
        where: { slug }
    });

    if (existing) {
        console.log(`Updating existing tenant: ${slug}`);
        await prisma.organisation.update({
            where: { slug },
            data: {
                name,
                rootUrl,
                branding
            }
        });
    } else {
        console.log(`Creating new tenant: ${slug}`);
        await prisma.organisation.create({
            data: {
                name,
                slug,
                rootUrl,
                branding,
                // Add random uuid for initial id if needed, but default(uuid()) handles it
            }
        });
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
