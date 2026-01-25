import { redirect } from "next/navigation";
import { getAdminTokenFromRequest } from "@/lib/auth";
import { Loader2 } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { JobSourceCard } from "@/app/components/employer/JobSourceCard";
import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function RecruiterDashboard() {
    const user = await getAdminTokenFromRequest();

    if (!user) {
        redirect("/auth/login");
    }

    // Example stats fetching (server-side)
    const activeJobsCount = await prisma.job.count({
        where: { organisationId: user.organisationId, status: "open" }
    });

    // Placeholder counts for now
    const newCandidatesCount = 0;
    const interviewsTodayCount = 0;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="mx-auto max-w-5xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-600">Welcome back, {user.email}</p>
                </div>

                <div className="mb-8">
                    <JobSourceCard />
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
                        <h3 className="font-semibold text-gray-900">Active Jobs</h3>
                        <p className="mt-2 text-3xl font-bold text-purple-600">{activeJobsCount}</p>
                    </div>
                    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
                        <h3 className="font-semibold text-gray-900">New Candidates</h3>
                        <p className="mt-2 text-3xl font-bold text-purple-600">{newCandidatesCount}</p>
                    </div>
                    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
                        <h3 className="font-semibold text-gray-900">Interviews Today</h3>
                        <p className="mt-2 text-3xl font-bold text-purple-600">{interviewsTodayCount}</p>
                    </div>

                    {/* Calibration Entry Point - simplified */}
                    <div className="col-span-full rounded-xl bg-purple-50 p-6 border border-purple-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-purple-900">Calibrate Company Profile</h3>
                                <p className="text-purple-700 mt-1">Chat with Wilma to refine your company DNA and improve candidate matching.</p>
                            </div>
                            <Link href="/admin/knowledge">
                                {/* Using existing admin knowledge base link for now as "Onboarding" */}
                                <Button className="bg-purple-600 hover:bg-purple-700">
                                    Start Calibration
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
