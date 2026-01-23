// lib/theme/components.ts
// 컴포넌트별 커스텀 토큰 - Glassmorphism SaaS Dashboard
// Modern, Professional, Clarity-focused

import type { ThemeConfig } from 'antd'

// 라이트 모드 컴포넌트 토큰 - Glassmorphism Style
export const componentTokens: ThemeConfig['components'] = {
  // 버튼 - Clean & Modern
  Button: {
    primaryShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
    defaultBorderColor: '#E2E8F0',
    defaultBg: 'rgba(255, 255, 255, 0.8)',
    defaultHoverBg: 'rgba(255, 255, 255, 0.95)',
    defaultHoverBorderColor: '#CBD5E1',
    defaultActiveBg: '#F8FAFC',
    defaultActiveBorderColor: '#94A3B8',
    fontWeight: 500,
    borderRadius: 10,
  },

  // 레이아웃 - Glassmorphism Base
  Layout: {
    headerBg: 'rgba(255, 255, 255, 0.85)',
    headerColor: '#1E293B',
    headerPadding: '0 20px',
    headerHeight: 60,
    siderBg: 'rgba(255, 255, 255, 0.75)',
    bodyBg: '#F1F5F9',
    footerBg: 'rgba(255, 255, 255, 0.7)',
    footerPadding: '12px 24px',
  },

  // 메뉴 - Clean Navigation
  Menu: {
    itemBg: 'transparent',
    subMenuItemBg: 'transparent',
    itemColor: '#475569',
    itemHoverColor: '#3B82F6',
    itemHoverBg: 'rgba(59, 130, 246, 0.08)',
    itemSelectedBg: 'rgba(59, 130, 246, 0.12)',
    itemSelectedColor: '#3B82F6',
    itemActiveBg: 'rgba(59, 130, 246, 0.12)',
    groupTitleColor: '#94A3B8',
    horizontalItemSelectedColor: '#3B82F6',
    horizontalItemSelectedBg: 'rgba(59, 130, 246, 0.12)',
    iconSize: 18,
    collapsedIconSize: 20,
    itemMarginInline: 8,
    itemBorderRadius: 10,
    itemPaddingInline: 16,
    subMenuItemBorderRadius: 8,
  },

  // 카드 - Glassmorphism Style
  Card: {
    headerBg: 'transparent',
    headerHeight: 52,
    paddingLG: 24,
    borderRadiusLG: 16,
    colorBorderSecondary: '#E2E8F0',
  },

  // 테이블 - Clean & Readable
  Table: {
    headerBg: 'rgba(248, 250, 252, 0.9)',
    headerColor: '#475569',
    headerSplitColor: '#E2E8F0',
    rowHoverBg: 'rgba(59, 130, 246, 0.04)',
    rowSelectedBg: 'rgba(59, 130, 246, 0.08)',
    rowSelectedHoverBg: 'rgba(59, 130, 246, 0.12)',
    borderColor: '#E2E8F0',
    cellPaddingBlock: 14,
    cellPaddingInline: 18,
    headerBorderRadius: 10,
  },

  // 입력 - Subtle & Clean
  Input: {
    activeBorderColor: '#3B82F6',
    hoverBorderColor: '#93C5FD',
    activeShadow: '0 0 0 3px rgba(59, 130, 246, 0.15)',
    paddingBlock: 10,
    paddingInline: 14,
    addonBg: '#F8FAFC',
    borderRadius: 10,
  },

  // 선택 - Clean Dropdown
  Select: {
    optionSelectedBg: 'rgba(59, 130, 246, 0.12)',
    optionActiveBg: 'rgba(59, 130, 246, 0.08)',
    selectorBg: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
  },

  // 탭 - Modern Style
  Tabs: {
    itemColor: '#64748B',
    itemHoverColor: '#3B82F6',
    itemSelectedColor: '#3B82F6',
    inkBarColor: '#3B82F6',
    cardBg: 'rgba(255, 255, 255, 0.8)',
    cardHeight: 44,
    cardPadding: '10px 18px',
    cardGutter: 6,
  },

  // 배지
  Badge: {
    dotSize: 8,
  },

  // 브레드크럼 - Subtle
  Breadcrumb: {
    itemColor: '#64748B',
    lastItemColor: '#1E293B',
    linkColor: '#64748B',
    linkHoverColor: '#3B82F6',
    separatorColor: '#CBD5E1',
  },

  // 모달 - Glassmorphism
  Modal: {
    headerBg: 'rgba(255, 255, 255, 0.95)',
    contentBg: 'rgba(255, 255, 255, 0.95)',
    footerBg: 'rgba(255, 255, 255, 0.95)',
    titleColor: '#1E293B',
    titleFontSize: 18,
    borderRadiusLG: 20,
  },

  // 드롭다운 - Clean
  Dropdown: {
    paddingBlock: 10,
    borderRadiusLG: 12,
  },

  // 폼 - Professional Labels
  Form: {
    labelColor: '#475569',
    labelRequiredMarkColor: '#EF4444',
  },

  // 알림 - Clear & Distinct
  Alert: {
    colorInfoBg: '#ECFEFF',
    colorInfoBorder: '#67E8F9',
    colorSuccessBg: '#ECFDF5',
    colorSuccessBorder: '#6EE7B7',
    colorWarningBg: '#FFFBEB',
    colorWarningBorder: '#FCD34D',
    colorErrorBg: '#FEF2F2',
    colorErrorBorder: '#FCA5A5',
    borderRadiusLG: 12,
  },

  // 스핀
  Spin: {
    dotSizeLG: 40,
    dotSize: 24,
    dotSizeSM: 16,
  },

  // 태그 - Modern
  Tag: {
    defaultBg: '#F1F5F9',
    defaultColor: '#475569',
    borderRadiusSM: 6,
  },

  // 아바타
  Avatar: {
    containerSize: 36,
    containerSizeLG: 44,
    containerSizeSM: 28,
    borderRadius: 10,
  },

  // 토스트/메시지 - Glassmorphism
  Message: {
    contentBg: 'rgba(255, 255, 255, 0.95)',
    contentPadding: '12px 18px',
  },

  // 툴팁 - Dark Contrast
  Tooltip: {
    colorBgSpotlight: '#1E293B',
    colorTextLightSolid: '#FFFFFF',
    borderRadius: 8,
  },

  // 슬라이더 - Blue Accent
  Slider: {
    trackBg: '#DBEAFE',
    trackHoverBg: '#BFDBFE',
    handleColor: '#3B82F6',
    handleActiveColor: '#2563EB',
    dotBorderColor: '#E2E8F0',
  },

  // 스위치 - Blue Accent
  Switch: {
    colorPrimary: '#3B82F6',
    colorPrimaryHover: '#2563EB',
    handleBg: '#FFFFFF',
  },

  // 진행바 - Blue Accent
  Progress: {
    defaultColor: '#3B82F6',
    remainingColor: '#E2E8F0',
  },
}

