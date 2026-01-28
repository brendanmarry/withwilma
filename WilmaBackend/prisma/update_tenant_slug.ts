
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const oldSlug = 'babus';
    const newSlug = 'babus-z4k9';

    console.log(`Updating tenant slug from '${oldSlug}' to '${newSlug}'...`);

    // Check if target slug already exists
    const targetExists = await prisma.organisation.findUnique({
        where: { slug: newSlug }
    });

    if (targetExists) {
        console.log(`Target slug '${newSlug}' already exists. Updating its branding instead.`);
        await prisma.organisation.update({
            where: { slug: newSlug },
            data: {
                branding: {
                    primaryColor: '#616E24',
                    logoUrl: 'https://cdn.shopify.com/s/files/1/0554/7881/2764/files/Babus_Logo_600x.png?v=1620658421'
                }
            }
        });
    } else {
        // Check if old slug exists
        const oldExists = await prisma.organisation.findUnique({
            where: { slug: oldSlug }
        });

        if (oldExists) {
            await prisma.organisation.update({
                where: { slug: oldSlug },
                data: { slug: newSlug }
            });
            console.log("Slug updated successfully.");
        } else {
            console.log(`Neither '${oldSlug}' nor '${newSlug}' found. Creating new tenant.`);
            await prisma.organisation.create({
                data: {
                    name: "Babu's",
                    slug: newSlug,
                    rootUrl: 'https://babus.ch',
                    branding: {
                        primaryColor: '#616E24',
                        logoUrl: 'https://cdn.shopify.com/s/files/1/0554/7881/2764/files/Babus_Logo_600x.png?v=1620658421'
                    }
                }
            });
        }
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
