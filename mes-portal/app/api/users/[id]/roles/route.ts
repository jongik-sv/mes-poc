/**
 * 사용자-역할그룹 할당 API 엔드포인트 (TSK-03-01)
 *
 * PUT /api/users/:id/roles - 사용자-역할그룹 할당 설정
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

interface UserRoleGroupsResponse {
  userId: string
  roleGroups: Array<{
    id: number
    code: string
    name: string
  }>
}

interface UpdateUserRoleGroupsDto {
  roleGroupIds: number[]
}

/**
 * PUT /api/users/:id/roles
 * 사용자-역할그룹 할당 설정 (기존 할당 삭제 후 새로 생성)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<UserRoleGroupsResponse>>> {
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
      where: { userId: session.user.id },
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

    const isAdmin = adminUser?.userRoleGroups.some((urg) =>
      urg.roleGroup.roleGroupRoles.some((rgr) => rgr.role.roleCd === 'SYSTEM_ADMIN')
    )
    if (!isAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'FORBIDDEN', message: '관리자 권한이 필요합니다' },
        },
        { status: 403 }
      )
    }

    const { id: userId } = await params

    // 대상 사용자 존재 확인
    const targetUser = await prisma.user.findUnique({ where: { userId } })
    if (!targetUser) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'USER_NOT_FOUND', message: '사용자를 찾을 수 없습니다' },
        },
        { status: 404 }
      )
    }

    const body: UpdateUserRoleGroupsDto = await request.json()

    // roleGroupIds 유효성 검사
    if (!body.roleGroupIds || !Array.isArray(body.roleGroupIds)) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'roleGroupIds는 필수입니다' },
        },
        { status: 400 }
      )
    }

    // 기존 할당 삭제
    await prisma.userRoleGroup.deleteMany({
      where: { userId },
    })

    // 새 할당 생성
    if (body.roleGroupIds.length > 0) {
      await prisma.userRoleGroup.createMany({
        data: body.roleGroupIds.map((roleGroupId) => ({
          userId,
          roleGroupId,
        })),
      })
    }

    // 새로 할당된 역할그룹 조회
    const userRoleGroups = await prisma.userRoleGroup.findMany({
      where: { userId },
      include: { roleGroup: true },
    })

    // 감사 로그
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'USER_ROLE_GROUP_UPDATE',
        resource: 'User',
        resourceId: userId,
        details: JSON.stringify({ roleGroupIds: body.roleGroupIds }),
        status: 'SUCCESS',
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        userId,
        roleGroups: userRoleGroups.map((urg) => ({
          id: urg.roleGroup.roleGroupId,
          code: urg.roleGroup.roleGroupCd,
          name: urg.roleGroup.name,
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
