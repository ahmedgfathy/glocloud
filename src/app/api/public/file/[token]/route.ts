import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getClientIP } from '@/lib/utils'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    // Find the public share
    const publicShare = await prisma.publicFileShare.findUnique({
      where: { token },
      include: {
        file: {
          include: {
            owner: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    })

    if (!publicShare) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Check if expired
    if (publicShare.expiresAt && new Date(publicShare.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'Link has expired' }, { status: 403 })
    }

    // Update access count and last accessed
    await prisma.publicFileShare.update({
      where: { id: publicShare.id },
      data: {
        accessCount: { increment: 1 },
        lastAccessed: new Date()
      }
    })

    // Return file information
    return NextResponse.json({
      id: publicShare.file.id,
      name: publicShare.file.name,
      originalName: publicShare.file.originalName,
      size: publicShare.file.size,
      mimeType: publicShare.file.mimeType,
      isFolder: publicShare.file.isFolder,
      createdAt: publicShare.file.createdAt,
      owner: publicShare.file.owner,
      share: {
        permission: publicShare.permission,
        expiresAt: publicShare.expiresAt,
        accessCount: publicShare.accessCount + 1
      }
    })
  } catch (error: any) {
    console.error('Error accessing public file:', error)
    return NextResponse.json(
      { error: 'Failed to access file' },
      { status: 500 }
    )
  }
}
