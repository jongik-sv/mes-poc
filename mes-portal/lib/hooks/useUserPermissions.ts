/**
 * useUserPermissions Hook (TSK-03-03)
 *
 * 현재 세션에서 사용자 권한을 로드
 */

import { useSession } from 'next-auth/react'

interface UseUserPermissionsResult {
  permissions: string[]
  isLoading: boolean
  isAuthenticated: boolean
}

/**
 * 사용자 권한 로드 Hook
 *
 * @returns permissions, isLoading, isAuthenticated
 *
 * @example
 * const { permissions, isLoading, isAuthenticated } = useUserPermissions()
 * if (isLoading) return <Spinner />
 * if (!isAuthenticated) return <LoginPrompt />
 */
export function useUserPermissions(): UseUserPermissionsResult {
  const { data: session, status } = useSession()

  // 세션에서 권한 추출
  const permissions = (session?.user as { permissions?: string[] } | undefined)
    ?.permissions || []

  return {
    permissions,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
  }
}
