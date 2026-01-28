"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { createJob } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ArrowLeft, Upload, Link as LinkIcon, FileText } from "lucide-react";
import Link from 'next/link';
import Section from "@/components/ui/Section";
import { JobSourceCard } from "../../home/JobSourceCard";

export default function AddJobPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Manual Form State
    const [title, setTitle] = useState("");
    const [location, setLocation] = useState("");
    const [description, setDescription] = useState("");

    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            await createJob({
                title,
                location,
                description,
                autoNormalise: true // Enable LLM cleaning by default
            });
            router.push("/employer/jobs"); // Redirect to jobs list
        } catch (err) {
            console.error(err);
            setError("Failed to create job. Please try again.");
            setIsLoading(false);
        }
    };

    if (loading) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            <Section padding="lg">
                <div className="mb-8">
                    <Button variant="ghost" asChild className="mb-4 pl-0 hover:bg-transparent hover:text-purple-600">
                        <Link href="/employer/jobs" className="flex items-center gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Jobs
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold text-gray-900">Add New Job</h1>
                    <p className="text-gray-600">Import a role from your site or upload a description manually.</p>
                </div>

                <div className="max-w-3xl">
                    <Tabs defaultValue="manual" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-8">
                            <TabsTrigger value="manual" className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Paste Description
                            </TabsTrigger>
                            <TabsTrigger value="import" className="flex items-center gap-2">
                                <LinkIcon className="h-4 w-4" />
                                Import from URL
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="manual">
                            <Card>
                                <CardContent className="pt-6">
                                    <form onSubmit={handleManualSubmit} className="space-y-6">
                                        {error && (
                                            <Alert variant="destructive">
                                                <AlertDescription>{error}</AlertDescription>
                                            </Alert>
                                        )}

                                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="title">Job Title</Label>
                                                <Input
                                                    id="title"
                                                    placeholder="e.g. Senior Product Manager"
                                                    value={title}
                                                    onChange={(e) => setTitle(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="location">Location</Label>
                                                <Input
                                                    id="location"
                                                    placeholder="e.g. Remote, London, etc."
                                                    value={location}
                                                    onChange={(e) => setLocation(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="description">Job Description</Label>
                                            <Textarea
                                                id="description"
                                                placeholder="Paste the full job description here (responsibilities, requirements, etc.). Wilma will automatically format it."
                                                className="min-h-[300px] font-mono text-sm"
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                required
                                            />
                                            <p className="text-xs text-gray-500">
                                                Tip: You can paste messy text. Our AI will clean it up for you.
                                            </p>
                                        </div>

                                        <div className="flex justify-end">
                                            <Button type="submit" className="bg-purple-600 hover:bg-purple-700 min-w-[150px]" disabled={isLoading}>
                                                {isLoading ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Processing...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Upload className="mr-2 h-4 w-4" />
                                                        Create Job
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="import">
                            <div className="space-y-4">
                                <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-sm mb-4">
                                    Use this to scrape multiple roles at once from your careers page.
                                </div>
                                <JobSourceCard />
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </Section>
        </div>
    );
}
