# 테스트 명세서 (026-test-specification.md)

**Template Version:** 1.0.0 — **Last Updated:** 2026-01-21

> **목적**: 단위 테스트, E2E 테스트, 매뉴얼 테스트 시나리오 및 테스트 데이터 정의
>
> **참조**: 이 문서는 `010-design.md`와 `025-traceability-matrix.md`와 함께 사용됩니다.
>
> **활용 단계**: `/wf:build`, `/wf:test` 단계에서 테스트 코드 생성 기준으로 사용

---

## 0. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| Task ID | TSK-06-09 |
| Task명 | [샘플] 설정 마법사 |
| 설계 문서 참조 | `010-design.md` |
| 추적성 매트릭스 참조 | `025-traceability-matrix.md` |
| 작성일 | 2026-01-21 |
| 작성자 | Claude |

---

## 1. 테스트 전략 개요

### 1.1 테스트 범위

| 테스트 유형 | 범위 | 목표 커버리지 |
|------------|------|--------------|
| 단위 테스트 | SettingWizard 컴포넌트, 폼 유효성 검사 | 80% 이상 |
| E2E 테스트 | 마법사 전체 플로우 (4단계 진행) | 100% 시나리오 커버 |
| 매뉴얼 테스트 | UI/UX, 접근성, 반응형 | 전체 화면 |

### 1.2 테스트 환경

| 항목 | 내용 |
|------|------|
| 테스트 프레임워크 (단위) | Vitest |
| 테스트 프레임워크 (E2E) | Playwright |
| Mock 데이터 | `mock-data/wizard-config.json` |
| 브라우저 | Chromium (기본) |
| 베이스 URL | `http://localhost:3000` |

---

## 2. 단위 테스트 시나리오

### 2.1 테스트 케이스 목록

| 테스트 ID | 대상 | 시나리오 | 예상 결과 | 요구사항 |
|-----------|------|----------|----------|----------|
| UT-001 | BasicInfoStep | 회사명 정상 입력 | 입력값 저장 | FR-001 |
| UT-002 | BasicInfoStep | 회사명 필수 검사 | 에러 메시지 표시 | FR-001 |
| UT-003 | DetailSettingsStep | 서버 주소 정상 입력 | 입력값 저장 | FR-002 |
| UT-004 | DetailSettingsStep | 포트 범위 검사 | 범위 외 에러 표시 | FR-002 |
| UT-005 | Confirmation | 데이터 요약 표시 | 모든 입력값 표시 | FR-003 |
| UT-006 | Result | 완료 메시지 표시 | 성공 메시지 렌더링 | FR-004 |
| UT-007 | SettingWizard | 단계 순차 진행 | currentStep 증가 | FR-005, BR-001 |
| UT-008 | BasicInfoStep | 이메일 형식 검사 | 형식 에러 표시 | FR-006, BR-002 |
| UT-009 | DetailSettingsStep | 필수 필드 검사 | 에러 시 이동 차단 | FR-006, BR-002 |
| UT-010 | SettingWizard | 이전 단계 데이터 유지 | 기존 데이터 복원 | FR-007, BR-003 |
| UT-011 | WizardSteps | 미완료 단계 클릭 | 무시됨 | BR-004 |
| UT-012 | SettingWizard | 취소 시 확인 다이얼로그 | 다이얼로그 표시 | BR-005 |

### 2.2 테스트 케이스 상세

#### UT-001: BasicInfoStep 회사명 정상 입력

| 항목 | 내용 |
|------|------|
| **파일** | `components/screens/sample/SettingWizard/__tests__/BasicInfoStep.test.tsx` |
| **테스트 블록** | `describe('BasicInfoStep') → describe('회사명 입력') → it('should save company name')` |
| **Mock 의존성** | WizardContext mock |
| **입력 데이터** | `{ companyName: 'ABC 제조' }` |
| **검증 포인트** | setStepData가 올바른 값으로 호출됨 |
| **커버리지 대상** | BasicInfoStep 컴포넌트 |
| **관련 요구사항** | FR-001 |

#### UT-002: BasicInfoStep 회사명 필수 검사

