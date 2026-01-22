// components/templates/MasterDetailTemplate/types.ts
// 마스터-디테일 화면 템플릿 타입 정의 (TSK-06-04)

import type { ReactNode, CSSProperties } from 'react'

/**
 * MasterDetailTemplate Props
 *
 * @template M - 마스터 아이템 타입
 */
export interface MasterDetailTemplateProps<M = unknown> {
  // === 마스터 영역 ===
  /** 마스터 영역 타이틀 */
  masterTitle?: string
  /** 마스터 영역 컨텐츠 (리스트, 트리 등) */
  masterContent: ReactNode
  /** 마스터 검색 기능 활성화 */
  masterSearchable?: boolean
  /** 마스터 검색 플레이스홀더 */
  masterSearchPlaceholder?: string
  /** 마스터 검색 콜백 */
  onMasterSearch?: (keyword: string) => void
  /** 선택된 마스터 아이템 */
  selectedMaster?: M | null
  /** 마스터 선택 콜백 */
  onMasterSelect?: (item: M) => void

  // === 디테일 영역 ===
  /** 디테일 영역 타이틀 */
  detailTitle?: ReactNode
  /** 디테일 영역 컨텐츠 */
  detailContent: ReactNode
  /** 디테일 로딩 상태 */
  detailLoading?: boolean
  /** 마스터 미선택 시 표시할 안내 */
  detailEmpty?: ReactNode
  /** 디테일 에러 상태 */
  detailError?: ReactNode

  // === 레이아웃 ===
  /** 마스터 패널 초기 비율 (%, 기본: 30) */
  defaultSplit?: number
  /** 마스터 패널 최소 너비 (px, 기본: 200) */
  minMasterWidth?: number
  /** 디테일 패널 최소 너비 (px, 기본: 300) */
  minDetailWidth?: number
  /** 마스터 패널 최대 너비 */
  maxMasterWidth?: number | string

  // === 이벤트 ===
  /** 분할 비율 변경 콜백 */
  onSplitChange?: (sizes: number[]) => void

  // === 스타일 ===
  /** 최상위 컨테이너 className */
  className?: string
  /** 최상위 컨테이너 style */
  style?: CSSProperties
  /** 마스터 패널 className */
  masterClassName?: string
  /** 디테일 패널 className */
  detailClassName?: string
}
