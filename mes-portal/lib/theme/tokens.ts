// lib/theme/tokens.ts
// Ant Design Token 정의 - Enterprise MES Portal 디자인 시스템

export const themeTokens = {
  // 브랜드 색상 - Trust Blue (기업용)
  colorPrimary: '#2563EB',
  colorPrimaryHover: '#1D4ED8',
  colorPrimaryActive: '#1E40AF',
  colorPrimaryBg: '#DBEAFE',
  colorPrimaryBgHover: '#BFDBFE',
  colorPrimaryBorder: '#93C5FD',
  colorPrimaryBorderHover: '#60A5FA',
  colorPrimaryText: '#2563EB',
  colorPrimaryTextHover: '#1D4ED8',
  colorPrimaryTextActive: '#1E40AF',

  // 시맨틱 색상
  colorSuccess: '#16A34A',
  colorSuccessBg: '#DCFCE7',
  colorSuccessBorder: '#86EFAC',
  colorWarning: '#D97706',
  colorWarningBg: '#FEF3C7',
  colorWarningBorder: '#FCD34D',
  colorError: '#DC2626',
  colorErrorBg: '#FEE2E2',
  colorErrorBorder: '#FCA5A5',
  colorInfo: '#0284C7',
  colorInfoBg: '#E0F2FE',
  colorInfoBorder: '#7DD3FC',

  // 뉴트럴 색상
  colorText: '#0F172A',
  colorTextSecondary: '#475569',
  colorTextTertiary: '#64748B',
  colorTextQuaternary: '#94A3B8',
  colorBgContainer: '#FFFFFF',
  colorBgElevated: '#FFFFFF',
  colorBgLayout: '#F8FAFC',
  colorBgSpotlight: '#F1F5F9',
  colorBgMask: 'rgba(0, 0, 0, 0.45)',
  colorBorder: '#E2E8F0',
  colorBorderSecondary: '#F1F5F9',
  colorFill: '#F1F5F9',
  colorFillSecondary: '#F8FAFC',
  colorFillTertiary: '#FFFFFF',
  colorFillQuaternary: '#FFFFFF',

  // 레이아웃
  borderRadius: 6,
  borderRadiusLG: 8,
  borderRadiusSM: 4,
  borderRadiusXS: 2,

  // 컨트롤 높이
  controlHeight: 36,
  controlHeightLG: 44,
  controlHeightSM: 28,
  controlHeightXS: 24,

  // 간격 (Ant Design 기본값 기준)
  marginXXS: 4,
  marginXS: 8,
  marginSM: 12,
  margin: 16,
  marginMD: 20,
  marginLG: 24,
  marginXL: 32,
  marginXXL: 48,

  paddingXXS: 4,
  paddingXS: 8,
  paddingSM: 12,
  padding: 16,
  paddingMD: 20,
  paddingLG: 24,
  paddingXL: 32,

  // 폰트 - IBM Plex Sans (기업용, 신뢰감)
  fontFamily: "'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  fontFamilyCode: "'IBM Plex Mono', 'SF Mono', Consolas, monospace",
  fontSize: 14,
  fontSizeSM: 12,
  fontSizeLG: 16,
  fontSizeXL: 20,
  fontSizeHeading1: 38,
  fontSizeHeading2: 30,
  fontSizeHeading3: 24,
  fontSizeHeading4: 20,
  fontSizeHeading5: 16,

  // 라인 높이
  lineHeight: 1.5714285714285714,
  lineHeightLG: 1.5,
  lineHeightSM: 1.6666666666666667,
  lineHeightHeading1: 1.2105263157894737,
  lineHeightHeading2: 1.2666666666666666,
  lineHeightHeading3: 1.3333333333333333,
  lineHeightHeading4: 1.4,
  lineHeightHeading5: 1.5,

  // 그림자
  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
  boxShadowSecondary: '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
  boxShadowTertiary: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',

  // 애니메이션
  motionDurationFast: '0.1s',
  motionDurationMid: '0.2s',
  motionDurationSlow: '0.3s',
  motionEaseInOut: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
  motionEaseOut: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
  motionEaseIn: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',

  // 와이어프레임 (개발 모드용)
  wireframe: false,
}

// 다크 모드 토큰 오버라이드
export const darkThemeTokens = {
  ...themeTokens,

  // 다크 모드 브랜드 색상
  colorPrimary: '#3B82F6',
  colorPrimaryHover: '#60A5FA',
  colorPrimaryActive: '#2563EB',
  colorPrimaryBg: '#1E3A5F',
  colorPrimaryBgHover: '#1E40AF',
  colorPrimaryBorder: '#3B82F6',
  colorPrimaryBorderHover: '#60A5FA',
  colorPrimaryText: '#60A5FA',
  colorPrimaryTextHover: '#93C5FD',
  colorPrimaryTextActive: '#3B82F6',

  // 다크 모드 시맨틱 색상
  colorSuccess: '#22C55E',
  colorSuccessBg: '#14532D',
  colorSuccessBorder: '#166534',
  colorWarning: '#F59E0B',
  colorWarningBg: '#78350F',
  colorWarningBorder: '#92400E',
  colorError: '#EF4444',
  colorErrorBg: '#7F1D1D',
  colorErrorBorder: '#991B1B',
  colorInfo: '#38BDF8',
  colorInfoBg: '#0C4A6E',
  colorInfoBorder: '#0369A1',

  // 다크 모드 뉴트럴 색상
  colorText: '#F1F5F9',
  colorTextSecondary: '#CBD5E1',
  colorTextTertiary: '#94A3B8',
  colorTextQuaternary: '#64748B',
  colorBgContainer: '#1E293B',
  colorBgElevated: '#334155',
  colorBgLayout: '#0F172A',
  colorBgSpotlight: '#1E293B',
  colorBgMask: 'rgba(0, 0, 0, 0.65)',
  colorBorder: '#334155',
  colorBorderSecondary: '#1E293B',
  colorFill: '#334155',
  colorFillSecondary: '#1E293B',
  colorFillTertiary: '#0F172A',
  colorFillQuaternary: '#0F172A',

  // 다크 모드 그림자
  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.2), 0 1px 6px -1px rgba(0, 0, 0, 0.15), 0 2px 4px 0 rgba(0, 0, 0, 0.15)',
  boxShadowSecondary: '0 6px 16px 0 rgba(0, 0, 0, 0.4), 0 3px 6px -4px rgba(0, 0, 0, 0.5), 0 9px 28px 8px rgba(0, 0, 0, 0.3)',
  boxShadowTertiary: '0 1px 2px 0 rgba(0, 0, 0, 0.2), 0 1px 6px -1px rgba(0, 0, 0, 0.15), 0 2px 4px 0 rgba(0, 0, 0, 0.15)',
}
