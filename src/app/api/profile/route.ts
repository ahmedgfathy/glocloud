import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getClientIP, getUserAgent, generateActivityId } from '@/lib/utils'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        isExternal: true,
        department: true,
        title: true,
        employeeId: true,
        mobile: true,
        photo: true,
        phoneExt: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error: any) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, department, title, employeeId, mobile, phoneExt, currentPassword, newPassword } = body

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Validate input
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    // Check if email is already taken by another user
    if (email !== currentUser.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      })

      if (existingUser && existingUser.id !== session.user.id) {
        return NextResponse.json(
          { error: 'Email is already taken by another user' },
          { status: 400 }
        )
      }
    }

    // Check if employee ID is already taken by another user
    if (employeeId && employeeId !== currentUser.employeeId) {
      const existingEmployee = await prisma.user.findUnique({
        where: { employeeId: employeeId }
      })

      if (existingEmployee && existingEmployee.id !== session.user.id) {
        return NextResponse.json(
          { error: 'Employee ID is already taken by another user' },
          { status: 400 }
        )
      }
    }

    // Prepare update data
    const updateData: any = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      department: department?.trim() || null,
      title: title?.trim() || null,
      employeeId: employeeId?.trim() || null,
      mobile: mobile?.trim() || null,
      phoneExt: phoneExt?.trim() || null
    }

    // Handle password change
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: 'Current password is required to change password' },
          { status: 400 }
        )
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: 'New password must be at least 6 characters long' },
          { status: 400 }
        )
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        currentUser.password
      )

      if (!isCurrentPasswordValid) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        )
      }

      // Hash new password
      updateData.password = await bcrypt.hash(newPassword, 12)
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        isExternal: true,
        department: true,
        title: true,
        employeeId: true,
        mobile: true,
        photo: true,
        phoneExt: true,
        createdAt: true,
        updatedAt: true
      }
    })

    // Log the activity with proper IP tracking
    await prisma.activity.create({
      data: {
        id: generateActivityId(),
        userId: session.user.id,
        action: 'PROFILE_UPDATE',
        details: `Profile updated: ${name !== currentUser.name ? 'name changed, ' : ''}${email !== currentUser.email ? 'email changed, ' : ''}${newPassword ? 'password changed' : ''}`.replace(/,$/, ''),
        ipAddress: getClientIP(request),
        userAgent: getUserAgent(request)
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error: any) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
