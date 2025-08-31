import { prisma } from '@/lib/prisma';
import bcryptjs from 'bcryptjs';

export async function ensureSuperAdmin() {
  try {
    // Check if super admin already exists
    const existingSuperAdmin = await prisma.user.findFirst({
      where: { role: 'SUPER_ADMIN' }
    });

    if (existingSuperAdmin) {
      console.log('Super admin already exists');
      return existingSuperAdmin;
    }

    // Get super admin credentials from environment
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;
    const superAdminName = process.env.SUPER_ADMIN_NAME || 'Super Administrator';

    if (!superAdminEmail || !superAdminPassword) {
      console.log('Super admin credentials not found in environment variables');
      return null;
    }

    // Hash the password
    const hashedPassword = await bcryptjs.hash(superAdminPassword, 12);

    // Create super admin user
    const superAdmin = await prisma.user.create({
      data: {
        email: superAdminEmail,
        name: superAdminName,
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        isActive: true,
      },
    });

    console.log('Super admin created successfully');
    return superAdmin;
  } catch (error) {
    console.error('Error ensuring super admin:', error);
    return null;
  }
}

export async function createDefaultCompanySettings() {
  try {
    const existingSettings = await prisma.companySettings.findFirst();
    
    if (existingSettings) {
      return existingSettings;
    }

    const defaultSettings = await prisma.companySettings.create({
      data: {
        companyName: 'Glo Cloud',
        primaryColor: '#2563eb',
        secondaryColor: '#1e40af',
        isConfigured: false,
      },
    });

    console.log('Default company settings created');
    return defaultSettings;
  } catch (error) {
    console.error('Error creating default company settings:', error);
    return null;
  }
}
