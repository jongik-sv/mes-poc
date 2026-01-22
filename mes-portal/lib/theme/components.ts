// lib/theme/components.ts
// 컴포넌트별 커스텀 토큰 - Enterprise MES Portal

import type { ThemeConfig } from 'antd'

// 라이트 모드 컴포넌트 토큰
export const componentTokens: ThemeConfig['components'] = {
  // 버튼
  Button: {
    primaryShadow: '0 2px 4px -1px rgba(37, 99, 235, 0.2)',
    defaultBorderColor: '#E2E8F0',
    defaultBg: '#FFFFFF',
    defaultHoverBg: '#F8FAFC',
    defaultHoverBorderColor: '#CBD5E1',
    defaultActiveBg: '#F1F5F9',
    defaultActiveBorderColor: '#94A3B8',
    fontWeight: 500,
  },

  // 레이아웃
  Layout: {
    headerBg: '#FFFFFF',
    headerColor: '#0F172A',
    headerPadding: '0 16px',
    headerHeight: 56,
    siderBg: '#FFFFFF',
    bodyBg: '#F8FAFC',
    footerBg: '#FFFFFF',
    footerPadding: '12px 24px',
  },

  // 메뉴
  Menu: {
    itemBg: 'transparent',
    subMenuItemBg: 'transparent',
    itemColor: '#475569',
    itemHoverColor: '#2563EB',
    itemHoverBg: '#F1F5F9',
    itemSelectedBg: '#DBEAFE',
    itemSelectedColor: '#2563EB',
    itemActiveBg: '#DBEAFE',
    groupTitleColor: '#94A3B8',
    horizontalItemSelectedColor: '#2563EB',
    horizontalItemSelectedBg: '#DBEAFE',
    iconSize: 16,
    collapsedIconSize: 18,
    itemMarginInline: 8,
    itemBorderRadius: 6,
    itemPaddingInline: 12,
    subMenuItemBorderRadius: 4,
  },

  // 카드
  Card: {
    headerBg: 'transparent',
    headerHeight: 48,
    paddingLG: 20,
  },

  // 테이블
  Table: {
    headerBg: '#F8FAFC',
    headerColor: '#475569',
    headerSplitColor: '#E2E8F0',
    rowHoverBg: '#F1F5F9',
    rowSelectedBg: '#DBEAFE',
    rowSelectedHoverBg: '#BFDBFE',
    borderColor: '#E2E8F0',
    cellPaddingBlock: 12,
    cellPaddingInline: 16,
    headerBorderRadius: 6,
  },

  // 입력
  Input: {
    activeBorderColor: '#2563EB',
    hoverBorderColor: '#93C5FD',
    activeShadow: '0 0 0 2px rgba(37, 99, 235, 0.1)',
    paddingBlock: 8,
    paddingInline: 12,
    addonBg: '#F8FAFC',
  },

  // 선택
  Select: {
    optionSelectedBg: '#DBEAFE',
    optionActiveBg: '#F1F5F9',
    selectorBg: '#FFFFFF',
  },

  // 탭
  Tabs: {
    itemColor: '#64748B',
    itemHoverColor: '#2563EB',
    itemSelectedColor: '#2563EB',
    inkBarColor: '#2563EB',
    cardBg: '#F8FAFC',
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
    itemColor: '#64748B',
    lastItemColor: '#0F172A',
    linkColor: '#64748B',
    linkHoverColor: '#2563EB',
    separatorColor: '#CBD5E1',
  },

  // 모달
  Modal: {
    headerBg: '#FFFFFF',
    contentBg: '#FFFFFF',
    footerBg: '#FFFFFF',
    titleColor: '#0F172A',
    titleFontSize: 18,
  },

  // 드롭다운
  Dropdown: {
    paddingBlock: 8,
  },

  // 폼
  Form: {
    labelColor: '#334155',
    labelRequiredMarkColor: '#DC2626',
  },

  // 알림
  Alert: {
    colorInfoBg: '#E0F2FE',
    colorInfoBorder: '#7DD3FC',
    colorSuccessBg: '#DCFCE7',
    colorSuccessBorder: '#86EFAC',
    colorWarningBg: '#FEF3C7',
    colorWarningBorder: '#FCD34D',
    colorErrorBg: '#FEE2E2',
    colorErrorBorder: '#FCA5A5',
  },

  // 스핀
  Spin: {
    dotSizeLG: 40,
    dotSize: 24,
    dotSizeSM: 16,
  },

  // 태그
  Tag: {
    defaultBg: '#F1F5F9',
    defaultColor: '#475569',
  },

  // 아바타
  Avatar: {
    containerSize: 32,
    containerSizeLG: 40,
    containerSizeSM: 24,
  },

  // 토스트/메시지
  Message: {
    contentBg: '#FFFFFF',
    contentPadding: '10px 16px',
  },

  // 툴팁
  Tooltip: {
    colorBgSpotlight: '#1E293B',
    colorTextLightSolid: '#F8FAFC',
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
