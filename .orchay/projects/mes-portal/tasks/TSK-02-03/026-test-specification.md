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
| Task ID | TSK-02-03 |
| Task명 | 탭 드래그 앤 드롭 |
| 설계 참조 | `010-design.md` |
| 추적성 매트릭스 참조 | `025-traceability-matrix.md` |
| 작성일 | 2026-01-20 |
| 작성자 | Claude |

---

## 1. 테스트 전략 개요

### 1.1 테스트 범위

| 테스트 유형 | 범위 | 목표 커버리지 |
|------------|------|--------------|
| 단위 테스트 | reorderTabs 함수, 드래그 핸들러 | 80% 이상 |
| E2E 테스트 | 탭 드래그 앤 드롭 사용자 시나리오 | 100% 시나리오 커버 |
| 매뉴얼 테스트 | 시각적 피드백, 접근성 | 전체 화면 |

### 1.2 테스트 환경

| 항목 | 내용 |
|------|------|
| 테스트 프레임워크 (단위) | Vitest |
| 테스트 프레임워크 (E2E) | Playwright |
| 테스트 데이터베이스 | - (프론트엔드 상태만) |
| 브라우저 | Chromium (기본) |
| 베이스 URL | `http://localhost:3000` |

---

## 2. 단위 테스트 시나리오

### 2.1 테스트 케이스 목록

| 테스트 ID | 대상 | 시나리오 | 예상 결과 | 요구사항 |
|-----------|------|----------|----------|----------|
| UT-001 | TabBar | 드래그 시작 | 드래그 상태 활성화 | FR-001 |
| UT-002 | TabBar | 드래그 중 위치 변경 | 드롭 인디케이터 표시 | FR-001 |
| UT-003 | reorderTabs | 탭 순서 변경 | 배열 순서 업데이트 | FR-003 |
| UT-004 | TabBar | ESC 키로 드래그 취소 | 원래 위치 복귀 | FR-004 |
| UT-005 | MDI Context | 순서 변경 후 유지 | 탭 전환 후에도 순서 유지 | BR-001 |
| UT-006 | reorderTabs | 동일 위치 드롭 | 상태 변경 없음 | BR-002 |
| UT-007 | TabBar | 탭 바 밖 드롭 | 드래그 취소 | BR-003 |

### 2.2 테스트 케이스 상세

#### UT-001: 드래그 시작

| 항목 | 내용 |
|------|------|
| **파일** | `__tests__/components/mdi/TabBar.test.tsx` |
| **테스트 블록** | `describe('TabBar') → describe('Drag and Drop') → it('should start drag when mousedown on tab')` |
| **Mock 의존성** | MDI Context mock |
| **입력 데이터** | 3개 탭 목록, 첫 번째 탭에 mousedown |
| **검증 포인트** | isDragging 상태 true, 드래그 탭 ID 설정 |
| **커버리지 대상** | handleDragStart 함수 |
| **관련 요구사항** | FR-001 |

#### UT-002: 드래그 중 위치 변경

| 항목 | 내용 |
|------|------|
| **파일** | `__tests__/components/mdi/TabBar.test.tsx` |
| **테스트 블록** | `describe('TabBar') → describe('Drag and Drop') → it('should show drop indicator on drag over')` |
| **Mock 의존성** | @dnd-kit DndContext mock |
| **입력 데이터** | 드래그 중 상태, 다른 탭 위로 이동 |
| **검증 포인트** | 드롭 인디케이터 요소 표시 |
| **커버리지 대상** | handleDragOver 함수 |
| **관련 요구사항** | FR-001 |

#### UT-003: reorderTabs 함수 테스트

| 항목 | 내용 |
|------|------|
| **파일** | `__tests__/lib/mdi/context.test.ts` |
| **테스트 블록** | `describe('MDI Context') → describe('reorderTabs') → it('should reorder tabs correctly')` |
| **Mock 의존성** | - |
| **입력 데이터** | tabs: [A, B, C], activeId: 'C', overId: 'A' |
| **검증 포인트** | 결과: [C, A, B] |
| **커버리지 대상** | reorderTabs 함수 |
| **관련 요구사항** | FR-003 |

```typescript
// 예상 테스트 코드
it('should reorder tabs correctly', () => {
  const tabs = [
    { id: 'A', title: 'Tab A', path: '/a' },
    { id: 'B', title: 'Tab B', path: '/b' },
    { id: 'C', title: 'Tab C', path: '/c' },
  ];

  const result = reorderTabs(tabs, 'C', 'A');

  expect(result.map(t => t.id)).toEqual(['C', 'A', 'B']);
});
```

#### UT-004: ESC 키로 드래그 취소

