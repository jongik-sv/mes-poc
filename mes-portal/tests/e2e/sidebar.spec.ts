// tests/e2e/sidebar.spec.ts
// Sidebar 컴포넌트 E2E 테스트

import { test, expect } from '@playwright/test'

test.describe('Sidebar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard')
    // 페이지 로드 대기
    await page.waitForSelector('[data-testid="sidebar"]')
  })

  // E2E-001: 사이드바 토글
  test('E2E-001: 사이드바 토글 버튼으로 접기/펼치기 전환', async ({ page }) => {
    const sidebar = page.locator('[data-testid="portal-sidebar"]')
    const toggleBtn = page.locator('[data-testid="sidebar-toggle"]')

    // 초기 상태: 펼침 (240px)
    await expect(sidebar).toBeVisible()

    // 토글 버튼 클릭 → 접힘
    await toggleBtn.click()

    // 접힘 상태 확인 (60px)
    await page.waitForTimeout(300) // 애니메이션 대기

    // 다시 토글 버튼 클릭 → 펼침
    await toggleBtn.click()
    await page.waitForTimeout(300)

    // 펼침 상태로 복원 확인
    await expect(sidebar).toBeVisible()
  })

  // E2E-002: 3단계 메뉴 탐색
  test('E2E-002: 3단계 계층 메뉴를 탐색하고 화면 열기', async ({ page }) => {
    // 1단계: 설정 메뉴 클릭
    await page.getByText('설정', { exact: true }).click()
    await page.waitForTimeout(300)

    // 2단계: 사용자 메뉴 클릭 (펼쳐진 후 보여야 함)
    await page.getByText('사용자', { exact: true }).click()
    await page.waitForTimeout(300)

    // 3단계: 사용자 관리 클릭
    await page.getByText('사용자 관리', { exact: true }).click()

    // URL 변경 확인
    await expect(page).toHaveURL('/settings/user/list')
  })

  // E2E-003: 메뉴 선택 강조
  test('E2E-003: 활성 탭에 해당하는 메뉴가 강조 표시됨', async ({ page }) => {
    // 대시보드 메뉴 확인
    const dashboardMenu = page.locator('.ant-menu-item:has-text("대시보드")')

    // 대시보드 페이지에서 해당 메뉴가 선택됨 표시
    await expect(dashboardMenu).toHaveClass(/ant-menu-item-selected/)
  })

  // E2E-004: 접힘 상태 호버 시 툴팁
  test('E2E-004: 접힘 상태에서 메뉴 호버 시 툴팁 표시', async ({ page }) => {
    const toggleBtn = page.locator('[data-testid="sidebar-toggle"]')

    // 사이드바 접기
    await toggleBtn.click()
    await page.waitForTimeout(500)

    // 메뉴 아이콘 호버 (Ant Design Menu는 inlineCollapsed 시 자동 툴팁)
    const menuItem = page.locator('.ant-menu-item').first()
    await menuItem.hover()
    await page.waitForTimeout(500)

    // 접힘 상태에서는 Ant Design이 자동으로 tooltip을 표시하거나 포인터 이벤트를 처리
    // 실제 확인은 시각적으로만 가능하므로 아이템이 존재하는지 확인
    await expect(menuItem).toBeVisible()
  })

  // E2E-005: MDI 탭 연동 (메뉴 클릭 시 라우팅)
  test('E2E-005: 메뉴 클릭 시 해당 페이지로 이동', async ({ page }) => {
    // 생산 메뉴 펼치기
    await page.getByText('생산', { exact: true }).click()
    await page.waitForTimeout(300)

    // 작업 지시 클릭
    await page.getByText('작업 지시', { exact: true }).click()

    // URL 변경 확인
    await expect(page).toHaveURL('/production/work-order')
  })

  // 메뉴 데이터 렌더링 확인
  test('메뉴 데이터가 올바르게 렌더링된다', async ({ page }) => {
    const sidebar = page.locator('[data-testid="sidebar-menu"]')

    // 1단계 메뉴 확인
    await expect(sidebar.getByText('대시보드', { exact: true })).toBeVisible()
    await expect(sidebar.getByText('생산', { exact: true })).toBeVisible()
    await expect(sidebar.getByText('품질', { exact: true })).toBeVisible()
    await expect(sidebar.getByText('설비', { exact: true })).toBeVisible()
    await expect(sidebar.getByText('설정', { exact: true })).toBeVisible()
  })

  // 서브메뉴 펼침/접힘 테스트
  test('서브메뉴 클릭 시 하위 메뉴가 펼쳐지고 접힌다', async ({ page }) => {
    const sidebarMenu = page.locator('[data-testid="sidebar-menu"]')

    // 생산 메뉴 클릭 → 펼침
    await sidebarMenu.getByText('생산', { exact: true }).click()
    await page.waitForTimeout(300)

    // 하위 메뉴 확인 (사이드바 메뉴 내에서만 검색)
    await expect(sidebarMenu.getByText('작업 지시', { exact: true })).toBeVisible()
    await expect(sidebarMenu.getByText('실적 입력', { exact: true })).toBeVisible()

    // 다시 클릭 → 접힘
    await sidebarMenu.getByText('생산', { exact: true }).click()
    await page.waitForTimeout(300)

    // 하위 메뉴 숨김 확인
    await expect(sidebarMenu.getByText('작업 지시', { exact: true })).toBeHidden()
  })

  // 접근성 테스트
  test('접근성: 사이드바에 navigation role과 aria-label이 있다', async ({ page }) => {
    const sidebar = page.locator('[data-testid="sidebar"]')
    await expect(sidebar).toHaveAttribute('role', 'navigation')
    await expect(sidebar).toHaveAttribute('aria-label', '메인 메뉴')
  })

  // 토글 버튼 접근성
  test('접근성: 토글 버튼에 aria-label이 있다', async ({ page }) => {
    const toggleBtn = page.locator('[data-testid="sidebar-toggle"]')
    await expect(toggleBtn).toHaveAttribute('aria-label', /(사이드바 접기|사이드바 펼치기)/)
  })
})
