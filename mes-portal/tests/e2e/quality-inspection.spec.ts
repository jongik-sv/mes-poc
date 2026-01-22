// tests/e2e/quality-inspection.spec.ts
// 품질 검사 입력 폼 E2E 테스트 (TSK-06-12)

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

// MDI 메뉴를 통해 품질 검사 페이지 열기
async function openQualityInspectionPage(page: import('@playwright/test').Page) {
  // 사이드바에서 '샘플 화면' 메뉴 클릭
  await page.locator('text=샘플 화면').click()
  await page.waitForTimeout(500)

  // '품질 검사 입력' 메뉴 클릭
  await page.locator('text=품질 검사 입력').click()

  // 페이지 로드 대기
  await page.waitForSelector('[data-testid="quality-inspection-page"]', { timeout: 20000 })
}

test.describe('품질 검사 입력 폼', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인
    await login(page)
    // MDI 메뉴를 통해 품질 검사 페이지 열기
    await openQualityInspectionPage(page)
  })

  // E2E-001: 페이지 렌더링
  test('E2E-001: 품질 검사 입력 폼이 정상적으로 렌더링된다', async ({ page }) => {
    // 페이지 컨테이너 확인
    await expect(page.locator('[data-testid="quality-inspection-page"]')).toBeVisible({ timeout: 10000 })

    // 검사 유형 선택기 확인
    await expect(page.locator('[data-testid="inspection-type-selector"]')).toBeVisible({ timeout: 5000 })

    // 기본 정보 필드 확인
    await expect(page.locator('[data-testid="product-code-input"]')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('[data-testid="lot-number-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="inspection-date-picker"]')).toBeVisible()

    // 버튼 확인 - 페이지 하단으로 스크롤
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await expect(page.locator('[data-testid="submit-btn"]')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('[data-testid="cancel-btn"]')).toBeVisible()
    await expect(page.locator('[data-testid="preview-btn"]')).toBeVisible()

    // 스크린샷
    await page.screenshot({ path: 'test-results/e2e-quality-inspection-001.png' })
  })

  // E2E-002: 검사 유형 선택
  test('E2E-002: 검사 유형을 변경하면 해당 필드가 표시된다', async ({ page }) => {
    // 기본 치수 검사 필드 확인
    await expect(page.locator('[data-testid="dimension-items-list"]')).toBeVisible({ timeout: 10000 })

    // 외관 검사 선택
    await page.locator('[data-testid="inspection-type-selector"]').getByText('외관 검사').click()

    // 확인 모달이 나타나면 확인 버튼 클릭 (데이터가 있을 때만)
    const modalOkBtn = page.locator('.ant-modal-confirm-btns .ant-btn-primary')
    if (await modalOkBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await modalOkBtn.click()
    }

    // 외관 검사 필드 확인
    await expect(page.locator('[data-testid="appearance-items-list"]')).toBeVisible({ timeout: 10000 })

    // 스크린샷
    await page.screenshot({ path: 'test-results/e2e-quality-inspection-002.png' })
  })

  // E2E-003: 항목 추가 및 삭제
  test('E2E-003: 검사 항목을 추가하고 삭제할 수 있다', async ({ page }) => {
    // 치수 검사 항목 리스트가 로드될 때까지 대기
    await expect(page.locator('[data-testid="dimension-items-list"]')).toBeVisible({ timeout: 10000 })

    // 기본 1개 항목 확인
    await expect(page.locator('[data-testid="dimension-item-0"]')).toBeVisible({ timeout: 5000 })

    // 항목 추가 버튼 클릭
    await page.locator('[data-testid="add-item-btn"]').click()

    // 2개 항목 확인
    await expect(page.locator('[data-testid="dimension-item-1"]')).toBeVisible({ timeout: 5000 })

    // 두 번째 항목 삭제
    await page.locator('[data-testid="remove-item-btn-1"]').click()

    // 다시 1개 항목 확인
    await expect(page.locator('[data-testid="dimension-item-1"]')).not.toBeVisible()
    await expect(page.locator('[data-testid="dimension-item-0"]')).toBeVisible()

    // 스크린샷
    await page.screenshot({ path: 'test-results/e2e-quality-inspection-003.png' })
  })

  // E2E-004: 치수 검사 데이터 입력
  test('E2E-004: 치수 검사 데이터를 입력할 수 있다', async ({ page }) => {
    // 치수 검사 항목이 로드될 때까지 대기
    await expect(page.locator('[data-testid="dimension-items-list"]')).toBeVisible({ timeout: 10000 })

    // 기본 정보 입력
    await page.fill('[data-testid="product-code-input"]', 'PROD-001')
    await page.fill('[data-testid="lot-number-input"]', 'LOT-20260122-001')

    // 측정 항목 입력
    await page.fill('[data-testid="position-input-0"]', 'A')

    // 기준값 입력 (InputNumber)
    const standardInput = page.locator('[data-testid="standard-value-input-0"]')
    await standardInput.click()
    await standardInput.fill('100')

    // 허용오차 입력
    await page.fill('[data-testid="tolerance-input-0"]', '0.5')

    // 측정값 입력 (InputNumber)
    const measuredInput = page.locator('[data-testid="measured-value-input-0"]')
    await measuredInput.click()
    await measuredInput.fill('100.3')

    // 입력값 확인
    await expect(standardInput).toHaveValue('100')
    await expect(page.locator('[data-testid="tolerance-input-0"]')).toHaveValue('0.5')
    await expect(measuredInput).toHaveValue('100.3')

    // 스크린샷
    await page.screenshot({ path: 'test-results/e2e-quality-inspection-004.png' })
  })

  // E2E-005: 폼 유효성 검사
  test('E2E-005: 필수 필드 미입력 시 에러 메시지가 표시된다', async ({ page }) => {
    // 페이지 하단의 저장 버튼이 보이도록 스크롤
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))

    // 저장 버튼 클릭 (필수 필드 미입력 상태)
    await page.locator('[data-testid="submit-btn"]').click({ timeout: 10000 })

    // 에러 메시지 확인
    await expect(page.getByText('제품코드를 입력해주세요')).toBeVisible({ timeout: 5000 })

    // 스크린샷
    await page.screenshot({ path: 'test-results/e2e-quality-inspection-005.png' })
  })

  // E2E-006: 이미지 업로드 영역
  test('E2E-006: 이미지 업로드 영역이 표시된다', async ({ page }) => {
    // 업로드 영역 확인 - input은 hidden이므로 텍스트로 확인
    await expect(page.getByText('이미지를 드래그하거나 클릭하여 업로드')).toBeVisible()
    // Dragger 영역이 있는지 확인
    await expect(page.locator('.ant-upload-drag')).toBeVisible()

    // 스크린샷
    await page.screenshot({ path: 'test-results/e2e-quality-inspection-006.png' })
  })

  // E2E-007: 비고 입력
  test('E2E-007: 비고 필드에 텍스트를 입력할 수 있다', async ({ page }) => {
    // 비고 필드가 로드될 때까지 대기
    await expect(page.locator('[data-testid="remarks-textarea"]')).toBeVisible({ timeout: 10000 })

    // 비고 입력
    await page.fill('[data-testid="remarks-textarea"]', '테스트 검사 메모입니다')

    // 입력값 확인
    await expect(page.locator('[data-testid="remarks-textarea"]')).toHaveValue('테스트 검사 메모입니다')

    // 스크린샷
    await page.screenshot({ path: 'test-results/e2e-quality-inspection-007.png' })
  })

  // E2E-008: 반응형 레이아웃
  test('E2E-008: 반응형 레이아웃이 올바르게 동작한다', async ({ page }) => {
    // 태블릿 사이즈
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(page.locator('[data-testid="quality-inspection-page"]')).toBeVisible()

    // 모바일 사이즈
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.locator('[data-testid="quality-inspection-page"]')).toBeVisible()

    // 스크린샷
    await page.screenshot({ path: 'test-results/e2e-quality-inspection-008.png' })
  })
})
