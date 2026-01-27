/**
 * 사용자 시스템-메뉴셋 API
 * GET /api/users/:id/systems - 시스템-메뉴셋 매핑 목록
 * POST /api/users/:id/systems - 시스템 접근 설정
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

    const mappings = await prisma.userSystemMenuSet.findMany({
      where: { userId },
      include: {
        menuSet: {
          include: {
            system: {
              select: { systemId: true, name: true },
            },
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        userId,
        systems: mappings.map((m) => ({
          systemId: m.systemId,
          systemName: m.menuSet.system.name,
          menuSetId: m.menuSet.menuSetId,
          menuSetCd: m.menuSet.menuSetCd,
          menuSetName: m.menuSet.name,
          createdAt: m.createdAt,
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
    if (!body.systemId || body.menuSetId == null) {
      return errorResponse('VALIDATION_ERROR', 'systemId와 menuSetId는 필수입니다', 400)
    }

    const { systemId, menuSetId } = body as { systemId: string; menuSetId: number }

    const result = await prisma.$transaction(async (tx) => {
      // 기존 매핑 확인 (이력용)
      const existing = await tx.userSystemMenuSet.findUnique({
        where: { userId_systemId: { userId, systemId } },
      })

      const record = await tx.userSystemMenuSet.upsert({
        where: { userId_systemId: { userId, systemId } },
        create: { userId, systemId, menuSetId },
        update: { menuSetId },
      })

      // 이력 기록
      await tx.userSystemMenuSetHistory.create({
        data: {
          userId,
          systemId,
          menuSetId,
          changeType: existing ? 'UPDATE' : 'ASSIGN',
          changedBy: session.user!.id,
        },
      })

      // 감사 로그
      await tx.auditLog.create({
        data: {
          userId: session.user!.id,
          action: existing ? 'USER_SYSTEM_MENU_SET_UPDATE' : 'USER_SYSTEM_MENU_SET_ASSIGN',
          resource: 'UserSystemMenuSet',
          resourceId: `${userId}:${systemId}`,
          details: JSON.stringify({ systemId, menuSetId }),
          status: 'SUCCESS',
        },
      })

      return record
    })

    return NextResponse.json({
      success: true,
      data: {
        userId: result.userId,
        systemId: result.systemId,
        menuSetId: result.menuSetId,
        createdAt: result.createdAt,
      },
    })
  } catch {
    return errorResponse('DB_ERROR', '데이터베이스 오류가 발생했습니다', 500)
  }
}
