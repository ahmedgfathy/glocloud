import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; action: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: fileId, action } = await params

    // Get file details
    const file = await prisma.file.findUnique({
      where: { id: fileId }
    })

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Generate short activity ID
    const activityId = `act_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`

    switch (action) {
      case 'view':
        // Log view activity
        await prisma.activity.create({
          data: {
            id: activityId,
            userId: session.user.id,
            fileId: fileId,
            action: 'FILE_DOWNLOAD',
            details: `Viewed file: ${file.originalName}`
          }
        })
        
        return NextResponse.json({ 
          message: 'File view logged',
          file: {
            id: file.id,
            name: file.originalName,
            size: file.size,
            mimeType: file.mimeType,
            isFolder: file.isFolder
          }
        })

      case 'share':
        // Handle actual file sharing
        const body = await request.json()
        const { sharedWith, permissions = 'VIEW', expiresAt } = body

        if (!sharedWith) {
          return NextResponse.json({ error: 'sharedWith user ID is required' }, { status: 400 })
        }

        // Check if user exists
        const targetUser = await prisma.user.findUnique({
          where: { id: sharedWith }
        })

        if (!targetUser) {
          return NextResponse.json({ error: 'Target user not found' }, { status: 404 })
        }

        // Check if file is already shared with this user
        const existingShare = await prisma.fileShare.findFirst({
          where: {
            fileId: fileId,
            userId: sharedWith
          }
        })

        if (existingShare) {
          // Update existing share
          await prisma.fileShare.update({
            where: { id: existingShare.id },
            data: {
              permission: permissions
            }
          })
        } else {
          // Create new share
          await prisma.fileShare.create({
            data: {
              fileId: fileId,
              userId: sharedWith,
              permission: permissions
            }
          })
        }

        // Log sharing activity
        await prisma.activity.create({
          data: {
            id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            userId: session.user.id,
            fileId: fileId,
            action: 'FILE_SHARE',
            details: `Shared file ${file.originalName} with ${targetUser.email} (${permissions})`
          }
        })

        return NextResponse.json({ 
          message: 'File shared successfully',
          sharedWith: targetUser.email,
          permissions
        })

      case 'delete':
        // Check if user owns the file or is admin
        if (file.ownerId !== session.user.id && session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN') {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Delete file from database
        await prisma.file.delete({
          where: { id: fileId }
        })

        // Log deletion
        await prisma.activity.create({
          data: {
            id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            userId: session.user.id,
            action: 'FILE_DELETE',
            details: `Deleted ${file.isFolder ? 'folder' : 'file'}: ${file.originalName}`
          }
        })

        return NextResponse.json({ message: 'File deleted successfully' })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error: any) {
    const resolvedParams = await params
    console.error(`Error ${resolvedParams.action} file:`, error)
    return NextResponse.json(
      { error: `Failed to ${resolvedParams.action} file` },
      { status: 500 }
    )
  }
}
