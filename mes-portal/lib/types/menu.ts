/**
 * 메뉴 타입 정의 (TSK-03-01)
 * RBAC 리디자인: category path 기반 트리 구조
 */

/**
 * 메뉴 아이템 인터페이스 - API 응답용
 * category path (예: "조업관리/생산실적")로 트리를 구축
 */
export interface MenuItem {
  menuId: number
  menuCd: string
  name: string
  path: string | null
  icon: string | null
  sortOrder: string
  category: string
  systemId: string
  children: MenuItem[]
}

/**
 * 메뉴 생성 DTO
 */
export interface CreateMenuDto {
  menuCd: string
  name: string
  systemId: string
  category: string
  path?: string | null
  icon?: string | null
  sortOrder?: string
  isActive?: boolean
}

/**
 * 메뉴 수정 DTO
 */
export interface UpdateMenuDto {
  menuCd?: string
  name?: string
  category?: string
  path?: string | null
  icon?: string | null
  sortOrder?: string
  isActive?: boolean
}

/**
 * API 응답 형식
 */
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
}

/**
 * 허용된 아이콘 목록 (Ant Design Icons)
 */
export const ALLOWED_ICONS = [
  'DashboardOutlined',
  'BarChartOutlined',
  'ToolOutlined',
  'FileTextOutlined',
  'FolderOutlined',
  'EditOutlined',
  'HistoryOutlined',
  'AppstoreOutlined',
  'UnorderedListOutlined',
  'SplitCellsOutlined',
  'FundProjectionScreenOutlined',
  'SettingOutlined',
  'UserOutlined',
  'TeamOutlined',
  'MenuOutlined',
  'HomeOutlined',
  'SearchOutlined',
  'PlusOutlined',
  'DeleteOutlined',
  'SaveOutlined',
  'CloseOutlined',
  'CheckOutlined',
  'InfoCircleOutlined',
  'WarningOutlined',
  'QuestionCircleOutlined',
  'ExclamationCircleOutlined',
] as const

export type AllowedIcon = (typeof ALLOWED_ICONS)[number]

/**
 * 에러 코드
 */
export const MenuErrorCode = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  USER_INACTIVE: 'USER_INACTIVE',
  MENU_NOT_FOUND: 'MENU_NOT_FOUND',
  DUPLICATE_MENU_CODE: 'DUPLICATE_MENU_CODE',
  INVALID_CATEGORY: 'INVALID_CATEGORY',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  DB_CONNECTION_ERROR: 'DB_CONNECTION_ERROR',
  DB_ERROR: 'DB_ERROR',
} as const

export type MenuErrorCodeType = (typeof MenuErrorCode)[keyof typeof MenuErrorCode]
