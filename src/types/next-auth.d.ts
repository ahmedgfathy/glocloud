import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
      isExternal: boolean
      employeeId?: string
    } & DefaultSession['user']
  }

  interface User {
    role: string
    isExternal: boolean
    employeeId?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string
    isExternal: boolean
    employeeId?: string
  }
}
