/**
 * 즐겨찾기 토글 버튼 컴포넌트 (TSK-03-04)
 * @description 메뉴 항목의 즐겨찾기 추가/제거를 위한 별 아이콘 버튼
 */
'use client'

import { Button, Tooltip } from 'antd'
import { StarOutlined, StarFilled } from '@ant-design/icons'
import type { CSSProperties } from 'react'

interface FavoriteButtonProps {
  /** 즐겨찾기 여부 */
  isFavorite: boolean
  /** 토글 콜백 함수 */
  onToggle: () => void
  /** 비활성화 여부 */
  disabled?: boolean
  /** 버튼 크기 */
  size?: 'small' | 'middle' | 'large'
  /** 툴팁 표시 여부 */
  showTooltip?: boolean
  /** 인라인 스타일 */
  style?: CSSProperties
  /** CSS 클래스 */
  className?: string
}

/**
 * 즐겨찾기 토글 버튼
 */
export function FavoriteButton({
  isFavorite,
  onToggle,
  disabled = false,
  size = 'small',
  showTooltip = true,
  style,
  className,
}: FavoriteButtonProps) {
  const tooltipTitle = isFavorite ? '즐겨찾기에서 제거' : '즐겨찾기에 추가'

  const button = (
    <Button
      type="text"
      size={size}
      icon={
        isFavorite ? (
          <StarFilled style={{ color: 'var(--ant-color-warning)' }} />
        ) : (
          <StarOutlined />
        )
      }
      onClick={(e) => {
        e.stopPropagation() // 메뉴 클릭 이벤트 전파 방지
        onToggle()
      }}
      disabled={disabled}
      style={style}
      className={className}
      aria-label={tooltipTitle}
      data-testid="favorite-toggle-btn"
      data-favorited={isFavorite}
    />
  )

  if (showTooltip) {
    return (
      <Tooltip title={tooltipTitle} placement="right">
        {button}
      </Tooltip>
    )
  }

  return button
}
