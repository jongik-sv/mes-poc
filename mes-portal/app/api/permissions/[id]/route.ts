/**
 * 권한 상세 API 엔드포인트 (TSK-03-01)
 *
 * GET /api/permissions/:id - 권한 상세 조회
 * PUT /api/permissions/:id - 권한 수정
 * DELETE /api/permissions/:id - 권한 삭제
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

interface PermissionDetail {
  id: number
  code: string
  name: string
  type: string
  resource: string
  action: string
  description: string | null
  isActive: boolean
  roles: Array<{
    id: number
    code: string
    name: string
  }>
}

/**
 * GET /api/permissions/:id
 * 권한 상세 조회
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<PermissionDetail>>> {
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
    const permissionId = parseInt(id)

    const permission = await prisma.permission.findUnique({
      where: { id: permissionId },
      include: {
        rolePermissions: {
          include: { role: true },
        },
      },
    })

    if (!permission) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'PERMISSION_NOT_FOUND', message: '권한을 찾을 수 없습니다' },
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: permission.id,
        code: permission.code,
        name: permission.name,
        type: permission.type,
        resource: permission.resource,
        action: permission.action,
        description: permission.description,
        isActive: permission.isActive,
        roles: permission.rolePermissions.map((rp) => ({
          id: rp.role.id,
          code: rp.role.code,
          name: rp.role.name,
        })),
      },
    })
  } catch (error) {
    console.error('GET /api/permissions/:id error:', error)
    return NextResponse.json(
      {
        success: false,
        error: { code: 'DB_ERROR', message: '데이터베이스 오류가 발생했습니다' },
      },
      { status: 500 }
    )
  }
}

interface UpdatePermissionDto {
  name?: string
  description?: string
  isActive?: boolean
}

/**
 * PUT /api/permissions/:id
 * 권한 수정
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<PermissionDetail>>> {
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
    const permissionId = parseInt(id)
    const body: UpdatePermissionDto = await request.json()

    const existing = await prisma.permission.findUnique({ where: { id: permissionId } })
    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'PERMISSION_NOT_FOUND', message: '권한을 찾을 수 없습니다' },
        },
        { status: 404 }
      )
    }

    const permission = await prisma.permission.update({
      where: { id: permissionId },
      data: {
        name: body.name ?? existing.name,
        description: body.description ?? existing.description,
        isActive: body.isActive ?? existing.isActive,
      },
      include: {
        rolePermissions: { include: { role: true } },
      },
    })

    // 감사 로그
    await prisma.auditLog.create({
      data: {
        userId: parseInt(session.user.id),
        action: 'PERMISSION_UPDATE',
        resource: 'Permission',
        resourceId: String(permission.id),
        details: JSON.stringify(body),
        status: 'SUCCESS',
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: permission.id,
        code: permission.code,
        name: permission.name,
        type: permission.type,
        resource: permission.resource,
        action: permission.action,
        description: permission.description,
        isActive: permission.isActive,
        roles: permission.rolePermissions.map((rp) => ({
          id: rp.role.id,
          code: rp.role.code,
          name: rp.role.name,
        })),
      },
    })
  } catch (error) {
    console.error('PUT /api/permissions/:id error:', error)
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
 * DELETE /api/permissions/:id
 * 권한 삭제
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
    const permissionId = parseInt(id)

    const existing = await prisma.permission.findUnique({ where: { id: permissionId } })
    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'PERMISSION_NOT_FOUND', message: '권한을 찾을 수 없습니다' },
        },
        { status: 404 }
      )
    }

    await prisma.permission.delete({ where: { id: permissionId } })

    // 감사 로그
    await prisma.auditLog.create({
      data: {
        userId: parseInt(session.user.id),
        action: 'PERMISSION_DELETE',
        resource: 'Permission',
        resourceId: String(permissionId),
        details: JSON.stringify({ code: existing.code, name: existing.name }),
        status: 'SUCCESS',
      },
    })

    return NextResponse.json({ success: true, data: null })
  } catch (error) {
    console.error('DELETE /api/permissions/:id error:', error)
    return NextResponse.json(
      {
        success: false,
        error: { code: 'DB_ERROR', message: '데이터베이스 오류가 발생했습니다' },
      },
      { status: 500 }
    )
  }
}
