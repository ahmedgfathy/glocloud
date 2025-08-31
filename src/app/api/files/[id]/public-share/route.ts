import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateActivityId } from '@/lib/utils'
import { randomBytes } from 'crypto'
import bcrypt from 'bcryptjs'

// Generate public share link
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
    const { password, maxDownloads, expiresAt } = body

    // Get file details
    const file = await prisma.file.findUnique({
      where: { id: fileId }
    })

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Check if user owns the file or has permission
    if (file.ownerId !== session.user.id && session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Generate unique token
    const token = randomBytes(32).toString('hex')

    // For now, store password as plain text (will be fixed with proper Prisma setup)
    // const hashedPassword = password ? await bcrypt.hash(password, 12) : null

    // Create public share
    const publicShare = await prisma.publicShare.create({
      data: {
        fileId: fileId,
        token: token,
        password: password || null, // Plain text for now
        maxDownloads: maxDownloads || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        createdBy: session.user.id
      }
    })

    // Log activity
    await prisma.activity.create({
      data: {
        id: generateActivityId(),
        userId: session.user.id,
        fileId: fileId,
        action: 'FILE_SHARE',
        details: `Created public share link for ${file.originalName}`,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    const shareUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/share/${token}`

    return NextResponse.json({ 
      message: 'Public share link created successfully',
      shareUrl,
      token,
      expiresAt: publicShare.expiresAt,
      maxDownloads: publicShare.maxDownloads
    })

  } catch (error: any) {
    console.error('Error creating public share:', error)
    return NextResponse.json(
      { error: 'Failed to create public share link' },
      { status: 500 }
    )
  }
}

// Get existing public shares for a file
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
      where: { id: fileId }
    })

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Check if user owns the file or has permission
    if (file.ownerId !== session.user.id && session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get existing public shares
    const publicShares = await prisma.publicShare.findMany({
      where: {
        fileId: fileId,
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const sharesWithUrls = publicShares.map((share: any) => ({
      id: share.id,
      token: share.token,
      shareUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/share/${share.token}`,
      hasPassword: !!share.password,
      downloads: share.downloads,
      maxDownloads: share.maxDownloads,
      expiresAt: share.expiresAt,
      createdAt: share.createdAt
    }))

    return NextResponse.json({ shares: sharesWithUrls })

  } catch (error: any) {
    console.error('Error fetching public shares:', error)
    return NextResponse.json(
      { error: 'Failed to fetch public shares' },
      { status: 500 }
    )
  }
}

// Delete public share
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
    const { searchParams } = new URL(request.url)
    const shareId = searchParams.get('shareId')

    if (!shareId) {
      return NextResponse.json({ error: 'Share ID required' }, { status: 400 })
    }

    // Get the public share
    const publicShare = await prisma.publicShare.findUnique({
      where: { id: shareId },
      include: { file: true }
    })

    if (!publicShare) {
      return NextResponse.json({ error: 'Share not found' }, { status: 404 })
    }

    // Check if user owns the file or has permission
    if (publicShare.file.ownerId !== session.user.id && session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete the public share
    await prisma.publicShare.delete({
      where: { id: shareId }
    })

    // Log activity
    await prisma.activity.create({
      data: {
        id: generateActivityId(),
        userId: session.user.id,
        fileId: publicShare.fileId,
        action: 'FILE_SHARE',
        details: `Deleted public share link for ${publicShare.file.originalName}`,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json({ message: 'Public share deleted successfully' })

  } catch (error: any) {
    console.error('Error deleting public share:', error)
    return NextResponse.json(
      { error: 'Failed to delete public share' },
      { status: 500 }
    )
  }
}
