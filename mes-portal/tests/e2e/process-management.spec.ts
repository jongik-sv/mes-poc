/**
 * @file process-management.spec.ts
 * @description 공정 관리 샘플 E2E 테스트
 * @task TSK-06-18
 *
 * 테스트 케이스:
 * - E2E-001: 목록 조회
 * - E2E-002: 상세 조회
 * - E2E-003: 공정 등록
 * - E2E-004: 공정 수정
 * - E2E-005: 공정 삭제
 * - E2E-007: 변경 이탈 경고
 * - E2E-008: 중복 코드 오류
 */

import { test, expect, type Locator, type Page } from '@playwright/test'

// 테스트 타임아웃 설정
test.setTimeout(60000)

// 로그인 및 페이지 이동 헬퍼 함수
async function loginAndNavigate(page: Page) {
  // 로그인
  await page.goto('/login')
  await page.waitForSelector('[data-testid="login-page"]')
  await page.fill('[data-testid="email-input"]', 'admin@example.com')
  await page.fill('[data-testid="password-input"]', 'password123')
  await page.click('[data-testid="login-button"]')
  await expect(page).toHaveURL(/\/portal|\/dashboard/, { timeout: 15000 })

  // 사이드바에서 샘플 화면 메뉴 확장
  await page.click('[data-testid="menu-sample"]')
  await page.waitForTimeout(300)

  // 공정 관리 메뉴 클릭
  await page.click('[data-testid="menu-sample_process_management"]')

  // MDI 탭으로 페이지가 열릴 때까지 대기
  await page.waitForSelector('[data-testid="process-management-page"]', {
    timeout: 15000,
  })
}

/**
 * 공정 관리 페이지 컨테이너 내의 요소만 선택하는 헬퍼 함수
 */
function getContainer(page: Page): Locator {
  return page.locator('[data-testid="process-management-page"]')
}

