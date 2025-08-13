import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find files shared with the current user
    const sharedFiles = await prisma.fileShare.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        file: {
          select: {
            id: true,
            name: true,
            originalName: true,
            size: true,
            mimeType: true,
            isFolder: true,
            createdAt: true,
            updatedAt: true,
            owner: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform the data to match the frontend interface
    const transformedFiles = sharedFiles.map((share: any) => ({
      id: share.file.id,
      name: share.file.name,
      originalName: share.file.originalName,
      size: share.file.size,
      mimeType: share.file.mimeType,
      isFolder: share.file.isFolder,
      createdAt: share.file.createdAt.toISOString(),
      share: {
        id: share.id,
        sharedBy: {
          name: share.file.owner.name,
          email: share.file.owner.email
        },
        permission: share.permission
      }
    }))

    return NextResponse.json(transformedFiles)
  } catch (error) {
    console.error('Error fetching shared files:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