| 항목 | 내용 |
|------|------|
| **파일** | `__tests__/components/mdi/TabBar.test.tsx` |
| **테스트 블록** | `describe('TabBar') → describe('Drag and Drop') → it('should cancel drag on ESC key')` |
| **Mock 의존성** | MDI Context mock |
| **입력 데이터** | 드래그 중 상태, ESC 키 이벤트 |
| **검증 포인트** | 드래그 상태 초기화, 탭 순서 변경 없음 |
| **커버리지 대상** | handleKeyDown 함수 |
| **관련 요구사항** | FR-004 |

#### UT-005: 순서 변경 후 유지

| 항목 | 내용 |
|------|------|
| **파일** | `__tests__/lib/mdi/context.test.ts` |
| **테스트 블록** | `describe('MDI Context') → describe('reorderTabs') → it('should persist order after tab switch')` |
| **Mock 의존성** | - |
| **입력 데이터** | 순서 변경 후 setActiveTab 호출 |
| **검증 포인트** | 탭 순서 그대로 유지 |
| **커버리지 대상** | MDI Context 상태 관리 |
| **관련 요구사항** | BR-001 |

#### UT-006: 동일 위치 드롭

| 항목 | 내용 |
|------|------|
| **파일** | `__tests__/lib/mdi/context.test.ts` |
| **테스트 블록** | `describe('MDI Context') → describe('reorderTabs') → it('should not change order when dropped at same position')` |
| **Mock 의존성** | - |
| **입력 데이터** | activeId === overId |
| **검증 포인트** | 배열 참조 동일 (변경 없음) |
| **커버리지 대상** | reorderTabs 함수 조건문 |
| **관련 요구사항** | BR-002 |

```typescript
// 예상 테스트 코드
it('should not change order when dropped at same position', () => {
  const tabs = [
    { id: 'A', title: 'Tab A', path: '/a' },
    { id: 'B', title: 'Tab B', path: '/b' },
  ];

  const result = reorderTabs(tabs, 'A', 'A');

  expect(result).toBe(tabs); // 같은 참조
});
```

#### UT-007: 탭 바 밖 드롭

| 항목 | 내용 |
|------|------|
| **파일** | `__tests__/components/mdi/TabBar.test.tsx` |
| **테스트 블록** | `describe('TabBar') → describe('Drag and Drop') → it('should cancel drag when dropped outside tab bar')` |
| **Mock 의존성** | @dnd-kit DndContext mock |
| **입력 데이터** | DragEndEvent with over: null |
| **검증 포인트** | 탭 순서 변경 없음, 드래그 상태 초기화 |
| **커버리지 대상** | handleDragEnd 함수 |
| **관련 요구사항** | BR-003 |

---

## 3. E2E 테스트 시나리오

### 3.1 테스트 케이스 목록

| 테스트 ID | 시나리오 | 사전조건 | 실행 단계 | 예상 결과 | 요구사항 |
|-----------|----------|----------|----------|----------|----------|
| E2E-001 | 탭 순서 변경 | 3개 이상 탭 열림 | 탭 드래그 후 드롭 | 탭 순서 변경됨 | FR-001, FR-002, FR-003, BR-001 |
| E2E-002 | 드래그 취소 | 드래그 중 | ESC 키 입력 | 원래 위치 복귀 | FR-004 |
| E2E-003 | 영역 밖 드롭 | 드래그 중 | 탭 바 밖에서 드롭 | 원래 위치 복귀 | BR-003 |

### 3.2 테스트 케이스 상세

