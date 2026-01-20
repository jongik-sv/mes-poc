/**
 * Glassmorphism Big Sur Theme for Ant Design 6.x
 * Source: https://dribbble.com/shots/14831798-Glassmorphism-Big-Sur-Creative-Cloud-App-Redesign
 *
 * 이 테마는 macOS Big Sur의 Glassmorphism 디자인을 Ant Design에 적용합니다.
 * Dark 모드 전용 테마이며, 반투명 유리 효과를 특징으로 합니다.
 */

import type { ThemeConfig } from 'antd';
import { theme } from 'antd';

// ============================================================================
// 색상 팔레트
// ============================================================================

export const glassmorphismColors = {
  // Primary (Deep Purple)
  primary: {
    50: '#EDE7F6',
    100: '#D1C4E9',
    200: '#B39DDB',
    300: '#9575CD',
    400: '#7E57C2',
    500: '#673AB7',
    600: '#5E35B1',
    700: '#512DA8',
    800: '#4527A0',
    900: '#311B92',
  },

  // Secondary (Pink/Magenta)
  secondary: {
    50: '#FCE4EC',
    100: '#F8BBD9',
    200: '#F48FB1',
    300: '#F06292',
    400: '#EC407A',
    500: '#E91E63',
    600: '#D81B60',
    700: '#C2185B',
    800: '#AD1457',
    900: '#880E4F',
  },

  // Accent Colors
  accent: {
    orange: '#FF9800',
    blue: '#2196F3',
    cyan: '#00BCD4',
  },

  // Semantic
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',

  // Background
  background: {
    dark: '#1A0B2E',
    gradient: 'linear-gradient(135deg, #2D1B4E 0%, #4A1942 50%, #1A0B2E 100%)',
  },

  // Glass surfaces (rgba values)
  glass: {
    light: 'rgba(255, 255, 255, 0.15)',
    medium: 'rgba(255, 255, 255, 0.10)',
    dark: 'rgba(255, 255, 255, 0.05)',
  },

  // Text
  text: {
    primary: '#FFFFFF',
    secondary: 'rgba(255, 255, 255, 0.7)',
    disabled: 'rgba(255, 255, 255, 0.4)',
  },

  // Border
  border: {
    glass: 'rgba(255, 255, 255, 0.2)',
    light: 'rgba(255, 255, 255, 0.1)',
  },
};

// ============================================================================
// Glassmorphism CSS 유틸리티
// ============================================================================

