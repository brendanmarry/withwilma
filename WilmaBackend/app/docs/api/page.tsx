const ApiDocsPage = () => (
  <div className="mx-auto max-w-4xl space-y-6 px-6 py-16 text-slate-100">
    <h1 className="text-3xl font-semibold">Wilma API Overview</h1>
    <p className="text-slate-400">
      The backend exposes an ingestion pipeline, job management utilities, candidate
      submission endpoints, and admin review workflows. Refer to the bundled{" "}
      <code>openapi.yaml</code> file for an exhaustive contract.
    </p>
    <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 text-sm text-slate-200">
      <h2 className="text-lg font-semibold text-white">Key Endpoints</h2>
      <ul className="mt-4 space-y-2 text-slate-300">
        <li>
          <span className="font-mono text-purple-300">POST /api/ingest/url</span> – Crawl
          organisation knowledge.
        </li>
        <li>
          <span className="font-mono text-purple-300">POST /api/jobs/fetch</span> – Normalise
          careers page listings.
        </li>
        <li>
          <span className="font-mono text-purple-300">POST /api/application/submit</span> –
          Capture candidate CVs and compute match scores.
        </li>
        <li>
          <span className="font-mono text-purple-300">GET /api/admin/candidates</span> – Review
          Wilma-assisted applications.
        </li>
      </ul>
      <p className="mt-4 text-slate-400">
        All admin endpoints expect a JWT signed with <code>ADMIN_JWT_SECRET</code>. In
        development, authentication is relaxed for convenience.
      </p>
    </section>
  </div>
);

export default ApiDocsPage;

