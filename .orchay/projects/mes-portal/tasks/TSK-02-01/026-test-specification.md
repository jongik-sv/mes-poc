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
| Task ID | TSK-02-01 |
| Task명 | MDI 상태 관리 |
| 설계 참조 | `010-design.md` |
| 추적성 매트릭스 참조 | `025-traceability-matrix.md` |
| 작성일 | 2026-01-20 |
| 작성자 | Claude |

---

## 1. 테스트 전략 개요

### 1.1 테스트 범위

| 테스트 유형 | 범위 | 목표 커버리지 |
|------------|------|--------------|
| 단위 테스트 | MDIContext (openTab, closeTab, setActiveTab) | 90% 이상 |
| E2E 테스트 | 탭 열기/닫기/전환 시나리오 | 100% 시나리오 커버 |
| 매뉴얼 테스트 | MDI 사용성, 상태 유지 확인 | 전체 기능 |

### 1.2 테스트 환경

| 항목 | 내용 |
|------|------|
| 테스트 프레임워크 (단위) | Vitest |
| 테스트 프레임워크 (E2E) | Playwright |
| React 테스트 유틸리티 | @testing-library/react |
| 베이스 URL | `http://localhost:3000` |

---

## 2. 단위 테스트 시나리오

### 2.1 테스트 케이스 목록

| 테스트 ID | 대상 | 시나리오 | 예상 결과 | 요구사항 |
|-----------|------|----------|----------|----------|
| UT-001 | MDIContext | 초기 상태 확인 | tabs=[], activeTabId=null | FR-MDI-01 |
| UT-002 | MDIContext | getTabs 호출 | 현재 탭 목록 반환 | FR-MDI-01 |
| UT-003 | openTab | 새 탭 열기 | 탭 목록에 추가, 활성화됨 | FR-MDI-02 |
| UT-004 | openTab | 중복 탭 열기 | 새 탭 추가 안함, 기존 탭 활성화 | FR-MDI-02, BR-MDI-01 |
| UT-005 | closeTab | 비활성 탭 닫기 | 탭 목록에서 제거 | FR-MDI-03 |
| UT-006 | closeTab | 활성 탭 닫기 (오른쪽 탭 존재) | 오른쪽 탭 활성화 | FR-MDI-03 |
| UT-007 | closeTab | 활성 탭 닫기 (왼쪽만 존재) | 왼쪽 탭 활성화 | FR-MDI-03 |
| UT-008 | setActiveTab | 탭 전환 | activeTabId 변경 | FR-MDI-04 |
| UT-009 | openTab | 최대 탭 초과 | 탭 추가 안됨, 경고 반환 | FR-MDI-05, BR-MDI-02 |
| UT-010 | closeTab | closable=false 탭 닫기 | 탭 닫히지 않음 | BR-MDI-03 |

### 2.2 테스트 케이스 상세

#### UT-001: MDIContext 초기 상태 확인

| 항목 | 내용 |
|------|------|
| **파일** | `lib/mdi/__tests__/context.spec.tsx` |
| **테스트 블록** | `describe('MDIContext') → it('초기 상태는 빈 탭 목록과 null activeTabId')` |
| **Mock 의존성** | 없음 |
| **입력 데이터** | 없음 |
| **검증 포인트** | `tabs.length === 0`, `activeTabId === null` |
| **커버리지 대상** | MDIProvider 초기화 |
| **관련 요구사항** | FR-MDI-01 |

```typescript
// 테스트 의사 코드
it('초기 상태는 빈 탭 목록과 null activeTabId', () => {
  const { result } = renderHook(() => useMDI(), { wrapper: MDIProvider });

  expect(result.current.tabs).toEqual([]);
  expect(result.current.activeTabId).toBeNull();
});
```

#### UT-002: getTabs 호출

