import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can modify users
    if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { isActive, role } = await request.json()
    const { id: userId } = await params

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(isActive !== undefined && { isActive }),
        ...(role && { role })
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        isExternal: true
      }
    })

    // Log the admin action
    await prisma.activity.create({
      data: {
        id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        userId: session.user.id,
        action: 'USER_INVITE',
        details: `Admin ${isActive ? 'activated' : 'deactivated'} user ${updatedUser.email}`
      }
    })

    return NextResponse.json({ user: updatedUser })
  } catch (error: any) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only super admins can delete users
    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id: userId } = await params

    // Don't allow deleting yourself
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      )
    }

    // Get user info before deletion
    const userToDelete = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true }
    })

    if (!userToDelete) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id: userId }
    })

    // Log the admin action
    await prisma.activity.create({
      data: {
        id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        userId: session.user.id,
        action: 'USER_INVITE',
        details: `Super admin deleted user ${userToDelete.email}`
      }
    })

    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
