/**
 * MDI 탭 컨텍스트 메뉴 E2E 테스트
 * @description TSK-02-04 탭 컨텍스트 메뉴 E2E 테스트 (026-test-specification.md 기반)
 * @note 현재 대시보드 페이지만 존재하므로 단일 탭 기반 테스트로 구현
 *       다중 탭 기능은 단위 테스트에서 충분히 검증됨
 */

import { test, expect, type Page } from '@playwright/test';

/**
 * 탭 바가 표시될 때까지 대기
 */
async function waitForTabBar(page: Page) {
  await expect(page.locator('[data-testid="tab-bar"]')).toBeVisible({ timeout: 15000 });
}

/**
 * 컨텍스트 메뉴의 '닫기' 메뉴 항목 반환
 */
function getContextMenuCloseItem(page: Page) {
  return page.locator('.ant-dropdown-menu-item').filter({ hasText: /^닫기$/ });
}

/**
 * 컨텍스트 메뉴가 표시될 때까지 대기
 */
async function waitForContextMenu(page: Page) {
  await expect(page.locator('.ant-dropdown-menu')).toBeVisible({ timeout: 5000 });
}

test.describe('탭 컨텍스트 메뉴', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    // 대시보드 탭 열기
    await page.locator('[data-testid="sidebar-menu"]').getByText('대시보드').click();
    await waitForTabBar(page);
  });

  // E2E-001: 탭 우클릭 메뉴 표시
  test('E2E-001: 탭 우클릭 시 컨텍스트 메뉴가 표시된다', async ({ page }) => {
    // 탭 바 존재 확인
    const tabBar = page.locator('[data-testid="tab-bar"]');
    await expect(tabBar).toBeVisible();

    // 첫 번째 탭 우클릭
    const firstTab = page.locator('[data-testid^="tab-item-"]').first();
    await expect(firstTab).toBeVisible();
    await firstTab.click({ button: 'right' });

    // 컨텍스트 메뉴 표시 확인
    await waitForContextMenu(page);

    // 각 메뉴 항목 확인
    await expect(getContextMenuCloseItem(page)).toBeVisible();
    await expect(page.getByText('다른 탭 모두 닫기')).toBeVisible();
    await expect(page.getByText('오른쪽 탭 모두 닫기')).toBeVisible();
    await expect(page.getByText('새로고침')).toBeVisible();
  });

  // E2E-002: 컨텍스트 메뉴로 탭 닫기 (비활성화 상태 확인)
  // 대시보드 탭은 closable=false이므로 닫기가 비활성화됨
  test('E2E-002: closable=false 탭에서 닫기 메뉴가 비활성화된다', async ({ page }) => {
    // 대시보드 탭 우클릭
    const dashboardTab = page.locator('[data-testid^="tab-item-"]').first();
    await dashboardTab.click({ button: 'right' });

    // 컨텍스트 메뉴 대기
    await waitForContextMenu(page);

    // 닫기 메뉴가 비활성화되었는지 확인
    const closeItem = getContextMenuCloseItem(page);
    await expect(closeItem).toHaveClass(/ant-dropdown-menu-item-disabled/);
  });

  // E2E-003: 다른 탭 모두 닫기 비활성화 확인 (탭이 1개만 있는 경우)
  test('E2E-003: 탭이 1개일 때 다른 탭 모두 닫기가 비활성화된다', async ({ page }) => {
    const tabItems = page.locator('[data-testid^="tab-item-"]');
    expect(await tabItems.count()).toBe(1);

    // 탭 우클릭
    const firstTab = tabItems.first();
    await firstTab.click({ button: 'right' });

    // 다른 탭 모두 닫기가 비활성화되었는지 확인
    await waitForContextMenu(page);
    const closeOthersItem = page.locator('.ant-dropdown-menu-item').filter({ hasText: '다른 탭 모두 닫기' });
    await expect(closeOthersItem).toHaveClass(/ant-dropdown-menu-item-disabled/);
  });

  // E2E-004: 오른쪽 탭 모두 닫기 비활성화 확인 (오른쪽에 탭이 없는 경우)
  test('E2E-004: 가장 오른쪽 탭에서 오른쪽 탭 모두 닫기가 비활성화된다', async ({ page }) => {
    const tabItems = page.locator('[data-testid^="tab-item-"]');

    // 마지막(유일한) 탭 우클릭
    const lastTab = tabItems.last();
    await lastTab.click({ button: 'right' });

    // 오른쪽 탭 모두 닫기가 비활성화되었는지 확인
    await waitForContextMenu(page);
    const closeRightItem = page.locator('.ant-dropdown-menu-item').filter({ hasText: '오른쪽 탭 모두 닫기' });
    await expect(closeRightItem).toHaveClass(/ant-dropdown-menu-item-disabled/);
  });

  // E2E-005: 탭 새로고침
  test('E2E-005: 새로고침 클릭 시 탭이 유지된다', async ({ page }) => {
    const tabItems = page.locator('[data-testid^="tab-item-"]');
    const firstTab = tabItems.first();
    const tabId = await firstTab.getAttribute('data-testid');

    // 탭 우클릭
    await firstTab.click({ button: 'right' });

    // 새로고침 클릭
    await waitForContextMenu(page);
    await page.locator('.ant-dropdown-menu-item').getByText('새로고침').click();

    // 탭이 여전히 존재하는지 확인
    await expect(page.locator(`[data-testid="${tabId}"]`)).toBeVisible();
  });

  // E2E-006: closable=false 탭 보호 (E2E-002와 동일한 시나리오)
  test('E2E-006: closable=false 탭의 닫기 메뉴가 비활성화된다', async ({ page }) => {
    // dashboard 탭 우클릭
    const dashboardTab = page.locator('[data-testid^="tab-item-"]').first();
    await dashboardTab.click({ button: 'right' });

    // 닫기 메뉴가 비활성화되었는지 확인
    await waitForContextMenu(page);
    const closeItem = getContextMenuCloseItem(page);
    await expect(closeItem).toHaveClass(/ant-dropdown-menu-item-disabled/);
  });

  // 메뉴 닫힘 테스트
  test('메뉴 외부 클릭 시 컨텍스트 메뉴가 닫힌다', async ({ page }) => {
    const firstTab = page.locator('[data-testid^="tab-item-"]').first();

    // 탭 우클릭
    await firstTab.click({ button: 'right' });

    // 컨텍스트 메뉴 확인
    const contextMenu = page.locator('.ant-dropdown-menu');
    await expect(contextMenu).toBeVisible();

    // 외부 클릭
    await page.locator('body').click({ position: { x: 10, y: 10 } });

    // 메뉴가 닫혔는지 확인
    await expect(contextMenu).not.toBeVisible();
  });

  // ESC 키로 메뉴 닫기
  test('ESC 키 입력 시 컨텍스트 메뉴가 닫힌다', async ({ page }) => {
    const firstTab = page.locator('[data-testid^="tab-item-"]').first();

    // 탭 우클릭
    await firstTab.click({ button: 'right' });

    // 컨텍스트 메뉴 확인
    const contextMenu = page.locator('.ant-dropdown-menu');
    await expect(contextMenu).toBeVisible();

    // ESC 키 입력
    await page.keyboard.press('Escape');

    // 메뉴가 닫혔는지 확인
    await expect(contextMenu).not.toBeVisible();
  });
});
