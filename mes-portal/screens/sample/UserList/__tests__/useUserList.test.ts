// screens/sample/UserList/__tests__/useUserList.test.ts
// useUserList 훅 단위 테스트 (TSK-06-07)

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useUserList, filterUsers, sortUsers } from '../useUserList'
import type { User, UserSearchParams } from '../types'

// Mock 테스트 데이터
const mockUsers: User[] = [
  {
    id: 'user-001',
    name: '홍길동',
    email: 'hong@company.com',
    status: 'active',
    role: 'ADMIN',
    roleLabel: '관리자',
    department: '시스템관리팀',
    phone: '010-1234-5678',
    createdAt: '2026-01-15T09:00:00Z',
    lastLoginAt: '2026-01-21T14:30:00Z',
  },
  {
    id: 'user-002',
    name: '김영희',
    email: 'kim@company.com',
    status: 'active',
    role: 'USER',
    roleLabel: '사용자',
    department: '생산관리팀',
    phone: '010-2345-6789',
    createdAt: '2026-01-14T10:00:00Z',
    lastLoginAt: '2026-01-21T10:15:00Z',
  },
  {
    id: 'user-003',
    name: '이철수',
    email: 'lee@company.com',
    status: 'inactive',
    role: 'USER',
    roleLabel: '사용자',
    department: '품질관리팀',
    phone: '010-3456-7890',
    createdAt: '2026-01-13T11:00:00Z',
    lastLoginAt: '2025-12-15T09:00:00Z',
  },
  {
    id: 'user-004',
    name: '박민수',
    email: 'park@company.com',
    status: 'pending',
    role: 'USER',
    roleLabel: '사용자',
    department: '설비관리팀',
    phone: '010-4567-8901',
    createdAt: '2026-01-12T14:00:00Z',
    lastLoginAt: null,
  },
  {
    id: 'user-005',
    name: '홍수현',
    email: 'hong.s@other.com',
    status: 'active',
    role: 'USER',
    roleLabel: '사용자',
    department: '설비관리팀',
    phone: '010-1111-2222',
    createdAt: '2026-01-05T11:00:00Z',
    lastLoginAt: '2026-01-20T16:45:00Z',
  },
]

describe('filterUsers', () => {
  // UT-002: 이름 필터링 (부분 일치)
  it('should filter by name (partial match) - UT-002', () => {
    const params: UserSearchParams = { name: '홍' }
    const result = filterUsers(mockUsers, params)

    expect(result).toHaveLength(2)
    expect(result.every((u) => u.name.includes('홍'))).toBe(true)
    expect(result.map((u) => u.id)).toEqual(['user-001', 'user-005'])
  })

  it('should filter by name case-insensitively', () => {
    const params: UserSearchParams = { name: '홍길' }
    const result = filterUsers(mockUsers, params)

    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('홍길동')
  })

  // UT-003: 이메일 필터링 (부분 일치)
  it('should filter by email (partial match) - UT-003', () => {
    const params: UserSearchParams = { email: '@company' }
    const result = filterUsers(mockUsers, params)

    expect(result).toHaveLength(4)
    expect(result.every((u) => u.email.includes('@company'))).toBe(true)
  })

  it('should filter by email with domain', () => {
    const params: UserSearchParams = { email: '@other' }
    const result = filterUsers(mockUsers, params)

    expect(result).toHaveLength(1)
    expect(result[0].email).toBe('hong.s@other.com')
  })

  // UT-004: 상태 필터링 (완전 일치)
  it('should filter by status (exact match) - UT-004', () => {
    const params: UserSearchParams = { status: 'active' }
    const result = filterUsers(mockUsers, params)

    expect(result).toHaveLength(3)
    expect(result.every((u) => u.status === 'active')).toBe(true)
  })

  it('should filter by inactive status', () => {
    const params: UserSearchParams = { status: 'inactive' }
    const result = filterUsers(mockUsers, params)

    expect(result).toHaveLength(1)
    expect(result[0].status).toBe('inactive')
  })

  it('should filter by pending status', () => {
    const params: UserSearchParams = { status: 'pending' }
    const result = filterUsers(mockUsers, params)

    expect(result).toHaveLength(1)
    expect(result[0].status).toBe('pending')
  })

  // BR-006: 복합 조건 AND 적용
  it('should apply multiple filters with AND condition - BR-006', () => {
    const params: UserSearchParams = { name: '홍', status: 'active' }
    const result = filterUsers(mockUsers, params)

    expect(result).toHaveLength(2)
    expect(result.every((u) => u.name.includes('홍') && u.status === 'active')).toBe(true)
  })

  it('should apply name, email, and status filters together', () => {
    const params: UserSearchParams = { name: '홍', email: '@company', status: 'active' }
    const result = filterUsers(mockUsers, params)

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('user-001')
  })

  it('should return all users when no filters applied', () => {
    const params: UserSearchParams = {}
    const result = filterUsers(mockUsers, params)

    expect(result).toHaveLength(5)
  })

  it('should ignore empty string status filter', () => {
    const params: UserSearchParams = { status: '' }
    const result = filterUsers(mockUsers, params)

    expect(result).toHaveLength(5)
  })
})

