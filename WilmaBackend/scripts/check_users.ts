
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        include: {
            organisation: true
        }
    });

    if (users.length === 0) {
        console.log("No users found in the database.");
    } else {
        console.log(`Found ${users.length} users:`);
        users.forEach(u => {
            console.log(`- ${u.email} (Role: ${u.role}, Org: ${u.organisation.name})`);
        });
    }

    const orgs = await prisma.organisation.findMany();
    console.log(`Found ${orgs.length} organisations:`);
    orgs.forEach(o => console.log(`- ${o.name} (${o.slug})`));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
