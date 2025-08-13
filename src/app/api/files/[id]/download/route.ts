import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getClientIP, getUserAgent, generateActivityId } from '@/lib/utils'
import { createReadStream, existsSync } from 'fs'
import { stat } from 'fs/promises'

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

    // Check if user has access to the file
    const hasAccess = file.ownerId === session.user.id || 
                     session.user.role === 'SUPER_ADMIN' || 
                     session.user.role === 'ADMIN'

    if (!hasAccess) {
      // Check if file is shared with user (with download permission)
      const share = await prisma.fileShare.findFirst({
        where: {
          fileId: fileId,
          userId: session.user.id,
          permission: {
            in: ['EDIT', 'FULL_ACCESS']
          }
        }
      })

      if (!share) {
        return NextResponse.json({ error: 'Download access denied' }, { status: 403 })
      }
    }

    // Check if file exists on disk
    if (!existsSync(file.path)) {
      return NextResponse.json({ error: 'File not found on disk' }, { status: 404 })
    }

    // Get file stats
    const fileStats = await stat(file.path)
    
    // Log download activity
    await prisma.activity.create({
      data: {
        id: generateActivityId(),
        userId: session.user.id,
        fileId: fileId,
        action: 'FILE_DOWNLOAD',
        details: `Downloaded file: ${file.originalName}`,
        ipAddress: getClientIP(request),
        userAgent: getUserAgent(request)
      }
    })

    // Create a readable stream
    const fileStream = createReadStream(file.path)
    
    // Set appropriate headers for download
    const headers = new Headers()
    headers.set('Content-Type', 'application/octet-stream')
    headers.set('Content-Length', fileStats.size.toString())
    headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(file.originalName)}"`)
    
    // Return the file stream
    return new NextResponse(fileStream as any, {
      status: 200,
      headers
    })

  } catch (error: any) {
    console.error('Error downloading file:', error)
    return NextResponse.json(
      { error: 'Failed to download file' },
      { status: 500 }
    )
  }
}
