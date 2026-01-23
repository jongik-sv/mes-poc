# 테스트 명세서 (026-test-specification.md)

**Template Version:** 1.0.0 — **Last Updated:** 2026-01-23

> **목적**: 단위 테스트, E2E 테스트, 매뉴얼 테스트 시나리오 및 테스트 데이터 정의
>
> **참조**: 이 문서는 `010-design.md`와 `025-traceability-matrix.md`와 함께 사용됩니다.
>
> **활용 단계**: `/wf:build`, `/wf:test` 단계에서 테스트 코드 생성 기준으로 사용

---

## 0. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| Task ID | TSK-06-19 |
| Task명 | [샘플] 알림 설정 관리 |
| 설계 참조 | `010-design.md` |
| 추적성 매트릭스 참조 | `025-traceability-matrix.md` |
| 작성일 | 2026-01-23 |
| 작성자 | Claude |

---

## 1. 테스트 전략 개요

### 1.1 테스트 범위

| 테스트 유형 | 범위 | 목표 커버리지 |
|------------|------|--------------|
| 단위 테스트 | 컴포넌트 렌더링, 이벤트 핸들러, 상태 관리 | 80% 이상 |
| E2E 테스트 | 주요 사용자 시나리오 (설정 변경, 저장, 복원) | 100% 시나리오 커버 |
| 매뉴얼 테스트 | UI/UX, 접근성, 반응형 | 전체 화면 |

### 1.2 테스트 환경

| 항목 | 내용 |
|------|------|
| 테스트 프레임워크 (단위) | Vitest + @testing-library/react |
| 테스트 프레임워크 (E2E) | Playwright |
| 테스트 데이터 | Mock JSON (notification-settings.json) |
| 브라우저 | Chromium (기본) |
| 베이스 URL | `http://localhost:3000` |

---

## 2. 단위 테스트 시나리오

### 2.1 테스트 케이스 목록

| 테스트 ID | 대상 | 시나리오 | 예상 결과 | 요구사항 |
|-----------|------|----------|----------|----------|
| UT-001 | NotificationSettings | 초기 렌더링 | 모든 카테고리와 수신자 표시 | FR-001 |
| UT-002 | CategorySettings | Switch 토글 | 상태 변경 및 isDirty true | FR-002 |
| UT-003 | RecipientTable | 수신자 추가 | 테이블에 새 행 추가 | FR-003 |
| UT-004 | RecipientTable | 수신자 삭제 | 테이블에서 행 제거 | FR-003 |
| UT-005 | NotificationSettings | Ctrl+S 저장 | onSave 콜백 호출 | FR-004 |
| UT-006 | NotificationSettings | 기본값 복원 | 확인 후 모든 설정 초기화 | FR-005 |
| UT-007 | NotificationSettings | 미저장 경고 | beforeunload 이벤트 등록 | BR-001 |
| UT-008 | RecipientTable | 이메일 중복 | 에러 메시지 표시 | BR-003 |

### 2.2 테스트 케이스 상세

#### UT-001: NotificationSettings 초기 렌더링

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/NotificationSettings/__tests__/NotificationSettings.test.tsx` |
| **테스트 블록** | `describe('NotificationSettings') → it('should render all categories and recipients')` |
| **Mock 의존성** | notification-settings.json |
| **입력 데이터** | Mock 설정 데이터 |
| **검증 포인트** | 4개 카테고리 Switch 표시, 3명 수신자 표시 |
| **커버리지 대상** | 초기 렌더링 로직 |
| **관련 요구사항** | FR-001 |

#### UT-002: CategorySettings Switch 토글

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/NotificationSettings/__tests__/CategorySettings.test.tsx` |
| **테스트 블록** | `describe('CategorySettings') → it('should toggle switch and set dirty state')` |
| **Mock 의존성** | - |
| **입력 데이터** | `{ id: 'production', name: '생산 알림', enabled: true }` |
| **검증 포인트** | Switch 클릭 후 enabled=false, onChange 콜백 호출 |
| **커버리지 대상** | Switch 토글 핸들러 |
| **관련 요구사항** | FR-002 |