| 항목 | 내용 |
|------|------|
| **파일** | `lib/mdi/__tests__/context.spec.tsx` |
| **테스트 블록** | `describe('MDIContext') → describe('getTabs') → it('현재 탭 목록 반환')` |
| **Mock 의존성** | 없음 |
| **입력 데이터** | 탭 2개 열기 |
| **검증 포인트** | `getTabs().length === 2` |
| **커버리지 대상** | getTabs 함수 |
| **관련 요구사항** | FR-MDI-01 |

#### UT-003: 새 탭 열기

| 항목 | 내용 |
|------|------|
| **파일** | `lib/mdi/__tests__/context.spec.tsx` |
| **테스트 블록** | `describe('openTab') → it('새 탭이 목록에 추가되고 활성화됨')` |
| **Mock 의존성** | 없음 |
| **입력 데이터** | `{ id: 'tab-1', title: '작업 지시', path: '/work-order', closable: true }` |
| **검증 포인트** | `tabs.length === 1`, `activeTabId === 'tab-1'` |
| **커버리지 대상** | openTab 정상 흐름 |
| **관련 요구사항** | FR-MDI-02 |

```typescript
// 테스트 의사 코드
it('새 탭이 목록에 추가되고 활성화됨', () => {
  const { result } = renderHook(() => useMDI(), { wrapper: MDIProvider });

  act(() => {
    result.current.openTab({
      id: 'tab-1',
      title: '작업 지시',
      path: '/work-order',
      closable: true,
    });
  });

  expect(result.current.tabs).toHaveLength(1);
  expect(result.current.tabs[0].id).toBe('tab-1');
  expect(result.current.activeTabId).toBe('tab-1');
});
```

#### UT-004: 중복 탭 열기

| 항목 | 내용 |
|------|------|
| **파일** | `lib/mdi/__tests__/context.spec.tsx` |
| **테스트 블록** | `describe('openTab') → it('이미 열린 탭은 새로 추가하지 않고 활성화만')` |
| **Mock 의존성** | 없음 |
| **입력 데이터** | 동일 ID 탭 2회 openTab |
| **검증 포인트** | `tabs.length === 1`, 두 번째 호출 후에도 탭 1개 |
| **커버리지 대상** | openTab 중복 방지 분기 |
| **관련 요구사항** | FR-MDI-02, BR-MDI-01 |

```typescript
// 테스트 의사 코드
it('이미 열린 탭은 새로 추가하지 않고 활성화만', () => {
  const { result } = renderHook(() => useMDI(), { wrapper: MDIProvider });

  const tab = { id: 'tab-1', title: '작업 지시', path: '/work-order', closable: true };

  act(() => {
    result.current.openTab(tab);
    result.current.openTab({ id: 'tab-2', title: '실적', path: '/result', closable: true });
    result.current.openTab(tab); // 중복 시도
  });

  expect(result.current.tabs).toHaveLength(2);
  expect(result.current.activeTabId).toBe('tab-1'); // 기존 탭 활성화
});
```

#### UT-005: 비활성 탭 닫기

| 항목 | 내용 |
|------|------|
| **파일** | `lib/mdi/__tests__/context.spec.tsx` |
| **테스트 블록** | `describe('closeTab') → it('비활성 탭을 닫으면 목록에서 제거')` |
| **Mock 의존성** | 없음 |
| **입력 데이터** | 탭 2개 열기, 비활성 탭 닫기 |
| **검증 포인트** | `tabs.length === 1`, 활성 탭 변경 없음 |
| **커버리지 대상** | closeTab 비활성 탭 분기 |
| **관련 요구사항** | FR-MDI-03 |

#### UT-006: 활성 탭 닫기 (오른쪽 탭 존재)

| 항목 | 내용 |
|------|------|
| **파일** | `lib/mdi/__tests__/context.spec.tsx` |
| **테스트 블록** | `describe('closeTab') → it('활성 탭 닫기 시 오른쪽 탭 활성화')` |
| **Mock 의존성** | 없음 |
| **입력 데이터** | 탭 A, B(활성), C → B 닫기 |
| **검증 포인트** | `activeTabId === 'C'` (또는 설계에 따라 A) |
| **커버리지 대상** | closeTab 활성 탭 + 오른쪽 존재 분기 |
| **관련 요구사항** | FR-MDI-03 |

