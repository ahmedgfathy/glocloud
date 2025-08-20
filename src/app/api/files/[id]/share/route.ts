import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getClientIP, getUserAgent, generateActivityId } from '@/lib/utils'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: fileId } = await params
    const body = await request.json()
    const { sharedWith, permissions = 'VIEW', expiresAt } = body

    if (!sharedWith) {
      return NextResponse.json({ error: 'sharedWith user ID is required' }, { status: 400 })
    }

    // Get file details first
    const file = await prisma.file.findUnique({
      where: { id: fileId }
    })

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Check if user owns the file or has admin rights
    if (file.ownerId !== session.user.id && session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if target user exists
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
        id: generateActivityId(),
        userId: session.user.id,
        fileId: fileId,
        action: 'FILE_SHARE',
        details: `Shared file ${file.originalName} with ${targetUser.email} (${permissions})`,
        ipAddress: getClientIP(request),
        userAgent: getUserAgent(request)
      }
    })

    return NextResponse.json({ 
      message: 'File shared successfully',
      sharedWith: targetUser.email,
      permissions
    })

  } catch (error) {
    console.error('Error sharing file:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
