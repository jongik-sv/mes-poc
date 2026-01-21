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
