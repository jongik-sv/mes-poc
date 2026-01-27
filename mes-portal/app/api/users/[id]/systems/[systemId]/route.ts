/**
 * 사용자 시스템별 메뉴셋 API
 * PUT /api/users/:id/systems/:systemId - 메뉴셋 변경
 * DELETE /api/users/:id/systems/:systemId - 시스템 접근 해제
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string; systemId: string }>
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

export async function PUT(
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

    const { id: userId, systemId } = await params

    const body = await request.json()
    if (body.menuSetId == null) {
      return errorResponse('VALIDATION_ERROR', 'menuSetId는 필수입니다', 400)
    }

    const { menuSetId } = body as { menuSetId: number }

    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.userSystemMenuSet.findUnique({
        where: { userId_systemId: { userId, systemId } },
      })

      if (!existing) {
        return null
      }

      const updated = await tx.userSystemMenuSet.update({
        where: { userId_systemId: { userId, systemId } },
        data: { menuSetId },
      })

      await tx.userSystemMenuSetHistory.create({
        data: {
          userId,
          systemId,
          menuSetId,
          changeType: 'UPDATE',
          changedBy: session.user!.id,
        },
      })

      await tx.auditLog.create({
        data: {
          userId: session.user!.id,
          action: 'USER_SYSTEM_MENU_SET_UPDATE',
          resource: 'UserSystemMenuSet',
          resourceId: `${userId}:${systemId}`,
          details: JSON.stringify({ menuSetId, previousMenuSetId: existing.menuSetId }),
          status: 'SUCCESS',
        },
      })

      return updated
    })

    if (!result) {
      return errorResponse('NOT_FOUND', '시스템 접근 매핑을 찾을 수 없습니다', 404)
    }

    return NextResponse.json({
      success: true,
      data: {
        userId: result.userId,
        systemId: result.systemId,
        menuSetId: result.menuSetId,
      },
    })
  } catch {
    return errorResponse('DB_ERROR', '데이터베이스 오류가 발생했습니다', 500)
  }
}

export async function DELETE(
  _request: NextRequest,
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

    const { id: userId, systemId } = await params

    const deleted = await prisma.$transaction(async (tx) => {
      const existing = await tx.userSystemMenuSet.findUnique({
        where: { userId_systemId: { userId, systemId } },
      })

      if (!existing) {
        return null
      }

      await tx.userSystemMenuSet.delete({
        where: { userId_systemId: { userId, systemId } },
      })

      await tx.userSystemMenuSetHistory.create({
        data: {
          userId,
          systemId,
          menuSetId: existing.menuSetId,
          changeType: 'REVOKE',
          changedBy: session.user!.id,
        },
      })

      await tx.auditLog.create({
        data: {
          userId: session.user!.id,
          action: 'USER_SYSTEM_MENU_SET_REVOKE',
          resource: 'UserSystemMenuSet',
          resourceId: `${userId}:${systemId}`,
          details: JSON.stringify({ systemId, menuSetId: existing.menuSetId }),
          status: 'SUCCESS',
        },
      })

      return existing
    })

    if (!deleted) {
      return errorResponse('NOT_FOUND', '시스템 접근 매핑을 찾을 수 없습니다', 404)
    }

    return NextResponse.json({
      success: true,
      data: { message: '시스템 접근이 해제되었습니다' },
    })
  } catch {
    return errorResponse('DB_ERROR', '데이터베이스 오류가 발생했습니다', 500)
  }
}
