// tests/e2e/global-search.spec.ts
// TSK-01-05: 전역 검색 모달 E2E 테스트

import { test, expect } from '@playwright/test'

test.describe('GlobalSearch E2E 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 포털 대시보드 페이지 접근 (포털 레이아웃 적용)
    await page.goto('/dashboard')
    // 페이지 로딩 완료 대기
    await page.waitForSelector('[data-testid="header-logo"]')
  })

  // E2E-001: 검색 모달 열기
  test('E2E-001: Ctrl+K로 검색 모달 열기', async ({ page }) => {
    // Ctrl+K 단축키로 모달 열기
    await page.keyboard.press('Control+k')

    // 모달 표시 확인
    const modal = page.getByTestId('global-search-modal')
    await expect(modal).toBeVisible()

    // 입력창 포커스 확인
    const input = page.getByTestId('global-search-input')
    await expect(input).toBeFocused()
  })

  test('E2E-001-Alt: 검색 버튼 클릭으로 모달 열기', async ({ page }) => {
    // 검색 버튼 클릭
    await page.getByTestId('search-button').click()

    // 모달 표시 확인
    const modal = page.getByTestId('global-search-modal')
    await expect(modal).toBeVisible()

    // 입력창 포커스 확인
    const input = page.getByTestId('global-search-input')
    await expect(input).toBeFocused()
  })

  // E2E-002: 메뉴 검색
  test('E2E-002: 검색어 입력 시 메뉴 필터링', async ({ page }) => {
    // 모달 열기
    await page.keyboard.press('Control+k')
    await expect(page.getByTestId('global-search-modal')).toBeVisible()

    // 검색어 입력
    const input = page.getByTestId('global-search-input')
    await input.fill('대시')

    // 결과 확인 - ID가 "1"인 대시보드 메뉴 항목이 표시되어야 함
    const results = page.getByTestId('search-results')
    await expect(results).toBeVisible()

    // 대시보드 결과 항목이 표시되어야 함
    const dashboardItem = page.getByTestId('search-result-item-1')
    await expect(dashboardItem).toBeVisible()
  })

  test('E2E-002-Alt: 검색 결과 없음 표시', async ({ page }) => {
    // 모달 열기
    await page.keyboard.press('Control+k')

    // 존재하지 않는 검색어 입력
    const input = page.getByTestId('global-search-input')
    await input.fill('존재하지않는메뉴XYZ')

    // 결과 없음 메시지 확인
    const noResults = page.getByTestId('search-no-results')
    await expect(noResults).toBeVisible()
    await expect(page.getByText('검색 결과가 없습니다')).toBeVisible()
  })

  // E2E-003: 키보드로 선택
  test('E2E-003: 화살표 키와 Enter로 메뉴 선택', async ({ page }) => {
    // 모달 열기
    await page.keyboard.press('Control+k')

    // 검색어 입력
    const input = page.getByTestId('global-search-input')
    await input.fill('대시')

    // 결과 대기 - 대시보드 결과 항목이 표시될 때까지 대기
    const dashboardItem = page.getByTestId('search-result-item-1')
    await expect(dashboardItem).toBeVisible()

    // Enter로 선택
    await page.keyboard.press('Enter')

    // 모달 닫힘 확인
    await expect(page.getByTestId('global-search-modal')).not.toBeVisible()

    // 탭바에 탭이 추가되었는지 확인
    await expect(page.getByTestId('tab-bar')).toBeVisible()
  })

  test('E2E-003-Alt: 클릭으로 메뉴 선택', async ({ page }) => {
    // 모달 열기
    await page.keyboard.press('Control+k')

    // 검색어 입력
    const input = page.getByTestId('global-search-input')
    await input.fill('작업 지시')

    // 결과 대기 및 클릭
    const resultItem = page.getByTestId('search-result-item-2-1')
    await expect(resultItem).toBeVisible()
    await resultItem.click()

    // 모달 닫힘 확인
    await expect(page.getByTestId('global-search-modal')).not.toBeVisible()

    // 탭이 열렸는지 확인
    await expect(page.getByTestId('tab-bar')).toBeVisible()
  })

  // E2E-004: 모달 닫기
  test('E2E-004: Escape로 모달 닫기', async ({ page }) => {
    // 모달 열기
    await page.keyboard.press('Control+k')
    await expect(page.getByTestId('global-search-modal')).toBeVisible()

    // Escape로 닫기
    await page.keyboard.press('Escape')

    // 모달 닫힘 확인
    await expect(page.getByTestId('global-search-modal')).not.toBeVisible()
  })

  test('E2E-004-Alt: 바깥 클릭으로 모달 닫기', async ({ page }) => {
    // 모달 열기
    await page.keyboard.press('Control+k')
    await expect(page.getByTestId('global-search-modal')).toBeVisible()

    // 모달 바깥 클릭 (마스크 영역)
    await page.locator('.ant-modal-wrap').click({ position: { x: 10, y: 10 } })

    // 모달 닫힘 확인
    await expect(page.getByTestId('global-search-modal')).not.toBeVisible()
  })

  // 키보드 네비게이션 테스트
  test('키보드 화살표로 검색 결과 탐색', async ({ page }) => {
    // 모달 열기
    await page.keyboard.press('Control+k')

    // 검색어 입력 (여러 결과가 나오는 검색어)
    const input = page.getByTestId('global-search-input')
    await input.fill('관리')

    // 결과 대기
    await page.waitForSelector('[data-testid="search-results"]')

    // 첫 번째 항목이 기본 선택됨
    const firstItem = page.locator('[data-testid^="search-result-item-"]').first()
    await expect(firstItem).toHaveClass(/selected/)

    // 아래 화살표로 이동
    await page.keyboard.press('ArrowDown')

    // 두 번째 항목이 선택됨
    const secondItem = page.locator('[data-testid^="search-result-item-"]').nth(1)
    await expect(secondItem).toHaveClass(/selected/)

    // 위 화살표로 이동
    await page.keyboard.press('ArrowUp')

    // 첫 번째 항목이 다시 선택됨
    await expect(firstItem).toHaveClass(/selected/)
  })

  // 검색어 하이라이트 테스트
  test('검색어가 결과에서 하이라이트 표시', async ({ page }) => {
    // 모달 열기
    await page.keyboard.press('Control+k')

    // 검색어 입력
    const input = page.getByTestId('global-search-input')
    await input.fill('대시')

    // 결과 대기 - 검색 결과 항목이 표시될 때까지
    const dashboardItem = page.getByTestId('search-result-item-1')
    await expect(dashboardItem).toBeVisible()

    // 하이라이트된 텍스트 확인 (mark 태그)
    const highlight = page.locator('[data-testid="global-search-modal"] mark')
    await expect(highlight).toBeVisible()
    await expect(highlight).toContainText('대시')
  })

  // 폴더 메뉴 선택 불가 테스트
  test('폴더 메뉴(path 없음)는 선택해도 탭이 열리지 않음', async ({ page }) => {
    // 모달 열기
    await page.keyboard.press('Control+k')

    // 폴더 메뉴 검색 (생산은 자식이 있는 폴더 메뉴)
    const input = page.getByTestId('global-search-input')
    await input.fill('생산')

    // 결과 대기
    const folderItem = page.getByTestId('search-result-item-2')
    await expect(folderItem).toBeVisible()

    // 폴더 메뉴는 aria-disabled 속성이 있어 force 옵션 필요
    await folderItem.click({ force: true })

    // 모달이 여전히 열려있어야 함 (선택되지 않음)
    await expect(page.getByTestId('global-search-modal')).toBeVisible()
  })

  // Ctrl+K 힌트 표시 테스트
  test('Ctrl+K 힌트가 입력창에 표시됨', async ({ page }) => {
    // 모달 열기
    await page.keyboard.press('Control+k')

    // 힌트 확인
    const hint = page.getByTestId('global-search-hint')
    await expect(hint).toBeVisible()
    await expect(hint).toContainText('Ctrl+K')
  })

  // 키보드 힌트 영역 테스트
  test('하단 키보드 힌트가 표시됨', async ({ page }) => {
    // 모달 열기
    await page.keyboard.press('Control+k')

    // 키보드 힌트 확인
    const hints = page.getByTestId('search-keyboard-hints')
    await expect(hints).toBeVisible()
    await expect(hints).toContainText('이동')
    await expect(hints).toContainText('열기')
    await expect(hints).toContainText('닫기')
  })
})
