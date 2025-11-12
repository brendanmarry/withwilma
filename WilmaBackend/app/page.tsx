import Link from "next/link";

const HomePage = () => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-6 text-slate-100">
    <div className="max-w-3xl space-y-6 text-center">
      <h1 className="text-4xl font-semibold">Wilma Recruitment Assistant</h1>
      <p className="text-base text-slate-400">
        This service powers a RAG-enhanced recruitment flow. Recruiters can ingest
        company knowledge, enable specific job roles, and review AI-augmented candidate
        submissions through the admin dashboard.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/admin"
          className="rounded-full bg-purple-500 px-5 py-2 text-sm font-semibold text-white hover:bg-purple-400"
        >
          Open Admin Dashboard
        </Link>
        <Link
          href="/docs/api"
          className="rounded-full border border-slate-700 px-5 py-2 text-sm font-semibold text-slate-200 hover:border-purple-400 hover:text-purple-200"
        >
          API Reference
        </Link>
      </div>
    </div>
  </div>
);

export default HomePage;
