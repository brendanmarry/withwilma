import { getBranding } from "@/lib/api";
import { headers } from "next/headers";
import { SuccessContent } from "./SuccessContent";

export default async function SuccessPage() {
    const headersList = await headers();
    const host = headersList.get("host") || "";
    const branding = await getBranding(null, host);

    return (
        <div
            className="min-h-screen bg-[#FAF8F2] selection:bg-[var(--brand-primary)] selection:text-white"
            style={{
                // @ts-ignore
                "--brand-primary": branding.primaryColor,
                "--brand-secondary": branding.secondaryColor || branding.primaryColor, // fallback
                fontFamily: `'Outfit', sans-serif`,
            }}
        >
            <style dangerouslySetInnerHTML={{
                __html: `
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap');
                
                body {
                    background-color: #FAF8F2;
                }
            `}} />
            <SuccessContent />
        </div>
    );
}
