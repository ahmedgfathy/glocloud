const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testSharedFiles() {
  console.log('=== Testing Shared Files API ===')
  
  try {
    // Get user ahmed.fathy@pms.eg
    const user = await prisma.user.findUnique({
      where: { email: 'ahmed.fathy@pms.eg' }
    })
    
    if (!user) {
      console.log('User ahmed.fathy@pms.eg not found')
      return
    }
    
    console.log('User found:', user.email, 'ID:', user.id)
    
    // Check shared files count
    const sharedFiles = await prisma.fileShare.findMany({
      where: { userId: user.id },
      include: {
        file: {
          select: { originalName: true, owner: { select: { email: true } } }
        }
      }
    })
    
    console.log('\nShared files count:', sharedFiles.length)
    console.log('Shared files:')
    sharedFiles.forEach((share, index) => {
      console.log(`${index + 1}. ${share.file.originalName} (shared by ${share.file.owner.email})`)
    })
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testSharedFiles()
