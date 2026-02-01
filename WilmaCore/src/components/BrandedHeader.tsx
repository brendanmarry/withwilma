"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Organisation } from "@/lib/types";

interface BrandedHeaderProps {
    tenant?: Organisation | null;
    branding?: any;
    backLink?: string;
    backLabel?: string;
}

export function BrandedHeader({ tenant, branding, backLink = "/", backLabel = "Back to roles" }: BrandedHeaderProps) {
    // Fallback branding if not provided directly
    const primaryColor = branding?.primaryColor || tenant?.branding?.primaryColor || "#000000";
    const logoUrl = branding?.logoUrl || tenant?.branding?.logoUrl;
    const name = branding?.name || tenant?.name || "Wilma";

    return (
        <header
            className="w-full py-6 px-6 lg:px-12 flex items-center justify-between sticky top-0 z-50 transition-all duration-300 shadow-md"
            style={{ backgroundColor: primaryColor }}
        >
            <div className="flex items-center gap-4">
                {backLink && (
                    <Link
                        href={backLink}
                        className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:opacity-70 transition-opacity text-white"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">{backLabel}</span>
                    </Link>
                )}
            </div>

            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                {logoUrl ? (
                    <img src={logoUrl} alt={name} className="h-8 md:h-10 object-contain" />
                ) : (
                    <span
                        className="text-2xl md:text-3xl font-black tracking-tighter uppercase select-none text-white"
                    >
                        {name}
                    </span>
                )}
            </div>

            <div className="w-20" /> {/* Spacer for centering */}
        </header>
    );
}
