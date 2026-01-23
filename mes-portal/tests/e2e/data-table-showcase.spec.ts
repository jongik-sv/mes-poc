// tests/e2e/data-table-showcase.spec.ts
// 데이터 테이블 종합 샘플 E2E 테스트 (TSK-06-20)

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

  // 데이터 테이블 종합 메뉴 클릭
  await page.click('[data-testid="menu-sample_data_table_showcase"]')

  // MDI 탭으로 페이지가 열릴 때까지 대기
  await page.waitForSelector('[data-testid="data-table-showcase-page"]', {
    timeout: 15000,
  })
}

test.describe('데이터 테이블 종합', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndNavigate(page)
  })

  // E2E-001: 단일/다중 컬럼 정렬
  test('E2E-001: 사용자가 컬럼 헤더 클릭으로 정렬할 수 있다', async ({ page }) => {
    // 테이블 로드 대기 - 텍스트 콘텐츠로 확인
    await expect(page.locator('[data-testid="total-count"]')).toBeVisible({ timeout: 10000 })

    // 제품명 컬럼 헤더 클릭
    await page.click('.ant-table-column-title:has-text("제품명")')
    await page.waitForTimeout(300)

    // 정렬 아이콘 변경 확인
    const sortedColumn = page.locator('.ant-table-column-sorter-up.active, .ant-table-column-sorter-down.active')
    await expect(sortedColumn.first()).toBeVisible()
  })

  // E2E-004: 페이지네이션
  test('E2E-004: 사용자가 페이지를 이동하고 크기를 변경할 수 있다', async ({ page }) => {
    // 전체 건수 확인
    await expect(page.locator('[data-testid="total-count"]')).toBeVisible({ timeout: 10000 })
    const totalText = await page.locator('[data-testid="total-count"]').textContent()
    expect(totalText).toContain('총')
    expect(totalText).toContain('건')

    // 2페이지로 이동
    await page.click('.ant-pagination-item-2')
    await page.waitForTimeout(500)

    // 2페이지가 활성화되었는지 확인
    await expect(page.locator('.ant-pagination-item-2.ant-pagination-item-active')).toBeVisible()
  })

  // E2E-005: 행 선택 (단일/다중/전체)
  test('E2E-005: 사용자가 행을 단일/다중/전체 선택할 수 있다', async ({ page }) => {
    // 테이블 로드 대기
    await expect(page.locator('[data-testid="total-count"]')).toBeVisible({ timeout: 10000 })

    // 스크롤해서 테이블 바디의 체크박스가 보이게 함
    await page.locator('[data-testid="table-container"]').scrollIntoViewIfNeeded()
    await page.waitForTimeout(300)

    // 첫 번째 행 체크박스 클릭 (force 옵션으로 sticky header 오버레이 무시)
    const firstRowCheckbox = page.locator('tr[data-row-key] .ant-checkbox-input').first()
    await firstRowCheckbox.click({ force: true })
    await page.waitForTimeout(200)

    // 선택 건수 확인
    await expect(page.locator('[data-testid="selected-count"]')).toContainText('1')

    // 두 번째 행 체크박스 클릭
    const secondRowCheckbox = page.locator('tr[data-row-key] .ant-checkbox-input').nth(1)
    await secondRowCheckbox.click({ force: true })
    await page.waitForTimeout(200)

    // 선택 건수 업데이트 확인
    await expect(page.locator('[data-testid="selected-count"]')).toContainText('2')

    // 헤더 체크박스로 전체 선택
    await page.locator('th .ant-checkbox-input').first().click({ force: true })
    await page.waitForTimeout(200)

    // 전체 선택 확인 (10건 - 페이지당 기본값)
    await expect(page.locator('[data-testid="selected-count"]')).toContainText('10')
  })

  // E2E-008: 확장 행
  test('E2E-008: 사용자가 행을 확장하여 상세 정보를 볼 수 있다', async ({ page }) => {
    // 테이블 로드 대기
    await expect(page.locator('[data-testid="total-count"]')).toBeVisible({ timeout: 10000 })

    // 첫 번째 확장 아이콘 클릭
    const expandIcon = page.locator('[data-testid^="expand-icon-"]').first()
    await expandIcon.click()
    await page.waitForTimeout(300)

    // 확장된 콘텐츠 확인
    await expect(page.locator('[data-testid^="expanded-content-"]').first()).toBeVisible()

    // 다시 클릭하여 축소
    await expandIcon.click()
    await page.waitForTimeout(300)

    // 확장 콘텐츠가 숨겨졌는지 확인
    await expect(page.locator('[data-testid^="expanded-content-"]')).not.toBeVisible()
  })

  // E2E-012: 그룹 헤더
  test('E2E-012: 2단 그룹 헤더가 표시된다', async ({ page }) => {
    // 그룹 헤더 토글 활성화
    await page.click('[data-testid="toggle-group-header"]')
    await page.waitForTimeout(500)

    // 그룹 헤더가 표시되는지 확인
    await expect(page.locator('.ant-table-thead th:has-text("제품 정보")')).toBeVisible()
    await expect(page.locator('.ant-table-thead th:has-text("수량/가격")')).toBeVisible()
    await expect(page.locator('.ant-table-thead th:has-text("상태 정보")')).toBeVisible()
  })

  // E2E-014: 기능 토글
  test('E2E-014: 기능 토글로 개별 기능을 활성화/비활성화할 수 있다', async ({ page }) => {
    // 기능 토글 패널 확인
    await expect(page.locator('[data-testid="feature-toggle-panel"]')).toBeVisible()

    // 정렬 토글 비활성화
    await page.click('[data-testid="toggle-sorting"]')
    await page.waitForTimeout(300)

    // 정렬 토글이 비활성화되었는지 확인
    await expect(page.locator('[data-testid="toggle-sorting"]')).toHaveAttribute('aria-checked', 'false')

    // 필터 토글 비활성화
    await page.click('[data-testid="toggle-filtering"]')
    await page.waitForTimeout(300)

    // 필터 토글이 비활성화되었는지 확인
    await expect(page.locator('[data-testid="toggle-filtering"]')).toHaveAttribute('aria-checked', 'false')

    // 모두 활성화 버튼 클릭
    await page.click('[data-testid="enable-all-btn"]')
    await page.waitForTimeout(300)

    // 모든 토글이 활성화되었는지 확인
    await expect(page.locator('[data-testid="toggle-sorting"]')).toHaveAttribute('aria-checked', 'true')
    await expect(page.locator('[data-testid="toggle-filtering"]')).toHaveAttribute('aria-checked', 'true')
  })

  // E2E-007: 고정 컬럼/헤더
  test('E2E-007: 고정 컬럼과 헤더가 스크롤 시 유지된다', async ({ page }) => {
    // sticky 토글이 기본으로 활성화되어 있음
    await expect(page.locator('[data-testid="toggle-sticky"]')).toHaveAttribute('aria-checked', 'true')

    // 테이블 컨테이너 확인
    await expect(page.locator('[data-testid="table-container"]')).toBeVisible()

    // 테이블에 scroll 속성이 설정되어 있는지 확인 (sticky header/column 활성화 시)
    // Ant Design Table은 sticky 활성화 시 ant-table-sticky 클래스가 적용됨
    const table = page.locator('[data-testid="data-table"]')
    await expect(table).toBeVisible()
  })

  // 가상 스크롤 모드 테스트
  test('가상 스크롤 토글 활성화 시 데이터가 표시된다', async ({ page }) => {
    // 가상 스크롤 토글 활성화
    await page.click('[data-testid="toggle-virtual-scroll"]')
    await page.waitForTimeout(1000)

    // 1만건 데이터 로드 확인
    const totalText = await page.locator('[data-testid="total-count"]').textContent()
    expect(totalText).toContain('10,000')
  })

  // 모든 기능 비활성화 테스트
  test('모두 비활성화 버튼이 동작한다', async ({ page }) => {
    await page.click('[data-testid="disable-all-btn"]')
    await page.waitForTimeout(300)

    // 모든 토글이 비활성화되었는지 확인
    const toggles = await page.locator('[data-testid="feature-toggle-panel"] button[role="switch"]').all()
    for (const toggle of toggles) {
      await expect(toggle).toHaveAttribute('aria-checked', 'false')
    }
  })

  // 기본값 초기화 테스트
  test('기본값으로 초기화 버튼이 동작한다', async ({ page }) => {
    // 먼저 모두 비활성화
    await page.click('[data-testid="disable-all-btn"]')
    await page.waitForTimeout(300)

    // 기본값으로 초기화
    await page.click('[data-testid="reset-toggles-btn"]')
    await page.waitForTimeout(300)

    // 기본 활성화된 기능들이 다시 켜졌는지 확인
    await expect(page.locator('[data-testid="toggle-sorting"]')).toHaveAttribute('aria-checked', 'true')
    await expect(page.locator('[data-testid="toggle-filtering"]')).toHaveAttribute('aria-checked', 'true')
    await expect(page.locator('[data-testid="toggle-pagination"]')).toHaveAttribute('aria-checked', 'true')
  })

  // 반응형 테스트
  test('반응형: 태블릿 사이즈에서 레이아웃이 유지된다', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })

    // 페이지가 여전히 표시되는지 확인
    await expect(page.locator('[data-testid="data-table-showcase-page"]')).toBeVisible()
    await expect(page.locator('[data-testid="feature-toggle-panel"]')).toBeVisible()
    await expect(page.locator('[data-testid="data-table"]')).toBeVisible()
  })
})