#### UT-007: 활성 탭 닫기 (왼쪽만 존재)

| 항목 | 내용 |
|------|------|
| **파일** | `lib/mdi/__tests__/context.spec.tsx` |
| **테스트 블록** | `describe('closeTab') → it('활성 탭 닫기 시 왼쪽 탭 활성화 (오른쪽 없을 때)')` |
| **Mock 의존성** | 없음 |
| **입력 데이터** | 탭 A, B(활성) → B 닫기 |
| **검증 포인트** | `activeTabId === 'A'` |
| **커버리지 대상** | closeTab 활성 탭 + 오른쪽 없음 분기 |
| **관련 요구사항** | FR-MDI-03 |

#### UT-008: 탭 전환

| 항목 | 내용 |
|------|------|
| **파일** | `lib/mdi/__tests__/context.spec.tsx` |
| **테스트 블록** | `describe('setActiveTab') → it('탭 전환 시 activeTabId 변경')` |
| **Mock 의존성** | 없음 |
| **입력 데이터** | 탭 2개 열기, setActiveTab 호출 |
| **검증 포인트** | `activeTabId` 변경됨 |
| **커버리지 대상** | setActiveTab 함수 |
| **관련 요구사항** | FR-MDI-04 |

#### UT-009: 최대 탭 초과

| 항목 | 내용 |
|------|------|
| **파일** | `lib/mdi/__tests__/context.spec.tsx` |
| **테스트 블록** | `describe('openTab') → it('최대 탭 개수 초과 시 추가 안됨')` |
| **Mock 의존성** | maxTabs=3 설정 |
| **입력 데이터** | 탭 3개 열기 후 4번째 시도 |
| **검증 포인트** | `tabs.length === 3` (4번째 추가 안됨) |
| **커버리지 대상** | openTab 최대 탭 제한 분기 |
| **관련 요구사항** | FR-MDI-05, BR-MDI-02 |

#### UT-010: closable=false 탭 닫기

| 항목 | 내용 |
|------|------|
| **파일** | `lib/mdi/__tests__/context.spec.tsx` |
| **테스트 블록** | `describe('closeTab') → it('closable=false 탭은 닫히지 않음')` |
| **Mock 의존성** | 없음 |
| **입력 데이터** | `{ id: 'home', closable: false }` 탭 열기 후 닫기 시도 |
| **검증 포인트** | 탭 여전히 존재 |
| **커버리지 대상** | closeTab closable 검사 분기 |
| **관련 요구사항** | BR-MDI-03 |

---

## 3. E2E 테스트 시나리오

### 3.1 테스트 케이스 목록

| 테스트 ID | 시나리오 | 사전조건 | 실행 단계 | 예상 결과 | 요구사항 |
|-----------|----------|----------|----------|----------|----------|
| E2E-001 | 탭 시스템 초기 상태 | 로그인 후 포털 진입 | 페이지 로드 | 탭 바 표시, 탭 없음 또는 기본 탭 | FR-MDI-01 |
| E2E-002 | 메뉴에서 탭 열기 | 로그인 상태 | 사이드바 메뉴 클릭 | 탭 추가, 해당 화면 표시 | FR-MDI-02 |
| E2E-003 | 탭 닫기 | 탭 2개 이상 열림 | 탭 닫기 버튼 클릭 | 탭 제거, 인접 탭 활성화 | FR-MDI-03 |
| E2E-004 | 탭 전환 시 상태 유지 | 폼이 있는 화면 탭 열림 | 폼 입력 → 다른 탭 → 복귀 | 입력값 유지됨 | FR-MDI-04 |
| E2E-005 | 최대 탭 제한 | maxTabs-1개 탭 열림 | 추가 탭 열기 시도 | 경고 메시지, 탭 안 열림 | FR-MDI-05 |

### 3.2 테스트 케이스 상세

