/**
 * API 권한 체크 가드 (RBAC 재설계)
 *
 * API 라우트에서 사용하는 권한 체크 유틸리티
 */

import { NextResponse } from 'next/server'
import { Session } from 'next-auth'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import { hasPermission, type Actions, type Subjects } from './ability'
import { getUserMergedPermissions } from './permission-merge'

/**
 * API 응답 형식
 */
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
}

/**
 * 인증 확인 결과
 */
interface AuthResult {
  session: Session
  userId: string
}

/**
 * Permission config JSON 구조
 */
interface PermissionConfig {
  actions: ('CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'EXPORT' | 'IMPORT')[]
  fieldConstraints?: { [fieldName: string]: string | string[] }
}

/**
 * 인증 체크
 * 인증되지 않은 경우 401 응답 반환
 */
export async function requireAuth(): Promise<
  { ok: true; data: AuthResult } | { ok: false; response: NextResponse<ApiResponse<never>> }
> {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다' },
        },
        { status: 401 }
      ),
    }
  }

  return {
    ok: true,
    data: {
      session,
      userId: session.user.id,
    },
  }
}

/**
 * 관리자 권한 확인
 * 관리자가 아닌 경우 403 응답 반환
 */
export async function requireAdmin(
  userId: string
): Promise<{ ok: true } | { ok: false; response: NextResponse<ApiResponse<never>> }> {
  const user = await prisma.user.findUnique({
    where: { userId },
    include: {
      userRoleGroups: {
        include: {
          roleGroup: {
            include: {
              roleGroupRoles: {
                include: { role: true },
              },
            },
          },
        },
      },
    },
  })

  const isAdmin = user?.userRoleGroups.some((urg) =>
    urg.roleGroup.roleGroupRoles.some((rgr) => rgr.role.roleCd === 'SYSTEM_ADMIN')
  )

  if (!isAdmin) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          success: false,
          error: { code: 'FORBIDDEN', message: '관리자 권한이 필요합니다' },
        },
        { status: 403 }
      ),
    }
  }

  return { ok: true }
}

/**
 * 특정 권한 확인
 * 권한이 없는 경우 403 응답 반환
 *
 * @param userId - 사용자 ID (사번)
 * @param action - 확인할 액션
 * @param subject - 확인할 리소스 (menuId 문자열 또는 permissionCd)
 */
export async function requirePermission(
  userId: string,
  action: Actions,
  subject: Subjects
): Promise<{ ok: true } | { ok: false; response: NextResponse<ApiResponse<never>> }> {
  const user = await prisma.user.findUnique({
    where: { userId },
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
                        include: { permission: true },
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
    return {
      ok: false,
      response: NextResponse.json(
        {
          success: false,
          error: { code: 'USER_NOT_FOUND', message: '사용자를 찾을 수 없습니다' },
        },
        { status: 404 }
      ),
    }
  }

  // 사용자의 모든 권한 수집
  const permissions: string[] = []
  user.userRoleGroups.forEach((urg) => {
    urg.roleGroup.roleGroupRoles.forEach((rgr) => {
      const role = rgr.role
      // SYSTEM_ADMIN 역할 확인 (모든 권한)
      if (role.roleCd === 'SYSTEM_ADMIN') {
        permissions.push('*')
      }
      role.rolePermissions.forEach((rp) => {
        try {
          const config: PermissionConfig = JSON.parse(rp.permission.config)
          config.actions.forEach((a) => {
            if (rp.permission.menuId) {
              permissions.push(`${rp.permission.menuId}:${a.toLowerCase()}`)
            }
            permissions.push(`${rp.permission.permissionCd}:${a.toLowerCase()}`)
          })
        } catch {
          // config JSON 파싱 실패 시 무시
        }
      })
    })
  })

  if (!hasPermission(permissions, action, subject)) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: `${subject}에 대한 ${action} 권한이 없습니다`,
          },
        },
        { status: 403 }
      ),
    }
  }

  return { ok: true }
}

/**
 * 메뉴 기반 권한 확인 (MergedPermission 사용)
 *
 * @param userId - 사용자 ID
 * @param menuId - 메뉴 ID
 * @param action - 확인할 액션
 * @returns 권한 여부 + fieldConstraints
 */
export async function requireMenuPermission(
  userId: string,
  menuId: number,
  action: Actions
): Promise<
  | { ok: true; fieldConstraints: Record<string, string[] | null> | null }
  | { ok: false; response: NextResponse<ApiResponse<never>> }
> {
  const { isSystemAdmin, permissions } = await getUserMergedPermissions(userId)

  if (isSystemAdmin) {
    return { ok: true, fieldConstraints: null }
  }

  const menuPerm = permissions.find((p) => p.menuId === menuId)

  if (!menuPerm || !menuPerm.actions.includes(action)) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: `메뉴 ${menuId}에 대한 ${action} 권한이 없습니다`,
          },
        },
        { status: 403 }
      ),
    }
  }

  return { ok: true, fieldConstraints: menuPerm.fieldConstraints }
}

/**
 * 인증 + 관리자 권한 확인
 */
export async function requireAuthAndAdmin(): Promise<
  { ok: true; data: AuthResult } | { ok: false; response: NextResponse<ApiResponse<never>> }
> {
  const authResult = await requireAuth()
  if (!authResult.ok) {
    return authResult
  }

  const adminResult = await requireAdmin(authResult.data.userId)
  if (!adminResult.ok) {
    return adminResult
  }

  return authResult
}

/**
 * 인증 + 특정 권한 확인
 */
export async function requireAuthAndPermission(
  action: Actions,
  subject: Subjects
): Promise<
  { ok: true; data: AuthResult } | { ok: false; response: NextResponse<ApiResponse<never>> }
> {
  const authResult = await requireAuth()
  if (!authResult.ok) {
    return authResult
  }

  const permResult = await requirePermission(authResult.data.userId, action, subject)
  if (!permResult.ok) {
    return permResult
  }

  return authResult
}
