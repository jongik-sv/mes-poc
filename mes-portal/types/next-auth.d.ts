import 'next-auth'
import 'next-auth/jwt'

interface UserRole {
  roleId: number
  roleCd: string
  name: string
}

declare module 'next-auth' {
  interface User {
    id: string
    email: string
    name: string
    roles: UserRole[]
    permissions: string[]
  }

  interface Session {
    user: {
      id: string
      email: string
      name: string
      roles: UserRole[]
      permissions: string[]
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    roles: UserRole[]
    permissions: string[]
  }
}
