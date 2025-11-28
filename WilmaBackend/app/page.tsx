import Link from "next/link";

const HomePage = () => (
  <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-6 py-16">
    <div className="mx-auto flex max-w-4xl flex-col items-center gap-8 text-center">
      <span className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-primary-soft)] px-4 py-1 text-sm font-medium text-[var(--brand-primary)]">
        Wilma platform services
      </span>
      <div className="space-y-4">
        <h1 className="text-4xl font-semibold text-[var(--foreground)] sm:text-5xl">
          Powering the knowledge behind every AI interview
        </h1>
        <p className="text-base text-slate-600 sm:text-lg">
          This service lets your recruiting team ingest company knowledge, curate open roles, and review AI-generated candidate insights
          before they’re sent downstream. Everything lives in one connected workspace.
        </p>
      </div>
      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <Link
          href="/admin"
          className="inline-flex items-center justify-center rounded-full bg-[var(--brand-primary)] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[var(--brand-primary-hover)]"
        >
          Open Admin Console
        </Link>
        <Link
          href="/docs/api"
          className="inline-flex items-center justify-center rounded-full border border-[var(--surface-subtle)] px-6 py-3 text-sm font-semibold text-slate-600 transition hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
        >
          View API docs
        </Link>
      </div>
    </div>
  </main>
);

export default HomePage;
