"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default function SuccessPage() {
    return (
        <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-4 text-center">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100 mb-6">
                <CheckCircle className="h-10 w-10 text-green-600" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">Application Submitted!</h1>
            <p className="text-lg text-gray-600 max-w-md mb-8">
                Thank you for applying to Babu&apos;s. We have received your application and video response. You will receive a confirmation email shortly.
            </p>

            <Button asChild size="lg" className="rounded-full bg-black text-white hover:bg-gray-800">
                <Link href="/">
                    Back to Home
                </Link>
            </Button>
        </div>
    );
}
