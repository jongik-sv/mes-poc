// components/common/index.ts
// 공통 컴포넌트 내보내기

export { NotificationPanel } from './NotificationPanel'
export type { Notification, NotificationType } from './NotificationPanel'

export { GlobalSearch, filterMenus } from './GlobalSearch'
export type {
  GlobalSearchProps,
  SearchableMenuItem,
  SearchResult,
} from './GlobalSearch'

// TSK-05-01: 로딩 및 에러 상태 컴포넌트
export { PageLoading } from './PageLoading'
export type { PageLoadingProps } from './PageLoading'

export { ComponentSkeleton } from './ComponentSkeleton'
export type { ComponentSkeletonProps, SkeletonVariant } from './ComponentSkeleton'

export { EmptyState } from './EmptyState'
export type { EmptyStateProps, EmptyStateType, FilterItem } from './EmptyState'

export { ErrorBoundary } from './ErrorBoundary'
export type { ErrorBoundaryProps } from './ErrorBoundary'

export { ErrorPage } from './ErrorPage'
export type { ErrorPageProps, ErrorStatus } from './ErrorPage'

// TSK-03-04: 즐겨찾기 관련 컴포넌트
export { FavoriteButton } from './FavoriteButton'
export { QuickMenu } from './QuickMenu'

// TSK-05-04: 테이블 공통 기능
export { DataTable } from './DataTable'
export type { DataTableProps, DataTableColumn } from './DataTable'

// TSK-05-06: 키보드 단축키 컴포넌트
export { HotkeyHelp } from './HotkeyHelp'
export type { HotkeyHelpProps } from './HotkeyHelp'
export { KeyBadge } from './KeyBadge'
export type { KeyBadgeProps } from './KeyBadge'
