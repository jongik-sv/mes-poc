# 테스트 명세서 (026-test-specification.md)

**Template Version:** 1.0.0 — **Last Updated:** 2026-01-20

> **목적**: 단위 테스트, E2E 테스트, 매뉴얼 테스트 시나리오 및 테스트 데이터 정의
>
> **참조**: 이 문서는 `010-design.md`와 `025-traceability-matrix.md`와 함께 사용됩니다.
>
> **활용 단계**: `/wf:build`, `/wf:test` 단계에서 테스트 코드 생성 기준으로 사용

---

## 0. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| Task ID | TSK-05-02 |
| Task명 | 확인 다이얼로그 |
| 설계 문서 참조 | `010-design.md` |
| 추적성 매트릭스 참조 | `025-traceability-matrix.md` |
| 작성일 | 2026-01-20 |
| 작성자 | Claude |

---

## 1. 테스트 전략 개요

### 1.1 테스트 범위

| 테스트 유형 | 범위 | 목표 커버리지 |
|------------|------|--------------|
| 단위 테스트 | confirmDelete, confirmDiscard, confirmBulkDelete 함수 | 90% 이상 |
| E2E 테스트 | 주요 사용자 시나리오 (삭제, 미저장 이탈, 일괄 삭제) | 100% 시나리오 커버 |
| 매뉴얼 테스트 | UI/UX, 접근성, 키보드 네비게이션 | 전체 기능 |

### 1.2 테스트 환경

| 항목 | 내용 |
|------|------|
| 테스트 프레임워크 (단위) | Vitest |
| 테스트 프레임워크 (E2E) | Playwright |
| UI 테스트 라이브러리 | @testing-library/react |
| Mock 라이브러리 | vitest.mock |
| 브라우저 | Chromium (기본) |
| 베이스 URL | `http://localhost:3000` |

---

## 2. 단위 테스트 시나리오

### 2.1 테스트 케이스 목록

| 테스트 ID | 대상 | 시나리오 | 예상 결과 | 요구사항 |
|-----------|------|----------|----------|----------|
| UT-001 | confirmDelete | 확인 클릭 시 onOk 호출 | Promise resolve | FR-001, BR-001 |
| UT-002 | confirmDelete | 다이얼로그 danger 버튼 스타일 | okButtonProps.danger=true | FR-001, BR-002 |
| UT-003 | confirmDiscard | dirty=true일 때 확인 다이얼로그 표시 | 다이얼로그 표시됨 | FR-002, BR-004 |
| UT-004 | confirmDiscard | dirty=false일 때 경고 없이 진행 | 즉시 resolve | FR-002, BR-004 |
| UT-005 | confirmBulkDelete | 건수가 메시지에 표시됨 | content에 count 포함 | FR-003, BR-003 |
| UT-006 | confirmBulkDelete | 취소 클릭 시 onCancel 호출 | Promise reject | FR-003, BR-003 |

### 2.2 테스트 케이스 상세

#### UT-001: confirmDelete 확인 클릭

| 항목 | 내용 |
|------|------|
| **파일** | `lib/utils/__tests__/confirm.spec.ts` |
| **테스트 블록** | `describe('confirmDelete') → it('should resolve when OK clicked')` |
| **Mock 의존성** | Modal.confirm (Ant Design) |
| **입력 데이터** | `{ onOk: vi.fn() }` |
| **검증 포인트** | onOk 콜백 호출 확인, Promise resolve 확인 |
| **커버리지 대상** | confirmDelete() 확인 분기 |
| **관련 요구사항** | FR-001, BR-001 |

```typescript
// 예시 테스트 코드 구조
describe('confirmDelete', () => {
  it('should resolve when OK clicked', async () => {
    const onOk = vi.fn();

    // confirmDelete 호출
    const promise = confirmDelete({
      title: '삭제 확인',
      content: '정말 삭제하시겠습니까?',
    });

    // OK 버튼 클릭 시뮬레이션
    // Modal.confirm의 onOk 콜백 트리거

    // 검증
    await expect(promise).resolves.toBe(true);
  });
});
```

