import Link from "next/link";
import { ArrowLeft, Building2, MapPin, Users } from "lucide-react";
import { getOrganisations } from "@/lib/api";
import { Organisation } from "@/lib/types";
import Section from "@/components/ui/Section";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function SelectCompanyPage() {
    const organisations = (await getOrganisations()) as Organisation[];

    return (
        <>
            <Section background="gradient" padding="xl">
                <div className="mx-auto flex max-w-4xl flex-col gap-6 text-center">
                    <Badge variant="outline" className="mx-auto px-4 py-1 text-sm text-[var(--brand-primary)]">
                        Partner Companies
                    </Badge>
                    <h1 className="text-4xl font-semibold text-gray-900 sm:text-5xl">
                        Choose a company to view their open roles
                    </h1>
                    <p className="text-lg text-gray-600 sm:text-xl">
                        Wilma partners with leading companies to provide a better candidate experience. Select one below to explore their opportunities.
                    </p>
                </div>
            </Section>

            <Section padding="lg" background="default">
                <div className="mx-auto max-w-5xl">
                    <div className="mb-8 flex justify-start">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 rounded-full border border-[var(--surface-subtle)] px-4 py-2 text-sm font-semibold text-gray-600 transition hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to home
                        </Link>
                    </div>

                    {organisations.length === 0 ? (
                        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-12 text-center text-gray-500">
                            <Building2 className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                            <p>No companies found. Please check back later.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {organisations.map((org) => (
                                <Link
                                    key={org.id}
                                    href={`/jobs?organisationId=${org.id}`}
                                    className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-[var(--brand-primary)] hover:shadow-md"
                                >
                                    <div className="space-y-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                                                <Building2 className="h-6 w-6" />
                                            </div>
                                            <Badge variant="outline" className="bg-gray-100 text-gray-600 border-none">
                                                {org.counts.jobs} Open Roles
                                            </Badge>
                                        </div>

                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-[var(--brand-primary)]">
                                                {org.name}
                                            </h3>
                                            <p className="mt-1 text-sm text-gray-500 break-all">{org.rootUrl}</p>
                                        </div>

                                        <div className="flex flex-wrap gap-2 pt-2">
                                            {/* Placeholder for future metadata like Location or Industry if available */}
                                        </div>
                                    </div>

                                    <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4 text-sm font-medium text-gray-500">
                                        <span>View Roles</span>
                                        <Users className="h-4 w-4 text-gray-400 group-hover:text-[var(--brand-primary)]" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </Section>
        </>
    );
}
