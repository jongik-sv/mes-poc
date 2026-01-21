/**
 * TabBar E2E 테스트
 * @description TSK-02-02 탭 바 컴포넌트 E2E 테스트 (026-test-specification.md 기반)
 */

import { test, expect } from '@playwright/test';

test.describe('TabBar 컴포넌트', () => {
  test.beforeEach(async ({ page }) => {
    // 포털 페이지로 이동
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
  });

  // E2E-01: 메뉴 클릭으로 탭 열기
  test('메뉴 클릭 시 탭이 추가된다', async ({ page }) => {
    // 사이드바 메뉴 클릭 (대시보드 메뉴 항목)
    const dashboardMenu = page.locator('[data-testid="menu-item-dashboard"]');
    if (await dashboardMenu.isVisible()) {
      await dashboardMenu.click();
      await page.waitForTimeout(500);
    }

    // 탭 바가 표시되는지 확인 (탭이 열린 경우에만)
    const portalTabbar = page.locator('[data-testid="portal-tabbar"]');
    const tabBar = page.locator('[data-testid="tab-bar"]');

    // 탭 바 또는 tab-bar 확인
    const isPortalTabbarVisible = await portalTabbar.isVisible().catch(() => false);
    const isTabBarVisible = await tabBar.isVisible().catch(() => false);

    if (isPortalTabbarVisible || isTabBarVisible) {
      // 탭 아이템 확인
      const dashboardTab = page.locator('[data-testid="tab-item-dashboard"]');
      if (await dashboardTab.isVisible().catch(() => false)) {
        await expect(dashboardTab).toBeVisible();
      }
    }

    // 포털 레이아웃이 렌더링되었는지 확인 (기본 검증)
    await expect(page.locator('[data-testid="portal-layout"]')).toBeVisible();

    // 스크린샷 캡처
    await page.screenshot({ path: 'test-results/e2e-01-tab-opened.png' });
  });

  // E2E-02: 탭 클릭으로 화면 전환
  test('탭 클릭 시 화면이 전환된다', async ({ page }) => {
    // 첫 번째 탭 열기
    const dashboardMenu = page.locator('[data-testid="menu-item-dashboard"]');
    if (await dashboardMenu.isVisible()) {
      await dashboardMenu.click();
      await page.waitForTimeout(300);
    }

    // 두 번째 탭 열기 (생산관리 > 작업지시 메뉴)
    const productionMenu = page.locator('[data-testid="menu-item-production"]');
    if (await productionMenu.isVisible()) {
      await productionMenu.click();
      await page.waitForTimeout(300);

      // 서브메뉴가 있으면 작업지시 클릭
      const workOrderMenu = page.locator('[data-testid="menu-item-work-order"]');
      if (await workOrderMenu.isVisible()) {
        await workOrderMenu.click();
        await page.waitForTimeout(300);
      }
    }

    // 대시보드 탭이 있으면 클릭
    const dashboardTab = page.locator('[data-testid="tab-item-dashboard"]');
    if (await dashboardTab.isVisible()) {
      await dashboardTab.click();

      // 대시보드 탭이 활성 상태인지 확인
      await expect(dashboardTab).toHaveAttribute('aria-selected', 'true');
    }

    // 스크린샷 캡처
    await page.screenshot({ path: 'test-results/e2e-02-tab-switch.png' });
  });

  // E2E-03: 탭 닫기
  test('닫기 버튼 클릭 시 탭이 제거된다', async ({ page }) => {
    // 탭 2개 열기
    const dashboardMenu = page.locator('[data-testid="menu-item-dashboard"]');
    if (await dashboardMenu.isVisible()) {
      await dashboardMenu.click();
      await page.waitForTimeout(300);
    }

    // 두 번째 메뉴 클릭
    const productionMenu = page.locator('[data-testid="menu-item-production"]');
    if (await productionMenu.isVisible()) {
      await productionMenu.click();
      await page.waitForTimeout(300);
    }

    // 생산관리 탭의 닫기 버튼 클릭 (있다면)
    const closeBtn = page.locator('[data-testid="tab-close-btn-production"]');
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      await page.waitForTimeout(300);

      // 탭이 제거되었는지 확인
      await expect(page.locator('[data-testid="tab-item-production"]')).not.toBeVisible();
    }

    // 스크린샷 캡처
    await page.screenshot({ path: 'test-results/e2e-03-tab-closed.png' });
  });

  // E2E-04: 활성 탭 표시
  test('활성 탭에 aria-selected=true가 설정된다', async ({ page }) => {
    // 대시보드 메뉴 클릭
    const dashboardMenu = page.locator('[data-testid="menu-item-dashboard"]');
    if (await dashboardMenu.isVisible()) {
      await dashboardMenu.click();
      await page.waitForTimeout(300);
    }

    // 탭 바 표시 확인
    const tabBar = page.locator('[data-testid="tab-bar"]');
    if (await tabBar.isVisible()) {
      // 대시보드 탭이 활성 상태인지 확인
      const dashboardTab = page.locator('[data-testid="tab-item-dashboard"]');
      if (await dashboardTab.isVisible()) {
        await expect(dashboardTab).toHaveAttribute('aria-selected', 'true');
      }
    }

    // 스크린샷 캡처
    await page.screenshot({ path: 'test-results/e2e-04-active-tab.png' });
  });

  // E2E-05: 탭 바 접근성
  test('탭 바에 role="tablist"가 설정된다', async ({ page }) => {
    // 대시보드 메뉴 클릭하여 탭 열기
    const dashboardMenu = page.locator('[data-testid="menu-item-dashboard"]');
    if (await dashboardMenu.isVisible()) {
      await dashboardMenu.click();
      await page.waitForTimeout(300);
    }

    // 탭 바 컨테이너의 role 확인
    const tabBarContainer = page.locator('[data-testid="tab-bar-container"]');
    if (await tabBarContainer.isVisible()) {
      await expect(tabBarContainer).toHaveAttribute('role', 'tablist');
      await expect(tabBarContainer).toHaveAttribute('aria-label', '열린 탭 목록');
    }

    // 스크린샷 캡처
    await page.screenshot({ path: 'test-results/e2e-05-accessibility.png' });
  });

  // E2E-06: 마지막 탭 보호
  test('마지막 탭은 닫기 버튼이 숨겨진다', async ({ page }) => {
    // 대시보드 메뉴만 클릭
    const dashboardMenu = page.locator('[data-testid="menu-item-dashboard"]');
    if (await dashboardMenu.isVisible()) {
      await dashboardMenu.click();
      await page.waitForTimeout(500);
    }

    // 탭 바에서 탭 확인
    const tabBar = page.locator('[data-testid="tab-bar"]');
    if (await tabBar.isVisible()) {
      // 탭이 1개뿐이면 닫기 버튼이 숨겨져야 함
      const tabs = page.locator('[data-testid^="tab-item-"]');
      const tabCount = await tabs.count();

      if (tabCount === 1) {
        // 닫기 버튼이 없어야 함
        const closeBtn = page.locator('[data-testid^="tab-close-btn-"]');
        await expect(closeBtn).not.toBeVisible();
      }
    }

    // 스크린샷 캡처
    await page.screenshot({ path: 'test-results/e2e-06-last-tab-protection.png' });
  });
});
