import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateActivityId } from '@/lib/utils'
import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'
import archiver from 'archiver'

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

      let isValidPassword = false
      
      // Check if the stored password is a bcrypt hash
      if (publicShare.password.startsWith('$2')) {
        // It's a bcrypt hash, use bcrypt.compare
        try {
          isValidPassword = await bcrypt.compare(password, publicShare.password);
        } catch (error: any) {
          isValidPassword = false;
        }
      } else {
        // It's plain text, use direct comparison
        isValidPassword = password === publicShare.password;
      }
      
      if (!isValidPassword) {
        return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
      }
    }

    // Increment download count
    await prisma.publicShare.update({
      where: { id: publicShare.id },
      data: {
        downloads: publicShare.downloads + 1
      }
    })

    // Log download activity
    await prisma.activity.create({
      data: {
        id: generateActivityId(),
        userId: publicShare.createdBy,
        fileId: publicShare.fileId,
        action: 'FILE_DOWNLOAD',
        details: `Public download of ${publicShare.file.originalName} via share link`,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    if (publicShare.file.isFolder) {
      // Handle folder download by creating a ZIP file
      const folderFiles = await prisma.file.findMany({
        where: {
          parentId: publicShare.file.id
        }
      })

      return new Response(
        new ReadableStream({
          start(controller) {
            const archive = archiver('zip', {
              zlib: { level: 9 }
            })

            archive.on('data', (chunk) => {
              controller.enqueue(new Uint8Array(chunk))
            })

            archive.on('end', () => {
              controller.close()
            })

            archive.on('error', (err) => {
              console.error('Archive error:', err)
              controller.error(err)
            })

            // Add files to archive
            folderFiles.forEach((file: any) => {
              const filePath = path.join(process.cwd(), file.path)
              if (fs.existsSync(filePath) && !file.isFolder) {
                archive.file(filePath, { name: file.originalName })
              }
            })

            archive.finalize()
          }
        }),
        {
          headers: {
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename="${publicShare.file.originalName}.zip"`
          }
        }
      )
    } else {
      // Handle single file download
      const filePath = path.join(process.cwd(), publicShare.file.path)

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return NextResponse.json({ error: 'File not found on server' }, { status: 404 })
      }

      // Get actual file size
      const stats = fs.statSync(filePath)
      const actualSize = stats.size

      // Read file and return
      const fileBuffer = fs.readFileSync(filePath)

      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': publicShare.file.mimeType,
          'Content-Disposition': `attachment; filename="${publicShare.file.originalName}"`,
          'Content-Length': actualSize.toString()
        }
      })
    }

  } catch (error: any) {
    console.error('Error downloading public share:', error)
    return NextResponse.json(
      { error: 'Failed to download file' },
      { status: 500 }
    )
  }
}
