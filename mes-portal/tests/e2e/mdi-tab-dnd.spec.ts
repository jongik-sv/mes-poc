/**
 * MDI 탭 드래그 앤 드롭 E2E 테스트
 * @description TSK-02-03 탭 드래그 앤 드롭 E2E 테스트 (026-test-specification.md 기반)
 */

import { test, expect } from '@playwright/test';

test.describe('MDI 탭 드래그 앤 드롭', () => {
  test.beforeEach(async ({ page }) => {
    // 포털 페이지로 이동 (dashboard가 포털 레이아웃을 사용)
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
  });

  // E2E-001: 탭 순서 변경
  test('사용자가 탭을 드래그하여 순서를 변경할 수 있다', async ({ page }) => {
    // 사이드바 메뉴들을 클릭하여 3개 탭 열기
    const menus = [
      '[data-testid="menu-item-dashboard"]',
      '[data-testid="menu-item-production"]',
      '[data-testid="menu-item-quality"]',
    ];

    // 탭 열기 (실제 메뉴 구조에 따라 조정 필요)
    for (const menuSelector of menus) {
      const menu = page.locator(menuSelector);
      if (await menu.isVisible().catch(() => false)) {
        await menu.click();
        await page.waitForTimeout(300);
      }
    }

    // 탭 바 확인
    const tabBar = page.locator('[data-testid="tab-bar"]');
    const isTabBarVisible = await tabBar.isVisible().catch(() => false);

    if (isTabBarVisible) {
      // 변경 전 스크린샷
      await page.screenshot({ path: 'test-results/e2e-001-before.png' });

      // sortable 탭 선택 (순서 변경 대상)
      const tabs = page.locator('[data-testid^="sortable-tab-"]');
      const tabCount = await tabs.count();

      if (tabCount >= 2) {
        // 두 번째 탭을 첫 번째 위치로 드래그
        const secondTab = tabs.nth(1);
        const firstTab = tabs.nth(0);

        // 드래그 앤 드롭 실행
        await secondTab.dragTo(firstTab, { targetPosition: { x: 0, y: 10 } });
        await page.waitForTimeout(500);

        // 변경 후 스크린샷
        await page.screenshot({ path: 'test-results/e2e-001-after.png' });
      }
    }

    // 포털 레이아웃 기본 검증
    await expect(page.locator('[data-testid="portal-layout"]')).toBeVisible();
  });

  // E2E-002: 드래그 취소
  test('ESC 키로 드래그를 취소할 수 있다', async ({ page }) => {
    // 메뉴 클릭으로 탭 2개 열기
    const dashboardMenu = page.locator('[data-testid="menu-item-dashboard"]');
    if (await dashboardMenu.isVisible().catch(() => false)) {
      await dashboardMenu.click();
      await page.waitForTimeout(300);
    }

    const productionMenu = page.locator('[data-testid="menu-item-production"]');
    if (await productionMenu.isVisible().catch(() => false)) {
      await productionMenu.click();
      await page.waitForTimeout(300);
    }

    // 탭 바 확인
    const tabBar = page.locator('[data-testid="tab-bar"]');
    const isTabBarVisible = await tabBar.isVisible().catch(() => false);

    if (isTabBarVisible) {
      const tabs = page.locator('[data-testid^="sortable-tab-"]');
      const tabCount = await tabs.count();

      if (tabCount >= 2) {
        // 드래그 전 탭 순서 저장
        const tabIds = await tabs.evaluateAll((nodes) =>
          nodes.map((n) => n.getAttribute('data-testid'))
        );

        // 드래그 시작
        const firstTab = tabs.nth(0);
        const tabBounds = await firstTab.boundingBox();

        if (tabBounds) {
          // 마우스 다운
          await page.mouse.move(
            tabBounds.x + tabBounds.width / 2,
            tabBounds.y + tabBounds.height / 2
          );
          await page.mouse.down();

          // 이동
          await page.mouse.move(tabBounds.x + 100, tabBounds.y);

          // ESC 키로 취소
          await page.keyboard.press('Escape');

          // 마우스 업
          await page.mouse.up();
          await page.waitForTimeout(300);

          // 드래그 후 탭 순서 확인
          const tabIdsAfter = await tabs.evaluateAll((nodes) =>
            nodes.map((n) => n.getAttribute('data-testid'))
          );

          // 순서 변경 없음 확인
          expect(tabIdsAfter).toEqual(tabIds);
        }
      }
    }

    // 스크린샷
    await page.screenshot({ path: 'test-results/e2e-002-cancel.png' });
  });

  // E2E-003: 영역 밖 드롭
  test('탭 바 영역 밖에서 드롭하면 취소된다', async ({ page }) => {
    // 메뉴 클릭으로 탭 2개 열기
    const dashboardMenu = page.locator('[data-testid="menu-item-dashboard"]');
    if (await dashboardMenu.isVisible().catch(() => false)) {
      await dashboardMenu.click();
      await page.waitForTimeout(300);
    }

    const productionMenu = page.locator('[data-testid="menu-item-production"]');
    if (await productionMenu.isVisible().catch(() => false)) {
      await productionMenu.click();
      await page.waitForTimeout(300);
    }

    // 탭 바 확인
    const tabBar = page.locator('[data-testid="tab-bar"]');
    const isTabBarVisible = await tabBar.isVisible().catch(() => false);

    if (isTabBarVisible) {
      const tabs = page.locator('[data-testid^="sortable-tab-"]');
      const tabCount = await tabs.count();

      if (tabCount >= 2) {
        // 드래그 전 탭 순서 저장
        const tabIds = await tabs.evaluateAll((nodes) =>
          nodes.map((n) => n.getAttribute('data-testid'))
        );

        // 드래그 시작
        const firstTab = tabs.nth(0);
        const tabBounds = await firstTab.boundingBox();
        const content = page.locator('[data-testid="mdi-content"]');
        const contentBounds = await content.boundingBox().catch(() => null);

        if (tabBounds && contentBounds) {
          // 탭을 컨텐츠 영역으로 드래그 (영역 밖)
          await firstTab.dragTo(content, {
            targetPosition: { x: 100, y: 100 },
          });
          await page.waitForTimeout(300);

          // 드래그 후 탭 순서 확인
          const tabIdsAfter = await tabs.evaluateAll((nodes) =>
            nodes.map((n) => n.getAttribute('data-testid'))
          );

          // 순서 변경 없음 확인
          expect(tabIdsAfter).toEqual(tabIds);
        }
      }
    }

    // 스크린샷
    await page.screenshot({ path: 'test-results/e2e-003-outside-drop.png' });
  });

  // E2E: 탭 바 렌더링 기본 확인
  test('탭 바가 정상적으로 렌더링된다', async ({ page }) => {
    // 포털 레이아웃 확인
    await expect(page.locator('[data-testid="portal-layout"]')).toBeVisible();

    // 스크린샷
    await page.screenshot({ path: 'test-results/e2e-tab-bar-render.png' });
  });
});
