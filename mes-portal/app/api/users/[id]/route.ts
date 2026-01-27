/**
 * TSK-05-01: 사용자 상세 관리 API
 *
 * GET /api/users/:id - 사용자 상세 조회
 * PUT /api/users/:id - 사용자 수정
 * DELETE /api/users/:id - 사용자 삭제 (비활성화)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const user = await prisma.user.findUnique({
      where: { userId: id },
      include: {
        userRoleGroups: {
          include: {
            roleGroup: {
              select: {
                roleGroupId: true,
                roleGroupCd: true,
                name: true,
              },
            },
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: '사용자를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user.userId,
        email: user.email,
        name: user.name,
        phone: user.phone,
        department: user.department,
        isActive: user.isActive,
        isLocked: user.isLocked,
        lockUntil: user.lockUntil?.toISOString() ?? null,
        mustChangePassword: user.mustChangePassword,
        lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
        roleGroups: user.userRoleGroups.map((urg) => urg.roleGroup),
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('[Users] GET detail error:', error)
    return NextResponse.json(
      { success: false, error: '사용자 조회 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

interface UpdateUserDto {
  name?: string
  phone?: string
  department?: string
  isActive?: boolean
  roleGroupIds?: number[]
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const existingUser = await prisma.user.findUnique({ where: { userId: id } })
    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: '사용자를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    const body: UpdateUserDto = await request.json()

    // 트랜잭션으로 사용자 수정 및 역할그룹 업데이트
    const user = await prisma.$transaction(async (tx) => {
      // 사용자 정보 업데이트
      const updated = await tx.user.update({
        where: { userId: id },
        data: {
          name: body.name,
          phone: body.phone,
          department: body.department,
          isActive: body.isActive,
        },
        include: {
          userRoleGroups: {
            include: {
              roleGroup: {
                select: {
                  roleGroupId: true,
                  roleGroupCd: true,
                  name: true,
                },
              },
            },
          },
        },
      })

      // 역할그룹 업데이트 (제공된 경우)
      if (body.roleGroupIds !== undefined) {
        // 기존 역할그룹 삭제
        await tx.userRoleGroup.deleteMany({ where: { userId: id } })

        // 새 역할그룹 할당
        if (body.roleGroupIds.length > 0) {
          await tx.userRoleGroup.createMany({
            data: body.roleGroupIds.map((roleGroupId) => ({
              userId: id,
              roleGroupId,
            })),
          })
        }

        // 역할그룹 다시 조회
        const userWithRoleGroups = await tx.user.findUnique({
          where: { userId: id },
          include: {
            userRoleGroups: {
              include: {
                roleGroup: {
                  select: {
                    roleGroupId: true,
                    roleGroupCd: true,
                    name: true,
                  },
                },
              },
            },
          },
        })

        return userWithRoleGroups!
      }

      return updated
    })

    return NextResponse.json({
      success: true,
      data: {
        id: user.userId,
        email: user.email,
        name: user.name,
        phone: user.phone,
        department: user.department,
        isActive: user.isActive,
        isLocked: user.isLocked,
        roleGroups: user.userRoleGroups.map((urg) => urg.roleGroup),
        updatedAt: user.updatedAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('[Users] PUT error:', error)
    return NextResponse.json(
      { success: false, error: '사용자 수정 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const existingUser = await prisma.user.findUnique({ where: { userId: id } })
    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: '사용자를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 소프트 삭제 (비활성화)
    await prisma.user.update({
      where: { userId: id },
      data: { isActive: false },
    })

    return NextResponse.json({
      success: true,
      message: '사용자가 비활성화되었습니다',
    })
  } catch (error) {
    console.error('[Users] DELETE error:', error)
    return NextResponse.json(
      { success: false, error: '사용자 삭제 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
