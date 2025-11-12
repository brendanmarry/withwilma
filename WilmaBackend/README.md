## Wilma Backend

Wilma is a recruitment assistant that ingests company knowledge, scores candidate
applications, and equips recruiters with an admin dashboard built on the Next.js
App Router and Prisma. Vector search runs locally using embeddings stored in Postgres.

### 1. Environment Setup

1. Duplicate the template in `docs/ENV_SETUP.md` into a `.env` file placed at the
   project root.
2. Start local dependencies (Postgres + MinIO) with Docker:

   ```bash
   docker compose up -d
   ```

   The services expose:

   - Postgres: `localhost:5432` (`wilma` / `wilma`)
   - MinIO API: `http://localhost:9000`
   - MinIO Console: `http://localhost:9001` (`wilma` / `wilma-secret`)

   Create a bucket called `wilma-local` via the MinIO console if it doesn't exist.
   Point `S3_ENDPOINT` at `http://localhost:9000` and set `S3_FORCE_PATH_STYLE=true`
   in your `.env`.
3. Ensure your OpenAI API key is configured. Document embeddings are stored inside
   Postgres, so no external vector database is required.

### 2. Database

Generate and apply migrations (requires the database specified in `DATABASE_URL`):

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
```

Seed scripts can be added under `scripts/` or `prisma/` as needed. The Prisma
schema defines organisations, documents, jobs, candidates, follow-up questions,
and video answers.

### 3. Running the App

```bash
npm run dev
```

The app serves:

- `/admin/knowledge` – knowledge base builder (URL crawl + document uploads + FAQ editor)
- `/admin/jobs` – careers page ingestion and Wilma enablement per job
- `/admin/candidates` – review AI-assisted applications and trigger email templates
- `/docs/api` – high-level API overview (see `openapi.yaml` for full spec)

Public candidate endpoints live under `/api/application/*`.

### 4. Testing & Linting

```bash
npm run lint
npm test
```

Tests currently mock LLM responses to verify pipeline structure. Extend the suite
with integration tests once external services are available.

### 5. Deployment Notes

- Replace the development fallback in `lib/auth.ts` with a proper admin login flow.
- Configure S3 bucket CORS to allow video uploads from the candidate UI.
- For production builds, run `npm run build && npm run start`.

### Quick start helper

- Spin up containers and launch the dev server in one step:

  ```bash
  npm run start:local
  ```

- Or run the shell helper (make it executable first with `chmod +x scripts/start-local.sh`):

  ```bash
  ./scripts/start-local.sh
  ```