| 항목 | 내용 |
|------|------|
| **파일** | `components/screens/sample/SettingWizard/__tests__/BasicInfoStep.test.tsx` |
| **테스트 블록** | `describe('BasicInfoStep') → describe('유효성 검사') → it('should show error for empty company name')` |
| **Mock 의존성** | Form mock |
| **입력 데이터** | `{ companyName: '' }` |
| **검증 포인트** | Form.Item에 에러 상태, "회사명을 입력해주세요" 메시지 |
| **커버리지 대상** | BasicInfoStep 유효성 검사 |
| **관련 요구사항** | FR-001 |

#### UT-003: DetailSettingsStep 서버 주소 정상 입력

| 항목 | 내용 |
|------|------|
| **파일** | `components/screens/sample/SettingWizard/__tests__/DetailSettingsStep.test.tsx` |
| **테스트 블록** | `describe('DetailSettingsStep') → describe('서버 주소') → it('should save server address')` |
| **Mock 의존성** | WizardContext mock |
| **입력 데이터** | `{ serverAddress: '192.168.1.100' }` |
| **검증 포인트** | setStepData가 올바른 값으로 호출됨 |
| **커버리지 대상** | DetailSettingsStep 컴포넌트 |
| **관련 요구사항** | FR-002 |

#### UT-004: DetailSettingsStep 포트 범위 검사

| 항목 | 내용 |
|------|------|
| **파일** | `components/screens/sample/SettingWizard/__tests__/DetailSettingsStep.test.tsx` |
| **테스트 블록** | `describe('DetailSettingsStep') → describe('포트 번호') → it('should show error for invalid port')` |
| **Mock 의존성** | Form mock |
| **입력 데이터** | `{ port: 70000 }` |
| **검증 포인트** | "1-65535 사이의 숫자를 입력해주세요" 에러 메시지 |
| **커버리지 대상** | DetailSettingsStep 유효성 검사 |
| **관련 요구사항** | FR-002 |

#### UT-005: Confirmation 데이터 요약 표시

| 항목 | 내용 |
|------|------|
| **파일** | `components/screens/sample/SettingWizard/__tests__/SettingWizard.test.tsx` |
| **테스트 블록** | `describe('SettingWizard') → describe('확인 단계') → it('should display all data summary')` |
| **Mock 의존성** | WizardContext with data |
| **입력 데이터** | 전체 설정 데이터 |
| **검증 포인트** | Descriptions에 모든 필드 값 표시 |
| **커버리지 대상** | renderConfirmation 함수 |
| **관련 요구사항** | FR-003 |

#### UT-006: Result 완료 메시지 표시

| 항목 | 내용 |
|------|------|
| **파일** | `components/screens/sample/SettingWizard/__tests__/SettingWizard.test.tsx` |
| **테스트 블록** | `describe('SettingWizard') → describe('완료 단계') → it('should display success message')` |
| **Mock 의존성** | - |
| **입력 데이터** | - |
| **검증 포인트** | Result status="success", "설정이 완료되었습니다!" 텍스트 |
| **커버리지 대상** | 완료 단계 렌더링 |
| **관련 요구사항** | FR-004 |

#### UT-007: SettingWizard 단계 순차 진행

| 항목 | 내용 |
|------|------|
| **파일** | `components/screens/sample/SettingWizard/__tests__/SettingWizard.test.tsx` |
| **테스트 블록** | `describe('SettingWizard') → describe('단계 진행') → it('should advance to next step')` |
| **Mock 의존성** | WizardContext |
| **입력 데이터** | 유효한 1단계 데이터 |
| **검증 포인트** | 다음 버튼 클릭 후 currentStep이 1로 증가 |
| **커버리지 대상** | goNext 함수 |
| **관련 요구사항** | FR-005, BR-001 |

#### UT-008: BasicInfoStep 이메일 형식 검사

| 항목 | 내용 |
|------|------|
| **파일** | `components/screens/sample/SettingWizard/__tests__/BasicInfoStep.test.tsx` |
| **테스트 블록** | `describe('BasicInfoStep') → describe('이메일') → it('should show error for invalid email')` |
| **Mock 의존성** | Form mock |
| **입력 데이터** | `{ adminEmail: 'invalid-email' }` |
| **검증 포인트** | "올바른 이메일 형식이 아닙니다" 에러 메시지 |
| **커버리지 대상** | 이메일 유효성 검사 규칙 |
| **관련 요구사항** | FR-006, BR-002 |

#### UT-009: DetailSettingsStep 필수 필드 검사

