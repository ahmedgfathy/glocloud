#!/bin/bash

# Deployment script for Glo Cloud to server 5.180.148.92
# This script helps deploy the app to the remote server

SERVER_IP="5.180.148.92"
SERVER_USER="root"
APP_DIR="/var/www/glocloud"

echo "🚀 Starting deployment to $SERVER_IP..."

# Build the application
echo "📦 Building the application..."
npm run build

# Create deployment package
echo "📋 Creating deployment package..."
tar -czf glocloud-deployment.tar.gz \
  --exclude=node_modules \
  --exclude=.next \
  --exclude=.git \
  --exclude=uploads \
  --exclude="*.log" \
  .

echo "✅ Deployment package created: glocloud-deployment.tar.gz"
echo ""
echo "📋 Next steps to deploy on your server:"
echo "1. Copy the package to your server:"
echo "   scp glocloud-deployment.tar.gz root@$SERVER_IP:/tmp/"
echo ""
echo "2. SSH into your server:"
echo "   ssh root@$SERVER_IP"
echo ""
echo "3. On the server, run these commands:"
echo "   # Create /var/www directory if it doesn't exist"
echo "   mkdir -p /var/www"
echo "   cd /var/www"
echo ""
echo "   # Create app directory"
echo "   mkdir -p glocloud"
echo "   cd glocloud"
echo ""
echo "   # Extract the app"
echo "   tar -xzf /tmp/glocloud-deployment.tar.gz"
echo ""
echo "   # Install dependencies"
echo "   npm install"
echo ""
echo "   # Build the app"
echo "   npm run build"
echo ""
echo "   # Set up the database"
echo "   npx prisma db push"
echo ""
echo "   # Create uploads directory"
echo "   mkdir -p uploads"
echo "   chmod 755 uploads"
echo ""
echo "   # Start the app"
echo "   npm run start"
echo ""
echo "4. Your app will be available at: http://$SERVER_IP:3000"
