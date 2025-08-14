import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getClientIP, getUserAgent, generateActivityId } from '@/lib/utils'
import { createEmployeeUploadPath, generateEmployeeFilename, getCurrentWeekNumber } from '@/lib/fileUtils'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user details to access employeeId
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { employeeId: true, email: true, name: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const employeeIdentifier = user.employeeId || session.user.id
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const paths = formData.getAll('paths') as string[]
    const parentId = formData.get('parentId') as string | null

    if (!files.length) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 })
    }

    const currentWeek = getCurrentWeekNumber()
    const employeeUploadPath = createEmployeeUploadPath(employeeIdentifier, session.user.id, currentWeek)
    const fullUploadDir = join(process.cwd(), employeeUploadPath)

    // Create base directory
    await mkdir(fullUploadDir, { recursive: true })

    // Create folder structure and file mapping
    const folderMap = new Map<string, string>() // path -> folder id
    const uploadedFiles: any[] = []

    // First pass: create all folders
    const uniqueFolderPaths = new Set<string>()
    paths.forEach(path => {
      const pathParts = path.split('/')
      let currentPath = ''
      
      for (let i = 0; i < pathParts.length - 1; i++) {
        currentPath = currentPath ? `${currentPath}/${pathParts[i]}` : pathParts[i]
        uniqueFolderPaths.add(currentPath)
      }
    })

    // Sort folders by depth to create parent folders first
    const sortedFolderPaths = Array.from(uniqueFolderPaths).sort((a, b) => {
      return a.split('/').length - b.split('/').length
    })

    // Create folder records in database
    for (const folderPath of sortedFolderPaths) {
      const pathParts = folderPath.split('/')
      const folderName = pathParts[pathParts.length - 1]
      const parentPath = pathParts.slice(0, -1).join('/')
      const parentFolderId = parentPath ? folderMap.get(parentPath) : parentId

      // Create physical directory
      const physicalFolderPath = join(fullUploadDir, folderPath)
      await mkdir(physicalFolderPath, { recursive: true })

      // Create database record
      const folderRecord = await prisma.file.create({
        data: {
          name: folderName,
          originalName: folderName,
          size: 0,
          mimeType: 'application/x-directory',
          path: join(employeeUploadPath, folderPath),
          uploadPath: employeeUploadPath,
          isFolder: true,
          ownerId: session.user.id,
          parentId: parentFolderId || undefined
        }
      })

      folderMap.set(folderPath, folderRecord.id)
    }

    // Second pass: upload files to their respective folders
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const filePath = paths[i]
      
      if (!filePath) continue

      const pathParts = filePath.split('/')
      const fileName = pathParts[pathParts.length - 1]
      const folderPath = pathParts.slice(0, -1).join('/')
      const parentFolderId = folderPath ? folderMap.get(folderPath) : parentId

      // Generate unique filename and physical path
      const uniqueFilename = generateEmployeeFilename(fileName)
      const physicalFilePath = folderPath 
        ? join(fullUploadDir, folderPath, uniqueFilename)
        : join(fullUploadDir, uniqueFilename)
      
      const relativeFilePath = folderPath
        ? join(employeeUploadPath, folderPath, uniqueFilename)
        : join(employeeUploadPath, uniqueFilename)

      // Write file to disk
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await writeFile(physicalFilePath, buffer)

      // Create database record
      const fileRecord = await prisma.file.create({
        data: {
          name: uniqueFilename,
          originalName: fileName,
          size: file.size,
          mimeType: file.type,
          path: relativeFilePath,
          uploadPath: employeeUploadPath,
          isFolder: false,
          ownerId: session.user.id,
          parentId: parentFolderId || undefined
        }
      })

      uploadedFiles.push({
        id: fileRecord.id,
        name: fileRecord.originalName,
        size: fileRecord.size,
        mimeType: fileRecord.mimeType,
        path: filePath
      })
    }

    // Log folder upload activity
    await prisma.activity.create({
      data: {
        id: generateActivityId(),
        userId: session.user.id,
        action: 'FOLDER_CREATE',
        details: `Uploaded folder structure with ${files.length} files (Employee: ${employeeIdentifier}, Week: ${currentWeek})`,
        ipAddress: getClientIP(request),
        userAgent: getUserAgent(request)
      }
    })

    return NextResponse.json({
      message: 'Folder uploaded successfully',
      foldersCreated: sortedFolderPaths.length,
      filesUploaded: files.length,
      files: uploadedFiles,
      employeeId: employeeIdentifier,
      weekNumber: currentWeek,
      uploadPath: employeeUploadPath
    })

  } catch (error) {
    console.error('Folder upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload folder' },
      { status: 500 }
    )
  }
}
