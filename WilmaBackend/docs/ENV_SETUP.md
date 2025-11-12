# Environment Variables

Create a `.env` file in the project root before running the backend. Copy the
following template and replace each placeholder with your real credentials.

```
DATABASE_URL=postgresql://wilma:wilma@localhost:5432/wilma

OPENAI_API_KEY=sk-your-openai-key

S3_BUCKET=wilma-local
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=wilma
S3_SECRET_ACCESS_KEY=wilma-secret
S3_ENDPOINT=http://localhost:9000
S3_FORCE_PATH_STYLE=true

ADMIN_JWT_SECRET=change-me
APP_URL=http://localhost:3000
```

## Notes

- `DATABASE_URL` should point to the Postgres instance used by Prisma. The provided
  Docker compose file exposes Postgres on `localhost:5432` with username/password
  `wilma`.
- `ADMIN_JWT_SECRET` secures the admin JWTs. In development, a fallback token is
  provided, but you should set a strong secret before production.
- `S3_*` credentials are required for CV and video uploads. For local testing,
  the bundled Docker compose file starts a MinIO server. After running the stack,
  create a bucket named `wilma-local` via http://localhost:9001 (use the same
  credentials as in the env file). Set `S3_ENDPOINT` to the MinIO API URL and
  `S3_FORCE_PATH_STYLE=true` to ensure compatible path handling.

