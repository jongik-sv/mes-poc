// tests/e2e/loading-error-states.spec.ts
// 로딩 및 에러 상태 컴포넌트 E2E 테스트 (TSK-05-01)

import { test, expect } from '@playwright/test'

test.describe('Loading & Error States', () => {
  // E2E-001: 페이지 초기 로딩
  test.describe('E2E-001: 페이지 초기 로딩', () => {
    test('페이지 접속 시 콘텐츠가 로드된다', async ({ page }) => {
      // 대시보드 페이지 접속
      await page.goto('/dashboard')

      // 페이지 콘텐츠가 로드될 때까지 대기
      await page.waitForLoadState('domcontentloaded')

      // 메인 콘텐츠가 표시되는지 확인 (portal-layout 또는 main 콘텐츠)
      await expect(page.locator('[data-testid="portal-layout"]')).toBeVisible()
    })
  })

  // E2E-004: 404 페이지 접근
  test.describe('E2E-004: 404 페이지 접근', () => {
    test('존재하지 않는 URL 접근 시 404 에러 페이지가 표시된다', async ({ page }) => {
      // 존재하지 않는 페이지 접속
      await page.goto('/non-existent-page-xyz123')

      // 404 에러 페이지 확인
      await expect(page.locator('[data-testid="error-page"]')).toBeVisible()
      await expect(page.locator('[data-testid="error-page-title"]')).toContainText('404')
      await expect(page.locator('[data-testid="error-page-message"]')).toContainText('페이지를 찾을 수 없습니다')
    })

    test('404 페이지에서 홈으로 버튼 클릭 시 홈 페이지로 이동한다', async ({ page }) => {
      // 존재하지 않는 페이지 접속
      await page.goto('/non-existent-page')

      // 에러 페이지 확인
      await expect(page.locator('[data-testid="error-page"]')).toBeVisible()

      // 홈으로 버튼 클릭
      await page.click('[data-testid="error-page-home-btn"]')

      // 홈 페이지로 이동 확인
      await expect(page).toHaveURL('/')
    })

    test('404 에러 페이지의 접근성 속성 확인', async ({ page }) => {
      await page.goto('/non-existent-url')

      // role="alert" 및 aria-live 속성 확인
      const errorPage = page.locator('[data-testid="error-page"]')
      await expect(errorPage).toHaveAttribute('role', 'alert')
      await expect(errorPage).toHaveAttribute('aria-live', 'assertive')
    })
  })

  // E2E-002: 빈 상태 표시 (EmptyState)
  test.describe('E2E-002: 빈 상태 표시', () => {
    test.skip('빈 데이터 목록 페이지에서 Empty 상태가 표시된다', async ({ page }) => {
      // 이 테스트는 실제 빈 데이터 상태를 가진 페이지가 구현된 후 활성화
      // 현재는 Mock 데이터로 인해 빈 상태를 테스트하기 어려움
      await page.goto('/empty-data-page')
      await expect(page.locator('[data-testid="empty-state"]')).toBeVisible()
    })
  })

  // E2E-006: 스켈레톤 로딩
  test.describe('E2E-006: 스켈레톤 로딩', () => {
    test.skip('데이터 로딩 중 스켈레톤 UI가 표시된다', async ({ page }) => {
      // 스켈레톤 로딩 테스트는 네트워크 지연 Mock 설정이 필요
      // 실제 API 연동 후 활성화
      await page.goto('/data-table-page')
      await expect(page.locator('[data-testid="component-skeleton"]')).toBeVisible()
    })
  })

  // 접근성 테스트
  test.describe('접근성', () => {
    test('에러 페이지에 적절한 ARIA 속성이 설정되어 있다', async ({ page }) => {
      await page.goto('/not-found-test-page')

      const errorPage = page.locator('[data-testid="error-page"]')

      // role="alert" 확인 - 스크린 리더가 즉시 읽을 수 있도록
      await expect(errorPage).toHaveAttribute('role', 'alert')

      // aria-live="assertive" 확인 - 중요한 메시지임을 표시
      await expect(errorPage).toHaveAttribute('aria-live', 'assertive')
    })

    test('홈으로 버튼이 키보드로 접근 가능하다', async ({ page }) => {
      await page.goto('/non-existent-page')

      // Tab 키로 버튼에 포커스 이동
      await page.keyboard.press('Tab')

      // 홈으로 버튼에 포커스가 있는지 확인
      const homeBtn = page.locator('[data-testid="error-page-home-btn"]')
      await expect(homeBtn).toBeFocused()

      // Enter 키로 버튼 활성화
      await page.keyboard.press('Enter')

      // 홈 페이지로 이동 확인
      await expect(page).toHaveURL('/')
    })
  })
})
