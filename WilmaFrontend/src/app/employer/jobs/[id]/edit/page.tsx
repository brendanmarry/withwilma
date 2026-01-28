"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { getJob, updateJob } from "@/lib/api";
import { Job, NormalisedJob } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ArrowLeft, Save, Globe, Lock, Plus, Trash2 } from "lucide-react";
import Link from 'next/link';
import Section from "@/components/ui/Section";
import { Badge } from "@/components/ui/badge";

type Props = {
    params: Promise<{ id: string }>;
};

export default function EditJobPage({ params }: Props) {
    const { id } = use(params);
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [job, setJob] = useState<Job | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [title, setTitle] = useState("");
    const [location, setLocation] = useState("");
    const [department, setDepartment] = useState("");
    const [employmentType, setEmploymentType] = useState("");

    // Structured Data State
    const [summary, setSummary] = useState("");
    const [responsibilities, setResponsibilities] = useState<string[]>([]);
    const [requirements, setRequirements] = useState<string[]>([]);
    const [niceToHave, setNiceToHave] = useState<string[]>([]);

    // Legacy/Fallback Description State
    const [description, setDescription] = useState("");

    const [wilmaEnabled, setWilmaEnabled] = useState(true);
    const [applyUrl, setApplyUrl] = useState("");

    useEffect(() => {
        async function fetchJob() {
            try {
                const data = await getJob(id);
                setJob(data);
                setTitle(data.title);
                setLocation(data.location || "");
                setDepartment(data.department || "");
                setEmploymentType(data.employmentType || "");
                setDescription(data.description || "");
                setWilmaEnabled(data.wilmaEnabled);

                // Populate structured data if available
                if (data.normalizedJson) {
                    setSummary(data.normalizedJson.summary || "");
                    setResponsibilities(data.normalizedJson.responsibilities || []);
                    setRequirements(data.normalizedJson.requirements || []);
                    setNiceToHave(data.normalizedJson.nice_to_have || []);
                    setApplyUrl(data.normalizedJson.apply_url || "");
                }
            } catch (err) {
                console.error(err);
                setError("Failed to load job details.");
            } finally {
                setIsLoading(false);
            }
        }

        if (user) {
            fetchJob();
        }
    }, [id, user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);

        // Reconstruct normalizedJson or create a new description from parts?
        // We will update both to keep them in sync conceptually, but ideally backend handles this.
        // For now, we update normalizedJson directly.

        const updatedNormalized: Partial<NormalisedJob> = {
            ...(job?.normalizedJson || {}),
            summary,
            responsibilities,
            requirements,
            nice_to_have: niceToHave,
            title,           // Sync these back
            location,
            department,
            employment_type: employmentType,
            apply_url: applyUrl
        };

        try {
            await updateJob(id, {
                title,
                location,
                department,
                employmentType,
                description, // Keep the legacy description as is, or reconstruct it? Leaving as is for now to avoid data loss if user prefers raw edit.
                // Ideally, we might concatenate parts to form a new description if the user edited the structured parts.
                normalizedJson: updatedNormalized as any, // Cast if type mismatch in frontend types vs backend
                wilmaEnabled
            });
            alert("Job updated successfully");
            router.push("/employer/jobs");
        } catch (err) {
            console.error(err);
            setError("Failed to update job. Please try again.");
            setIsSaving(false);
        }
    };

    const handleSaveAndView = async (e: React.MouseEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);

        const updatedNormalized: Partial<NormalisedJob> = {
            ...(job?.normalizedJson || {}),
            summary,
            responsibilities,
            requirements,
            nice_to_have: niceToHave,
            title,
            location,
            department,
            employment_type: employmentType,
            apply_url: applyUrl
        };

        try {
            await updateJob(id, {
                title,
                location,
                department,
                employmentType,
                description,
                normalizedJson: updatedNormalized as any,
                wilmaEnabled
            });
            // Open in new tab
            window.open(`/apply/${id}`, '_blank');
        } catch (err) {
            console.error(err);
            setError("Failed to update job.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleArrayChange = (
        setter: React.Dispatch<React.SetStateAction<string[]>>,
        index: number,
        value: string
    ) => {
        setter(prev => {
            const copy = [...prev];
            copy[index] = value;
            return copy;
        });
    };

    const addArrayItem = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
        setter(prev => [...prev, ""]);
    };

    const removeArrayItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number) => {
        setter(prev => prev.filter((_, i) => i !== index));
    };

    if (authLoading || isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
        );
    }

    if (!user) return <div className="p-10 text-center">Please log in.</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Section padding="lg">
                <div className="mb-8 overflow-hidden">
                    <Button variant="ghost" asChild className="mb-4 pl-0 hover:bg-transparent hover:text-purple-600">
                        <Link href="/employer/jobs" className="flex items-center gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Jobs
                        </Link>
                    </Button>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Edit Role</h1>
                            <p className="text-gray-600">Update formatted job details.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="hidden sm:flex"
                                onClick={handleSaveAndView}
                                disabled={isSaving}
                            >
                                <Globe className="w-4 h-4 mr-2" />
                                {isSaving ? "Saving..." : "Save & View Live Page"}
                            </Button>
                            {wilmaEnabled ? (
                                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none px-3 py-1">
                                    <Globe className="w-3 h-3 mr-1" />
                                    Active
                                </Badge>
                            ) : (
                                <Badge className="bg-gray-100 text-gray-500 hover:bg-gray-100 border-none px-3 py-1">
                                    <Lock className="w-3 h-3 mr-1" />
                                    Inactive
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>

                <div className="max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Core Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Role Overview</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Job Title</Label>
                                        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="location">Location</Label>
                                        <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="department">Department</Label>
                                        <Input id="department" value={department} onChange={(e) => setDepartment(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="employmentType">Employment Type</Label>
                                        <Input id="employmentType" value={employmentType} onChange={(e) => setEmploymentType(e.target.value)} placeholder="e.g. Full-time" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="summary">Role Summary</Label>
                                    <Textarea
                                        id="summary"
                                        rows={4}
                                        value={summary}
                                        onChange={(e) => setSummary(e.target.value)}
                                        placeholder="Brief overview of the role..."
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Formatting Sections */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Responsibilities</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {responsibilities.map((item, i) => (
                                    <div key={i} className="flex gap-2">
                                        <div className="mt-2.5 h-1.5 w-1.5 rounded-full bg-purple-500 shrink-0" />
                                        <Textarea
                                            value={item}
                                            onChange={(e) => handleArrayChange(setResponsibilities, i, e.target.value)}
                                            className="min-h-[60px]"
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-gray-400 hover:text-red-500 mt-1"
                                            onClick={() => removeArrayItem(setResponsibilities, i)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                                <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem(setResponsibilities)} className="mt-2">
                                    <Plus className="w-4 h-4 mr-2" /> Add Responsibility
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Requirements</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {requirements.map((item, i) => (
                                    <div key={i} className="flex gap-2">
                                        <div className="mt-2.5 h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                                        <Textarea
                                            value={item}
                                            onChange={(e) => handleArrayChange(setRequirements, i, e.target.value)}
                                            className="min-h-[60px]"
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-gray-400 hover:text-red-500 mt-1"
                                            onClick={() => removeArrayItem(setRequirements, i)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                                <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem(setRequirements)} className="mt-2">
                                    <Plus className="w-4 h-4 mr-2" /> Add Requirement
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Nice to Have</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {niceToHave.map((item, i) => (
                                    <div key={i} className="flex gap-2">
                                        <div className="mt-2.5 h-1.5 w-1.5 rounded-full bg-green-500 shrink-0" />
                                        <Textarea
                                            value={item}
                                            onChange={(e) => handleArrayChange(setNiceToHave, i, e.target.value)}
                                            className="min-h-[60px]"
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-gray-400 hover:text-red-500 mt-1"
                                            onClick={() => removeArrayItem(setNiceToHave, i)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                                <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem(setNiceToHave)} className="mt-2">
                                    <Plus className="w-4 h-4 mr-2" /> Add Bonus Point
                                </Button>
                            </CardContent>
                        </Card>

                        <div className="flex justify-end pt-6">
                            <Button size="lg" className="bg-purple-600 hover:bg-purple-700 min-w-[200px]" onClick={handleSubmit} disabled={isSaving}>
                                {isSaving ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving Changes...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Save All Changes
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-gray-500">Visibility</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="applyUrl" className="text-sm font-medium">External Apply URL</Label>
                                    <Input
                                        id="applyUrl"
                                        value={applyUrl}
                                        onChange={(e) => setApplyUrl(e.target.value)}
                                        placeholder="https://... (Optional)"
                                        className="bg-white"
                                    />
                                    <p className="text-[10px] text-gray-500">
                                        If set, "Apply Now" will redirect here instead of the internal form.
                                    </p>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-lg border bg-white">
                                    <div className="space-y-0.5">
                                        <Label className="text-sm font-medium">Wilma Enabled</Label>
                                        <p className="text-xs text-gray-500">Show on career site.</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="h-5 w-5 rounded border-gray-300 text-purple-600 focus:ring-purple-600"
                                        checked={wilmaEnabled}
                                        onChange={(e) => setWilmaEnabled(e.target.checked)}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Optional: Show raw description for advanced edit or fallback */}
                        <Card className="border-gray-200">
                            <CardHeader>
                                <CardTitle className="text-sm font-semibold text-gray-500">Raw Description</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Textarea
                                    className="text-xs font-mono min-h-[150px]"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                                <p className="text-[10px] text-gray-400 mt-2">
                                    This is the fallback text. Editing structured fields above is recommended.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </Section>
        </div>
    );
}
