"use client";

import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/card";
import { Loader2, Globe, CheckCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/app/components/ui/alert";

export function JobSourceCard() {
    // Removed useAuth hook as we don't need user info for this specific action
    const [url, setUrl] = useState("https://babus.ch/pages/career-opportunities");
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const handleIngest = async () => {
        if (!url) return;
        setIsLoading(true);
        setStatus("idle");
        setMessage("");

        try {
            // Infer root URL from the input URL
            const urlObj = new URL(url);
            const rootUrl = `${urlObj.protocol}//${urlObj.hostname}`;

            // Calling Backend API directly
            const res = await fetch("/api/jobs/fetch", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    rootUrl,
                    careersUrl: url,
                    label: "Recruiter Import"
                })
            });

            if (!res.ok) {
                throw new Error("Failed to fetch jobs");
            }

            const data = await res.json();
            setStatus("success");
            setMessage(`Successfully imported ${data.jobs?.length || 0} jobs.`);
        } catch (error) {
            console.error(error);
            setStatus("error");
            setMessage("Failed to import jobs. Please check the URL and try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="border-purple-100 shadow-sm">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Globe className="h-5 w-5 text-purple-600" />
                    Connect Job Source
                </CardTitle>
                <CardDescription>
                    Import open roles directly from your careers page.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex gap-3">
                    <Input
                        placeholder="https://company.com/careers"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        disabled={isLoading}
                    />
                    <Button
                        onClick={handleIngest}
                        disabled={isLoading || !url}
                        className="bg-purple-600 hover:bg-purple-700 text-white min-w-[100px]"
                    >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Import"}
                    </Button>
                </div>

                {status === "success" && (
                    <Alert className="mt-4 bg-green-50 border-green-200 text-green-800">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertTitle>Success</AlertTitle>
                        <AlertDescription>{message}</AlertDescription>
                    </Alert>
                )}

                {status === "error" && (
                    <Alert variant="destructive" className="mt-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{message}</AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </Card>
    );
}
