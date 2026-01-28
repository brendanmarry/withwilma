"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    ArrowRight,
    Mail,
    Linkedin,
    Calendar,
    PlayCircle,
    Loader2,
    CheckCircle,
    XCircle,
    Clock,
    Trash2,
    FileText,
    MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Section from "@/components/ui/Section";
import { getCandidate, deleteCandidate, updateCandidateStatus, getCandidates } from "@/lib/api";
import { Candidate } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Modal } from "@/components/ui/modal";

export default function CandidatePage(props: { params: Promise<{ candidateId: string }> }) {
    const params = React.use(props.params);
    const router = useRouter();
    const [candidate, setCandidate] = useState<Candidate | null>(null);
    const [prevCandidateId, setPrevCandidateId] = useState<string | null>(null);
    const [nextCandidateId, setNextCandidateId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);

    useEffect(() => {
        async function loadCandidateData() {
            setLoading(true);
            try {
                const data = await getCandidate(params.candidateId);
                setCandidate(data);

                // Fetch all candidates to find the next/prev one with cycling
                // Note: We now fetch ALL candidates for the organisation to allow global navigation
                const allCandidatesRes = await getCandidates();
                if (allCandidatesRes.items && allCandidatesRes.items.length > 1) {
                    const sorted = allCandidatesRes.items;
                    const currentIndex = sorted.findIndex(c => c.id === params.candidateId);

                    if (currentIndex !== -1) {
                        // Calculate Prev (Loop to end if at start)
                        const prevIndex = currentIndex === 0 ? sorted.length - 1 : currentIndex - 1;
                        setPrevCandidateId(sorted[prevIndex].id);

                        // Calculate Next (Loop to start if at end)
                        const nextIndex = currentIndex === sorted.length - 1 ? 0 : currentIndex + 1;
                        setNextCandidateId(sorted[nextIndex].id);
                    }
                } else {
                    setPrevCandidateId(null);
                    setNextCandidateId(null);
                }
            } catch (err) {
                console.error("Failed to load candidate", err);
                setError("Failed to load candidate details.");
            } finally {
                setLoading(false);
            }
        }
        loadCandidateData();
    }, [params.candidateId]);

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this application? This action cannot be undone.")) return;
        setProcessing(true);
        try {
            await deleteCandidate(params.candidateId);
            router.push("/employer/candidates");
        } catch (err) {
            alert("Failed to delete candidate");
            setProcessing(false);
        }
    };

    const handleStatusUpdate = async (status: string) => {
        setProcessing(true);
        try {
            const updated = await updateCandidateStatus(params.candidateId, status);
            setCandidate(updated);
        } catch (err) {
            alert("Failed to update status");
        } finally {
            setProcessing(false);
        }
    };

    const handleNext = () => {
        if (nextCandidateId) {
            router.push(`/employer/candidates/${nextCandidateId}`);
        }
    };

    const handlePrev = () => {
        if (prevCandidateId) {
            router.push(`/employer/candidates/${prevCandidateId}`);
        }
    };

    const getMatchColor = (score?: number) => {
        if (!score) return "text-slate-600 bg-slate-100";
        if (score >= 85) return "text-emerald-700 bg-emerald-100 ring-emerald-600/20";
        if (score >= 70) return "text-yellow-700 bg-yellow-100 ring-yellow-600/20";
        return "text-rose-700 bg-rose-100 ring-rose-600/20";
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-purple-600 mb-4" />
                <p className="text-gray-500 font-medium animate-pulse">Loading candidate profile...</p>
            </div>
        );
    }

    if (error || !candidate) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Candidate Not Found</h2>
                    <p className="text-gray-500 mb-6">{error || "The candidate you are looking for does not exist or has been removed."}</p>
                    <Button onClick={() => router.back()}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            {/* Immersive Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
                <Section padding="none" className="py-4">
                    <div className="flex flex-col gap-4">
                        {/* Top Row: Navigation & Meta */}
                        <div className="flex items-center justify-between">
                            {/* Left Side: Empty now (Back button moved) */}
                            <div></div>
                        </div>

                        {/* Main Header Content */}
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
                            <div className="flex items-start gap-5">
                                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-50 flex items-center justify-center text-purple-600 text-3xl font-bold shadow-inner border border-purple-100/50">
                                    {candidate.name.charAt(0)}
                                </div>
                                <div className="space-y-1">
                                    <h1 className="text-2xl font-bold text-gray-900 leading-tight">{candidate.name}</h1>
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <span className="font-medium text-gray-900">{(candidate as any).job?.title}</span>
                                        <span>•</span>
                                        <span>{candidate.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 pt-2">
                                        {candidate.linkedin && (
                                            <a href={candidate.linkedin} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-md hover:bg-blue-100 transition-colors">
                                                <Linkedin className="w-3 h-3" /> LinkedIn
                                            </a>
                                        )}
                                        {candidate.cvUrl && (
                                            <button onClick={() => window.open(candidate.cvUrl!, '_blank')} className="text-xs font-medium text-gray-600 hover:text-gray-900 flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md hover:bg-gray-200 transition-colors">
                                                <FileText className="w-3 h-3" /> Resume
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 self-end lg:self-center">
                                {/* Match Score Ring (Clickable) */}
                                <button
                                    onClick={() => setIsMatchModalOpen(true)}
                                    className="flex items-center gap-3 mr-4 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors group cursor-pointer"
                                    title="Click to view score breakdown"
                                >
                                    <div className="text-right">
                                        <div className="text-xs text-gray-500 group-hover:text-gray-700 font-medium uppercase tracking-wide transition-colors">Match Score</div>
                                        <div className={cn("text-xl font-bold transition-colors", getMatchColor(candidate.matchScore).split(" ")[0])}>
                                            {candidate.matchScore}%
                                        </div>
                                    </div>
                                    <div className={cn("h-10 w-10 rounded-full flex items-center justify-center font-bold text-xs ring-4 ring-inset shadow-sm group-hover:scale-105 transition-transform", getMatchColor(candidate.matchScore))}>
                                        AI
                                    </div>
                                </button>

                                <div className="flex items-center gap-2">
                                    <div className="flex flex-col items-end">
                                        <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">Current Status</span>
                                        <span className={cn(
                                            "px-3 py-1 rounded-full text-sm font-semibold capitalize mt-1",
                                            (candidate.status === "new" || !candidate.status) && "bg-blue-100 text-blue-700",
                                            candidate.status === "reviewed" && "bg-indigo-100 text-indigo-700",
                                            candidate.status === "interview" && "bg-purple-100 text-purple-700",
                                            candidate.status === "rejected" && "bg-red-100 text-red-700",
                                            candidate.status === "shortlisted" && "bg-emerald-100 text-emerald-700",
                                            candidate.status === "withdrawn" && "bg-gray-100 text-gray-600"
                                        )}>
                                            {candidate.status || "New"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Section>
            </div>

            <Section padding="lg" className="mt-8">
                {/* Navigation Controls */}
                <div className="flex items-center justify-between mb-8">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push('/employer/candidates')}
                        className="bg-white hover:bg-gray-50 text-gray-700 border-gray-200"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Candidates
                    </Button>

                    <div className="flex items-center bg-white rounded-lg border border-gray-200 p-1 shadow-sm">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handlePrev}
                            disabled={!prevCandidateId}
                            className={cn("text-gray-600 h-8", !prevCandidateId && "opacity-40 cursor-not-allowed")}
                            title="Previous Candidate"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" /> Previous
                        </Button>
                        <div className="w-px h-4 bg-gray-200 mx-1"></div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleNext}
                            disabled={!nextCandidateId}
                            className={cn("text-gray-600 h-8", !nextCandidateId && "opacity-40 cursor-not-allowed")}
                            title="Next Candidate"
                        >
                            Next <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* LEFT COLUMN (Main Content) */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* Video Responses (Moved to Top) */}
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <span className="bg-emerald-100 p-1.5 rounded-lg text-emerald-600">
                                        <PlayCircle className="w-4 h-4" />
                                    </span>
                                    Video Interview
                                </h3>
                                <div className="text-sm text-gray-500">
                                    {candidate.videos?.length || 0} Responses
                                </div>
                            </div>

                            {!candidate.videos || candidate.videos.length === 0 ? (
                                <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <PlayCircle className="w-8 h-8 text-gray-300" />
                                    </div>
                                    <h4 className="text-gray-900 font-medium mb-1">No video responses</h4>
                                    <p className="text-gray-500 text-sm">This candidate has not recorded any answers yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {candidate.videos.map((video, index) => (
                                        <div key={video.id || index} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm transition-shadow hover:shadow-md">
                                            {/* Question Header */}
                                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/80 flex items-start gap-3">
                                                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 text-xs font-bold text-gray-600 mt-0.5">
                                                    {index + 1}
                                                </span>
                                                <h4 className="font-medium text-gray-900 leading-snug">
                                                    {video.followupQuestion?.question || `Question ${index + 1}`}
                                                </h4>
                                            </div>

                                            <div className="bg-black relative aspect-video group w-full">
                                                <video
                                                    src={video.videoUrl}
                                                    controls
                                                    className="w-full h-full object-contain"
                                                    preload="metadata"
                                                />
                                            </div>
                                            {video.analysis && (
                                                <div className="bg-emerald-50/50 p-4 border-t border-gray-100">
                                                    <h5 className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                        <CheckCircle className="w-3 h-3" /> AI Insight
                                                    </h5>
                                                    <p className="text-sm text-gray-700">
                                                        {typeof video.analysis === 'string' ? video.analysis : JSON.stringify(video.analysis)}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* AI Summary Card (Moved Below Videos) */}
                        {candidate.summary && (
                            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <div className="w-32 h-32 bg-purple-600 rounded-full blur-3xl -mr-16 -mt-16"></div>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <span className="bg-purple-100 p-1.5 rounded-lg text-purple-600">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </span>
                                    AI Executive Summary
                                </h3>
                                <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed bg-gray-50/50 p-5 rounded-xl border border-gray-100/50">
                                    {candidate.summary}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN (Meta & Context) */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Management Card (Actions) */}
                        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                                <h4 className="font-semibold text-gray-900 text-sm">Application Management</h4>
                            </div>
                            <div className="p-6 space-y-4">
                                {(!candidate.status || candidate.status.toLowerCase() === "new" || candidate.status.toLowerCase() === "reviewed") ? (
                                    <div className="space-y-2">
                                        <Button
                                            onClick={() => handleStatusUpdate("interview")}
                                            disabled={processing}
                                            className="w-full bg-purple-600 hover:bg-purple-700 shadow-sm shadow-purple-200"
                                        >
                                            <CheckCircle className="w-4 h-4 mr-2" /> Move to Interview
                                        </Button>
                                        <div className="grid grid-cols-2 gap-2">
                                            <Button
                                                variant="outline"
                                                onClick={() => handleStatusUpdate("shortlisted")}
                                                disabled={processing}
                                                className="w-full border-gray-200 hover:bg-gray-50"
                                            >
                                                <MoreHorizontal className="w-4 h-4 mr-2" /> Shortlist
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => handleStatusUpdate("rejected")}
                                                disabled={processing}
                                                className="w-full border-gray-200 hover:bg-red-50 hover:text-red-600"
                                            >
                                                <XCircle className="w-4 h-4 mr-2" /> Reject
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-center mb-6">
                                        <div className="flex justify-center mb-2">
                                            {candidate.status === "interview" && <CheckCircle className="w-8 h-8 text-purple-500" />}
                                            {candidate.status === "rejected" && <XCircle className="w-8 h-8 text-red-500" />}
                                            {candidate.status === "shortlisted" && <CheckCircle className="w-8 h-8 text-emerald-500" />}
                                        </div>
                                        <h5 className="font-semibold text-gray-900 capitalize">{candidate.status}</h5>
                                        <p className="text-xs text-gray-500 mt-1">Waiting for review</p>

                                        <Button
                                            variant="link"
                                            size="sm"
                                            onClick={() => handleStatusUpdate("new")}
                                            className="text-gray-400 hover:text-gray-600 mt-2 h-auto p-0 text-xs"
                                        >
                                            Reset Status
                                        </Button>
                                    </div>
                                )}

                                <div className="flex flex-col gap-2 pt-4 border-t border-gray-100">
                                    {candidate.cvUrl && (
                                        <Button variant="ghost" className="justify-start text-xs text-gray-600 h-8" onClick={() => window.open(candidate.cvUrl!, '_blank')}>
                                            <FileText className="w-3 h-3 mr-2" /> Download Original CV
                                        </Button>
                                    )}
                                    <Button variant="ghost" className="justify-start text-xs text-red-600 hover:text-red-700 hover:bg-red-50 h-8" onClick={handleDelete}>
                                        <Trash2 className="w-3 h-3 mr-2" /> Delete Application
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Context Card (Timeline) */}
                        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                                <h4 className="font-semibold text-gray-900 text-sm">Application Details</h4>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="bg-purple-100 p-2 rounded-lg text-purple-600 mt-0.5">
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium uppercase">Applied On</p>
                                        <p className="text-sm font-medium text-gray-900">{new Date(candidate.createdAt || "").toLocaleDateString(undefined, {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {new Date(candidate.createdAt || "").toLocaleTimeString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 pt-4 border-t border-gray-100">
                                    <div className="bg-blue-100 p-2 rounded-lg text-blue-600 mt-0.5">
                                        <Clock className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium uppercase">Current Stage</p>
                                        <p className="text-sm font-medium text-gray-900 capitalize">{candidate.status || "New Application"}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 pt-4 border-t border-gray-100">
                                    <div className="bg-gray-100 p-2 rounded-lg text-gray-600 mt-0.5">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-gray-500 font-medium uppercase">Email Address</p>
                                        <p className="text-sm font-medium text-gray-900 truncate" title={candidate.email}>{candidate.email}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Screening Questions Section */}
                {candidate.screeningData && Object.keys(candidate.screeningData).length > 0 && (
                    <div className="mt-8">
                        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                                <div className="bg-orange-100 p-1.5 rounded-lg text-orange-600">
                                    <FileText className="w-4 h-4" />
                                </div>
                                <h4 className="font-semibold text-gray-900 text-sm">Screening Responses</h4>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {Object.entries(candidate.screeningData).map(([question, answer], idx) => (
                                    <div key={idx} className="p-6 hover:bg-gray-50/50 transition-colors">
                                        <p className="text-sm font-bold text-gray-800 mb-2">{question}</p>
                                        <p className="text-gray-600 text-sm leading-relaxed">{answer as string}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </Section>

            {/* Match Score Modal */}
            <Modal
                isOpen={isMatchModalOpen}
                onClose={() => setIsMatchModalOpen(false)}
                title="Match Score Analysis"
                className="max-w-2xl"
            >
                <div className="space-y-6">
                    <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div className={cn("h-16 w-16 rounded-full flex items-center justify-center font-bold text-xl ring-4 ring-inset bg-white", getMatchColor(candidate.matchScore))}>
                            {candidate.matchScore}%
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">AI Compatibility Score</h3>
                            <p className="text-sm text-gray-500">Based on job requirements analysis</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <h4 className="text-sm font-bold text-emerald-700 uppercase tracking-wide flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" /> Key Strengths
                            </h4>
                            <ul className="space-y-2">
                                {candidate.matchStrengths?.map((strength, i) => (
                                    <li key={i} className="text-sm text-gray-700 bg-emerald-50/50 p-2 rounded-lg border border-emerald-100/50 flex items-start gap-2">
                                        <span className="text-emerald-500 mt-0.5">•</span>
                                        {strength}
                                    </li>
                                )) || <li className="text-sm text-gray-500 italic">No specific strengths listed.</li>}
                            </ul>
                        </div>

                        <div className="space-y-3">
                            <h4 className="text-sm font-bold text-orange-700 uppercase tracking-wide flex items-center gap-2">
                                <XCircle className="w-4 h-4" /> Gaps to Probe
                            </h4>
                            <ul className="space-y-2">
                                {candidate.matchGaps?.map((gap, i) => (
                                    <li key={i} className="text-sm text-gray-700 bg-orange-50/50 p-2 rounded-lg border border-orange-100/50 flex items-start gap-2">
                                        <span className="text-orange-500 mt-0.5">•</span>
                                        {gap}
                                    </li>
                                )) || <li className="text-sm text-gray-500 italic">No specific gaps identified.</li>}
                            </ul>
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <Button onClick={() => setIsMatchModalOpen(false)}>Close Analysis</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
