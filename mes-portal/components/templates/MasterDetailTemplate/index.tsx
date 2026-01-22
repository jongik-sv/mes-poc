// components/templates/MasterDetailTemplate/index.tsx
// 마스터-디테일 화면 템플릿 메인 컴포넌트 (TSK-06-04)

'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import { Input, Skeleton, Empty, Typography } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import type { MasterDetailTemplateProps } from './types'

// 타입 re-export
export * from './types'

const { Text } = Typography

// 디바운스 훅
function useDebouncedCallback<T extends (...args: unknown[]) => void>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args)
      }, delay)
    },
    [callback, delay]
  ) as T

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return debouncedCallback
}

/**
 * MasterDetailTemplate 컴포넌트
 *
 * 마스터-디테일 화면의 표준 템플릿을 제공합니다.
 * - 좌측: 마스터 영역 (리스트/트리)
 * - 중앙: 리사이즈 가능한 분할 바
 * - 우측: 디테일 영역
 *
 * @example
 * ```tsx
 * <MasterDetailTemplate
 *   masterTitle="카테고리"
 *   masterContent={<CategoryTree />}
 *   masterSearchable
 *   onMasterSearch={(keyword) => filterCategories(keyword)}
 *   selectedMaster={selectedCategory}
 *   onMasterSelect={(category) => setSelectedCategory(category)}
 *   detailTitle={`${selectedCategory?.name} 제품 목록`}
 *   detailContent={<ProductTable />}
 *   detailLoading={loading}
 * />
 * ```
 */
