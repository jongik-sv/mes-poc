// components/common/EmptyState.tsx
// MES Portal 빈 상태 컴포넌트 (TSK-05-01)
'use client'

import { ReactNode, useMemo } from 'react'
import { Empty, Button, Tag, Space } from 'antd'
import { InboxOutlined, SearchOutlined, FilterOutlined } from '@ant-design/icons'

export type EmptyStateType = 'default' | 'no-data' | 'search' | 'filter'

export interface FilterItem {
  key: string
  label: string
  value: string
}

export interface EmptyStateProps {
  /** 빈 상태 타입 (기본: "default") */
  type?: EmptyStateType
  /** 커스텀 아이콘 */
  icon?: ReactNode
  /** 제목 */
  title?: string
  /** 설명 메시지 */
  description?: string
  /** 커스텀 액션 컴포넌트 */
  action?: ReactNode
  /** 액션 버튼 텍스트 */
  actionText?: string
  /** 액션 버튼 타입 */
  actionType?: 'primary' | 'default' | 'dashed' | 'link' | 'text'
  /** 액션 버튼 클릭 핸들러 */
  onAction?: () => void
  /** 검색어 (search 타입) */
  searchKeyword?: string
  /** 검색어 초기화 핸들러 (search 타입) */
  onClearSearch?: () => void
  /** 적용된 필터 목록 (filter 타입) */
  appliedFilters?: FilterItem[]
  /** 필터 초기화 핸들러 (filter 타입) */
  onReset?: () => void
}

// 타입별 기본 설정
const typeConfig: Record<
  EmptyStateType,
  { icon: ReactNode; title: string; description: string; actionText?: string }
> = {
  default: {
    icon: <InboxOutlined className="text-4xl text-gray-400" />,
    title: '데이터가 없습니다',
    description: '조회된 데이터가 없습니다.',
  },
  'no-data': {
    icon: <InboxOutlined className="text-4xl text-gray-400" />,
    title: '데이터가 없습니다',
    description: '조회된 데이터가 없습니다. 새로운 데이터를 등록해 주세요.',
  },
  search: {
    icon: <SearchOutlined className="text-4xl text-gray-400" />,
    title: '검색 결과가 없습니다',
    description: '다른 검색어로 다시 시도해 주세요.',
    actionText: '검색어 지우기',
  },
  filter: {
    icon: <FilterOutlined className="text-4xl text-gray-400" />,
    title: '필터 조건에 맞는 결과가 없습니다',
    description: '필터 조건을 변경하거나 초기화해 주세요.',
    actionText: '필터 초기화',
  },
}

export function EmptyState({
  type = 'default',
  icon,
  title,
  description,
  action,
  actionText,
  actionType = 'default',
  onAction,
  searchKeyword,
  onClearSearch,
  appliedFilters,
  onReset,
}: EmptyStateProps) {
  const config = typeConfig[type]

  // 표시할 아이콘
  const displayIcon = icon || config.icon

  // 표시할 제목
  const displayTitle = title || config.title

  // 표시할 설명
  const displayDescription = useMemo(() => {
    if (description) return description

    if (type === 'search' && searchKeyword) {
      return `"${searchKeyword}"에 대한 검색 결과가 없습니다. 다른 검색어로 다시 시도해 주세요.`
    }

    return config.description
  }, [description, type, searchKeyword, config.description])

  // 액션 버튼 클릭 핸들러
  const handleAction = () => {
    if (type === 'search' && onClearSearch) {
      onClearSearch()
    } else if (type === 'filter' && onReset) {
      onReset()
    } else if (onAction) {
      onAction()
    }
  }

  // 표시할 액션 버튼 텍스트
  const displayActionText = actionText || config.actionText

  // 액션이 있는지 확인
  const hasAction =
    action ||
    displayActionText ||
    (type === 'search' && onClearSearch) ||
    (type === 'filter' && onReset)

  return (
    <div
      data-testid="empty-state"
      role="alert"
      className="flex flex-col items-center justify-center py-12 px-4"
    >
      <Empty
        image={displayIcon}
        description={null}
      >
        {/* 제목 */}
        {displayTitle && (
          <div data-testid="empty-state-title" className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
            {displayTitle}
          </div>
        )}

        {/* 설명 메시지 */}
        <div
          data-testid="empty-state-message"
          className="text-sm text-gray-500 dark:text-gray-400 mb-4"
        >
          {displayDescription}
        </div>

        {/* 추가 설명 (타입별) */}
        <div
          data-testid="empty-state-description"
          className="text-sm text-gray-500 dark:text-gray-400 mb-4"
        >
          {type === 'filter' && appliedFilters && appliedFilters.length > 0 && (
            <div className="mb-4">
              <span className="mr-2">현재 적용된 필터:</span>
              <Space wrap>
                {appliedFilters.map((filter) => (
                  <Tag key={filter.key} color="blue">
                    {filter.label}: {filter.value}
                  </Tag>
                ))}
              </Space>
            </div>
          )}
        </div>

        {/* 액션 버튼 */}
        {action ? (
          action
        ) : hasAction ? (
          <Button
            data-testid="empty-state-action"
            type={actionType}
            onClick={handleAction}
          >
            {displayActionText}
          </Button>
        ) : null}
      </Empty>
    </div>
  )
}
