require('dotenv').config({ path: '.env.local' })
const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function fixFileSizes() {
  try {
    console.log('🔍 Checking and fixing file sizes in database...')
    
    // Get all files from database
    const files = await prisma.file.findMany({
      where: {
        isFolder: false // Only check actual files, not folders
      }
    })
    
    console.log(`📁 Found ${files.length} files in database`)
    
    let fixedCount = 0
    let totalSize = 0
    
    for (const file of files) {
      try {
        let filePath = ''
        
        // Handle both old and new path formats
        if (file.path.startsWith('/')) {
          // Old absolute path format
          filePath = path.join(process.cwd(), file.path.substring(1))
        } else {
          // New relative path format
          filePath = path.join(process.cwd(), file.path)
        }
        
        // Check if file exists on disk
        if (fs.existsSync(filePath)) {
          const stats = fs.statSync(filePath)
          const actualSize = stats.size
          
          // Update database if size is different
          if (file.size !== actualSize) {
            await prisma.file.update({
              where: { id: file.id },
              data: { size: actualSize }
            })
            
            console.log(`✅ Fixed ${file.originalName}: ${file.size} → ${actualSize} bytes (${(actualSize / (1024*1024)).toFixed(2)} MB)`)
            fixedCount++
          }
          
          totalSize += actualSize
        } else {
          console.log(`⚠️  File not found on disk: ${file.originalName} (${file.path})`)
        }
      } catch (error) {
        console.error(`❌ Error processing ${file.originalName}:`, error.message)
      }
    }
    
    console.log(`\n📊 Summary:`)
    console.log(`- Fixed ${fixedCount} files`)
    console.log(`- Total storage used: ${(totalSize / (1024*1024)).toFixed(2)} MB`)
    console.log(`- Average file size: ${files.length > 0 ? (totalSize / files.length / 1024).toFixed(2) : 0} KB`)
    
    // Also check for files in uploads directory that are not in database
    const uploadsDir = path.join(process.cwd(), 'uploads')
    if (fs.existsSync(uploadsDir)) {
      const diskFiles = fs.readdirSync(uploadsDir, { withFileTypes: true })
        .filter(dirent => dirent.isFile())
        .map(dirent => dirent.name)
      
      const dbFileNames = files.map(f => f.name)
      const orphanFiles = diskFiles.filter(fileName => !dbFileNames.includes(fileName))
      
      if (orphanFiles.length > 0) {
        console.log(`\n🧹 Found ${orphanFiles.length} orphan files on disk (not in database):`)
        orphanFiles.forEach(fileName => {
          const filePath = path.join(uploadsDir, fileName)
          const stats = fs.statSync(filePath)
          console.log(`- ${fileName}: ${(stats.size / (1024*1024)).toFixed(2)} MB`)
        })
      }
    }
    
  } catch (error) {
    console.error('❌ Error fixing file sizes:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixFileSizes()
