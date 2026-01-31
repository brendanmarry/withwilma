"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Share2,
    Calendar,
    Users,
    PlayCircle,
    Search,
    Filter,
    Loader2,
    Trash2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Section from "@/components/ui/Section";
import { getCandidates, getJobs, deleteCandidate } from "@/lib/api";
import { Candidate, Job } from "@/lib/types";
import { useAuth } from "@/context/auth-context";

export default function AllCandidatesPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedJobId, setSelectedJobId] = useState<string>("");

    useEffect(() => {
        async function loadData() {
            if (!user?.organisationId) return;
            try {
                const [candidatesData, jobsData] = await Promise.all([
                    getCandidates(selectedJobId || undefined, user.organisationId),
                    getJobs(user.organisationId)
                ]);
                setCandidates(candidatesData.items);
                setJobs(jobsData.jobs);
            } catch (error) {
                console.error("Failed to load candidates", error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [user, selectedJobId]);

    const filteredCandidates = candidates.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-purple-600 mb-4" />
                <p className="text-gray-500 font-medium animate-pulse">Gathering all applications...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <Section padding="none" className="py-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Candidate Applications</h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Review and manage all applications across your active roles.
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <div className="relative">
                                <Filter className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <select
                                    className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 appearance-none bg-white min-w-[200px]"
                                    value={selectedJobId}
                                    onChange={(e) => setSelectedJobId(e.target.value)}
                                >
                                    <option value="">All Roles</option>
                                    {jobs.map(job => (
                                        <option key={job.id} value={job.id}>{job.title}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </Section>
            </header>

            <Section padding="lg" className="mt-8">
                {/* Stats / Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Total Applicants</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{candidates.length}</div>
                            <p className="text-xs text-gray-400 mt-1">Across {selectedJobId ? "selected role" : "all roles"}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Avg. Match Score</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-600">
                                {candidates.length > 0
                                    ? Math.round(candidates.reduce((acc, c) => acc + (c.matchScore || 0), 0) / candidates.length)
                                    : "-"
                                }%
                            </div>
                            <p className="text-xs text-gray-400 mt-1">AI alignment score</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Video Responses</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600">
                                {candidates.filter(c => c.videos && c.videos.length > 0).length}
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Ready for review</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Candidates List */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Applications</h2>
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    {filteredCandidates.length === 0 ? (
                        <div className="p-12 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-200">
                            <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                            <p>No candidates found matching your criteria.</p>
                        </div>
                    ) : (
                        filteredCandidates.map((candidate) => (
                            <div
                                key={candidate.id}
                                className={`rounded-xl border p-5 transition-all hover:shadow-md bg-white border-gray-200`}
                            >
                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-base font-semibold text-slate-900">{candidate.name}</h4>
                                            {(!candidate.status || candidate.status === 'new') && (
                                                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                                                    New
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-slate-600">{candidate.email}</p>
                                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                            {candidate.createdAt && (
                                                <span>
                                                    Applied{" "}
                                                    <span className="font-medium text-slate-700">
                                                        {new Date(candidate.createdAt).toLocaleDateString()}
                                                    </span>
                                                </span>
                                            )}
                                            <span>·</span>
                                            <span>Role: <span className="font-medium text-purple-600">{(candidate as any).job?.title}</span></span>
                                            <span>·</span>
                                            <span className="font-semibold text-emerald-600 capitalize">
                                                {candidate.status || 'Awaiting Review'}
                                            </span>
                                        </div>
                                        <div className="mt-2 flex items-center gap-2">
                                            <span className="text-xs text-slate-600">
                                                Match Score:{" "}
                                            </span>
                                            <span
                                                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${!candidate.matchScore
                                                    ? "bg-slate-100 text-slate-600"
                                                    : candidate.matchScore >= 85
                                                        ? "bg-emerald-100 text-emerald-700"
                                                        : candidate.matchScore >= 70
                                                            ? "bg-yellow-100 text-yellow-700"
                                                            : "bg-rose-100 text-rose-700"
                                                    }`}
                                            >
                                                {candidate.matchScore ? `${candidate.matchScore}%` : "Pending"}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 text-sm">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="bg-white hover:bg-purple-50 hover:text-purple-700 border-gray-300"
                                            onClick={() => router.push(`/employer/candidates/${candidate.id}`)}
                                        >
                                            {candidate.videos && candidate.videos.length > 0 ? (
                                                <>
                                                    <PlayCircle className="w-4 h-4 mr-2" />
                                                    Review Application
                                                </>
                                            ) : (
                                                "View Application"
                                            )}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-gray-400 hover:text-red-600 hover:bg-red-50"
                                            onClick={async (e) => {
                                                e.stopPropagation();
                                                if (confirm("Delete this application?")) {
                                                    try {
                                                        await deleteCandidate(candidate.id);
                                                        setCandidates(prev => prev.filter(c => c.id !== candidate.id));
                                                    } catch (err) {
                                                        alert("Failed to delete");
                                                    }
                                                }
                                            }}
                                            title="Delete Application"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Section>
        </div>
    );
}
