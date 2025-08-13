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
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Use employeeId or fallback to user ID if employeeId is not set
    const employeeIdentifier = user.employeeId || session.user.id;

    const formData = await request.formData()
    const file = formData.get('file') as File
    const parentId = formData.get('parentId') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Get current week number
    const currentWeek = getCurrentWeekNumber();
    
    // Create employee-specific upload path: uploads/emp_{employeeId}_{userHash}/week-{weekNumber}/
    const employeeUploadPath = createEmployeeUploadPath(employeeIdentifier, session.user.id, currentWeek);
    const fullUploadDir = join(process.cwd(), employeeUploadPath);
    
    // Create directory structure if it doesn't exist
    try {
      await mkdir(fullUploadDir, { recursive: true });
    } catch (error) {
      console.error('Error creating directory:', error);
    }

    // Generate employee-specific filename
    const uniqueFilename = generateEmployeeFilename(file.name);
    const filePath = join(fullUploadDir, uniqueFilename);
    const relativePath = join(employeeUploadPath, uniqueFilename);

    // Write file to disk
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Save file metadata to database with relative path for portability
    const fileRecord = await prisma.file.create({
      data: {
        name: uniqueFilename,
        originalName: file.name,
        size: file.size,
        mimeType: file.type,
        path: relativePath, // Store relative path for portability
        ownerId: session.user.id,
        parentId: parentId || undefined
      }
    })

    // Log upload activity with week information
    await prisma.activity.create({
      data: {
        id: generateActivityId(),
        userId: session.user.id,
        fileId: fileRecord.id,
        action: 'FILE_UPLOAD',
        details: `Uploaded file: ${file.name} (Employee: ${employeeIdentifier}, Week: ${currentWeek})`,
        ipAddress: getClientIP(request),
        userAgent: getUserAgent(request)
      }
    })

    return NextResponse.json({
      message: 'File uploaded successfully',
      file: {
        id: fileRecord.id,
        name: fileRecord.originalName,
        size: fileRecord.size,
        mimeType: fileRecord.mimeType,
        createdAt: fileRecord.createdAt,
        employeeId: employeeIdentifier,
        weekNumber: currentWeek,
        path: employeeUploadPath
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
