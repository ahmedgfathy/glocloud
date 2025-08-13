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

    let users;
    
    // If user is admin, show all user details
    if (session.user.role === 'SUPER_ADMIN' || session.user.role === 'ADMIN') {
      users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          isExternal: true,
          department: true,
          employeeId: true,
          mobile: true,
          phoneExt: true,
          title: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    } else {
      // For normal users, only show basic info of active users for sharing purposes
      users = await prisma.user.findMany({
        where: {
          isActive: true,
          NOT: {
            id: session.user.id // Exclude current user
          }
        },
        select: {
          id: true,
          email: true,
          name: true
        },
        orderBy: {
          name: 'asc'
        }
      })
    }

    return NextResponse.json({ users })
  } catch (error: any) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
