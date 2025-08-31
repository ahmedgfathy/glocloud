#!/bin/bash

# Deployment script for Glo Cloud from GitHub
# Run this on the server to pull latest changes

echo "🚀 Starting deployment from GitHub..."

# Variables
APP_DIR="/var/www/glocloud-backup-20250831"
REPO_URL="https://github.com/ahmedgfathy/glocloud.git"
BACKUP_DIR="/var/www/glocloud-backup-$(date +%Y%m%d-%H%M%S)"

# Stop the application
echo "⏸️  Stopping application..."
pm2 stop glocloud

# Create backup of current version
echo "💾 Creating backup..."
cp -r "$APP_DIR" "$BACKUP_DIR"

# Navigate to app directory
cd "$APP_DIR"

# Pull latest changes from GitHub
echo "📥 Pulling latest changes from GitHub..."
git pull origin main

# Install dependencies if package.json changed
echo "📦 Installing dependencies..."
npm install

# Copy environment file if it doesn't exist
if [ ! -f .env.local ]; then
    echo "⚙️  Creating environment file..."
    cat > .env.local << 'EOF'
DATABASE_URL="mysql://root:ZeroCall20%21%40HH%23%231655%26%26@localhost:3306/glocloud"
NEXTAUTH_URL=https://cloud.glomartrealestates.com
NEXTAUTH_SECRET=super-secret-nextauth-key-change-in-production-2024
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=104857600
APP_NAME=Glo Cloud
APP_URL=https://cloud.glomartrealestates.com
NODE_ENV=production
EOF
fi

# Try to build (optional - can run in dev mode if build fails)
echo "🔨 Attempting to build..."
if npm run build 2>/dev/null; then
    echo "✅ Build successful - starting in production mode"
    pm2 start npm --name 'glocloud' -- start
else
    echo "⚠️  Build failed - starting in development mode"
    pm2 start npm --name 'glocloud' -- run dev
fi

# Save PM2 configuration
pm2 save

echo "✅ Deployment completed!"
echo "🌐 Application available at: https://cloud.glomartrealestates.com"

# Show status
pm2 status
