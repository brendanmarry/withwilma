
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const email = 'brendan@babus.ch';
    const password = 'password123';
    const hashedPassword = await hash(password, 10);

    try {
        const user = await prisma.user.update({
            where: { email },
            data: { passwordHash: hashedPassword },
        });
        console.log(`Password updated for ${user.email}`);
    } catch (e) {
        console.error(`Failed to update password: ${e}`);
        // If update fails, maybe user doesn't exist, try create? No, user said "for brendan@babus.ch" implying account exists.
        // If it fails, I'll see the error.
    } finally {
        await prisma.$disconnect();
    }
}

main();
