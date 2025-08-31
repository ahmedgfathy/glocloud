#!/bin/bash

# Nginx + SSL Setup Script for Glo Cloud
# Run this on your server (5.180.148.92)

DOMAIN="cloud.glomartrealestates.com"  # Change this to your actual domain
EMAIL="ahmed.fathy@glomartrealestates.com"  # Change this to your email

echo "🚀 Setting up Nginx + SSL for Glo Cloud..."

# Update system packages
apt update

# Install Nginx and Certbot
echo "📦 Installing Nginx and Certbot..."
apt install -y nginx certbot python3-certbot-nginx

# Create Nginx configuration for Glo Cloud
echo "📋 Creating Nginx configuration..."
cat > /etc/nginx/sites-available/glocloud << EOF
server {
    listen 80;
    server_name $DOMAIN;

    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN;

    # SSL configuration (will be added by certbot)
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # File upload size limit
    client_max_body_size 100M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static files optimization
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Enable the site
echo "🔗 Enabling Nginx site..."
ln -sf /etc/nginx/sites-available/glocloud /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
echo "🧪 Testing Nginx configuration..."
nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx configuration is valid"
    
    # Restart Nginx
    systemctl restart nginx
    systemctl enable nginx
    
    echo "🔒 Obtaining SSL certificate..."
    # Get SSL certificate from Let's Encrypt
    certbot --nginx -d $DOMAIN --email $EMAIL --agree-tos --non-interactive
    
    if [ $? -eq 0 ]; then
        echo "✅ SSL certificate installed successfully!"
        echo "🌐 Your Glo Cloud is now available at: https://$DOMAIN"
        
        # Set up automatic certificate renewal
        crontab -l 2>/dev/null | { cat; echo "0 12 * * * /usr/bin/certbot renew --quiet"; } | crontab -
        echo "✅ Automatic SSL renewal configured"
        
    else
        echo "❌ Failed to obtain SSL certificate"
        echo "Make sure:"
        echo "1. Domain $DOMAIN points to this server (5.180.148.92)"
        echo "2. Port 80 and 443 are open in firewall"
    fi
else
    echo "❌ Nginx configuration has errors"
fi

echo ""
echo "📋 Final steps:"
echo "1. Make sure your domain '$DOMAIN' points to 5.180.148.92"
echo "2. Update your application's NEXTAUTH_URL to https://$DOMAIN"
echo "3. Open firewall ports: ufw allow 80 && ufw allow 443"
echo "4. Restart your Glo Cloud application"
