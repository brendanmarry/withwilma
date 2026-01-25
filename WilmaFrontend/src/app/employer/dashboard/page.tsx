"use client";

import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, Briefcase, FileText, Settings, Sparkles } from "lucide-react";
import Link from "next/link";
import Section from "@/components/ui/Section";
import { JobSourceCard } from "./JobSourceCard";

export default function DashboardPage() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <p>Please log in to access the dashboard.</p>
                <Button asChild>
                    <Link href="/employer/login">Log In</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Section padding="lg">
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                        <p className="text-gray-600">Welcome back, {user.name || user.email}</p>
                    </div>
                    <div className="flex gap-2">
                        <Button asChild variant="outline">
                            <Link href="/employer/settings/account">
                                <Settings className="mr-2 h-4 w-4" />
                                Settings
                            </Link>
                        </Button>
                        <Button asChild className="bg-purple-600 hover:bg-purple-700">
                            <Link href="/employer/jobs/new">
                                <Plus className="mr-2 h-4 w-4" />
                                Add New Job
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="mb-8">
                    <JobSourceCard />
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">--</div>
                            <p className="text-xs text-muted-foreground">
                                <Link href="/employer/jobs" className="underline hover:text-purple-600">View all jobs</Link>
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">New Candidates</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">--</div>
                            <p className="text-xs text-muted-foreground">
                                +0 from last week
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="bg-purple-50 border-purple-100">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-purple-900">Refine Company DNA</h3>
                                    <p className="text-sm text-purple-700 mt-1">Chat with withWilma to improve matching.</p>
                                </div>
                                <Button asChild size="sm" className="bg-purple-600">
                                    <Link href="/employer/onboarding">Start</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </Section>
        </div>
    );
}
