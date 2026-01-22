// components/templates/ListTemplate/types.ts
// 목록(조회) 화면 템플릿 타입 정의 (TSK-06-01)

import type { ReactNode } from 'react'
import type { Dayjs } from 'dayjs'
import type { TableProps, TablePaginationConfig } from 'antd'
import type { TableRowSelection } from 'antd/es/table/interface'
import type { DataTableColumn } from '@/components/common/DataTable'

/**
 * 검색 필드 타입
 */
export type SearchFieldType =
  | 'text'
  | 'select'
  | 'multiSelect'
  | 'date'
  | 'dateRange'
  | 'number'
  | 'checkbox'

/**
 * 검색 필드 옵션 (select, multiSelect 용)
 */
export interface SearchFieldOption {
  label: string
  value: string | number
}

/**
 * 검색 필드 정의
 */
export interface SearchFieldDefinition {
  /** 필드명 (API 파라미터 키) */
  name: string
  /** 라벨 */
  label: string
  /** 필드 타입 */
  type: SearchFieldType

  // 레이아웃
  /** 그리드 span (기본: 6) */
  span?: number

  // 필드별 옵션
  /** 플레이스홀더 */
  placeholder?: string
  /** select, multiSelect용 옵션 */
  options?: SearchFieldOption[]
  /** 기본값 */
  defaultValue?: unknown

  // 날짜 관련
  /** 날짜 프리셋 표시 (기본: true) */
  showPresets?: boolean
  /** 비활성 날짜 함수 */
  disabledDate?: (date: Dayjs) => boolean

  // 검색 조건 변환
  /** API 파라미터명 (name과 다른 경우) */
  paramName?: string
  /** 값 변환 함수 */
  transformValue?: (value: unknown) => unknown

  // 날짜 범위 -> API 파라미터 변환
  /** 시작일 파라미터명 (dateRange용) */
  startParamName?: string
  /** 종료일 파라미터명 (dateRange용) */
  endParamName?: string
}

/**
 * 권한 인터페이스 (SEC-001)
 */
export interface ListTemplatePermissions {
  /** 신규 등록 권한 (기본: true) */
  canAdd?: boolean
  /** 삭제 권한 (기본: true) */
  canDelete?: boolean
  /** 조회 권한 (기본: true) */
  canView?: boolean
}

/**
 * ListTemplate Props
 */
export interface ListTemplateProps<T extends Record<string, unknown>> {
  // === 권한 관리 ===
  /** 권한 설정 (SEC-001) */
  permissions?: ListTemplatePermissions

  // === 검색 조건 영역 ===
  /** 검색 필드 정의 */
  searchFields?: SearchFieldDefinition[]
  /** 초기 검색 조건 값 */
  initialValues?: Record<string, unknown>
  /** 검색 콜백 */
  onSearch?: (params: Record<string, unknown>) => void
  /** 초기화 콜백 */
  onReset?: () => void
  /** 초기화 시 자동 검색 (기본: true) */
  autoSearchOnReset?: boolean
  /** 마운트 시 자동 검색 (기본: true) */
  autoSearchOnMount?: boolean

  // 검색 영역 커스터마이징
  /** 검색 카드 제목 (기본: 없음) */
  searchCardTitle?: string
  /** 검색 영역 추가 버튼 */
  searchExtra?: ReactNode
  /** 검색 카드 숨기기 */
  hideSearchCard?: boolean

  // === 테이블 영역 ===
  /** 테이블 컬럼 정의 */
  columns: DataTableColumn<T>[]
  /** 테이블 데이터 */
  dataSource: T[]
  /** 로딩 상태 */
  loading?: boolean
  /** 행 고유 키 */
  rowKey: keyof T | ((record: T) => string)

  // 페이지네이션
  /** 페이지네이션 설정 */
  pagination?: TablePaginationConfig | false
  /** 전체 건수 */
  total?: number

  // 정렬
  /** 정렬 모드 (기본: 'client') */
  sortMode?: 'client' | 'server'
  /** 서버 정렬 콜백 */
  onSort?: (field: string, order: 'ascend' | 'descend' | null) => void

  // 행 선택
  /** 행 선택 설정 */
  rowSelection?: TableRowSelection<T>

  // === 액션 버튼 ===
  /** 신규 버튼 클릭 */
  onAdd?: () => void
  /** 신규 버튼 텍스트 (기본: '신규') */
  addButtonText?: string
  /** 삭제 콜백 */
  onDelete?: (selectedRows: T[]) => Promise<void> | void
  /** 삭제 버튼 텍스트 (기본: '삭제') */
  deleteButtonText?: string
  /** 삭제 확인 메시지 */
  deleteConfirmMessage?: string | ((count: number) => string)

  // 추가 액션 버튼
  /** 툴바 추가 버튼 */
  toolbarExtra?: ReactNode

  // === 행 클릭 ===
  /** 행 클릭 콜백 */
  onRowClick?: (record: T) => void

  // === 스타일 ===
  className?: string
  style?: React.CSSProperties
}

/**
 * SearchForm Props
 */
export interface SearchFormProps {
  /** 검색 필드 정의 */
  fields: SearchFieldDefinition[]
  /** 폼 값 */
  values: Record<string, unknown>
  /** 값 변경 콜백 */
  onChange: (values: Record<string, unknown>) => void
  /** 검색 콜백 */
  onSearch: () => void
  /** 초기화 콜백 */
  onReset: () => void
  /** 로딩 상태 */
  loading?: boolean
  /** 추가 영역 */
  extra?: ReactNode
}

/**
 * Toolbar Props
 */
export interface ToolbarProps {
  /** 신규 버튼 클릭 */
  onAdd?: () => void
  /** 신규 버튼 텍스트 */
  addButtonText?: string
  /** 삭제 콜백 */
  onDelete?: () => void
  /** 삭제 버튼 텍스트 */
  deleteButtonText?: string
  /** 선택된 행 개수 */
  selectedCount: number
  /** 총 데이터 건수 */
  total: number
  /** 삭제 버튼 비활성화 */
  deleteDisabled?: boolean
  /** 신규 버튼 비활성화 */
  addDisabled?: boolean
  /** 추가 버튼 영역 */
  extra?: ReactNode
  /** 로딩 상태 */
  loading?: boolean
}
