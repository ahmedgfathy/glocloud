import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateActivityId } from '@/lib/utils'
import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'

// Helper function to calculate folder size
async function calculateFolderSize(folderId: string): Promise<number> {
  const files = await prisma.file.findMany({
    where: {
      parentId: folderId
    }
  })

  let totalSize = 0
  for (const file of files) {
    if (file.isFolder) {
      totalSize += await calculateFolderSize(file.id)
    } else {
      // Try to get actual file size from filesystem
      try {
        const filePath = path.join(process.cwd(), 'uploads', file.name)
        if (fs.existsSync(filePath)) {
          const stats = fs.statSync(filePath)
          totalSize += stats.size
        } else {
          totalSize += file.size
        }
      } catch {
        totalSize += file.size
      }
    }
  }
  return totalSize
}

// Get file info for public share (without password verification)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    // Find the public share
    const publicShare = await prisma.publicShare.findUnique({
      where: { 
        token: token,
        isActive: true
      },
      include: {
        file: true,
        creator: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    if (!publicShare) {
      return NextResponse.json({ error: 'Share link not found or expired' }, { status: 404 })
    }

    // Check if expired
    if (publicShare.expiresAt && new Date(publicShare.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'Share link has expired' }, { status: 410 })
    }

    // Check download limit
    if (publicShare.maxDownloads && publicShare.downloads >= publicShare.maxDownloads) {
      return NextResponse.json({ error: 'Download limit reached' }, { status: 429 })
    }

    // If password protected, return minimal info and require password
    if (publicShare.password) {
      return NextResponse.json({ 
        error: 'Password required',
        hasPassword: true 
      }, { status: 401 })
    }

    // Return file info
    return NextResponse.json({
      file: {
        id: publicShare.file.id,
        originalName: publicShare.file.originalName,
        size: publicShare.file.size,
        mimeType: publicShare.file.mimeType,
        isFolder: publicShare.file.isFolder,
        createdAt: publicShare.file.createdAt,
        hasPassword: false,
        downloads: publicShare.downloads,
        maxDownloads: publicShare.maxDownloads,
        expiresAt: publicShare.expiresAt,
        // Add calculated folder size for folders
        calculatedSize: publicShare.file.isFolder ? await calculateFolderSize(publicShare.file.id) : publicShare.file.size
      },
      sharedBy: publicShare.creator.name
    })

  } catch (error: any) {
    console.error('Error fetching public share:', error)
    return NextResponse.json(
      { error: 'Failed to fetch file information' },
      { status: 500 }
    )
  }
}

// Verify password for protected shares
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const body = await request.json()
    const { password } = body

    // Find the public share
    const publicShare = await prisma.publicShare.findUnique({
      where: { 
        token: token,
        isActive: true
      },
      include: {
        file: true,
        creator: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    if (!publicShare) {
      return NextResponse.json({ error: 'Share link not found or expired' }, { status: 404 })
    }

    // Check if expired
    if (publicShare.expiresAt && new Date(publicShare.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'Share link has expired' }, { status: 410 })
    }

    // Check download limit
    if (publicShare.maxDownloads && publicShare.downloads >= publicShare.maxDownloads) {
      return NextResponse.json({ error: 'Download limit reached' }, { status: 429 })
    }

    // Verify password if required
    if (publicShare.password) {
      if (!password) {
        return NextResponse.json({ error: 'Password required' }, { status: 400 })
      }

      const isValidPassword = await bcrypt.compare(password, publicShare.password)
      if (!isValidPassword) {
        return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
      }
    }

    // Return file info
    return NextResponse.json({
      file: {
        id: publicShare.file.id,
        originalName: publicShare.file.originalName,
        size: publicShare.file.size,
        mimeType: publicShare.file.mimeType,
        isFolder: publicShare.file.isFolder,
        createdAt: publicShare.file.createdAt,
        hasPassword: !!publicShare.password,
        downloads: publicShare.downloads,
        maxDownloads: publicShare.maxDownloads,
        expiresAt: publicShare.expiresAt,
        // Add calculated folder size for folders
        calculatedSize: publicShare.file.isFolder ? await calculateFolderSize(publicShare.file.id) : publicShare.file.size
      },
      sharedBy: publicShare.creator.name
    })

  } catch (error: any) {
    console.error('Error verifying share password:', error)
    return NextResponse.json(
      { error: 'Failed to verify password' },
      { status: 500 }
    )
  }
}
