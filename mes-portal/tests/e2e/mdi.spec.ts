/**
 * MDI E2E 테스트
 * @description TSK-02-01 MDI 상태 관리 E2E 테스트 (026-test-specification.md 기반)
 *
 * 참고: 이 테스트들은 TSK-02-02 (탭 바 컴포넌트)와 TSK-02-05 (MDI 컨텐츠 영역)이
 * 구현된 후에 완전히 실행 가능합니다. 현재는 MDI 상태 관리 로직만 구현되어 있습니다.
 */

import { test, expect } from '@playwright/test';

test.describe('MDI 시스템', () => {
  test.beforeEach(async ({ page }) => {
    // 포털 페이지로 이동 (dashboard가 포털 레이아웃을 사용)
    await page.goto('/dashboard');
    // 페이지 로드 대기
    await page.waitForLoadState('networkidle');
  });

  // E2E-001: 탭 시스템 초기 상태
  test('포털 진입 시 MDI 탭 바 영역이 준비되어야 함', async ({ page }) => {
    // 포털 레이아웃이 렌더링되었는지 확인
    await expect(page.locator('[data-testid="portal-layout"]')).toBeVisible();
    await expect(page.locator('[data-testid="portal-content"]')).toBeVisible();

    // 스크린샷 캡처
    await page.screenshot({ path: 'test-results/e2e-001-initial-state.png' });
  });

  // E2E-002: 메뉴 클릭 시 화면 전환 확인
  test('사이드바 메뉴 클릭 시 화면이 전환되어야 함', async ({ page }) => {
    // 사이드바가 표시되는지 확인
    await expect(page.locator('[data-testid="portal-sidebar"]')).toBeVisible();

    // 메뉴 아이템 클릭 (예: 첫 번째 메뉴)
    const firstMenuItem = page.locator('[data-testid="menu-item"]').first();
    if (await firstMenuItem.isVisible()) {
      await firstMenuItem.click();
      // 페이지 전환 확인 (URL 변경 등)
      await page.waitForLoadState('networkidle');
    }

    // 스크린샷 캡처
    await page.screenshot({ path: 'test-results/e2e-002-menu-click.png' });
  });

  // E2E-003: 탭 닫기 테스트 (TSK-02-02 구현 후 활성화)
  test.skip('탭 닫기 버튼 클릭 시 탭이 닫혀야 함', async ({ page }) => {
    // 탭 바가 표시되는지 확인
    await expect(page.locator('[data-testid="mdi-tab-bar"]')).toBeVisible();

    // 메뉴 2개 클릭하여 탭 2개 열기
    await page.click('[data-testid="menu-item-work-order"]');
    await page.click('[data-testid="menu-item-production"]');

    // 첫 번째 탭의 닫기 버튼 클릭
    await page.click('[data-testid="mdi-tab-close-work-order"]');

    // 탭이 닫혔는지 확인
    await expect(
      page.locator('[data-testid="mdi-tab-work-order"]')
    ).not.toBeVisible();

    // 스크린샷 캡처
    await page.screenshot({ path: 'test-results/e2e-003-close-tab.png' });
  });

  // E2E-004: 탭 전환 시 상태 유지 (TSK-02-02 구현 후 활성화)
  test.skip('탭 전환 후 복귀 시 입력 데이터가 유지되어야 함', async ({
    page,
  }) => {
    // 폼이 있는 화면 열기
    await page.click('[data-testid="menu-item-form"]');

    // 폼에 데이터 입력
    await page.fill('[data-testid="form-input-name"]', '테스트 데이터');

    // 다른 메뉴 클릭하여 새 탭 열기
    await page.click('[data-testid="menu-item-other"]');

    // 원래 탭 클릭
    await page.click('[data-testid="mdi-tab-form"]');

    // 입력값 유지 확인
    await expect(page.locator('[data-testid="form-input-name"]')).toHaveValue(
      '테스트 데이터'
    );

    // 스크린샷 캡처
    await page.screenshot({
      path: 'test-results/e2e-004-state-preservation.png',
    });
  });

  // E2E-005: 최대 탭 제한 (TSK-02-02 구현 후 활성화)
  test.skip('최대 탭 개수 도달 시 경고 메시지가 표시되어야 함', async ({
    page,
  }) => {
    // maxTabs=3 설정이 필요함 (테스트 환경 설정)

    // 탭 3개 열기
    await page.click('[data-testid="menu-item-1"]');
    await page.click('[data-testid="menu-item-2"]');
    await page.click('[data-testid="menu-item-3"]');

    // 4번째 메뉴 클릭
    await page.click('[data-testid="menu-item-4"]');

    // 경고 메시지 확인
    await expect(page.locator('[data-testid="toast-message"]')).toContainText(
      '탭을 더 이상 열 수 없습니다'
    );

    // 스크린샷 캡처
    await page.screenshot({ path: 'test-results/e2e-005-max-tabs.png' });
  });

  // E2E-006: 모든 탭 닫기 (TSK-02-04 구현 후 활성화)
  test.skip('컨텍스트 메뉴에서 모든 탭 닫기 시 closable=true 탭만 닫혀야 함', async ({
    page,
  }) => {
    // 탭 3개 열기
    await page.click('[data-testid="menu-item-home"]'); // closable: false
    await page.click('[data-testid="menu-item-work-order"]'); // closable: true
    await page.click('[data-testid="menu-item-production"]'); // closable: true

    // 탭 우클릭하여 컨텍스트 메뉴 열기
    await page.click('[data-testid="mdi-tab-work-order"]', { button: 'right' });

    // "모두 닫기" 클릭
    await page.click('[data-testid="tab-context-close-all"]');

    // closable=false 탭만 남았는지 확인
    await expect(page.locator('[data-testid="mdi-tab-home"]')).toBeVisible();
    await expect(
      page.locator('[data-testid="mdi-tab-work-order"]')
    ).not.toBeVisible();

    // 스크린샷 캡처
    await page.screenshot({ path: 'test-results/e2e-006-close-all.png' });
  });

  // E2E-007: 다른 탭 닫기 (TSK-02-04 구현 후 활성화)
  test.skip('컨텍스트 메뉴에서 다른 탭 닫기 시 선택 탭만 남아야 함', async ({
    page,
  }) => {
    // 탭 3개 열기
    await page.click('[data-testid="menu-item-home"]');
    await page.click('[data-testid="menu-item-work-order"]');
    await page.click('[data-testid="menu-item-production"]');

    // production 탭 우클릭하여 컨텍스트 메뉴 열기
    await page.click('[data-testid="mdi-tab-production"]', { button: 'right' });

    // "다른 탭 닫기" 클릭
    await page.click('[data-testid="tab-context-close-others"]');

    // production 탭과 closable=false 탭만 남았는지 확인
    await expect(page.locator('[data-testid="mdi-tab-home"]')).toBeVisible();
    await expect(
      page.locator('[data-testid="mdi-tab-production"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="mdi-tab-work-order"]')
    ).not.toBeVisible();

    // 스크린샷 캡처
    await page.screenshot({ path: 'test-results/e2e-007-close-others.png' });
  });
});
