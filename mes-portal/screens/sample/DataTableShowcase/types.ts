// screens/sample/DataTableShowcase/types.ts
// 데이터 테이블 종합 샘플 타입 정의

/**
 * 제품 상태
 */
export type ProductStatus = 'active' | 'inactive' | 'pending'

/**
 * 상태 레이블 매핑
 */
export const STATUS_LABELS: Record<ProductStatus, string> = {
  active: '활성',
  inactive: '비활성',
  pending: '대기',
}

/**
 * 상태 색상 매핑
 */
export const STATUS_COLORS: Record<ProductStatus, string> = {
  active: 'green',
  inactive: 'default',
  pending: 'orange',
}

/**
 * 카테고리 타입
 */
export type Category = '전자' | '가구' | '의류' | '식품'

/**
 * 프로세스 정보
 */
export interface ProcessInfo {
  name: string
  status: 'completed' | 'in_progress' | 'pending' | 'failed'
  duration: string
}

/**
 * 제품 상세 정보
 */
export interface ProductDetails {
  description: string
  manufacturer: string
  warranty: string
  processes: ProcessInfo[]
}

/**
 * 제품 데이터
 */
export interface Product {
  id: number
  name: string
  category: Category
  categoryCode: string
  quantity: number
  price: number
  status: ProductStatus
  statusLabel: string
  createdAt: string
  updatedAt: string
  details: ProductDetails
}

/**
 * 컬럼 정의 (Mock 데이터 스키마)
 */
export interface ColumnDefinition {
  key: string
  title: string
  dataType: 'text' | 'number' | 'date' | 'dropdown'
  options?: string[]
  filterable?: boolean
  sortable?: boolean
  editable?: boolean
  mergeable?: boolean
  format?: string
  width?: number
}

/**
 * 그룹 헤더 정의
 */
export interface GroupHeader {
  title: string
  children: string[]
}

/**
 * Mock 데이터 응답
 */
export interface DataTableResponse {
  data: Product[]
  total: number
  columns: ColumnDefinition[]
  groupHeaders: GroupHeader[]
}

/**
 * 필터 조건
 */
export interface FilterCondition {
  column: string
  type: 'text' | 'number' | 'date' | 'dropdown'
  value?: string
  min?: number
  max?: number
  dateRange?: [string, string]
}

/**
 * 정렬 조건
 */
export interface SortCondition {
  column: string
  order: 'ascend' | 'descend'
}

/**
 * 기능 토글 상태
 */
export interface FeatureToggles {
  sorting: boolean
  filtering: boolean
  pagination: boolean
  selection: boolean
  resize: boolean
  reorder: boolean
  sticky: boolean
  expandable: boolean
  inlineEdit: boolean
  rowDrag: boolean
  virtualScroll: boolean
  groupHeader: boolean
  cellMerge: boolean
}

/**
 * 기본 기능 토글 상태
 */
export const DEFAULT_FEATURE_TOGGLES: FeatureToggles = {
  sorting: true,
  filtering: true,
  pagination: true,
  selection: true,
  resize: true,
  reorder: false,
  sticky: true,
  expandable: true,
  inlineEdit: true,
  rowDrag: false,
  virtualScroll: false,
  groupHeader: false,
  cellMerge: false,
}

/**
 * 기능 토글 레이블
 */
export const FEATURE_TOGGLE_LABELS: Record<keyof FeatureToggles, string> = {
  sorting: '정렬',
  filtering: '필터링',
  pagination: '페이지네이션',
  selection: '행 선택',
  resize: '컬럼 리사이즈',
  reorder: '컬럼 순서변경',
  sticky: '고정 컬럼/헤더',
  expandable: '확장 행',
  inlineEdit: '인라인 편집',
  rowDrag: '행 드래그',
  virtualScroll: '가상 스크롤',
  groupHeader: '그룹 헤더',
  cellMerge: '셀 병합',
}

/**
 * 컬럼 설정 (저장용)
 */
export interface ColumnSettings {
  key: string
  width: number
  order: number
  visible: boolean
}

/**
 * 인라인 편집 셀 정보
 */
export interface EditingCell {
  rowId: number
  columnKey: string
  value: string | number
}