#### E2E-001: 탭 순서 변경

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/mdi-tab-dnd.spec.ts` |
| **테스트명** | `test('사용자가 탭을 드래그하여 순서를 변경할 수 있다')` |
| **사전조건** | 로그인, 3개 탭 열림 (대시보드, 작업지시, 생산현황) |
| **data-testid 셀렉터** | |
| - 탭 바 | `[data-testid="mdi-tab-bar"]` |
| - 탭 아이템 | `[data-testid="tab-item-{id}"]` |
| - 탭 드래그 핸들 | `[data-testid="tab-drag-handle-{id}"]` |
| **실행 단계** | |
| 1 | 세 번째 탭(생산현황)을 첫 번째 위치로 드래그 |
| 2 | 드롭 위치에서 마우스 버튼 놓기 |
| **검증 포인트** | `expect(tabBar.children[0]).toHaveAttribute('data-testid', 'tab-item-production')` |
| **스크린샷** | `e2e-001-before.png`, `e2e-001-after.png` |
| **관련 요구사항** | FR-001, FR-002, FR-003, BR-001 |

```typescript
// Playwright 테스트 코드 예시
test('사용자가 탭을 드래그하여 순서를 변경할 수 있다', async ({ page }) => {
  // 사전조건: 3개 탭 열림
  await page.goto('/portal');
  await page.click('[data-testid="menu-dashboard"]');
  await page.click('[data-testid="menu-work-order"]');
  await page.click('[data-testid="menu-production"]');

  // 스크린샷 (변경 전)
  await page.screenshot({ path: 'e2e-001-before.png' });

  // 세 번째 탭을 첫 번째 위치로 드래그
  const sourceTab = page.locator('[data-testid="tab-item-production"]');
  const targetTab = page.locator('[data-testid="tab-item-dashboard"]');

  await sourceTab.dragTo(targetTab, { targetPosition: { x: 0, y: 10 } });

  // 스크린샷 (변경 후)
  await page.screenshot({ path: 'e2e-001-after.png' });

  // 검증: 첫 번째 탭이 생산현황
  const tabBar = page.locator('[data-testid="mdi-tab-bar"]');
  const firstTab = tabBar.locator('> *').first();
  await expect(firstTab).toHaveAttribute('data-testid', 'tab-item-production');
});
```

#### E2E-002: 드래그 취소

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/mdi-tab-dnd.spec.ts` |
| **테스트명** | `test('ESC 키로 드래그를 취소할 수 있다')` |
| **사전조건** | 로그인, 2개 이상 탭 열림 |
| **data-testid 셀렉터** | |
| - 탭 아이템 | `[data-testid="tab-item-{id}"]` |
| **실행 단계** | |
| 1 | 탭을 드래그 시작 (mousedown + mousemove) |
| 2 | ESC 키 입력 |
| **검증 포인트** | 탭 순서 변경 없음 |
| **스크린샷** | `e2e-002-cancel.png` |
| **관련 요구사항** | FR-004 |

```typescript
test('ESC 키로 드래그를 취소할 수 있다', async ({ page }) => {
  await page.goto('/portal');
  // 2개 탭 열기
  await page.click('[data-testid="menu-dashboard"]');
  await page.click('[data-testid="menu-work-order"]');

  const originalOrder = await page.locator('[data-testid="mdi-tab-bar"] > *')
    .evaluateAll(tabs => tabs.map(t => t.getAttribute('data-testid')));

  // 드래그 시작
  const tab = page.locator('[data-testid="tab-item-work-order"]');
  await tab.hover();
  await page.mouse.down();
  await page.mouse.move(100, 0);

  // ESC 키로 취소
  await page.keyboard.press('Escape');

  // 검증: 순서 변경 없음
  const newOrder = await page.locator('[data-testid="mdi-tab-bar"] > *')
    .evaluateAll(tabs => tabs.map(t => t.getAttribute('data-testid')));

  expect(newOrder).toEqual(originalOrder);
});
```