#### UT-003: RecipientTable 수신자 추가

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/NotificationSettings/__tests__/RecipientTable.test.tsx` |
| **테스트 블록** | `describe('RecipientTable') → it('should add new recipient row')` |
| **Mock 의존성** | - |
| **입력 데이터** | 초기 수신자 3명 |
| **검증 포인트** | '수신자 추가' 버튼 클릭 후 4행 표시 |
| **커버리지 대상** | 행 추가 로직 |
| **관련 요구사항** | FR-003 |

#### UT-004: RecipientTable 수신자 삭제

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/NotificationSettings/__tests__/RecipientTable.test.tsx` |
| **테스트 블록** | `describe('RecipientTable') → it('should remove recipient row')` |
| **Mock 의존성** | - |
| **입력 데이터** | 초기 수신자 3명 |
| **검증 포인트** | '삭제' 버튼 클릭 후 2행 표시 |
| **커버리지 대상** | 행 삭제 로직 |
| **관련 요구사항** | FR-003 |

#### UT-005: Ctrl+S 단축키 저장

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/NotificationSettings/__tests__/NotificationSettings.test.tsx` |
| **테스트 블록** | `describe('NotificationSettings') → it('should call save on Ctrl+S')` |
| **Mock 의존성** | useGlobalHotkeys mock |
| **입력 데이터** | Ctrl+S 키보드 이벤트 |
| **검증 포인트** | handleSave 함수 호출됨 |
| **커버리지 대상** | 키보드 단축키 핸들러 |
| **관련 요구사항** | FR-004, BR-002 |

#### UT-006: 기본값 복원

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/NotificationSettings/__tests__/NotificationSettings.test.tsx` |
| **테스트 블록** | `describe('NotificationSettings') → it('should restore defaults after confirmation')` |
| **Mock 의존성** | Modal.confirm mock |
| **입력 데이터** | '기본값 복원' 버튼 클릭 |
| **검증 포인트** | 확인 다이얼로그 표시, 확인 후 기본값으로 설정 |
| **커버리지 대상** | 기본값 복원 로직 |
| **관련 요구사항** | FR-005, BR-004 |

#### UT-007: 미저장 경고 (beforeunload)

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/NotificationSettings/__tests__/NotificationSettings.test.tsx` |
| **테스트 블록** | `describe('NotificationSettings') → it('should register beforeunload when dirty')` |
| **Mock 의존성** | window.addEventListener mock |
| **입력 데이터** | 설정 변경 후 isDirty=true |
| **검증 포인트** | beforeunload 이벤트 리스너 등록됨 |
| **커버리지 대상** | 미저장 경고 로직 |
| **관련 요구사항** | BR-001 |

#### UT-008: 이메일 중복 검사

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/NotificationSettings/__tests__/RecipientTable.test.tsx` |
| **테스트 블록** | `describe('RecipientTable') → it('should show error for duplicate email')` |
| **Mock 의존성** | - |
| **입력 데이터** | 기존 이메일과 동일한 이메일 입력 |
| **검증 포인트** | "이미 등록된 이메일입니다" 에러 표시 |
| **커버리지 대상** | 이메일 유효성 검사 |
| **관련 요구사항** | BR-003 |

---

## 3. E2E 테스트 시나리오

### 3.1 테스트 케이스 목록

| 테스트 ID | 시나리오 | 사전조건 | 실행 단계 | 예상 결과 | 요구사항 |
|-----------|----------|----------|----------|----------|----------|
| E2E-001 | 설정 화면 접근 | 로그인 상태 | 1. 메뉴 클릭 | 화면 표시됨 | FR-001 |
| E2E-002 | 카테고리 토글 | 화면 표시 | 1. Switch 클릭 | 상태 변경됨 | FR-002 |
| E2E-003 | 수신자 추가 | 화면 표시 | 1. 추가 2. 입력 3. 저장 | 수신자 추가됨 | FR-003 |
| E2E-004 | 수신자 삭제 | 수신자 존재 | 1. 삭제 클릭 | 수신자 제거됨 | FR-003 |
| E2E-005 | Ctrl+S 저장 | 변경 상태 | 1. Ctrl+S | 저장 완료 | FR-004 |
| E2E-006 | 기본값 복원 | 설정 변경 | 1. 복원 클릭 2. 확인 | 기본값 복원 | FR-005 |
| E2E-007 | 미저장 이탈 경고 | 변경 상태 | 1. 다른 메뉴 클릭 | 경고 표시 | BR-001 |
| E2E-008 | 이메일 중복 오류 | 수신자 존재 | 1. 중복 이메일 입력 | 에러 표시 | BR-003 |

