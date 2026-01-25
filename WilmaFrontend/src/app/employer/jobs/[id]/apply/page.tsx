"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Upload } from "lucide-react";

export default function ApplyPage() {
    const params = useParams();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        linkedin: "",
        cvFile: null as File | null,
        // Screening Answers
        permit: false, // Do you have a permit?
        availabilityKey: [] as string[], // Full time / Part time
        startDate: "",
        weekendWork: false,
        languages: false, // Comfortable in English/German
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFormData({ ...formData, cvFile: e.target.files[0] });
        }
    };

    const submitApplication = async () => {
        setIsSubmitting(true);
        try {
            // 1. Upload CV (Mocking upload to get URL)
            const cvUrl = "https://mock-cv-url.com/cv.pdf"; // Placeholder

            // 2. Submit Application to Backend
            // This would realistically post to /api/jobs/{id}/apply
            // And return a candidateId

            // We will simulate a delay and a mock candidate ID
            await new Promise(resolve => setTimeout(resolve, 1500));
            const candidateId = "mock-candidate-id-" + Date.now();

            // 3. Trigger Analysis (Mocking)
            await fetch(`/api/candidates/${candidateId}/analyze`, { method: "POST" });

            // 4. Redirect to Video Interview
            router.push(`/jobs/${params.id}/video?candidateId=${candidateId}`);

        } catch (err) {
            console.error("Submission failed", err);
            alert("Something went wrong. Please try again.");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFBF7] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* Progress Bar */}
                <div className="mb-8 flex items-center justify-between text-sm font-medium text-gray-500">
                    <span className={step >= 1 ? "text-black" : ""}>1. Details</span>
                    <span className={step >= 2 ? "text-black" : ""}>2. Screening</span>
                    <span className={step >= 3 ? "text-black" : ""}>3. Video</span>
                </div>

                <Card className="shadow-lg border-0">
                    <CardContent className="p-8">
                        {step === 1 && (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold">Personal Details</h2>
                                <div className="grid gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Jane Doe"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="jane@example.com"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="linkedin">LinkedIn Profile (Optional)</Label>
                                        <Input
                                            id="linkedin"
                                            value={formData.linkedin}
                                            onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                                            placeholder="linkedin.com/in/jane"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Resume / CV</Label>
                                        <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                                            <Input
                                                type="file"
                                                className="hidden"
                                                id="cv-upload"
                                                accept=".pdf,.doc,.docx"
                                                onChange={handleFileChange}
                                            />
                                            <Label htmlFor="cv-upload" className="cursor-pointer flex flex-col items-center">
                                                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                                                <span className="text-sm text-gray-600 font-medium">
                                                    {formData.cvFile ? formData.cvFile.name : "Click to upload your CV"}
                                                </span>
                                                <span className="text-xs text-gray-400 mt-1">PDF, DOC up to 5MB</span>
                                            </Label>
                                        </div>
                                    </div>
                                </div>
                                <Button className="w-full mt-6" onClick={() => setStep(2)} disabled={!formData.name || !formData.email || !formData.cvFile}>
                                    Next: Screening Questions
                                </Button>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold">A few quick questions</h2>
                                <div className="space-y-8">

                                    {/* A. Permit */}
                                    <div className="flex items-start space-x-3">
                                        <Checkbox
                                            id="permit"
                                            checked={formData.permit}
                                            onCheckedChange={(c) => setFormData({ ...formData, permit: c as boolean })}
                                        />
                                        <div className="grid gap-1.5 leading-none">
                                            <Label htmlFor="permit" className="text-base font-medium">
                                                Do you have a valid permit to work in Zurich?
                                            </Label>
                                            <p className="text-sm text-gray-500">Or are you a Swiss/EU citizen?</p>
                                        </div>
                                    </div>

                                    {/* B. Work Type */}
                                    <div className="space-y-2">
                                        <Label className="text-base">Are you interested in full time or part time?</Label>
                                        <div className="flex gap-4">
                                            <Button
                                                variant={formData.availabilityKey.includes("full") ? "default" : "outline"}
                                                onClick={() => setFormData(p => ({ ...p, availabilityKey: ["full"] }))}
                                                type="button"
                                            >
                                                Full Time
                                            </Button>
                                            <Button
                                                variant={formData.availabilityKey.includes("part") ? "default" : "outline"}
                                                onClick={() => setFormData(p => ({ ...p, availabilityKey: ["part"] }))}
                                                type="button"
                                            >
                                                Part Time
                                            </Button>
                                            <Button
                                                variant={formData.availabilityKey.includes("both") ? "default" : "outline"}
                                                onClick={() => setFormData(p => ({ ...p, availabilityKey: ["both"] }))}
                                                type="button"
                                            >
                                                Both
                                            </Button>
                                        </div>
                                    </div>

                                    {/* C. Start Date */}
                                    <div className="space-y-2">
                                        <Label htmlFor="start-date" className="text-base">When are you available to start?</Label>
                                        <Input
                                            id="start-date"
                                            type="text"
                                            placeholder="e.g. Immediately or 1st March"
                                            value={formData.startDate}
                                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        />
                                    </div>

                                    {/* D. Weekends */}
                                    <div className="flex items-start space-x-3">
                                        <Checkbox
                                            id="weekends"
                                            checked={formData.weekendWork}
                                            onCheckedChange={(c) => setFormData({ ...formData, weekendWork: c as boolean })}
                                        />
                                        <div className="grid gap-1.5 leading-none">
                                            <Label htmlFor="weekends" className="text-base font-medium">
                                                Are you available for weekend work?
                                            </Label>
                                            <p className="text-sm text-gray-500">We operate 7 days a week.</p>
                                        </div>
                                    </div>

                                    {/* E. Language */}
                                    <div className="flex items-start space-x-3">
                                        <Checkbox
                                            id="language"
                                            checked={formData.languages}
                                            onCheckedChange={(c) => setFormData({ ...formData, languages: c as boolean })}
                                        />
                                        <div className="grid gap-1.5 leading-none">
                                            <Label htmlFor="language" className="text-base font-medium">
                                                Are you comfortable in English and German?
                                            </Label>
                                        </div>
                                    </div>
                                </div>

                                <Button className="w-full mt-6 bg-black hover:bg-gray-800 text-white" onClick={submitApplication} disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Submit & Continue to Video
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
