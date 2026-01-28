"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, Image as ImageIcon } from "lucide-react";

interface LogoUploadProps {
    currentLogoUrl?: string | null;
    onLogoChange: (url: string) => void;
}

export function LogoUpload({ currentLogoUrl, onLogoChange }: LogoUploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(currentLogoUrl || null);

    useEffect(() => {
        if (currentLogoUrl) {
            setPreview(currentLogoUrl);
        }
    }, [currentLogoUrl]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);

        // In a real app we would upload to S3/Cloud storage.
        // For now, we'll simulate an upload by creating a faux "uploaded" URL 
        // or assume the backend handles multipart form data on a specific endpoint.
        // Given the previous task involved just saving to public, we'll simulate success 
        // but warn the user or try to implement a mock upload if possible.

        // Mocking upload for the prototype:
        // We can't easily write to disk from browser without an API.
        // Let's implement a real API call if possible, or just mock it.
        // Since I don't have an upload API yet, I will create one or use a mock.

        // TEMPORARY: using a data URL for immediate preview persistence if small, 
        // or just assume success if we had an endpoint.
        // A better approach for this demo: use the existing logo fix logic (manual) 
        // or just pretend it uploaded for the UI.

        // Let's try to upload to a new API endpoint /api/upload we might need to create.
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) throw new Error("Upload failed");

            const data = await response.json();
            onLogoChange(data.url);
            setFile(null); // Reset file selection after success
        } catch (error) {
            console.error("Upload failed:", error);
            alert("Upload failed. For this demo, please ensure backend supports /api/upload.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-4">
            <Label className="text-base font-semibold">Company Logo</Label>

            <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative w-32 h-32 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center bg-gray-50 overflow-hidden">
                    {preview ? (
                        <img
                            src={preview}
                            alt="Logo preview"
                            className="w-full h-full object-contain p-2"
                        />
                    ) : (
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                    )}
                </div>

                <div className="flex-1 space-y-3 w-full">
                    <div className="flex gap-2">
                        <Input
                            type="file"
                            accept="image/png,image/jpeg,image/svg+xml"
                            onChange={handleFileChange}
                            className="flex-1 cursor-pointer"
                        />
                    </div>
                    <p className="text-xs text-gray-500">
                        Recommended: PNG or SVG with transparent background. Max 2MB.
                    </p>
                    {file && (
                        <Button
                            onClick={handleUpload}
                            disabled={uploading}
                            className="w-full bg-purple-600 hover:bg-purple-700"
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Upload New Logo
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
