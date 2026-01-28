
import { useState, useRef } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Loader2, FileUp, X, UploadCloud } from "lucide-react";
import { uploadJobFiles } from "@/lib/api";
import { useAuth } from "@/context/auth-context";

interface JobUploadDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onJobsUploaded: () => void;
}

export function JobUploadDialog({
    isOpen,
    onClose,
    onJobsUploaded,
}: JobUploadDialogProps) {
    const { user } = useAuth();
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFiles(Array.from(e.target.files));
            setError(null);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setFiles(Array.from(e.dataTransfer.files));
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (files.length === 0) return;
        if (!user?.organisation?.rootUrl) {
            setError("Organisation root URL is missing. Cannot upload.");
            return;
        }

        setUploading(true);
        setError(null);

        try {
            await uploadJobFiles(user.organisation.rootUrl, files);
            onJobsUploaded();
            onClose();
            setFiles([]);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to upload files.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={!uploading ? onClose : () => { }}
            title="Upload Job Documents"
            className="max-w-md"
        >
            <div className="space-y-6">
                <div
                    className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        multiple
                        accept=".pdf,.docx,.txt"
                        onChange={handleFileChange}
                    />

                    <div className="mx-auto w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 mb-4">
                        <UploadCloud className="w-6 h-6" />
                    </div>

                    <h3 className="text-sm font-semibold text-gray-900">
                        Click to upload or drag and drop
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                        PDF or Word documents (max 10MB)
                    </p>
                </div>

                {files.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Selected Files</h4>
                        <div className="max-h-32 overflow-y-auto space-y-2">
                            {files.map((file, i) => (
                                <div key={i} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-2 truncate">
                                        <FileUp className="w-4 h-4 text-purple-500" />
                                        <span className="truncate max-w-[200px]">{file.name}</span>
                                    </div>
                                    <button onClick={() => setFiles(files.filter((_, idx) => idx !== i))} className="text-gray-400 hover:text-red-500">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {error && (
                    <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                        {error}
                    </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" onClick={onClose} disabled={uploading}>
                        Cancel
                    </Button>
                    <Button onClick={handleUpload} disabled={uploading || files.length === 0} className="bg-purple-600 hover:bg-purple-700">
                        {uploading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            "Upload & Process"
                        )}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
