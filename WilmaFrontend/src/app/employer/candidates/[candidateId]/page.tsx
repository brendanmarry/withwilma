"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, Linkedin, Calendar, PlayCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Section from "@/components/ui/Section";
import { getCandidate } from "@/lib/api";
import { Candidate } from "@/lib/types";

export default function CandidatePage(props: { params: Promise<{ candidateId: string }> }) {
    const params = React.use(props.params);
    const router = useRouter();
    const [candidate, setCandidate] = useState<Candidate | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadCandidate() {
            try {
                const data = await getCandidate(params.candidateId);
                setCandidate(data);
            } catch (err) {
                console.error("Failed to load candidate", err);
                setError("Failed to load candidate details.");
            } finally {
                setLoading(false);
            }
        }
        loadCandidate();
    }, [params.candidateId]);

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
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <Section padding="none" className="py-4">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-gray-500 hover:text-gray-900">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">{candidate.name}</h1>
                            <p className="text-sm text-gray-500">
                                Applied for <span className="font-medium text-purple-600">{(candidate as any).job?.title || "Unknown Role"}</span>
                            </p>
                        </div>
                    </div>
                </Section>
            </header>

            <Section padding="lg" className="mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sidebar / Profile Info */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                            <div className="flex flex-col items-center text-center">
                                <div className="h-24 w-24 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-3xl font-bold mb-4">
                                    {candidate.name.charAt(0)}
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">{candidate.name}</h2>
                                <div className="mt-2 flex items-center gap-2">
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
                                        {candidate.matchScore ? `${candidate.matchScore}% Match` : "Pending Score"}
                                    </span>
                                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600 capitalize">
                                        {candidate.status || "New"}
                                    </span>
                                </div>
                            </div>

                            <hr className="my-6 border-gray-100" />

                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <Mail className="w-4 h-4 text-gray-400" />
                                    <a href={`mailto:${candidate.email}`} className="hover:text-purple-600 hover:underline">
                                        {candidate.email}
                                    </a>
                                </div>
                                {candidate.linkedin && (
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <Linkedin className="w-4 h-4 text-gray-400" />
                                        <a href={candidate.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-purple-600 hover:underline">
                                            LinkedIn Profile
                                        </a>
                                    </div>
                                )}
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    <span>Applied {new Date(candidate.createdAt || "").toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Summary Card */}
                        {candidate.summary && (
                            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                                <h3 className="font-semibold text-gray-900 mb-3">AI Summary</h3>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    {candidate.summary}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Main Content / Videos */}
                    <div className="lg:col-span-2 space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <PlayCircle className="w-5 h-5 text-purple-600" />
                            Video Responses
                        </h3>

                        {!candidate.videos || candidate.videos.length === 0 ? (
                            <div className="bg-white rounded-xl border border-dashed border-gray-200 p-12 text-center">
                                <p className="text-gray-500">No video responses submitted yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6">
                                {candidate.videos.map((video, index) => (
                                    <div key={video.id || index} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                                        <div className="p-4 border-b border-gray-100 bg-gray-50">
                                            <h4 className="font-medium text-gray-900">
                                                {video.followupQuestion?.question || `Question ${index + 1}`}
                                            </h4>
                                        </div>
                                        <div className="aspect-video bg-black relative">
                                            <video
                                                src={video.videoUrl}
                                                controls
                                                className="w-full h-full object-contain"
                                                preload="metadata"
                                            />
                                        </div>
                                        {video.transcript && (
                                            <div className="p-4">
                                                <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Transcript</h5>
                                                <p className="text-sm text-gray-600 italic">
                                                    "{video.transcript}"
                                                </p>
                                            </div>
                                        )}
                                        {video.analysis && (
                                            <div className="p-4 border-t border-gray-100 bg-emerald-50/50">
                                                <h5 className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-2">AI Analysis</h5>
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
                </div>
            </Section>
        </div>
    );
}