| 항목 | 내용 |
|------|------|
| **파일** | `components/screens/sample/SettingWizard/__tests__/DetailSettingsStep.test.tsx` |
| **테스트 블록** | `describe('DetailSettingsStep') → describe('유효성') → it('should block next on validation fail')` |
| **Mock 의존성** | WizardContext |
| **입력 데이터** | `{ serverAddress: '', port: null }` |
| **검증 포인트** | goNext가 호출되지 않음, 에러 메시지 표시 |
| **커버리지 대상** | validate 함수 |
| **관련 요구사항** | FR-006, BR-002 |

#### UT-010: SettingWizard 이전 단계 데이터 유지

| 항목 | 내용 |
|------|------|
| **파일** | `components/screens/sample/SettingWizard/__tests__/SettingWizard.test.tsx` |
| **테스트 블록** | `describe('SettingWizard') → describe('네비게이션') → it('should preserve data on prev')` |
| **Mock 의존성** | WizardContext with data |
| **입력 데이터** | 1~2단계 데이터 |
| **검증 포인트** | 이전 버튼 클릭 후 1단계로 이동, 데이터 유지 |
| **커버리지 대상** | goPrev 함수, 데이터 상태 |
| **관련 요구사항** | FR-007, BR-003 |

#### UT-011: WizardSteps 미완료 단계 클릭

| 항목 | 내용 |
|------|------|
| **파일** | `components/screens/sample/SettingWizard/__tests__/SettingWizard.test.tsx` |
| **테스트 블록** | `describe('WizardSteps') → it('should ignore click on incomplete step')` |
| **Mock 의존성** | WizardContext (step 0) |
| **입력 데이터** | - |
| **검증 포인트** | 2단계 클릭 시 currentStep이 0 유지 |
| **커버리지 대상** | Steps onClick 핸들러 |
| **관련 요구사항** | BR-004 |

#### UT-012: SettingWizard 취소 시 확인 다이얼로그

| 항목 | 내용 |
|------|------|
| **파일** | `components/screens/sample/SettingWizard/__tests__/SettingWizard.test.tsx` |
| **테스트 블록** | `describe('SettingWizard') → describe('취소') → it('should show confirm dialog')` |
| **Mock 의존성** | Modal.confirm mock |
| **입력 데이터** | 입력 데이터 있는 상태 |
| **검증 포인트** | 취소 버튼 클릭 시 Modal.confirm 호출 |
| **커버리지 대상** | 취소 핸들러 |
| **관련 요구사항** | BR-005 |

---

## 3. E2E 테스트 시나리오

### 3.1 테스트 케이스 목록

| 테스트 ID | 시나리오 | 사전조건 | 실행 단계 | 예상 결과 | 요구사항 |
|-----------|----------|----------|----------|----------|----------|
| E2E-001 | 1단계 기본정보 입력 | 마법사 진입 | 필드 입력 → 다음 | 2단계 이동 | FR-001 |
| E2E-002 | 2단계 상세설정 입력 | 1단계 완료 | 필드 입력 → 다음 | 3단계 이동 | FR-002 |
| E2E-003 | 3단계 확인 화면 | 2단계 완료 | 요약 확인 | 데이터 표시 | FR-003 |
| E2E-004 | 4단계 완료 화면 | 3단계 완료 | 완료 클릭 | 성공 메시지 | FR-004 |
| E2E-005 | 전체 플로우 완료 | 마법사 진입 | 4단계 전체 | 완료 화면 | FR-005, BR-001 |
| E2E-006 | 유효성 검사 실패 | 마법사 진입 | 빈 필드로 다음 | 에러 표시 | FR-006, BR-002 |
| E2E-007 | 이전 단계 이동 | 2단계 | 이전 클릭 | 1단계 이동, 데이터 유지 | FR-007, BR-003 |
| E2E-008 | Steps 클릭 이동 | 3단계 | 1단계 클릭 | 1단계 이동 | BR-004 |
| E2E-009 | 마법사 취소 | 2단계 | 취소 클릭 | 확인 다이얼로그 | BR-005 |

### 3.2 테스트 케이스 상세