// 다크 모드 컴포넌트 토큰
export const darkComponentTokens: ThemeConfig['components'] = {
  // 버튼
  Button: {
    primaryShadow: '0 2px 4px -1px rgba(59, 130, 246, 0.3)',
    defaultBorderColor: '#334155',
    defaultBg: '#1E293B',
    defaultHoverBg: '#334155',
    defaultHoverBorderColor: '#475569',
    defaultActiveBg: '#475569',
    defaultActiveBorderColor: '#64748B',
    fontWeight: 500,
  },

  // 레이아웃
  Layout: {
    headerBg: '#1E293B',
    headerColor: '#F1F5F9',
    headerPadding: '0 16px',
    headerHeight: 56,
    siderBg: '#1E293B',
    bodyBg: '#0F172A',
    footerBg: '#1E293B',
    footerPadding: '12px 24px',
  },

  // 메뉴
  Menu: {
    itemBg: 'transparent',
    subMenuItemBg: 'transparent',
    itemColor: '#E2E8F0',
    itemHoverColor: '#93C5FD',
    itemHoverBg: '#334155',
    itemSelectedBg: '#1E3A5F',
    itemSelectedColor: '#93C5FD',
    itemActiveBg: '#1E3A5F',
    groupTitleColor: '#94A3B8',
    horizontalItemSelectedColor: '#93C5FD',
    horizontalItemSelectedBg: '#1E3A5F',
    iconSize: 16,
    collapsedIconSize: 18,
    itemMarginInline: 8,
    itemBorderRadius: 6,
    itemPaddingInline: 12,
    subMenuItemBorderRadius: 4,
    darkItemBg: 'transparent',
    darkSubMenuItemBg: 'transparent',
    darkItemColor: '#E2E8F0',
    darkItemHoverColor: '#93C5FD',
    darkItemHoverBg: '#334155',
    darkItemSelectedBg: '#1E3A5F',
    darkItemSelectedColor: '#93C5FD',
  },

  // 카드
  Card: {
    headerBg: 'transparent',
    headerHeight: 48,
    paddingLG: 20,
    colorBgContainer: '#1E293B',
    colorBorderSecondary: '#334155',
  },

  // 테이블
  Table: {
    headerBg: '#1E293B',
    headerColor: '#CBD5E1',
    headerSplitColor: '#334155',
    rowHoverBg: '#334155',
    rowSelectedBg: '#1E3A5F',
    rowSelectedHoverBg: '#1E40AF',
    borderColor: '#334155',
    cellPaddingBlock: 12,
    cellPaddingInline: 16,
    headerBorderRadius: 6,
    colorBgContainer: '#1E293B',
  },

  // 입력
  Input: {
    activeBorderColor: '#3B82F6',
    hoverBorderColor: '#60A5FA',
    activeShadow: '0 0 0 2px rgba(59, 130, 246, 0.2)',
    paddingBlock: 8,
    paddingInline: 12,
    addonBg: '#334155',
    colorBgContainer: '#1E293B',
    colorBorder: '#334155',
  },

  // 선택
  Select: {
    optionSelectedBg: '#1E3A5F',
    optionActiveBg: '#334155',
    selectorBg: '#1E293B',
    colorBorder: '#334155',
  },

  // 탭
  Tabs: {
    itemColor: '#94A3B8',
    itemHoverColor: '#60A5FA',
    itemSelectedColor: '#60A5FA',
    inkBarColor: '#3B82F6',
    cardBg: '#1E293B',
    cardHeight: 40,
    cardPadding: '8px 16px',
    cardGutter: 4,
  },

  // 배지
  Badge: {
    dotSize: 8,
  },

  // 브레드크럼
  Breadcrumb: {
    itemColor: '#94A3B8',
    lastItemColor: '#F1F5F9',
    linkColor: '#94A3B8',
    linkHoverColor: '#60A5FA',
    separatorColor: '#475569',
  },

  // 모달
  Modal: {
    headerBg: '#1E293B',
    contentBg: '#1E293B',
    footerBg: '#1E293B',
    titleColor: '#F1F5F9',
    titleFontSize: 18,
  },

  // 드롭다운
  Dropdown: {
    paddingBlock: 8,
    colorBgElevated: '#334155',
  },

  // 폼
  Form: {
    labelColor: '#CBD5E1',
    labelRequiredMarkColor: '#EF4444',
  },

  // 알림
  Alert: {
    colorInfoBg: '#0C4A6E',
    colorInfoBorder: '#0369A1',
    colorSuccessBg: '#14532D',
    colorSuccessBorder: '#166534',
    colorWarningBg: '#78350F',
    colorWarningBorder: '#92400E',
    colorErrorBg: '#7F1D1D',
    colorErrorBorder: '#991B1B',
  },

  // 스핀
  Spin: {
    dotSizeLG: 40,
    dotSize: 24,
    dotSizeSM: 16,
  },

  // 태그
  Tag: {
    defaultBg: '#334155',
    defaultColor: '#CBD5E1',
  },

  // 아바타
  Avatar: {
    containerSize: 32,
    containerSizeLG: 40,
    containerSizeSM: 24,
    colorBgBase: '#334155',
  },

  // 토스트/메시지
  Message: {
    contentBg: '#334155',
    contentPadding: '10px 16px',
  },

  // 툴팁
  Tooltip: {
    colorBgSpotlight: '#475569',
    colorTextLightSolid: '#F8FAFC',
  },
}
