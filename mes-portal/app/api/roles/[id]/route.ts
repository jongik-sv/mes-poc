/**
 * 역할 상세 API 엔드포인트 (TSK-03-01)
 *
 * GET /api/roles/:id - 역할 상세 조회
 * PUT /api/roles/:id - 역할 수정
 * DELETE /api/roles/:id - 역할 삭제
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

interface RoleDetail {
  id: number
  code: string
  name: string
  description: string | null
  parentId: number | null
  level: number
  isSystem: boolean
  isActive: boolean
  permissions: Array<{
    id: number
    code: string
    name: string
    type: string
  }>
  users: Array<{
    id: number
    email: string
    name: string
  }>
}

/**
 * GET /api/roles/:id
 * 역할 상세 조회
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<RoleDetail>>> {
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

    const { id } = await params
    const roleId = parseInt(id)

    const role = await prisma.role.findUnique({
      where: { id: roleId },
      include: {
        rolePermissions: {
          include: { permission: true },
        },
        userRoles: {
          include: { user: true },
        },
      },
    })

    if (!role) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'ROLE_NOT_FOUND', message: '역할을 찾을 수 없습니다' },
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: role.id,
        code: role.code,
        name: role.name,
        description: role.description,
        parentId: role.parentId,
        level: role.level,
        isSystem: role.isSystem,
        isActive: role.isActive,
        permissions: role.rolePermissions.map((rp) => ({
          id: rp.permission.id,
          code: rp.permission.code,
          name: rp.permission.name,
          type: rp.permission.type,
        })),
        users: role.userRoles.map((ur) => ({
          id: ur.user.id,
          email: ur.user.email,
          name: ur.user.name,
        })),
      },
    })
  } catch (error) {
    console.error('GET /api/roles/:id error:', error)
    return NextResponse.json(
      {
        success: false,
        error: { code: 'DB_ERROR', message: '데이터베이스 오류가 발생했습니다' },
      },
      { status: 500 }
    )
  }
}

interface UpdateRoleDto {
  name?: string
  description?: string
  parentId?: number | null
  isActive?: boolean
}

/**
 * PUT /api/roles/:id
 * 역할 수정
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<RoleDetail>>> {
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
    const body: UpdateRoleDto = await request.json()

    const existing = await prisma.role.findUnique({ where: { id: roleId } })
    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'ROLE_NOT_FOUND', message: '역할을 찾을 수 없습니다' },
        },
        { status: 404 }
      )
    }

    // 레벨 재계산 (parentId 변경 시)
    let level = existing.level
    if (body.parentId !== undefined) {
      if (body.parentId === null) {
        level = 0
      } else {
        const parent = await prisma.role.findUnique({
          where: { id: body.parentId },
        })
        if (parent) {
          level = parent.level + 1
        }
      }
    }

    const role = await prisma.role.update({
      where: { id: roleId },
      data: {
        name: body.name ?? existing.name,
        description: body.description ?? existing.description,
        parentId: body.parentId !== undefined ? body.parentId : existing.parentId,
        level,
        isActive: body.isActive ?? existing.isActive,
      },
      include: {
        rolePermissions: { include: { permission: true } },
        userRoles: { include: { user: true } },
      },
    })

    // 감사 로그
    await prisma.auditLog.create({
      data: {
        userId: parseInt(session.user.id),
        action: 'ROLE_UPDATE',
        resource: 'Role',
        resourceId: String(role.id),
        details: JSON.stringify(body),
        status: 'SUCCESS',
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: role.id,
        code: role.code,
        name: role.name,
        description: role.description,
        parentId: role.parentId,
        level: role.level,
        isSystem: role.isSystem,
        isActive: role.isActive,
        permissions: role.rolePermissions.map((rp) => ({
          id: rp.permission.id,
          code: rp.permission.code,
          name: rp.permission.name,
          type: rp.permission.type,
        })),
        users: role.userRoles.map((ur) => ({
          id: ur.user.id,
          email: ur.user.email,
          name: ur.user.name,
        })),
      },
    })
  } catch (error) {
    console.error('PUT /api/roles/:id error:', error)
    return NextResponse.json(
      {
        success: false,
        error: { code: 'DB_ERROR', message: '데이터베이스 오류가 발생했습니다' },
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/roles/:id
 * 역할 삭제
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<null>>> {
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

    const existing = await prisma.role.findUnique({ where: { id: roleId } })
    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'ROLE_NOT_FOUND', message: '역할을 찾을 수 없습니다' },
        },
        { status: 404 }
      )
    }

    // 시스템 역할 삭제 불가 (BR-03-01)
    if (existing.isSystem) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'SYSTEM_ROLE_DELETE',
            message: '시스템 역할은 삭제할 수 없습니다',
          },
        },
        { status: 400 }
      )
    }

    await prisma.role.delete({ where: { id: roleId } })

    // 감사 로그
    await prisma.auditLog.create({
      data: {
        userId: parseInt(session.user.id),
        action: 'ROLE_DELETE',
        resource: 'Role',
        resourceId: String(roleId),
        details: JSON.stringify({ code: existing.code, name: existing.name }),
        status: 'SUCCESS',
      },
    })

    return NextResponse.json({ success: true, data: null })
  } catch (error) {
    console.error('DELETE /api/roles/:id error:', error)
    return NextResponse.json(
      {
        success: false,
        error: { code: 'DB_ERROR', message: '데이터베이스 오류가 발생했습니다' },
      },
      { status: 500 }
    )
  }
}
