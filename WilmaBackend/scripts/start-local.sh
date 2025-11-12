#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT_DIR"

echo "▶️  Starting local services (Postgres + MinIO)..."
docker compose up -d

echo "🚀 Launching Wilma backend (Next.js dev server)..."
npm run dev