#### E2E-001: 1단계 기본정보 입력

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/sample/setting-wizard.spec.ts` |
| **테스트명** | `test('사용자가 기본정보를 입력하고 다음으로 진행할 수 있다')` |
| **사전조건** | 설정 마법사 페이지 접근 |
| **data-testid 셀렉터** | |
| - 페이지 컨테이너 | `[data-testid="setting-wizard-page"]` |
| - 회사명 입력 | `[data-testid="company-name-input"]` |
| - 공장명 입력 | `[data-testid="factory-name-input"]` |
| - 이메일 입력 | `[data-testid="admin-email-input"]` |
| - 다음 버튼 | `[data-testid="wizard-next-btn"]` |
| **실행 단계** | |
| 1 | `await page.goto('/sample/setting-wizard')` |
| 2 | `await page.fill('[data-testid="company-name-input"]', 'ABC 제조')` |
| 3 | `await page.fill('[data-testid="factory-name-input"]', '1공장')` |
| 4 | `await page.fill('[data-testid="admin-email-input"]', 'admin@abc.com')` |
| 5 | `await page.click('[data-testid="wizard-next-btn"]')` |
| **검증 포인트** | `expect(page.locator('[data-testid="wizard-step-detail-settings"]')).toHaveAttribute('aria-current', 'step')` |
| **스크린샷** | `e2e-001-basic-info.png` |
| **관련 요구사항** | FR-001 |

#### E2E-002: 2단계 상세설정 입력

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/sample/setting-wizard.spec.ts` |
| **테스트명** | `test('사용자가 상세설정을 입력하고 다음으로 진행할 수 있다')` |
| **사전조건** | 1단계 완료 |
| **data-testid 셀렉터** | |
| - 서버 주소 입력 | `[data-testid="server-address-input"]` |
| - 포트 입력 | `[data-testid="port-input"]` |
| - 타임아웃 입력 | `[data-testid="timeout-input"]` |
| - 자동 재연결 | `[data-testid="auto-reconnect-checkbox"]` |
| **실행 단계** | |
| 1 | 1단계 완료 후 |
| 2 | `await page.fill('[data-testid="server-address-input"]', '192.168.1.100')` |
| 3 | `await page.fill('[data-testid="port-input"]', '8080')` |
| 4 | `await page.fill('[data-testid="timeout-input"]', '30')` |
| 5 | `await page.check('[data-testid="auto-reconnect-checkbox"]')` |
| 6 | `await page.click('[data-testid="wizard-next-btn"]')` |
| **검증 포인트** | `expect(page.locator('[data-testid="wizard-step-confirmation"]')).toHaveAttribute('aria-current', 'step')` |
| **스크린샷** | `e2e-002-detail-settings.png` |
| **관련 요구사항** | FR-002 |

#### E2E-003: 3단계 확인 화면

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/sample/setting-wizard.spec.ts` |
| **테스트명** | `test('확인 화면에 모든 입력 데이터가 표시된다')` |
| **사전조건** | 2단계 완료 |
| **data-testid 셀렉터** | |
| - 확인 영역 | `[data-testid="wizard-confirmation"]` |
| **검증 포인트** | |
| 1 | `expect(page.locator('[data-testid="wizard-confirmation"]')).toContainText('ABC 제조')` |
| 2 | `expect(page.locator('[data-testid="wizard-confirmation"]')).toContainText('1공장')` |
| 3 | `expect(page.locator('[data-testid="wizard-confirmation"]')).toContainText('192.168.1.100')` |
| **스크린샷** | `e2e-003-confirmation.png` |
| **관련 요구사항** | FR-003 |

#### E2E-004: 4단계 완료 화면

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/sample/setting-wizard.spec.ts` |
| **테스트명** | `test('완료 후 성공 메시지가 표시된다')` |
| **사전조건** | 3단계 완료 |
| **data-testid 셀렉터** | |
| - 완료 버튼 | `[data-testid="wizard-finish-btn"]` |
| - 결과 영역 | `[data-testid="wizard-result"]` |
| **실행 단계** | |
| 1 | `await page.click('[data-testid="wizard-finish-btn"]')` |
| 2 | `await page.waitForSelector('[data-testid="wizard-result"]')` |
| **검증 포인트** | `expect(page.locator('[data-testid="wizard-result"]')).toContainText('설정이 완료되었습니다')` |
| **스크린샷** | `e2e-004-complete.png` |
| **관련 요구사항** | FR-004 |

