/**
 * usePermission 훅 (TSK-03-01)
 *
 * 세션의 MergedPermission을 기반으로 클라이언트 권한 체크
 */

'use client'

import { useMemo } from 'react'
import { useSession } from 'next-auth/react'
import type { MergedPermission } from '@/lib/auth/permission-merge'
import type { Actions } from '@/lib/auth/ability'

interface UsePermissionReturn {
  can: (action: Actions, menuId: number) => boolean
  getFieldConstraints: (menuId: number) => Record<string, string[] | null> | null
  permissions: MergedPermission[]
}

export function usePermission(): UsePermissionReturn {
  const { data: session } = useSession()

  const permissions: MergedPermission[] = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (session?.user as any)?.mergedPermissions ?? []
  }, [session])

  const can = useMemo(() => {
    return (action: Actions, menuId: number): boolean => {
      const perm = permissions.find((p) => p.menuId === menuId)
      if (!perm) return false
      return perm.actions.includes(action)
    }
  }, [permissions])

  const getFieldConstraints = useMemo(() => {
    return (menuId: number): Record<string, string[] | null> | null => {
      const perm = permissions.find((p) => p.menuId === menuId)
      if (!perm) return null
      return perm.fieldConstraints
    }
  }, [permissions])

  return { can, getFieldConstraints, permissions }
}