#### UT-002: confirmDelete danger 버튼 스타일

| 항목 | 내용 |
|------|------|
| **파일** | `lib/utils/__tests__/confirm.spec.ts` |
| **테스트 블록** | `describe('confirmDelete') → it('should render danger button')` |
| **Mock 의존성** | Modal.confirm (Ant Design) |
| **입력 데이터** | 기본 설정 |
| **검증 포인트** | Modal.confirm 호출 시 okButtonProps.danger=true |
| **커버리지 대상** | confirmDelete() 스타일 설정 |
| **관련 요구사항** | FR-001, BR-002 |

```typescript
describe('confirmDelete', () => {
  it('should render danger button', () => {
    const modalConfirmSpy = vi.spyOn(Modal, 'confirm');

    confirmDelete({
      title: '삭제 확인',
      content: '정말 삭제하시겠습니까?',
    });

    expect(modalConfirmSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        okButtonProps: expect.objectContaining({
          danger: true,
        }),
      })
    );
  });
});
```

#### UT-003: confirmDiscard dirty=true

| 항목 | 내용 |
|------|------|
| **파일** | `lib/utils/__tests__/confirm.spec.ts` |
| **테스트 블록** | `describe('confirmDiscard') → it('should show dialog when dirty')` |
| **Mock 의존성** | Modal.confirm (Ant Design) |
| **입력 데이터** | `{ isDirty: true }` |
| **검증 포인트** | Modal.confirm 호출됨 |
| **커버리지 대상** | confirmDiscard() dirty 분기 |
| **관련 요구사항** | FR-002, BR-004 |

#### UT-004: confirmDiscard dirty=false

| 항목 | 내용 |
|------|------|
| **파일** | `lib/utils/__tests__/confirm.spec.ts` |
| **테스트 블록** | `describe('confirmDiscard') → it('should proceed without dialog when not dirty')` |
| **Mock 의존성** | Modal.confirm (Ant Design) |
| **입력 데이터** | `{ isDirty: false }` |
| **검증 포인트** | Modal.confirm 호출 안 됨, 즉시 resolve |
| **커버리지 대상** | confirmDiscard() 클린 분기 |
| **관련 요구사항** | FR-002, BR-004 |

#### UT-005: confirmBulkDelete 건수 표시

| 항목 | 내용 |
|------|------|
| **파일** | `lib/utils/__tests__/confirm.spec.ts` |
| **테스트 블록** | `describe('confirmBulkDelete') → it('should display count in message')` |
| **Mock 의존성** | Modal.confirm (Ant Design) |
| **입력 데이터** | `{ count: 50 }` |
| **검증 포인트** | content에 "50건" 포함 |
| **커버리지 대상** | confirmBulkDelete() 메시지 생성 |
| **관련 요구사항** | FR-003, BR-003 |

```typescript
describe('confirmBulkDelete', () => {
  it('should display count in message', () => {
    const modalConfirmSpy = vi.spyOn(Modal, 'confirm');

    confirmBulkDelete({ count: 50 });

    expect(modalConfirmSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.stringContaining('50건'),
      })
    );
  });
});
```

#### UT-006: confirmBulkDelete 취소

| 항목 | 내용 |
|------|------|
| **파일** | `lib/utils/__tests__/confirm.spec.ts` |
| **테스트 블록** | `describe('confirmBulkDelete') → it('should reject when canceled')` |
| **Mock 의존성** | Modal.confirm (Ant Design) |
| **입력 데이터** | `{ count: 10 }` |
| **검증 포인트** | 취소 시 Promise reject |
| **커버리지 대상** | confirmBulkDelete() 취소 분기 |
| **관련 요구사항** | FR-003, BR-003 |

---

## 3. E2E 테스트 시나리오

### 3.1 테스트 케이스 목록

