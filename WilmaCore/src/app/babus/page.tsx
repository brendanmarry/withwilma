import { getJobs, getOrganisationBySlug } from "@/lib/api";
import TenantLandingPage from "@/components/TenantLandingPage";

export default async function BabusDirectPage() {
    const tenant = await getOrganisationBySlug("babus");

    if (!tenant) {
        return (
            <div className="flex min-h-screen items-center justify-center p-8">
                <p className="text-red-500 font-bold">Error: Could not find 'babus' organisation. Please check database seeding.</p>
            </div>
        );
    }

    const { jobs } = await getJobs(tenant.id);

    return <TenantLandingPage jobs={jobs} tenant={tenant} />;
}
