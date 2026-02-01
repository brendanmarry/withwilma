#!/bin/bash

# WILMA PRODUCTION DEPLOYMENT SCRIPT
# Usage: ./scripts/deploy_prod.sh

set -e # Exit on error

echo "🚀 Starting Production Deployment..."

# 1. Navigate to project root (assuming script is run from project root or scripts dir)
# Get the absolute path of the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$SCRIPT_DIR/.."
cd "$PROJECT_ROOT"

# 2. Pull latest code
echo "📥 Pulling latest code..."
git pull origin main

# 3. Build containers
# We explicitly use the PROD compose file to avoid building/starting local containers
echo "🏗️  Building Production Containers..."
docker compose -f docker-compose.prod.yml build core marketing

# 4. Start/Restart Services
echo "🔄 Restarting Services..."
docker compose -f docker-compose.prod.yml up -d

# 5. Run Database Migrations
echo "📦 Running Database Migrations..."
# Explicitly use the version that matches package.json to avoid version drift
docker compose -f docker-compose.prod.yml exec -T core npx prisma@6.19.0 migrate deploy

# 6. Cleanup
echo "🧹 Cleaning up unused resources..."
docker image prune -f

echo "✅ Deployment Complete! Visit https://app.withwilma.com"
