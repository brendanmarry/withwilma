"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save } from "lucide-react";
import Link from "next/link";

export default function AccountSettingsPage() {
    const { user, login } = useAuth(); // We might need a way to refresh user/org data
    const [isLoading, setIsLoading] = useState(false);

    // Form state
    const [name, setName] = useState("");
    const [rootUrl, setRootUrl] = useState("");
    const [careersPageUrl, setCareersPageUrl] = useState("");

    // Load initial data
    useEffect(() => {
        if (user?.organisation) {
            setName(user.organisation.name || "");
            setRootUrl(user.organisation.rootUrl || "");
            // Types might not be updated yet on frontend for careersPageUrl, we might need to cast or update types
            setCareersPageUrl((user.organisation as any).careersPageUrl || "");
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.organisationId) return;

        setIsLoading(true);

        try {
            const res = await fetch("/api/organisations", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: user.organisationId,
                    name,
                    rootUrl,
                    careersPageUrl,
                }),
            });

            if (!res.ok) {
                const error = await res.text();
                throw new Error(error || "Failed to update organisation");
            }

            const updatedOrg = await res.json();

            // We should ideally update the local user context here. 
            // Since useAuth doesn't expose a 'refresh' method, we might just assume it's updated or reload
            // But realistically, user context is loaded on mount. 
            // For now, simple toast.

            alert("Settings saved successfully");

            // Force reload to update context if needed (crude but effective for prototype)
            window.location.reload();

        } catch (error) {
            console.error(error);
            alert("Failed to save settings");
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <main className="container mx-auto max-w-2xl pt-10 px-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
                    <p className="text-gray-500 mt-2">Manage your organisation details and external links.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Organisation Details</CardTitle>
                        <CardDescription>
                            Update your company information.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Company Name</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Acme Corp"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="rootUrl">Website URL</Label>
                                <Input
                                    id="rootUrl"
                                    value={rootUrl}
                                    onChange={(e) => setRootUrl(e.target.value)}
                                    placeholder="https://acme.com"
                                    required
                                />
                                <p className="text-xs text-gray-500">
                                    The main website of your company.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="careersPageUrl">Current Careers Page URL (Optional)</Label>
                                <Input
                                    id="careersPageUrl"
                                    value={careersPageUrl}
                                    onChange={(e) => setCareersPageUrl(e.target.value)}
                                    placeholder="https://acme.com/careers"
                                />
                                <p className="text-xs text-gray-500">
                                    If provided, we can use this to crawl existing jobs or verify replacement.
                                </p>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <Button type="submit" disabled={isLoading} className="bg-purple-600 hover:bg-purple-700">
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
