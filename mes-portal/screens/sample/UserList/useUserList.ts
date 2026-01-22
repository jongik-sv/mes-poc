// screens/sample/UserList/useUserList.ts
// 사용자 목록 데이터 관리 훅 (TSK-06-07)

'use client'

import { useState, useCallback, useMemo } from 'react'
import usersData from '@/mock-data/users.json'
import type { User, UserSearchParams } from './types'

/**
 * 사용자 필터링 함수
 */
export function filterUsers(
  users: User[],
  params: UserSearchParams
): User[] {
  return users.filter((user) => {
    // 이름 필터 (부분 일치 - BR-001)
    if (params.name && !user.name.toLowerCase().includes(params.name.toLowerCase())) {
      return false
    }

    // 이메일 필터 (부분 일치 - BR-001)
    if (params.email && !user.email.toLowerCase().includes(params.email.toLowerCase())) {
      return false
    }

    // 상태 필터 (완전 일치 - BR-002)
    if (params.status && user.status !== params.status) {
      return false
    }

    return true
  })
}

/**
 * 사용자 정렬 함수
 */
export function sortUsers(
  users: User[],
  field: keyof User,
  order: 'ascend' | 'descend' | null
): User[] {
  if (!order) return users

  return [...users].sort((a, b) => {
    const aValue = a[field]
    const bValue = b[field]

    if (aValue === null || aValue === undefined) return order === 'ascend' ? 1 : -1
    if (bValue === null || bValue === undefined) return order === 'ascend' ? -1 : 1

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const comparison = aValue.localeCompare(bValue, 'ko')
      return order === 'ascend' ? comparison : -comparison
    }

    return 0
  })
}

/**
 * useUserList 훅 반환 타입
 */
export interface UseUserListReturn {
  // 데이터 상태
  users: User[]
  loading: boolean
  error: Error | null

  // 필터링된 데이터
  filteredUsers: User[]

  // 검색/필터 관련
  searchParams: UserSearchParams
  setSearchParams: (params: UserSearchParams) => void

  // CRUD 작업
  deleteUsers: (ids: string[]) => Promise<void>
  refetch: () => void
}

/**
 * 사용자 목록 데이터 관리 훅
 *
 * 책임:
 * - mock 데이터 로드
 * - 필터링 로직
 * - 삭제 작업
 */
export function useUserList(): UseUserListReturn {
  // 원본 데이터 (mock에서 로드 후 삭제 반영)
  const [users, setUsers] = useState<User[]>(() => usersData.users as User[])
  const [loading, setLoading] = useState(false)
  const [error] = useState<Error | null>(null)

  // 검색 파라미터
  const [searchParams, setSearchParams] = useState<UserSearchParams>({})

  // 필터링된 데이터 (memoized)
  const filteredUsers = useMemo(() => {
    return filterUsers(users, searchParams)
  }, [users, searchParams])

  /**
   * 사용자 삭제 (BR-003: 확인 다이얼로그는 컴포넌트에서 처리)
   */
  const deleteUsers = useCallback(async (ids: string[]) => {
    setLoading(true)
    try {
      // mock: 실제로는 API 호출
      await new Promise((resolve) => setTimeout(resolve, 300))
      setUsers((prev) => prev.filter((user) => !ids.includes(user.id)))
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * 데이터 다시 로드
   */
  const refetch = useCallback(() => {
    setUsers(usersData.users as User[])
  }, [])

  return {
    users,
    loading,
    error,
    filteredUsers,
    searchParams,
    setSearchParams,
    deleteUsers,
    refetch,
  }
}

export default useUserList
