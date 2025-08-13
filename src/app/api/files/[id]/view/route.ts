import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
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
      // Check if file is shared with user
      const share = await prisma.fileShare.findFirst({
        where: {
          fileId: fileId,
          userId: session.user.id
        }
      })

      if (!share) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    }

    // Check if file exists on disk
    if (!existsSync(file.path)) {
      return NextResponse.json({ error: 'File not found on disk' }, { status: 404 })
    }

    // Get file stats
    const fileStats = await stat(file.path)
    
    // Log view activity
    await prisma.activity.create({
      data: {
        id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        userId: session.user.id,
        fileId: fileId,
        action: 'FILE_VIEW',
        details: `Viewed file: ${file.originalName}`
      }
    })

    // Create a readable stream
    const fileStream = createReadStream(file.path)
    
    // Set appropriate headers
    const headers = new Headers()
    headers.set('Content-Type', file.mimeType || 'application/octet-stream')
    headers.set('Content-Length', fileStats.size.toString())
    headers.set('Content-Disposition', `inline; filename="${encodeURIComponent(file.originalName)}"`)
    
    // Return the file stream
    return new NextResponse(fileStream as any, {
      status: 200,
      headers
    })

  } catch (error: any) {
    console.error('Error viewing file:', error)
    return NextResponse.json(
      { error: 'Failed to view file' },
      { status: 500 }
    )
  }
}
