import Link from "next/link";
import { headers } from "next/headers";
import { getBranding, getOrganisationBySlug } from "@/lib/api";
import { BrandedHeader } from "@/components/BrandedHeader";
import { Button } from "@/components/ui/button";

export default async function ThanksPage() {
  const headersList = await headers();
  const host = headersList.get("host") || "";
  const branding = await getBranding(null, host);
  const tenantSlug = headersList.get("x-tenant-id");

  let tenant = null;
  if (tenantSlug) {
    try {
      tenant = await getOrganisationBySlug(tenantSlug);
    } catch (e) {
      console.error("Failed to fetch tenant", e);
    }
  } else if (host && (host.includes(".localhost") || host.endsWith(".withwilma.com"))) {
    const subdomain = host.split(".")[0];
    if (subdomain !== "www" && subdomain !== "app") {
      tenant = await getOrganisationBySlug(subdomain);
    }
  }

  return (
    <div
      className="mx-auto flex min-h-screen w-full flex-col bg-[#FAF8F2] selection:bg-[var(--brand-primary)] selection:text-white"
      style={{
        // @ts-ignore
        "--brand-primary": branding.primaryColor,
        "--brand-secondary": branding.secondaryColor || branding.primaryColor, // fallback
        fontFamily: branding.fontFamily,
      }}
    >
      <BrandedHeader branding={branding} backLink="/" />

      <main className="flex-1 flex flex-col items-center justify-center gap-10 px-6 text-center py-12 md:py-20">
        <div className="space-y-8 max-w-2xl mx-auto">
          <div
            className="mx-auto flex h-24 w-24 items-center justify-center rounded-full shadow-lg bg-[var(--brand-primary)] text-white scale-110"
          >
            <span className="text-4xl font-black">✓</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
              {tenant ? "Thank you for your application!" : "Thanks for your application"}
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed">
              {tenant
                ? `Thanks for providing your video recording—a brief look at the person behind the CV! ${tenant.name || "Babu's"} has received everything.`
                : "Wilma has submitted your application to the recruiting team. They’ll review everything and get back to you with next steps shortly."
              }
            </p>
          </div>
        </div>

        <div className="space-y-6 max-w-xl mx-auto">
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em]">
              What&apos;s next?
            </p>
            <p className="text-xl font-bold text-slate-800 leading-snug">
              We&apos;re excited to review your application and will be in touch soon with next steps.
            </p>
          </div>
          <Button asChild className="h-14 rounded-xl px-12 text-base font-bold shadow-xl transition-all hover:scale-105 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/90">
            <Link href={`/`}>Back to roles</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}

