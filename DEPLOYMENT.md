# Wilma VPS Deployment Guide

This guide will walk you through deploying the Wilma application stack to your Contabo VPS.

## Prerequisites

- A fresh VPS (Ubuntu 20.04+ or Debian 11+ recommended)
- SSH access to your VPS
- Your VPS IP address
- OpenAI API key

## Step 1: Connect to Your VPS

```bash
ssh root@YOUR_VPS_IP
```

Replace `YOUR_VPS_IP` with your actual VPS IP address.

## Step 2: Run the Setup Script

Download and run the automated setup script:

```bash
curl -fsSL https://raw.githubusercontent.com/brendanmarry/withwilma/main/setup-vps.sh -o setup-vps.sh
chmod +x setup-vps.sh
./setup-vps.sh
```

This script will:
- Update system packages
- Install Docker and Docker Compose
- Clone the repository to `~/wilma`
- Create a template `.env.prod` file

> [!NOTE]
> If you're not logged in as root, you may need to log out and back in after the script completes for Docker group permissions to take effect.

## Step 3: Configure Environment Variables

Edit the `.env.prod` file with your actual values:

```bash
cd ~/wilma
nano .env.prod
```

Update the following values:

```env
# Database Configuration
POSTGRES_USER=wilma
POSTGRES_PASSWORD=YOUR_SECURE_PASSWORD_HERE  # Change this!
POSTGRES_DB=wilma

# MinIO Configuration
MINIO_ROOT_USER=wilma
MINIO_ROOT_PASSWORD=YOUR_SECURE_PASSWORD_HERE  # Change this!
MINIO_BUCKET=wilma-prod

# OpenAI API Key
OPENAI_API_KEY=sk-...  # Your actual OpenAI API key

# Frontend Configuration
NEXT_PUBLIC_API_URL=http://YOUR_VPS_IP:3001  # Replace with your VPS IP
```

Save and exit (Ctrl+X, then Y, then Enter).

## Step 4: Update Next.js Configuration

For the Dockerfiles to work with standalone output, you need to update the Next.js configs:

### WilmaBackend/next.config.ts
```bash
nano ~/wilma/WilmaBackend/next.config.ts
```

Add `output: 'standalone'` to the config:
```typescript
const nextConfig: NextConfig = {
  output: 'standalone',
  // ... rest of config
};
```

### WilmaFrontend/next.config.ts
```bash
nano ~/wilma/WilmaFrontend/next.config.ts
```

Add `output: 'standalone'`:
```typescript
const nextConfig: NextConfig = {
  output: 'standalone',
  // ... rest of config
};
```

### WilmaWebsite/next.config.mjs
```bash
nano ~/wilma/WilmaWebsite/next.config.mjs
```

Add `output: 'standalone'`:
```javascript
const nextConfig = {
  output: 'standalone',
  // ... rest of config
};
```

## Step 5: Build and Start Services

Build and start all services:

```bash
cd ~/wilma
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

This will:
- Build Docker images for Backend, Frontend, and Website
- Start PostgreSQL and MinIO
- Start all application services

> [!NOTE]
> The first build may take 10-15 minutes depending on your VPS specs.

## Step 6: Run Database Migrations

Once the backend container is running, execute the database migrations:

```bash
docker exec wilma-backend npx prisma migrate deploy
```

## Step 7: Create MinIO Bucket

1. Access MinIO Console at `http://YOUR_VPS_IP:9001`
2. Login with credentials from `.env.prod` (MINIO_ROOT_USER / MINIO_ROOT_PASSWORD)
3. Create a bucket named `wilma-prod` (or whatever you set in MINIO_BUCKET)

## Step 8: Verify Deployment

Check that all services are running:

```bash
docker compose -f docker-compose.prod.yml ps
```

You should see all services in "Up" state.

View logs:

```bash
docker compose -f docker-compose.prod.yml logs -f
```

## Step 9: Access Your Applications

- **Frontend (Candidate Interface)**: `http://YOUR_VPS_IP:3000`
- **Backend (API)**: `http://YOUR_VPS_IP:3001`
- **Website (Marketing)**: `http://YOUR_VPS_IP:3002`
- **MinIO Console**: `http://YOUR_VPS_IP:9001`

## Useful Commands

### View Logs
```bash
# All services
docker compose -f docker-compose.prod.yml logs -f

# Specific service
docker compose -f docker-compose.prod.yml logs -f backend
```

### Restart Services
```bash
# All services
docker compose -f docker-compose.prod.yml restart

# Specific service
docker compose -f docker-compose.prod.yml restart backend
```

### Stop Services
```bash
docker compose -f docker-compose.prod.yml down
```

### Update Application
```bash
cd ~/wilma
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

### Access Database
```bash
docker exec -it wilma-postgres psql -U wilma -d wilma
```

## Troubleshooting

### Services won't start
Check logs for errors:
```bash
docker compose -f docker-compose.prod.yml logs
```

### Database connection errors
Ensure PostgreSQL is running:
```bash
docker compose -f docker-compose.prod.yml ps postgres
```

### Build failures
Clear Docker cache and rebuild:
```bash
docker compose -f docker-compose.prod.yml down
docker system prune -a
docker compose -f docker-compose.prod.yml up -d --build
```

### Port conflicts
If ports are already in use, you can modify the port mappings in `docker-compose.prod.yml`.

## Security Recommendations

1. **Firewall**: Configure UFW to only allow necessary ports
   ```bash
   sudo ufw allow 22/tcp    # SSH
   sudo ufw allow 3000/tcp  # Frontend
   sudo ufw allow 3001/tcp  # Backend
   sudo ufw allow 3002/tcp  # Website
   sudo ufw enable
   ```

2. **SSL/TLS**: Set up a reverse proxy (Nginx/Caddy) with Let's Encrypt for HTTPS

3. **Change Default Passwords**: Ensure all passwords in `.env.prod` are strong and unique

4. **Regular Updates**: Keep your system and Docker images updated

## Next Steps

- Set up a domain name and configure DNS
- Install and configure Nginx/Caddy as a reverse proxy
- Set up SSL certificates with Let's Encrypt
- Configure automated backups for PostgreSQL and MinIO data
- Set up monitoring and logging

---

For issues or questions, refer to the main [README.md](README.md) or check the project documentation.
