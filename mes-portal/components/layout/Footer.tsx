// components/layout/Footer.tsx
// MES Portal 푸터 컴포넌트 - Enterprise Design
'use client'

import { Layout, theme } from 'antd'

const { Footer: AntFooter } = Layout

interface FooterProps {
  className?: string
}

const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0'
const COPYRIGHT_YEAR = new Date().getFullYear()

export function Footer({ className }: FooterProps) {
  const { token } = theme.useToken()

  return (
    <AntFooter
      className={`flex justify-between items-center px-6 ${className || ''}`}
      style={{
        height: 'var(--footer-height)',
        padding: '0 24px',
        backgroundColor: token.colorBgContainer,
        borderTop: `1px solid ${token.colorBorder}`,
      }}
      data-testid="footer-component"
    >
      <span
        className="text-xs"
        style={{ color: token.colorTextTertiary }}
        data-testid="footer-copyright"
      >
        Copyright &copy; {COPYRIGHT_YEAR} Company. All rights reserved.
      </span>
      <div className="flex items-center gap-4">
        <span
          className="text-xs"
          style={{ color: token.colorTextQuaternary }}
        >
          MES Portal
        </span>
        <span
          className="text-xs font-medium px-2 py-0.5 rounded"
          style={{
            color: token.colorPrimary,
            backgroundColor: token.colorPrimaryBg,
          }}
          data-testid="footer-version"
        >
          v{APP_VERSION}
        </span>
      </div>
    </AntFooter>
  )
}
