/**
 * 즐겨찾기 타입 정의 (TSK-03-04)
 */

/**
 * 즐겨찾기 데이터 인터페이스 (localStorage 저장용)
 */
export interface FavoriteData {
  userId: number
  menuIds: string[]
  updatedAt: string
}

/**
 * 즐겨찾기 메뉴 아이템 인터페이스
 */
export interface FavoriteMenuItem {
  id: string
  code: string
  name: string
  path: string
  icon: string | null
}

/**
 * 즐겨찾기 추가/제거 결과
 */
export interface FavoriteActionResult {
  success: boolean
  error?: FavoriteErrorCode
}

/**
 * 에러 코드
 */
export const FavoriteErrorCode = {
  MAX_FAVORITES_EXCEEDED: 'MAX_FAVORITES_EXCEEDED',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  NOT_FOUND: 'NOT_FOUND',
  INVALID_MENU: 'INVALID_MENU',
  STORAGE_ERROR: 'STORAGE_ERROR',
} as const

export type FavoriteErrorCode = (typeof FavoriteErrorCode)[keyof typeof FavoriteErrorCode]

/**
 * 즐겨찾기 설정 상수
 */
export const FAVORITES_CONFIG = {
  STORAGE_KEY_PREFIX: 'mes-favorites-',
  MAX_FAVORITES: 20,
} as const
