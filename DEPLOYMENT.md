# Glo Cloud - Deployment Guide

## 🚀 Quick Deployment from GitHub

### Local Development Workflow:

1. **Make changes locally** in VS Code
2. **Commit and push** to GitHub:
   ```bash
   git add .
   git commit -m "Your changes description"
   git push origin main
   ```

3. **Deploy on server**:
   ```bash
   ssh root@5.180.148.92
   cd /var/www/glocloud-backup-20250831
   chmod +x deploy-from-github.sh
   ./deploy-from-github.sh
   ```

### 📝 Deployment Commands for Server:

```bash
# Quick deployment (run on server)
cd /var/www/glocloud-backup-20250831 && git pull && npm install && pm2 restart glocloud

# Full deployment with backup
./deploy-from-github.sh

# Check app status
pm2 status
pm2 logs glocloud

# Restart if needed
pm2 restart glocloud
```

### 🔧 Common Modifications:

#### Environment Variables (.env.local):
- `DATABASE_URL`: Database connection
- `NEXTAUTH_URL`: Application URL
- `APP_NAME`: Application name
- `MAX_FILE_SIZE`: File upload limit

#### Application Configuration:
- `src/app/`: Main application pages
- `src/components/`: Reusable components
- `src/lib/`: Utility libraries
- `prisma/schema.prisma`: Database schema

### 📊 Server Information:

- **App Location**: `/var/www/glocloud-backup-20250831/`
- **URL**: https://cloud.glomartrealestates.com
- **Process Manager**: PM2
- **Web Server**: Nginx (reverse proxy)
- **Database**: MariaDB (local)
- **SSL**: Let's Encrypt

### 🔄 Rollback if Needed:

```bash
# Stop current app
pm2 stop glocloud

# Restore from backup
cp -r /var/www/glocloud-backup-YYYYMMDD-HHMMSS/* /var/www/glocloud-backup-20250831/

# Restart
pm2 start glocloud
```

### 🌐 Live Services:

- **Cloud App**: https://cloud.glomartrealestates.com
- **Mail Server**: https://mail.glomartrealestates.com
- **Webmail**: https://mail.glomartrealestates.com/mail/
- **Mail Admin**: https://mail.glomartrealestates.com/iredadmin/
