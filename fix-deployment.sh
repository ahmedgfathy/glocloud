#!/bin/bash
echo "🔧 Fixing Glo Cloud deployment..."

# Stop any running PM2 process
pm2 stop glocloud 2>/dev/null || true
pm2 delete glocloud 2>/dev/null || true

# Create the proper directory structure
mkdir -p /var/www/glocloud
cd /var/www/glocloud

# Extract the application files
echo "📦 Extracting application files..."
tar -xzf /tmp/glocloud-deployment.tar.gz

# Verify files are extracted
echo "📋 Checking extracted files..."
ls -la

# Create environment file
echo "🔧 Creating environment configuration..."
cat > .env.local << 'ENVEOF'
DATABASE_URL="mysql://root:ZeroCall20!@HH##1655&&@localhost:3306/glocloud"
NEXTAUTH_URL=http://5.180.148.92:3000
NEXTAUTH_SECRET=super-secret-nextauth-key-change-in-production-2024
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=104857600
APP_NAME=Glo Cloud
APP_URL=http://5.180.148.92:3000
NODE_ENV=production
ENVEOF

echo "✅ Environment file created"
