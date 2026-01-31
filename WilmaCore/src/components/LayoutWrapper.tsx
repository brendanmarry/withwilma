"use client";

import { usePathname } from "next/navigation";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

interface LayoutWrapperProps {
    children: React.ReactNode;
    isTenant: boolean;
}

export function LayoutWrapper({ children, isTenant }: LayoutWrapperProps) {
    const pathname = usePathname();
    const isCandidateFlow =
        pathname?.startsWith("/apply") ||
        pathname?.startsWith("/questions") ||
        pathname?.startsWith("/interview") ||
        pathname?.startsWith("/thanks") ||
        pathname?.startsWith("/success");
    const isEmployerFlow = pathname?.startsWith("/employer");

    // Show Nav/Footer only if NOT a tenant site AND NOT candidate flow AND NOT employer flow (employer usually has its own sidebar, but checking just in case)
    // Actually, employer flow currently uses RootLayout? Let's check. 
    // Based on current layout.tsx: !isTenant && <Navigation />. 
    // We just want to exclude it for /apply.

    const showNavAndFooter = !isTenant && !isCandidateFlow;

    return (
        <>
            {showNavAndFooter && <Navigation />}
            <main className="flex-1">{children}</main>
            {showNavAndFooter && <Footer />}
        </>
    );
}
