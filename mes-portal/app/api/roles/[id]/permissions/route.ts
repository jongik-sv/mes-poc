/**
 * 역할-권한 매핑 API 엔드포인트 (TSK-03-01)
 *
 * PUT /api/roles/:id/permissions - 역할-권한 매핑 설정
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

interface RolePermissionsResponse {
  roleId: number
  permissions: Array<{
    id: number
    code: string
    name: string
  }>
}

interface UpdateRolePermissionsDto {
  permissionIds: number[]
}

/**
 * PUT /api/roles/:id/permissions
 * 역할-권한 매핑 설정 (기존 매핑 삭제 후 새로 생성)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<RolePermissionsResponse>>> {
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
    const user = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) },
      include: { userRoles: { include: { role: true } } },
    })

    const isAdmin = user?.userRoles.some((ur) => ur.role.code === 'SYSTEM_ADMIN')
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
    const roleId = parseInt(id)

    // 역할 존재 확인
    const role = await prisma.role.findUnique({ where: { id: roleId } })
    if (!role) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'ROLE_NOT_FOUND', message: '역할을 찾을 수 없습니다' },
        },
        { status: 404 }
      )
    }

    const body: UpdateRolePermissionsDto = await request.json()

    // permissionIds 유효성 검사
    if (!body.permissionIds || !Array.isArray(body.permissionIds)) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'permissionIds는 필수입니다' },
        },
        { status: 400 }
      )
    }

    // 기존 매핑 삭제
    await prisma.rolePermission.deleteMany({
      where: { roleId },
    })

    // 새 매핑 생성
    if (body.permissionIds.length > 0) {
      await prisma.rolePermission.createMany({
        data: body.permissionIds.map((permissionId) => ({
          roleId,
          permissionId,
        })),
      })
    }

    // 새로 매핑된 권한 조회
    const rolePermissions = await prisma.rolePermission.findMany({
      where: { roleId },
      include: { permission: true },
    })

    // 감사 로그
    await prisma.auditLog.create({
      data: {
        userId: parseInt(session.user.id),
        action: 'ROLE_PERMISSION_UPDATE',
        resource: 'Role',
        resourceId: String(roleId),
        details: JSON.stringify({ permissionIds: body.permissionIds }),
        status: 'SUCCESS',
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        roleId,
        permissions: rolePermissions.map((rp) => ({
          id: rp.permission.id,
          code: rp.permission.code,
          name: rp.permission.name,
        })),
      },
    })
  } catch (error) {
    console.error('PUT /api/roles/:id/permissions error:', error)
    return NextResponse.json(
      {
        success: false,
        error: { code: 'DB_ERROR', message: '데이터베이스 오류가 발생했습니다' },
      },
      { status: 500 }
    )
  }
}
