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

    const file = publicShare.file

    // Check if it's a folder
    if (file.isFolder) {
      return NextResponse.json({ error: 'Cannot view folder' }, { status: 400 })
    }

    try {
      // Read file from disk
      const fileBuffer = await readFile(file.path)
      
      // Determine content type
      const contentType = file.mimeType || 'application/octet-stream'
      
      // Return file content for viewing
      return new Response(new Uint8Array(fileBuffer), {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `inline; filename="${file.originalName}"`,
          'Cache-Control': 'private, no-cache'
        }
      })
    } catch (error) {
      console.error('Error reading file:', error)
      return NextResponse.json({ error: 'File not accessible' }, { status: 500 })
    }
  } catch (error: any) {
    console.error('Error viewing public file:', error)
    return NextResponse.json(
      { error: 'Failed to view file' },
      { status: 500 }
    )
  }
}
