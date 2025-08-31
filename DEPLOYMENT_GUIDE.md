# Manual Deployment Guide for Glo Cloud

Since your server already has MySQL and iRedMail running, here's a simplified deployment process:

## 1. Server Preparation
```bash
# SSH into your server
ssh root@5.180.148.92

# Create the web directory structure
mkdir -p /var/www/glocloud
cd /var/www/glocloud

# Extract the uploaded files
tar -xzf /tmp/glocloud-deployment.tar.gz
```

## 2. Create Database
```bash
# Create the database (MySQL is already running)
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS glocloud;"
```

## 3. Install Node.js (if not already installed)
```bash
# Check if Node.js is installed
node -v

# If not installed:
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs
```

## 4. Setup Application
```bash
cd /var/www/glocloud

# Create production environment file
cat > .env.local << EOF
DATABASE_URL="mysql://root:ZeroCall20!@HH##1655&&@localhost:3306/glocloud"
NEXTAUTH_URL=http://5.180.148.92:3000
NEXTAUTH_SECRET=super-secret-nextauth-key-change-in-production-2024
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=104857600
APP_NAME=Glo Cloud
APP_URL=http://5.180.148.92:3000
NODE_ENV=production
EOF

# Install dependencies
npm install

# Build the application
npm run build

# Setup database schema
npx prisma db push

# Create uploads directory
mkdir -p uploads
chmod 755 uploads
```

## 5. Run the Application

### Option A: Direct Run (for testing)
```bash
npm run start
```

### Option B: Production with PM2
```bash
# Install PM2 if not already installed
npm install -g pm2

# Start the application
pm2 start npm --name "glocloud" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

## 6. Access Your Application
- Open browser: http://5.180.148.92:3000
- Your Glo Cloud application should be running!

## Useful Commands
```bash
# Check PM2 status
pm2 status

# View application logs
pm2 logs glocloud

# Restart application
pm2 restart glocloud

# Stop application
pm2 stop glocloud
```
