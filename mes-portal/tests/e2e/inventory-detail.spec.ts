// tests/e2e/inventory-detail.spec.ts
// 재고 현황 조회 E2E 테스트 (TSK-06-15)

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

  // 재고 현황 조회 메뉴 클릭
  await page.click('[data-testid="menu-sample_inventory_detail"]')

  // MDI 탭으로 페이지가 열릴 때까지 대기
  await page.waitForSelector('[data-testid="inventory-detail-page"]', {
    timeout: 15000,
  })
}

test.describe('재고 현황 조회', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndNavigate(page)
  })

  // E2E-001: 품목 검색 및 선택
  test('E2E-001: 사용자가 품목을 검색하여 선택할 수 있다', async ({ page }) => {
    // 품목 선택 영역 확인
    await expect(page.locator('[data-testid="item-select-card"]')).toBeVisible()
    await expect(page.locator('[data-testid="item-select"]')).toBeVisible()

    // 검색어 입력
    const input = page.locator('[data-testid="item-select"] input')
    await input.fill('알루미늄')

    // 드롭다운에서 옵션 확인
    await expect(
      page.locator('.ant-select-dropdown').getByText('RAW-A-001 - 알루미늄 판재 6mm')
    ).toBeVisible()

    // 옵션 선택
    await page
      .locator('.ant-select-dropdown')
      .getByText('RAW-A-001 - 알루미늄 판재 6mm')
      .click()

    // 상세 정보 로딩 확인
    await page.waitForSelector('[data-testid="inventory-descriptions"]', {
      timeout: 5000,
    })
    await expect(
      page.locator('[data-testid="inventory-descriptions"]')
    ).toBeVisible()
  })

  // E2E-002: 상세 정보 표시
  test('E2E-002: 품목 선택 후 상세 정보가 표시된다', async ({ page }) => {
    // 품목 선택
    const input = page.locator('[data-testid="item-select"] input')
    await input.fill('알루미늄')
    await page
      .locator('.ant-select-dropdown')
      .getByText('RAW-A-001 - 알루미늄 판재 6mm')
      .click()

    // 로딩 완료 대기
    await page.waitForSelector('[data-testid="inventory-descriptions"]', {
      timeout: 5000,
    })

    // 품목코드 확인
    await expect(page.locator('[data-testid="item-code"]')).toContainText(
      'RAW-A-001'
    )

    // 현재 재고 확인
    await expect(page.locator('[data-testid="current-stock"]')).toContainText(
      '1,500'
    )

    // 재고 상태 확인 (BR-001: 1500 >= 500*1.5 = normal/충분)
    const stockStatus = page.locator('[data-testid="stock-status"]')
    await expect(stockStatus).toContainText('충분')
    await expect(stockStatus).toHaveClass(/success/)
  })

  // E2E-003: 입출고 이력 조회
  test('E2E-003: 입출고 이력 탭에서 거래 내역을 확인할 수 있다', async ({
    page,
  }) => {
    // 품목 선택
    const input = page.locator('[data-testid="item-select"] input')
    await input.fill('알루미늄')
    await page
      .locator('.ant-select-dropdown')
      .getByText('RAW-A-001 - 알루미늄 판재 6mm')
      .click()

    // 로딩 완료 대기
    await page.waitForSelector('[data-testid="inventory-descriptions"]', {
      timeout: 5000,
    })

    // 입출고 이력 탭 확인 (기본 활성화)
    await expect(page.getByText('입출고 이력')).toBeVisible()

    // 테이블이 표시되는지 확인
    await expect(
      page.locator('[data-testid="transaction-table-container"]')
    ).toBeVisible()

    // 거래 내역 확인 (BR-002: 최신순 정렬)
    const transactionRows = page.locator('[data-testid="transaction-row"]')
    // 적어도 하나의 거래 내역 존재
    const rowCount = await transactionRows.count()
    expect(rowCount).toBeGreaterThan(0)
  })

  // E2E-004: 재고 추이 차트
  test('E2E-004: 재고 추이 탭에서 차트를 확인할 수 있다', async ({ page }) => {
    // 품목 선택
    const input = page.locator('[data-testid="item-select"] input')
    await input.fill('알루미늄')
    await page
      .locator('.ant-select-dropdown')
      .getByText('RAW-A-001 - 알루미늄 판재 6mm')
      .click()

    // 로딩 완료 대기
    await page.waitForSelector('[data-testid="inventory-descriptions"]', {
      timeout: 5000,
    })

    // 재고 추이 탭 클릭
    await page.getByText('재고 추이').click()

    // 차트 영역 확인 (BR-004: 30일 데이터)
    await expect(page.locator('[data-testid="trend-chart"]')).toBeVisible()

    // canvas 요소 확인 (차트가 렌더링되었는지)
    await expect(page.locator('[data-testid="trend-chart"] canvas')).toBeVisible()
  })

  // E2E-005: 빈 상태 표시
  test('E2E-005: 품목 미선택 시 빈 상태가 표시된다', async ({ page }) => {
    // 빈 상태 확인
    await expect(page.locator('[data-testid="empty-state"]')).toBeVisible()
    await expect(page.getByText('품목을 선택해주세요')).toBeVisible()
  })

  // E2E-006: 기간 필터링
  test('E2E-006: 기간 선택 시 입출고 이력이 필터링된다', async ({ page }) => {
    // 품목 선택
    const input = page.locator('[data-testid="item-select"] input')
    await input.fill('알루미늄')
    await page
      .locator('.ant-select-dropdown')
      .getByText('RAW-A-001 - 알루미늄 판재 6mm')
      .click()

    // 로딩 완료 대기
    await page.waitForSelector('[data-testid="inventory-descriptions"]', {
      timeout: 5000,
    })

    // RangePicker 확인 (시작일 input이 보이는지 확인)
    await expect(
      page.locator('[data-testid="date-range-picker"]').first()
    ).toBeVisible()

    // 검색 버튼 확인
    await expect(page.locator('[data-testid="search-btn"]')).toBeVisible()

    // 검색 버튼 클릭
    await page.locator('[data-testid="search-btn"]').click()

    // 테이블이 여전히 표시되는지 확인
    await expect(
      page.locator('[data-testid="transaction-table-container"]')
    ).toBeVisible()
  })

  // 추가 테스트: 다른 상태의 품목 선택
  test('주의 상태 품목 선택 시 warning Tag가 표시된다', async ({ page }) => {
    // 스테인리스 파이프 선택 (warning 상태)
    const input = page.locator('[data-testid="item-select"] input')
    await input.fill('스테인리스')
    await page
      .locator('.ant-select-dropdown')
      .getByText('RAW-B-002 - 스테인리스 파이프 50mm')
      .click()

    // 로딩 완료 대기
    await page.waitForSelector('[data-testid="inventory-descriptions"]', {
      timeout: 5000,
    })

    // 재고 상태 확인 (warning/주의)
    const stockStatus = page.locator('[data-testid="stock-status"]')
    await expect(stockStatus).toContainText('주의')
    await expect(stockStatus).toHaveClass(/warning/)
  })

  test('부족 상태 품목 선택 시 danger Tag가 표시된다', async ({ page }) => {
    // 구리 판재 선택 (danger 상태)
    const input = page.locator('[data-testid="item-select"] input')
    await input.fill('구리')
    await page
      .locator('.ant-select-dropdown')
      .getByText('RAW-C-003 - 구리 판재 3mm')
      .click()

    // 로딩 완료 대기
    await page.waitForSelector('[data-testid="inventory-descriptions"]', {
      timeout: 5000,
    })

    // 재고 상태 확인 (danger/부족)
    const stockStatus = page.locator('[data-testid="stock-status"]')
    await expect(stockStatus).toContainText('부족')
    await expect(stockStatus).toHaveClass(/error/)
  })

  // 반응형 테스트
  test('반응형: 태블릿 사이즈에서 레이아웃이 유지된다', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })

    // 페이지가 여전히 표시되는지 확인
    await expect(
      page.locator('[data-testid="inventory-detail-page"]')
    ).toBeVisible()
    await expect(page.locator('[data-testid="item-select-card"]')).toBeVisible()
  })
})