export function MasterDetailTemplate<M = unknown>({
  // 마스터 영역
  masterTitle,
  masterContent,
  masterSearchable = false,
  masterSearchPlaceholder = '검색...',
  onMasterSearch,
  selectedMaster,

  // 디테일 영역
  detailTitle,
  detailContent,
  detailLoading = false,
  detailEmpty,
  detailError,

  // 레이아웃
  defaultSplit = 30,
  minMasterWidth = 200,
  minDetailWidth = 300,

  // 이벤트
  onSplitChange,

  // 스타일
  className,
  style,
  masterClassName,
  detailClassName,
}: MasterDetailTemplateProps<M>) {
  // 검색어 상태
  const [searchKeyword, setSearchKeyword] = useState('')

  // 분할 상태
  const containerRef = useRef<HTMLDivElement>(null)
  const [masterWidth, setMasterWidth] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  // 디바운스된 검색 콜백
  const debouncedSearch = useDebouncedCallback((keyword: string) => {
    onMasterSearch?.(keyword)
  }, 300)

  /**
   * 검색어 변경 핸들러
   */
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setSearchKeyword(value)
      debouncedSearch(value)
    },
    [debouncedSearch]
  )

  /**
   * 초기 마스터 너비 계산
   */
  useEffect(() => {
    if (containerRef.current && masterWidth === null) {
      const containerWidth = containerRef.current.offsetWidth
      const initialWidth = (containerWidth * defaultSplit) / 100
      setMasterWidth(Math.max(initialWidth, minMasterWidth))
    }
  }, [defaultSplit, minMasterWidth, masterWidth])

  /**
   * 드래그 시작
   */
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  /**
   * 드래그 중
   */
  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return

      const containerRect = containerRef.current.getBoundingClientRect()
      const containerWidth = containerRect.width
      const newMasterWidth = e.clientX - containerRect.left

      // 최소/최대 너비 제한
      const maxWidth = containerWidth - minDetailWidth - 8 // 8px for handle
      const clampedWidth = Math.min(
        Math.max(newMasterWidth, minMasterWidth),
        maxWidth
      )

      setMasterWidth(clampedWidth)

      // 분할 비율 콜백
      const masterPercent = (clampedWidth / containerWidth) * 100
      const detailPercent = 100 - masterPercent
      onSplitChange?.([masterPercent, detailPercent])
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, minMasterWidth, minDetailWidth, onSplitChange])

  /**
   * 디테일 영역 컨텐츠 렌더링
   */
  const renderDetailContent = () => {
    // 에러 상태
    if (detailError) {
      return (
        <div data-testid="detail-error" className="p-4">
          {detailError}
        </div>
      )
    }

    // 로딩 상태
    if (detailLoading) {
      return (
        <div data-testid="detail-loading" className="p-4">
          <Skeleton active paragraph={{ rows: 6 }} />
        </div>
      )
    }

    // 마스터 미선택 상태
    if (selectedMaster === undefined || selectedMaster === null) {
      return (
        <div
          data-testid="detail-placeholder"
          className="flex h-full items-center justify-center"
        >
          {detailEmpty || (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={<Text type="secondary">항목을 선택하세요</Text>}
            />
          )}
        </div>
      )
    }

    // 정상 컨텐츠
    return <div data-testid="detail-content">{detailContent}</div>
  }

  return (
    <div
      ref={containerRef}
      data-testid="master-detail-template"
      className={`flex h-full ${className || ''}`}
      style={{
        ...style,
        cursor: isDragging ? 'col-resize' : undefined,
        userSelect: isDragging ? 'none' : undefined,
      }}
    >
      {/* 마스터 영역 */}
      <div
        data-testid="master-panel"
        className={`flex flex-col border-r border-gray-200 dark:border-gray-700 ${masterClassName || ''}`}
        style={{
          width: masterWidth ?? `${defaultSplit}%`,
          minWidth: minMasterWidth,
          flexShrink: 0,
        }}
      >
        {/* 마스터 헤더 */}
        {(masterTitle || masterSearchable) && (
          <div
            data-testid="master-header"
            className="shrink-0 border-b border-gray-100 p-3 dark:border-gray-700"
          >
            {masterTitle && (
              <h3
                data-testid="master-title"
                className="m-0 mb-2 text-sm font-semibold"
              >
                {masterTitle}
              </h3>
            )}
            {masterSearchable && (
              <Input
                data-testid="master-search-input"
                placeholder={masterSearchPlaceholder}
                prefix={<SearchOutlined className="text-gray-400" />}
                value={searchKeyword}
                onChange={handleSearchChange}
                allowClear
                size="small"
              />
            )}
          </div>
        )}

        {/* 마스터 컨텐츠 */}
        <div data-testid="master-content" className="flex-1 overflow-auto">
          {masterContent}
        </div>
      </div>

      {/* 분할 바 */}
      <div
        data-testid="split-handle"
        className={`flex w-2 shrink-0 cursor-col-resize items-center justify-center bg-gray-50 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 ${
          isDragging ? 'bg-blue-100 dark:bg-blue-900' : ''
        }`}
        onMouseDown={handleMouseDown}
        role="separator"
        aria-valuenow={masterWidth ?? 0}
        aria-valuemin={minMasterWidth}
        tabIndex={0}
        onKeyDown={(e) => {
          if (!containerRef.current || masterWidth === null) return
          const containerWidth = containerRef.current.offsetWidth
          const step = 20

          if (e.key === 'ArrowLeft') {
            const newWidth = Math.max(masterWidth - step, minMasterWidth)
            setMasterWidth(newWidth)
          } else if (e.key === 'ArrowRight') {
            const maxWidth = containerWidth - minDetailWidth - 8
            const newWidth = Math.min(masterWidth + step, maxWidth)
            setMasterWidth(newWidth)
          }
        }}
      >
        <div className="h-8 w-0.5 rounded bg-gray-300 dark:bg-gray-600" />
      </div>

      {/* 디테일 영역 */}
      <div
        data-testid="detail-panel"
        className={`flex min-w-0 flex-1 flex-col ${detailClassName || ''}`}
        style={{ minWidth: minDetailWidth }}
      >
        {/* 디테일 헤더 */}
        {detailTitle && (
          <div
            data-testid="detail-header"
            className="shrink-0 border-b border-gray-100 p-3 dark:border-gray-700"
          >
            <h3 data-testid="detail-title" className="m-0 text-sm font-semibold">
              {detailTitle}
            </h3>
          </div>
        )}

        {/* 디테일 컨텐츠 */}
        <div className="flex-1 overflow-auto">{renderDetailContent()}</div>
      </div>
    </div>
  )
}

export default MasterDetailTemplate
