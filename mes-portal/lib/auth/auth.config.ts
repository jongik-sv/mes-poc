import bcrypt from 'bcrypt'
import { prisma } from '@/lib/prisma'
import type { JWT } from 'next-auth/jwt'

interface UserRole {
  roleId: number
  roleCd: string
  name: string
}

interface AuthUser {
  id: string
  email: string
  name: string
  roles: UserRole[]
  permissions: string[]
}

interface Credentials {
  email?: string
  password?: string
}

/**
 * Permission config JSON 구조
 */
interface PermissionConfig {
  actions: ('CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'EXPORT' | 'IMPORT')[]
  fieldConstraints?: { [fieldName: string]: string | string[] }
}

/**
 * Credentials 인증 로직
 * @param credentials 이메일/비밀번호
 * @returns 인증된 사용자 정보 또는 null
 */
export async function authorizeCredentials(
  credentials: Credentials
): Promise<AuthUser | null> {
  if (!credentials?.email || !credentials?.password) {
    return null
  }

  // User → UserRoleGroup → RoleGroup → RoleGroupRole → Role → RolePermission → Permission
  const user = await prisma.user.findUnique({
    where: { email: credentials.email },
    include: {
      userRoleGroups: {
        include: {
          roleGroup: {
            include: {
              roleGroupRoles: {
                include: {
                  role: {
                    include: {
                      rolePermissions: {
                        include: {
                          permission: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  })

  if (!user) {
    return null
  }

  if (!user.isActive) {
    return null
  }

  const isValidPassword = await bcrypt.compare(
    credentials.password,
    user.password
  )

  if (!isValidPassword) {
    return null
  }

  // 역할 목록 추출 (중복 제거)
  const roleMap = new Map<number, UserRole>()
  user.userRoleGroups.forEach((urg) => {
    urg.roleGroup.roleGroupRoles.forEach((rgr) => {
      const role = rgr.role
      if (!roleMap.has(role.roleId)) {
        roleMap.set(role.roleId, {
          roleId: role.roleId,
          roleCd: role.roleCd,
          name: role.name,
        })
      }
    })
  })
  const roles = Array.from(roleMap.values())

  // 권한 목록 추출 (Permission.config JSON 파싱)
  const permissionsSet = new Set<string>()
  user.userRoleGroups.forEach((urg) => {
    urg.roleGroup.roleGroupRoles.forEach((rgr) => {
      const role = rgr.role
      // SYSTEM_ADMIN 역할은 모든 권한 부여
      if (role.roleCd === 'SYSTEM_ADMIN') {
        permissionsSet.add('*')
      }
      role.rolePermissions.forEach((rp) => {
        const permission = rp.permission
        try {
          const config: PermissionConfig = JSON.parse(permission.config)
          config.actions.forEach((action) => {
            // menuId 기반 권한 코드: "menuId:action" 형식
            if (permission.menuId) {
              permissionsSet.add(`${permission.menuId}:${action.toLowerCase()}`)
            }
            // permissionCd 기반 권한 코드도 추가
            permissionsSet.add(`${permission.permissionCd}:${action.toLowerCase()}`)
          })
        } catch {
          // config JSON 파싱 실패 시 무시
        }
      })
    })
  })

  return {
    id: user.userId,
    email: user.email,
    name: user.name,
    roles,
    permissions: Array.from(permissionsSet),
  }
}

/**
 * JWT 콜백 - 토큰에 사용자 정보 추가
 */
export async function jwtCallback({
  token,
  user,
}: {
  token: JWT
  user?: AuthUser
}): Promise<JWT> {
  if (user) {
    token.id = user.id
    token.roles = user.roles
    token.permissions = user.permissions
  }
  return token
}

/**
 * 세션 콜백 - 세션에 사용자 정보 추가
 */
export async function sessionCallback({
  session,
  token,
}: {
  session: { user: AuthUser; expires: string }
  token: JWT
}): Promise<{ user: AuthUser; expires: string }> {
  if (token) {
    session.user.id = token.id as string
    session.user.roles = token.roles as UserRole[]
    session.user.permissions = token.permissions as string[]
  }
  return session
}
