"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export function SuccessContent() {
    return (
        <div className="flex flex-col items-center justify-center p-4 text-center min-h-screen">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-[var(--brand-primary)]/10 mb-6">
                <CheckCircle className="h-10 w-10 text-[var(--brand-primary)]" />
            </div>

            <div className="space-y-4 max-w-md">
                <h1 className="text-3xl font-black uppercase text-slate-900 tracking-tighter">Application Submitted!</h1>
                <p className="text-lg text-slate-600 leading-relaxed font-medium">
                    Thank you for applying to Babu&apos;s. We have received your application and response. You will receive a confirmation email shortly.
                </p>
            </div>

            <div className="mt-10">
                <Button asChild size="lg" className="rounded-2xl h-14 px-10 text-lg font-bold uppercase tracking-widest bg-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/90 text-white shadow-xl">
                    <Link href="/">
                        Back to Home
                    </Link>
                </Button>
            </div>
        </div>
    );
}
