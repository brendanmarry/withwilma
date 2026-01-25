"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Section from "@/components/ui/Section";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function OnboardingPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navigation />
            <Section padding="lg">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold">Welcome to withWilma Onboarding</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-gray-600">
                            Let's set up your company profile and refine your recruitment DNA.
                        </p>
                        <div className="flex gap-4">
                            <Button asChild>
                                <Link href="/employer/dashboard">Go to Dashboard</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </Section>
        </div>
    );
}
