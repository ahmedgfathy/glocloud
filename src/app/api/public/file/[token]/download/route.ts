import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { readFile } from 'fs/promises'

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
        file: true
      }
    })

    if (!publicShare) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Check if expired
    if (publicShare.expiresAt && new Date(publicShare.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'Link has expired' }, { status: 403 })
    }

    // Check if download permission is allowed
    if (publicShare.permission === 'VIEW') {
      return NextResponse.json({ error: 'Download not allowed' }, { status: 403 })
    }

    const file = publicShare.file

    // Check if it's a folder
    if (file.isFolder) {
      return NextResponse.json({ error: 'Cannot download folder' }, { status: 400 })
    }

    try {
      // Read file from disk
      const fileBuffer = await readFile(file.path)
      
      // Return file for download
      return new Response(new Uint8Array(fileBuffer), {
        headers: {
          'Content-Type': 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${file.originalName}"`,
          'Content-Length': file.size.toString(),
          'Cache-Control': 'private, no-cache'
        }
      })
    } catch (error) {
      console.error('Error reading file:', error)
      return NextResponse.json({ error: 'File not accessible' }, { status: 500 })
    }
  } catch (error: any) {
    console.error('Error downloading public file:', error)
    return NextResponse.json(
      { error: 'Failed to download file' },
      { status: 500 }
    )
  }
}
