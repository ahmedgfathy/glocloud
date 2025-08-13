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
        select: { size: true, name: true, mimeType: true }
      })
    ])

    // Calculate storage used
    const storageUsed = files.reduce((total: number, file: any) => total + (file.size || 0), 0)

    // Calculate file type statistics
    const fileTypeStats = files.reduce((stats: any, file: any) => {
      const extension = file.name.split('.').pop()?.toLowerCase() || 'unknown'
      const mimeType = file.mimeType || 'unknown'
      
      let category = 'misc'
      
      // Define file type categories
      if (['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'].includes(extension) || 
          mimeType.includes('document') || mimeType.includes('text')) {
        category = 'documents'
      } else if (['xls', 'xlsx', 'csv', 'ods'].includes(extension) || 
                 mimeType.includes('spreadsheet')) {
        category = 'excel'
      } else if (['db', 'sql', 'sqlite', 'mdb'].includes(extension) || 
                 mimeType.includes('database')) {
        category = 'database'
      } else if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'tiff'].includes(extension) || 
                 mimeType.includes('image')) {
        category = 'images'
      } else if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', '3gp'].includes(extension) || 
                 mimeType.includes('video')) {
        category = 'videos'
      } else if (['mp3', 'wav', 'flac', 'aac', 'm4a', 'ogg'].includes(extension) || 
                 mimeType.includes('audio')) {
        category = 'audio'
      } else if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(extension) || 
                 mimeType.includes('archive') || mimeType.includes('compressed')) {
        category = 'archives'
      }
      
      stats[category] = (stats[category] || 0) + 1
      return stats
    }, {})

    // Convert to array format for charts
    const fileTypeArray = Object.entries(fileTypeStats).map(([type, count]) => ({
      type: type.charAt(0).toUpperCase() + type.slice(1),
      count: count as number,
      percentage: totalFiles > 0 ? Math.round(((count as number) / totalFiles) * 100) : 0
    })).sort((a, b) => (b.count as number) - (a.count as number))

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
      fileTypeStats: fileTypeArray,
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
