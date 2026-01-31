"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, Briefcase, FileText, Settings, ChevronRight, Sparkles } from "lucide-react";
import Link from "next/link";
import Section from "@/components/ui/Section";
import { JobSourceCard } from "./JobSourceCard";
import { getJobs, getCandidates } from "@/lib/api";

export default function HomePage() {
    const { user, loading: authLoading } = useAuth();
    const [stats, setStats] = useState({ activeJobs: 0, newCandidates: 0 });
    const [loadingStats, setLoadingStats] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            if (!user?.organisationId) return;
            try {
                const [{ jobs }, { items: candidates }] = await Promise.all([
                    getJobs(user.organisationId),
                    getCandidates(undefined, user.organisationId)
                ]);
                setStats({
                    activeJobs: jobs.length,
                    newCandidates: candidates.length
                });
            } catch (error) {
                console.error("Failed to load dashboard stats", error);
            } finally {
                setLoadingStats(false);
            }
        }

        if (user) {
            fetchStats();
        }
    }, [user]);

    if (authLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <p>Please log in to access your employer account.</p>
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
                        <h1 className="text-3xl font-bold text-gray-900">Home</h1>
                        <p className="text-gray-600">Welcome back, {user.name || user.email}</p>
                    </div>
                    <div className="flex gap-2">
                        <Button asChild variant="outline">
                            <Link href="/employer/settings/account">
                                <Settings className="mr-2 h-4 w-4" />
                                Settings
                            </Link>
                        </Button>
                        <Button asChild className="bg-purple-600 hover:bg-purple-700 shadow-md">
                            <Link href="/employer/jobs/new">
                                <Plus className="mr-2 h-4 w-4" />
                                Add New Job
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">

                    {/* 1. Active Role Management */}
                    <Card className="hover:shadow-lg transition-all border-purple-100 flex flex-col">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-gray-900">
                                <Briefcase className="w-5 h-5 text-purple-600" />
                                Active Role Management
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-center mb-4 p-4 bg-purple-50/50 rounded-xl border border-purple-50">
                                    <span className="text-gray-600 font-medium">Active Positions</span>
                                    <span className="text-3xl font-bold text-purple-700">{loadingStats ? "..." : stats.activeJobs}</span>
                                </div>
                                <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                                    Manage your open roles, update job descriptions, and track recruitment progress in real-time.
                                </p>
                            </div>
                            <Button asChild className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-6 rounded-xl transition-all">
                                <Link href="/employer/jobs">Go to Jobs List</Link>
                            </Button>
                        </CardContent>
                    </Card>

                    {/* 2. Review Candidate Submissions */}
                    <Card className="hover:shadow-lg transition-all border-purple-100 flex flex-col">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-gray-900">
                                <FileText className="w-5 h-5 text-purple-600" />
                                Review Candidate Submissions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-center mb-4 p-4 bg-purple-50/50 rounded-xl border border-purple-50">
                                    <span className="text-gray-600 font-medium">New Applications</span>
                                    <span className="text-3xl font-bold text-purple-700">{stats.newCandidates}</span>
                                </div>
                                <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                                    View incoming applications, watch screening videos, and shortlist the best talent using Wilma's AI analysis.
                                </p>
                            </div>
                            <Button asChild className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-6 rounded-xl transition-all">
                                <Link href="/employer/candidates">View All Submissions</Link>
                            </Button>
                        </CardContent>
                    </Card>

                    {/* 3. Company Understanding & Culture */}
                    <Card className="hover:shadow-lg transition-all border-purple-100 flex flex-col bg-gradient-to-br from-white to-purple-50/30">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-gray-900">
                                <Sparkles className="w-5 h-5 text-purple-600" />
                                Company Culture & Insights
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow flex flex-col justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                                    Enhance corporate perception, refine your brand DNA, and discuss with Wilma what questions candidates are actually asking.
                                </p>
                            </div>
                            <Button asChild variant="outline" className="w-full border-purple-200 text-purple-700 hover:bg-purple-50 font-semibold py-6 rounded-xl transition-all">
                                <Link href="/employer/onboarding">Discuss Culture with Wilma</Link>
                            </Button>
                        </CardContent>
                    </Card>

                    {/* 4. Candidate Experience UI */}
                    <Card className="hover:shadow-lg transition-all border-purple-100 flex flex-col bg-gradient-to-br from-white to-purple-50/30">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-gray-900">
                                <FileText className="w-5 h-5 text-purple-600" />
                                Candidate Experience Site
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow flex flex-col justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                                    Manage and preview your branded careers site. Ensure your company DNA is reflected in every candidate interaction.
                                </p>
                            </div>
                            <div className="flex flex-col gap-3">
                                {user?.organisation?.slug && (
                                    <Button asChild className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-6 rounded-xl transition-all shadow-lg group">
                                        <a
                                            href={typeof window !== 'undefined'
                                                ? `${window.location.protocol}//${user.organisation.slug}.${window.location.host.split('.').slice(-2).join('.')}`
                                                : `http://${user.organisation.slug}.withwilma.com`
                                            }
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center"
                                        >
                                            Preview Site
                                            <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                        </a>
                                    </Button>
                                )}
                                <Button asChild variant="outline" className="w-full border-purple-200 text-purple-700 hover:bg-purple-50 font-semibold py-6 rounded-xl transition-all">
                                    <Link href="/employer/settings/branding">
                                        Customize Branding
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </Section>
        </div>
    );
}
