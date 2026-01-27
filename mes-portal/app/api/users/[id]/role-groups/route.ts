/**
 * 사용자 역할그룹 API
 * GET /api/users/:id/role-groups - 사용자 역할그룹 목록 조회
 * POST /api/users/:id/role-groups - 역할그룹 할당 (전체 교체)
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: { code: string; message: string }
}

function errorResponse(code: string, message: string, status: number) {
  return NextResponse.json<ApiResponse<never>>(
    { success: false, error: { code, message } },
    { status }
  )
}

async function isAdmin(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { userId },
    include: {
      userRoleGroups: {
        include: {
          roleGroup: {
            include: {
              roleGroupRoles: { include: { role: true } },
            },
          },
        },
      },
    },
  })
  return (
    user?.userRoleGroups.some((urg) =>
      urg.roleGroup.roleGroupRoles.some((rgr) => rgr.role.roleCd === 'SYSTEM_ADMIN')
    ) ?? false
  )
}

export async function GET(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return errorResponse('UNAUTHORIZED', '인증이 필요합니다', 401)
    }

    const { id: userId } = await params

    const user = await prisma.user.findUnique({ where: { userId } })
    if (!user) {
      return errorResponse('USER_NOT_FOUND', '사용자를 찾을 수 없습니다', 404)
    }

    const userRoleGroups = await prisma.userRoleGroup.findMany({
      where: { userId },
      include: {
        roleGroup: {
          select: {
            roleGroupId: true,
            roleGroupCd: true,
            name: true,
            description: true,
            isActive: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        userId,
        roleGroups: userRoleGroups.map((urg) => ({
          ...urg.roleGroup,
          assignedAt: urg.assignedAt,
          assignedBy: urg.assignedBy,
        })),
      },
    })
  } catch {
    return errorResponse('DB_ERROR', '데이터베이스 오류가 발생했습니다', 500)
  }
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return errorResponse('UNAUTHORIZED', '인증이 필요합니다', 401)
    }

    if (!(await isAdmin(session.user.id))) {
      return errorResponse('FORBIDDEN', '관리자 권한이 필요합니다', 403)
    }

    const { id: userId } = await params

    const targetUser = await prisma.user.findUnique({ where: { userId } })
    if (!targetUser) {
      return errorResponse('USER_NOT_FOUND', '사용자를 찾을 수 없습니다', 404)
    }

    const body = await request.json()
    if (!body.roleGroupIds || !Array.isArray(body.roleGroupIds)) {
      return errorResponse('VALIDATION_ERROR', 'roleGroupIds는 필수입니다', 400)
    }

    const roleGroupIds: number[] = body.roleGroupIds

    const result = await prisma.$transaction(async (tx) => {
      // 기존 할당 조회 (이력용)
      const existing = await tx.userRoleGroup.findMany({
        where: { userId },
      })
      const existingIds = existing.map((e: { roleGroupId: number }) => e.roleGroupId)

      // 기존 전체 삭제
      await tx.userRoleGroup.deleteMany({ where: { userId } })

      // 새로 할당
      if (roleGroupIds.length > 0) {
        await tx.userRoleGroup.createMany({
          data: roleGroupIds.map((roleGroupId: number) => ({
            userId,
            roleGroupId,
            assignedBy: session.user!.id,
          })),
        })
      }

      // 이력 기록: REVOKE (기존에 있었지만 새 목록에 없는 것)
      const revokedIds = existingIds.filter((id: number) => !roleGroupIds.includes(id))
      const assignedIds = roleGroupIds.filter((id: number) => !existingIds.includes(id))

      const historyRecords = [
        ...revokedIds.map((roleGroupId: number) => ({
          userId,
          roleGroupId,
          changeType: 'REVOKE' as const,
          changedBy: session.user!.id,
        })),
        ...assignedIds.map((roleGroupId: number) => ({
          userId,
          roleGroupId,
          changeType: 'ASSIGN' as const,
          changedBy: session.user!.id,
        })),
      ]

      if (historyRecords.length > 0) {
        await tx.userRoleGroupHistory.createMany({ data: historyRecords })
      }

      // 감사 로그
      await tx.auditLog.create({
        data: {
          userId: session.user!.id,
          action: 'USER_ROLE_GROUP_UPDATE',
          resource: 'UserRoleGroup',
          resourceId: userId,
          details: JSON.stringify({ roleGroupIds }),
          status: 'SUCCESS',
        },
      })

      // 최종 결과 조회
      return tx.userRoleGroup.findMany({
        where: { userId },
        include: {
          roleGroup: {
            select: {
              roleGroupId: true,
              roleGroupCd: true,
              name: true,
            },
          },
        },
      })
    })

    return NextResponse.json({
      success: true,
      data: {
        userId,
        roleGroups: result.map((urg: { roleGroup: { roleGroupId: number; roleGroupCd: string; name: string } }) => urg.roleGroup),
      },
    })
  } catch {
    return errorResponse('DB_ERROR', '데이터베이스 오류가 발생했습니다', 500)
  }
}
