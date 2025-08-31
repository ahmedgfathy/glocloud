import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getWeekNumber } from '@/lib/fileUtils'

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
            id: true,
            name: true,
            email: true,
            employeeId: true
          }
        }
      },
      orderBy: [
        { isFolder: 'desc' }, // Folders first
        { name: 'asc' }       // Then alphabetical
      ]
    })

    // Add week number calculation for files with structured paths
    const filesWithWeekInfo = files.map((file: any) => ({
      ...file,
      weekNumber: file.uploadPath ? getWeekNumber(file.createdAt) : null
    }))

    return NextResponse.json({ files: filesWithWeekInfo })
  } catch (error: any) {
    console.error('Error fetching files:', error)
    return NextResponse.json(
      { error: 'Failed to fetch files' },
      { status: 500 }
    )
  }
}
