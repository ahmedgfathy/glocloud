#!/bin/bash
cd /home/xinreal/glocloud
export DATABASE_URL="mysql://root:zerocall@localhost:3306/pms_cloud"
export NEXTAUTH_URL="http://localhost:3000"
export NEXTAUTH_SECRET="super-secret-nextauth-key-change-in-production"

echo "🔄 Running Prisma database push..."
npx prisma db push

if [ $? -eq 0 ]; then
    echo "✅ Database migration completed successfully!"
    echo "🔄 Generating Prisma client..."
    npx prisma generate
    if [ $? -eq 0 ]; then
        echo "✅ Prisma client generated successfully!"
    else
        echo "❌ Failed to generate Prisma client"
    fi
else
    echo "❌ Database migration failed"
fi
