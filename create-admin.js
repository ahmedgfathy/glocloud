const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createSuperAdmin() {
  try {
    console.log('Creating super admin user...');
    
    const hashedPassword = await bcrypt.hash('zerocall', 12);
    
    const user = await prisma.user.create({
      data: {
        email: 'xinreal@pms.eg',
        name: 'Super Admin',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        isActive: true,
        isExternal: false
      }
    });
    
    console.log('✅ Super admin user created successfully:');
    console.log('📧 Email:', user.email);
    console.log('👤 Name:', user.name);
    console.log('🔑 Role:', user.role);
    console.log('🆔 ID:', user.id);
    console.log('✅ Active:', user.isActive);
    
    // Log the activity
    await prisma.activity.create({
      data: {
        userId: user.id,
        action: 'USER_REGISTER',
        details: 'Super admin account created via CLI script',
        ipAddress: '127.0.0.1',
        userAgent: 'CLI Script'
      }
    });
    
    console.log('📝 Activity logged successfully');
    
  } catch (error) {
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      console.log('⚠️  User with email xinreal@pms.eg already exists');
      
      // Try to find and display the existing user
      const existingUser = await prisma.user.findUnique({
        where: { email: 'xinreal@pms.eg' }
      });
      
      if (existingUser) {
        console.log('📄 Existing user details:');
        console.log('📧 Email:', existingUser.email);
        console.log('👤 Name:', existingUser.name);
        console.log('🔑 Role:', existingUser.role);
        console.log('✅ Active:', existingUser.isActive);
      }
    } else {
      console.error('❌ Error creating super admin:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createSuperAdmin();