| 테스트 ID | 시나리오 | 사전조건 | 실행 단계 | 예상 결과 | 요구사항 |
|-----------|----------|----------|----------|----------|----------|
| E2E-001 | 삭제 확인 후 삭제 | 샘플 사용자 목록 페이지 | 1. 삭제 클릭 2. 확인 클릭 | 항목 삭제됨, 성공 메시지 | FR-001 |
| E2E-002 | 미저장 이탈 경고 | 폼 수정 중 | 1. 폼 수정 2. 메뉴 이동 | 경고 다이얼로그 표시 | FR-002 |
| E2E-003 | 일괄 삭제 확인 | 여러 항목 선택됨 | 1. 일괄 삭제 클릭 2. 확인 | 선택 항목 모두 삭제 | FR-003 |

### 3.2 테스트 케이스 상세

#### E2E-001: 삭제 확인 후 삭제

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/confirm-dialog.spec.ts` |
| **테스트명** | `test('삭제 확인 후 항목이 삭제된다')` |
| **사전조건** | 샘플 사용자 목록 페이지, mock 데이터 로드됨 |
| **data-testid 셀렉터** | |
| - 삭제 버튼 | `[data-testid="delete-btn"]` |
| - 확인 다이얼로그 | `.ant-modal-confirm` |
| - 확인 버튼 | `.ant-modal-confirm-btns .ant-btn-primary` |
| - 성공 메시지 | `.ant-message-success` |
| **실행 단계** | |
| 1 | `await page.click('[data-testid="delete-btn"]')` |
| 2 | `await page.waitForSelector('.ant-modal-confirm')` |
| 3 | `await page.click('.ant-modal-confirm-btns .ant-btn-primary')` |
| **API 확인** | DELETE /api/users/{id} → 200 (mock) |
| **검증 포인트** | `expect(page.locator('.ant-message-success')).toBeVisible()` |
| **스크린샷** | `e2e-001-delete-confirm.png` |
| **관련 요구사항** | FR-001 |

#### E2E-002: 미저장 이탈 경고

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/confirm-dialog.spec.ts` |
| **테스트명** | `test('미저장 상태에서 이동 시 경고가 표시된다')` |
| **사전조건** | 폼 페이지 접속 |
| **data-testid 셀렉터** | |
| - 폼 입력 필드 | `[data-testid="name-input"]` |
| - 사이드바 메뉴 | `[data-testid="menu-dashboard"]` |
| - 경고 다이얼로그 | `.ant-modal-confirm` |
| - 나가기 버튼 | `.ant-modal-confirm-btns .ant-btn-primary` |
| - 취소 버튼 | `.ant-modal-confirm-btns .ant-btn-default` |
| **실행 단계** | |
| 1 | `await page.fill('[data-testid="name-input"]', '테스트')` |
| 2 | `await page.click('[data-testid="menu-dashboard"]')` |
| 3 | `await page.waitForSelector('.ant-modal-confirm')` |
| **검증 포인트** | `expect(page.locator('.ant-modal-confirm')).toContainText('저장하지 않은')` |
| **스크린샷** | `e2e-002-unsaved-warning.png` |
| **관련 요구사항** | FR-002 |

