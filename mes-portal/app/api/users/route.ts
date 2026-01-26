/**
 * TSK-05-01: 사용자 관리 API
 *
 * GET /api/users - 사용자 목록 조회
 * POST /api/users - 사용자 등록
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@/lib/generated/prisma'
import { hashPassword } from '@/lib/auth/password'

interface UserQuery {
  page: number
  pageSize: number
  search?: string
  status?: 'active' | 'inactive' | 'locked'
  roleId?: number
}

function parseQueryParams(
  request: NextRequest
): UserQuery | { error: string } {
  const searchParams = request.nextUrl.searchParams

  const page = parseInt(searchParams.get('page') || '1', 10)
  const pageSize = parseInt(searchParams.get('pageSize') || '20', 10)

  if (pageSize > 100) {
    return { error: 'pageSize는 100을 초과할 수 없습니다' }
  }

  const query: UserQuery = { page, pageSize }

  const search = searchParams.get('search')
  if (search) {
    query.search = search
  }

  const status = searchParams.get('status')
  if (status && ['active', 'inactive', 'locked'].includes(status)) {
    query.status = status as UserQuery['status']
  }

  const roleIdStr = searchParams.get('roleId')
  if (roleIdStr) {
    const roleId = parseInt(roleIdStr, 10)
    if (!isNaN(roleId)) {
      query.roleId = roleId
    }
  }

  return query
}

function buildWhereClause(query: UserQuery): Prisma.UserWhereInput {
  const where: Prisma.UserWhereInput = {}

  if (query.search) {
    where.OR = [
      { name: { contains: query.search } },
      { email: { contains: query.search } },
    ]
  }

  if (query.status === 'active') {
    where.isActive = true
    where.isLocked = false
  } else if (query.status === 'inactive') {
    where.isActive = false
  } else if (query.status === 'locked') {
    where.isLocked = true
  }

  if (query.roleId) {
    where.userRoles = {
      some: { roleId: query.roleId },
    }
  }

  return where
}

export async function GET(request: NextRequest) {
  try {
    const queryResult = parseQueryParams(request)
    if ('error' in queryResult) {
      return NextResponse.json(
        { success: false, error: queryResult.error },
        { status: 400 }
      )
    }

    const query = queryResult
    const where = buildWhereClause(query)

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          userRoles: {
            include: {
              role: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      prisma.user.count({ where }),
    ])

    const data = users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      department: user.department,
      isActive: user.isActive,
      isLocked: user.isLocked,
      roles: user.userRoles.map((ur) => ur.role),
      lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
      createdAt: user.createdAt.toISOString(),
    }))

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.ceil(total / query.pageSize),
      },
    })
  } catch (error) {
    console.error('[Users] GET error:', error)
    return NextResponse.json(
      { success: false, error: '사용자 목록 조회 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

interface CreateUserDto {
  email: string
  name: string
  phone?: string
  department?: string
  roleIds: number[]
  isActive?: boolean
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateUserDto = await request.json()

    // 유효성 검사
    if (!body.email || !body.name) {
      return NextResponse.json(
        { success: false, error: '이메일과 이름은 필수입니다' },
        { status: 400 }
      )
    }

    // 이메일 중복 확인
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: '이미 등록된 이메일입니다' },
        { status: 400 }
      )
    }

    // 기본 비밀번호 생성 (초기 비밀번호)
    const defaultPassword = 'Password123!'
    const hashedPassword = await hashPassword(defaultPassword)

    // 사용자 생성
    const user = await prisma.user.create({
      data: {
        email: body.email,
        name: body.name,
        password: hashedPassword,
        phone: body.phone ?? null,
        department: body.department ?? null,
        isActive: body.isActive ?? true,
        mustChangePassword: true,
        userRoles: body.roleIds?.length
          ? {
              create: body.roleIds.map((roleId) => ({
                roleId,
              })),
            }
          : undefined,
      },
      include: {
        userRoles: {
          include: {
            role: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          department: user.department,
          isActive: user.isActive,
          isLocked: user.isLocked,
          roles: user.userRoles.map((ur) => ur.role),
          createdAt: user.createdAt.toISOString(),
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[Users] POST error:', error)
    return NextResponse.json(
      { success: false, error: '사용자 등록 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
