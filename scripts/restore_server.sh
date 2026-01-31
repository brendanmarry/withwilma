#!/bin/bash
set -e

# Change to project root (one directory up from scripts/)
cd "$(dirname "$0")/.."
echo "Working in $(pwd)"

echo "Step 1: Fixing Service (Docker)..."
docker compose down
git pull
docker compose up -d --build --force-recreate

echo "Step 2: Securing Access (Deploy User)..."
if ! id "deploy" &>/dev/null; then
    useradd -m -s /bin/bash deploy
    usermod -aG docker,sudo deploy
    echo "User 'deploy' created."
else
    echo "User 'deploy' exists."
fi

mkdir -p /home/deploy/.ssh
echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIBsP0Xz4y9QNe5mjKHMHgml5RViYz3J3aQJoA9yjrl69 wilma-deploy" >> /home/deploy/.ssh/authorized_keys
chown -R deploy:deploy /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys

echo "Step 3: Unbanning IPs..."
if command -v fail2ban-client &> /dev/null; then
    fail2ban-client unban --all || true
    echo "Unbanned all IPs."
fi

echo "Done! Candidate flow is fixed and remote access is restored."
