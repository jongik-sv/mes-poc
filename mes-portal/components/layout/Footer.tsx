// components/layout/Footer.tsx
// MES Portal 푸터 컴포넌트 - Enterprise Design
'use client'

import { Layout } from 'antd'

const { Footer: AntFooter } = Layout

interface FooterProps {
  className?: string
}

const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0'
const COPYRIGHT_YEAR = new Date().getFullYear()

export function Footer({ className }: FooterProps) {
  return (
    <AntFooter
      className={`flex justify-between items-center px-6 ${className || ''}`}
      style={{
        height: 'var(--footer-height)',
        padding: '0 24px',
        backgroundColor: 'var(--color-gray-50)',
        borderTop: '1px solid var(--color-gray-200)',
      }}
      data-testid="footer-component"
    >
      <span
        className="text-xs"
        style={{ color: 'var(--color-gray-500)' }}
        data-testid="footer-copyright"
      >
        Copyright &copy; {COPYRIGHT_YEAR} Company. All rights reserved.
      </span>
      <div className="flex items-center gap-4">
        <span
          className="text-xs"
          style={{ color: 'var(--color-gray-400)' }}
        >
          MES Portal
        </span>
        <span
          className="text-xs font-medium px-2 py-0.5 rounded"
          style={{
            color: 'var(--color-primary)',
            backgroundColor: 'var(--color-primary-light)',
          }}
          data-testid="footer-version"
        >
          v{APP_VERSION}
        </span>
      </div>
    </AntFooter>
  )
}
