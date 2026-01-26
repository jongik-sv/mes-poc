// lib/theme/tokens.ts
// Ant Design Token 정의 - Glassmorphism SaaS Dashboard 디자인 시스템
// Modern, Professional, Clarity-focused

export const themeTokens = {
  // 브랜드 색상 - Vibrant Blue (Modern SaaS)
  colorPrimary: '#3B82F6',
  colorPrimaryHover: '#2563EB',
  colorPrimaryActive: '#1D4ED8',
  colorPrimaryBg: '#EFF6FF',
  colorPrimaryBgHover: '#DBEAFE',
  colorPrimaryBorder: '#93C5FD',
  colorPrimaryBorderHover: '#60A5FA',
  colorPrimaryText: '#3B82F6',
  colorPrimaryTextHover: '#2563EB',
  colorPrimaryTextActive: '#1D4ED8',

  // 시맨틱 색상 - Clear & Distinct
  colorSuccess: '#10B981',
  colorSuccessBg: '#ECFDF5',
  colorSuccessBorder: '#6EE7B7',
  colorWarning: '#F59E0B',
  colorWarningBg: '#FFFBEB',
  colorWarningBorder: '#FCD34D',
  colorError: '#EF4444',
  colorErrorBg: '#FEF2F2',
  colorErrorBorder: '#FCA5A5',
  colorInfo: '#06B6D4',
  colorInfoBg: '#ECFEFF',
  colorInfoBorder: '#67E8F9',

  // 뉴트럴 색상 - Clean & Professional
  colorText: '#1E293B',
  colorTextSecondary: '#475569',
  colorTextTertiary: '#64748B',
  colorTextQuaternary: '#94A3B8',
  colorBgContainer: 'rgba(255, 255, 255, 0.7)',  // Glassmorphism - 반투명 흰색
  colorBgElevated: 'rgba(255, 255, 255, 0.85)',
  colorBgLayout: '#F1F5F9',    // 페이지 배경 - Slate 100
  colorBgSpotlight: '#FFFFFF',
  colorBgMask: 'rgba(15, 23, 42, 0.5)',
  colorBorder: '#94A3B8',  // Slate 400 - 라이트 모드에서 가시성 확보
  colorBorderSecondary: '#E2E8F0',
  colorFill: '#F1F5F9',
  colorFillSecondary: '#E2E8F0',
  colorFillTertiary: '#F8FAFC',
  colorFillQuaternary: '#FFFFFF',

  // 레이아웃 - Modern rounded corners
  borderRadius: 12,
  borderRadiusLG: 16,
  borderRadiusSM: 8,
  borderRadiusXS: 4,

  // 컨트롤 높이
  controlHeight: 40,
  controlHeightLG: 48,
  controlHeightSM: 32,
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

  // 폰트 - Fira Sans (Dashboard, Analytics)
  fontFamily: "'Fira Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  fontFamilyCode: "'Fira Code', 'SF Mono', Consolas, monospace",
  fontSize: 14,
  fontSizeSM: 12,
  fontSizeLG: 16,
  fontSizeXL: 20,
  fontSizeHeading1: 36,
  fontSizeHeading2: 28,
  fontSizeHeading3: 22,
  fontSizeHeading4: 18,
  fontSizeHeading5: 16,

  // 라인 높이
  lineHeight: 1.6,
  lineHeightLG: 1.5,
  lineHeightSM: 1.7,
  lineHeightHeading1: 1.25,
  lineHeightHeading2: 1.3,
  lineHeightHeading3: 1.35,
  lineHeightHeading4: 1.4,
  lineHeightHeading5: 1.5,

  // 그림자 - Glassmorphism Shadows (Depth + Glow)
  boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
  boxShadowSecondary: '0 4px 16px rgba(31, 38, 135, 0.1)',
  boxShadowTertiary: '0 2px 8px rgba(31, 38, 135, 0.08)',

  // 애니메이션 - Smooth & Professional
  motionDurationFast: '0.15s',
  motionDurationMid: '0.25s',
  motionDurationSlow: '0.35s',
  motionEaseInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  motionEaseOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
  motionEaseIn: 'cubic-bezier(0.4, 0, 1, 1)',

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
  colorBorderSecondary: '#475569',
  colorFill: '#334155',
  colorFillSecondary: '#1E293B',
  colorFillTertiary: '#0F172A',
  colorFillQuaternary: '#0F172A',

  // 다크 모드 그림자
  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.2), 0 1px 6px -1px rgba(0, 0, 0, 0.15), 0 2px 4px 0 rgba(0, 0, 0, 0.15)',
  boxShadowSecondary: '0 6px 16px 0 rgba(0, 0, 0, 0.4), 0 3px 6px -4px rgba(0, 0, 0, 0.5), 0 9px 28px 8px rgba(0, 0, 0, 0.3)',
  boxShadowTertiary: '0 1px 2px 0 rgba(0, 0, 0, 0.2), 0 1px 6px -1px rgba(0, 0, 0, 0.15), 0 2px 4px 0 rgba(0, 0, 0, 0.15)',
}
