import { headers } from "next/headers";
import { getOrganisationBySlug, getJobs } from "@/lib/api";
import TenantLandingPage from "@/components/TenantLandingPage";
import Section from "@/components/ui/Section";
import { Button } from "@/components/ui/button";
import { UserPlus, LogIn } from "lucide-react";
import Link from "next/link";

export default async function Home() {
  const headersList = await headers();
  const tenantSlug = headersList.get("x-tenant-id");

  let tenant = null;
  if (tenantSlug) {
    try {
      tenant = await getOrganisationBySlug(tenantSlug);
    } catch (e) {
      console.error("Failed to fetch tenant", e);
    }
  }

  if (tenant) {
    const { jobs } = await getJobs(tenant.id);
    return <TenantLandingPage jobs={jobs} tenant={tenant} />;
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] justify-center bg-gray-50">
      <Section padding="lg">
        <div className="mx-auto max-w-3xl text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Welcome to <span className="text-[var(--brand-primary)]">Wilma</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-xl mx-auto">
              Your AI-powered recruitment assistant. Log in to manage your pipeline or create an account to start automating your hiring.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto pt-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center gap-4 hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-purple-50 rounded-full flex items-center justify-center text-purple-600">
                <LogIn className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-semibold">Employer Login</h2>
              <p className="text-sm text-gray-500 text-center">
                Access your dashboard, manage jobs, and review candidates.
              </p>
              <Button asChild className="w-full mt-2 bg-black hover:bg-gray-800 text-white">
                <Link href="/employer/login">Log In</Link>
              </Button>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center gap-4 hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                <UserPlus className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-semibold">Create Account</h2>
              <p className="text-sm text-gray-500 text-center">
                New to Wilma? Precise your company DNA and start hiring with AI.
              </p>
              <Button asChild variant="outline" className="w-full mt-2">
                <Link href="/employer/register">Sign Up</Link>
              </Button>
            </div>
          </div>

          <div className="pt-12">
            <p className="text-sm text-gray-400">
              Applying for a job? Visit the{" "}
              <a href="http://localhost:3002" className="text-purple-600 hover:underline">
                Main Website
              </a>{" "}
              to learn more.
            </p>
          </div>
        </div>
      </Section>
    </div>
  );
}
