// tests/e2e/header.spec.ts
// Header 컴포넌트 E2E 테스트

import { test, expect } from '@playwright/test'

test.describe('Header', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard')
    // 페이지 로드 대기
    await page.waitForSelector('[data-testid="header-logo"]')
  })

  // E2E-001: 로고 클릭 홈 이동
  test('E2E-001: 로고 클릭 시 홈으로 이동한다', async ({ page }) => {
    await page.locator('[data-testid="header-logo"]').click()
    await expect(page).toHaveURL('/')
  })

  // E2E-002: 즐겨찾기 접근
  test('E2E-002: 빠른 메뉴 드롭다운이 열린다', async ({ page }) => {
    await page.locator('[data-testid="quick-menu-button"]').click()
    // Ant Design 드롭다운이 DOM에 추가되는지 확인 (빈 상태여도 드롭다운 생성됨)
    await expect(page.locator('.ant-dropdown')).toBeAttached()
  })

  // E2E-003: 브레드크럼 표시
  test('E2E-003: 브레드크럼이 현재 경로를 표시한다', async ({ page }) => {
    const breadcrumb = page.locator('[data-testid="header-breadcrumb"]')
    await expect(breadcrumb).toBeVisible()
    // Home과 Dashboard가 표시되어야 함
    await expect(breadcrumb).toContainText('Home')
    await expect(breadcrumb).toContainText('Dashboard')
  })

  // E2E-004: 시계 표시
  test('E2E-004: 시계가 표시된다', async ({ page }) => {
    const clock = page.locator('[data-testid="header-clock"]')
    await expect(clock).toBeVisible()
    // HH:mm:ss 형식 확인
    await expect(clock).toHaveText(/\d{2}:\d{2}:\d{2}/)
  })

  // E2E-005: Ctrl+K 검색
  test('E2E-005: Ctrl+K로 검색 모달이 열린다', async ({ page }) => {
    await page.keyboard.press('Control+k')
    await expect(page.locator('[data-testid="search-modal"]')).toBeVisible()
  })

  // E2E-006: 알림 아이콘 클릭
  test('E2E-006: 알림 버튼에 뱃지가 표시된다', async ({ page }) => {
    const notificationButton = page.locator('[data-testid="notification-button"]')
    await expect(notificationButton).toBeVisible()
    // 뱃지에 숫자 3이 표시되어야 함
    await expect(page.locator('.ant-badge-count')).toContainText('3')
  })

  // E2E-007: 테마 전환
  test('E2E-007: 테마 버튼 클릭 시 다크/라이트 전환된다', async ({ page }) => {
    const themeButton = page.locator('[data-testid="theme-toggle"]')

    // 초기 상태 확인 (라이트 모드) - next-themes는 data-theme 속성 사용
    await expect(page.locator('html')).not.toHaveAttribute('data-theme', 'dark')

    // 테마 전환
    await themeButton.click()

    // 다크 모드 확인 (data-theme 속성)
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')

    // 새로고침 후 유지 확인
    await page.reload()
    await page.waitForSelector('[data-testid="theme-toggle"]')
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  })

  // E2E-008: 프로필 드롭다운
  test('E2E-008: 프로필 드롭다운이 메뉴를 표시한다', async ({ page }) => {
    const profileDropdown = page.locator('[data-testid="profile-dropdown"]').first()
    await profileDropdown.click()

    // 드롭다운 메뉴 항목 확인
    await expect(page.locator('.ant-dropdown')).toBeVisible()
    await expect(page.getByText('내 정보')).toBeVisible()
    await expect(page.getByText('설정')).toBeVisible()
    await expect(page.getByText('로그아웃')).toBeVisible()
  })

  // 반응형 테스트
  test('반응형: 모바일에서 프로필 이름이 숨겨진다', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.reload()
    await page.waitForSelector('[data-testid="header-logo"]')

    // 프로필 이름이 숨겨지는지 확인 (md:inline 클래스)
    const profileName = page.locator('[data-testid="profile-dropdown"]').first().locator('span.hidden')
    await expect(profileName).not.toBeVisible()
  })

  // 키보드 접근성 테스트
  test('접근성: 검색 버튼에 aria-label이 있다', async ({ page }) => {
    const searchButton = page.locator('[data-testid="search-button"]')
    await expect(searchButton).toHaveAttribute('aria-label', '전역 검색 (Ctrl+K)')
  })

  test('접근성: 알림 버튼에 aria-label이 있다', async ({ page }) => {
    const notificationButton = page.locator('[data-testid="notification-button"]')
    await expect(notificationButton).toHaveAttribute('aria-label', '알림 3개')
  })
})
