import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can change settings
    if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const settings = await request.json()
    
    // Here you would typically save settings to database or configuration file
    // For now, we'll just return success
    console.log('Settings updated:', settings)

    return NextResponse.json({ message: 'Settings saved successfully' })
  } catch (error: any) {
    console.error('Error saving settings:', error)
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can view settings
    if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Return default settings - you would typically fetch from database
    const settings = {
      maxFileSize: '100',
      allowedFileTypes: 'jpg,jpeg,png,gif,pdf,doc,docx,xls,xlsx,ppt,pptx,mp4,mov,avi,zip,rar',
      emailNotifications: true,
      autoApproveUsers: false,
      maxStoragePerUser: '1000',
      sessionTimeout: '24'
    }

    return NextResponse.json(settings)
  } catch (error: any) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}
