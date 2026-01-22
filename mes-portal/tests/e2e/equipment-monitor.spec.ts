// tests/e2e/equipment-monitor.spec.ts
// 설비 모니터링 카드뷰 E2E 테스트 (TSK-06-10)

import { test, expect } from '@playwright/test'

// 로그인 헬퍼 함수
async function login(page: import('@playwright/test').Page) {
  await page.goto('/login')
  await page.waitForSelector('[data-testid="login-page"]', { timeout: 20000 })
  await page.fill('[data-testid="email-input"]', 'admin@example.com')
  await page.fill('[data-testid="password-input"]', 'password123')
  await page.click('[data-testid="login-button"]')
  await expect(page).toHaveURL(/\/portal|\/dashboard/, { timeout: 20000 })
}

// MDI 메뉴를 통해 설비 모니터링 페이지 열기
async function openEquipmentMonitorPage(page: import('@playwright/test').Page) {
  // 사이드바에서 '샘플 화면' 메뉴 클릭
  await page.locator('text=샘플 화면').click()
  await page.waitForTimeout(500)

  // '설비 모니터링' 메뉴 클릭
  await page.locator('text=설비 모니터링').click()

  // 페이지 로드 대기
  await page.waitForSelector('[data-testid="equipment-monitor"]', { timeout: 20000 })

  // 데이터 로드 대기 - 설비 카드 또는 empty 상태가 표시될 때까지
  await page.waitForTimeout(1000)
}