### 3.2 테스트 케이스 상세

#### E2E-001: 설정 화면 접근

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/notification-settings.spec.ts` |
| **테스트명** | `test('사용자가 알림 설정 화면에 접근할 수 있다')` |
| **사전조건** | 로그인 (fixture 사용) |
| **data-testid 셀렉터** | |
| - 페이지 컨테이너 | `[data-testid="notification-settings-page"]` |
| - 카테고리 섹션 | `[data-testid="category-settings"]` |
| - 수신자 섹션 | `[data-testid="recipient-table"]` |
| **검증 포인트** | 페이지 로드, 모든 섹션 표시 |
| **스크린샷** | `e2e-001-settings-page.png` |
| **관련 요구사항** | FR-001 |

#### E2E-002: 카테고리 토글

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/notification-settings.spec.ts` |
| **테스트명** | `test('사용자가 알림 카테고리를 활성화/비활성화할 수 있다')` |
| **사전조건** | 설정 화면 접근 |
| **data-testid 셀렉터** | |
| - 생산 알림 Switch | `[data-testid="category-switch-production"]` |
| - 품질 알림 Switch | `[data-testid="category-switch-quality"]` |
| **실행 단계** | |
| 1 | `await page.click('[data-testid="category-switch-production"]')` |
| 2 | 변경 상태 확인 |
| **검증 포인트** | Switch 상태 변경, dirty 상태 |
| **스크린샷** | `e2e-002-toggle.png` |
| **관련 요구사항** | FR-002 |

#### E2E-003: 수신자 추가

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/notification-settings.spec.ts` |
| **테스트명** | `test('사용자가 알림 수신자를 추가할 수 있다')` |
| **사전조건** | 설정 화면 접근 |
| **data-testid 셀렉터** | |
| - 수신자 추가 버튼 | `[data-testid="add-recipient-btn"]` |
| - 이름 입력 | `[data-testid="recipient-name-input"]` |
| - 이메일 입력 | `[data-testid="recipient-email-input"]` |
| - 저장 버튼 | `[data-testid="save-btn"]` |
| **실행 단계** | |
| 1 | `await page.click('[data-testid="add-recipient-btn"]')` |
| 2 | `await page.fill('[data-testid="recipient-name-input"]', '박신입')` |
| 3 | `await page.fill('[data-testid="recipient-email-input"]', 'park@company.com')` |
| 4 | `await page.click('[data-testid="save-btn"]')` |
| **검증 포인트** | 새 수신자 테이블에 표시, 성공 토스트 |
| **스크린샷** | `e2e-003-add-recipient.png` |
| **관련 요구사항** | FR-003 |

#### E2E-004: 수신자 삭제

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/notification-settings.spec.ts` |
| **테스트명** | `test('사용자가 알림 수신자를 삭제할 수 있다')` |
| **사전조건** | 수신자 존재 |
| **data-testid 셀렉터** | |
| - 삭제 버튼 | `[data-testid="delete-recipient-btn"]` |
| **실행 단계** | |
| 1 | `await page.click('[data-testid="delete-recipient-btn"]')` |
| **검증 포인트** | 수신자 목록에서 제거됨 |
| **스크린샷** | `e2e-004-delete-recipient.png` |
| **관련 요구사항** | FR-003 |

#### E2E-005: Ctrl+S 저장

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/notification-settings.spec.ts` |
| **테스트명** | `test('사용자가 Ctrl+S로 설정을 저장할 수 있다')` |
| **사전조건** | 설정 변경 상태 |
| **data-testid 셀렉터** | |
| - 성공 토스트 | `[data-testid="success-toast"]` |
| **실행 단계** | |
| 1 | 설정 변경 |
| 2 | `await page.keyboard.press('Control+s')` |
| **검증 포인트** | 저장 완료 토스트 표시 |
| **스크린샷** | `e2e-005-ctrl-s-save.png` |
| **관련 요구사항** | FR-004, BR-002 |

#### E2E-006: 기본값 복원

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/notification-settings.spec.ts` |
| **테스트명** | `test('사용자가 기본값으로 설정을 복원할 수 있다')` |
| **사전조건** | 설정 변경 상태 |
| **data-testid 셀렉터** | |
| - 기본값 복원 버튼 | `[data-testid="restore-defaults-btn"]` |
| - 확인 버튼 | `.ant-modal-confirm-btns .ant-btn-primary` |
| **실행 단계** | |
| 1 | `await page.click('[data-testid="restore-defaults-btn"]')` |
| 2 | `await page.click('.ant-modal-confirm-btns .ant-btn-primary')` |
| **검증 포인트** | 모든 설정이 기본값으로 복원됨 |
| **스크린샷** | `e2e-006-restore-defaults.png` |
| **관련 요구사항** | FR-005, BR-004 |