#### E2E-001: 탭 시스템 초기 상태

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/mdi.spec.ts` |
| **테스트명** | `test('포털 진입 시 MDI 탭 바가 표시된다')` |
| **사전조건** | 로그인 완료 (fixture 사용) |
| **data-testid 셀렉터** | |
| - 탭 바 | `[data-testid="mdi-tab-bar"]` |
| - 탭 아이템 | `[data-testid="mdi-tab-item"]` |
| **검증 포인트** | `expect(page.locator('[data-testid="mdi-tab-bar"]')).toBeVisible()` |
| **스크린샷** | `e2e-001-initial-state.png` |
| **관련 요구사항** | FR-MDI-01 |

#### E2E-002: 메뉴에서 탭 열기

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/mdi.spec.ts` |
| **테스트명** | `test('사이드바 메뉴 클릭 시 새 탭이 열린다')` |
| **사전조건** | 로그인 완료 |
| **data-testid 셀렉터** | |
| - 사이드바 메뉴 | `[data-testid="sidebar-menu"]` |
| - 메뉴 아이템 | `[data-testid="menu-item-{menuCode}"]` |
| - 탭 아이템 | `[data-testid="mdi-tab-{tabId}"]` |
| **실행 단계** | |
| 1 | `await page.click('[data-testid="menu-item-work-order"]')` |
| **검증 포인트** | `expect(page.locator('[data-testid="mdi-tab-work-order"]')).toBeVisible()` |
| **스크린샷** | `e2e-002-open-tab.png` |
| **관련 요구사항** | FR-MDI-02, BR-MDI-01 |

#### E2E-003: 탭 닫기

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/mdi.spec.ts` |
| **테스트명** | `test('탭 닫기 버튼 클릭 시 탭이 닫힌다')` |
| **사전조건** | 탭 2개 이상 열림 |
| **data-testid 셀렉터** | |
| - 탭 닫기 버튼 | `[data-testid="mdi-tab-close-{tabId}"]` |
| **실행 단계** | |
| 1 | 메뉴 2개 클릭하여 탭 2개 열기 |
| 2 | `await page.click('[data-testid="mdi-tab-close-tab-1"]')` |
| **검증 포인트** | `expect(page.locator('[data-testid="mdi-tab-tab-1"]')).not.toBeVisible()` |
| **스크린샷** | `e2e-003-close-tab.png` |
| **관련 요구사항** | FR-MDI-03 |

#### E2E-004: 탭 전환 시 상태 유지

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/mdi.spec.ts` |
| **테스트명** | `test('탭 전환 후 복귀 시 입력 데이터가 유지된다')` |
| **사전조건** | 폼이 있는 화면 탭 열림 |
| **data-testid 셀렉터** | |
| - 입력 필드 | `[data-testid="form-input-name"]` |
| **실행 단계** | |
| 1 | 폼 화면 탭 열기 |
| 2 | `await page.fill('[data-testid="form-input-name"]', '테스트 데이터')` |
| 3 | 다른 메뉴 클릭하여 새 탭 열기 |
| 4 | 원래 탭 클릭 |
| **검증 포인트** | `expect(page.locator('[data-testid="form-input-name"]')).toHaveValue('테스트 데이터')` |
| **스크린샷** | `e2e-004-state-preservation.png` |
| **관련 요구사항** | FR-MDI-04, BR-MDI-04 |

