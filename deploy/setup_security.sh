#!/bin/bash
set -e

echo "Starting Security Hardening..."

# 1. Create User
if id "deploy" &>/dev/null; then
    echo "User deploy already exists"
else
    adduser --disabled-password --gecos "" deploy
    usermod -aG sudo deploy
    # Setup passwordless sudo for deploy user to avoid issues with automated scripts
    echo "deploy ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/deploy
    echo "User deploy created"
fi

# 2. Setup SSH for deploy
mkdir -p /home/deploy/.ssh
# Copy root's authorized_keys to deploy
if [ -f /root/.ssh/authorized_keys ]; then
    cp /root/.ssh/authorized_keys /home/deploy/.ssh/
    chown -R deploy:deploy /home/deploy/.ssh
    chmod 700 /home/deploy/.ssh
    chmod 600 /home/deploy/.ssh/authorized_keys
    echo "SSH keys copied to deploy user"
else
    echo "WARNING: No authorized_keys found for root. deploy user has no keys!"
fi

# 3. Firewall (UFW)
# Ensure iptables/ufw is installed
apt-get update
apt-get install -y ufw

# Reset ufw to default
ufw --force reset

# Default policies
ufw default deny incoming
ufw default allow outgoing

# Allow essential incoming
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp

# Block SMTP outgoing (spam prevention)
ufw deny out 25/tcp
ufw deny out 465/tcp
ufw deny out 587/tcp

# Enable Firewall
echo "y" | ufw enable
echo "Firewall enabled and configured"

# 4. Fail2Ban
apt-get install -y fail2ban
systemctl enable fail2ban
systemctl start fail2ban
echo "Fail2Ban installed and running"

echo "Security Setup Complete. Please verify 'ssh deploy@IP' works before disabling root login!"