#### E2E-007: 미저장 이탈 경고

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/notification-settings.spec.ts` |
| **테스트명** | `test('변경 후 페이지 이탈 시 경고가 표시된다')` |
| **사전조건** | 설정 변경 상태 |
| **data-testid 셀렉터** | |
| - 다른 메뉴 | `[data-testid="menu-item-dashboard"]` |
| - 경고 다이얼로그 | `.ant-modal-confirm` |
| **실행 단계** | |
| 1 | Switch 토글하여 변경 |
| 2 | 다른 메뉴 클릭 시도 |
| **검증 포인트** | 미저장 경고 다이얼로그 표시 |
| **스크린샷** | `e2e-007-unsaved-warning.png` |
| **관련 요구사항** | BR-001 |

#### E2E-008: 이메일 중복 오류

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/notification-settings.spec.ts` |
| **테스트명** | `test('중복 이메일 입력 시 에러가 표시된다')` |
| **사전조건** | 수신자 존재 (hong@company.com) |
| **data-testid 셀렉터** | |
| - 에러 메시지 | `[data-testid="email-error"]` |
| **실행 단계** | |
| 1 | 수신자 추가 |
| 2 | 기존과 동일한 이메일 입력 |
| **검증 포인트** | "이미 등록된 이메일입니다" 에러 표시 |
| **스크린샷** | `e2e-008-duplicate-email.png` |
| **관련 요구사항** | BR-003 |

---

## 4. UI 테스트케이스 (매뉴얼)

### 4.1 테스트 케이스 목록

| TC-ID | 테스트 항목 | 사전조건 | 테스트 단계 | 예상 결과 | 우선순위 | 요구사항 |
|-------|-----------|---------|-----------|----------|---------|----------|
| TC-001 | 화면 레이아웃 | 로그인 | 1. 화면 접근 | 모든 요소 표시 | High | FR-001 |
| TC-002 | Switch 상호작용 | 화면 표시 | 1. Switch 클릭 | 즉시 토글 | High | FR-002 |
| TC-003 | 테이블 인터랙션 | 화면 표시 | 1. 추가/삭제 | 행 추가/삭제 | High | FR-003 |
| TC-004 | 키보드 단축키 | 화면 표시 | 1. Ctrl+S | 저장 동작 | Medium | FR-004 |
| TC-005 | 기본값 복원 | 설정 변경 | 1. 복원 클릭 | 확인 후 복원 | Medium | FR-005 |
| TC-006 | 반응형 레이아웃 | - | 1. 브라우저 크기 조절 | 레이아웃 적응 | Low | - |
| TC-007 | 접근성 | - | 1. 키보드만으로 탐색 | 모든 기능 접근 | Medium | - |

### 4.2 매뉴얼 테스트 상세

#### TC-001: 화면 레이아웃 검증

**테스트 목적**: 알림 설정 화면의 모든 UI 요소가 올바르게 표시되는지 확인

**테스트 단계**:
1. 로그인 완료
2. 사이드바에서 '알림 설정' 메뉴 클릭
3. 화면 레이아웃 확인

**예상 결과**:
- 화면 제목 "알림 설정" 표시
- 알림 카테고리 섹션에 4개 카테고리 표시
- 각 카테고리에 Switch 표시
- 수신자 테이블 섹션 표시
- 하단에 취소/저장 버튼 표시

**검증 기준**:
- [ ] 제목이 정상 표시됨
- [ ] 4개 카테고리 모두 표시됨
- [ ] 수신자 테이블 표시됨
- [ ] 버튼 영역 표시됨

