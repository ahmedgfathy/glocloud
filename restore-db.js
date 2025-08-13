// Quick database restore script
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function restoreBasicData() {
  try {
    console.log('🔄 Restoring basic database data...')

    // Create company settings
    await prisma.companySettings.upsert({
      where: { id: 'default' },
      update: {},
      create: {
        id: 'default',
        companyName: 'PMS Cloud',
        primaryColor: '#2563eb',
        secondaryColor: '#1e40af',
        isConfigured: true
      }
    })
    console.log('✅ Company settings created')

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12)
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@pms.eg' },
      update: {},
      create: {
        email: 'admin@pms.eg',
        name: 'Super Admin',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        isActive: true,
        employeeId: 'ADMIN001'
      }
    })
    console.log('✅ Admin user created: admin@pms.eg / admin123')

    // Create a test employee
    const testPassword = await bcrypt.hash('test123', 12)
    await prisma.user.upsert({
      where: { email: 'test@pms.eg' },
      update: {},
      create: {
        email: 'test@pms.eg',
        name: 'Test Employee',
        password: testPassword,
        role: 'EMPLOYEE',
        isActive: true,
        employeeId: 'EMP001'
      }
    })
    console.log('✅ Test employee created: test@pms.eg / test123')

    console.log('🎉 Database restoration completed!')
    console.log('\n📋 Login Credentials:')
    console.log('Admin: admin@pms.eg / admin123')
    console.log('Employee: test@pms.eg / test123')

  } catch (error) {
    console.error('❌ Error restoring data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

restoreBasicData()
