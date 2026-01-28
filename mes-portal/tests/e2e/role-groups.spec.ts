import { test, expect } from '@playwright/test'

test.describe('역할그룹 정의 화면 (TSK-01-01)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForSelector('[data-testid="sidebar"]')
    // 시스템 관리 > 역할그룹 정의 메뉴로 이동
    await page.getByText('시스템 관리', { exact: true }).click()
    await page.waitForTimeout(300)
    await page.getByText('역할그룹 정의', { exact: true }).click()
    await page.waitForTimeout(500)
  })

  test('E2E-RG-001: 페이지 타이틀과 3-column 레이아웃 렌더링', async ({ page }) => {
    await expect(page.getByText('역할그룹 정의')).toBeVisible()
    await expect(page.getByText('역할그룹 목록')).toBeVisible()
    await expect(page.getByText('역할 관리')).toBeVisible()
    await expect(page.getByText('권한 관리')).toBeVisible()
  })

  test('E2E-RG-002: 역할그룹 목록 테이블 렌더링', async ({ page }) => {
    // 테이블 헤더 확인
    await expect(page.getByRole('columnheader', { name: '코드' }).first()).toBeVisible()
    await expect(page.getByRole('columnheader', { name: '이름' }).first()).toBeVisible()
  })

  test('E2E-RG-003: 역할그룹 미선택 시 안내 메시지 표시', async ({ page }) => {
    await expect(page.getByText('역할그룹을 선택해주세요')).toBeVisible()
    await expect(page.getByText('역할그룹을 먼저 선택해주세요')).toBeVisible()
  })

  test('E2E-RG-004: 역할그룹 행 클릭 시 역할 패널 갱신', async ({ page }) => {
    // 첫 번째 역할그룹 행 클릭
    const firstRow = page.locator('.ant-table-tbody tr').first()
    await firstRow.click()
    await page.waitForTimeout(500)

    // 중앙 패널에 할당된 역할 / 전체 역할 표시 확인
    await expect(page.getByText('할당된 역할')).toBeVisible()
    await expect(page.getByText('전체 역할')).toBeVisible()
  })

  test('E2E-RG-005: 역할그룹 등록 모달', async ({ page }) => {
    const createBtns = page.getByRole('button', { name: /등록/ })
    await createBtns.first().click()
    await page.waitForTimeout(300)

    await expect(page.getByText('역할그룹 등록')).toBeVisible()
    await expect(page.getByText('역할그룹 코드')).toBeVisible()
    await expect(page.getByText('역할그룹명')).toBeVisible()
  })

  test('E2E-RG-006: 검색 기능', async ({ page }) => {
    const searchInput = page.getByPlaceholder('이름 또는 코드 검색')
    await expect(searchInput).toBeVisible()
  })
})
