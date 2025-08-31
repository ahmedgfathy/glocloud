#!/bin/bash

# 🚀 SIMPLE DEPLOYMENT SCRIPT
# Usage: ssh root@5.180.148.92 'bash -s' < quick-deploy.sh

echo "🚀 Deploying from GitHub..."

cd /var/www/glocloud
git pull origin main
npm install
pm2 restart glocloud

echo "✅ Done! App: https://cloud.glomartrealestates.com"