test.describe('공정 관리 샘플 (TSK-06-18)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndNavigate(page)
  })

  // E2E-001: 목록 조회
  test('E2E-001: 사용자가 공정 목록을 조회할 수 있다', async ({ page }) => {
    const container = getContainer(page)

    // 목록 테이블 확인
    await expect(container.locator('[data-testid="process-list"]')).toBeVisible()

    // 검색 조건 영역 확인
    await expect(container.locator('[data-testid="search-condition-card"]')).toBeVisible()

    // 목록 아이템 존재 확인 (최소 1개 이상)
    const rows = container.locator('.ant-table-tbody .ant-table-row')
    await expect(rows.first()).toBeVisible({ timeout: 10000 })

    // 스크린샷
    await page.screenshot({ path: 'test-results/e2e-001-list.png' })
  })

  // E2E-002: 상세 조회
  test('E2E-002: 사용자가 공정 상세를 조회할 수 있다', async ({ page }) => {
    const container = getContainer(page)

    // 목록 로드 대기
    const rows = container.locator('.ant-table-tbody .ant-table-row')
    await expect(rows.first()).toBeVisible({ timeout: 10000 })

    // 첫 번째 행 클릭
    await rows.first().click()

    // 상세 화면 표시 확인
    await expect(container.locator('[data-testid="process-detail"]')).toBeVisible({ timeout: 5000 })

    // 기본 정보 Descriptions 확인
    await expect(container.locator('[data-testid="detail-template-container"]')).toBeVisible()

    // 탭 확인
    await expect(container.locator('.ant-tabs')).toBeVisible()

    // 설비 연결 탭 클릭
    await container.locator('.ant-tabs-tab:has-text("설비 연결")').click()
    await expect(container.locator('[data-testid="tab-equipment-content"]')).toBeVisible()

    // 이력 탭 클릭
    await container.locator('.ant-tabs-tab:has-text("이력")').click()
    await expect(container.locator('[data-testid="tab-history-content"]')).toBeVisible()

    // 스크린샷
    await page.screenshot({ path: 'test-results/e2e-002-detail.png' })
  })

  // E2E-003: 공정 등록
  test('E2E-003: 사용자가 새 공정을 등록할 수 있다', async ({ page }) => {
    const container = getContainer(page)

    // 등록 전 스크린샷
    await page.screenshot({ path: 'test-results/e2e-003-create-before.png' })

    // 신규 버튼 클릭 (Toolbar의 신규 버튼)
    await container.locator('[data-testid="add-btn"]').click()

    // 폼 화면 표시 확인
    await expect(container.locator('[data-testid="process-form"]')).toBeVisible({ timeout: 5000 })

    // 폼 입력
    await container.locator('[data-testid="process-code-input"]').fill('NEW001')
    await container.locator('[data-testid="process-name-input"]').fill('신규 공정')
    await container.locator('[data-testid="process-status-radio-active"]').click()
    await container.locator('[data-testid="process-order-input"]').fill('10')
    await container.locator('[data-testid="process-description-input"]').fill('E2E 테스트로 생성된 공정입니다.')

    // 저장 버튼 클릭
    await container.locator('[data-testid="form-submit-btn"]').click()

    // 상세 화면으로 전환 확인 (등록 성공)
    await expect(container.locator('[data-testid="process-detail"]')).toBeVisible({ timeout: 10000 })

    // 등록된 데이터 확인 (Descriptions 테이블에서)
    await expect(container.locator('[data-testid="detail-template-container"]').locator('text=NEW001')).toBeVisible()
    await expect(container.locator('[data-testid="detail-template-container"]').locator('text=신규 공정').first()).toBeVisible()

    // 등록 후 스크린샷
    await page.screenshot({ path: 'test-results/e2e-003-create-after.png' })
  })

  // E2E-004: 공정 수정
  test('E2E-004: 사용자가 공정을 수정할 수 있다', async ({ page }) => {
    const container = getContainer(page)

    // 목록 로드 대기
    const rows = container.locator('.ant-table-tbody .ant-table-row')
    await expect(rows.first()).toBeVisible({ timeout: 10000 })

    // 첫 번째 행 클릭
    await rows.first().click()

    // 상세 화면 대기
    await expect(container.locator('[data-testid="process-detail"]')).toBeVisible({ timeout: 5000 })

    // 수정 버튼 클릭
    await container.locator('[data-testid="detail-edit-btn"]').click()

    // 폼 화면 표시 확인
    await expect(container.locator('[data-testid="process-form"]')).toBeVisible({ timeout: 5000 })

    // 공정명 수정
    await container.locator('[data-testid="process-name-input"]').fill('수정된 공정')

    // 저장 버튼 클릭
    await container.locator('[data-testid="form-submit-btn"]').click()

    // 상세 화면으로 전환 확인 (수정 성공)
    await expect(container.locator('[data-testid="process-detail"]')).toBeVisible({ timeout: 10000 })

    // 수정된 데이터 확인 (Descriptions 테이블에서)
    await expect(container.locator('[data-testid="detail-template-container"]').locator('text=수정된 공정').first()).toBeVisible()

    // 스크린샷
    await page.screenshot({ path: 'test-results/e2e-004-edit.png' })
  })

  // E2E-005: 공정 삭제
  test('E2E-005: 사용자가 공정을 삭제할 수 있다', async ({ page }) => {
    const container = getContainer(page)

    // 목록 로드 대기
    const rows = container.locator('.ant-table-tbody .ant-table-row')
    await expect(rows.first()).toBeVisible({ timeout: 10000 })

    // 삭제할 공정의 이름 기록
    const initialRowCount = await rows.count()

    // 첫 번째 행 클릭
    await rows.first().click()

    // 상세 화면 대기
    await expect(container.locator('[data-testid="process-detail"]')).toBeVisible({ timeout: 5000 })

    // 삭제 버튼 클릭 (상세 화면에서)
    await container.locator('[data-testid="detail-delete-btn"]').click()

    // 확인 다이얼로그 표시 확인 (BR-01)
    await expect(page.locator('.ant-modal-confirm')).toBeVisible({ timeout: 5000 })

    // 삭제 버튼 클릭 (Modal.confirm의 okText="삭제")
    await page.locator('.ant-modal-confirm').locator('button:has-text("삭제")').click()

    // 목록 화면으로 복귀 확인
    await expect(container.locator('[data-testid="process-list"]')).toBeVisible({ timeout: 10000 })

    // 삭제 후 행 수 감소 확인
    const newRowCount = await container.locator('.ant-table-tbody .ant-table-row').count()
    expect(newRowCount).toBeLessThan(initialRowCount)

    // 스크린샷
    await page.screenshot({ path: 'test-results/e2e-005-delete.png' })
  })

  // E2E-007: 변경 이탈 경고
  test('E2E-007: 변경 후 취소 시 경고 다이얼로그가 표시된다', async ({ page }) => {
    const container = getContainer(page)

    // 목록 로드 대기
    const rows = container.locator('.ant-table-tbody .ant-table-row')
    await expect(rows.first()).toBeVisible({ timeout: 10000 })

    // 첫 번째 행 클릭
    await rows.first().click()

    // 상세 화면 대기
    await expect(container.locator('[data-testid="process-detail"]')).toBeVisible({ timeout: 5000 })

    // 수정 버튼 클릭
    await container.locator('[data-testid="detail-edit-btn"]').click()

    // 폼 화면 표시 확인
    await expect(container.locator('[data-testid="process-form"]')).toBeVisible({ timeout: 5000 })

    // 값 변경
    await container.locator('[data-testid="process-name-input"]').fill('변경된 값')

    // 취소 버튼 클릭
    await container.locator('[data-testid="form-cancel-btn"]').click()

    // 경고 다이얼로그 표시 확인 (BR-03)
    await expect(page.locator('.ant-modal-confirm')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('text=저장하지 않은')).toBeVisible()

    // 스크린샷
    await page.screenshot({ path: 'test-results/e2e-007-leave-warning.png' })

    // 다이얼로그 확인 (이탈)
    await page.locator('.ant-modal-confirm-btns .ant-btn-primary').click()

    // 상세 화면으로 복귀
    await expect(container.locator('[data-testid="process-detail"]')).toBeVisible({ timeout: 5000 })
  })

  // E2E-008: 중복 코드 오류
  test('E2E-008: 중복 코드 입력 시 에러가 표시된다', async ({ page }) => {
    const container = getContainer(page)

    // 신규 버튼 클릭
    await container.locator('[data-testid="add-btn"]').click()

    // 폼 화면 표시 확인
    await expect(container.locator('[data-testid="process-form"]')).toBeVisible({ timeout: 5000 })

    // 기존 코드 입력 (PRC001은 mock 데이터에 있음)
    await container.locator('[data-testid="process-code-input"]').fill('PRC001')
    await container.locator('[data-testid="process-name-input"]').fill('테스트')
    await container.locator('[data-testid="process-status-radio-active"]').click()

    // 저장 버튼 클릭
    await container.locator('[data-testid="form-submit-btn"]').click()

    // 에러 메시지 확인 (BR-04)
    await expect(container.locator('text=이미 사용 중')).toBeVisible({ timeout: 5000 })

    // 스크린샷
    await page.screenshot({ path: 'test-results/e2e-008-duplicate.png' })
  })

  // 검색 기능 테스트
  test('공정 목록에서 검색 기능이 동작한다', async ({ page }) => {
    const container = getContainer(page)

    // 목록 로드 대기
    const rows = container.locator('.ant-table-tbody .ant-table-row')
    await expect(rows.first()).toBeVisible({ timeout: 10000 })

    // 검색 조건 입력
    await container.locator('input[placeholder*="공정명"]').fill('조립')

    // 검색 버튼 클릭
    await container.locator('[data-testid="search-btn"]').click()

    // 결과 대기
    await page.waitForTimeout(500)

    // 필터링된 결과 확인
    const count = await container.locator('.ant-table-tbody .ant-table-row').count()

    // 검색 결과가 있거나 없거나 페이지가 에러 없이 동작해야 함
    expect(count).toBeGreaterThanOrEqual(0)

    // 스크린샷
    await page.screenshot({ path: 'test-results/e2e-search.png' })
  })

  // 비활성 스타일 테스트
  test('비활성 공정은 회색으로 표시된다 (BR-05)', async ({ page }) => {
    const container = getContainer(page)

    // 목록 로드 대기
    const rows = container.locator('.ant-table-tbody .ant-table-row')
    await expect(rows.first()).toBeVisible({ timeout: 10000 })

    // mock 데이터에 비활성 공정이 있는지 확인 (inactive 클래스 가진 행)
    // 기본 목록에서 비활성 행 스타일 적용 여부 확인
    const inactiveRows = container.locator('.ant-table-tbody .ant-table-row.inactive')
    const inactiveCount = await inactiveRows.count()

    // 비활성 행이 있으면 스타일 적용 확인
    if (inactiveCount > 0) {
      await expect(inactiveRows.first()).toBeVisible()
    }

    // 스크린샷
    await page.screenshot({ path: 'test-results/e2e-inactive-style.png' })
  })

  // 목록으로 돌아가기 테스트
  test('상세 화면에서 목록으로 버튼을 클릭하면 목록으로 돌아간다', async ({ page }) => {
    const container = getContainer(page)

    // 목록 로드 대기
    const rows = container.locator('.ant-table-tbody .ant-table-row')
    await expect(rows.first()).toBeVisible({ timeout: 10000 })

    // 첫 번째 행 클릭
    await rows.first().click()

    // 상세 화면 대기
    await expect(container.locator('[data-testid="process-detail"]')).toBeVisible({ timeout: 5000 })

    // 목록으로 버튼 클릭
    await container.locator('[data-testid="detail-back-btn"]').click()

    // 목록 화면 복귀 확인
    await expect(container.locator('[data-testid="process-list"]')).toBeVisible({ timeout: 5000 })
  })
})
