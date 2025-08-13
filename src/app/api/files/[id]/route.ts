import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getClientIP, getUserAgent, generateActivityId } from '@/lib/utils'
import { unlink } from 'fs/promises'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: fileId } = await params

    // Get file details first
    const file = await prisma.file.findUnique({
      where: { id: fileId }
    })

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Check if user owns the file or is admin
    if (file.ownerId !== session.user.id && session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete file from filesystem if it exists
    if (!file.isFolder) {
      try {
        await unlink(file.path)
      } catch (error) {
        console.log('File not found on disk, continuing with database deletion')
      }
    }

    // Delete from database (cascade will handle shares and activities)
    await prisma.file.delete({
      where: { id: fileId }
    })

    // Log the deletion
    await prisma.activity.create({
      data: {
        id: generateActivityId(),
        userId: session.user.id,
        action: 'FILE_DELETE',
        details: `Deleted ${file.isFolder ? 'folder' : 'file'}: ${file.originalName}`,
        ipAddress: getClientIP(request),
        userAgent: getUserAgent(request)
      }
    })

    return NextResponse.json({ message: 'File deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting file:', error)
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: fileId } = await params

    // Get file details
    const file = await prisma.file.findUnique({
      where: { id: fileId },
      include: {
        owner: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Check if user has access to the file
    const hasAccess = file.ownerId === session.user.id || 
                     session.user.role === 'SUPER_ADMIN' || 
                     session.user.role === 'ADMIN'

    if (!hasAccess) {
      // Check if file is shared with user
      const share = await prisma.fileShare.findFirst({
        where: {
          fileId: fileId,
          userId: session.user.id
        }
      })

      if (!share) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    // Log the view activity
    await prisma.activity.create({
      data: {
        id: generateActivityId(),
        userId: session.user.id,
        fileId: fileId,
        action: 'FILE_VIEW',
        details: `Viewed file: ${file.originalName}`,
        ipAddress: getClientIP(request),
        userAgent: getUserAgent(request)
      }
    })

    return NextResponse.json({ file })
  } catch (error: any) {
    console.error('Error getting file:', error)
    return NextResponse.json(
      { error: 'Failed to get file' },
      { status: 500 }
    )
  }
}
