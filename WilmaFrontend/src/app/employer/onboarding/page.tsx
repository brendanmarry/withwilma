"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { getOrganisationProfile, getOrganisationKnowledge, ingestWebsite } from "@/lib/api";
import { OrganisationProfile, DocumentSummary, Organisation } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Section from "@/components/ui/Section";
import { Button } from "@/components/ui/button";
import { Loader2, Globe, FileText, History, Users, Briefcase, Sparkles, CheckCircle2, AlertCircle, PlayCircle, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CultureChat from "@/components/CultureChat";
import { MessageSquarePlus } from "lucide-react";
import { LogoUpload } from "@/components/employer/LogoUpload";
import { Input } from "@/components/ui/input";
import { updateOrganisation } from "@/lib/api";

export default function OnboardingPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [profile, setProfile] = useState<OrganisationProfile | null>(null);
    const [knowledge, setKnowledge] = useState<{ organisation: Organisation; faqs: any[]; documents: DocumentSummary[] } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        if (!user?.organisationId) return;
        try {
            setIsLoading(true);
            const [profileRes, knowledgeRes] = await Promise.all([
                getOrganisationProfile(user.organisationId),
                getOrganisationKnowledge(user.organisationId)
            ]);

            if (profileRes) setProfile(profileRes.profile);
            if (knowledgeRes) setKnowledge(knowledgeRes);
        } catch (err) {
            console.error("Failed to load company data", err);
            setError("Failed to load company intelligence. Please ensure you've added sources.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    const handleAnalyzeWebsite = async () => {
        if (!user?.organisation?.rootUrl) return;

        setIsAnalyzing(true);
        try {
            await ingestWebsite(user.organisation.rootUrl);
            await new Promise(resolve => setTimeout(resolve, 2000)); // Slight delay to allow backend to queue
            await fetchData(); // Refresh data
            alert("Website analysis started! Wilma is reading your site to build your profile.");
        } catch (err) {
            console.error(err);
            alert("Failed to start analysis. Please try again.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    if (authLoading || (isLoading && !profile)) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-purple-600 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">Assembled company intelligence...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <p>Please log in to access this page.</p>
                <Button asChild>
                    <Link href="/employer/login">Log In</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-12 relative">
            {/* Chat Modal Overlay */}
            {isChatOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <CultureChat
                        organisationId={user?.organisationId || ""}
                        organisationName={user?.organisation?.name || "Organisation"}
                        currentProfile={profile}
                        onClose={() => setIsChatOpen(false)}
                    />
                </div>
            )}

            <Section padding="lg">
                {/* Header Section */}
                <div className="mb-10 overflow-hidden">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                <Sparkles className="w-3 h-3" />
                                Company Intelligence
                            </div>
                            <div>
                                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                                    {user.organisation?.name || "Your Company"}
                                </h1>
                                <div className="flex items-center gap-3 mt-2 text-gray-500">
                                    <Globe className="w-4 h-4" />
                                    <a href={user.organisation?.rootUrl} target="_blank" rel="noopener noreferrer" className="hover:text-purple-600 transition-colors">
                                        {user.organisation?.rootUrl}
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="bg-white hover:bg-purple-50 hover:text-purple-700 border-purple-200 text-purple-700"
                                onClick={() => setIsChatOpen(true)}
                            >
                                <MessageSquarePlus className="w-4 h-4 mr-2" />
                                Refine Culture DNA
                            </Button>
                            <Button variant="outline" asChild>
                                <Link href="/employer/settings/account">Manage Organisation</Link>
                            </Button>
                            <Button className="bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-200" asChild>
                                <Link href="/employer/jobs/new">Add Knowledge Source</Link>
                            </Button>
                        </div>
                    </div>

                    <div className="mt-8 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-purple-600" />
                            Branding & Settings
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <LogoUpload
                                    currentLogoUrl={user.organisation?.branding?.logoUrl}
                                    onLogoChange={async (url) => {
                                        if (user.organisationId) {
                                            await updateOrganisation(user.organisationId, {
                                                branding: {
                                                    ...user.organisation?.branding,
                                                    logoUrl: url
                                                }
                                            });
                                            // Refresh data logic could go here or just optimistically update
                                            window.location.reload();
                                        }
                                    }}
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="text-base font-semibold block">Candidate Site Subdomain</label>
                                <div className="flex gap-2 items-center">
                                    <span className="text-gray-500 font-medium">http://</span>
                                    <Input
                                        defaultValue={user.organisation?.slug}
                                        placeholder="your-company"
                                        className="font-mono"
                                        onBlur={async (e) => {
                                            const newSlug = e.target.value;
                                            if (newSlug && newSlug !== user.organisation?.slug && user.organisationId) {
                                                try {
                                                    await updateOrganisation(user.organisationId, { slug: newSlug });
                                                    alert("Subdomain updated! Please allow a moment for changes to propagate.");
                                                    window.location.reload();
                                                } catch (err) {
                                                    console.error(err);
                                                    alert("Failed to update subdomain. It might be taken.");
                                                }
                                            }
                                        }}
                                    />
                                    <span className="text-gray-500 font-medium">.localhost:3000</span>
                                </div>
                                <p className="text-xs text-gray-500">
                                    This is the address where candidates will view your branded careers page.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: AI Summary */}
                    <div className="lg:col-span-2 space-y-8">
                        {profile ? (
                            <>
                                <Card className="border-none shadow-sm ring-1 ring-gray-200">
                                    <CardHeader className="border-b bg-gray-50/50 rounded-t-xl">
                                        <CardTitle className="text-xl flex items-center gap-2">
                                            <Sparkles className="w-5 h-5 text-purple-600" />
                                            AI Overview
                                        </CardTitle>
                                        <CardDescription>Wilma's understanding of your organisation based on synced sources.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        <p className="text-gray-700 leading-relaxed text-lg italic">
                                            "{profile.overview}"
                                        </p>
                                    </CardContent>
                                </Card>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Card className="border-none shadow-sm ring-1 ring-gray-200">
                                        <CardHeader>
                                            <CardTitle className="text-sm font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                                <Briefcase className="w-4 h-4" />
                                                Products & Services
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <ul className="space-y-3">
                                                {profile.productsAndServices.map((item, i) => (
                                                    <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                                                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-none shadow-sm ring-1 ring-gray-200">
                                        <CardHeader>
                                            <CardTitle className="text-sm font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                                <History className="w-4 h-4" />
                                                History Highlights
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <ul className="space-y-3">
                                                {profile.historyHighlights.map((item, i) => (
                                                    <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                                                        <CheckCircle2 className="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-none shadow-sm ring-1 ring-gray-200">
                                        <CardHeader>
                                            <CardTitle className="text-sm font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                                <Users className="w-4 h-4" />
                                                Leadership Team
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <ul className="space-y-3">
                                                {profile.leadershipTeam.map((item, i) => (
                                                    <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                                                        <div className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center text-[10px] font-bold text-purple-700 shrink-0">
                                                            {item.charAt(0)}
                                                        </div>
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-none shadow-sm ring-1 ring-gray-200">
                                        <CardHeader>
                                            <CardTitle className="text-sm font-bold uppercase tracking-widest text-gray-400">Funding & Ownership</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div>
                                                <p className="text-xs text-gray-400 font-bold uppercase tracking-tighter">Status</p>
                                                <p className="text-sm text-gray-700 font-medium">{profile.fundingStatus}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400 font-bold uppercase tracking-tighter">Ownership</p>
                                                <p className="text-sm text-gray-700 font-medium">{profile.ownershipStructure}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </>
                        ) : (
                            <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-200">
                                <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-gray-900">No Intelligence Profile Yet</h3>
                                <p className="text-gray-500 max-w-sm mx-auto mt-2">
                                    We need more data to build your company profile. Add your careers page or upload company documents to train Wilma.
                                </p>
                                <Button className="mt-6 bg-purple-600" asChild>
                                    <Link href="/employer/jobs">Add Sources</Link>
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Knowledge Base Sidebar */}
                    <div className="space-y-6">
                        <Card className="border-none shadow-sm ring-1 ring-gray-200 bg-black text-white">
                            <CardHeader>
                                <CardTitle className="text-lg">Knowledge Base Stats</CardTitle>
                                <CardDescription className="text-gray-400">Synced across {profile?.sourceCount || 0} primary sources.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                                            <FileText className="w-5 h-5 text-purple-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">{knowledge?.organisation.counts.documents || 0}</p>
                                            <p className="text-[10px] uppercase text-gray-400 font-bold">Docs</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                                            <Sparkles className="w-5 h-5 text-purple-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">{knowledge?.organisation.counts.faqs || 0}</p>
                                            <p className="text-[10px] uppercase text-gray-400 font-bold">FAQs</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                                            <Briefcase className="w-5 h-5 text-purple-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">{knowledge?.organisation.counts.jobs || 0}</p>
                                            <p className="text-[10px] uppercase text-gray-400 font-bold">Jobs</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="space-y-4">
                            <Card className="border-none shadow-sm ring-1 ring-gray-200 bg-purple-50">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-bold uppercase tracking-widest text-purple-900 flex items-center gap-2">
                                        <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
                                        Update Intelligence
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-xs text-purple-700 mb-4">
                                        Has your website changed? Re-analyze your site to keep Wilma's knowledge up to date.
                                    </p>
                                    <Button
                                        className="w-full bg-purple-600 hover:bg-purple-700"
                                        size="sm"
                                        onClick={handleAnalyzeWebsite}
                                        disabled={isAnalyzing}
                                    >
                                        {isAnalyzing ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Analyzing...
                                            </>
                                        ) : (
                                            <>
                                                <PlayCircle className="mr-2 h-4 w-4" />
                                                Analyze Website
                                            </>
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>

                            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Recent Documents</h3>
                            {knowledge?.documents && knowledge.documents.length > 0 ? (
                                <div className="space-y-3">
                                    {knowledge.documents.slice(0, 5).map((doc) => (
                                        <div key={doc.id} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 shadow-sm transition-all hover:border-purple-200">
                                            <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                                                <FileText className="w-4 h-4" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-gray-900 truncate">
                                                    {doc.metadata?.originalName || doc.sourceUrl?.split('/').pop() || "Synced document"}
                                                </p>
                                                <p className="text-[10px] text-gray-400">
                                                    {new Date(doc.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    <Button variant="ghost" className="w-full text-xs text-purple-600 hover:bg-purple-50" asChild>
                                        <Link href="/employer/jobs">View All Knowledge</Link>
                                    </Button>
                                </div>
                            ) : (
                                <p className="text-xs text-gray-400 italic">No documents synced yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </Section>
        </div>
    );
}