#### E2E-005: 전체 플로우 완료

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/sample/setting-wizard.spec.ts` |
| **테스트명** | `test('사용자가 4단계 마법사를 완료할 수 있다')` |
| **사전조건** | 마법사 진입 |
| **실행 단계** | E2E-001 ~ E2E-004 통합 |
| **검증 포인트** | 모든 단계 완료 후 성공 화면 |
| **스크린샷** | `e2e-005-full-flow.png` |
| **관련 요구사항** | FR-005, BR-001 |

#### E2E-006: 유효성 검사 실패

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/sample/setting-wizard.spec.ts` |
| **테스트명** | `test('필수 필드 누락 시 에러 메시지가 표시된다')` |
| **사전조건** | 마법사 진입 |
| **data-testid 셀렉터** | |
| - 에러 메시지 | `[data-testid="company-name-input"] + .ant-form-item-explain-error` |
| **실행 단계** | |
| 1 | `await page.goto('/sample/setting-wizard')` |
| 2 | `await page.click('[data-testid="wizard-next-btn"]')` |
| **검증 포인트** | `expect(page.locator('.ant-form-item-explain-error')).toContainText('회사명을 입력해주세요')` |
| **스크린샷** | `e2e-006-validation-error.png` |
| **관련 요구사항** | FR-006, BR-002 |

#### E2E-007: 이전 단계 이동

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/sample/setting-wizard.spec.ts` |
| **테스트명** | `test('이전 버튼으로 돌아갔을 때 데이터가 유지된다')` |
| **사전조건** | 2단계 도달 |
| **data-testid 셀렉터** | |
| - 이전 버튼 | `[data-testid="wizard-prev-btn"]` |
| **실행 단계** | |
| 1 | 1단계 데이터 입력 후 2단계 이동 |
| 2 | `await page.click('[data-testid="wizard-prev-btn"]')` |
| **검증 포인트** | `expect(page.locator('[data-testid="company-name-input"]')).toHaveValue('ABC 제조')` |
| **스크린샷** | `e2e-007-prev-data-preserved.png` |
| **관련 요구사항** | FR-007, BR-003 |

#### E2E-008: Steps 클릭 이동

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/sample/setting-wizard.spec.ts` |
| **테스트명** | `test('완료된 단계를 클릭하여 이동할 수 있다')` |
| **사전조건** | 3단계 도달 |
| **data-testid 셀렉터** | |
| - 1단계 Step | `[data-testid="wizard-step-basic-info"]` |
| **실행 단계** | |
| 1 | 3단계까지 진행 |
| 2 | `await page.click('[data-testid="wizard-step-basic-info"]')` |
| **검증 포인트** | 1단계 화면 표시, 데이터 유지 |
| **스크린샷** | `e2e-008-step-click.png` |
| **관련 요구사항** | BR-004 |

