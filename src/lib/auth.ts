import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import { generateActivityId } from '@/lib/utils'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.isActive) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        // Log login activity
        await prisma.activity.create({
          data: {
            id: generateActivityId(),
            userId: user.id,
            action: 'LOGIN',
            details: 'User logged in successfully',
            ipAddress: 'unknown', // Will be updated by middleware
            userAgent: 'unknown'  // Will be updated by middleware
          }
        })

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isExternal: user.isExternal,
          employeeId: user.employeeId
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.isExternal = (user as any).isExternal
        token.employeeId = (user as any).employeeId
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.isExternal = token.isExternal as boolean
        session.user.employeeId = token.employeeId as string
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin'
  }
}
