'use client'

/**
 * PermissionGuard 컴포넌트 (TSK-03-03)
 *
 * 권한 기반 조건부 렌더링 컴포넌트
 */

import type { ReactNode } from 'react'
import { useUserPermissions } from '@/lib/hooks/useUserPermissions'
import { usePermission } from '@/lib/hooks/usePermission'
import type { Actions, Subjects } from '@/lib/auth/ability'

interface PermissionGuardProps {
  /** 확인할 액션 */
  action: Actions
  /** 확인할 리소스 */
  subject: Subjects
  /** 권한이 있을 때 렌더링할 내용 */
  children: ReactNode
  /** 권한이 없거나 로딩 중일 때 렌더링할 내용 (기본: null) */
  fallback?: ReactNode
  /** 로딩 중에도 children을 표시할지 여부 */
  showWhileLoading?: boolean
}

/**
 * 권한 기반 조건부 렌더링 컴포넌트
 *
 * @example
 * // 기본 사용
 * <PermissionGuard action="create" subject="User">
 *   <Button onClick={handleCreate}>사용자 추가</Button>
 * </PermissionGuard>
 *
 * @example
 * // fallback 사용
 * <PermissionGuard
 *   action="delete"
 *   subject="Role"
 *   fallback={<Button disabled>권한 없음</Button>}
 * >
 *   <Button onClick={handleDelete}>삭제</Button>
 * </PermissionGuard>
 */
export function PermissionGuard({
  action,
  subject,
  children,
  fallback = null,
  showWhileLoading = false,
}: PermissionGuardProps) {
  const { permissions, isLoading, isAuthenticated } = useUserPermissions()
  const { can } = usePermission(permissions)

  // 로딩 중 처리
  if (isLoading) {
    if (showWhileLoading) {
      return <>{children}</>
    }
    return <>{fallback}</>
  }

  // 미인증 시 fallback
  if (!isAuthenticated) {
    return <>{fallback}</>
  }

  // 권한 체크
  if (!can(action, subject)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
