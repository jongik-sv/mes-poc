// components/providers/ThemeProvider.tsx
// 테마 프로바이더 - next-themes + Ant Design ConfigProvider 통합
'use client'

import { App, ConfigProvider } from 'antd'
import { ThemeProvider as NextThemeProvider, useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import {
  themeTokens,
  darkThemeTokens,
  componentTokens,
  darkComponentTokens,
  lightThemeAlgorithm,
  darkThemeAlgorithm,
} from '@/lib/theme'

interface ThemeProviderProps {
  children: React.ReactNode
}

function AntdConfigProvider({ children }: ThemeProviderProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // 기본 테마: 라이트 (새로고침 시 항상 라이트로 시작)
  // 마운트 후 사용자가 테마 전환하면 resolvedTheme 반영
  const isDark = mounted && resolvedTheme === 'dark'

  // key prop으로 테마 변경 시 ConfigProvider 리마운트 → 스타일 재생성
  const themeKey = isDark ? 'dark' : 'light'

  return (
    <ConfigProvider
      key={themeKey}
      theme={{
        token: isDark ? darkThemeTokens : themeTokens,
        algorithm: isDark ? darkThemeAlgorithm : lightThemeAlgorithm,
        components: isDark ? darkComponentTokens : componentTokens,
      }}
    >
      <App>{children}</App>
    </ConfigProvider>
  )
}

// NextThemeProvider를 별도로 export - AntdRegistry가 useTheme을 사용할 수 있도록
export function NextThemeProviderWrapper({ children }: ThemeProviderProps) {
  return (
    <NextThemeProvider
      attribute="data-theme"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
    </NextThemeProvider>
  )
}

// AntdConfigProvider만 export - layout.tsx에서 순서 조정에 사용
export { AntdConfigProvider }

// 기존 ThemeProvider - 하위 호환성 유지
export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <NextThemeProvider
      attribute="data-theme"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      <AntdConfigProvider>{children}</AntdConfigProvider>
    </NextThemeProvider>
  )
}
