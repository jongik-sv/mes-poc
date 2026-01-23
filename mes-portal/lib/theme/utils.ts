// lib/theme/utils.ts
// Theme utility functions for Glassmorphism styling

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import type { GlobalToken } from 'antd'

/**
 * SSR 안전한 다크 모드 감지 훅
 * @returns isDark - 다크 모드 여부 (SSR에서는 false 반환)
 */
export function useIsDarkMode(): boolean {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // SSR 또는 마운트 전에는 false 반환 (라이트 모드 기본값)
  if (!mounted) return false

  return resolvedTheme === 'dark'
}

/**
 * Glassmorphism 카드 스타일 생성
 * @param token - Ant Design theme token
 * @param isDark - 다크 모드 여부
 * @returns CSS 스타일 객체
 */
export function getGlassCardStyle(token: GlobalToken, isDark: boolean) {
  if (isDark) {
    // 다크 모드 - 어두운 반투명 배경
    return {
      backgroundColor: 'rgba(30, 41, 59, 0.8)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      border: '1px solid rgba(51, 65, 85, 0.5)',
      boxShadow: token.boxShadow,
      borderRadius: token.borderRadiusLG,
    }
  }

  // 라이트 모드 - 밝은 반투명 배경
  return {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: token.boxShadow,
    borderRadius: token.borderRadiusLG,
  }
}

/**
 * Glassmorphism 그라데이션 배경 스타일 생성 (Hero 섹션용)
 * @param token - Ant Design theme token
 * @param isDark - 다크 모드 여부
 * @returns CSS 스타일 객체
 */
export function getGlassHeroStyle(token: GlobalToken, isDark: boolean) {
  if (isDark) {
    return {
      background: `linear-gradient(135deg, rgba(30, 58, 95, 0.8) 0%, rgba(30, 41, 59, 0.8) 100%)`,
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      border: '1px solid rgba(51, 65, 85, 0.5)',
      borderRadius: token.borderRadiusLG,
      boxShadow: token.boxShadow,
    }
  }

  return {
    background: `linear-gradient(135deg, ${token.colorPrimaryBg} 0%, rgba(255, 255, 255, 0.7) 100%)`,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: token.borderRadiusLG,
    boxShadow: token.boxShadow,
  }
}
