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

    // Only admins and super admins can view the organized structure
    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')
    const weekNumber = searchParams.get('week')

    // Get all files with user information
    const whereClause: any = {}
    
    if (employeeId) {
      // Find user by employeeId
      const user = await prisma.user.findFirst({
        where: { employeeId: employeeId }
      })
      if (user) {
        whereClause.ownerId = user.id
      }
    }

    const files = await prisma.file.findMany({
      where: whereClause,
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
        { createdAt: 'desc' }
      ]
    })

    // Organize files by employee and week
    const organizedFiles: { [employeeId: string]: { [week: string]: any[] } } = {}

    files.forEach(file => {
      const empId = file.owner.employeeId || file.owner.id
      const fileWeek = getWeekNumber(file.createdAt)
      
      // Filter by week if specified
      if (weekNumber && fileWeek !== parseInt(weekNumber)) {
        return
      }

      if (!organizedFiles[empId]) {
        organizedFiles[empId] = {}
      }

      const weekKey = `week-${fileWeek}`
      if (!organizedFiles[empId][weekKey]) {
        organizedFiles[empId][weekKey] = []
      }

      organizedFiles[empId][weekKey].push({
        ...file,
        weekNumber: fileWeek,
        uploadPath: file.path
      })
    })

    // Convert to array format for easier frontend handling
    const result = Object.entries(organizedFiles).map(([empId, weeks]) => ({
      employeeId: empId,
      employee: files.find(f => (f.owner.employeeId || f.owner.id) === empId)?.owner,
      weeks: Object.entries(weeks).map(([weekKey, weekFiles]) => ({
        weekNumber: parseInt(weekKey.replace('week-', '')),
        weekKey,
        files: weekFiles,
        fileCount: weekFiles.length,
        totalSize: weekFiles.reduce((sum, f) => sum + f.size, 0)
      })).sort((a, b) => b.weekNumber - a.weekNumber) // Latest weeks first
    })).sort((a, b) => a.employeeId.localeCompare(b.employeeId))

    return NextResponse.json({ 
      organizedFiles: result,
      totalEmployees: result.length,
      totalFiles: files.length
    })
  } catch (error: any) {
    console.error('Error fetching organized files:', error)
    return NextResponse.json(
      { error: 'Failed to fetch organized files' },
      { status: 500 }
    )
  }
}
