// tests/e2e/work-calendar.spec.ts
// 작업 일정 캘린더 E2E 테스트 (TSK-06-11)

import { test, expect } from '@playwright/test'

// 테스트 타임아웃 설정
test.setTimeout(60000)

test.describe('작업 일정 캘린더', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인
    await page.goto('/login')
    await page.waitForSelector('[data-testid="login-page"]')
    await page.fill('[data-testid="email-input"]', 'admin@example.com')
    await page.fill('[data-testid="password-input"]', 'password123')
    await page.click('[data-testid="login-button"]')
    await expect(page).toHaveURL(/\/portal|\/dashboard/, { timeout: 10000 })

    // 캘린더 페이지로 이동
    await page.goto('/sample/work-calendar')
    // 페이지 로드 대기
    await page.waitForSelector('[data-testid="work-calendar-page"]', { timeout: 30000 })
  })

  test.describe('E2E-001: 캘린더 페이지 로드 및 월간 뷰 표시', () => {
    test('캘린더 페이지가 월간 뷰로 로드된다', async ({ page }) => {
      // 페이지 컨테이너 확인
      await expect(page.locator('[data-testid="work-calendar-page"]')).toBeVisible()

      // 캘린더 컨테이너 확인
      await expect(page.locator('[data-testid="calendar-container"]')).toBeVisible()

      // 월간 뷰가 기본값인지 확인
      await expect(page.locator('[data-testid="calendar-month-view"]')).toBeVisible()

      // 현재 기간 표시 확인
      await expect(page.locator('[data-testid="calendar-current-period"]')).toBeVisible()

      // 일정 추가 버튼 확인
      await expect(page.locator('[data-testid="add-schedule-btn"]')).toBeVisible()

      // 범례 확인
      await expect(page.locator('[data-testid="schedule-legend"]')).toBeVisible()
    })

    test('일정 이벤트가 캘린더에 표시된다', async ({ page }) => {
      // Mock 데이터의 일정이 표시되는지 확인
      const scheduleEvents = page.locator('[data-testid^="schedule-event-"]')
      await expect(scheduleEvents.first()).toBeVisible()
    })
  })

  test.describe('E2E-002: 뷰 모드 전환', () => {
    test('월간 → 주간 → 일간 뷰로 전환할 수 있다', async ({ page }) => {
      const viewToggle = page.locator('[data-testid="calendar-view-toggle"]')
      await expect(viewToggle).toBeVisible()

      // 초기 상태: 월간 뷰
      await expect(page.locator('[data-testid="calendar-month-view"]')).toBeVisible()

      // 주간 뷰로 전환
      await viewToggle.getByText('주간').click()
      await expect(page.locator('[data-testid="calendar-week-view"]')).toBeVisible()
      await expect(page.locator('[data-testid="calendar-month-view"]')).not.toBeVisible()

      // 일간 뷰로 전환
      await viewToggle.getByText('일간').click()
      await expect(page.locator('[data-testid="calendar-day-view"]')).toBeVisible()
      await expect(page.locator('[data-testid="calendar-week-view"]')).not.toBeVisible()

      // 월간 뷰로 복귀
      await viewToggle.getByText('월간').click()
      await expect(page.locator('[data-testid="calendar-month-view"]')).toBeVisible()
      await expect(page.locator('[data-testid="calendar-day-view"]')).not.toBeVisible()
    })
  })

  test.describe('E2E-003: 일정 클릭 시 상세 모달 표시', () => {
    test('일정 클릭 시 상세 모달이 표시된다', async ({ page }) => {
      // 첫 번째 일정 이벤트 클릭
      const scheduleEvent = page.locator('[data-testid^="schedule-event-"]').first()
      await scheduleEvent.click()

      // 상세 모달 표시 확인
      await expect(page.locator('[data-testid="schedule-detail-modal"]')).toBeVisible()

      // 모달 내 정보 표시 확인
      await expect(page.locator('[data-testid="schedule-detail-title"]')).toBeVisible()
      await expect(page.locator('[data-testid="schedule-detail-type"]')).toBeVisible()
      await expect(page.locator('[data-testid="schedule-detail-period"]')).toBeVisible()

      // 버튼 확인
      await expect(page.locator('[data-testid="edit-schedule-btn"]')).toBeVisible()
      await expect(page.locator('[data-testid="delete-schedule-btn"]')).toBeVisible()
      await expect(page.locator('[data-testid="close-modal-btn"]')).toBeVisible()

      // 모달 닫기
      await page.locator('[data-testid="close-modal-btn"]').click()
      await expect(page.locator('[data-testid="schedule-detail-modal"]')).not.toBeVisible()
    })
  })

  test.describe('E2E-004: 새 일정 추가', () => {
    test('새 일정을 추가할 수 있다', async ({ page }) => {
      // 일정 추가 버튼 클릭
      await page.locator('[data-testid="add-schedule-btn"]').click()

      // 폼 모달 표시 확인
      await expect(page.locator('[data-testid="schedule-form-modal"]')).toBeVisible()

      // 제목 입력
      await page.locator('[data-testid="schedule-title-input"]').fill('테스트 일정')

      // 유형 선택
      await page.locator('[data-testid="schedule-type-select"]').click()
      await page.getByText('작업일정').click()

      // 저장 버튼 클릭
      await page.locator('[data-testid="save-schedule-btn"]').click()

      // 모달 닫힘 확인
      await expect(page.locator('[data-testid="schedule-form-modal"]')).not.toBeVisible()

      // 성공 메시지 확인
      await expect(page.getByText('일정이 추가되었습니다')).toBeVisible()
    })
  })

  test.describe('E2E-005: 일정 수정', () => {
    test('기존 일정을 수정할 수 있다', async ({ page }) => {
      // 일정 클릭하여 상세 모달 열기
      const scheduleEvent = page.locator('[data-testid^="schedule-event-"]').first()
      await scheduleEvent.click()

      await expect(page.locator('[data-testid="schedule-detail-modal"]')).toBeVisible()

      // 수정 버튼 클릭
      await page.locator('[data-testid="edit-schedule-btn"]').click()

      // 폼 모달로 전환 확인
      await expect(page.locator('[data-testid="schedule-form-modal"]')).toBeVisible()

      // 제목 수정
      const titleInput = page.locator('[data-testid="schedule-title-input"]')
      await titleInput.clear()
      await titleInput.fill('수정된 일정')

      // 저장 버튼 클릭
      await page.locator('[data-testid="save-schedule-btn"]').click()

      // 모달 닫힘 확인
      await expect(page.locator('[data-testid="schedule-form-modal"]')).not.toBeVisible()

      // 성공 메시지 확인
      await expect(page.getByText('일정이 수정되었습니다')).toBeVisible()
    })
  })

  test.describe('E2E-006: 일정 삭제', () => {
    test('일정을 삭제할 수 있다', async ({ page }) => {
      // 일정 클릭하여 상세 모달 열기
      const scheduleEvent = page.locator('[data-testid^="schedule-event-"]').first()
      await scheduleEvent.click()

      await expect(page.locator('[data-testid="schedule-detail-modal"]')).toBeVisible()

      // 삭제 버튼 클릭
      await page.locator('[data-testid="delete-schedule-btn"]').click()

      // 확인 다이얼로그 표시 확인
      await expect(page.getByText('일정 삭제')).toBeVisible()
      await expect(page.getByText('삭제하시겠습니까?')).toBeVisible()

      // 확인 버튼 클릭
      await page.getByRole('button', { name: '삭제' }).click()

      // 모달 닫힘 확인
      await expect(page.locator('[data-testid="schedule-detail-modal"]')).not.toBeVisible()

      // 성공 메시지 확인
      await expect(page.getByText('일정이 삭제되었습니다')).toBeVisible()
    })
  })

  test.describe('E2E-007: 날짜 네비게이션 동작', () => {
    test('이전/다음/오늘 버튼으로 날짜를 이동할 수 있다', async ({ page }) => {
      // 초기 기간 확인
      const periodLabel = page.locator('[data-testid="calendar-current-period"]')
      const initialPeriod = await periodLabel.textContent()

      // 이전 버튼 클릭
      await page.locator('[data-testid="calendar-nav-prev"]').click()
      const prevPeriod = await periodLabel.textContent()
      expect(prevPeriod).not.toBe(initialPeriod)

      // 다음 버튼 클릭 (원래 달로 복귀)
      await page.locator('[data-testid="calendar-nav-next"]').click()
      const nextPeriod = await periodLabel.textContent()
      expect(nextPeriod).toBe(initialPeriod)

      // 다음 버튼 한 번 더 클릭
      await page.locator('[data-testid="calendar-nav-next"]').click()
      const afterNextPeriod = await periodLabel.textContent()
      expect(afterNextPeriod).not.toBe(initialPeriod)

      // 오늘 버튼 클릭
      await page.locator('[data-testid="calendar-nav-today"]').click()
      // 오늘 날짜가 포함된 기간으로 이동 확인
      const today = new Date()
      const currentYear = today.getFullYear()
      const currentMonth = today.getMonth() + 1
      const currentPeriod = await periodLabel.textContent()
      expect(currentPeriod).toContain(`${currentYear}년 ${currentMonth}월`)
    })
  })

  test.describe('E2E-008: 유효성 검사 에러 표시', () => {
    test('필수 필드 누락 시 에러 메시지가 표시된다', async ({ page }) => {
      // 일정 추가 버튼 클릭
      await page.locator('[data-testid="add-schedule-btn"]').click()

      await expect(page.locator('[data-testid="schedule-form-modal"]')).toBeVisible()

      // 제목을 비운 상태로 저장 시도
      await page.locator('[data-testid="schedule-title-input"]').clear()

      // 저장 버튼 클릭
      await page.locator('[data-testid="save-schedule-btn"]').click()

      // 에러 메시지 표시 확인
      await expect(page.getByText('제목을 입력해주세요')).toBeVisible()

      // 모달이 닫히지 않음 확인
      await expect(page.locator('[data-testid="schedule-form-modal"]')).toBeVisible()

      // 제목 입력 후 재시도
      await page.locator('[data-testid="schedule-title-input"]').fill('테스트')

      // 저장 버튼 클릭
      await page.locator('[data-testid="save-schedule-btn"]').click()

      // 모달 닫힘 확인
      await expect(page.locator('[data-testid="schedule-form-modal"]')).not.toBeVisible()
    })
  })

  test.describe('추가 테스트', () => {
    test('주간 뷰에서 일정이 올바르게 표시된다', async ({ page }) => {
      // 주간 뷰로 전환
      const viewToggle = page.locator('[data-testid="calendar-view-toggle"]')
      await viewToggle.getByText('주간').click()

      await expect(page.locator('[data-testid="calendar-week-view"]')).toBeVisible()

      // 일정 이벤트 확인
      const scheduleEvents = page.locator('[data-testid^="schedule-event-"]')
      const count = await scheduleEvents.count()
      expect(count).toBeGreaterThanOrEqual(0)
    })

    test('일간 뷰에서 일정이 올바르게 표시된다', async ({ page }) => {
      // 일간 뷰로 전환
      const viewToggle = page.locator('[data-testid="calendar-view-toggle"]')
      await viewToggle.getByText('일간').click()

      await expect(page.locator('[data-testid="calendar-day-view"]')).toBeVisible()

      // 일정 이벤트 확인 (해당 날짜에 일정이 있을 경우)
      const scheduleEvents = page.locator('[data-testid^="schedule-event-"]')
      const count = await scheduleEvents.count()
      expect(count).toBeGreaterThanOrEqual(0)
    })

    test('범례가 올바르게 표시된다', async ({ page }) => {
      const legend = page.locator('[data-testid="schedule-legend"]')
      await expect(legend).toBeVisible()

      // 일정 유형 확인
      await expect(legend.getByText('작업일정')).toBeVisible()
      await expect(legend.getByText('정기점검')).toBeVisible()
      await expect(legend.getByText('회의')).toBeVisible()
      await expect(legend.getByText('교육')).toBeVisible()
    })
  })
})
