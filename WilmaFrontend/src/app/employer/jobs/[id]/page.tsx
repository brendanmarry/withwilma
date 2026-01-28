"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
// Removed date-fns to resolve build error issues
import {
    ArrowLeft,
    Share2,
    Calendar,
    Users,
    MoreHorizontal,
    PlayCircle,
    CheckCircle2,
    XCircle,
    Clock,
    Search
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Section from "@/components/ui/Section";
import { getJob, getJobCandidates } from "@/lib/api";
import { Job, Candidate } from "@/lib/types";
import { DeleteJobDialog } from "@/components/DeleteJobDialog";

export default function JobCandidatesPage() {
    const params = useParams();
    const router = useRouter();
    const [job, setJob] = useState<Job | null>(null);
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        async function loadData() {
            try {
                const jobId = params.id as string;
                const [jobData, candidatesData] = await Promise.all([
                    getJob(jobId),
                    getJobCandidates(jobId)
                ]);
                setJob(jobData);
                setCandidates(candidatesData);
            } catch (error) {
                console.error("Failed to load job data", error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [params.id]);

    const filteredCandidates = candidates.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getScoreColor = (score?: number) => {
        if (!score) return "bg-gray-100 text-gray-500";
        if (score >= 85) return "bg-green-100 text-green-700";
        if (score >= 70) return "bg-yellow-100 text-yellow-700";
        return "bg-red-50 text-red-600";
    };

    if (loading) {
        return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
    }

    if (!job) {
        return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Job not found</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <Section padding="none" className="py-4">
                    <div className="flex items-center gap-4 mb-4">
                        <Button variant="ghost" size="sm" asChild className="text-gray-500 -ml-2">
                            <Link href="/employer/jobs">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Jobs
                            </Link>
                        </Button>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
                                <Badge variant="outline" className={job.status === 'open' ? "text-green-600 bg-green-50 border-green-200" : "text-gray-600"}>
                                    {job.status === 'open' ? 'Active' : 'Closed'}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                <span className="flex items-center gap-1">
                                    <Users className="w-4 h-4" />
                                    {candidates.length} Applicants
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    Posted {new Date().toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(`${window.location.origin}/apply/${job.id}`)}>
                                <Share2 className="w-4 h-4 mr-2" />
                                Share Link
                            </Button>
                            <Button size="sm" className="bg-black text-white hover:bg-gray-800" asChild>
                                <Link href={`/employer/jobs/${job.id}/edit`}>Edit Job</Link>
                            </Button>
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
                            <p className="text-xs text-gray-400 mt-1">+2 from last week</p>
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
                            <p className="text-xs text-gray-400 mt-1">Based on AI Analysis</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Video Responses</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {candidates.filter(c => c.videos && c.videos.length > 0).length}
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Candidates with video</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Candidates List */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Applicants</h2>
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search candidates..."
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
                                                    Submitted{" "}
                                                    <span className="font-medium text-slate-700">
                                                        {new Date(candidate.createdAt).toLocaleDateString()}
                                                    </span>
                                                </span>
                                            )}
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
                                        {candidate.summary && (
                                            <p className="mt-2 text-xs text-slate-600 line-clamp-2">
                                                {candidate.summary}
                                            </p>
                                        )}
                                        {candidate.linkedin && (
                                            <a
                                                href={candidate.linkedin}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="mt-1 inline-block text-xs text-purple-600 hover:underline"
                                            >
                                                LinkedIn profile
                                            </a>
                                        )}
                                    </div>
                                    <div className="flex gap-2 text-sm">
                                        {candidate.videos && candidate.videos.length > 0 && (
                                            <Button variant="outline" size="sm" className="bg-white hover:bg-purple-50 hover:text-purple-700 border-gray-300" asChild>
                                                <Link href={`/employer/jobs/${job.id}/video?candidateId=${candidate.id}`}>
                                                    <PlayCircle className="w-4 h-4 mr-2" />
                                                    Watch Video
                                                </Link>
                                            </Button>
                                        )}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="border-gray-300 text-gray-700 hover:text-red-600 hover:border-red-200 hover:bg-red-50"
                                            onClick={() => { }}
                                        >
                                            Reject
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                            onClick={() => { }}
                                        >
                                            Accept / Schedule
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