#### E2E-003: 영역 밖 드롭

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/mdi-tab-dnd.spec.ts` |
| **테스트명** | `test('탭 바 영역 밖에서 드롭하면 취소된다')` |
| **사전조건** | 로그인, 2개 이상 탭 열림 |
| **data-testid 셀렉터** | |
| - 탭 바 | `[data-testid="mdi-tab-bar"]` |
| - 컨텐츠 영역 | `[data-testid="mdi-content"]` |
| **실행 단계** | |
| 1 | 탭을 컨텐츠 영역으로 드래그 |
| 2 | 컨텐츠 영역에서 드롭 |
| **검증 포인트** | 탭 순서 변경 없음, 탭이 원래 위치에 있음 |
| **관련 요구사항** | BR-003 |

---

## 4. UI 테스트케이스 (매뉴얼)

### 4.1 테스트 케이스 목록

| TC-ID | 테스트 항목 | 사전조건 | 테스트 단계 | 예상 결과 | 우선순위 | 요구사항 |
|-------|-----------|---------|-----------|----------|---------|----------|
| TC-001 | 탭 드래그 앤 드롭 | 3개 탭 열림 | 탭 드래그 후 드롭 | 순서 변경됨 | High | FR-001, FR-003 |
| TC-002 | 드래그 시각적 피드백 | 드래그 시작 | 탭 드래그 중 관찰 | 고스트, 인디케이터 표시 | Medium | FR-002 |
| TC-003 | 드래그 취소 | 드래그 중 | ESC 키 | 원래 위치 복귀 | Medium | FR-004 |
| TC-004 | 접근성 - 커서 변화 | - | 드래그 가능 영역 호버 | grab 커서 표시 | Low | - |
| TC-005 | 반응형 - 태블릿 | 태블릿 화면 | 터치 드래그 | 터치 드래그 동작 확인 | Low | - |
| TC-006 | 반응형 - 모바일 | 모바일 화면 | 드래그 시도 | 드래그 비활성화 확인 | Low | - |

### 4.2 매뉴얼 테스트 상세

#### TC-001: 탭 드래그 앤 드롭

**테스트 목적**: 사용자가 탭을 드래그하여 순서를 변경할 수 있는지 확인

**테스트 단계**:
1. 포털에 로그인
2. 3개 이상의 화면 열기 (대시보드, 작업지시, 생산현황)
3. 세 번째 탭을 마우스로 클릭한 채 첫 번째 위치로 드래그
4. 마우스 버튼 놓기

**예상 결과**:
- 탭이 새로운 위치로 이동
- 다른 탭들이 밀려서 재배치
- 탭 전환해도 순서 유지

**검증 기준**:
- [ ] 드래그 시작 시 탭이 반투명해짐
- [ ] 드래그 중 드롭 인디케이터 표시
- [ ] 드롭 후 탭 순서 변경 확인
- [ ] 탭 전환 후에도 순서 유지

#### TC-002: 드래그 시각적 피드백

**테스트 목적**: 드래그 중 시각적 피드백이 올바르게 표시되는지 확인

**테스트 단계**:
1. 탭 드래그 시작
2. 여러 위치로 탭 이동
3. 시각적 요소 관찰

**예상 결과**:
- 드래그 중인 탭이 반투명하게 표시
- 마우스 커서가 grabbing으로 변경
- 드롭 가능 위치에 파란색 세로 인디케이터 표시
- 탭 바 밖에서는 not-allowed 커서

**검증 기준**:
- [ ] 드래그 탭 반투명 효과
- [ ] 커서 변경 확인 (grab → grabbing)
- [ ] 드롭 인디케이터 위치 정확성
- [ ] 영역 밖 커서 변경 (not-allowed)

#### TC-003: 드래그 취소

**테스트 목적**: ESC 키 또는 영역 밖 드롭으로 드래그를 취소할 수 있는지 확인

**테스트 단계**:
1. 탭 드래그 시작
2. ESC 키 입력 또는 탭 바 밖에서 드롭

**예상 결과**:
- 탭이 원래 위치로 복귀
- 드래그 관련 시각적 피드백 제거

**검증 기준**:
- [ ] ESC 키로 드래그 취소 확인
- [ ] 탭 바 밖 드롭 시 취소 확인
- [ ] 탭 원래 위치 복귀 확인

---

## 5. 테스트 데이터 (Fixture)

### 5.1 단위 테스트용 Mock 데이터

| 데이터 ID | 용도 | 값 |
|-----------|------|-----|
| MOCK-TABS-3 | 3개 탭 목록 | `[{ id: 'A', title: 'Tab A', path: '/a' }, { id: 'B', title: 'Tab B', path: '/b' }, { id: 'C', title: 'Tab C', path: '/c' }]` |
| MOCK-TABS-2 | 2개 탭 목록 | `[{ id: 'A', title: 'Tab A', path: '/a' }, { id: 'B', title: 'Tab B', path: '/b' }]` |
| MOCK-ACTIVE-TAB | 활성 탭 ID | `'A'` |

### 5.2 E2E 테스트용 시드 데이터

| 시드 ID | 용도 | 생성 방법 | 포함 데이터 |
|---------|------|----------|------------|
| SEED-E2E-TABS | 탭 드래그 테스트 | 메뉴 클릭으로 탭 열기 | 대시보드, 작업지시, 생산현황 탭 |

### 5.3 테스트 계정

| 계정 ID | 이메일 | 비밀번호 | 역할 | 용도 |
|---------|--------|----------|------|------|
| TEST-USER | user@test.com | test1234 | USER | 일반 사용자 탭 드래그 테스트 |

---

## 6. data-testid 목록

> 프론트엔드 컴포넌트에 적용할 `data-testid` 속성 정의

### 6.1 탭 바 관련 셀렉터

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `mdi-tab-bar` | 탭 바 컨테이너 | 탭 바 영역 식별 |
| `tab-item-{id}` | 개별 탭 아이템 | 특정 탭 선택/조작 |
| `tab-drag-handle-{id}` | 탭 드래그 핸들 | 드래그 시작 영역 |
| `tab-close-btn-{id}` | 탭 닫기 버튼 | 탭 닫기 (기존) |
| `tab-drop-indicator` | 드롭 인디케이터 | 드롭 위치 표시 |
| `mdi-content` | MDI 컨텐츠 영역 | 탭 바 외부 영역 식별 |

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
TSK-02-03 Test Specification
Version: 1.0
Created: 2026-01-20
-->
