
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, AlertTriangle } from "lucide-react";
import { useState } from "react";

interface DeleteJobDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    jobTitle?: string;
}

export function DeleteJobDialog({ isOpen, onClose, onConfirm, jobTitle }: DeleteJobDialogProps) {
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        setLoading(true);
        try {
            await onConfirm();
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={!loading ? onClose : () => { }}
            title="Delete Job"
            className="max-w-md"
        >
            <div className="space-y-4">
                <div className="flex items-center gap-3 text-red-600 bg-red-50 p-3 rounded-lg">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <p className="text-sm font-medium">This action cannot be undone.</p>
                </div>

                <p className="text-gray-600">
                    Are you sure you want to delete <span className="font-medium text-gray-900">{jobTitle || "this job"}</span>?
                    This will permanently remove the job and all associated candidate data.
                </p>

                <div className="flex justify-end gap-2 mt-6">
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        variant="default"
                        onClick={handleConfirm}
                        disabled={loading}
                        className="bg-red-600 hover:bg-red-700 text-white gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            <>
                                <Trash2 className="h-4 w-4" />
                                Delete Forever
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
