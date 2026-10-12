#!/bin/bash
# ==============================================================================
# Harsh Electronics - EC2 Ubuntu Automated Server Provisioning Script
# Operating System: Ubuntu 22.04 LTS / 24.04 LTS
# ==============================================================================

set -e

echo "======================================================================"
echo " Starting Harsh Electronics Ubuntu EC2 Automated Provisioning"
echo "======================================================================"

# 1. Update APT packages
echo "[1/7] Updating system packages..."
sudo apt update && sudo apt upgrade -y

# 2. Install Git, Curl, Build Essentials, and Nginx
echo "[2/7] Installing core tools and Nginx..."
sudo apt install -y git curl build-essential ufw nginx

# 3. Install Node.js LTS (v20 or v22)
echo "[3/7] Installing Node.js LTS via NodeSource..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify Node and NPM
node -v
npm -v

# 4. Install PM2 Process Manager globally
echo "[4/7] Installing PM2 Process Manager globally..."
sudo npm install -g pm2

# 5. Install PostgreSQL & Contrib
echo "[5/7] Installing PostgreSQL..."
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable postgresql
sudo systemctl start postgresql

# 6. Configure UFW Firewall (Restrict port 5000 and 5432)
echo "[6/7] Configuring UFW Firewall..."
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
# Ensure internal ports are explicitly BLOCKED from public WAN
sudo ufw deny 5000
sudo ufw deny 5432
sudo ufw --force enable

echo "======================================================================"
echo " Core Infrastructure Ready!"
echo " Next Steps:"
echo " 1. Configure PostgreSQL user & database"
echo " 2. Clone repository to /var/www/harsh-electronics"
echo " 3. Copy .env file and run 'npm run migrate && npm run seed'"
echo " 4. Build frontend ('npm run build')"
echo " 5. Start PM2 ('pm2 start deploy/ecosystem.config.cjs')"
echo " 6. Link Nginx site ('sudo cp deploy/nginx.conf /etc/nginx/sites-available/harsh-electronics && sudo ln -s /etc/nginx/sites-available/harsh-electronics /etc/nginx/sites-enabled/ && sudo nginx -t && sudo systemctl reload nginx')"
echo "======================================================================"
