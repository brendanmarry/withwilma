"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Globe, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import Link from "next/link";

export function JobSourceCard() {
    const { user } = useAuth();
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

    // In a real implementation, we would fetch the existing source URL
    // useEffect(() => { ... }, []);

    const handleImport = async () => {
        setLoading(true);
        setStatus("idle");
        try {
            // Call API to source jobs
            // await api.sourceJobs(url);
            await new Promise(resolve => setTimeout(resolve, 1500)); // Mock
            setStatus("success");
        } catch (e) {
            setStatus("error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100 text-blue-900">
            <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    <div className="space-y-1">
                        <h3 className="font-semibold flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            Import Jobs from Website
                        </h3>
                        <p className="text-sm text-blue-700/80">
                            Auto-sync your open roles from your careers page.
                        </p>
                    </div>

                    <div className="flex w-full md:w-auto items-center gap-2">
                        <Input
                            placeholder="https://company.com/careers"
                            className="bg-white/80 border-blue-200 min-w-[250px]"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                        />
                        <Button onClick={handleImport} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Import"}
                        </Button>
                    </div>
                </div>
                {status === "success" && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-green-700 font-medium">
                        <CheckCircle2 className="h-4 w-4" />
                        Import started! We'll notify you when roles are ready.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
