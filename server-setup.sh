#!/bin/bash

# Server setup script for Glo Cloud
# Run this on your server (5.180.148.92) after extracting the app

echo "🚀 Setting up Glo Cloud on the server..."

# Install Node.js and npm (if not already installed)
echo "📦 Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    apt-get install -y nodejs
else
    echo "✅ Node.js already installed: $(node -v)"
fi

# Create database (MySQL already installed and running)
echo "📋 Creating database..."
mysql -u root -p"ZeroCall20!@HH##1655&&" -e "CREATE DATABASE IF NOT EXISTS glocloud;"

# Install PM2 for process management (if not already installed)
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    npm install -g pm2
else
    echo "✅ PM2 already installed"
fi

# Create application directory
echo "📋 Creating application directory..."
mkdir -p /var/www/glocloud
cd /var/www/glocloud

# Extract the application files
echo "📋 Extracting application..."
tar -xzf /tmp/glocloud-deployment.tar.gz

# Copy production environment
cp .env.production .env.local

# Install dependencies
npm install

# Build the application
npm run build

# Set up database schema
npx prisma db push

# Create uploads directory
mkdir -p uploads
chmod 755 uploads

# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'glocloud',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/glocloud',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
EOF

# Start the application with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo "✅ Glo Cloud setup complete!"
echo "🌐 Your app should be available at: http://5.180.148.92:3000"
echo "📋 Use 'pm2 status' to check app status"
echo "📋 Use 'pm2 logs glocloud' to view logs"
