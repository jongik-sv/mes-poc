// components/layout/Footer.tsx
// MES Portal 푸터 컴포넌트
'use client'

import { Layout } from 'antd'

const { Footer: AntFooter } = Layout

interface FooterProps {
  className?: string
}

// 버전 정보 (환경변수 우선, package.json fallback)
const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0'

// 저작권 연도
const COPYRIGHT_YEAR = new Date().getFullYear()

export function Footer({ className }: FooterProps) {
  return (
    <AntFooter
      className={`flex justify-between items-center px-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 ${className || ''}`}
      style={{ height: 'var(--footer-height)', padding: '0 16px' }}
      data-testid="footer-component"
    >
      <span data-testid="footer-copyright">
        Copyright &copy; {COPYRIGHT_YEAR} Company. All rights reserved.
      </span>
      <span data-testid="footer-version">v{APP_VERSION}</span>
    </AntFooter>
  )
}
