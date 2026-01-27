/**
 * 역할그룹 역할 할당 API 엔드포인트
 *
 * GET /api/role-groups/:id/roles - 할당된 역할 목록 조회
 * POST /api/role-groups/:id/roles - 역할 할당 (전체 교체, diff 기반 히스토리)
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

interface AssignedRole {
  id: number
  code: string
  name: string
  isActive: boolean
}

/**
 * GET /api/role-groups/:id/roles
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<AssignedRole[]>>> {
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

    const roleGroup = await prisma.roleGroup.findUnique({ where: { roleGroupId } })
    if (!roleGroup) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'ROLE_GROUP_NOT_FOUND', message: '역할그룹을 찾을 수 없습니다' },
        },
        { status: 404 }
      )
    }

    const roleGroupRoles = await prisma.roleGroupRole.findMany({
      where: { roleGroupId },
      include: { role: true },
    })

    const data: AssignedRole[] = roleGroupRoles.map((rgr: {
      role: { roleId: number; roleCd: string; name: string; isActive: boolean }
    }) => ({
      id: rgr.role.roleId,
      code: rgr.role.roleCd,
      name: rgr.role.name,
      isActive: rgr.role.isActive,
    }))

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('GET /api/role-groups/:id/roles error:', error)
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
 * POST /api/role-groups/:id/roles
 * body: { roleIds: number[] }
 * 전체 교체 방식 - diff 기반으로 ASSIGN/REVOKE 히스토리 기록
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<AssignedRole[]>>> {
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

    const body = await request.json()
    const { roleIds } = body

    if (!Array.isArray(roleIds)) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'roleIds는 배열이어야 합니다' },
        },
        { status: 400 }
      )
    }

    const { id } = await params
    const roleGroupId = parseInt(id)

    const roleGroup = await prisma.roleGroup.findUnique({ where: { roleGroupId } })
    if (!roleGroup) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'ROLE_GROUP_NOT_FOUND', message: '역할그룹을 찾을 수 없습니다' },
        },
        { status: 404 }
      )
    }

    await prisma.$transaction(async (tx: {
      roleGroupRole: {
        findMany: typeof prisma.roleGroupRole.findMany
        deleteMany: typeof prisma.roleGroupRole.deleteMany
        createMany: typeof prisma.roleGroupRole.createMany
      }
      roleGroupRoleHistory: {
        updateMany: typeof prisma.roleGroupRoleHistory.updateMany
        createMany: typeof prisma.roleGroupRoleHistory.createMany
      }
      role: {
        findMany: typeof prisma.role.findMany
      }
    }) => {
      // 기존 할당 조회
      const currentRoles = await tx.roleGroupRole.findMany({
        where: { roleGroupId },
      })
      const currentRoleIds = new Set(currentRoles.map((r: { roleId: number }) => r.roleId))
      const newRoleIds = new Set(roleIds as number[])

      // Diff 계산
      const toRevoke = [...currentRoleIds].filter((id) => !newRoleIds.has(id))
      const toAssign = [...newRoleIds].filter((id) => !currentRoleIds.has(id))

      const now = new Date()

      // Revoke 히스토리
      if (toRevoke.length > 0) {
        await tx.roleGroupRoleHistory.updateMany({
          where: { roleGroupId, roleId: { in: toRevoke }, validTo: null },
          data: { validTo: now },
        })
        await tx.roleGroupRoleHistory.createMany({
          data: toRevoke.map((roleId) => ({
            roleGroupId,
            roleId,
            changeType: 'REVOKE',
            changedBy: session.user!.id,
            validTo: now,
          })),
        })
      }

      // Assign 히스토리
      if (toAssign.length > 0) {
        // 존재하는 역할만 필터링
        const validRoles = await tx.role.findMany({
          where: { roleId: { in: toAssign } },
          select: { roleId: true },
        })
        const validRoleIds = validRoles.map((r: { roleId: number }) => r.roleId)

        if (validRoleIds.length > 0) {
          await tx.roleGroupRoleHistory.createMany({
            data: validRoleIds.map((roleId: number) => ({
              roleGroupId,
              roleId,
              changeType: 'ASSIGN',
              changedBy: session.user!.id,
            })),
          })
        }
      }

      // 전체 교체
      await tx.roleGroupRole.deleteMany({ where: { roleGroupId } })
      if (roleIds.length > 0) {
        await tx.roleGroupRole.createMany({
          data: (roleIds as number[]).map((roleId) => ({
            roleGroupId,
            roleId,
          })),
        })
      }
    })

    // 최종 결과 조회
    const roleGroupRoles = await prisma.roleGroupRole.findMany({
      where: { roleGroupId },
      include: { role: true },
    })

    const data: AssignedRole[] = roleGroupRoles.map((rgr: {
      role: { roleId: number; roleCd: string; name: string; isActive: boolean }
    }) => ({
      id: rgr.role.roleId,
      code: rgr.role.roleCd,
      name: rgr.role.name,
      isActive: rgr.role.isActive,
    }))

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('POST /api/role-groups/:id/roles error:', error)
    return NextResponse.json(
      {
        success: false,
        error: { code: 'DB_ERROR', message: '데이터베이스 오류가 발생했습니다' },
      },
      { status: 500 }
    )
  }
}
