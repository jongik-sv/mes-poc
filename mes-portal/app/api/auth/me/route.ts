import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // 사용자의 역할 및 권한 정보 조회
  const user = await prisma.user.findUnique({
    where: { userId: session.user.id },
    include: {
      userRoleGroups: {
        include: {
          roleGroup: {
            include: {
              roleGroupRoles: {
                include: {
                  role: {
                    include: {
                      rolePermissions: {
                        include: {
                          permission: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  })

  if (!user) {
    return NextResponse.json(
      { success: false, error: 'User not found' },
      { status: 404 }
    )
  }

  // 역할 및 권한 추출
  const roles = user.userRoleGroups.flatMap((urg) =>
    urg.roleGroup.roleGroupRoles.map((rgr) => ({
      id: rgr.role.roleId,
      code: rgr.role.roleCd,
      name: rgr.role.name,
    }))
  )

  const permissions = [
    ...new Set(
      user.userRoleGroups.flatMap((urg) =>
        urg.roleGroup.roleGroupRoles.flatMap((rgr) =>
          rgr.role.rolePermissions.map((rp) => rp.permission.permissionCd)
        )
      )
    ),
  ]

  return NextResponse.json({
    success: true,
    data: {
      id: user.userId,
      email: user.email,
      name: user.name,
      department: user.department,
      phone: user.phone,
      isActive: user.isActive,
      mustChangePassword: user.mustChangePassword,
      lastLoginAt: user.lastLoginAt,
      roles,
      permissions,
    },
  })
}
