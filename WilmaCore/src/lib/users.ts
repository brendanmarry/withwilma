import { prisma } from "@/lib/db";
import { User } from "@prisma/client";
import bcrypt from "bcrypt";

export async function findUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
        where: { email },
    });
}

export async function verifyUserPassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
}

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
}

export async function createUser(data: {
    email: string;
    password: string;
    name?: string;
    organisationId: string;
    role?: string;
}): Promise<User> {
    const passwordHash = await hashPassword(data.password);
    return prisma.user.create({
        data: {
            email: data.email,
            passwordHash,
            name: data.name,
            organisationId: data.organisationId,
            role: data.role || "recruiter",
        },
    });
}
