// tests/e2e/notification-panel.spec.ts
// NotificationPanel 컴포넌트 E2E 테스트 (TSK-01-06)

import { test, expect } from '@playwright/test'

test.describe('NotificationPanel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard')
    // 페이지 로드 대기
    await page.waitForSelector('[data-testid="notification-button"]')
  })

  // E2E-001: 알림 아이콘 및 뱃지
  test('E2E-001: 로그인 후 뱃지에 읽지 않은 알림 수가 표시된다', async ({ page }) => {
    // 알림 버튼 확인
    const notificationButton = page.locator('[data-testid="notification-button"]')
    await expect(notificationButton).toBeVisible()

    // 뱃지에 숫자가 표시되어야 함 (mock 데이터에 읽지 않은 알림 3개)
    await expect(page.locator('.ant-badge-count')).toBeVisible()
  })

  // E2E-002: 알림 패널 열기/목록
  test('E2E-002: 아이콘 클릭 시 패널이 열리고 알림 목록이 표시된다', async ({ page }) => {
    // 알림 버튼 클릭
    const notificationButton = page.locator('[data-testid="notification-button"]')
    await notificationButton.click()

    // 알림 패널이 열리는지 확인
    const panel = page.locator('[data-testid="notification-panel"]')
    await expect(panel).toBeVisible()

    // 알림 항목들이 표시되는지 확인
    const notificationItems = page.locator('[data-testid^="notification-item-"]')
    await expect(notificationItems.first()).toBeVisible()
  })

  // E2E-003: 알림 클릭 및 이동
  test('E2E-003: 알림 항목 클릭 시 읽음 처리되고 관련 화면 탭이 열린다', async ({ page }) => {
    // 알림 버튼 클릭
    const notificationButton = page.locator('[data-testid="notification-button"]')
    await notificationButton.click()

    // 첫 번째 알림 항목 (읽지 않은 상태) 확인
    const firstNotification = page.locator('[data-testid="notification-item-noti-001"]')
    await expect(firstNotification).toBeVisible()
    await expect(firstNotification).toHaveAttribute('data-unread', 'true')

    // 알림 클릭
    await firstNotification.click()

    // 패널이 닫히고 URL이 변경되는지 확인 (link: "/equipment/status")
    await expect(page).toHaveURL(/equipment/)
  })

  // E2E-004: 모두 읽음 처리
  test('E2E-004: 버튼 클릭 시 모든 알림이 읽음 처리되고 뱃지가 0이 된다', async ({ page }) => {
    // 알림 버튼 클릭
    const notificationButton = page.locator('[data-testid="notification-button"]')
    await notificationButton.click()

    // 모두 읽음 버튼 클릭
    const markAllButton = page.locator('[data-testid="mark-all-read-btn"]')
    await expect(markAllButton).toBeVisible()
    await markAllButton.click()

    // 모든 알림이 읽음 상태인지 확인
    const unreadItems = page.locator('[data-testid^="notification-item-"][data-unread="true"]')
    await expect(unreadItems).toHaveCount(0)

    // 패널 닫기
    const closeButton = page.locator('[data-testid="notification-close-btn"]')
    await closeButton.click()

    // 뱃지가 사라지거나 0이 되는지 확인
    const badgeCount = page.locator('.ant-badge-count')
    await expect(badgeCount).not.toBeVisible()
  })

  // E2E: 패널 닫기 (닫기 버튼)
  test('패널 닫기 버튼으로 패널이 닫힌다', async ({ page }) => {
    // 알림 버튼 클릭
    await page.locator('[data-testid="notification-button"]').click()
    await expect(page.locator('[data-testid="notification-panel"]')).toBeVisible()

    // 닫기 버튼 클릭
    await page.locator('[data-testid="notification-close-btn"]').click()

    // 패널이 닫히는지 확인
    await expect(page.locator('[data-testid="notification-panel"]')).not.toBeVisible()
  })

  // E2E: 패널 외부 클릭으로 닫기
  test('패널 외부 클릭 시 패널이 닫힌다', async ({ page }) => {
    // 알림 버튼 클릭
    await page.locator('[data-testid="notification-button"]').click()
    await expect(page.locator('[data-testid="notification-panel"]')).toBeVisible()

    // 패널 외부 (헤더 로고) 클릭
    await page.locator('[data-testid="header-logo"]').click({ force: true })

    // 패널이 닫히는지 확인
    await expect(page.locator('[data-testid="notification-panel"]')).not.toBeVisible()
  })

  // E2E: ESC 키로 패널 닫기
  test('ESC 키로 패널이 닫힌다', async ({ page }) => {
    // 알림 버튼 클릭
    await page.locator('[data-testid="notification-button"]').click()
    await expect(page.locator('[data-testid="notification-panel"]')).toBeVisible()

    // ESC 키 누르기
    await page.keyboard.press('Escape')

    // 패널이 닫히는지 확인
    await expect(page.locator('[data-testid="notification-panel"]')).not.toBeVisible()
  })

  // E2E: 접근성 테스트
  test('접근성: 패널에 role="dialog"와 aria-label이 있다', async ({ page }) => {
    // 알림 버튼 클릭
    await page.locator('[data-testid="notification-button"]').click()

    // 패널에 접근성 속성이 있는지 확인
    const panel = page.locator('[data-testid="notification-panel"]')
    await expect(panel).toHaveAttribute('role', 'dialog')
    await expect(panel).toHaveAttribute('aria-label', '알림 목록')
  })

  // E2E: 알림 유형별 아이콘
  test('알림 유형에 따라 다른 아이콘이 표시된다', async ({ page }) => {
    // 알림 버튼 클릭
    await page.locator('[data-testid="notification-button"]').click()

    // 알림 패널 내에 아이콘들이 있는지 확인
    const panel = page.locator('[data-testid="notification-panel"]')
    await expect(panel).toBeVisible()

    // 알림 항목에 아이콘이 있는지 확인
    const notificationItems = panel.locator('[data-testid^="notification-item-"]')
    const itemCount = await notificationItems.count()
    expect(itemCount).toBeGreaterThan(0)

    // 각 알림 항목에 아이콘이 있는지 확인
    const icons = panel.locator('.anticon')
    const iconCount = await icons.count()
    expect(iconCount).toBeGreaterThanOrEqual(itemCount)
  })

  // E2E: 읽은 알림과 읽지 않은 알림 구분
  test('읽지 않은 알림은 시각적으로 강조된다', async ({ page }) => {
    // 알림 버튼 클릭
    await page.locator('[data-testid="notification-button"]').click()

    // 읽지 않은 알림 확인 (data-unread="true")
    const unreadItems = page.locator('[data-testid^="notification-item-"][data-unread="true"]')
    const firstUnread = unreadItems.first()
    await expect(firstUnread).toBeVisible()

    // 배경색이 다른지 확인 (bg-blue-50 클래스)
    await expect(firstUnread).toHaveClass(/bg-blue-50/)
  })

  // E2E: 알림 시간 표시
  test('알림에 상대 시간이 표시된다', async ({ page }) => {
    // 알림 버튼 클릭
    await page.locator('[data-testid="notification-button"]').click()

    // 시간 요소 확인
    const timeElements = page.locator('[data-testid^="notification-time-"]')
    await expect(timeElements.first()).toBeVisible()

    // 상대 시간 형식 확인 ("전" 포함)
    const timeText = await timeElements.first().textContent()
    expect(timeText).toMatch(/전|방금/)
  })
})