#### E2E-005: 최대 탭 제한

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/mdi.spec.ts` |
| **테스트명** | `test('최대 탭 개수 도달 시 경고 메시지가 표시된다')` |
| **사전조건** | maxTabs 설정이 테스트용으로 낮게 설정됨 (예: 3) |
| **data-testid 셀렉터** | |
| - 토스트 메시지 | `[data-testid="toast-message"]` |
| **실행 단계** | |
| 1 | 메뉴 3개 클릭하여 탭 3개 열기 |
| 2 | 4번째 메뉴 클릭 |
| **검증 포인트** | `expect(page.locator('[data-testid="toast-message"]')).toContainText('탭을 더 이상 열 수 없습니다')` |
| **스크린샷** | `e2e-005-max-tabs.png` |
| **관련 요구사항** | FR-MDI-05, BR-MDI-02 |

---

## 4. UI 테스트케이스 (매뉴얼)

### 4.1 테스트 케이스 목록

| TC-ID | 테스트 항목 | 사전조건 | 테스트 단계 | 예상 결과 | 우선순위 | 요구사항 |
|-------|-----------|---------|-----------|----------|---------|----------|
| TC-001 | 탭 목록 표시 | 로그인 | 메뉴에서 화면 여러 개 열기 | 탭 바에 탭 목록 표시 | High | FR-MDI-01 |
| TC-002 | 탭 열기/전환 | 탭 2개 이상 | 탭 클릭 | 해당 화면 표시 | High | FR-MDI-02 |
| TC-003 | 탭 닫기 | 탭 2개 이상 | 탭 닫기 버튼 클릭 | 탭 닫힘, 인접 탭 활성화 | High | FR-MDI-03 |
| TC-004 | 상태 유지 확인 | 폼 화면 탭 | 입력 → 전환 → 복귀 | 입력값 유지 | High | FR-MDI-04 |

### 4.2 매뉴얼 테스트 상세

#### TC-001: 탭 목록 표시

**테스트 목적**: 여러 화면을 탭으로 열 때 탭 바에 정확히 표시되는지 확인

**테스트 단계**:
1. 로그인 완료
2. 사이드바에서 첫 번째 메뉴 클릭
3. 탭 바에 탭 추가 확인
4. 사이드바에서 두 번째 메뉴 클릭
5. 탭 바에 두 번째 탭 추가 확인

**예상 결과**:
- 각 메뉴 클릭 시 해당 탭이 탭 바에 추가됨
- 탭에 메뉴 아이콘과 제목이 표시됨
- 가장 최근에 연 탭이 활성 상태로 표시됨

**검증 기준**:
- [ ] 탭 바가 화면에 표시됨
- [ ] 탭 개수가 열린 화면 개수와 일치함
- [ ] 활성 탭이 시각적으로 구분됨

#### TC-002: 탭 열기/전환

**테스트 목적**: 탭 클릭 시 해당 화면으로 전환되는지 확인

**테스트 단계**:
1. 화면 2개 이상 탭으로 열기
2. 비활성 탭 클릭
3. 화면 전환 확인

**예상 결과**:
- 클릭한 탭이 활성 상태로 변경됨
- 컨텐츠 영역에 해당 화면이 표시됨

**검증 기준**:
- [ ] 탭 클릭 시 활성 탭 변경됨
- [ ] 해당 화면 콘텐츠 표시됨

#### TC-003: 탭 닫기

**테스트 목적**: 탭 닫기 버튼 클릭 시 탭이 정상적으로 닫히는지 확인

**테스트 단계**:
1. 화면 3개 탭으로 열기
2. 중간 탭의 닫기 버튼 클릭
3. 탭 제거 및 활성 탭 변경 확인

**예상 결과**:
- 닫기 버튼 클릭한 탭이 목록에서 제거됨
- 활성 탭이었다면 인접 탭이 활성화됨

**검증 기준**:
- [ ] 탭 닫기 버튼 표시됨
- [ ] 클릭 시 해당 탭 제거됨
- [ ] 활성 탭 자동 전환됨

#### TC-004: 상태 유지 확인

**테스트 목적**: 탭 전환 시 이전 탭의 상태(폼 입력값 등)가 유지되는지 확인

**테스트 단계**:
1. 폼이 있는 화면을 탭으로 열기
2. 폼에 데이터 입력 (저장하지 않음)
3. 다른 메뉴 클릭하여 새 탭 열기
4. 처음 탭 클릭하여 복귀
5. 입력했던 데이터 확인

**예상 결과**:
- 탭 전환 후 복귀했을 때 입력했던 데이터가 그대로 있음
- 스크롤 위치도 유지됨 (해당되는 경우)

**검증 기준**:
- [ ] 폼 입력값이 유지됨
- [ ] 컴포넌트 상태가 보존됨

---

## 5. 테스트 데이터 (Fixture)

### 5.1 단위 테스트용 Mock 데이터

| 데이터 ID | 용도 | 값 |
|-----------|------|-----|
| MOCK-TAB-01 | 기본 탭 | `{ id: 'tab-1', title: '작업 지시', path: '/work-order', closable: true }` |
| MOCK-TAB-02 | 두 번째 탭 | `{ id: 'tab-2', title: '실적 입력', path: '/production', closable: true }` |
| MOCK-TAB-03 | 세 번째 탭 | `{ id: 'tab-3', title: '품질 검사', path: '/quality', closable: true }` |
| MOCK-TAB-HOME | 닫기 불가 탭 | `{ id: 'home', title: '홈', path: '/', closable: false }` |

### 5.2 E2E 테스트용 시드 데이터

| 시드 ID | 용도 | 생성 방법 | 포함 데이터 |
|---------|------|----------|------------|
| SEED-E2E-LOGIN | 로그인 상태 | fixture | 테스트 사용자 세션 |
| SEED-E2E-MENU | 메뉴 데이터 | 자동 시드 | 메뉴 3개 이상 |

### 5.3 테스트 계정

| 계정 ID | 이메일 | 비밀번호 | 역할 | 용도 |
|---------|--------|----------|------|------|
| TEST-USER | user@test.com | test1234 | USER | 일반 사용자 MDI 테스트 |

---

## 6. data-testid 목록

> 프론트엔드 컴포넌트에 적용할 `data-testid` 속성 정의

### 6.1 MDI 관련 셀렉터

#### 탭 바 (TSK-02-02에서 구현)

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `mdi-tab-bar` | 탭 바 컨테이너 | 탭 바 존재 확인 |
| `mdi-tab-{tabId}` | 개별 탭 | 특정 탭 선택/확인 |
| `mdi-tab-close-{tabId}` | 탭 닫기 버튼 | 탭 닫기 액션 |
| `mdi-tab-icon-{tabId}` | 탭 아이콘 | 아이콘 표시 확인 |
| `mdi-tab-title-{tabId}` | 탭 제목 | 제목 표시 확인 |

#### MDI 컨텐츠 (TSK-02-05에서 구현)

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `mdi-content` | 컨텐츠 영역 컨테이너 | 컨텐츠 영역 확인 |
| `mdi-content-{tabId}` | 탭별 컨텐츠 | 특정 탭 콘텐츠 확인 |

### 6.2 사이드바 메뉴 (TSK-01-03에서 구현)

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `sidebar-menu` | 사이드바 메뉴 컨테이너 | 메뉴 존재 확인 |
| `menu-item-{menuCode}` | 메뉴 아이템 | 메뉴 클릭 |

### 6.3 공통 (TSK-05-03에서 구현)

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `toast-message` | 토스트 알림 | 경고/정보 메시지 확인 |

---

## 7. 테스트 커버리지 목표

### 7.1 단위 테스트 커버리지

| 대상 | 목표 | 최소 |
|------|------|------|
| Lines | 90% | 80% |
| Branches | 85% | 75% |
| Functions | 95% | 85% |
| Statements | 90% | 80% |

### 7.2 E2E 테스트 커버리지

| 구분 | 목표 |
|------|------|
| 주요 사용자 시나리오 | 100% |
| 기능 요구사항 (FR-MDI) | 100% 커버 |
| 비즈니스 규칙 (BR-MDI) | 100% 커버 |
| 에러 케이스 | 80% 커버 |

---

## 관련 문서

- 설계: `010-design.md`
- 추적성 매트릭스: `025-traceability-matrix.md`
- PRD: `.orchay/projects/mes-portal/prd.md`

---

<!--
Task: TSK-02-01 MDI 상태 관리
Created: 2026-01-20
Author: Claude
-->
