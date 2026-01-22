// tests/e2e/production-gantt.spec.ts
// 생산 계획 간트 차트 E2E 테스트 (TSK-06-14)

import { test, expect } from '@playwright/test'

// 테스트 타임아웃 설정
test.setTimeout(60000)

test.describe('생산 계획 간트 차트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인
    await page.goto('/login')
    await page.waitForSelector('[data-testid="login-page"]')
    await page.fill('[data-testid="email-input"]', 'admin@example.com')
    await page.fill('[data-testid="password-input"]', 'password123')
    await page.click('[data-testid="login-button"]')
    await expect(page).toHaveURL(/\/portal|\/dashboard/, { timeout: 10000 })

    // 간트 차트 페이지로 이동
    await page.goto('/sample/production-gantt')
    // 페이지 로드 대기
    await page.waitForSelector('[data-testid="production-gantt-page"]', { timeout: 30000 })
  })

  // E2E-001: 간트 차트 화면 로드
  test('E2E-001: 사용자가 생산 계획 간트 차트를 조회할 수 있다', async ({ page }) => {
    // 간트 차트 영역 확인
    await expect(page.locator('[data-testid="gantt-chart"]')).toBeVisible()

    // 스케일 선택기 확인
    await expect(page.locator('[data-testid="scale-selector"]')).toBeVisible()

    // 기본 스케일이 주간으로 설정되어 있는지 확인 (BR-004)
    const weekButton = page.locator('[data-testid="scale-week"]')
    await expect(weekButton).toHaveClass(/ant-btn-primary/)
  })

  // E2E-002: 작업 바 표시 확인
  test('E2E-002: 작업 바가 시작일~종료일 범위로 표시된다', async ({ page }) => {
    // 작업 바 5개 확인
    const taskBars = page.locator('[data-testid="task-bar"]')
    await expect(taskBars).toHaveCount(5)

    // 작업명 확인
    await expect(page.getByText('제품A 생산')).toBeVisible()
    await expect(page.getByText('제품B 생산')).toBeVisible()
    await expect(page.getByText('제품C 생산')).toBeVisible()
    await expect(page.getByText('설비 점검')).toBeVisible()
    await expect(page.getByText('제품D 생산')).toBeVisible()
  })

  // E2E-003: 스케일 변경
  test('E2E-003: 스케일을 일간/주간/월간으로 변경할 수 있다', async ({ page }) => {
    // 일간 스케일로 변경
    await page.click('[data-testid="scale-day"]')
    await expect(page.locator('[data-testid="scale-day"]')).toHaveClass(/ant-btn-primary/)

    // 월간 스케일로 변경
    await page.click('[data-testid="scale-month"]')
    await expect(page.locator('[data-testid="scale-month"]')).toHaveClass(/ant-btn-primary/)

    // 주간 스케일로 복귀
    await page.click('[data-testid="scale-week"]')
    await expect(page.locator('[data-testid="scale-week"]')).toHaveClass(/ant-btn-primary/)
  })

  // E2E-004: 진행률 확인
  test('E2E-004: 작업 바에 진행률이 시각적으로 표시된다', async ({ page }) => {
    // 진행률 채움 바 확인
    const progressFills = page.locator('[data-testid="progress-fill"]')
    await expect(progressFills.first()).toBeVisible()

    // 첫 번째 작업 바의 진행률 (70%)
    const firstProgressFill = progressFills.first()
    await expect(firstProgressFill).toHaveCSS('width', /70%/)
  })

  // E2E-005: 툴팁 표시
  test('E2E-005: 작업 바 호버 시 상세 정보 툴팁이 표시된다', async ({ page }) => {
    // 첫 번째 작업 바에 호버
    const firstTaskBar = page.locator('[data-testid="task-bar"]').first()
    await firstTaskBar.hover()

    // 툴팁이 표시될 때까지 대기
    await page.waitForTimeout(500) // Ant Design 툴팁 딜레이

    // 툴팁 내용 확인
    const tooltip = page.locator('.ant-tooltip')
    await expect(tooltip).toBeVisible()
    await expect(tooltip).toContainText('제품A 생산')
    await expect(tooltip).toContainText('PRD-001')
    await expect(tooltip).toContainText('1,000 EA')
    await expect(tooltip).toContainText('Line-01')
    await expect(tooltip).toContainText('70%')
  })

  // E2E-006: 상태별 색상
  test('E2E-006: 작업 상태에 따라 바 색상이 다르게 표시된다', async ({ page }) => {
    // 범례에서 색상 레이블 확인
    await expect(page.getByText('완료')).toBeVisible()
    await expect(page.getByText('진행중')).toBeVisible()
    await expect(page.getByText('지연')).toBeVisible()
    await expect(page.getByText('계획됨')).toBeVisible()

    // 범례 영역 확인
    await expect(page.locator('[data-testid="legend"]')).toBeVisible()
  })

  // 기간 네비게이션 테스트
  test('기간 네비게이션: 이전/다음 버튼으로 기간을 이동할 수 있다', async ({ page }) => {
    const dateLabel = page.locator('[data-testid="date-label"]')
    const initialText = await dateLabel.textContent()

    // 다음 기간으로 이동
    await page.click('[data-testid="date-next"]')
    await page.waitForTimeout(100)
    const nextText = await dateLabel.textContent()
    expect(nextText).not.toBe(initialText)

    // 이전 기간으로 복귀
    await page.click('[data-testid="date-prev"]')
    await page.waitForTimeout(100)
    const prevText = await dateLabel.textContent()
    expect(prevText).toBe(initialText)
  })

  // 요약 정보 테스트
  test('요약 정보가 올바르게 표시된다', async ({ page }) => {
    const summary = page.locator('[data-testid="summary"]')
    await expect(summary).toBeVisible()
    await expect(summary).toContainText('총 5개 작업')
    await expect(summary).toContainText('평균 진행률: 80%')
  })

  // 타임라인 헤더 테스트
  test('타임라인 헤더가 표시된다', async ({ page }) => {
    const timelineHeader = page.locator('[data-testid="timeline-header"]')
    await expect(timelineHeader).toBeVisible()
  })

  // 작업 목록 테스트
  test('작업 목록이 좌측에 표시된다', async ({ page }) => {
    const taskList = page.locator('[data-testid="task-list"]')
    await expect(taskList).toBeVisible()

    // 작업명 컬럼 헤더
    await expect(taskList).toContainText('작업명')
  })

  // 반응형 테스트
  test('반응형: 태블릿 사이즈에서 레이아웃이 유지된다', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 })

    // 로그인 상태에서 페이지 재로드
    await page.goto('/sample/production-gantt')
    await page.waitForSelector('[data-testid="gantt-chart"]', { timeout: 30000 })

    // 간트 차트가 여전히 표시되는지 확인
    await expect(page.locator('[data-testid="gantt-chart"]')).toBeVisible()
    await expect(page.locator('[data-testid="task-list"]')).toBeVisible()
  })
})
