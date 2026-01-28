import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const branding = {
        primaryColor: "#616E24", // Babus Olive
        secondaryColor: "#BFCC80", // Light Olive
        fontFamily: "Outfit, sans-serif",
        logoUrl: "https://www.babus.com/logo.png" // Placeholder or existing, mostly formatting colors here
    };

    try {
        const updated = await prisma.organisation.update({
            where: { slug: "babus" },
            data: {
                branding: branding
            }
        });
        console.log("Updated Babus branding:", updated);
    } catch (e) {
        console.error("Error updating branding:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
