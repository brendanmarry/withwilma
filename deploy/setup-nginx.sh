#!/bin/bash

# Exit on error
set -e

echo "📦 Installing Nginx and Certbot..."
sudo apt-get update
sudo apt-get install -y nginx certbot python3-certbot-nginx

echo "⚙️  Configuring Nginx..."
sudo cp deploy/nginx/nginx.conf /etc/nginx/sites-available/withwilma
sudo ln -sf /etc/nginx/sites-available/withwilma /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

echo "✅ Verifying Nginx configuration..."
sudo nginx -t

echo "🔄 Reloading Nginx..."
sudo systemctl reload nginx

echo "🔒 Obtaining SSL Certificates..."
# Request certificates for all domains in a single certbot command
sudo certbot --nginx \
    -d withwilma.com \
    -d www.withwilma.com \
    -d app.withwilma.com \
    -d api.withwilma.com \
    -d minio.withwilma.com \
    --non-interactive \
    --agree-tos \
    --email brendan@withwilma.com \
    --redirect

echo "✅ SSL Configuration Complete!"
echo "Your sites should now be accessible via HTTPS:"
echo "- https://withwilma.com"
echo "- https://app.withwilma.com"
echo "- https://api.withwilma.com"
echo "- https://minio.withwilma.com"
