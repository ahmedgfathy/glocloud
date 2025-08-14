const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function debugPasswords() {
  try {
    console.log('🔍 Debugging password verification issue...\n');
    
    // Get all public shares
    const shares = await prisma.publicShare.findMany({
      select: {
        id: true,
        token: true,
        password: true,
        file: {
          select: {
            originalName: true
          }
        }
      }
    });
    
    console.log(`Found ${shares.length} public shares:\n`);
    
    for (let i = 0; i < shares.length; i++) {
      const share = shares[i];
      console.log(`--- Share ${i + 1} ---`);
      console.log('File:', share.file.originalName);
      console.log('Token:', share.token.substring(0, 20) + '...');
      console.log('Password in DB:', share.password);
      console.log('Password length:', share.password?.length);
      console.log('Starts with $2:', share.password?.startsWith('$2'));
      
      // Test password verification
      if (share.password) {
        const testPassword = 'test';
        console.log('\n🧪 Testing password verification:');
        console.log('Test password:', testPassword);
        
        // Try bcrypt
        try {
          const bcryptResult = await bcrypt.compare(testPassword, share.password);
          console.log('bcrypt.compare result:', bcryptResult);
        } catch (error) {
          console.log('bcrypt.compare error:', error.message);
        }
        
        // Try plain text
        const plainResult = testPassword === share.password;
        console.log('Plain text comparison:', plainResult);
        
        // Test with common passwords
        const commonPasswords = ['123', '1234', 'password', 'admin', share.password];
        console.log('\n🔑 Testing common passwords:');
        for (const pwd of commonPasswords) {
          try {
            const bcryptTest = await bcrypt.compare(pwd, share.password);
            const plainTest = pwd === share.password;
            console.log(`Password "${pwd}": bcrypt=${bcryptTest}, plain=${plainTest}`);
          } catch (error) {
            console.log(`Password "${pwd}": bcrypt=error, plain=${pwd === share.password}`);
          }
        }
      }
      
      console.log('\n' + '='.repeat(50) + '\n');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugPasswords();
