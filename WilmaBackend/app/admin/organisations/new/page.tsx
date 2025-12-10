"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useOrganisation } from "../../context/OrganisationContext";

type AnalysisResult = {
    summary: string;
    roles: string;
    values: string;
    norms: string;
    culture: string;
};

const NewOrganisationPage = () => {
    const router = useRouter();
    const { refreshOrganisations } = useOrganisation();

    const [step, setStep] = useState<"input" | "analyzing" | "review" | "creating">("input");
    const [formData, setFormData] = useState({
        name: "",
        rootUrl: "",
    });
    const [analysis, setAnalysis] = useState<AnalysisResult>({
        summary: "",
        roles: "",
        values: "",
        norms: "",
        culture: "",
    });
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.rootUrl) {
            setError("Please fill in all fields");
            return;
        }

        setStep("analyzing");
        setError(null);

        try {
            const res = await fetch("/api/organisations/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: formData.rootUrl }),
            });

            if (!res.ok) {
                throw new Error("Failed to analyze website");
            }

            const data = await res.json();
            setAnalysis(data);
            setStep("review");
        } catch (err) {
            console.error(err);
            setError("Failed to analyze the website. Please check the URL and try again.");
            setStep("input");
        }
    };

    const handleCreate = async () => {
        setStep("creating");
        setError(null);

        try {
            const res = await fetch("/api/organisations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    initialKnowledge: analysis,
                }),
            });

            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg || "Failed to create organisation");
            }

            // Refresh context and redirect
            await refreshOrganisations();
            router.push("/admin");
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Something went wrong.");
            setStep("review");
        }
    };

    return (
        <div className="mx-auto max-w-3xl space-y-8 pb-20">
            <div className="page-heading">
                <div className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-primary-soft)] px-3 py-1 text-xs font-medium text-[var(--brand-primary)]">
                    New Organisation
                </div>
                <h1>Add a new organisation</h1>
                <p>
                    We'll analyze the company website to extract key details about their culture, values, and roles.
                </p>
            </div>

            <div className="panel p-8">
                {step === "input" || step === "analyzing" ? (
                    <form onSubmit={handleAnalyze} className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-semibold text-slate-700">Organisation Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full rounded-xl border border-[var(--surface-subtle)] bg-white px-4 py-3 text-sm text-[var(--foreground)] placeholder-slate-400 focus:border-[var(--brand-primary)] focus:outline-none"
                                    placeholder="e.g. Acme Corp"
                                    disabled={step === "analyzing"}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-semibold text-slate-700">Website URL</label>
                                <input
                                    type="url"
                                    required
                                    value={formData.rootUrl}
                                    onChange={(e) => setFormData({ ...formData, rootUrl: e.target.value })}
                                    className="w-full rounded-xl border border-[var(--surface-subtle)] bg-white px-4 py-3 text-sm text-[var(--foreground)] placeholder-slate-400 focus:border-[var(--brand-primary)] focus:outline-none"
                                    placeholder="e.g. https://acmecorp.com"
                                    disabled={step === "analyzing"}
                                />
                            </div>
                        </div>

                        {error && <div className="text-sm text-red-500">{error}</div>}

                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900"
                                disabled={step === "analyzing"}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={step === "analyzing"}
                                className="flex items-center gap-2 rounded-lg bg-[var(--brand-primary)] px-6 py-2 text-sm font-medium text-white hover:bg-[var(--brand-primary-dark)] disabled:opacity-50"
                            >
                                {step === "analyzing" ? (
                                    <>
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        Analyzing Website...
                                    </>
                                ) : (
                                    <>
                                        <span>Analyze Website</span>
                                        <span>✨</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-8">
                        <div className="border-b border-slate-100 pb-4">
                            <h3 className="text-lg font-semibold text-[var(--foreground)]">Review AI Insights</h3>
                            <p className="text-sm text-slate-500">
                                We extracted this information from {formData.rootUrl}. You can edit it before saving.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="mb-1 block text-sm font-semibold text-slate-700">Company Summary</label>
                                <textarea
                                    rows={4}
                                    value={analysis.summary}
                                    onChange={(e) => setAnalysis({ ...analysis, summary: e.target.value })}
                                    className="w-full rounded-xl border border-[var(--surface-subtle)] bg-white px-4 py-3 text-sm text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none"
                                />
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div>
                                    <label className="mb-1 block text-sm font-semibold text-slate-700">Target Roles</label>
                                    <textarea
                                        rows={4}
                                        value={analysis.roles}
                                        onChange={(e) => setAnalysis({ ...analysis, roles: e.target.value })}
                                        className="w-full rounded-xl border border-[var(--surface-subtle)] bg-white px-4 py-3 text-sm text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-semibold text-slate-700">Core Values</label>
                                    <textarea
                                        rows={4}
                                        value={analysis.values}
                                        onChange={(e) => setAnalysis({ ...analysis, values: e.target.value })}
                                        className="w-full rounded-xl border border-[var(--surface-subtle)] bg-white px-4 py-3 text-sm text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-semibold text-slate-700">Norms</label>
                                    <textarea
                                        rows={4}
                                        value={analysis.norms}
                                        onChange={(e) => setAnalysis({ ...analysis, norms: e.target.value })}
                                        className="w-full rounded-xl border border-[var(--surface-subtle)] bg-white px-4 py-3 text-sm text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-semibold text-slate-700">Culture</label>
                                    <textarea
                                        rows={4}
                                        value={analysis.culture}
                                        onChange={(e) => setAnalysis({ ...analysis, culture: e.target.value })}
                                        className="w-full rounded-xl border border-[var(--surface-subtle)] bg-white px-4 py-3 text-sm text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {error && <div className="text-sm text-red-500">{error}</div>}

                        <div className="flex justify-end gap-3 border-t border-slate-100 pt-6">
                            <button
                                type="button"
                                onClick={() => setStep("input")}
                                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900"
                                disabled={step === "creating"}
                            >
                                Back to details
                            </button>
                            <button
                                onClick={handleCreate}
                                disabled={step === "creating"}
                                className="flex items-center gap-2 rounded-lg bg-[var(--brand-primary)] px-6 py-2 text-sm font-medium text-white hover:bg-[var(--brand-primary-dark)] disabled:opacity-50"
                            >
                                {step === "creating" ? "Creating..." : "Create Organisation"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NewOrganisationPage;
