#!/bin/bash

echo "🔧 Fixing Glo Cloud build issues..."

# Navigate to project directory
cd /var/www/glocloud

# Create proper environment file with escaped characters
echo "🔧 Creating environment file..."
cat > .env.local << 'EOF'
DATABASE_URL=mysql://root:ZeroCall20\!\@HH\#\#1655\&\&@localhost:3306/glocloud
NEXTAUTH_URL=http://5.180.148.92:3000
NEXTAUTH_SECRET=super-secret-nextauth-key-change-in-production-2024
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=104857600
APP_NAME=Glo Cloud
APP_URL=http://5.180.148.92:3000
NODE_ENV=production
EOF

echo "✅ Environment file created"

# Remove the problematic backup file to avoid TypeScript errors
echo "🗑️ Removing backup files that cause build errors..."
rm -f src/app/admin/files/page-backup.tsx
rm -f src/app/profile/page.tsx.broken

echo "🏗️ Building the application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    echo "📋 Setting up database..."
    npx prisma db push
    
    echo "📁 Creating uploads directory..."
    mkdir -p uploads
    chmod 755 uploads
    
    echo "🚀 Starting the application..."
    npm run start
else
    echo "❌ Build failed. Please check the errors above."
fi
