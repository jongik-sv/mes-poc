/**
 * TSK-05-01: 사용자 관리 API
 *
 * GET /api/users - 사용자 목록 조회
 * POST /api/users - 사용자 등록
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@/lib/generated/prisma/client'
import { hashPassword } from '@/lib/auth/password'

interface UserQuery {
  page: number
  pageSize: number
  search?: string
  status?: 'active' | 'inactive' | 'locked'
  roleGroupId?: number
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

  const roleGroupIdStr = searchParams.get('roleGroupId')
  if (roleGroupIdStr) {
    const roleGroupId = parseInt(roleGroupIdStr, 10)
    if (!isNaN(roleGroupId)) {
      query.roleGroupId = roleGroupId
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

  if (query.roleGroupId) {
    where.userRoleGroups = {
      some: { roleGroupId: query.roleGroupId },
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
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      prisma.user.count({ where }),
    ])

    const data = users.map((user) => ({
      id: user.userId,
      email: user.email,
      name: user.name,
      phone: user.phone,
      department: user.department,
      isActive: user.isActive,
      isLocked: user.isLocked,
      roleGroups: user.userRoleGroups.map((urg) => urg.roleGroup),
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
  userId: string
  email: string
  name: string
  phone?: string
  department?: string
  roleGroupIds?: number[]
  isActive?: boolean
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateUserDto = await request.json()

    // 유효성 검사
    if (!body.userId || !body.email || !body.name) {
      return NextResponse.json(
        { success: false, error: '사번, 이메일, 이름은 필수입니다' },
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

    // userId 중복 확인
    const existingUserId = await prisma.user.findUnique({
      where: { userId: body.userId },
    })

    if (existingUserId) {
      return NextResponse.json(
        { success: false, error: '이미 등록된 사번입니다' },
        { status: 400 }
      )
    }

    // 기본 비밀번호 생성 (초기 비밀번호)
    const defaultPassword = 'Password123!'
    const hashedPassword = await hashPassword(defaultPassword)

    // 사용자 생성
    const user = await prisma.user.create({
      data: {
        userId: body.userId,
        email: body.email,
        name: body.name,
        password: hashedPassword,
        phone: body.phone ?? null,
        department: body.department ?? null,
        isActive: body.isActive ?? true,
        mustChangePassword: true,
        userRoleGroups: body.roleGroupIds?.length
          ? {
              create: body.roleGroupIds.map((roleGroupId) => ({
                roleGroupId,
              })),
            }
          : undefined,
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

    return NextResponse.json(
      {
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
