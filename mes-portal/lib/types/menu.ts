/**
 * 메뉴 타입 정의 (TSK-03-01)
 */

/**
 * 메뉴 아이템 인터페이스 - API 응답용
 */
export interface MenuItem {
  id: number
  code: string
  name: string
  path: string | null
  icon: string | null
  sortOrder: number
  children: MenuItem[]
}

/**
 * 메뉴 생성 DTO
 */
export interface CreateMenuDto {
  code: string
  name: string
  path?: string | null
  icon?: string | null
  parentId?: number | null
  sortOrder?: number
  isActive?: boolean
}

/**
 * 메뉴 수정 DTO
 */
export interface UpdateMenuDto {
  code?: string
  name?: string
  path?: string | null
  icon?: string | null
  parentId?: number | null
  sortOrder?: number
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
  MENU_NOT_FOUND: 'MENU_NOT_FOUND',
  DUPLICATE_MENU_CODE: 'DUPLICATE_MENU_CODE',
  MAX_DEPTH_EXCEEDED: 'MAX_DEPTH_EXCEEDED',
  CIRCULAR_REFERENCE: 'CIRCULAR_REFERENCE',
  HAS_CHILDREN: 'HAS_CHILDREN',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  DB_CONNECTION_ERROR: 'DB_CONNECTION_ERROR',
} as const

export type MenuErrorCodeType = (typeof MenuErrorCode)[keyof typeof MenuErrorCode]