test.describe('설비 모니터링 카드뷰 (TSK-06-10)', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인
    await login(page)
    // MDI 메뉴를 통해 설비 모니터링 페이지 열기
    await openEquipmentMonitorPage(page)
  })

  test('E2E-01: 화면 초기 로드 시 설비 카드가 표시되어야 함', async ({ page }) => {
    // 설비 모니터링 컨테이너 확인
    await expect(page.getByTestId('equipment-monitor')).toBeVisible()

    // 설비 그리드 또는 Empty 상태 확인
    const hasGrid = await page.getByTestId('equipment-grid').isVisible().catch(() => false)
    const hasEmpty = await page.getByTestId('equipment-empty').isVisible().catch(() => false)

    // 둘 중 하나는 있어야 함
    expect(hasGrid || hasEmpty).toBe(true)

    if (hasGrid) {
      // 최소 1개 이상의 설비 카드가 표시되어야 함
      const cards = page.locator('[data-testid^="equipment-card-"]')
      await expect(cards.first()).toBeVisible()
      expect(await cards.count()).toBeGreaterThan(0)
    }

    // 스크린샷
    await page.screenshot({ path: 'test-results/e2e-equipment-monitor-001.png' })
  })

  test('E2E-02: 상태 요약 정보가 표시되어야 함', async ({ page }) => {
    // 전체 설비 수 확인
    await expect(page.getByTestId('summary-total')).toBeVisible()

    // 상태별 개수 확인
    await expect(page.getByTestId('summary-running')).toBeVisible()
    await expect(page.getByTestId('summary-stopped')).toBeVisible()
    await expect(page.getByTestId('summary-fault')).toBeVisible()
    await expect(page.getByTestId('summary-maintenance')).toBeVisible()

    // 스크린샷
    await page.screenshot({ path: 'test-results/e2e-equipment-monitor-002.png' })
  })

  test('E2E-03: 상태 필터를 적용하면 해당 상태의 설비만 표시되어야 함', async ({ page }) => {
    // 상태 필터 클릭
    await page.getByTestId('status-filter').click()
    await page.waitForTimeout(300)

    // 드롭다운에서 가동 옵션 선택 (드롭다운 내의 옵션만 선택)
    await page.locator('.ant-select-dropdown .ant-select-item-option-content').filter({ hasText: '가동' }).click()
    await page.waitForTimeout(500)

    // 필터 초기화 버튼이 표시되어야 함
    await expect(page.getByTestId('filter-reset')).toBeVisible()

    // 그리드가 있으면 모든 카드가 가동 상태여야 함
    const hasGrid = await page.getByTestId('equipment-grid').isVisible().catch(() => false)
    if (hasGrid) {
      const statusBadges = page.locator('[data-testid^="equipment-status-badge-"]')
      const count = await statusBadges.count()
      for (let i = 0; i < count; i++) {
        await expect(statusBadges.nth(i)).toHaveText('가동')
      }
    }

    // 스크린샷
    await page.screenshot({ path: 'test-results/e2e-equipment-monitor-003.png' })
  })

  test('E2E-04: 라인 필터 셀렉트가 존재하고 클릭할 수 있어야 함', async ({ page }) => {
    // 라인 필터가 표시되어야 함
    const lineFilter = page.getByTestId('line-filter')
    await expect(lineFilter).toBeVisible({ timeout: 10000 })

    // 상태 필터도 표시되어야 함
    const statusFilter = page.getByTestId('status-filter')
    await expect(statusFilter).toBeVisible()

    // 라인 필터 클릭 가능 여부 확인
    await lineFilter.click()
    await page.waitForTimeout(300)

    // 어딘가를 클릭하여 드롭다운 닫기
    await page.click('body')
    await page.waitForTimeout(300)

    // 스크린샷
    await page.screenshot({ path: 'test-results/e2e-equipment-monitor-004.png' })
  })

  test('E2E-05: 설비 카드 클릭 시 상세 정보 Drawer가 열려야 함', async ({ page }) => {
    // 그리드가 있는지 확인
    const hasGrid = await page.getByTestId('equipment-grid').isVisible().catch(() => false)

    if (hasGrid) {
      // 첫 번째 설비 카드 클릭
      const firstCard = page.locator('[data-testid^="equipment-card-"]').first()
      await expect(firstCard).toBeVisible({ timeout: 5000 })
      await firstCard.click()
      await page.waitForTimeout(500)

      // Drawer가 열려야 함
      await expect(page.getByTestId('equipment-drawer')).toBeVisible()

      // 설비 코드가 표시되어야 함
      await expect(page.getByTestId('equipment-drawer-code')).toBeVisible()

      // 설비명이 표시되어야 함
      await expect(page.getByTestId('equipment-drawer-name')).toBeVisible()

      // 현재 상태가 표시되어야 함
      await expect(page.getByTestId('equipment-drawer-status')).toBeVisible()
    } else {
      // 데이터가 없는 경우 빈 상태 메시지 확인
      await expect(page.getByTestId('equipment-empty')).toBeVisible()
    }

    // 스크린샷
    await page.screenshot({ path: 'test-results/e2e-equipment-monitor-005.png' })
  })

  test('E2E-06: Drawer 닫기 버튼 클릭 시 Drawer가 닫혀야 함', async ({ page }) => {
    // 그리드가 있는지 확인
    const hasGrid = await page.getByTestId('equipment-grid').isVisible().catch(() => false)

    if (hasGrid) {
      // 첫 번째 설비 카드 클릭
      const firstCard = page.locator('[data-testid^="equipment-card-"]').first()
      await expect(firstCard).toBeVisible({ timeout: 5000 })
      await firstCard.click()
      await page.waitForTimeout(500)

      // Drawer가 열려야 함
      await expect(page.getByTestId('equipment-drawer')).toBeVisible()

      // 닫기 버튼 클릭
      await page.getByTestId('equipment-drawer-close-btn').click()
      await page.waitForTimeout(500)

      // Drawer가 닫혀야 함
      await expect(page.getByTestId('equipment-drawer')).not.toBeVisible()
    } else {
      // 데이터가 없는 경우 빈 상태 메시지 확인
      await expect(page.getByTestId('equipment-empty')).toBeVisible()
    }

    // 스크린샷
    await page.screenshot({ path: 'test-results/e2e-equipment-monitor-006.png' })
  })

  test('E2E-07: 필터 초기화 버튼 클릭 시 모든 설비가 다시 표시되어야 함', async ({ page }) => {
    // 초기 카드 수 확인
    const initialCount = await page.locator('[data-testid^="equipment-card-"]').count()

    // 상태 필터 적용
    await page.getByTestId('status-filter').click()
    await page.waitForTimeout(300)
    await page.locator('.ant-select-dropdown .ant-select-item-option-content').filter({ hasText: '가동' }).click()
    await page.waitForTimeout(500)

    // 필터링된 카드 수 확인
    const filteredCount = await page.locator('[data-testid^="equipment-card-"]').count()
    expect(filteredCount).toBeLessThanOrEqual(initialCount)

    // 필터 초기화
    await page.getByTestId('filter-reset').click()
    await page.waitForTimeout(500)

    // 초기 카드 수와 같아야 함
    const resetCount = await page.locator('[data-testid^="equipment-card-"]').count()
    expect(resetCount).toBe(initialCount)

    // 스크린샷
    await page.screenshot({ path: 'test-results/e2e-equipment-monitor-007.png' })
  })

  test('E2E-08: 실시간 갱신 토글이 동작해야 함', async ({ page }) => {
    // 자동 갱신 토글 확인
    const autoRefreshToggle = page.getByTestId('auto-refresh-toggle')
    await expect(autoRefreshToggle).toBeVisible()

    // 토글이 기본적으로 활성화 상태여야 함
    await expect(autoRefreshToggle).toBeChecked()

    // 토글 비활성화
    await autoRefreshToggle.click()
    await page.waitForTimeout(300)
    await expect(autoRefreshToggle).not.toBeChecked()

    // 토글 다시 활성화
    await autoRefreshToggle.click()
    await page.waitForTimeout(300)
    await expect(autoRefreshToggle).toBeChecked()

    // 스크린샷
    await page.screenshot({ path: 'test-results/e2e-equipment-monitor-008.png' })
  })
})
