import 'next-auth'
import 'next-auth/jwt'

interface UserRole {
  id: number
  code: string
  name: string
}

declare module 'next-auth' {
  interface User {
    id: string
    email: string
    name: string
    role: UserRole
  }

  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: UserRole
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: UserRole
  }
}
