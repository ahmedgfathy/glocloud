const { PrismaClient } = require('@prisma/client');
const bcryptjs = require('bcryptjs');

const prisma = new PrismaClient();

async function setupApplication() {
  try {
    console.log('🚀 Starting Glo Cloud application setup...\n');

    // Create super admin
    console.log('👑 Setting up Super Admin...');
    
    const existingSuperAdmin = await prisma.user.findFirst({
      where: { role: 'SUPER_ADMIN' }
    });

    if (existingSuperAdmin) {
      console.log('✅ Super admin already exists:', existingSuperAdmin.email);
    } else {
      const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
      const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;
      const superAdminName = process.env.SUPER_ADMIN_NAME || 'Super Administrator';

      if (!superAdminEmail || !superAdminPassword) {
        console.log('❌ Super admin credentials not found in environment variables');
        console.log('Please set SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD in your .env file');
        return;
      }

      const hashedPassword = await bcryptjs.hash(superAdminPassword, 12);

      const superAdmin = await prisma.user.create({
        data: {
          email: superAdminEmail,
          name: superAdminName,
          password: hashedPassword,
          role: 'SUPER_ADMIN',
          isActive: true,
        },
      });

      console.log('✅ Super admin created successfully:', superAdmin.email);
    }

    // Create default company settings
    console.log('\n🏢 Setting up Company Settings...');
    
    const existingSettings = await prisma.companySettings.findFirst();
    
    if (existingSettings) {
      console.log('✅ Company settings already exist');
    } else {
      const defaultSettings = await prisma.companySettings.create({
        data: {
          companyName: 'Glo Cloud',
          primaryColor: '#2563eb',
          secondaryColor: '#1e40af',
          isConfigured: false,
        },
      });

      console.log('✅ Default company settings created');
    }

    console.log('\n🎉 Setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Start the development server: npm run dev');
    console.log('2. Login with your super admin credentials');
    console.log('3. Go to Admin > Company Settings to customize your branding');
    console.log('4. Add users and start using the system!');

  } catch (error) {
    console.error('❌ Setup failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupApplication();
