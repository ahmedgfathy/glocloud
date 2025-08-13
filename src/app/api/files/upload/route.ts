import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const parentId = formData.get('parentId') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Create upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'uploads')
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (error) {
      // Directory might already exist
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop()
    const uniqueFilename = `${uuidv4()}.${fileExtension}`
    const filePath = join(uploadDir, uniqueFilename)

    // Write file to disk
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Save file metadata to database
    const fileRecord = await prisma.file.create({
      data: {
        name: uniqueFilename,
        originalName: file.name,
        size: file.size,
        mimeType: file.type,
        path: filePath,
        ownerId: session.user.id,
        parentId: parentId || undefined
      }
    })

    // Log upload activity
    await prisma.activity.create({
      data: {
        userId: session.user.id,
        fileId: fileRecord.id,
        action: 'FILE_UPLOAD',
        details: `Uploaded file: ${file.name}`
      }
    })

    return NextResponse.json({
      message: 'File uploaded successfully',
      file: {
        id: fileRecord.id,
        name: fileRecord.originalName,
        size: fileRecord.size,
        mimeType: fileRecord.mimeType,
        createdAt: fileRecord.createdAt
      }
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}