#### TC-004: 키보드 단축키 검증

**테스트 목적**: Ctrl+S 단축키가 입력 중에도 동작하는지 확인

**테스트 단계**:
1. 알림 설정 화면 접근
2. 수신자 이름 입력 필드에 포커스
3. 텍스트 입력 중 Ctrl+S 누름

**예상 결과**:
- 저장 동작 실행
- 성공 토스트 표시

**검증 기준**:
- [ ] 입력 중 Ctrl+S 동작함
- [ ] 저장 성공 메시지 표시됨

---

## 5. 테스트 데이터 (Fixture)

### 5.1 단위 테스트용 Mock 데이터

| 데이터 ID | 용도 | 값 |
|-----------|------|-----|
| MOCK-CATEGORY-01 | 생산 알림 | `{ id: 'production', name: '생산 알림', description: '생산 시작/완료, 목표 달성, 지연 경고', enabled: true }` |
| MOCK-CATEGORY-02 | 품질 알림 | `{ id: 'quality', name: '품질 알림', description: '품질 이상, 검사 완료, 불량률 초과', enabled: true }` |
| MOCK-CATEGORY-03 | 설비 알림 | `{ id: 'equipment', name: '설비 알림', description: '설비 이상, 유지보수 예정, 가동률 저하', enabled: false }` |
| MOCK-CATEGORY-04 | 시스템 알림 | `{ id: 'system', name: '시스템 알림', description: '시스템 공지, 업데이트, 권한 변경', enabled: true }` |
| MOCK-RECIPIENT-01 | 수신자 1 | `{ id: 'r1', name: '홍길동', email: 'hong@company.com' }` |
| MOCK-RECIPIENT-02 | 수신자 2 | `{ id: 'r2', name: '김철수', email: 'kim@company.com' }` |
| MOCK-RECIPIENT-03 | 수신자 3 | `{ id: 'r3', name: '이영희', email: 'lee@company.com' }` |

### 5.2 E2E 테스트용 시드 데이터

| 시드 ID | 용도 | 생성 방법 | 포함 데이터 |
|---------|------|----------|------------|
| SEED-SETTINGS | 기본 알림 설정 | JSON 로드 | 4개 카테고리, 3명 수신자 |
| SEED-EMPTY | 빈 수신자 | JSON 로드 | 4개 카테고리, 수신자 없음 |

### 5.3 테스트 계정

| 계정 ID | 이메일 | 비밀번호 | 역할 | 용도 |
|---------|--------|----------|------|------|
| TEST-USER | user@test.com | test1234 | USER | 일반 사용자 기능 테스트 |
| TEST-ADMIN | admin@test.com | test1234 | ADMIN | 관리자 기능 테스트 |

---

## 6. data-testid 목록

> 프론트엔드 컴포넌트에 적용할 `data-testid` 속성 정의

### 6.1 페이지별 셀렉터

#### 알림 설정 페이지

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `notification-settings-page` | 페이지 컨테이너 | 페이지 로드 확인 |
| `category-settings` | 카테고리 설정 섹션 | 섹션 표시 확인 |
| `category-switch-{id}` | 카테고리별 Switch | 개별 토글 |
| `recipient-table` | 수신자 테이블 컨테이너 | 테이블 표시 확인 |
| `add-recipient-btn` | 수신자 추가 버튼 | 추가 기능 |
| `recipient-row-{id}` | 수신자 행 | 개별 수신자 |
| `recipient-name-input` | 이름 입력 필드 | 이름 입력 |
| `recipient-email-input` | 이메일 입력 필드 | 이메일 입력 |
| `delete-recipient-btn` | 삭제 버튼 | 수신자 삭제 |
| `restore-defaults-btn` | 기본값 복원 버튼 | 복원 기능 |
| `cancel-btn` | 취소 버튼 | 취소 액션 |
| `save-btn` | 저장 버튼 | 저장 액션 |
| `success-toast` | 성공 토스트 | 저장 완료 확인 |
| `email-error` | 이메일 에러 메시지 | 유효성 에러 |

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
- UI 설계: `011-ui-design.md`

---

<!--
author: Claude
Template Version History:
- v1.0.0 (2026-01-23): TSK-06-19 최초 작성
-->
