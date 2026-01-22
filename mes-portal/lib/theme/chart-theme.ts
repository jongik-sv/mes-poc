// lib/theme/chart-theme.ts
// @ant-design/charts 차트 테마 설정 (010-design.md 섹션 8.1 BR-001 기준)

import { themeTokens, darkThemeTokens } from './tokens'

/**
 * 라이트 모드 차트 테마
 * Ant Design 테마 토큰과 동기화된 색상 팔레트
 */
export const lightChartTheme = {
  // 기본 10색 팔레트
  colors10: [
    themeTokens.colorPrimary,      // 주요 데이터
    themeTokens.colorSuccess,      // 긍정 지표
    themeTokens.colorWarning,      // 경고 지표
    themeTokens.colorError,        // 위험 지표
    themeTokens.colorInfo,         // 정보
    '#8B5CF6',                     // 보라
    '#EC4899',                     // 핑크
    '#06B6D4',                     // 청록
    '#84CC16',                     // 라임
    '#F97316',                     // 주황
  ],
  // 배경색
  backgroundColor: 'transparent',
  // 축/그리드 색상
  styleSheet: {
    fontFamily: themeTokens.fontFamily,
    axisLineBorderColor: themeTokens.colorBorder,
    axisLineLinearBorderColor: themeTokens.colorBorder,
    axisTitleTextFillColor: themeTokens.colorTextSecondary,
    axisTickLineBorderColor: themeTokens.colorBorder,
    axisLabelFillColor: themeTokens.colorTextSecondary,
    axisSubTickLineBorderColor: themeTokens.colorBorderSecondary,
    axisGridBorderColor: themeTokens.colorBorderSecondary,
    legendItemNameFillColor: themeTokens.colorText,
    tooltipContainerFillColor: themeTokens.colorBgContainer,
    tooltipContainerStrokeColor: themeTokens.colorBorder,
    tooltipTextFillColor: themeTokens.colorText,
  },
}

/**
 * 다크 모드 차트 테마
 */
export const darkChartTheme = {
  colors10: [
    darkThemeTokens.colorPrimary,
    darkThemeTokens.colorSuccess,
    darkThemeTokens.colorWarning,
    darkThemeTokens.colorError,
    darkThemeTokens.colorInfo,
    '#A78BFA',                     // 보라 (밝은 버전)
    '#F472B6',                     // 핑크 (밝은 버전)
    '#22D3EE',                     // 청록 (밝은 버전)
    '#A3E635',                     // 라임 (밝은 버전)
    '#FB923C',                     // 주황 (밝은 버전)
  ],
  backgroundColor: 'transparent',
  styleSheet: {
    fontFamily: darkThemeTokens.fontFamily,
    axisLineBorderColor: darkThemeTokens.colorBorder,
    axisLineLinearBorderColor: darkThemeTokens.colorBorder,
    axisTitleTextFillColor: darkThemeTokens.colorTextSecondary,
    axisTickLineBorderColor: darkThemeTokens.colorBorder,
    axisLabelFillColor: darkThemeTokens.colorTextSecondary,
    axisSubTickLineBorderColor: darkThemeTokens.colorBorderSecondary,
    axisGridBorderColor: darkThemeTokens.colorBorderSecondary,
    legendItemNameFillColor: darkThemeTokens.colorText,
    tooltipContainerFillColor: darkThemeTokens.colorBgContainer,
    tooltipContainerStrokeColor: darkThemeTokens.colorBorder,
    tooltipTextFillColor: darkThemeTokens.colorText,
  },
}

/**
 * 테마에 따른 차트 테마 반환
 */
export function getChartTheme(isDark: boolean) {
  return isDark ? darkChartTheme : lightChartTheme
}

/**
 * 목표 달성률에 따른 색상 반환 (BR-002)
 * @param actual 실적
 * @param target 목표
 * @param isDark 다크 모드 여부
 * @returns 색상 코드
 */
export function getPerformanceColor(
  actual: number,
  target: number,
  isDark: boolean = false
): string {
  const tokens = isDark ? darkThemeTokens : themeTokens

  // target이 0인 경우 위험으로 처리
  if (target === 0) return tokens.colorError

  const rate = actual / target
  if (rate >= 0.9) return tokens.colorPrimary
  if (rate >= 0.7) return tokens.colorWarning
  return tokens.colorError
}

/**
 * 바 차트용 색상 배열 반환 (실적/목표 구분)
 */
export function getBarChartColors(isDark: boolean = false): [string, string] {
  const tokens = isDark ? darkThemeTokens : themeTokens
  return [tokens.colorPrimary, tokens.colorBorder]
}

/**
 * 파이 차트용 색상 팔레트 반환
 */
export function getPieChartColors(isDark: boolean = false): string[] {
  return isDark ? darkChartTheme.colors10 : lightChartTheme.colors10
}
