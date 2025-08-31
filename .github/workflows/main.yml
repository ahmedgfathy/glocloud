#!/bin/bash

# Quick deployment script - run this on the server
# Usage: ssh root@5.180.148.92 'bash -s' < quick-deploy.sh

echo "🚀 Quick GitHub Deploy"

# Go to app directory
cd /var/www/glocloud

# Pull latest changes
git pull origin main

# Install any new dependencies
npm install

# Restart the app
pm2 restart glocloud

echo "✅ Deployment complete!"
echo "🌐 App: https://cloud.glomartrealestates.com"