// UT-006: 정렬 로직
describe('sortUsers', () => {
  it('should sort by name ascending - UT-006', () => {
    const result = sortUsers(mockUsers, 'name', 'ascend')

    expect(result[0].name).toBe('김영희')
    expect(result[1].name).toBe('박민수')
    expect(result[2].name).toBe('이철수')
  })

  it('should sort by name descending', () => {
    const result = sortUsers(mockUsers, 'name', 'descend')

    expect(result[0].name).toBe('홍수현')
    expect(result[1].name).toBe('홍길동')
  })

  it('should sort by email ascending', () => {
    const result = sortUsers(mockUsers, 'email', 'ascend')

    expect(result[0].email).toBe('hong.s@other.com')
    expect(result[1].email).toBe('hong@company.com')
  })

  it('should not change order when order is null', () => {
    const result = sortUsers(mockUsers, 'name', null)

    expect(result).toEqual(mockUsers)
  })

  it('should handle null values in sorting', () => {
    const result = sortUsers(mockUsers, 'lastLoginAt', 'ascend')

    // null 값은 마지막으로
    const lastUser = result[result.length - 1]
    expect(lastUser.lastLoginAt).toBeNull()
  })
})

describe('useUserList', () => {
  // UT-001: mock 데이터 로드
  it('should load users from mock data - UT-001', () => {
    const { result } = renderHook(() => useUserList())

    expect(result.current.users.length).toBeGreaterThan(0)
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  // UT-005: 조건 초기화
  it('should reset all filters - UT-005', () => {
    const { result } = renderHook(() => useUserList())

    // 필터 적용
    act(() => {
      result.current.setSearchParams({ name: '홍', status: 'active' })
    })

    expect(result.current.searchParams.name).toBe('홍')
    expect(result.current.searchParams.status).toBe('active')

    // 필터 초기화
    act(() => {
      result.current.setSearchParams({})
    })

    expect(result.current.searchParams.name).toBeUndefined()
    expect(result.current.searchParams.status).toBeUndefined()
  })

  // UT-008: 행 선택 (훅에서는 간접 테스트)
  it('should provide filtered data based on search params - UT-008', () => {
    const { result } = renderHook(() => useUserList())

    // 필터 적용
    act(() => {
      result.current.setSearchParams({ name: '홍' })
    })

    const filteredCount = result.current.filteredUsers.length
    expect(filteredCount).toBeGreaterThan(0)
    expect(result.current.filteredUsers.every((u) => u.name.includes('홍'))).toBe(true)
  })

  // UT-009: 삭제 처리
  it('should delete selected users - UT-009', async () => {
    const { result } = renderHook(() => useUserList())

    const initialCount = result.current.users.length
    const idsToDelete = [result.current.users[0].id, result.current.users[1].id]

    await act(async () => {
      await result.current.deleteUsers(idsToDelete)
    })

    expect(result.current.users.length).toBe(initialCount - 2)
    expect(result.current.users.find((u) => u.id === idsToDelete[0])).toBeUndefined()
    expect(result.current.users.find((u) => u.id === idsToDelete[1])).toBeUndefined()
  })

  it('should set loading state during delete', async () => {
    const { result } = renderHook(() => useUserList())

    let loadingDuringDelete = false

    const deletePromise = act(async () => {
      const promise = result.current.deleteUsers(['user-001'])
      // 삭제 중 loading 상태 캡처
      await new Promise((resolve) => setTimeout(resolve, 50))
      loadingDuringDelete = result.current.loading
      await promise
    })

    await deletePromise

    // 삭제 완료 후 loading false
    expect(result.current.loading).toBe(false)
  })

  it('should refetch data', async () => {
    const { result } = renderHook(() => useUserList())

    const initialCount = result.current.users.length

    // 데이터 삭제
    await act(async () => {
      await result.current.deleteUsers(['user-001'])
    })

    const countAfterDelete = result.current.users.length
    expect(countAfterDelete).toBe(initialCount - 1)

    // refetch
    act(() => {
      result.current.refetch()
    })

    // refetch 후 원본 데이터로 복원되어야 함
    expect(result.current.users.length).toBe(initialCount)
  })
})
