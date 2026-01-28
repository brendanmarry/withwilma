
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const email = 'brendan.marry@gmail.com';
    const newPassword = 'password123';

    console.log(`Resetting password for ${email}...`);

    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user) {
        console.error(`User ${email} not found!`);
        process.exit(1);
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
        where: { email },
        data: { passwordHash }
    });

    console.log(`Password for ${email} has been reset to '${newPassword}'`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
