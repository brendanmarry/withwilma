# Wilma - AI Recruitment Assistant

Wilma is a recruitment assistant that ingests company knowledge, scores candidate applications, and equips recruiters with an admin dashboard.

## Project Structure

- `WilmaBackend/` - Next.js backend with Prisma, PostgreSQL, and MinIO
- `WilmaFrontend/` - Next.js frontend for candidate interface

## Quick Start

### Prerequisites

- Node.js 18+ 
- Docker and Docker Compose
- OpenAI API key

### 1. Backend Setup

```bash
cd WilmaBackend
cp .env.example .env
# Edit .env with your credentials
npm install
docker compose up -d
npx prisma generate
npx prisma migrate deploy
npm run dev
```

Backend runs on `http://localhost:3001`

### 2. Frontend Setup

```bash
cd WilmaFrontend
cp .env.example .env
# Edit .env with your API URL
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`

### 3. Services

- **PostgreSQL**: `localhost:5432` (user: `wilma`, password: `wilma`, db: `wilma`)
- **MinIO API**: `http://localhost:9000`
- **MinIO Console**: `http://localhost:9001` (user: `wilma`, password: `wilma-secret`)

After starting Docker, create a bucket named `wilma-local` via the MinIO console.

## Documentation

- Backend docs: `WilmaBackend/README.md`
- Environment setup: `WilmaBackend/docs/ENV_SETUP.md`