#### E2E-009: 마법사 취소

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/sample/setting-wizard.spec.ts` |
| **테스트명** | `test('취소 시 확인 다이얼로그가 표시된다')` |
| **사전조건** | 데이터 입력 상태 |
| **data-testid 셀렉터** | |
| - 취소 버튼 | `[data-testid="wizard-cancel-btn"]` |
| - 확인 다이얼로그 | `.ant-modal-confirm` |
| **실행 단계** | |
| 1 | 1단계 데이터 입력 |
| 2 | `await page.click('[data-testid="wizard-cancel-btn"]')` |
| **검증 포인트** | `expect(page.locator('.ant-modal-confirm')).toBeVisible()` |
| **스크린샷** | `e2e-009-cancel-confirm.png` |
| **관련 요구사항** | BR-005 |

---

## 4. UI 테스트케이스 (매뉴얼)

### 4.1 테스트 케이스 목록

| TC-ID | 테스트 항목 | 사전조건 | 테스트 단계 | 예상 결과 | 우선순위 | 요구사항 |
|-------|-----------|---------|-----------|----------|---------|----------|
| TC-001 | 1단계 기본정보 UI | 마법사 진입 | 화면 확인 | Steps, 폼 정상 표시 | High | FR-001 |
| TC-002 | 2단계 상세설정 UI | 1단계 완료 | 화면 확인 | 연결 정보, 옵션 표시 | High | FR-002 |
| TC-003 | 3단계 확인 UI | 2단계 완료 | 요약 확인 | Descriptions로 표시 | High | FR-003 |
| TC-004 | 4단계 완료 UI | 3단계 완료 | 결과 확인 | Result 컴포넌트 표시 | High | FR-004 |
| TC-005 | 단계 진행 | 마법사 진입 | 전체 진행 | 순차적 진행 가능 | High | FR-005 |
| TC-006 | 유효성 검사 | 1단계 | 빈 필드로 다음 | 에러 메시지 | High | FR-006 |
| TC-007 | 네비게이션 | 2단계 | 이전/다음 | 정상 이동 | Medium | FR-007 |
| TC-008 | 반응형 확인 | - | 브라우저 크기 조절 | 레이아웃 적응 | Medium | - |
| TC-009 | 키보드 접근성 | - | Tab/Enter 사용 | 모든 기능 접근 | Medium | - |
| TC-010 | 로딩 상태 | 완료 클릭 | 저장 중 | 버튼 로딩 표시 | Low | - |

### 4.2 매뉴얼 테스트 상세

#### TC-001: 1단계 기본정보 UI

**테스트 목적**: 1단계 기본정보 화면의 UI가 올바르게 표시되는지 확인

**테스트 단계**:
1. 설정 마법사 페이지 접근
2. Steps 컴포넌트 확인 (4단계, 1단계 활성)
3. 폼 필드 확인 (회사명, 공장명, 관리자 이메일)
4. 다음 버튼 확인

**예상 결과**:
- Steps에 4개 단계 표시, 1단계 "기본 정보" 활성
- 3개 필수 입력 필드 (별표 표시)
- 다음 버튼 하단 우측 위치

**검증 기준**:
- [ ] Steps 정상 렌더링
- [ ] 폼 필드 라벨 및 플레이스홀더 표시
- [ ] 필수 필드 표시 (*)
- [ ] 다음 버튼 표시

#### TC-002: 2단계 상세설정 UI

**테스트 목적**: 2단계 상세설정 화면의 UI가 올바르게 표시되는지 확인

**테스트 단계**:
1. 1단계 정상 입력 후 다음 클릭
2. Steps에서 1단계 완료, 2단계 활성 확인
3. 연결 정보 섹션 확인 (서버 주소, 포트, 타임아웃)
4. 옵션 설정 섹션 확인 (체크박스 3개)
5. 이전/다음 버튼 확인

**예상 결과**:
- Steps 1단계 체크마크, 2단계 활성
- 연결 정보: 서버 주소, 포트 번호, 타임아웃
- 옵션: 자동 재연결, 디버그 모드, SSL 사용
- 이전/다음 버튼 표시

**검증 기준**:
- [ ] Steps 상태 정확
- [ ] 연결 정보 필드 표시
- [ ] 체크박스 옵션 표시
- [ ] 이전/다음 버튼 표시

#### TC-006: 유효성 검사

**테스트 목적**: 필수 필드 누락 시 유효성 검사 에러가 표시되는지 확인

**테스트 단계**:
1. 1단계에서 모든 필드 비워둠
2. 다음 버튼 클릭
3. 에러 메시지 확인
4. 회사명만 입력 후 다음 클릭
5. 남은 에러 메시지 확인

**예상 결과**:
- 각 필수 필드에 에러 메시지 표시
- 첫 번째 에러 필드에 포커스
- 입력 후 해당 에러 사라짐

**검증 기준**:
- [ ] "회사명을 입력해주세요" 표시
- [ ] "공장명을 입력해주세요" 표시
- [ ] "관리자 이메일을 입력해주세요" 표시
- [ ] 에러 필드 빨간색 테두리
- [ ] 첫 번째 에러 필드 포커스

---

## 5. 테스트 데이터 (Fixture)

### 5.1 단위 테스트용 Mock 데이터

| 데이터 ID | 용도 | 값 |
|-----------|------|-----|
| MOCK-BASIC-INFO | 정상 기본정보 | `{ companyName: 'ABC 제조', factoryName: '1공장', adminEmail: 'admin@abc.com' }` |
| MOCK-BASIC-INFO-INVALID | 잘못된 이메일 | `{ companyName: 'ABC', factoryName: '1공장', adminEmail: 'invalid' }` |
| MOCK-DETAIL-SETTINGS | 정상 상세설정 | `{ serverAddress: '192.168.1.100', port: 8080, timeout: 30, autoReconnect: true, debugMode: false, useSSL: false }` |
| MOCK-DETAIL-SETTINGS-INVALID | 잘못된 포트 | `{ serverAddress: '', port: 70000, timeout: 30 }` |
| MOCK-FULL-DATA | 전체 설정 | basicInfo + detailSettings 조합 |

### 5.2 E2E 테스트용 시드 데이터

| 시드 ID | 용도 | 생성 방법 | 포함 데이터 |
|---------|------|----------|------------|
| SEED-E2E-BASE | 기본 E2E 환경 | mock-data/wizard-config.json | 기본값, 검증 규칙 |

### 5.3 테스트 계정

| 계정 ID | 이메일 | 비밀번호 | 역할 | 용도 |
|---------|--------|----------|------|------|
| TEST-USER | user@test.com | test1234 | USER | 일반 사용자 테스트 |
| TEST-ADMIN | admin@test.com | test1234 | ADMIN | 관리자 테스트 |

---

## 6. data-testid 목록

> 프론트엔드 컴포넌트에 적용할 `data-testid` 속성 정의

### 6.1 페이지별 셀렉터

#### 설정 마법사 페이지

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `setting-wizard-page` | 페이지 컨테이너 | 페이지 로드 확인 |
| `wizard-steps` | Steps 컴포넌트 | Steps 표시 확인 |
| `wizard-step-basic-info` | 1단계 Step | 1단계 상태 확인 |
| `wizard-step-detail-settings` | 2단계 Step | 2단계 상태 확인 |
| `wizard-step-confirmation` | 3단계 Step | 3단계 상태 확인 |
| `wizard-step-complete` | 4단계 Step | 4단계 상태 확인 |
| `wizard-content` | 콘텐츠 영역 | 콘텐츠 표시 확인 |

#### 1단계: 기본정보

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `company-name-input` | 회사명 입력 | 회사명 입력 |
| `factory-name-input` | 공장명 입력 | 공장명 입력 |
| `admin-email-input` | 이메일 입력 | 이메일 입력 |

#### 2단계: 상세설정

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `server-address-input` | 서버 주소 입력 | IP/도메인 입력 |
| `port-input` | 포트 번호 입력 | 포트 입력 |
| `timeout-input` | 타임아웃 입력 | 타임아웃 입력 |
| `auto-reconnect-checkbox` | 자동 재연결 체크박스 | 옵션 토글 |
| `debug-mode-checkbox` | 디버그 모드 체크박스 | 옵션 토글 |
| `use-ssl-checkbox` | SSL 사용 체크박스 | 옵션 토글 |

#### 3단계: 확인

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `wizard-confirmation` | 확인 영역 | 요약 데이터 확인 |
| `edit-basic-info-link` | 기본정보 수정 링크 | 1단계 이동 |
| `edit-detail-settings-link` | 상세설정 수정 링크 | 2단계 이동 |

#### 4단계: 완료

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `wizard-result` | 결과 영역 | 완료 메시지 확인 |
| `go-dashboard-btn` | 대시보드 이동 버튼 | 대시보드 이동 |
| `restart-wizard-btn` | 다시 시작 버튼 | 마법사 재시작 |

#### 네비게이션

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `wizard-prev-btn` | 이전 버튼 | 이전 단계 이동 |
| `wizard-next-btn` | 다음 버튼 | 다음 단계 이동 |
| `wizard-finish-btn` | 완료 버튼 | 마법사 완료 |
| `wizard-cancel-btn` | 취소 버튼 | 마법사 취소 |

---

## 7. 테스트 커버리지 목표

### 7.1 단위 테스트 커버리지

| 대상 | 목표 | 최소 |
|------|------|------|
| Lines | 80% | 70% |
| Branches | 75% | 65% |
| Functions | 85% | 75% |
| Statements | 80% | 70% |

### 7.2 E2E 테스트 커버리지

| 구분 | 목표 |
|------|------|
| 주요 사용자 시나리오 | 100% |
| 기능 요구사항 (FR) | 100% 커버 |
| 비즈니스 규칙 (BR) | 100% 커버 |
| 에러 케이스 | 80% 커버 |

---

## 관련 문서

- 설계: `010-design.md`
- 추적성 매트릭스: `025-traceability-matrix.md`
- 의존 Task: TSK-06-06 (`마법사(Wizard) 화면 템플릿`)

---

<!--
author: Claude
Template Version History:
- v1.0.0 (2026-01-21): TSK-06-09 설정 마법사 샘플 테스트 명세서 작성
-->
