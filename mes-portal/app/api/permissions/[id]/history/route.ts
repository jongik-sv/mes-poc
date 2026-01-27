/**
 * 권한 변경 이력 API 엔드포인트
 *
 * GET /api/permissions/:id/history - 권한 변경 이력 조회
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
}

type RouteContext = { params: Promise<{ id: string }> }

/**
 * GET /api/permissions/:id/history
 * 권한 변경 이력 조회 (?from=&to= 날짜 범위 필터)
 */
export async function GET(
  request: NextRequest,
  { params }: RouteContext
): Promise<NextResponse<ApiResponse<unknown>>> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다' } },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { userId: session.user.id },
      include: {
        userRoleGroups: {
          include: {
            roleGroup: {
              include: { roleGroupRoles: { include: { role: true } } },
            },
          },
        },
      },
    })

    const isAdmin = user?.userRoleGroups.some((urg) =>
      urg.roleGroup.roleGroupRoles.some((rgr) => rgr.role.roleCd === 'SYSTEM_ADMIN')
    )
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '관리자 권한이 필요합니다' } },
        { status: 403 }
      )
    }

    const { id } = await params
    const permissionId = parseInt(id)

    const { searchParams } = new URL(request.url)
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    const where: Record<string, unknown> = { permissionId }
    if (from) {
      where.validFrom = { ...(where.validFrom as object ?? {}), gte: new Date(from) }
    }
    if (to) {
      where.validTo = { lte: new Date(to) }
    }

    const history = await prisma.permissionHistory.findMany({
      where,
      orderBy: { validFrom: 'desc' },
    })

    return NextResponse.json({ success: true, data: history })
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'DB_ERROR', message: '데이터베이스 오류가 발생했습니다' } },
      { status: 500 }
    )
  }
}
