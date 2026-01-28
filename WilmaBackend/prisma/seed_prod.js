
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    const slug = 'wilma';
    const name = 'Wilma';
    const rootUrl = 'https://withwilma.com';
    const branding = {
        primaryColor: '#000000',
        logoUrl: 'https://withwilma.com/logo.png'
    };

    console.log(`Ensuring organisation: ${name} (${slug})`);

    // 1. Upsert Organisation
    const org = await prisma.organisation.upsert({
        where: { slug },
        update: {
            name,
            rootUrl,
            branding
        },
        create: {
            name,
            slug,
            rootUrl,
            branding
        }
    });

    console.log(`Organisation ID: ${org.id}`);

    // 2. Upsert Admin User
    const email = 'admin@withwilma.com';
    const password = 'password123'; // Temporary password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            passwordHash: hashedPassword,
            organisationId: org.id,
            role: 'admin'
        },
        create: {
            email,
            passwordHash: hashedPassword,
            name: 'Wilma Admin',
            role: 'admin',
            organisationId: org.id
        }
    });

    console.log(`User ensured: ${user.email}`);
    console.log(`Initial password: ${password}`);
    console.log('PLEASE CHANGE THIS PASSWORD IMMEDIATELY AFTER LOGIN');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
