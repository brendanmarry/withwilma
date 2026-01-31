"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Video, RefreshCw, Send } from "lucide-react";

export default function VideoPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const candidateId = searchParams.get("candidateId");

    const [question, setQuestion] = useState<string | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [hasRecorded, setHasRecorded] = useState(false);
    const [retries, setRetries] = useState(3);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // Mock fetching question
        setTimeout(() => {
            setQuestion("I noticed you have experience in kitchen prep, but the role requires fast-paced line cooking. Can you describe a time you handled a high-pressure rush?");
        }, 1000);
    }, [candidateId]);

    const handleStartRecording = () => {
        setIsRecording(true);
        setTimeout(() => {
            setIsRecording(false);
            setHasRecorded(true);
        }, 3000);
    };

    const handleRetry = () => {
        if (retries > 0) {
            setHasRecorded(false);
            setRetries(r => r - 1);
        }
    };

    const handleSubmit = () => {
        setIsSubmitting(true);
        setTimeout(() => {
            router.push("/success");
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full space-y-8 text-center">

                <div className="space-y-4">
                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-yellow-400 text-black">
                        <Video className="h-8 w-8" />
                    </div>
                    <h1 className="text-2xl font-bold">One final step</h1>
                    <p className="text-gray-400">Please answer this question with a short video (max 60s).</p>
                </div>

                <Card className="bg-gray-900 border-gray-800 text-left">
                    <CardContent className="p-6">
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-widest mb-2">Your Question</h3>
                        {question ? (
                            <p className="text-xl text-white font-medium">{question}</p>
                        ) : (
                            <div className="h-20 flex items-center justify-center">
                                <span className="animate-pulse text-gray-500">Generating question from your CV...</span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="h-[300px] w-full bg-gray-800 rounded-2xl flex items-center justify-center relative overflow-hidden border border-gray-700">
                    {/* Camera Feed Placeholder */}
                    {!isRecording && !hasRecorded && (
                        <div className="text-gray-500 flex flex-col items-center">
                            <p>Camera Preview</p>
                        </div>
                    )}

                    {isRecording && (
                        <div className="absolute inset-0 bg-red-900/20 flex items-center justify-center">
                            <span className="animate-pulse text-red-500 font-bold">Recording...</span>
                        </div>
                    )}

                    {hasRecorded && (
                        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                            <p className="text-green-500 font-medium">Video Recorded!</p>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {!hasRecorded ? (
                        <Button
                            className="col-span-2 h-14 text-lg bg-white text-black hover:bg-gray-200 rounded-full"
                            onClick={handleStartRecording}
                            disabled={!question || isRecording}
                        >
                            {isRecording ? "Listening..." : "Start Recording"}
                        </Button>
                    ) : (
                        <>
                            <Button
                                variant="outline"
                                className="h-14 bg-transparent border-gray-600 text-white hover:bg-gray-800 rounded-full"
                                onClick={handleRetry}
                                disabled={retries === 0 || isSubmitting}
                            >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Retry ({retries} left)
                            </Button>
                            <Button
                                className="h-14 bg-yellow-500 text-black hover:bg-yellow-600 rounded-full"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    "Sending..."
                                ) : (
                                    <>
                                        Submit Application <Send className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
