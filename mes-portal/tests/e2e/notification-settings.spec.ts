// notification-settings.spec.ts
// TSK-06-19: 알림 설정 관리 E2E 테스트

import { test, expect } from '@playwright/test'

// 테스트 타임아웃 설정
test.setTimeout(60000)

// 로그인 및 페이지 이동 헬퍼 함수
async function loginAndNavigate(page: import('@playwright/test').Page) {
  // 로그인
  await page.goto('/login')
  await page.waitForSelector('[data-testid="login-page"]')
  await page.fill('[data-testid="email-input"]', 'admin@example.com')
  await page.fill('[data-testid="password-input"]', 'password123')
  await page.click('[data-testid="login-button"]')
  await expect(page).toHaveURL(/\/portal|\/dashboard/, { timeout: 15000 })

  // 사이드바에서 샘플 화면 메뉴 확장
  await page.click('[data-testid="menu-sample"]')
  await page.waitForTimeout(300)

  // 알림 설정 메뉴 클릭
  await page.click('[data-testid="menu-sample_notification_settings"]')

  // MDI 탭으로 페이지가 열릴 때까지 대기
  await page.waitForSelector('[data-testid="notification-settings-page"]', {
    timeout: 15000,
  })
}

test.describe('알림 설정 관리', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndNavigate(page)
  })

  // E2E-001: 설정 화면 접근
  test('사용자가 알림 설정 화면에 접근할 수 있다', async ({ page }) => {
    // 페이지 컨테이너 확인
    await expect(page.locator('[data-testid="notification-settings-page"]')).toBeVisible()

    // 카테고리 섹션 확인
    await expect(page.locator('[data-testid="category-settings"]')).toBeVisible()

    // 수신자 섹션 확인
    await expect(page.locator('[data-testid="recipient-table"]')).toBeVisible()

    // 스크린샷 저장
    await page.screenshot({ path: 'test-results/e2e/screenshots/e2e-001-settings-page.png' })
  })

  // E2E-002: 카테고리 토글
  test('사용자가 알림 카테고리를 활성화/비활성화할 수 있다', async ({ page }) => {
    // 생산 알림 Switch 찾기
    const productionSwitch = page.locator('[data-testid="category-switch-production"]')

    // 초기 상태 확인 (체크됨)
    await expect(productionSwitch).toBeChecked()

    // Switch 클릭
    await productionSwitch.click()

    // 상태 변경 확인
    await expect(productionSwitch).not.toBeChecked()

    // 스크린샷 저장
    await page.screenshot({ path: 'test-results/e2e/screenshots/e2e-002-toggle.png' })
  })

  // E2E-003: 수신자 추가
  test('사용자가 알림 수신자를 추가할 수 있다', async ({ page }) => {
    // 수신자 추가 버튼 클릭
    await page.click('[data-testid="add-recipient-btn"]')

    // 새 행의 입력 필드 확인
    const nameInput = page.locator('[data-testid="recipient-name-input"]')
    const emailInput = page.locator('[data-testid="recipient-email-input"]')

    await expect(nameInput).toBeVisible()
    await expect(emailInput).toBeVisible()

    // 이름 입력
    await nameInput.fill('박신입')

    // 이메일 입력
    await emailInput.fill('park@company.com')

    // 저장 버튼 클릭
    await page.click('[data-testid="save-btn"]')

    // 저장 완료 대기
    await page.waitForTimeout(1000)

    // 스크린샷 저장
    await page.screenshot({ path: 'test-results/e2e/screenshots/e2e-003-add-recipient.png' })
  })

  // E2E-004: 수신자 삭제
  test('사용자가 알림 수신자를 삭제할 수 있다', async ({ page }) => {
    // 초기 수신자 수 확인
    const initialRows = await page.locator('[data-testid="delete-recipient-btn"]').count()
    expect(initialRows).toBe(3)

    // 첫 번째 수신자 삭제 버튼 클릭
    await page.locator('[data-testid="delete-recipient-btn"]').first().click()

    // 삭제 후 수신자 수 확인
    const afterDeleteRows = await page.locator('[data-testid="delete-recipient-btn"]').count()
    expect(afterDeleteRows).toBe(2)

    // 스크린샷 저장
    await page.screenshot({ path: 'test-results/e2e/screenshots/e2e-004-delete-recipient.png' })
  })

  // E2E-005: Ctrl+S 저장
  test('사용자가 Ctrl+S로 설정을 저장할 수 있다', async ({ page }) => {
    // 설정 변경 (Switch 토글)
    await page.click('[data-testid="category-switch-production"]')

    // Ctrl+S 단축키 입력
    await page.keyboard.press('Control+s')

    // 저장 완료 대기
    await page.waitForTimeout(1000)

    // 스크린샷 저장
    await page.screenshot({ path: 'test-results/e2e/screenshots/e2e-005-ctrl-s-save.png' })
  })

  // E2E-006: 기본값 복원
  test('사용자가 기본값으로 설정을 복원할 수 있다', async ({ page }) => {
    // 설비 알림이 초기에 비활성화 상태인지 확인
    const equipmentSwitch = page.locator('[data-testid="category-switch-equipment"]')
    await expect(equipmentSwitch).not.toBeChecked()

    // 기본값 복원 버튼 클릭
    await page.click('[data-testid="restore-defaults-btn"]')

    // 확인 다이얼로그 대기
    await page.waitForSelector('.ant-modal-confirm')

    // 복원 버튼 클릭
    await page.click('.ant-modal-confirm-btns .ant-btn-primary')

    // 기본값 복원 후 설비 알림이 활성화됨 (기본값은 모두 true)
    await expect(equipmentSwitch).toBeChecked()

    // 스크린샷 저장
    await page.screenshot({ path: 'test-results/e2e/screenshots/e2e-006-restore-defaults.png' })
  })

  // E2E-007: 미저장 이탈 경고 (브라우저 이탈은 테스트하기 어려우므로 상태 변경만 확인)
  test('변경 후 취소 버튼 클릭 시 경고가 표시된다', async ({ page }) => {
    // 설정 변경
    await page.click('[data-testid="category-switch-production"]')

    // 취소 버튼 클릭
    await page.click('[data-testid="cancel-btn"]')

    // 경고 다이얼로그 대기
    await page.waitForSelector('.ant-modal-confirm')

    // 다이얼로그 내용 확인
    await expect(page.locator('.ant-modal-confirm')).toContainText('저장되지 않은 변경사항')

    // 스크린샷 저장
    await page.screenshot({ path: 'test-results/e2e/screenshots/e2e-007-unsaved-warning.png' })
  })

  // E2E-008: 이메일 중복 오류
  test('중복 이메일 입력 시 에러가 표시된다', async ({ page }) => {
    // 수신자 추가 버튼 클릭
    await page.click('[data-testid="add-recipient-btn"]')

    // 새 행의 입력 필드 찾기
    const nameInput = page.locator('[data-testid="recipient-name-input"]')
    const emailInput = page.locator('[data-testid="recipient-email-input"]')

    // 이름 입력
    await nameInput.fill('중복테스트')

    // 기존과 동일한 이메일 입력
    await emailInput.fill('hong@company.com')

    // 저장 버튼 클릭
    await page.click('[data-testid="save-btn"]')

    // 에러 메시지 확인
    await expect(page.locator('[data-testid="email-error"]')).toContainText('이미 등록된 이메일입니다')

    // 스크린샷 저장
    await page.screenshot({ path: 'test-results/e2e/screenshots/e2e-008-duplicate-email.png' })
  })
})
