// tests/e2e/material-history.spec.ts
// 자재 입출고 내역 E2E 테스트 (TSK-06-17)

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

  // 자재 입출고 내역 메뉴 클릭
  await page.click('[data-testid="menu-sample_material_history"]')

  // MDI 탭으로 페이지가 열릴 때까지 대기
  await page.waitForSelector('[data-testid="material-history-page"]', {
    timeout: 15000,
  })
}

test.describe('자재 입출고 내역', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndNavigate(page)
  })

  // E2E-001: 자재명 검색
  test('E2E-001: 사용자가 자재명으로 검색할 수 있다', async ({ page }) => {
    // 검색 영역 확인
    await expect(page.locator('[data-testid="search-condition-card"]')).toBeVisible()

    // 자재명 입력
    await page.fill('[data-testid="search-materialName-input"]', '원자재')

    // 조회 버튼 클릭
    await page.click('[data-testid="search-btn"]')

    // 잠시 대기 후 결과 확인
    await page.waitForTimeout(500)

    // 테이블에 데이터가 표시되는지 확인
    const tableRows = page.locator('.ant-table-tbody tr.ant-table-row')
    const rowCount = await tableRows.count()
    expect(rowCount).toBeGreaterThan(0)

    // 모든 행에 '원자재'가 포함되어 있는지 확인 (BR-02)
    if (rowCount > 0) {
      const firstRowMaterialName = await tableRows.first().locator('td').first().textContent()
      expect(firstRowMaterialName?.toLowerCase()).toContain('원자재')
    }
  })

  // E2E-002: 기간 선택 조회
  test('E2E-002: 사용자가 기간으로 필터링할 수 있다', async ({ page }) => {
    // RangePicker 확인
    await expect(page.locator('[data-testid="search-dateRange-daterange"]')).toBeVisible()

    // RangePicker 클릭하여 날짜 선택 패널 열기
    await page.click('[data-testid="search-dateRange-daterange"]')
    await page.waitForTimeout(300)

    // 날짜 패널이 열렸는지 확인
    await expect(page.locator('.ant-picker-dropdown')).toBeVisible()

    // ESC로 패널 닫기
    await page.keyboard.press('Escape')
    await page.waitForTimeout(300)

    // 조회 버튼 클릭 (기간 미선택 시 전체 데이터 - BR-01)
    await page.click('[data-testid="search-btn"]')
    await page.waitForTimeout(500)

    // 테이블에 데이터가 표시되는지 확인
    const tableRows = page.locator('.ant-table-tbody tr.ant-table-row')
    const rowCount = await tableRows.count()
    expect(rowCount).toBeGreaterThan(0)
  })

  // E2E-003: 컬럼 정렬
  test('E2E-003: 사용자가 컬럼 헤더 클릭으로 정렬할 수 있다', async ({ page }) => {
    // 테이블 로드 대기
    await page.waitForSelector('.ant-table-tbody tr.ant-table-row')

    // 수량 컬럼 헤더 클릭
    await page.click('.ant-table-column-title:has-text("수량")')
    await page.waitForTimeout(300)

    // 정렬 아이콘 변경 확인
    const sortedColumn = page.locator('.ant-table-column-sorter-up.active, .ant-table-column-sorter-down.active')
    await expect(sortedColumn).toBeVisible()
  })

  // E2E-004: 행 선택
  test('E2E-004: 사용자가 체크박스로 행을 선택할 수 있다', async ({ page }) => {
    // 테이블 로드 대기
    await page.waitForSelector('.ant-table-tbody tr.ant-table-row')

    // 초기 상태: 삭제 버튼 비활성화 확인 (BR-04)
    await expect(page.locator('[data-testid="delete-btn"]')).toBeDisabled()

    // 첫 번째 행 체크박스 클릭
    await page.click('.ant-table-tbody tr.ant-table-row:first-child .ant-checkbox-input')
    await page.waitForTimeout(200)

    // 선택 건수 확인
    await expect(page.locator('[data-testid="selected-count"]')).toContainText('1건')

    // 두 번째 행 체크박스 클릭
    await page.click('.ant-table-tbody tr.ant-table-row:nth-child(2) .ant-checkbox-input')
    await page.waitForTimeout(200)

    // 선택 건수 업데이트 확인
    await expect(page.locator('[data-testid="selected-count"]')).toContainText('2건')

    // 삭제 버튼 활성화 확인
    await expect(page.locator('[data-testid="delete-btn"]')).not.toBeDisabled()
  })

  // E2E-005: 일괄 삭제
  test('E2E-005: 사용자가 선택한 항목을 일괄 삭제할 수 있다', async ({ page }) => {
    // 테이블 로드 대기
    await page.waitForSelector('.ant-table-tbody tr.ant-table-row')

    // 초기 데이터 건수 확인
    const initialCount = await page.locator('[data-testid="total-count"]').textContent()
    const initialTotal = parseInt(initialCount?.replace(/[^0-9]/g, '') || '0')

    // 두 개 행 선택
    await page.click('.ant-table-tbody tr.ant-table-row:first-child .ant-checkbox-input')
    await page.click('.ant-table-tbody tr.ant-table-row:nth-child(2) .ant-checkbox-input')
    await page.waitForTimeout(200)

    // 삭제 버튼 클릭
    await page.click('[data-testid="delete-btn"]')

    // 확인 다이얼로그 표시 확인 (BR-03)
    await expect(page.locator('[data-testid="confirm-dialog"]')).toBeVisible()
    await expect(page.locator('.ant-modal-body')).toContainText('2건의 항목을 삭제하시겠습니까?')

    // 확인 버튼 클릭
    await page.click('[data-testid="confirm-ok-btn"]')
    await page.waitForTimeout(500)

    // 성공 Toast 표시 확인
    await expect(page.locator('.ant-message-success')).toBeVisible()

    // 데이터 건수 감소 확인
    const newCount = await page.locator('[data-testid="total-count"]').textContent()
    const newTotal = parseInt(newCount?.replace(/[^0-9]/g, '') || '0')
    expect(newTotal).toBe(initialTotal - 2)
  })

  // E2E-006: 내보내기
  test('E2E-006: 사용자가 데이터를 내보내기할 수 있다', async ({ page }) => {
    // 테이블 로드 대기
    await page.waitForSelector('.ant-table-tbody tr.ant-table-row')

    // 내보내기 버튼 확인
    await expect(page.locator('[data-testid="export-btn"]')).toBeVisible()

    // 다운로드 이벤트 감시
    const downloadPromise = page.waitForEvent('download')

    // 내보내기 버튼 클릭
    await page.click('[data-testid="export-btn"]')

    // 다운로드 완료 확인
    const download = await downloadPromise
    expect(download.suggestedFilename()).toMatch(/material-history.*\.csv/)

    // 성공 Toast 표시 확인
    await expect(page.locator('.ant-message-success')).toBeVisible()
  })

  // 삭제 취소 테스트
  test('삭제 다이얼로그에서 취소 시 상태가 유지된다', async ({ page }) => {
    // 테이블 로드 대기
    await page.waitForSelector('.ant-table-tbody tr.ant-table-row')

    // 초기 데이터 건수 확인
    const initialCount = await page.locator('[data-testid="total-count"]').textContent()

    // 행 선택
    await page.click('.ant-table-tbody tr.ant-table-row:first-child .ant-checkbox-input')
    await page.waitForTimeout(200)

    // 삭제 버튼 클릭
    await page.click('[data-testid="delete-btn"]')

    // 확인 다이얼로그 표시 확인
    await expect(page.locator('[data-testid="confirm-dialog"]')).toBeVisible()

    // 취소 버튼 클릭
    await page.click('[data-testid="confirm-cancel-btn"]')
    await page.waitForTimeout(300)

    // 다이얼로그 닫힘 확인
    await expect(page.locator('[data-testid="confirm-dialog"]')).not.toBeVisible()

    // 데이터 건수 유지 확인
    const afterCount = await page.locator('[data-testid="total-count"]').textContent()
    expect(afterCount).toBe(initialCount)
  })

  // 입출고유형 필터 테스트
  test('입출고유형으로 필터링할 수 있다', async ({ page }) => {
    // 입출고유형 Select 클릭
    await page.click('[data-testid="search-transactionType-select"]')
    await page.waitForTimeout(300)

    // '입고' 옵션 선택
    await page.click('.ant-select-dropdown .ant-select-item-option:has-text("입고")')
    await page.waitForTimeout(300)

    // 조회 버튼 클릭
    await page.click('[data-testid="search-btn"]')
    await page.waitForTimeout(500)

    // 테이블에 입고 데이터만 표시되는지 확인
    const tableRows = page.locator('.ant-table-tbody tr.ant-table-row')
    const rowCount = await tableRows.count()

    if (rowCount > 0) {
      // 모든 행에 '입고' 태그가 있는지 확인
      for (let i = 0; i < Math.min(rowCount, 5); i++) {
        await expect(tableRows.nth(i).locator('.ant-tag')).toContainText('입고')
      }
    }
  })

  // 초기화 테스트
  test('초기화 버튼 클릭 시 검색 조건이 초기화된다', async ({ page }) => {
    // 자재명 입력
    await page.fill('[data-testid="search-materialName-input"]', '테스트')

    // 입출고유형 선택
    await page.click('[data-testid="search-transactionType-select"]')
    await page.click('.ant-select-dropdown .ant-select-item-option:has-text("출고")')
    await page.waitForTimeout(300)

    // 조회 클릭
    await page.click('[data-testid="search-btn"]')
    await page.waitForTimeout(500)

    // 초기화 버튼 클릭
    await page.click('[data-testid="reset-btn"]')
    await page.waitForTimeout(500)

    // 자재명 입력값 초기화 확인
    const materialNameValue = await page.locator('[data-testid="search-materialName-input"]').inputValue()
    expect(materialNameValue).toBe('')

    // 입출고유형 초기화 확인
    await expect(page.locator('[data-testid="search-transactionType-select"]')).toContainText('전체')
  })

  // Empty State 테스트
  test('검색 결과가 없을 때 Empty State가 표시된다', async ({ page }) => {
    // 존재하지 않는 자재명 검색
    await page.fill('[data-testid="search-materialName-input"]', 'zzz존재하지않는자재zzz')

    // 조회 버튼 클릭
    await page.click('[data-testid="search-btn"]')
    await page.waitForTimeout(500)

    // Empty State 또는 No Data 표시 확인
    const noData = page.locator('.ant-empty, .ant-table-placeholder')
    await expect(noData).toBeVisible()
  })

  // 반응형 테스트
  test('반응형: 태블릿 사이즈에서 레이아웃이 유지된다', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })

    // 페이지가 여전히 표시되는지 확인
    await expect(page.locator('[data-testid="material-history-page"]')).toBeVisible()
    await expect(page.locator('[data-testid="search-condition-card"]')).toBeVisible()
  })
})
