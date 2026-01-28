import { test, expect } from '@playwright/test'

test.describe('사용자 권한 할당 화면 (TSK-02-01)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForSelector('[data-testid="sidebar"]')
    // 시스템 관리 > 사용자 권한 할당 메뉴로 이동
    await page.getByText('시스템 관리', { exact: true }).click()
    await page.waitForTimeout(300)
    await page.getByText('사용자 권한 할당', { exact: true }).click()
    await page.waitForTimeout(500)
  })

  test('E2E-AU-001: 페이지 타이틀과 3-column 레이아웃 렌더링', async ({ page }) => {
    await expect(page.getByText('사용자 권한 할당')).toBeVisible()
    await expect(page.getByText('사용자 목록')).toBeVisible()
    await expect(page.getByText('역할그룹 할당')).toBeVisible()
    await expect(page.getByText('메뉴 시뮬레이션')).toBeVisible()
  })

  test('E2E-AU-002: 사용자 목록 테이블 렌더링', async ({ page }) => {
    await expect(page.getByRole('columnheader', { name: '이름' }).first()).toBeVisible()
    await expect(page.getByRole('columnheader', { name: '이메일' })).toBeVisible()
  })

  test('E2E-AU-003: 사용자 미선택 시 안내 메시지 표시', async ({ page }) => {
    const emptyMessages = page.getByText('사용자를 선택해주세요')
    await expect(emptyMessages.first()).toBeVisible()
  })

  test('E2E-AU-004: 사용자 행 클릭 시 역할그룹 및 메뉴 시뮬레이션 로드', async ({ page }) => {
    // 첫 번째 사용자 행 클릭
    const firstRow = page.locator('.ant-table-tbody tr').first()
    await firstRow.click()
    await page.waitForTimeout(1000)

    // 중앙 패널 갱신 확인
    await expect(page.getByText('보유 역할그룹')).toBeVisible()
    await expect(page.getByText('전체 역할그룹')).toBeVisible()
  })

  test('E2E-AU-005: 메뉴 시뮬레이션 패널 렌더링', async ({ page }) => {
    // 사용자 선택
    const firstRow = page.locator('.ant-table-tbody tr').first()
    await firstRow.click()
    await page.waitForTimeout(1000)

    // 메뉴 시뮬레이션 요약 정보 확인
    await expect(page.getByText(/접근 가능 메뉴/)).toBeVisible()
  })

  test('E2E-AU-006: 할당 저장 버튼 표시', async ({ page }) => {
    const firstRow = page.locator('.ant-table-tbody tr').first()
    await firstRow.click()
    await page.waitForTimeout(500)

    await expect(page.getByRole('button', { name: '할당 저장' })).toBeVisible()
  })
})
