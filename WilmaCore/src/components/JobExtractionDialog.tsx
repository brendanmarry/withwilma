
import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Globe, Search } from "lucide-react";
import { extractJobs } from "@/lib/api";
import { useRouter } from "next/navigation";

interface JobExtractionDialogProps {
    isOpen: boolean;
    onClose: () => void;
    rootUrl?: string; // Pre-filled from organisation
    onJobsExtracted: () => void;
}

export function JobExtractionDialog({
    isOpen,
    onClose,
    onJobsExtracted,
}: JobExtractionDialogProps) {
    const [jobUrl, setJobUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successCount, setSuccessCount] = useState<number | null>(null);

    const handleExtract = async () => {
        if (!jobUrl) {
            setError("Please provide a Job Posting URL.");
            return;
        }

        let effectiveRoot = "";
        try {
            effectiveRoot = new URL(jobUrl).origin;
        } catch {
            setError("Invalid URL format.");
            return;
        }

        setLoading(true);
        setError(null);
        setSuccessCount(null);

        try {
            // we pass the jobUrl as 'careersUrl' (the specific target) 
            // and the origin as 'rootUrl' (context). 
            // The backend is now configured to strictly scrape the target.
            const result = await extractJobs(effectiveRoot, jobUrl);
            setSuccessCount(result.jobs.length);
            onJobsExtracted();
            setTimeout(() => {
                onClose();
                setSuccessCount(null);
                setJobUrl("");
            }, 2000);
        } catch (err) {
            console.error(err);
            setError("Failed to extract job. Please check the URL and try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={!loading ? onClose : () => { }}
            title="Extract Job from URL"
            className="max-w-md"
        >
            <div className="space-y-4">
                <p className="text-sm text-gray-500">
                    Paste the link to a specific job posting. Wilma will extract the details and create a new role.
                </p>

                <div className="space-y-2">
                    <Label htmlFor="jobUrl">Job Posting URL</Label>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                            id="jobUrl"
                            placeholder="https://example.com/jobs/engineer"
                            value={jobUrl}
                            onChange={(e) => setJobUrl(e.target.value)}
                            className="pl-9"
                            disabled={loading}
                        />
                    </div>
                </div>

                {error && (
                    <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                        {error}
                    </div>
                )}

                {successCount !== null && (
                    <div className="text-sm text-green-600 bg-green-50 p-2 rounded text-center font-medium">
                        Successfully found {successCount} job(s)!
                    </div>
                )}

                <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleExtract} disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white">
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Extraction in progress...
                            </>
                        ) : (
                            "Extract Job"
                        )}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
