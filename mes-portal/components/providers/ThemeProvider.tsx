// components/providers/ThemeProvider.tsx
// 테마 프로바이더 - next-themes + Ant Design ConfigProvider 통합
'use client'

import { ConfigProvider, theme } from 'antd'
import { ThemeProvider as NextThemeProvider, useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import {
  themeTokens,
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

  // 마운트 전에는 기본 라이트 테마 사용 (SSR 호환)
  const isDark = mounted ? resolvedTheme === 'dark' : false

  return (
    <ConfigProvider
      theme={{
        token: themeTokens,
        algorithm: isDark ? darkThemeAlgorithm : lightThemeAlgorithm,
        components: isDark ? darkComponentTokens : componentTokens,
      }}
    >
      {children}
    </ConfigProvider>
  )
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <NextThemeProvider
      attribute="data-theme"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AntdConfigProvider>{children}</AntdConfigProvider>
    </NextThemeProvider>
  )
}
