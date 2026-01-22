// components/templates/SelectPopupTemplate/types.ts
// 선택형 팝업 템플릿 타입 정의 (TSK-06-05)

import type { ColumnType, TablePaginationConfig } from 'antd/es/table'
import type { ReactNode, Key } from 'react'

/**
 * SelectPopupTemplate Props 인터페이스
 * 선택형 팝업 모달의 표준 Props 정의
 */
export interface SelectPopupTemplateProps<T extends Record<string, unknown>> {
  // === 모달 설정 ===
  /** 모달 열림 상태 */
  open: boolean
  /** 모달 닫기 콜백 */
  onClose: () => void
  /** 모달 제목 */
  title: string
  /** 모달 너비 (기본: 800) */
  width?: number | string

  // === 데이터 설정 ===
  /** 테이블 컬럼 정의 */
  columns: ColumnType<T>[]
  /** 테이블 데이터 */
  dataSource: T[]
  /** 로딩 상태 */
  loading?: boolean
  /** 행 고유 키 */
  rowKey: keyof T | ((record: T) => string)

  // === 선택 설정 ===
  /** 다중 선택 모드 (기본: false) */
  multiple?: boolean
  /** 외부에서 제어되는 선택 키 */
  selectedKeys?: Key[]
  /** 선택 완료 콜백 */
  onSelect: (selectedRows: T[]) => void
  /** 단일 선택 시 행 클릭으로 즉시 완료 여부 (기본: false) */
  selectOnRowClick?: boolean

  // === 검색 설정 ===
  /** 검색 입력 플레이스홀더 */
  searchPlaceholder?: string
  /** 검색 콜백 (서버 모드 시 사용) */
  onSearch?: (keyword: string) => void
  /** 검색 모드 (기본: 'client') */
  searchMode?: 'client' | 'server'
  /** 서버 검색 시 디바운스 지연 (기본: 300ms) */
  searchDebounceMs?: number
  /** 클라이언트 검색 시 필터링 대상 필드 */
  searchFields?: (keyof T)[]

  // === 페이지네이션 설정 ===
  /** 페이지네이션 설정 */
  pagination?: TablePaginationConfig | false
  /** 페이지 변경 콜백 (서버 모드 시 사용) */
  onPaginationChange?: (page: number, pageSize: number) => void
  /** 서버 페이지네이션 시 전체 건수 */
  total?: number

  // === 권한 관리 ===
  /** 권한 설정 */
  permissions?: {
    /** 선택 권한 (기본: true) */
    canSelect?: boolean
  }

  // === 에러 상태 ===
  /** 에러 상태 */
  error?: {
    /** 에러 메시지 */
    message?: string
    /** 재시도 콜백 */
    onRetry?: () => void
  }

  // === 슬롯 기반 커스터마이징 ===
  /** 검색 영역 추가 요소 */
  searchExtra?: ReactNode
  /** 테이블 상단 추가 요소 */
  tableHeader?: ReactNode
  /** 커스텀 푸터 */
  footer?: ReactNode | ((selectedRows: T[]) => ReactNode)
}
