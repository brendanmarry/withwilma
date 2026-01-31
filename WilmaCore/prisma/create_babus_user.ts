
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const email = 'brendan@babus.ch'; // Assuming this is the desired email
    const password = 'password123';

    console.log(`Ensuring user for Babus: ${email}`);

    const org = await prisma.organisation.findUnique({
        where: { slug: 'babus' }
    });

    if (!org) {
        console.error("Babus organisation not found!");
        process.exit(1);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            organisationId: org.id,
            role: 'admin'
        },
        create: {
            email,
            passwordHash: hashedPassword,
            name: 'Brendan (Babus)',
            role: 'admin',
            organisationId: org.id
        }
    });

    console.log(`User created/updated: ${user.email}`);
    console.log(`Password: ${password}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
