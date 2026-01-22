// screens/sample/UserList/types.ts
// 사용자 목록 샘플 화면 타입 정의 (TSK-06-07)

/**
 * 사용자 상태
 */
export type UserStatus = 'active' | 'inactive' | 'pending'

/**
 * 사용자 역할
 */
export type UserRole = 'ADMIN' | 'MANAGER' | 'USER'

/**
 * 사용자 정보 인터페이스
 */
export interface User {
  id: string
  name: string
  email: string
  status: UserStatus
  role: UserRole
  roleLabel: string
  department?: string
  phone?: string
  createdAt: string
  lastLoginAt?: string | null
}

/**
 * 사용자 목록 응답 인터페이스
 */
export interface UserListResponse {
  users: User[]
  total: number
}

/**
 * 검색 파라미터 인터페이스
 */
export interface UserSearchParams {
  name?: string
  email?: string
  status?: UserStatus | ''
}

/**
 * 사용자 상세 모달 Props
 */
export interface UserDetailModalProps {
  open: boolean
  user: User | null
  onClose: () => void
}

/**
 * 상태별 색상 매핑
 */
export const STATUS_COLORS: Record<UserStatus, string> = {
  active: 'success',
  inactive: 'error',
  pending: 'warning',
}

/**
 * 상태별 라벨 매핑
 */
export const STATUS_LABELS: Record<UserStatus, string> = {
  active: '활성',
  inactive: '비활성',
  pending: '대기',
}
