// components/templates/DetailTemplate/types.ts
// 상세 화면 템플릿 타입 정의 (TSK-06-02)

import type { ReactNode } from 'react'
import type { DescriptionsProps } from 'antd'

/**
 * 탭 아이템 정의
 */
export interface DetailTabItem {
  /** 탭 키 */
  key: string
  /** 탭 라벨 */
  label: ReactNode
  /** 탭 아이콘 (선택) */
  icon?: ReactNode
  /** 탭 컨텐츠 */
  children: ReactNode
  /** 비활성화 여부 */
  disabled?: boolean
  /** 탭 뱃지 (개수 등) */
  badge?: number
}

/**
 * 에러 상태 타입
 */
export interface DetailErrorState {
  /** 에러 코드 (403, 404, 500 등) */
  status?: 403 | 404 | 500 | 'error'
  /** 에러 제목 */
  title?: string
  /** 에러 메시지 */
  message?: string
}

/**
 * 권한 인터페이스
 * ⚠️ 주의: 클라이언트 버튼 숨김은 UX 편의 기능일 뿐,
 * 실제 권한 검증은 반드시 API 레이어에서 수행해야 함
 */
export interface DetailTemplatePermissions {
  /** 수정 권한 (false 시 수정 버튼 숨김) */
  canEdit?: boolean
  /** 삭제 권한 (false 시 삭제 버튼 숨김) */
  canDelete?: boolean
}

/**
 * 상세 화면 템플릿 Props
 * @template T - 상세 데이터 타입
 */
export interface DetailTemplateProps<T = Record<string, unknown>> {
  // === 헤더 영역 ===
  /** 화면 제목 */
  title: string
  /** 부제목 (선택) - 레코드 식별 정보 등 */
  subtitle?: string
  /** 헤더 아이콘 */
  titleIcon?: ReactNode
  /** 수정 버튼 클릭 핸들러 (미제공 시 버튼 숨김) */
  onEdit?: () => void
  /** 삭제 버튼 클릭 핸들러 (미제공 시 버튼 숨김) */
  onDelete?: () => Promise<void>
  /** 목록으로 버튼 클릭 핸들러 */
  onBack?: () => void
  /** 헤더 우측 추가 액션 버튼 */
  extra?: ReactNode

  // === 기본 정보 영역 ===
  /** Descriptions 컴포넌트 props */
  descriptions: DescriptionsProps & {
    items: DescriptionsProps['items']
  }
  /** Descriptions 제목 (기본값: "기본 정보") */
  descriptionsTitle?: string

  // === 탭 영역 ===
  /** 탭 구성 (미제공 시 탭 영역 숨김) */
  tabs?: DetailTabItem[]
  /** 기본 활성 탭 키 */
  defaultActiveTab?: string
  /** 탭 변경 핸들러 */
  onTabChange?: (activeKey: string) => void
  /** 비활성 탭 컨텐츠 제거 여부 - 메모리 최적화 (기본값: false) */
  destroyInactiveTabPane?: boolean
  /** 탭 컨텐츠 지연 로딩 활성화 (기본값: false) */
  lazyLoadTabs?: boolean

  // === 상태 ===
  /** 로딩 상태 */
  loading?: boolean
  /** 에러 상태 */
  error?: DetailErrorState

  // === 레이아웃 ===
  /** 컨테이너 스타일 */
  className?: string
  /** 기본 정보와 탭 사이 여백 (기본값: 24) */
  gutter?: number

  // === 삭제 다이얼로그 ===
  /** 삭제 확인 메시지 (기본값: "정말 삭제하시겠습니까?") */
  deleteConfirmMessage?: string
  /** 삭제 확인 제목 (기본값: "삭제 확인") */
  deleteConfirmTitle?: string

  // === 권한 ===
  /**
   * 사용자 권한 정보 (API 응답에서 전달)
   * - onEdit/onDelete props와 함께 사용하여 버튼 표시 제어
   * - 미제공 시 onEdit/onDelete 존재 여부로만 판단
   */
  permissions?: DetailTemplatePermissions
}

/**
 * DetailHeader Props
 */
export interface DetailHeaderProps {
  /** 제목 */
  title: string
  /** 부제목 */
  subtitle?: string
  /** 아이콘 */
  titleIcon?: ReactNode
  /** 수정 버튼 클릭 */
  onEdit?: () => void
  /** 삭제 버튼 클릭 */
  onDelete?: () => void
  /** 수정 버튼 표시 여부 */
  showEdit?: boolean
  /** 삭제 버튼 표시 여부 */
  showDelete?: boolean
  /** 추가 액션 */
  extra?: ReactNode
  /** 로딩 상태 */
  loading?: boolean
}

/**
 * DetailDescriptions Props
 */
export interface DetailDescriptionsProps {
  /** Descriptions props */
  descriptionsProps: DescriptionsProps & {
    items: DescriptionsProps['items']
  }
  /** 카드 제목 */
  title?: string
  /** 로딩 상태 */
  loading?: boolean
}

/**
 * DetailTabs Props
 */
export interface DetailTabsProps {
  /** 탭 아이템 */
  tabs: DetailTabItem[]
  /** 활성 탭 키 */
  activeKey?: string
  /** 기본 활성 탭 키 */
  defaultActiveKey?: string
  /** 탭 변경 핸들러 */
  onChange?: (activeKey: string) => void
  /** 비활성 탭 컨텐츠 제거 여부 */
  destroyInactiveTabPane?: boolean
  /** 지연 로딩 활성화 */
  lazyLoad?: boolean
  /** 로딩 상태 */
  loading?: boolean
}

/**
 * DetailFooter Props
 */
export interface DetailFooterProps {
  /** 목록으로 버튼 클릭 */
  onBack?: () => void
  /** 추가 버튼 */
  extra?: ReactNode
}

/**
 * DetailError Props
 */
export interface DetailErrorProps {
  /** 에러 상태 */
  error: DetailErrorState
  /** 목록으로 이동 */
  onBack?: () => void
  /** 재시도 */
  onRetry?: () => void
}

/**
 * DetailSkeleton Props
 */
export interface DetailSkeletonProps {
  /** Descriptions 행 수 (기본: 6) */
  descriptionRows?: number
  /** 탭 표시 여부 (기본: true) */
  showTabs?: boolean
  /** 탭 개수 (기본: 3) */
  tabCount?: number
}
