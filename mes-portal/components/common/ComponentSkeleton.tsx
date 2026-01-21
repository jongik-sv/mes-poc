// components/common/ComponentSkeleton.tsx
// MES Portal 컴포넌트별 스켈레톤 로딩 컴포넌트 (TSK-05-01)
'use client'

import { Skeleton } from 'antd'

export type SkeletonVariant = 'default' | 'table' | 'card' | 'form' | 'list'

export interface ComponentSkeletonProps {
  /** 스켈레톤 타입 (기본: "default") */
  variant?: SkeletonVariant
  /** 테이블/리스트 행 수 (기본: 5) */
  rows?: number
  /** 테이블 열 수 (기본: 4) */
  columns?: number
  /** 테이블 헤더 표시 여부 (기본: true) */
  showHeader?: boolean
  /** 카드 개수 (기본: 1) */
  count?: number
  /** 카드 아바타 표시 여부 (기본: false) */
  hasAvatar?: boolean
  /** 폼 필드 수 (기본: 3) */
  fields?: number
  /** 애니메이션 활성화 (기본: true) */
  active?: boolean
}

export function ComponentSkeleton({
  variant = 'default',
  rows = 5,
  columns = 4,
  showHeader = true,
  count = 1,
  hasAvatar = false,
  fields = 3,
  active = true,
}: ComponentSkeletonProps) {
  // 테이블 스켈레톤
  if (variant === 'table') {
    return (
      <div
        data-testid="component-skeleton"
        aria-hidden="true"
        className="table w-full"
      >
        {/* 헤더 */}
        {showHeader && (
          <div
            data-testid="skeleton-header"
            className="flex gap-4 px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-t-lg"
          >
            {Array.from({ length: columns }).map((_, colIdx) => (
              <Skeleton.Input
                key={`header-${colIdx}`}
                active={active}
                size="small"
                style={{ width: `${100 / columns}%`, minWidth: 80 }}
              />
            ))}
          </div>
        )}
        {/* 행들 */}
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div
            key={`row-${rowIdx}`}
            data-testid="skeleton-row"
            className="flex gap-4 px-4 py-3 border-b border-gray-100 dark:border-gray-700"
          >
            {Array.from({ length: columns }).map((_, colIdx) => (
              <Skeleton.Input
                key={`cell-${rowIdx}-${colIdx}`}
                active={active}
                size="small"
                style={{ width: `${100 / columns}%`, minWidth: 60 }}
              />
            ))}
          </div>
        ))}
      </div>
    )
  }

  // 카드 스켈레톤
  if (variant === 'card') {
    return (
      <div
        data-testid="component-skeleton"
        aria-hidden="true"
        className={`card grid gap-4 ${
          count > 1 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : ''
        }`}
      >
        {Array.from({ length: count }).map((_, idx) => (
          <div
            key={`card-${idx}`}
            data-testid="skeleton-card"
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            {hasAvatar && (
              <div className="flex items-center gap-3 mb-3">
                <Skeleton.Avatar active={active} size="default" shape="circle" />
                <div className="flex-1">
                  <Skeleton.Input active={active} size="small" style={{ width: '60%' }} />
                </div>
              </div>
            )}
            <Skeleton.Input active={active} size="small" style={{ width: '100%', marginBottom: 8 }} />
            <Skeleton.Input active={active} size="small" style={{ width: '80%', marginBottom: 8 }} />
            <Skeleton.Input active={active} size="small" style={{ width: '60%' }} />
          </div>
        ))}
      </div>
    )
  }

  // 폼 스켈레톤
  if (variant === 'form') {
    return (
      <div
        data-testid="component-skeleton"
        aria-hidden="true"
        className="form space-y-6"
      >
        {Array.from({ length: fields }).map((_, idx) => (
          <div key={`field-${idx}`} data-testid="skeleton-field" className="space-y-2">
            {/* 라벨 */}
            <Skeleton.Input active={active} size="small" style={{ width: 100 }} />
            {/* 입력 필드 */}
            <Skeleton.Input active={active} size="large" style={{ width: '100%' }} />
          </div>
        ))}
      </div>
    )
  }

  // 리스트 스켈레톤
  if (variant === 'list') {
    return (
      <div
        data-testid="component-skeleton"
        aria-hidden="true"
        className="list space-y-3"
      >
        {Array.from({ length: rows }).map((_, idx) => (
          <div
            key={`list-item-${idx}`}
            data-testid="skeleton-list-item"
            className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded"
          >
            <Skeleton.Avatar active={active} size="small" shape="circle" />
            <div className="flex-1">
              <Skeleton.Input active={active} size="small" style={{ width: '70%', marginBottom: 4 }} />
              <Skeleton.Input active={active} size="small" style={{ width: '40%' }} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // 기본 스켈레톤
  return (
    <div
      data-testid="component-skeleton"
      aria-hidden="true"
      className="default space-y-3"
    >
      <Skeleton.Input active={active} size="default" style={{ width: '100%' }} />
      <Skeleton.Input active={active} size="default" style={{ width: '80%' }} />
      <Skeleton.Input active={active} size="default" style={{ width: '60%' }} />
    </div>
  )
}