export const glassmorphismStyles = {
  card: {
    background: 'rgba(255, 255, 255, 0.12)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '16px',
  },
  sidebar: {
    background: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  modal: {
    background: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '20px',
  },
  button: {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
  },
  input: {
    background: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
  },
};

// ============================================================================
// Ant Design Theme Token
// ============================================================================

export const glassmorphismToken = {
  // Primary Colors
  colorPrimary: glassmorphismColors.primary[500],
  colorPrimaryBg: glassmorphismColors.primary[900],
  colorPrimaryBgHover: glassmorphismColors.primary[800],
  colorPrimaryBorder: glassmorphismColors.primary[400],
  colorPrimaryBorderHover: glassmorphismColors.primary[300],
  colorPrimaryHover: glassmorphismColors.primary[400],
  colorPrimaryActive: glassmorphismColors.primary[600],
  colorPrimaryText: glassmorphismColors.primary[300],
  colorPrimaryTextHover: glassmorphismColors.primary[200],
  colorPrimaryTextActive: glassmorphismColors.primary[400],

  // Semantic Colors
  colorSuccess: glassmorphismColors.success,
  colorWarning: glassmorphismColors.warning,
  colorError: glassmorphismColors.error,
  colorInfo: glassmorphismColors.info,

  // Background
  colorBgBase: glassmorphismColors.background.dark,
  colorBgContainer: 'rgba(255, 255, 255, 0.08)',
  colorBgElevated: 'rgba(255, 255, 255, 0.12)',
  colorBgLayout: glassmorphismColors.background.dark,
  colorBgSpotlight: 'rgba(255, 255, 255, 0.15)',
  colorBgMask: 'rgba(0, 0, 0, 0.6)',

  // Border
  colorBorder: glassmorphismColors.border.light,
  colorBorderSecondary: glassmorphismColors.border.glass,

  // Text
  colorText: glassmorphismColors.text.primary,
  colorTextSecondary: glassmorphismColors.text.secondary,
  colorTextTertiary: glassmorphismColors.text.disabled,
  colorTextQuaternary: 'rgba(255, 255, 255, 0.3)',
  colorTextPlaceholder: 'rgba(255, 255, 255, 0.4)',
  colorTextDisabled: glassmorphismColors.text.disabled,
  colorTextHeading: glassmorphismColors.text.primary,
  colorTextLabel: glassmorphismColors.text.secondary,
  colorTextDescription: glassmorphismColors.text.secondary,

  // Fill (for backgrounds)
  colorFill: 'rgba(255, 255, 255, 0.1)',
  colorFillSecondary: 'rgba(255, 255, 255, 0.08)',
  colorFillTertiary: 'rgba(255, 255, 255, 0.05)',
  colorFillQuaternary: 'rgba(255, 255, 255, 0.03)',

  // Split (dividers)
  colorSplit: 'rgba(255, 255, 255, 0.1)',

  // Typography
  fontFamily:
    "SF Pro Display, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  fontFamilyCode: "SF Mono, Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, monospace",
  fontSize: 14,
  fontSizeSM: 12,
  fontSizeLG: 16,
  fontSizeXL: 20,
  fontSizeHeading1: 38,
  fontSizeHeading2: 30,
  fontSizeHeading3: 24,
  fontSizeHeading4: 20,
  fontSizeHeading5: 16,

  // Border Radius
  borderRadius: 8,
  borderRadiusSM: 4,
  borderRadiusLG: 12,
  borderRadiusXS: 2,

  // Control Heights
  controlHeight: 36,
  controlHeightLG: 44,
  controlHeightSM: 28,
  controlHeightXS: 20,

  // Line Widths
  lineWidth: 1,
  lineWidthBold: 2,
  lineWidthFocus: 3,

  // Motion
  motionDurationFast: '0.15s',
  motionDurationMid: '0.25s',
  motionDurationSlow: '0.35s',
  motionEaseInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  motionEaseOut: 'cubic-bezier(0, 0, 0.2, 1)',

  // Spacing
  marginXS: 8,
  marginSM: 12,
  margin: 16,
  marginMD: 20,
  marginLG: 24,
  marginXL: 32,
  paddingXS: 8,
  paddingSM: 12,
  padding: 16,
  paddingMD: 20,
  paddingLG: 24,
  paddingXL: 32,

  // Shadows
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
  boxShadowSecondary: '0 8px 32px rgba(0, 0, 0, 0.25)',
};

// ============================================================================
// Ant Design Component Token Overrides
// ============================================================================

export const glassmorphismComponents = {
  // Button
  Button: {
    primaryShadow: '0 4px 12px rgba(103, 58, 183, 0.4)',
    defaultBg: 'rgba(255, 255, 255, 0.1)',
    defaultBorderColor: 'rgba(255, 255, 255, 0.2)',
    defaultColor: '#FFFFFF',
    defaultHoverBg: 'rgba(255, 255, 255, 0.15)',
    defaultHoverBorderColor: 'rgba(255, 255, 255, 0.3)',
    defaultHoverColor: '#FFFFFF',
    defaultActiveBg: 'rgba(255, 255, 255, 0.2)',
    defaultActiveBorderColor: 'rgba(255, 255, 255, 0.35)',
    defaultActiveColor: '#FFFFFF',
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 6,
    paddingInline: 16,
    paddingInlineLG: 24,
    paddingInlineSM: 12,
  },

  // Card
  Card: {
    colorBgContainer: 'rgba(255, 255, 255, 0.12)',
    colorBorderSecondary: 'rgba(255, 255, 255, 0.2)',
    borderRadiusLG: 16,
    paddingLG: 24,
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
  },

  // Input
  Input: {
    colorBgContainer: 'rgba(255, 255, 255, 0.08)',
    colorBorder: 'rgba(255, 255, 255, 0.15)',
    colorText: '#FFFFFF',
    colorTextPlaceholder: 'rgba(255, 255, 255, 0.4)',
    hoverBorderColor: 'rgba(255, 255, 255, 0.3)',
    activeBorderColor: 'rgba(255, 255, 255, 0.4)',
    activeShadow: '0 0 0 2px rgba(103, 58, 183, 0.3)',
    borderRadius: 8,
    paddingInline: 12,
  },

  // Select
  Select: {
    colorBgContainer: 'rgba(255, 255, 255, 0.08)',
    colorBorder: 'rgba(255, 255, 255, 0.15)',
    colorText: '#FFFFFF',
    colorTextPlaceholder: 'rgba(255, 255, 255, 0.4)',
    optionActiveBg: 'rgba(255, 255, 255, 0.1)',
    optionSelectedBg: 'rgba(103, 58, 183, 0.3)',
    optionSelectedColor: '#FFFFFF',
    borderRadius: 8,
  },

  // Table
  Table: {
    colorBgContainer: 'transparent',
    headerBg: 'rgba(255, 255, 255, 0.08)',
    headerColor: 'rgba(255, 255, 255, 0.7)',
    headerSortActiveBg: 'rgba(255, 255, 255, 0.12)',
    headerSortHoverBg: 'rgba(255, 255, 255, 0.1)',
    rowHoverBg: 'rgba(255, 255, 255, 0.05)',
    rowSelectedBg: 'rgba(103, 58, 183, 0.2)',
    rowSelectedHoverBg: 'rgba(103, 58, 183, 0.25)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    bodySortBg: 'rgba(255, 255, 255, 0.03)',
    cellPaddingBlock: 12,
    cellPaddingInline: 16,
  },

  // Modal
  Modal: {
    contentBg: 'rgba(45, 27, 78, 0.95)',
    headerBg: 'transparent',
    footerBg: 'transparent',
    titleColor: '#FFFFFF',
    borderRadiusLG: 20,
    paddingContentHorizontalLG: 24,
  },

  // Drawer
  Drawer: {
    colorBgElevated: 'rgba(26, 11, 46, 0.95)',
    colorBgMask: 'rgba(0, 0, 0, 0.6)',
  },

  // Menu
  Menu: {
    colorBgContainer: 'transparent',
    itemBg: 'transparent',
    itemColor: 'rgba(255, 255, 255, 0.7)',
    itemHoverBg: 'rgba(255, 255, 255, 0.1)',
    itemHoverColor: '#FFFFFF',
    itemSelectedBg: 'rgba(255, 255, 255, 0.15)',
    itemSelectedColor: '#FFFFFF',
    itemActiveBg: 'rgba(103, 58, 183, 0.3)',
    subMenuItemBg: 'transparent',
    darkItemBg: 'transparent',
    darkItemColor: 'rgba(255, 255, 255, 0.7)',
    darkItemHoverBg: 'rgba(255, 255, 255, 0.1)',
    darkItemHoverColor: '#FFFFFF',
    darkItemSelectedBg: 'rgba(255, 255, 255, 0.15)',
    darkItemSelectedColor: '#FFFFFF',
    borderRadiusLG: 8,
    itemBorderRadius: 8,
    itemMarginBlock: 4,
    itemMarginInline: 8,
    itemPaddingInline: 16,
  },

  // Layout
  Layout: {
    bodyBg: glassmorphismColors.background.dark,
    headerBg: 'rgba(255, 255, 255, 0.05)',
    headerColor: '#FFFFFF',
    siderBg: 'rgba(255, 255, 255, 0.08)',
    triggerBg: 'rgba(255, 255, 255, 0.1)',
    triggerColor: '#FFFFFF',
  },

  // Tabs
  Tabs: {
    cardBg: 'rgba(255, 255, 255, 0.08)',
    cardGutter: 4,
    itemColor: 'rgba(255, 255, 255, 0.6)',
    itemHoverColor: 'rgba(255, 255, 255, 0.85)',
    itemSelectedColor: '#FFFFFF',
    inkBarColor: glassmorphismColors.primary[400],
    cardHeight: 40,
    titleFontSize: 14,
  },

  // Tag
  Tag: {
    defaultBg: 'rgba(255, 255, 255, 0.1)',
    defaultColor: '#FFFFFF',
    borderRadiusSM: 6,
  },

  // Badge
  Badge: {
    colorBgContainer: glassmorphismColors.error,
    colorBorderBg: 'transparent',
  },

  // Tooltip
  Tooltip: {
    colorBgSpotlight: 'rgba(45, 27, 78, 0.95)',
    colorTextLightSolid: '#FFFFFF',
    borderRadius: 8,
  },

  // Popover
  Popover: {
    colorBgElevated: 'rgba(45, 27, 78, 0.95)',
  },

  // Dropdown
  Dropdown: {
    colorBgElevated: 'rgba(45, 27, 78, 0.95)',
    controlItemBgHover: 'rgba(255, 255, 255, 0.1)',
    controlItemBgActive: 'rgba(103, 58, 183, 0.3)',
    borderRadiusLG: 12,
  },

  // Form
  Form: {
    labelColor: 'rgba(255, 255, 255, 0.7)',
    labelRequiredMarkColor: glassmorphismColors.error,
  },

  // Notification
  Notification: {
    colorBgElevated: 'rgba(45, 27, 78, 0.95)',
    colorText: '#FFFFFF',
    colorTextHeading: '#FFFFFF',
    borderRadiusLG: 12,
  },

  // Message
  Message: {
    contentBg: 'rgba(45, 27, 78, 0.95)',
    borderRadiusLG: 8,
  },

  // Progress
  Progress: {
    defaultColor: glassmorphismColors.primary[500],
    remainingColor: 'rgba(255, 255, 255, 0.1)',
  },

  // Statistic
  Statistic: {
    titleFontSize: 14,
    contentFontSize: 24,
  },

  // Divider
  Divider: {
    colorSplit: 'rgba(255, 255, 255, 0.1)',
    colorText: 'rgba(255, 255, 255, 0.5)',
  },

  // Avatar
  Avatar: {
    colorBgBase: 'rgba(255, 255, 255, 0.1)',
  },

  // Steps
  Steps: {
    colorPrimary: glassmorphismColors.primary[500],
    colorText: 'rgba(255, 255, 255, 0.7)',
    colorTextDescription: 'rgba(255, 255, 255, 0.5)',
  },

  // Timeline
  Timeline: {
    dotBg: glassmorphismColors.primary[500],
    tailColor: 'rgba(255, 255, 255, 0.15)',
  },

  // Tree
  Tree: {
    nodeHoverBg: 'rgba(255, 255, 255, 0.08)',
    nodeSelectedBg: 'rgba(103, 58, 183, 0.2)',
    directoryNodeSelectedBg: 'rgba(103, 58, 183, 0.3)',
    directoryNodeSelectedColor: '#FFFFFF',
  },

  // Collapse
  Collapse: {
    colorBgContainer: 'rgba(255, 255, 255, 0.05)',
    headerBg: 'rgba(255, 255, 255, 0.08)',
    contentBg: 'transparent',
  },

  // DatePicker
  DatePicker: {
    colorBgContainer: 'rgba(255, 255, 255, 0.08)',
    colorBgElevated: 'rgba(45, 27, 78, 0.95)',
    cellHoverBg: 'rgba(255, 255, 255, 0.1)',
    cellActiveWithRangeBg: 'rgba(103, 58, 183, 0.2)',
    cellRangeBorderColor: glassmorphismColors.primary[500],
  },

  // Pagination
  Pagination: {
    itemBg: 'rgba(255, 255, 255, 0.08)',
    itemActiveBg: glassmorphismColors.primary[500],
    itemInputBg: 'rgba(255, 255, 255, 0.08)',
  },

  // Spin
  Spin: {
    colorPrimary: glassmorphismColors.primary[400],
  },

  // Switch
  Switch: {
    colorPrimary: glassmorphismColors.primary[500],
    colorPrimaryHover: glassmorphismColors.primary[400],
    handleBg: '#FFFFFF',
  },

  // Slider
  Slider: {
    trackBg: glassmorphismColors.primary[500],
    trackHoverBg: glassmorphismColors.primary[400],
    railBg: 'rgba(255, 255, 255, 0.15)',
    railHoverBg: 'rgba(255, 255, 255, 0.2)',
    handleColor: glassmorphismColors.primary[500],
    handleActiveColor: glassmorphismColors.primary[400],
  },

  // Checkbox
  Checkbox: {
    colorPrimary: glassmorphismColors.primary[500],
    colorPrimaryHover: glassmorphismColors.primary[400],
    colorBgContainer: 'rgba(255, 255, 255, 0.08)',
    colorBorder: 'rgba(255, 255, 255, 0.3)',
  },

  // Radio
  Radio: {
    colorPrimary: glassmorphismColors.primary[500],
    colorPrimaryHover: glassmorphismColors.primary[400],
    colorBgContainer: 'rgba(255, 255, 255, 0.08)',
    dotColorDisabled: 'rgba(255, 255, 255, 0.3)',
  },

  // Alert
  Alert: {
    colorInfoBg: 'rgba(33, 150, 243, 0.15)',
    colorInfoBorder: 'rgba(33, 150, 243, 0.3)',
    colorSuccessBg: 'rgba(76, 175, 80, 0.15)',
    colorSuccessBorder: 'rgba(76, 175, 80, 0.3)',
    colorWarningBg: 'rgba(255, 152, 0, 0.15)',
    colorWarningBorder: 'rgba(255, 152, 0, 0.3)',
    colorErrorBg: 'rgba(244, 67, 54, 0.15)',
    colorErrorBorder: 'rgba(244, 67, 54, 0.3)',
    borderRadiusLG: 12,
  },

  // Breadcrumb
  Breadcrumb: {
    colorText: 'rgba(255, 255, 255, 0.5)',
    colorTextDescription: 'rgba(255, 255, 255, 0.7)',
    linkColor: 'rgba(255, 255, 255, 0.7)',
    linkHoverColor: '#FFFFFF',
    lastItemColor: '#FFFFFF',
    separatorColor: 'rgba(255, 255, 255, 0.3)',
  },
};

// ============================================================================
// Complete Ant Design Theme Config
// ============================================================================

export const glassmorphismTheme: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: glassmorphismToken,
  components: glassmorphismComponents,
};

// ============================================================================
// Export for lib/theme/tokens.ts integration
// ============================================================================

export const themeTokens = {
  // 색상 팔레트
  colorPrimary: glassmorphismColors.primary[500],
  colorSuccess: glassmorphismColors.success,
  colorWarning: glassmorphismColors.warning,
  colorError: glassmorphismColors.error,
  colorInfo: glassmorphismColors.info,

  // 레이아웃
  borderRadius: 8,
  controlHeight: 36,

  // 간격 (Ant Design 기본값 기준)
  marginXS: 8,
  marginSM: 12,
  margin: 16,
  marginMD: 20,
  marginLG: 24,
  marginXL: 32,

  // 폰트
  fontFamily:
    "SF Pro Display, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  fontSize: 14,
  fontSizeLG: 16,
  fontSizeSM: 12,
};

export default glassmorphismTheme;
