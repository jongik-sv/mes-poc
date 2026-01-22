// components/common/KeyBadge.tsx
// TSK-05-06: 키보드 단축키 배지 컴포넌트
'use client'

import { useMemo } from 'react'
import { getModifierKey, isMacPlatform } from '@/lib/hooks/useGlobalHotkeys'

export interface KeyBadgeProps {
  /** 키 배열 (예: ['Ctrl', 'K']) */
  keys: string[]
  /** 구분자 (기본: '+') */
  separator?: string
  /** 크기 */
  size?: 'small' | 'default' | 'large'
  /** 플랫폼 지정 (기본: auto) */
  platform?: 'auto' | 'mac' | 'windows'
}

// 플랫폼별 modifier 키 매핑
const MODIFIER_MAP = {
  mac: {
    Ctrl: '⌘',
    Control: '⌘',
    Alt: '⌥',
    Shift: '⇧',
    Meta: '⌘',
    Cmd: '⌘',
  },
  windows: {
    Ctrl: 'Ctrl',
    Control: 'Ctrl',
    Alt: 'Alt',
    Shift: 'Shift',
    Meta: 'Win',
    Cmd: 'Ctrl',
  },
} as const

type ModifierKey = keyof typeof MODIFIER_MAP.mac

/**
 * 단축키 배지 컴포넌트
 *
 * 개별 키 또는 키 조합을 시각적으로 표시합니다.
 *
 * @example
 * ```tsx
 * <KeyBadge keys={['Ctrl', 'K']} />
 * <KeyBadge keys={['Ctrl', 'Shift', 'Tab']} />
 * <KeyBadge keys={['?']} />
 * ```
 */
export function KeyBadge({
  keys,
  separator = '+',
  size = 'default',
  platform = 'auto',
}: KeyBadgeProps) {
  const displayKeys = useMemo(() => {
    const isMac =
      platform === 'mac' || (platform === 'auto' && isMacPlatform())
    const modMap = isMac ? MODIFIER_MAP.mac : MODIFIER_MAP.windows

    return keys.map((key) => {
      // Modifier 키 변환
      if (key in modMap) {
        return modMap[key as ModifierKey]
      }
      return key
    })
  }, [keys, platform])

  const sizeClasses = {
    small: 'min-w-[20px] h-[20px] px-1.5 text-[11px]',
    default: 'min-w-[24px] h-[24px] px-2 text-xs',
    large: 'min-w-[28px] h-[28px] px-2.5 text-sm',
  }

  const ariaLabel = keys.join(' + ') + ' 키를 함께 누르세요'

  return (
    <span
      className="key-badge inline-flex items-center gap-1"
      role="img"
      aria-label={ariaLabel}
    >
      {displayKeys.map((key, index) => (
        <span key={`${key}-${index}`} className="inline-flex items-center">
          <kbd
            className={`
              inline-flex items-center justify-center
              font-mono font-medium
              rounded
              border
              shadow-[0_2px_0_rgba(0,0,0,0.02)]
              ${sizeClasses[size]}
            `}
            style={{
              backgroundColor: 'var(--key-badge-bg, #f0f0f0)',
              borderColor: 'var(--key-badge-border, #d9d9d9)',
              color: 'var(--key-badge-text, #595959)',
            }}
          >
            {key}
          </kbd>
          {index < displayKeys.length - 1 && (
            <span
              className="mx-0.5 text-xs"
              style={{ color: 'var(--color-gray-400, #8c8c8c)' }}
              aria-hidden="true"
            >
              {separator}
            </span>
          )}
        </span>
      ))}
    </span>
  )
}
