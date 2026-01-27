/**
 * 역할그룹 상세 API 엔드포인트
 *
 * GET /api/role-groups/:id - 역할그룹 상세 조회
 * PUT /api/role-groups/:id - 역할그룹 수정
 * DELETE /api/role-groups/:id - 역할그룹 삭제
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

interface RoleGroupDetail {
  id: number
  systemId: string
  code: string
  name: string
  description: string | null
  isActive: boolean
  roles: Array<{
    id: number
    code: string
    name: string
  }>
  users: Array<{
    id: string
    email: string
    name: string
  }>
}

/**
 * GET /api/role-groups/:id
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<RoleGroupDetail>>> {
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
    const roleGroupId = parseInt(id)

    const roleGroup = await prisma.roleGroup.findUnique({
      where: { roleGroupId },
      include: {
        roleGroupRoles: {
          include: { role: true },
        },
        userRoleGroups: {
          include: { user: true },
        },
      },
    })

    if (!roleGroup) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'ROLE_GROUP_NOT_FOUND', message: '역할그룹을 찾을 수 없습니다' },
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: roleGroup.roleGroupId,
        systemId: roleGroup.systemId,
        code: roleGroup.roleGroupCd,
        name: roleGroup.name,
        description: roleGroup.description,
        isActive: roleGroup.isActive,
        roles: roleGroup.roleGroupRoles.map((rgr: { role: { roleId: number; roleCd: string; name: string } }) => ({
          id: rgr.role.roleId,
          code: rgr.role.roleCd,
          name: rgr.role.name,
        })),
        users: roleGroup.userRoleGroups.map((urg: { user: { userId: string; email: string; name: string } }) => ({
          id: urg.user.userId,
          email: urg.user.email,
          name: urg.user.name,
        })),
      },
    })
  } catch (error) {
    console.error('GET /api/role-groups/:id error:', error)
    return NextResponse.json(
      {
        success: false,
        error: { code: 'DB_ERROR', message: '데이터베이스 오류가 발생했습니다' },
      },
      { status: 500 }
    )
  }
}

interface UpdateRoleGroupDto {
  name?: string
  description?: string
  isActive?: boolean
}

/**
 * PUT /api/role-groups/:id
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<RoleGroupDetail>>> {
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

    const user = await prisma.user.findUnique({
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

    const isAdmin = user?.userRoleGroups.some((urg: { roleGroup: { roleGroupRoles: Array<{ role: { roleCd: string } }> } }) =>
      urg.roleGroup.roleGroupRoles.some((rgr: { role: { roleCd: string } }) => rgr.role.roleCd === 'SYSTEM_ADMIN')
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

    const { id } = await params
    const roleGroupId = parseInt(id)
    const body: UpdateRoleGroupDto = await request.json()

    const existing = await prisma.roleGroup.findUnique({ where: { roleGroupId } })
    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'ROLE_GROUP_NOT_FOUND', message: '역할그룹을 찾을 수 없습니다' },
        },
        { status: 404 }
      )
    }

    const roleGroup = await prisma.$transaction(async (tx: {
      roleGroupHistory: {
        updateMany: typeof prisma.roleGroupHistory.updateMany
        create: typeof prisma.roleGroupHistory.create
      }
      roleGroup: { update: typeof prisma.roleGroup.update }
    }) => {
      // SCD Type 2: close previous record
      await tx.roleGroupHistory.updateMany({
        where: { roleGroupId, validTo: null },
        data: { validTo: new Date() },
      })

      const updated = await tx.roleGroup.update({
        where: { roleGroupId },
        data: {
          name: body.name ?? existing.name,
          description: body.description ?? existing.description,
          isActive: body.isActive ?? existing.isActive,
        },
        include: {
          roleGroupRoles: { include: { role: true } },
          userRoleGroups: { include: { user: true } },
        },
      })

      // SCD Type 2: create new record
      await tx.roleGroupHistory.create({
        data: {
          roleGroupId: updated.roleGroupId,
          systemId: updated.systemId,
          roleGroupCd: updated.roleGroupCd,
          name: updated.name,
          description: updated.description,
          isActive: updated.isActive,
          changeType: 'UPDATE',
          changedBy: session.user!.id,
        },
      })

      return updated
    })

    return NextResponse.json({
      success: true,
      data: {
        id: roleGroup.roleGroupId,
        systemId: roleGroup.systemId,
        code: roleGroup.roleGroupCd,
        name: roleGroup.name,
        description: roleGroup.description,
        isActive: roleGroup.isActive,
        roles: roleGroup.roleGroupRoles.map((rgr: { role: { roleId: number; roleCd: string; name: string } }) => ({
          id: rgr.role.roleId,
          code: rgr.role.roleCd,
          name: rgr.role.name,
        })),
        users: roleGroup.userRoleGroups.map((urg: { user: { userId: string; email: string; name: string } }) => ({
          id: urg.user.userId,
          email: urg.user.email,
          name: urg.user.name,
        })),
      },
    })
  } catch (error) {
    console.error('PUT /api/role-groups/:id error:', error)
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
 * DELETE /api/role-groups/:id
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

    const user = await prisma.user.findUnique({
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

    const isAdmin = user?.userRoleGroups.some((urg: { roleGroup: { roleGroupRoles: Array<{ role: { roleCd: string } }> } }) =>
      urg.roleGroup.roleGroupRoles.some((rgr: { role: { roleCd: string } }) => rgr.role.roleCd === 'SYSTEM_ADMIN')
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

    const { id } = await params
    const roleGroupId = parseInt(id)

    const existing = await prisma.roleGroup.findUnique({
      where: { roleGroupId },
      include: { roleGroupRoles: true },
    })
    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'ROLE_GROUP_NOT_FOUND', message: '역할그룹을 찾을 수 없습니다' },
        },
        { status: 404 }
      )
    }

    await prisma.$transaction(async (tx: {
      roleGroupHistory: {
        updateMany: typeof prisma.roleGroupHistory.updateMany
        create: typeof prisma.roleGroupHistory.create
      }
      roleGroupRoleHistory: {
        updateMany: typeof prisma.roleGroupRoleHistory.updateMany
        createMany: typeof prisma.roleGroupRoleHistory.createMany
      }
      roleGroup: { delete: typeof prisma.roleGroup.delete }
    }) => {
      const now = new Date()

      // SCD Type 2: close RoleGroup history
      await tx.roleGroupHistory.updateMany({
        where: { roleGroupId, validTo: null },
        data: { validTo: now },
      })

      await tx.roleGroupHistory.create({
        data: {
          roleGroupId: existing.roleGroupId,
          systemId: existing.systemId,
          roleGroupCd: existing.roleGroupCd,
          name: existing.name,
          description: existing.description,
          isActive: existing.isActive,
          changeType: 'DELETE',
          changedBy: session.user!.id,
          validTo: now,
        },
      })

      // SCD Type 2: close RoleGroupRole history for all assigned roles
      if (existing.roleGroupRoles.length > 0) {
        await tx.roleGroupRoleHistory.updateMany({
          where: { roleGroupId, validTo: null },
          data: { validTo: now },
        })

        await tx.roleGroupRoleHistory.createMany({
          data: existing.roleGroupRoles.map((rgr: { roleId: number }) => ({
            roleGroupId,
            roleId: rgr.roleId,
            changeType: 'REVOKE',
            changedBy: session.user!.id,
            validTo: now,
          })),
        })
      }

      // Cascade delete handled by Prisma (onDelete: Cascade on roleGroupRoles)
      await tx.roleGroup.delete({ where: { roleGroupId } })
    })

    return NextResponse.json({ success: true, data: null })
  } catch (error) {
    console.error('DELETE /api/role-groups/:id error:', error)
    return NextResponse.json(
      {
        success: false,
        error: { code: 'DB_ERROR', message: '데이터베이스 오류가 발생했습니다' },
      },
      { status: 500 }
    )
  }
}
