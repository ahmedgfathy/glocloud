import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getClientIP, getUserAgent, generateActivityId } from '@/lib/utils'
import { randomBytes } from 'crypto'

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
    const { permissions = 'VIEW', expiresAt } = body

    // Get file details
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

    // Generate a unique token for the public share
    const token = randomBytes(32).toString('hex')

    // Check if public share already exists for this file
    const existingShare = await prisma.publicFileShare.findFirst({
      where: { fileId: fileId }
    })

    let publicShare
    if (existingShare) {
      // Update existing public share
      publicShare = await prisma.publicFileShare.update({
        where: { id: existingShare.id },
        data: {
          token,
          permission: permissions,
          expiresAt: expiresAt ? new Date(expiresAt) : null
        }
      })
    } else {
      // Create new public share
      publicShare = await prisma.publicFileShare.create({
        data: {
          fileId: fileId,
          token,
          permission: permissions,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
          createdById: session.user.id
        }
      })
    }

    // Generate the public URL
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const publicLink = `${baseUrl}/public/file/${token}`

    // Log the public share creation
    await prisma.activity.create({
      data: {
        id: generateActivityId(),
        userId: session.user.id,
        fileId: fileId,
        action: 'FILE_PUBLIC_SHARE',
        details: `Created public link for file: ${file.originalName} (${permissions})`,
        ipAddress: getClientIP(request),
        userAgent: getUserAgent(request)
      }
    })

    return NextResponse.json({ 
      message: 'Public link created successfully',
      publicLink,
      token,
      permissions
    })
  } catch (error: any) {
    console.error('Error creating public share:', error)
    return NextResponse.json(
      { error: 'Failed to create public link' },
      { status: 500 }
    )
  }
}

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

    // Get file details
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

    // Delete public share
    await prisma.publicFileShare.deleteMany({
      where: { fileId: fileId }
    })

    // Log the public share deletion
    await prisma.activity.create({
      data: {
        id: generateActivityId(),
        userId: session.user.id,
        fileId: fileId,
        action: 'FILE_PUBLIC_UNSHARE',
        details: `Removed public link for file: ${file.originalName}`,
        ipAddress: getClientIP(request),
        userAgent: getUserAgent(request)
      }
    })

    return NextResponse.json({ message: 'Public link removed successfully' })
  } catch (error: any) {
    console.error('Error removing public share:', error)
    return NextResponse.json(
      { error: 'Failed to remove public link' },
      { status: 500 }
    )
  }
}
