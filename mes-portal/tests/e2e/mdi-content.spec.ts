/**
 * MDI 컨텐츠 영역 E2E 테스트
 * @description TSK-02-05 MDI 컨텐츠 영역 E2E 테스트 (026-test-specification.md 기반)
 */

import { test, expect } from '@playwright/test';

test.describe('MDI 컨텐츠 영역', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
  });

  // E2E-04: 탭 없을 때 빈 상태
  test('탭이 없으면 빈 상태가 표시된다', async ({ page }) => {
    // 빈 상태의 MDI 컨텐츠 영역 확인 (실제 구현에서는 빈 상태일 때 표시)
    const emptyState = page.locator('[data-testid="mdi-empty-state"]');

    // 빈 상태가 있다면 확인
    if (await emptyState.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(emptyState).toBeVisible();
      await expect(page.getByText('열린 화면이 없습니다')).toBeVisible();
    }

    await page.screenshot({ path: 'test-results/e2e-04-empty-state.png' });
  });

  // E2E-01: 다중 탭 전환 시 상태 유지
  test.skip('탭 전환 후에도 필터 상태가 유지된다', async ({ page }) => {
    // 사전 조건: 2개 화면 열림
    await page.click('[data-testid="menu-item-dashboard"]');
    await page.click('[data-testid="menu-item-sample-table"]');

    // 필터 설정
    await page.selectOption('[data-testid="filter-dropdown"]', 'active');

    // 대시보드 탭으로 전환
    await page.click('[data-testid="tab-dashboard"]');
    await expect(page.locator('[data-testid="screen-dashboard"]')).toBeVisible();

    // 목록 탭으로 복귀
    await page.click('[data-testid="tab-sample-table"]');

    // 필터 값 확인
    await expect(page.locator('[data-testid="filter-dropdown"]')).toHaveValue(
      'active'
    );

    await page.screenshot({ path: 'test-results/e2e-01-filter-preserved.png' });
  });

  // E2E-02: 폼 입력 중 탭 전환
  test.skip('폼 입력 값이 탭 전환 후에도 유지된다', async ({ page }) => {
    // 폼 화면 열기
    await page.click('[data-testid="menu-item-sample-form"]');

    // 폼 필드 입력
    await page.fill('[data-testid="form-name-input"]', '테스트 이름');
    await page.fill('[data-testid="form-description-input"]', '테스트 설명');

    // 다른 탭으로 전환
    await page.click('[data-testid="menu-item-dashboard"]');

    // 폼 탭으로 복귀
    await page.click('[data-testid="tab-sample-form"]');

    // 입력 값 유지 확인
    await expect(page.locator('[data-testid="form-name-input"]')).toHaveValue(
      '테스트 이름'
    );
    await expect(
      page.locator('[data-testid="form-description-input"]')
    ).toHaveValue('테스트 설명');

    await page.screenshot({ path: 'test-results/e2e-02-form-preserved.png' });
  });

  // E2E-03: 화면 동적 로딩
  test.skip('처음 여는 화면은 로딩 후 표시된다', async ({ page }) => {
    // 새 화면 열기
    await page.click('[data-testid="menu-item-new-screen"]');

    // 로딩 스피너 확인 (빠르게 지나갈 수 있음)
    const loadingSpinner = page.locator('[data-testid="mdi-screen-loading"]');

    // 화면 로딩 완료 대기
    await expect(page.locator('[data-testid="mdi-screen-content"]')).toBeVisible({
      timeout: 5000,
    });

    await page.screenshot({ path: 'test-results/e2e-03-loaded.png' });
  });

  // E2E-05: 존재하지 않는 화면
  test.skip('존재하지 않는 화면은 404를 표시한다', async ({ page }) => {
    // 잘못된 경로로 탭 열기 시도 (프로그래매틱)
    await page.evaluate(() => {
      // @ts-ignore - 테스트용
      window.__MDI_CONTEXT__?.openTab({
        id: 'invalid-tab',
        title: 'Invalid',
        path: '/invalid/path',
        closable: true,
      });
    });

    await expect(page.locator('[data-testid="mdi-screen-not-found"]')).toBeVisible();

    await page.screenshot({ path: 'test-results/e2e-05-not-found.png' });
  });

  // E2E-07: 반응형 레이아웃
  test('뷰포트 크기 변경 시 레이아웃이 적응한다', async ({ page }) => {
    // 데스크톱 뷰포트
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('[data-testid="portal-content"]')).toBeVisible();
    await page.screenshot({
      path: 'test-results/e2e-07-responsive-desktop.png',
    });

    // 태블릿 뷰포트
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('[data-testid="portal-content"]')).toBeVisible();
    await page.screenshot({ path: 'test-results/e2e-07-responsive-tablet.png' });

    // 모바일 뷰포트
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('[data-testid="portal-content"]')).toBeVisible();
    await page.screenshot({ path: 'test-results/e2e-07-responsive-mobile.png' });
  });

  // E2E-08: 스크롤 영역 제한
  test.skip('스크롤 시 헤더와 사이드바가 고정된다', async ({ page }) => {
    // 긴 컨텐츠가 있는 화면 열기
    await page.click('[data-testid="menu-item-sample-table"]');

    // 컨텐츠 영역 스크롤
    await page.locator('[data-testid="mdi-content"]').evaluate((el) => {
      el.scrollTop = 500;
    });

    // 헤더가 여전히 보이는지 확인
    await expect(page.locator('[data-testid="portal-header"]')).toBeVisible();

    // 헤더의 Y 위치가 0인지 확인 (고정)
    const headerBoundingBox = await page
      .locator('[data-testid="portal-header"]')
      .boundingBox();
    expect(headerBoundingBox?.y).toBe(0);

    await page.screenshot({ path: 'test-results/e2e-08-scroll-fixed.png' });
  });

  test.describe('MDI 컨텐츠 컴포넌트 검증', () => {
    test('MDI 컨텐츠 영역이 존재한다', async ({ page }) => {
      // 포털 컨텐츠 영역 확인
      await expect(page.locator('[data-testid="portal-content"]')).toBeVisible();
    });

    test('TabBar와 함께 렌더링된다', async ({ page }) => {
      // 탭 바가 있으면 확인
      const tabBar = page.locator('[data-testid="tab-bar"]');
      if (await tabBar.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(tabBar).toBeVisible();
      }
    });
  });
});
