#!/bin/bash

# Wilma VPS Setup Script
# This script sets up a fresh VPS for running the Wilma application

set -e

echo "=========================================="
echo "Wilma VPS Setup Script"
echo "=========================================="
echo ""

# Update system packages
echo "📦 Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Install required packages
echo "📦 Installing required packages..."
sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    git

# Install Docker
echo "🐳 Installing Docker..."
if ! command -v docker &> /dev/null; then
    # Add Docker's official GPG key
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    
    # Set up the repository
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Install Docker Engine
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    
    # Add current user to docker group
    sudo usermod -aG docker $USER
    
    echo "✅ Docker installed successfully"
else
    echo "✅ Docker is already installed"
fi

# Verify Docker installation
echo "🔍 Verifying Docker installation..."
docker --version
docker compose version

# Clone repository (if not already present)
echo "📥 Setting up repository..."
REPO_DIR="$HOME/wilma"
if [ ! -d "$REPO_DIR" ]; then
    echo "Cloning repository..."
    git clone https://github.com/brendanmarry/withwilma.git "$REPO_DIR"
else
    echo "Repository already exists, pulling latest changes..."
    cd "$REPO_DIR"
    git pull
fi

cd "$REPO_DIR"

# Create .env.prod file if it doesn't exist
echo "⚙️  Setting up environment variables..."
if [ ! -f .env.prod ]; then
    cat > .env.prod << 'EOF'
# Database Configuration
POSTGRES_USER=wilma
POSTGRES_PASSWORD=CHANGE_ME_SECURE_PASSWORD
POSTGRES_DB=wilma

# MinIO Configuration
MINIO_ROOT_USER=wilma
MINIO_ROOT_PASSWORD=CHANGE_ME_SECURE_PASSWORD
MINIO_BUCKET=wilma-prod

# OpenAI API Key
OPENAI_API_KEY=your_openai_api_key_here

# Frontend Configuration
NEXT_PUBLIC_API_URL=http://YOUR_VPS_IP:3001
EOF
    echo "⚠️  Created .env.prod file - PLEASE EDIT IT WITH YOUR ACTUAL VALUES!"
    echo "   Edit with: nano .env.prod"
else
    echo "✅ .env.prod already exists"
fi

echo ""
echo "=========================================="
echo "✅ Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Edit .env.prod with your actual values:"
echo "   nano $REPO_DIR/.env.prod"
echo ""
echo "2. Build and start the services:"
echo "   cd $REPO_DIR"
echo "   docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build"
echo ""
echo "3. Run database migrations:"
echo "   docker exec wilma-backend npx prisma migrate deploy"
echo ""
echo "4. Check logs:"
echo "   docker compose -f docker-compose.prod.yml logs -f"
echo ""
echo "5. Access your applications:"
echo "   - Frontend: http://YOUR_VPS_IP:3000"
echo "   - Backend: http://YOUR_VPS_IP:3001"
echo "   - Website: http://YOUR_VPS_IP:3002"
echo "   - MinIO Console: http://YOUR_VPS_IP:9001"
echo ""
