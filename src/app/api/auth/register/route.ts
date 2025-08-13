import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    console.log('Registration attempt started')
    
    const body = await request.json()
    const { name, email, password } = body
    
    console.log('Registration data received:', { name, email, passwordLength: password?.length })

    // Validate input
    if (!name || !email || !password) {
      console.log('Validation failed: missing fields')
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      console.log('Validation failed: password too short')
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.log('Validation failed: invalid email format')
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    console.log('Checking for existing user...')
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingUser) {
      console.log('User already exists with email:', email)
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    console.log('Hashing password...')
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    console.log('Creating user in database...')
    
    // Generate a simple ID (fallback if cuid() doesn't work)
    const userId = Date.now().toString() + Math.random().toString(36).substr(2, 6)

    // Create user (inactive by default, waiting for admin approval)
    const user = await prisma.user.create({
      data: {
        id: userId,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        isActive: false, // Admin needs to activate
        isExternal: false,
        role: 'EMPLOYEE'
      }
    })

    console.log('User created successfully:', user.id)

    // Log registration activity
    try {
      await prisma.activity.create({
        data: {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 6),
          userId: user.id,
          action: 'USER_INVITE',
          details: 'User registered and waiting for approval',
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown'
        }
      })
      console.log('Activity logged successfully')
    } catch (activityError) {
      console.error('Failed to log activity:', activityError)
      // Don't fail the registration if activity logging fails
    }

    return NextResponse.json(
      { 
        message: 'Registration successful. Please wait for admin approval.',
        userId: user.id 
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Registration error details:', {
      message: error?.message || 'Unknown error',
      stack: error?.stack,
      name: error?.name,
      code: error?.code
    })
    
    // Provide more specific error messages based on the error type
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 400 }
      )
    }
    
    if (error?.message?.includes('connect')) {
      return NextResponse.json(
        { error: 'Database connection error. Please try again later.' },
        { status: 503 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Registration failed. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined
      },
      { status: 500 }
    )
  }
}
