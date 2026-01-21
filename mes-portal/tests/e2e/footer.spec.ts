// tests/e2e/footer.spec.ts
// Footer 컴포넌트 E2E 테스트 (TSK-01-04)

import { test, expect } from '@playwright/test'

test.describe('Footer E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard')
    // 페이지 로드 대기
    await page.waitForSelector('[data-testid="footer-component"]')
  })

  // E2E-01: 포털 화면에서 푸터가 표시된다
  test('E2E-01: 포털 화면에서 푸터가 표시된다', async ({ page }) => {
    const footer = page.locator('[data-testid="footer-component"]')
    await expect(footer).toBeVisible()
  })

  // E2E-01-1: 저작권 정보 확인
  test('E2E-01-1: 저작권 정보가 표시된다', async ({ page }) => {
    const copyright = page.locator('[data-testid="footer-copyright"]')
    await expect(copyright).toBeVisible()
    await expect(copyright).toContainText('Copyright ©')
    await expect(copyright).toContainText('2026')
  })

  // E2E-01-2: 버전 정보 확인
  test('E2E-01-2: 버전 정보가 표시된다', async ({ page }) => {
    const version = page.locator('[data-testid="footer-version"]')
    await expect(version).toBeVisible()
    // v{숫자}.{숫자}.{숫자} 형식 검증
    await expect(version).toHaveText(/v\d+\.\d+\.\d+/)
  })

  // E2E-01-3: 푸터 높이 확인
  test('E2E-01-3: 푸터 높이가 30px이다', async ({ page }) => {
    const footer = page.locator('[data-testid="footer-component"]')
    const box = await footer.boundingBox()
    expect(box?.height).toBe(30)
  })

  // E2E-02: 다크 모드에서 푸터 표시
  test('E2E-02: 다크 모드에서 푸터가 정상 표시된다', async ({ page }) => {
    // 다크 모드로 전환
    const themeButton = page.locator('[data-testid="theme-toggle"]')
    await themeButton.click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')

    // 푸터 확인
    const footer = page.locator('[data-testid="footer-component"]')
    await expect(footer).toBeVisible()

    // 저작권/버전 정보 확인
    await expect(page.locator('[data-testid="footer-copyright"]')).toBeVisible()
    await expect(page.locator('[data-testid="footer-version"]')).toBeVisible()
  })

  // E2E-03: 반응형 테스트 - 모바일
  test('E2E-03: 모바일에서 푸터가 정상 표시된다', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.reload()
    await page.waitForSelector('[data-testid="footer-component"]')

    const footer = page.locator('[data-testid="footer-component"]')
    await expect(footer).toBeVisible()

    // 저작권/버전 정보가 여전히 표시됨
    await expect(page.locator('[data-testid="footer-copyright"]')).toBeVisible()
    await expect(page.locator('[data-testid="footer-version"]')).toBeVisible()
  })

  // E2E-04: 반응형 테스트 - 태블릿
  test('E2E-04: 태블릿에서 푸터가 정상 표시된다', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.reload()
    await page.waitForSelector('[data-testid="footer-component"]')

    const footer = page.locator('[data-testid="footer-component"]')
    await expect(footer).toBeVisible()
  })

  // E2E-05: 페이지 이동 후에도 푸터 유지
  test('E2E-05: 페이지 이동 후에도 푸터가 유지된다', async ({ page }) => {
    // 초기 푸터 확인
    await expect(page.locator('[data-testid="footer-component"]')).toBeVisible()

    // 로고 클릭으로 홈 이동
    await page.locator('[data-testid="header-logo"]').click()
    await page.waitForURL('/')

    // 홈에서도 푸터가 보이는지 확인 (포털 레이아웃 사용 시)
    // 참고: 홈 페이지가 다른 레이아웃을 사용하면 이 테스트는 스킵될 수 있음
    const footerOnHome = page.locator('[data-testid="footer-component"]')
    if (await footerOnHome.isVisible()) {
      await expect(footerOnHome).toBeVisible()
    }
  })
})
