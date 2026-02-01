
import { getJob, getOrganisationBySlug, getBranding } from "@/lib/api";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Briefcase, MapPin, Clock, ArrowRight } from "lucide-react";
import { headers } from "next/headers";
import { BrandedHeader } from "@/components/BrandedHeader";

interface JobPageProps {
    params: Promise<{ jobId: string }>;
}

export default async function JobPage({ params }: JobPageProps) {
    const { jobId } = await params;
    const job = await getJob(jobId);

    // Tenant resolution
    const headersList = await headers();
    const host = headersList.get("host") || "";
    const branding = await getBranding(job, host);

    // For Header Display (Optional, keeping local logic for 'tenant' object if needed for name display)
    let tenant = null;
    if (host && (host.includes(".localhost") || host.endsWith(".withwilma.com"))) {
        const subdomain = host.split(".")[0];
        if (subdomain !== "www" && subdomain !== "app") {
            tenant = await getOrganisationBySlug(subdomain);
        }
    }

    if (!job) {
        return (
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="text-center">
                    <h1 className="text-2xl font-bold">Job not found</h1>
                    <p className="mt-2 text-gray-600">This role may have been closed or removed.</p>
                    <Button asChild className="mt-6">
                        <Link href="/jobs">View all jobs</Link>
                    </Button>
                </div>
            </div>
        );
    }

    // Dynamic Renders
    const renderSection = (section: any) => {
        // Resolve content: either bound from normalized data, or static text
        const content = section.dataKey && job.normalizedJson
            ? (job.normalizedJson as any)[section.dataKey]
            : section.staticContent;

        // If no content and no title, skip (e.g. empty list)
        if (!content && !section.title) return null;

        switch (section.type) {
            case "header":
                return <h1 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight mb-8 mt-12 first:mt-0">{section.title || content}</h1>;

            case "text":
                return (
                    <div className="mb-8 text-lg text-gray-800 leading-relaxed">
                        {section.title && <h3 className="font-bold uppercase tracking-widest text-sm text-gray-400 mb-2">{section.title}</h3>}
                        <div className="whitespace-pre-line">{content}</div>
                    </div>
                );

            case "list":
                if (!Array.isArray(content) || content.length === 0) return null;
                return (
                    <div className="mb-10">
                        {section.title && <h3 className="text-xl font-bold uppercase mb-6 tracking-wide text-gray-900">{section.title}</h3>}
                        <ul className="space-y-2 list-none text-gray-800">
                            {content.map((item: string, i: number) => (
                                <li key={i} className="flex gap-3">
                                    <span className="text-black font-bold transform translate-y-[2px]">-</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                );

            case "key_value":
                // Metadata block
                return (
                    <div className="space-y-4 mb-10">
                        {section.title && <h3 className="font-bold uppercase tracking-widest text-sm text-gray-400">{section.title}</h3>}
                        <div className="space-y-1 text-gray-800">
                            <div className="flex gap-2">
                                <span className="font-bold uppercase text-sm">Abteilung:</span>
                                <span>{job.department || "General"}</span>
                            </div>
                            {job.location && (
                                <div className="flex gap-2">
                                    <span className="font-bold uppercase text-sm">Arbeitsort:</span>
                                    <span>{job.location}</span>
                                </div>
                            )}
                            {job.employmentType && (
                                <div className="flex gap-2">
                                    <span className="font-bold uppercase text-sm">Pensum:</span>
                                    <span>{job.employmentType}</span>
                                </div>
                            )}
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <main
            className="min-h-screen bg-[#FAF8F2] pb-20"
            style={{
                // @ts-ignore
                "--brand-primary": branding.primaryColor,
                "--brand-secondary": branding.secondaryColor || branding.primaryColor, // fallback
                fontFamily: branding.fontFamily,
            }}
        >
            <BrandedHeader branding={branding} backLink="/" />

            <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">

                {/* Header (Top Level Action) */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div />
                    <Link
                        href={`/apply/${job.id}/apply`}
                        className="bg-black hover:bg-gray-800 text-white rounded-none uppercase tracking-widest font-semibold px-8 h-12 inline-flex items-center justify-center transition-colors shadow-lg hover:shadow-xl"
                        style={{ backgroundColor: branding.primaryColor }}
                    >
                        Apply Now
                    </Link>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 gap-4 text-gray-800 leading-relaxed">

                    {job.layoutConfig && (job.layoutConfig as any).sections ? (
                        // Dynamic Rendering
                        (job.layoutConfig as any).sections.map((section: any, idx: number) => (
                            <div key={idx}>{renderSection(section)}</div>
                        ))
                    ) : (
                        // Fallback: Default Layout (Previous Implementation)
                        <>
                            <h1
                                className="text-3xl md:text-5xl font-black tracking-tight mb-8 uppercase"
                                style={{ color: branding.primaryColor }}
                            >
                                {job.title}
                            </h1>

                            {job.normalizedJson?.summary || job.description ? (
                                <div className="text-lg mb-8 whitespace-pre-line">
                                    {job.normalizedJson?.summary || job.description.split('\n\n')[0]}
                                </div>
                            ) : null}

                            <div className="space-y-4 mb-10">
                                <h3 className="font-bold uppercase tracking-widest text-sm text-gray-400">Eckdaten</h3>
                                <div className="space-y-1">
                                    <div className="flex gap-2">
                                        <span className="font-bold uppercase text-sm">Abteilung:</span>
                                        <span>{job.department || "General"}</span>
                                    </div>
                                    {job.location && (
                                        <div className="flex gap-2">
                                            <span className="font-bold uppercase text-sm">Arbeitsort:</span>
                                            <span>{job.location}</span>
                                        </div>
                                    )}
                                    {job.employmentType && (
                                        <div className="flex gap-2">
                                            <span className="font-bold uppercase text-sm">Pensum:</span>
                                            <span>{job.employmentType}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {!job.normalizedJson && (
                                <div className="whitespace-pre-line">
                                    {job.description}
                                </div>
                            )}
                        </>
                    )}

                    <div className="pt-16 mt-16 border-t border-slate-200/60">
                        <Link
                            href={`/apply/${job.id}/apply`}
                            className="w-full md:w-auto bg-black hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] text-white rounded-2xl uppercase tracking-widest font-black px-12 h-14 inline-flex items-center justify-center transition-all shadow-2xl"
                            style={{ backgroundColor: branding.primaryColor }}
                        >
                            Apply Now
                        </Link>
                    </div>

                </div>
            </div>
        </main>
    );
}
