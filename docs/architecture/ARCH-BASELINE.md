# Architecture Baseline

## System Overview
- **WilmaFrontend**: Next.js application (Recruiter/Admin Dashboard).
- **WilmaWebsite**: Next.js application (Landing pages, Candidate content).
- **WilmaBackend**: Next.js (API Routes), serving as the backend.
- **Database**: PostgreSQL (v16-alpine), managed via Prisma ORM.
- **Storage**: MinIO (S3-compatible object storage).
- **Infrastructure**: Docker Compose for local development and deployment.

## Key Technologies
- **Runtime**: Node.js (v20)
- **Framework**: Next.js (v16 for Backend, likely similar for others)
- **ORM**: Prisma
- **Styling**: TailwindCSS
- **Authentication**: Usage of `jose` (JWT) and `next-safe-action` implies custom or library-assisted auth.
- **Testing**: Jest, React Testing Library

## Service Dependencies
- **Postgres**: Application data persistence.
- **MinIO**: File storage (likely resumes, documents).
- **Frontend** depends on **Backend** (INTERNAL_API_URL).
- **Website** links to **Candidate App** and **Recruiter App**.

## Current folder structure
- `WilmaBackend/`
- `WilmaFrontend/`
- `WilmaWebsite/`
- `deploy/`
