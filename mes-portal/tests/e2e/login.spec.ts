// tests/e2e/login.spec.ts
// 로그인 페이지 E2E 테스트

import { test, expect } from '@playwright/test'

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    // 로그인 페이지 로드 대기
    await page.waitForSelector('[data-testid="login-page"]')
  })

  // E2E-001: 로그인 폼 렌더링
  test('E2E-001: 로그인 페이지가 올바르게 렌더링된다', async ({ page }) => {
    // 페이지 요소 확인
    await expect(page.locator('[data-testid="login-page"]')).toBeVisible()
    await expect(page.locator('[data-testid="login-card"]')).toBeVisible()
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="password-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="login-button"]')).toBeVisible()

    // 로고 확인 (heading role로 특정)
    await expect(page.getByRole('heading', { name: 'MES Portal' })).toBeVisible()
    await expect(
      page.locator('text=Manufacturing Execution System')
    ).toBeVisible()

    // 푸터 확인
    await expect(page.locator('[data-testid="login-footer"]')).toBeVisible()
    await expect(page.locator('[data-testid="login-footer"]')).toContainText(
      '2026'
    )

    await page.screenshot({ path: 'test-results/e2e/screenshots/e2e-001-login-page.png' })
  })

  // E2E-002: 정상 로그인
  test('E2E-002: 유효한 자격 증명으로 로그인 성공', async ({ page }) => {
    await page.screenshot({
      path: 'test-results/e2e/screenshots/e2e-002-before.png',
    })

    // 자격 증명 입력 (테스트 계정: admin@example.com / password123)
    await page.fill('[data-testid="email-input"]', 'admin@example.com')
    await page.fill('[data-testid="password-input"]', 'password123')

    // 로그인 버튼 클릭
    await page.click('[data-testid="login-button"]')

    // 리다이렉트 확인 (대시보드로 이동)
    await expect(page).toHaveURL(/\/portal|\/dashboard/, { timeout: 10000 })

    await page.screenshot({
      path: 'test-results/e2e/screenshots/e2e-002-after.png',
    })
  })

  // E2E-003: 빈 필드 제출
  test('E2E-003: 빈 필드로 제출 시 유효성 에러 표시', async ({ page }) => {
    // 아무것도 입력하지 않고 로그인 시도
    await page.click('[data-testid="login-button"]')

    // 유효성 에러 메시지 확인
    await expect(page.locator('text=이메일을 입력해주세요')).toBeVisible()
    await expect(page.locator('text=비밀번호를 입력해주세요')).toBeVisible()

    await page.screenshot({
      path: 'test-results/e2e/screenshots/e2e-003-validation-error.png',
    })
  })

  // E2E-004: 잘못된 이메일 형식
  test('E2E-004: 잘못된 이메일 형식 입력 시 에러 표시', async ({ page }) => {
    await page.fill('[data-testid="email-input"]', 'invalid-email')
    await page.fill('[data-testid="password-input"]', 'password123')
    await page.click('[data-testid="login-button"]')

    await expect(
      page.locator('text=올바른 이메일 형식이 아닙니다')
    ).toBeVisible()

    await page.screenshot({
      path: 'test-results/e2e/screenshots/e2e-004-email-format-error.png',
    })
  })

  // E2E-005: 인증 실패
  test('E2E-005: 잘못된 자격 증명으로 로그인 실패', async ({ page }) => {
    await page.fill('[data-testid="email-input"]', 'wrong@example.com')
    await page.fill('[data-testid="password-input"]', 'wrongpassword')
    await page.click('[data-testid="login-button"]')

    // 에러 Alert 확인
    await expect(page.locator('[data-testid="login-error-alert"]')).toBeVisible(
      { timeout: 10000 }
    )
    await expect(
      page.locator('[data-testid="login-error-alert"]')
    ).toContainText('이메일 또는 비밀번호가 올바르지 않습니다')

    // 여전히 로그인 페이지에 있음
    await expect(page).toHaveURL('/login')

    await page.screenshot({
      path: 'test-results/e2e/screenshots/e2e-005-auth-failure.png',
    })
  })

  // E2E-006: 비활성 계정 로그인 (테스트 계정 없음 - 스킵)
  test.skip('E2E-006: 비활성 계정으로 로그인 시 에러 표시', async ({ page }) => {
    // 비활성 계정 테스트 데이터가 시드에 없으므로 스킵
    await page.fill('[data-testid="email-input"]', 'inactive@example.com')
    await page.fill('[data-testid="password-input"]', 'password123')
    await page.click('[data-testid="login-button"]')

    await expect(page.locator('[data-testid="login-error-alert"]')).toBeVisible(
      { timeout: 10000 }
    )

    await page.screenshot({
      path: 'test-results/e2e/screenshots/e2e-006-inactive-account.png',
    })
  })

  // E2E-009: 반응형 레이아웃
  test('E2E-009: 모바일 뷰포트에서 로그인 폼이 올바르게 표시된다', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.reload()
    await page.waitForSelector('[data-testid="login-page"]')

    // 로그인 카드가 표시됨
    await expect(page.locator('[data-testid="login-card"]')).toBeVisible()

    // 모든 요소가 접근 가능
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="password-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="login-button"]')).toBeVisible()

    await page.screenshot({
      path: 'test-results/e2e/screenshots/e2e-009-mobile.png',
    })
  })

  // 키보드 접근성 테스트
  test('접근성: Enter 키로 로그인 폼 제출', async ({ page }) => {
    await page.fill('[data-testid="email-input"]', 'admin@example.com')
    await page.fill('[data-testid="password-input"]', 'password123')

    // Enter 키로 제출
    await page.keyboard.press('Enter')

    // 로그인 처리 확인 (버튼 로딩 상태 또는 리다이렉트)
    // 리다이렉트 대기
    await expect(page).toHaveURL(/\/portal|\/dashboard/, { timeout: 10000 })
  })

  test('접근성: Tab 키로 폼 요소 탐색', async ({ page }) => {
    // 이메일 필드로 포커스
    await page.locator('[data-testid="email-input"]').focus()
    expect(await page.evaluate(() => document.activeElement?.getAttribute('data-testid'))).toBe('email-input')

    // Tab으로 비밀번호 필드 이동
    await page.keyboard.press('Tab')
    // Ant Design Input은 내부적으로 다른 요소로 포커스될 수 있음
    // 비밀번호 입력 가능 상태 확인
    await page.keyboard.type('test')
    expect(await page.locator('[data-testid="password-input"]').inputValue()).toBe('test')
  })
})

// 인증 상태 테스트 (별도 describe)
test.describe('Authenticated User', () => {
  // E2E-007: 세션 있는 상태 접근
  // 이 테스트는 별도의 auth fixture가 필요하므로 스킵
  test.skip('E2E-007: 로그인 상태에서 /login 접근 시 포털로 리다이렉트', async ({
    page,
  }) => {
    // 먼저 로그인
    await page.goto('/login')
    await page.fill('[data-testid="email-input"]', 'admin@example.com')
    await page.fill('[data-testid="password-input"]', 'password123')
    await page.click('[data-testid="login-button"]')
    await expect(page).toHaveURL(/\/portal|\/dashboard/, { timeout: 10000 })

    // 로그인 페이지로 다시 접근
    await page.goto('/login')

    // 자동으로 /portal로 리다이렉트됨
    await expect(page).toHaveURL(/\/portal|\/dashboard/, { timeout: 5000 })
  })
})
