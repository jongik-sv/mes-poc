// lib/theme/components.ts
// 컴포넌트별 커스텀 토큰

import type { ThemeConfig } from 'antd'

export const componentTokens: ThemeConfig['components'] = {
  Button: {
    primaryShadow: '0 2px 0 rgba(22, 119, 255, 0.1)',
  },
  Layout: {
    headerBg: '#fff',
    siderBg: '#fff',
    bodyBg: '#f5f5f5',
  },
  Menu: {
    itemBg: 'transparent',
    subMenuItemBg: 'transparent',
  },
}

export const darkComponentTokens: ThemeConfig['components'] = {
  Button: {
    primaryShadow: '0 2px 0 rgba(22, 119, 255, 0.2)',
  },
  Layout: {
    headerBg: '#141414',
    siderBg: '#141414',
    bodyBg: '#000',
  },
  Menu: {
    itemBg: 'transparent',
    subMenuItemBg: 'transparent',
  },
}
