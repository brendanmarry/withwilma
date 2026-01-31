"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { getJobs, updateJob, deleteJob } from "@/lib/api";
import { Job } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, FileUp, Link as LinkIcon, Edit3, Briefcase, Globe, Lock, Trash2 } from "lucide-react";
import Link from "next/link";
import Section from "@/components/ui/Section";
import { JobExtractionDialog } from "@/components/JobExtractionDialog";
import { JobUploadDialog } from "@/components/JobUploadDialog";
import { DeleteJobDialog } from "@/components/DeleteJobDialog";

export default function EmployerJobsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [showExtractDialog, setShowExtractDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);

  const fetchAllJobs = async () => {
    if (!user?.organisationId) return;
    try {
      setLoadingJobs(true);
      // Fetch ALL jobs for employer
      // Pass a timestamp to force fresh fetch if needed, though no-store should handle it in api.ts
      const { jobs: fetchedJobs } = await getJobs(user.organisationId, undefined, undefined);
      setJobs(fetchedJobs);
    } catch (error) {
      console.error("Failed to load jobs", error);
    } finally {
      setLoadingJobs(false);
    }
  };

  const handleToggleActivation = async (job: Job) => {
    try {
      const newValue = !job.wilmaEnabled;
      // Optimistic update
      setJobs(jobs.map(j => j.id === job.id ? { ...j, wilmaEnabled: newValue } : j));

      await updateJob(job.id, { wilmaEnabled: newValue });
    } catch (error) {
      console.error("Failed to update job", error);
      // Revert on failure
      fetchAllJobs();
    }
  };

  // Opens the dialog
  const promptDelete = (job: Job) => {
    setJobToDelete(job);
  };

  // Actually performs delete
  const confirmDelete = async () => {
    if (!jobToDelete) return;
    try {
      setJobs(jobs.filter(j => j.id !== jobToDelete.id));
      await deleteJob(jobToDelete.id);
      // Force refresh (optional but good for consistency)
      await fetchAllJobs();
    } catch (error) {
      console.error("Failed to delete job", error);
      fetchAllJobs();
    }
  };

  useEffect(() => {
    if (user) {
      fetchAllJobs();
    }
  }, [user]);

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
        <p>Please log in to access your jobs.</p>
        <Button asChild>
          <Link href="/employer/login">Log In</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Section padding="lg">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Active Roles</h1>
          <p className="text-gray-600 mt-2">Manage your current job openings and add new ones.</p>
        </div>

        {/* Add New Role Section */}
        <div className="mb-12">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Post a New Position</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card
              className="hover:border-purple-300 transition-colors cursor-pointer group border-dashed border-2 bg-purple-50/20"
              onClick={() => setShowUploadDialog(true)}
            >
              <CardContent className="pt-6 text-center space-y-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <FileUp className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Add via Document</h3>
                  <p className="text-xs text-gray-500 mt-1">Upload PDF or Word JD</p>
                </div>
                <Button variant="ghost" className="text-purple-600 text-xs w-full group-hover:bg-purple-50">Upload File</Button>
              </CardContent>
            </Card>

            <Card
              className="hover:border-purple-300 transition-colors cursor-pointer group border-dashed border-2 bg-purple-50/20"
              onClick={() => setShowExtractDialog(true)}
            >
              <CardContent className="pt-6 text-center space-y-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <LinkIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Extract via URL</h3>
                  <p className="text-xs text-gray-500 mt-1">Paste a careers link</p>
                </div>
                <Button variant="ghost" className="text-purple-600 text-xs w-full group-hover:bg-purple-50">Start Scan</Button>
              </CardContent>
            </Card>

            <Link href="/employer/jobs/new" className="block">
              <Card className="hover:border-purple-300 transition-colors cursor-pointer group border-dashed border-2 bg-purple-50/20 h-full">
                <CardContent className="pt-6 text-center space-y-4">
                  <div className="mx-auto w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <Edit3 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Manual Entry</h3>
                    <p className="text-xs text-gray-500 mt-1">Enter details manually</p>
                  </div>
                  <Button variant="ghost" className="text-purple-600 text-xs w-full group-hover:bg-purple-50">Create Now</Button>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Jobs List Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">All Roles ({jobs.length})</h2>
          </div>

          {loadingJobs ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed">
              <Briefcase className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500">No roles created yet.</p>
              <Button asChild variant="ghost" className="text-purple-600">
                <Link href="/employer/jobs/new">Create your first role</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="block group"
                  onClick={() => router.push(`/employer/jobs/${job.id}`)}
                >
                  <Card className="hover:shadow-md transition-all hover:border-purple-200 cursor-pointer">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${job.wilmaEnabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                          <Briefcase className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">{job.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">{job.department || "General"}</span>
                            <span className="text-gray-300">•</span>
                            <span className="text-xs text-gray-500">{job.location || "Remote"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="flex flex-col items-end">
                          {job.wilmaEnabled ? (
                            <Badge
                              className="bg-green-100 text-green-700 hover:bg-green-200 border-none flex items-center gap-1 cursor-pointer transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleActivation(job);
                              }}
                            >
                              <Globe className="w-3 h-3" />
                              Active
                            </Badge>
                          ) : (
                            <Badge
                              className="bg-gray-100 text-gray-500 hover:bg-gray-200 border-none flex items-center gap-1 cursor-pointer transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleActivation(job);
                              }}
                            >
                              <Lock className="w-3 h-3" />
                              Inactive
                            </Badge>
                          )}
                          <span className="text-[10px] text-gray-400 mt-1">Status</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-gray-400 hover:text-purple-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/employer/jobs/${job.id}/edit`);
                            }}
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-gray-400 hover:text-red-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              promptDelete(job);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </div>
      </Section>

      <JobExtractionDialog
        isOpen={showExtractDialog}
        onClose={() => setShowExtractDialog(false)}
        onJobsExtracted={() => {
          fetchAllJobs();
        }}
      />

      <JobUploadDialog
        isOpen={showUploadDialog}
        onClose={() => setShowUploadDialog(false)}
        onJobsUploaded={() => {
          fetchAllJobs();
        }}
      />

      <DeleteJobDialog
        isOpen={!!jobToDelete}
        onClose={() => setJobToDelete(null)}
        onConfirm={confirmDelete}
        jobTitle={jobToDelete?.title}
      />
    </div>
  );
}
