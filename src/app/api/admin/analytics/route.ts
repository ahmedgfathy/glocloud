import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can access analytics
    if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get analytics data
    const [totalUsers, totalFiles, totalShares, files] = await Promise.all([
      prisma.user.count(),
      prisma.file.count(),
      prisma.fileShare.count(),
      prisma.file.findMany({
        select: { size: true }
      })
    ])

    // Calculate storage used
    const storageUsed = files.reduce((total: number, file: any) => total + (file.size || 0), 0)

    // Get recent activities with user and file info
    const recentActivities = await prisma.activity.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        file: {
          select: {
            name: true
          }
        }
      }
    })

    const analytics = {
      totalUsers,
      totalFiles,
      totalShares,
      storageUsed,
      recentActivities: recentActivities.map((activity: any) => ({
        id: activity.id,
        action: activity.action,
        details: activity.details,
        ipAddress: activity.ipAddress,
        userAgent: activity.userAgent,
        createdAt: activity.createdAt,
        user: activity.user,
        file: activity.file
      }))
    }

    return NextResponse.json(analytics)
  } catch (error: any) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
