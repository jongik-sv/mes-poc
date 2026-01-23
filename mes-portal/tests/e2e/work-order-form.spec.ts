// tests/e2e/work-order-form.spec.ts
// 작업 지시 등록 E2E 테스트 (TSK-06-16)

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

  // 작업 지시 등록 메뉴 클릭
  await page.click('[data-testid="menu-sample_work_order_form"]')

  // MDI 탭으로 페이지가 열릴 때까지 대기
  await page.waitForSelector('[data-testid="work-order-form-page"]', {
    timeout: 15000,
  })
}

// 유효한 폼 데이터 입력 헬퍼
async function fillValidFormData(page: import('@playwright/test').Page) {
  // 제품 선택
  await page.click('[data-testid="product-select-btn"]')
  // Ant Design Modal은 dialog 역할을 사용
  await page.waitForSelector('[role="dialog"]', { timeout: 10000 })

  // 테이블에서 첫 번째 데이터 행 클릭 (measure-row 제외)
  const firstRow = page.locator('[role="dialog"] tr[data-row-key]').first()
  await firstRow.waitFor({ state: 'visible', timeout: 5000 })
  await firstRow.click()
  await page.waitForTimeout(200)

  // 선택완료 클릭
  await page.click('[role="dialog"] [data-testid="select-popup-confirm"]')
  await page.waitForTimeout(500)

  // 수량 입력
  await page.fill('[data-testid="quantity-input"]', '500')

  // 라인 선택
  await page.click('[data-testid="line-select"]')
  await page.waitForTimeout(200)
  await page.click('.ant-select-dropdown .ant-select-item-option:first-child')
  await page.waitForTimeout(200)

  // 시작일 선택
  await page.click('[data-testid="start-date"]')
  // 가시적인 드롭다운 대기 (숨겨진 것 제외)
  await page.waitForSelector('.ant-picker-dropdown:not(.ant-picker-dropdown-hidden)', { state: 'visible' })
  await page.locator('.ant-picker-dropdown:not(.ant-picker-dropdown-hidden) .ant-picker-cell-today').click()
  await page.waitForTimeout(300)

  // 종료일 선택
  await page.click('[data-testid="end-date"]')
  await page.waitForSelector('.ant-picker-dropdown:not(.ant-picker-dropdown-hidden)', { state: 'visible' })
  await page.locator('.ant-picker-dropdown:not(.ant-picker-dropdown-hidden) .ant-picker-cell-today').click()
  await page.waitForTimeout(300)
}

test.describe('작업 지시 등록', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndNavigate(page)
  })

  // E2E-001: 작업 지시 등록 폼 표시
  test('E2E-001: 작업 지시 등록 폼이 정상적으로 표시된다', async ({ page }) => {
    // 폼 컨테이너 확인
    await expect(page.locator('[data-testid="work-order-form-page"]')).toBeVisible()
    await expect(page.locator('[data-testid="form-template"]')).toBeVisible()

    // 필드 확인
    await expect(page.locator('[data-testid="product-select-btn"]')).toBeVisible()
    await expect(page.locator('[data-testid="quantity-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="line-select"]')).toBeVisible()
    await expect(page.locator('[data-testid="start-date"]')).toBeVisible()
    await expect(page.locator('[data-testid="end-date"]')).toBeVisible()

    // 버튼 확인
    await expect(page.locator('[data-testid="form-submit-btn"]')).toBeVisible()
    await expect(page.locator('[data-testid="form-cancel-btn"]')).toBeVisible()
  })

  // E2E-002: 제품 선택 플로우
  test('E2E-002: 제품 선택 팝업에서 제품을 선택할 수 있다', async ({ page }) => {
    // 제품 선택 버튼 클릭
    await page.click('[data-testid="product-select-btn"]')

    // 팝업 표시 확인 (Ant Design Modal은 dialog 역할 사용)
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 10000 })

    // 검색 입력
    await page.fill('[role="dialog"] [data-testid="select-popup-search"]', 'LCD')
    await page.click('[role="dialog"] [data-testid="select-popup-search-btn"]')
    await page.waitForTimeout(300)

    // 첫 번째 데이터 행 클릭 (measure-row 제외)
    const firstRow = page.locator('[role="dialog"] tr[data-row-key]').first()
    await firstRow.waitFor({ state: 'visible', timeout: 5000 })
    await firstRow.click()
    await page.waitForTimeout(200)

    // 선택완료 클릭
    await page.click('[role="dialog"] [data-testid="select-popup-confirm"]')

    // 팝업 닫힘 확인
    await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 5000 })

    // 제품 정보 반영 확인
    await expect(page.locator('[data-testid="product-code-input"]')).toHaveValue(/P\d+/)
  })

  // E2E-003: 저장 확인 다이얼로그
  test('E2E-003: 저장 시 확인 다이얼로그가 표시된다', async ({ page }) => {
    // 유효한 데이터 입력
    await fillValidFormData(page)

    // 저장 버튼 클릭
    await page.click('[data-testid="form-submit-btn"]')

    // 확인 다이얼로그 표시 확인
    await expect(page.locator('.ant-modal-confirm')).toBeVisible()
    await expect(page.locator('.ant-modal-confirm-body')).toContainText('등록하시겠습니까')
  })

  // E2E-004: 저장 성공 Toast
  test('E2E-004: 저장 성공 시 Toast가 표시된다', async ({ page }) => {
    // 유효한 데이터 입력
    await fillValidFormData(page)

    // 저장 버튼 클릭
    await page.click('[data-testid="form-submit-btn"]')

    // 확인 다이얼로그에서 확인 버튼 클릭
    await page.waitForSelector('.ant-modal-confirm')
    await page.click('.ant-modal-confirm-btns .ant-btn-primary')

    // 성공 Toast 표시 확인
    await expect(page.locator('.ant-message-success')).toBeVisible({ timeout: 5000 })
  })

  // E2E-005: 필수 필드 유효성
  test('E2E-005: 필수 필드 미입력 시 에러 메시지가 표시된다', async ({ page }) => {
    // 빈 상태로 저장 클릭
    await page.click('[data-testid="form-submit-btn"]')

    // 에러 메시지 표시 확인 (여러 개가 있으므로 first() 사용)
    await expect(page.locator('.ant-form-item-explain-error').first()).toBeVisible()
    // 필수 필드 에러 메시지 중 하나라도 표시되는지 확인
    await expect(page.getByText('수량을 입력해주세요')).toBeVisible()
  })

  // 제품 선택 취소 테스트
  test('제품 선택 팝업에서 취소 시 변경사항이 없다', async ({ page }) => {
    // 제품 선택 버튼 클릭
    await page.click('[data-testid="product-select-btn"]')
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 10000 })

    // 취소 버튼 클릭
    await page.click('[role="dialog"] [data-testid="select-popup-cancel"]')

    // 팝업 닫힘 확인
    await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 5000 })

    // 제품 코드 필드가 비어있는지 확인
    const productCodeValue = await page.locator('[data-testid="product-code-input"]').inputValue()
    expect(productCodeValue).toBe('')
  })

  // 반응형 테스트
  test('반응형: 태블릿 사이즈에서 레이아웃이 유지된다', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })

    // 페이지가 여전히 표시되는지 확인
    await expect(page.locator('[data-testid="work-order-form-page"]')).toBeVisible()
    await expect(page.locator('[data-testid="form-template"]')).toBeVisible()
    await expect(page.locator('[data-testid="product-select-btn"]')).toBeVisible()
  })
})