#### E2E-003: 일괄 삭제 확인

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/confirm-dialog.spec.ts` |
| **테스트명** | `test('일괄 삭제 시 건수가 표시되고 확인 후 삭제된다')` |
| **사전조건** | 샘플 사용자 목록 페이지, 최소 5개 항목 존재 |
| **data-testid 셀렉터** | |
| - 전체 선택 체크박스 | `.ant-table-selection-column .ant-checkbox` |
| - 일괄 삭제 버튼 | `[data-testid="bulk-delete-btn"]` |
| - 확인 다이얼로그 | `.ant-modal-confirm` |
| - 확인 버튼 | `.ant-modal-confirm-btns .ant-btn-primary` |
| **실행 단계** | |
| 1 | `await page.click('.ant-table-selection-column .ant-checkbox')` |
| 2 | `await page.click('[data-testid="bulk-delete-btn"]')` |
| 3 | `await page.waitForSelector('.ant-modal-confirm')` |
| 4 | 메시지에 건수 포함 확인 |
| 5 | `await page.click('.ant-modal-confirm-btns .ant-btn-primary')` |
| **검증 포인트** | `expect(page.locator('.ant-modal-confirm')).toContainText('5건')` |
| **스크린샷** | `e2e-003-bulk-delete.png` |
| **관련 요구사항** | FR-003 |

---

## 4. UI 테스트케이스 (매뉴얼)

### 4.1 테스트 케이스 목록

| TC-ID | 테스트 항목 | 사전조건 | 테스트 단계 | 예상 결과 | 우선순위 | 요구사항 |
|-------|-----------|---------|-----------|----------|---------|----------|
| TC-001 | 삭제 확인 다이얼로그 UI | 목록 화면 | 삭제 버튼 클릭 | 다이얼로그 표시, 삭제 버튼 빨간색 | High | FR-001 |
| TC-002 | 미저장 경고 다이얼로그 UI | 폼 화면 | 폼 수정 후 이동 시도 | 경고 다이얼로그 표시 | High | FR-002 |
| TC-003 | 일괄 삭제 건수 표시 | 목록 화면 | 여러 항목 선택 후 삭제 | 건수 정확히 표시 | High | FR-003 |
| TC-004 | 키보드 접근성 (ESC) | 다이얼로그 열린 상태 | ESC 키 누름 | 다이얼로그 닫힘 | Medium | - |
| TC-005 | 키보드 접근성 (Enter) | 다이얼로그 열린 상태 | Enter 키 누름 | 확인 실행 | Medium | - |
| TC-006 | 포커스 트랩 | 다이얼로그 열린 상태 | Tab 키 반복 | 모달 내에서만 순환 | Medium | - |
| TC-007 | 로딩 상태 표시 | 삭제 확인 후 | 확인 버튼 클릭 | 버튼 로딩 스피너 | Low | - |

### 4.2 매뉴얼 테스트 상세

#### TC-001: 삭제 확인 다이얼로그 UI

**테스트 목적**: 삭제 확인 다이얼로그의 UI가 디자인 가이드라인에 맞게 표시되는지 확인

**테스트 단계**:
1. 샘플 사용자 목록 화면 접속
2. 임의 항목의 삭제 버튼 클릭
3. 다이얼로그 UI 확인

**예상 결과**:
- 다이얼로그 제목: "삭제 확인" + 경고 아이콘
- 다이얼로그 내용: "정말 삭제하시겠습니까?"
- 부가 설명: "이 작업은 되돌릴 수 없습니다."
- 삭제 버튼: 빨간색 (danger)
- 취소 버튼: 기본 스타일

**검증 기준**:
- [ ] 다이얼로그가 화면 중앙에 표시됨
- [ ] 배경이 어둡게 딤 처리됨
- [ ] 삭제 버튼이 빨간색임
- [ ] X 버튼 또는 취소로 닫을 수 있음

#### TC-002: 미저장 경고 다이얼로그 UI

**테스트 목적**: 미저장 경고 다이얼로그가 올바르게 표시되는지 확인

**테스트 단계**:
1. 폼 화면 접속 (예: 사용자 등록 화면)
2. 아무 필드에 값 입력 (저장하지 않음)
3. 사이드바에서 다른 메뉴 클릭

**예상 결과**:
- 경고 다이얼로그 표시
- 내용: "저장하지 않은 내용이 있습니다."
- 버튼: "취소", "저장하지 않고 나가기"

**검증 기준**:
- [ ] dirty 상태에서만 경고 표시
- [ ] 저장 완료 후에는 경고 없이 이동
- [ ] 취소 클릭 시 현재 화면 유지
- [ ] 나가기 클릭 시 변경사항 버리고 이동

#### TC-004: 키보드 접근성 (ESC)

**테스트 목적**: ESC 키로 다이얼로그를 닫을 수 있는지 확인

**테스트 단계**:
1. 삭제 버튼 클릭하여 다이얼로그 열기
2. ESC 키 누름

**예상 결과**:
- 다이얼로그가 닫힘
- 삭제 작업이 취소됨

**검증 기준**:
- [ ] ESC 키로 즉시 닫힘
- [ ] 원래 화면 상태 유지

---

## 5. 테스트 데이터 (Fixture)

### 5.1 단위 테스트용 Mock 데이터

| 데이터 ID | 용도 | 값 |
|-----------|------|-----|
| MOCK-USER-01 | 삭제 대상 사용자 | `{ id: 'user-1', name: '테스트 사용자', email: 'test@test.com' }` |
| MOCK-USERS-BULK | 일괄 삭제 대상 | `Array(5).fill().map((_, i) => ({ id: 'user-${i}', name: '사용자${i}' }))` |

### 5.2 E2E 테스트용 시드 데이터

| 시드 ID | 용도 | 생성 방법 | 포함 데이터 |
|---------|------|----------|------------|
| SEED-E2E-USERS | 사용자 목록 테스트 | mock-data/users.json | 사용자 10명 |

### 5.3 테스트 계정

| 계정 ID | 이메일 | 비밀번호 | 역할 | 용도 |
|---------|--------|----------|------|------|
| TEST-ADMIN | admin@test.com | test1234 | ADMIN | 삭제 권한 테스트 |
| TEST-USER | user@test.com | test1234 | USER | 일반 사용자 테스트 |

---

## 6. data-testid 목록

> 프론트엔드 컴포넌트에 적용할 `data-testid` 속성 정의

### 6.1 확인 다이얼로그 관련 셀렉터

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `delete-btn` | 삭제 버튼 | 개별 삭제 트리거 |
| `bulk-delete-btn` | 일괄 삭제 버튼 | 일괄 삭제 트리거 |
| `name-input` | 이름 입력 필드 | 폼 dirty 상태 테스트 |

### 6.2 Ant Design 기본 셀렉터 (data-testid 대신 사용)

| 셀렉터 | 요소 | 용도 |
|--------|------|------|
| `.ant-modal-confirm` | 확인 다이얼로그 | 다이얼로그 표시 확인 |
| `.ant-modal-confirm-title` | 다이얼로그 제목 | 제목 텍스트 확인 |
| `.ant-modal-confirm-content` | 다이얼로그 내용 | 내용 텍스트 확인 |
| `.ant-modal-confirm-btns .ant-btn-primary` | 확인 버튼 | 확인 클릭 |
| `.ant-modal-confirm-btns .ant-btn-default` | 취소 버튼 | 취소 클릭 |
| `.ant-message-success` | 성공 메시지 | 작업 성공 확인 |
| `.ant-message-error` | 에러 메시지 | 작업 실패 확인 |

---

## 7. 테스트 커버리지 목표

### 7.1 단위 테스트 커버리지

| 대상 | 목표 | 최소 |
|------|------|------|
| Lines | 90% | 80% |
| Branches | 85% | 75% |
| Functions | 100% | 90% |
| Statements | 90% | 80% |

### 7.2 E2E 테스트 커버리지

| 구분 | 목표 |
|------|------|
| 주요 사용자 시나리오 | 100% |
| 기능 요구사항 (FR) | 100% 커버 |
| 비즈니스 규칙 (BR) | 100% 커버 |
| 에러 케이스 | 80% 커버 |

---

## 관련 문서

- 설계 문서: `010-design.md`
- 추적성 매트릭스: `025-traceability-matrix.md`
- PRD: `.orchay/projects/mes-portal/prd.md`

---

<!--
TSK-05-02 테스트 명세서
Version: 1.0
Created: 2026-01-20
-->
