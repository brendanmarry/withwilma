"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles, ChevronLeft, Globe, Palette } from "lucide-react";
import Link from "next/link";
import Section from "@/components/ui/Section";
import { LogoUpload } from "@/components/employer/LogoUpload";
import { updateOrganisation } from "@/lib/api";

export default function BrandingSettingsPage() {
    const { user, loading: authLoading } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

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
                <p>Please log in to access branding settings.</p>
                <Button asChild>
                    <Link href="/employer/login">Log In</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Section padding="lg">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <Button asChild variant="ghost" className="mb-4 -ml-2 text-gray-500 hover:text-purple-600">
                            <Link href="/employer/home">
                                <ChevronLeft className="mr-2 h-4 w-4" />
                                Back Home
                            </Link>
                        </Button>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Candidate Experience Branding</h1>
                        <p className="text-gray-600 mt-2">Customize how your career site looks to candidates.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Visual Branding Card */}
                    <Card className="shadow-sm border-purple-100 overflow-hidden">
                        <CardHeader className="bg-purple-50/50 border-b border-purple-100">
                            <CardTitle className="flex items-center gap-2 text-gray-900">
                                <Palette className="w-5 h-5 text-purple-600" />
                                Visual Identity
                            </CardTitle>
                            <CardDescription>Logo and brand colors for your career portal.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-8 space-y-8">
                            <LogoUpload
                                currentLogoUrl={user.organisation?.branding?.logoUrl}
                                onLogoChange={async (url) => {
                                    if (user.organisationId) {
                                        setIsLoading(true);
                                        try {
                                            await updateOrganisation(user.organisationId, {
                                                branding: {
                                                    ...user.organisation?.branding,
                                                    logoUrl: url
                                                }
                                            });
                                            window.location.reload();
                                        } catch (err) {
                                            console.error(err);
                                            alert("Failed to update logo");
                                        } finally {
                                            setIsLoading(false);
                                        }
                                    }
                                }}
                            />

                            <div className="space-y-4 pt-4 border-t border-gray-100">
                                <div className="flex items-center justify-between">
                                    <Label className="text-base font-semibold">Primary Brand Color</Label>
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-8 h-8 rounded-full border border-gray-200"
                                            style={{ backgroundColor: user.organisation?.branding?.primaryColor || "#616E24" }}
                                        />
                                        <Input
                                            type="color"
                                            className="w-12 h-10 p-1 cursor-pointer border-none bg-transparent"
                                            defaultValue={user.organisation?.branding?.primaryColor || "#616E24"}
                                            onBlur={async (e) => {
                                                const newColor = e.target.value;
                                                if (newColor && user.organisationId) {
                                                    try {
                                                        await updateOrganisation(user.organisationId, {
                                                            branding: {
                                                                ...user.organisation?.branding,
                                                                primaryColor: newColor
                                                            }
                                                        });
                                                        window.location.reload();
                                                    } catch (err) {
                                                        console.error(err);
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 italic">
                                    This color will be used for buttons, links, and highlights on your candidate site.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Site Configuration Card */}
                    <Card className="shadow-sm border-purple-100 overflow-hidden">
                        <CardHeader className="bg-purple-50/50 border-b border-purple-100">
                            <CardTitle className="flex items-center gap-2 text-gray-900">
                                <Globe className="w-5 h-5 text-purple-600" />
                                Candidate Portal Access
                            </CardTitle>
                            <CardDescription>Domain and access settings for your vacancy portal.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-8 space-y-8">
                            <div className="space-y-4">
                                <Label className="text-base font-semibold block">Site Subdomain</Label>
                                <div className="flex gap-2 items-center">
                                    <span className="text-gray-400 font-mono text-sm">https://</span>
                                    <Input
                                        defaultValue={user.organisation?.slug}
                                        placeholder="your-company"
                                        className="font-mono text-sm bg-gray-50"
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
                                    <span className="text-gray-400 font-mono text-sm">.withwilma.com</span>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-xs text-gray-600">
                                        Candidates will access your portal at:
                                    </p>
                                    <p className="text-sm font-mono font-semibold text-purple-700 mt-1 break-all">
                                        https://{user.organisation?.slug || "your-company"}.withwilma.com
                                    </p>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100">
                                <Button asChild variant="outline" className="w-full">
                                    <a
                                        href={`http://${user.organisation?.slug}.localhost:3000`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center"
                                    >
                                        <Sparkles className="w-4 h-4 mr-2 text-purple-500" />
                                        Preview Candidate Site
                                    </a>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </Section>
        </div>
    );
}
