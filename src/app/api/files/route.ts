import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const parentId = searchParams.get('parentId')

    // Get files for the current user
    const files = await prisma.file.findMany({
      where: {
        ownerId: session.user.id,
        parentId: parentId || null
      },
      include: {
        owner: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: [
        { isFolder: 'desc' }, // Folders first
        { name: 'asc' }       // Then alphabetical
      ]
    })

    return NextResponse.json({ files })
  } catch (error: any) {
    console.error('Error fetching files:', error)
    return NextResponse.json(
      { error: 'Failed to fetch files' },
      { status: 500 }
    )
  }
}
