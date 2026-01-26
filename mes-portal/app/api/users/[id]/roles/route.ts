/**
 * 사용자-역할 할당 API 엔드포인트 (TSK-03-01)
 *
 * PUT /api/users/:id/roles - 사용자-역할 할당 설정
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

interface UserRolesResponse {
  userId: number
  roles: Array<{
    id: number
    code: string
    name: string
  }>
}

interface UpdateUserRolesDto {
  roleIds: number[]
}

/**
 * PUT /api/users/:id/roles
 * 사용자-역할 할당 설정 (기존 할당 삭제 후 새로 생성)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<UserRolesResponse>>> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다' },
        },
        { status: 401 }
      )
    }

    // 관리자 권한 확인
    const adminUser = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) },
      include: { userRoles: { include: { role: true } } },
    })

    const isAdmin = adminUser?.userRoles.some((ur) => ur.role.code === 'SYSTEM_ADMIN')
    if (!isAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'FORBIDDEN', message: '관리자 권한이 필요합니다' },
        },
        { status: 403 }
      )
    }

    const { id } = await params
    const userId = parseInt(id)

    // 대상 사용자 존재 확인
    const targetUser = await prisma.user.findUnique({ where: { id: userId } })
    if (!targetUser) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'USER_NOT_FOUND', message: '사용자를 찾을 수 없습니다' },
        },
        { status: 404 }
      )
    }

    const body: UpdateUserRolesDto = await request.json()

    // roleIds 유효성 검사
    if (!body.roleIds || !Array.isArray(body.roleIds)) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'roleIds는 필수입니다' },
        },
        { status: 400 }
      )
    }

    // 기존 할당 삭제
    await prisma.userRole.deleteMany({
      where: { userId },
    })

    // 새 할당 생성
    if (body.roleIds.length > 0) {
      await prisma.userRole.createMany({
        data: body.roleIds.map((roleId) => ({
          userId,
          roleId,
        })),
      })
    }

    // 새로 할당된 역할 조회
    const userRoles = await prisma.userRole.findMany({
      where: { userId },
      include: { role: true },
    })

    // 감사 로그
    await prisma.auditLog.create({
      data: {
        userId: parseInt(session.user.id),
        action: 'USER_ROLE_UPDATE',
        resource: 'User',
        resourceId: String(userId),
        details: JSON.stringify({ roleIds: body.roleIds }),
        status: 'SUCCESS',
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        userId,
        roles: userRoles.map((ur) => ({
          id: ur.role.id,
          code: ur.role.code,
          name: ur.role.name,
        })),
      },
    })
  } catch (error) {
    console.error('PUT /api/users/:id/roles error:', error)
    return NextResponse.json(
      {
        success: false,
        error: { code: 'DB_ERROR', message: '데이터베이스 오류가 발생했습니다' },
      },
      { status: 500 }
    )
  }
}
