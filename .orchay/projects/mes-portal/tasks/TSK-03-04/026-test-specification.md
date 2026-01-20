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
| Task ID | TSK-03-04 |
| Task명 | 즐겨찾기 메뉴 |
| Domain | frontend |
| 설계 참조 | `010-design.md` |
| 추적성 매트릭스 참조 | `025-traceability-matrix.md` |
| 작성일 | 2026-01-20 |
| 작성자 | Claude |

---

## 1. 테스트 전략 개요

### 1.1 테스트 범위

| 테스트 유형 | 범위 | 목표 커버리지 |
|------------|------|--------------|
| 단위 테스트 | useFavorites 훅 (addFavorite, removeFavorite, isFavorite) | 90% 이상 |
| E2E 테스트 | 즐겨찾기 추가/제거, 빠른 메뉴 동작, 영속성 | 100% 시나리오 커버 |
| 매뉴얼 테스트 | UI 검증, 접근성, 반응형 | 전체 기능 |

### 1.2 테스트 환경

| 항목 | 내용 |
|------|------|
| 테스트 프레임워크 (단위) | Vitest |
| 테스트 프레임워크 (E2E) | Playwright |
| React 테스트 유틸리티 | @testing-library/react |
| localStorage Mock | vitest-localstorage-mock |
| 베이스 URL | `http://localhost:3000` |

### 1.3 요구사항 매핑

| 요구사항 ID | 요구사항명 | 테스트 커버리지 |
|------------|----------|----------------|
| FR-001 | 즐겨찾기 추가 | UT-001, UT-002, E2E-001 |
| FR-002 | 즐겨찾기 제거 | UT-003, E2E-002 |
| FR-003 | 빠른 메뉴 표시 | UT-004, E2E-002, E2E-003 |
| FR-004 | 영속성 (localStorage) | UT-005, UT-006, E2E-003 |
| BR-001 | 최대 10개 제한 | UT-002, E2E-004 |
| BR-002 | 중복 방지 | UT-001 |
| BR-003 | 순서 유지 | UT-004 |

---

## 2. 단위 테스트 시나리오

### 2.1 테스트 케이스 목록

| 테스트 ID | 대상 | 시나리오 | 예상 결과 | 요구사항 |
|-----------|------|----------|----------|----------|
| UT-001 | useFavorites.addFavorite | 즐겨찾기 추가 (정상) | favorites 배열에 메뉴 ID 추가 | FR-001, BR-002 |
| UT-002 | useFavorites.addFavorite | 최대 개수 제한 초과 | 추가 거부, 경고 반환 | FR-001, BR-001 |
| UT-003 | useFavorites.removeFavorite | 즐겨찾기 제거 | favorites 배열에서 메뉴 ID 제거 | FR-002 |
| UT-004 | useFavorites.getFavorites | 즐겨찾기 목록 조회 | 추가 순서대로 배열 반환 | FR-003, BR-003 |
| UT-005 | useFavorites.isFavorite | 즐겨찾기 여부 확인 | true/false 반환 | FR-001, FR-002 |
| UT-006 | useFavorites (init) | localStorage에서 초기화 | 저장된 데이터 로드 | FR-004 |

### 2.2 테스트 케이스 상세

#### UT-001: useFavorites.addFavorite 즐겨찾기 추가 (정상)

| 항목 | 내용 |
|------|------|
| **파일** | `lib/hooks/__tests__/useFavorites.spec.ts` |
| **테스트 블록** | `describe('useFavorites') -> describe('addFavorite') -> it('메뉴를 즐겨찾기에 추가한다')` |
| **Mock 의존성** | localStorage mock, userId mock |
| **입력 데이터** | `menuId: 101` |
| **검증 포인트** | 1. favorites 배열에 101 포함, 2. localStorage 저장 호출, 3. 중복 추가 시 배열 길이 변화 없음 |
| **커버리지 대상** | addFavorite() 정상 분기, 중복 방지 분기 |
| **관련 요구사항** | FR-001, BR-002 |

```typescript
// 테스트 의사 코드
it('메뉴를 즐겨찾기에 추가한다', () => {
  const { result } = renderHook(() => useFavorites(), { wrapper: AuthProvider });

  act(() => {
    result.current.addFavorite(101);
  });

  expect(result.current.favorites).toContain(101);
  expect(localStorage.setItem).toHaveBeenCalled();
});

it('이미 추가된 메뉴는 중복 추가되지 않는다', () => {
  const { result } = renderHook(() => useFavorites(), { wrapper: AuthProvider });

  act(() => {
    result.current.addFavorite(101);
    result.current.addFavorite(101); // 중복 시도
  });

  expect(result.current.favorites.filter(id => id === 101)).toHaveLength(1);
});
```

#### UT-002: useFavorites.addFavorite 최대 개수 제한 초과

| 항목 | 내용 |
|------|------|
| **파일** | `lib/hooks/__tests__/useFavorites.spec.ts` |
| **테스트 블록** | `describe('useFavorites') -> describe('addFavorite') -> it('최대 10개 초과 시 추가 거부')` |
| **Mock 의존성** | localStorage mock (10개 즐겨찾기 존재) |
| **입력 데이터** | 11번째 `menuId: 111` |
| **검증 포인트** | 1. favorites.length === 10, 2. 반환값에 에러 정보 포함 |
| **커버리지 대상** | addFavorite() 최대 개수 제한 분기 |
| **관련 요구사항** | FR-001, BR-001 |

```typescript
// 테스트 의사 코드
it('최대 10개 초과 시 추가 거부', () => {
  // 10개 즐겨찾기가 이미 있는 상태로 초기화
  localStorage.setItem('mes-favorites-1', JSON.stringify({
    userId: 1,
    menuIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    updatedAt: new Date().toISOString()
  }));

  const { result } = renderHook(() => useFavorites(), { wrapper: AuthProvider });

  let addResult;
  act(() => {
    addResult = result.current.addFavorite(111);
  });

  expect(result.current.favorites).toHaveLength(10);
  expect(addResult.success).toBe(false);
  expect(addResult.error).toBe('MAX_FAVORITES_EXCEEDED');
});
```

#### UT-003: useFavorites.removeFavorite 즐겨찾기 제거

| 항목 | 내용 |
|------|------|
| **파일** | `lib/hooks/__tests__/useFavorites.spec.ts` |
| **테스트 블록** | `describe('useFavorites') -> describe('removeFavorite') -> it('즐겨찾기에서 메뉴를 제거한다')` |
| **Mock 의존성** | localStorage mock |
| **입력 데이터** | `menuId: 101` (기존 즐겨찾기) |
| **검증 포인트** | 1. favorites 배열에서 101 제거, 2. localStorage 업데이트 |
| **커버리지 대상** | removeFavorite() 정상 분기 |
| **관련 요구사항** | FR-002 |

```typescript
// 테스트 의사 코드
it('즐겨찾기에서 메뉴를 제거한다', () => {
  const { result } = renderHook(() => useFavorites(), { wrapper: AuthProvider });

  // 먼저 추가
  act(() => {
    result.current.addFavorite(101);
    result.current.addFavorite(102);
  });

  expect(result.current.favorites).toContain(101);

  // 제거
  act(() => {
    result.current.removeFavorite(101);
  });

  expect(result.current.favorites).not.toContain(101);
  expect(result.current.favorites).toContain(102);
});
```

#### UT-004: useFavorites.getFavorites 즐겨찾기 목록 조회

| 항목 | 내용 |
|------|------|
| **파일** | `lib/hooks/__tests__/useFavorites.spec.ts` |
| **테스트 블록** | `describe('useFavorites') -> describe('getFavorites') -> it('추가 순서대로 목록 반환')` |
| **Mock 의존성** | localStorage mock, 메뉴 데이터 mock |
| **입력 데이터** | 없음 |
| **검증 포인트** | 1. 추가한 순서대로 반환, 2. 유효한 메뉴만 포함 |
| **커버리지 대상** | getFavorites() 순서 유지 로직 |
| **관련 요구사항** | FR-003, BR-003 |

```typescript
// 테스트 의사 코드
it('추가 순서대로 목록 반환', () => {
  const { result } = renderHook(() => useFavorites(), { wrapper: AuthProvider });

  act(() => {
    result.current.addFavorite(103);
    result.current.addFavorite(101);
    result.current.addFavorite(102);
  });

  const favorites = result.current.favorites;
  expect(favorites).toEqual([103, 101, 102]); // 추가 순서 유지
});
```

#### UT-005: useFavorites.isFavorite 즐겨찾기 여부 확인

| 항목 | 내용 |
|------|------|
| **파일** | `lib/hooks/__tests__/useFavorites.spec.ts` |
| **테스트 블록** | `describe('useFavorites') -> describe('isFavorite') -> it('즐겨찾기 여부를 반환한다')` |
| **Mock 의존성** | localStorage mock |
| **입력 데이터** | `menuId: 101` (즐겨찾기됨), `menuId: 999` (즐겨찾기 안됨) |
| **검증 포인트** | 1. 즐겨찾기된 메뉴 -> true, 2. 즐겨찾기 안된 메뉴 -> false |
| **커버리지 대상** | isFavorite() 함수 |
| **관련 요구사항** | FR-001, FR-002 |

```typescript
// 테스트 의사 코드
it('즐겨찾기 여부를 반환한다', () => {
  const { result } = renderHook(() => useFavorites(), { wrapper: AuthProvider });

  act(() => {
    result.current.addFavorite(101);
  });

  expect(result.current.isFavorite(101)).toBe(true);
  expect(result.current.isFavorite(999)).toBe(false);
});
```

#### UT-006: useFavorites localStorage에서 초기화

| 항목 | 내용 |
|------|------|
| **파일** | `lib/hooks/__tests__/useFavorites.spec.ts` |
| **테스트 블록** | `describe('useFavorites') -> describe('initialization') -> it('localStorage에서 데이터 로드')` |
| **Mock 의존성** | localStorage mock (기존 데이터 존재) |
| **입력 데이터** | 저장된 favorites: `[101, 102, 103]` |
| **검증 포인트** | 1. 훅 마운트 시 localStorage 데이터 로드, 2. favorites 상태 초기화 |
| **커버리지 대상** | useFavorites 초기화 로직 |
| **관련 요구사항** | FR-004 |

```typescript
// 테스트 의사 코드
it('localStorage에서 데이터 로드', () => {
  // localStorage에 기존 데이터 설정
  localStorage.setItem('mes-favorites-1', JSON.stringify({
    userId: 1,
    menuIds: [101, 102, 103],
    updatedAt: new Date().toISOString()
  }));

  const { result } = renderHook(() => useFavorites(), { wrapper: AuthProvider });

  expect(result.current.favorites).toEqual([101, 102, 103]);
});

it('localStorage 데이터가 손상된 경우 빈 배열로 초기화', () => {
  localStorage.setItem('mes-favorites-1', 'invalid-json');

  const { result } = renderHook(() => useFavorites(), { wrapper: AuthProvider });

  expect(result.current.favorites).toEqual([]);
});
```

---

## 3. E2E 테스트 시나리오

### 3.1 테스트 케이스 목록

| 테스트 ID | 시나리오 | 사전조건 | 실행 단계 | 예상 결과 | 요구사항 |
|-----------|----------|----------|----------|----------|----------|
| E2E-001 | 즐겨찾기 추가 | 로그인, 메뉴 표시 | 메뉴 호버 -> 별 아이콘 클릭 | 토스트 표시, 아이콘 변경, 빠른메뉴에 추가 | FR-001 |
| E2E-002 | 즐겨찾기 제거/빠른메뉴 확인 | 즐겨찾기 1개 이상 | 빠른메뉴 열기 -> 즐겨찾기 확인 -> 사이드바에서 별 클릭 | 빠른메뉴에 메뉴 표시, 제거 후 목록 갱신 | FR-002, FR-003 |
| E2E-003 | 새로고침 후 유지 확인 | 즐겨찾기 추가됨 | 페이지 새로고침 | 즐겨찾기 상태 유지 | FR-004 |
| E2E-004 | 최대 개수 초과 시 알림 | 즐겨찾기 10개 | 11번째 추가 시도 | 경고 토스트 표시, 추가 안됨 | BR-001 |

### 3.2 테스트 케이스 상세

#### E2E-001: 즐겨찾기 추가

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/favorites.spec.ts` |
| **테스트명** | `test('사이드바 메뉴에서 즐겨찾기를 추가할 수 있다')` |
| **사전조건** | 로그인 완료, 사이드바 표시 |
| **data-testid 셀렉터** | |
| - 메뉴 아이템 | `[data-testid="menu-item-{menuCode}"]` |
| - 즐겨찾기 토글 버튼 | `[data-testid="favorite-toggle-btn"]` |
| - 빠른 메뉴 버튼 | `[data-testid="quick-menu-btn"]` |
| - 빠른 메뉴 드롭다운 | `[data-testid="quick-menu-dropdown"]` |
| - 즐겨찾기 메뉴 아이템 | `[data-testid="favorite-menu-item"]` |
| - 토스트 메시지 | `[data-testid="toast-message"]` |
| **실행 단계** | |
| 1 | `await page.hover('[data-testid="menu-item-WORK_ORDER"]')` |
| 2 | `await page.click('[data-testid="favorite-toggle-btn"]')` |
| **검증 포인트** | |
| - 토스트 | `expect(page.locator('[data-testid="toast-message"]')).toContainText('즐겨찾기에 추가되었습니다')` |
| - 아이콘 변경 | 별 아이콘이 채워진 상태로 변경 |
| - 빠른메뉴 확인 | 빠른메뉴 드롭다운에 메뉴 표시 |
| **스크린샷** | `e2e-001-add-favorite.png` |
| **관련 요구사항** | FR-001 |

```typescript
// 테스트 의사 코드
test('사이드바 메뉴에서 즐겨찾기를 추가할 수 있다', async ({ page }) => {
  // 로그인 후 포털 진입
  await page.goto('/portal');

  // 메뉴 호버하여 즐겨찾기 버튼 표시
  await page.hover('[data-testid="menu-item-WORK_ORDER"]');

  // 즐겨찾기 버튼 클릭
  await page.click('[data-testid="favorite-toggle-btn"]');

  // 토스트 메시지 확인
  await expect(page.locator('[data-testid="toast-message"]')).toContainText('즐겨찾기에 추가되었습니다');

  // 빠른 메뉴 열기
  await page.click('[data-testid="quick-menu-btn"]');

  // 즐겨찾기 목록에 메뉴 표시 확인
  await expect(page.locator('[data-testid="quick-menu-dropdown"]')).toContainText('작업지시조회');
});
```

#### E2E-002: 즐겨찾기 제거 및 빠른메뉴 확인

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/favorites.spec.ts` |
| **테스트명** | `test('즐겨찾기를 제거하면 빠른메뉴에서 사라진다')` |
| **사전조건** | 즐겨찾기 1개 이상 추가된 상태 |
| **data-testid 셀렉터** | |
| - 빠른 메뉴 버튼 | `[data-testid="quick-menu-btn"]` |
| - 빠른 메뉴 드롭다운 | `[data-testid="quick-menu-dropdown"]` |
| - 즐겨찾기 메뉴 아이템 | `[data-testid="favorite-menu-item"]` |
| - 즐겨찾기 토글 버튼 | `[data-testid="favorite-toggle-btn"]` |
| **실행 단계** | |
| 1 | 즐겨찾기 추가 (E2E-001 단계) |
| 2 | `await page.click('[data-testid="quick-menu-btn"]')` |
| 3 | 드롭다운에 메뉴 표시 확인 |
| 4 | `await page.click('[data-testid="favorite-menu-item"]')` -> MDI 탭 열기 |
| 5 | 사이드바에서 해당 메뉴의 별 아이콘 클릭 (제거) |
| 6 | 빠른 메뉴 다시 열어서 목록 확인 |
| **검증 포인트** | |
| - 드롭다운 표시 | 빠른 메뉴 클릭 시 드롭다운 표시 |
| - 메뉴 클릭 시 탭 열림 | MDI 탭에 해당 화면 추가 |
| - 제거 후 목록 갱신 | 빠른 메뉴에서 해당 메뉴 사라짐 |
| **스크린샷** | `e2e-002-remove-favorite.png` |
| **관련 요구사항** | FR-002, FR-003 |

```typescript
// 테스트 의사 코드
test('즐겨찾기를 제거하면 빠른메뉴에서 사라진다', async ({ page }) => {
  // 사전: 즐겨찾기 추가
  await page.hover('[data-testid="menu-item-WORK_ORDER"]');
  await page.click('[data-testid="favorite-toggle-btn"]');

  // 빠른 메뉴 열기
  await page.click('[data-testid="quick-menu-btn"]');
  await expect(page.locator('[data-testid="quick-menu-dropdown"]')).toBeVisible();

  // 즐겨찾기 메뉴 클릭하여 탭 열기
  await page.click('[data-testid="favorite-menu-item"]');
  await expect(page.locator('[data-testid="mdi-tab-WORK_ORDER"]')).toBeVisible();

  // 사이드바에서 즐겨찾기 제거
  await page.hover('[data-testid="menu-item-WORK_ORDER"]');
  await page.click('[data-testid="favorite-toggle-btn"]');

  // 토스트 메시지 확인
  await expect(page.locator('[data-testid="toast-message"]')).toContainText('즐겨찾기에서 제거되었습니다');

  // 빠른 메뉴 다시 열기
  await page.click('[data-testid="quick-menu-btn"]');

  // 해당 메뉴가 목록에서 사라졌는지 확인
  await expect(page.locator('[data-testid="quick-menu-dropdown"]')).not.toContainText('작업지시조회');
});
```

#### E2E-003: 새로고침 후 유지 확인

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/favorites.spec.ts` |
| **테스트명** | `test('페이지 새로고침 후에도 즐겨찾기가 유지된다')` |
| **사전조건** | 즐겨찾기 추가된 상태 |
| **data-testid 셀렉터** | |
| - 빠른 메뉴 버튼 | `[data-testid="quick-menu-btn"]` |
| - 빠른 메뉴 드롭다운 | `[data-testid="quick-menu-dropdown"]` |
| - 즐겨찾기 토글 버튼 | `[data-testid="favorite-toggle-btn"]` |
| **실행 단계** | |
| 1 | 즐겨찾기 추가 |
| 2 | `await page.reload()` |
| 3 | 빠른 메뉴 열기 |
| 4 | 즐겨찾기 목록 확인 |
| **검증 포인트** | 새로고침 후에도 추가했던 즐겨찾기가 그대로 표시됨 |
| **스크린샷** | `e2e-003-persistence.png` |
| **관련 요구사항** | FR-004 |

```typescript
// 테스트 의사 코드
test('페이지 새로고침 후에도 즐겨찾기가 유지된다', async ({ page }) => {
  // 즐겨찾기 추가
  await page.hover('[data-testid="menu-item-WORK_ORDER"]');
  await page.click('[data-testid="favorite-toggle-btn"]');

  // 페이지 새로고침
  await page.reload();

  // 빠른 메뉴 열기
  await page.click('[data-testid="quick-menu-btn"]');

  // 즐겨찾기 유지 확인
  await expect(page.locator('[data-testid="quick-menu-dropdown"]')).toContainText('작업지시조회');

  // 사이드바 메뉴의 별 아이콘도 채워진 상태인지 확인
  await page.hover('[data-testid="menu-item-WORK_ORDER"]');
  await expect(page.locator('[data-testid="favorite-toggle-btn"]')).toHaveAttribute('data-favorited', 'true');
});
```

#### E2E-004: 최대 개수 초과 시 알림

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/favorites.spec.ts` |
| **테스트명** | `test('즐겨찾기 최대 개수(10개) 초과 시 경고 메시지가 표시된다')` |
| **사전조건** | 즐겨찾기 10개 추가된 상태 |
| **data-testid 셀렉터** | |
| - 즐겨찾기 토글 버튼 | `[data-testid="favorite-toggle-btn"]` |
| - 토스트 메시지 | `[data-testid="toast-message"]` |
| **실행 단계** | |
| 1 | 10개 메뉴를 즐겨찾기에 추가 (테스트 fixture 사용) |
| 2 | 11번째 메뉴에서 즐겨찾기 버튼 클릭 |
| **검증 포인트** | |
| - 토스트 | 경고 메시지 "즐겨찾기는 최대 10개까지 추가할 수 있습니다" |
| - 추가 안됨 | 빠른 메뉴에 11번째 메뉴 없음 |
| **스크린샷** | `e2e-004-max-favorites.png` |
| **관련 요구사항** | BR-001 |

```typescript
// 테스트 의사 코드
test('즐겨찾기 최대 개수(10개) 초과 시 경고 메시지가 표시된다', async ({ page }) => {
  // fixture로 10개 즐겨찾기 설정
  await page.evaluate(() => {
    localStorage.setItem('mes-favorites-1', JSON.stringify({
      userId: 1,
      menuIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      updatedAt: new Date().toISOString()
    }));
  });

  await page.reload();

  // 11번째 메뉴에 즐겨찾기 시도
  await page.hover('[data-testid="menu-item-QUALITY_CHECK"]');
  await page.click('[data-testid="favorite-toggle-btn"]');

  // 경고 메시지 확인
  await expect(page.locator('[data-testid="toast-message"]')).toContainText('즐겨찾기는 최대 10개까지');

  // 빠른 메뉴에 11번째 메뉴가 없는지 확인
  await page.click('[data-testid="quick-menu-btn"]');
  await expect(page.locator('[data-testid="quick-menu-dropdown"]')).not.toContainText('품질검사');
});
```

---

## 4. UI 테스트케이스 (매뉴얼)

### 4.1 테스트 케이스 목록

| TC-ID | 테스트 항목 | 사전조건 | 테스트 단계 | 예상 결과 | 우선순위 | 요구사항 |
|-------|-----------|---------|-----------|----------|---------|----------|
| TC-001 | 별 아이콘 UI 검증 | 로그인, 사이드바 표시 | 메뉴 호버 | 별 아이콘 표시, 시각적 피드백 | High | FR-001 |
| TC-002 | 빠른 메뉴 드롭다운 UI | 즐겨찾기 있음 | 빠른 메뉴 버튼 클릭 | 드롭다운 표시, 메뉴 목록 | High | FR-003 |
| TC-003 | 접근성 검증 | 로그인 | 키보드 네비게이션 | Tab/Enter로 조작 가능 | Medium | - |
| TC-004 | 반응형 UI | 다양한 화면 크기 | 화면 크기 변경 | 레이아웃 적응 | Medium | - |

### 4.2 매뉴얼 테스트 상세

#### TC-001: 별 아이콘 UI 검증

**테스트 목적**: 사이드바 메뉴의 즐겨찾기 토글 버튼(별 아이콘) UI가 올바르게 표시되는지 확인

**테스트 단계**:
1. 로그인 후 포털 진입
2. 사이드바에서 화면 메뉴(리프 노드)에 마우스 호버
3. 별 아이콘 표시 확인
4. 별 아이콘에 마우스 호버
5. 별 아이콘 클릭
6. 아이콘 상태 변경 확인

**예상 결과**:
- 메뉴 호버 시 별 아이콘(빈 별)이 우측에 표시됨
- 별 아이콘 호버 시 커서가 포인터로 변경되고 살짝 확대됨
- 클릭 시 회전 애니메이션과 함께 채워진 별로 변경됨
- 토스트 메시지 표시됨

**검증 기준**:
- [ ] 폴더 메뉴에는 별 아이콘이 표시되지 않음
- [ ] 화면 메뉴 호버 시 별 아이콘 표시됨
- [ ] 별 아이콘 클릭 시 상태 토글됨
- [ ] 애니메이션이 부드럽게 동작함
- [ ] 즐겨찾기된 메뉴는 호버하지 않아도 채워진 별 표시

#### TC-002: 빠른 메뉴 드롭다운 UI

**테스트 목적**: 헤더의 빠른 메뉴 드롭다운이 올바르게 동작하는지 확인

**테스트 단계**:
1. 여러 메뉴를 즐겨찾기에 추가 (3개 이상)
2. 헤더의 빠른 메뉴 버튼 클릭
3. 드롭다운 표시 확인
4. 메뉴 항목 클릭
5. 드롭다운 외부 클릭

**예상 결과**:
- 빠른 메뉴 버튼 클릭 시 드롭다운이 슬라이드 다운됨
- 즐겨찾기 목록이 추가 순서대로 표시됨
- 메뉴 항목 클릭 시 MDI 탭으로 해당 화면 열림
- 드롭다운이 자동으로 닫힘
- 외부 클릭 시 드롭다운 닫힘

**검증 기준**:
- [ ] 드롭다운 헤더에 "즐겨찾기" 제목 표시
- [ ] 메뉴 항목에 아이콘과 이름 표시
- [ ] 메뉴 항목 호버 시 하이라이트
- [ ] 클릭 시 MDI 탭 열림
- [ ] 드롭다운 닫힘 동작 정상

#### TC-003: 접근성 검증

**테스트 목적**: 키보드 사용자와 스크린 리더 사용자를 위한 접근성 확인

**테스트 단계**:
1. Tab 키로 빠른 메뉴 버튼 포커스
2. Enter 키로 드롭다운 열기
3. 화살표 키로 메뉴 항목 이동
4. Enter 키로 메뉴 선택
5. Escape 키로 드롭다운 닫기
6. 사이드바 메뉴의 별 아이콘 Tab/Space로 조작

**예상 결과**:
- 모든 인터랙티브 요소에 포커스 가능
- 키보드만으로 전체 기능 사용 가능
- 스크린 리더가 적절한 안내 제공

**검증 기준**:
- [ ] Tab 키로 순차적 포커스 이동
- [ ] 포커스 시 시각적 표시 (outline)
- [ ] Enter/Space로 클릭 동작
- [ ] Escape로 드롭다운 닫기
- [ ] aria-label 또는 aria-describedby 제공
- [ ] 상태 변경 시 스크린 리더 안내 (aria-live)

#### TC-004: 반응형 UI

**테스트 목적**: 다양한 화면 크기에서 즐겨찾기 기능이 정상 동작하는지 확인

**테스트 단계**:
1. 데스크톱 (1920x1080) 에서 기능 테스트
2. 태블릿 (768x1024) 으로 화면 크기 변경 후 테스트
3. 모바일 (375x667) 으로 화면 크기 변경 후 테스트

**예상 결과**:
- 데스크톱: 모든 기능 정상 동작
- 태블릿: 사이드바 접힘 기본, 빠른 메뉴 정상
- 모바일: 빠른 메뉴 드롭다운이 화면 너비에 맞게 조정

**검증 기준**:
- [ ] 데스크톱 UI 정상 표시
- [ ] 태블릿에서 빠른 메뉴 접근 가능
- [ ] 모바일에서 터치로 조작 가능
- [ ] 드롭다운이 화면을 벗어나지 않음

---

## 5. 테스트 데이터 (Fixture)

### 5.1 단위 테스트용 Mock 데이터

| 데이터 ID | 용도 | 값 |
|-----------|------|-----|
| MOCK-USER-01 | 테스트 사용자 | `{ id: 1, name: 'TestUser', email: 'test@test.com' }` |
| MOCK-MENU-01 | 최상위 화면 메뉴 | `{ id: 101, code: 'DASHBOARD', name: '대시보드', path: '/portal/dashboard', parentId: null, icon: 'DashboardOutlined' }` |
| MOCK-MENU-02 | 부모 메뉴 (폴더) | `{ id: 200, code: 'PRODUCTION', name: '생산관리', path: null, parentId: null, icon: 'SettingOutlined' }` |
| MOCK-MENU-03 | 2단계 화면 메뉴 | `{ id: 201, code: 'WORK_ORDER', name: '작업지시조회', path: '/portal/production/work-order', parentId: 200, icon: 'FileTextOutlined' }` |
| MOCK-MENU-04 | 2단계 화면 메뉴 | `{ id: 202, code: 'PRODUCTION_RESULT', name: '생산실적입력', path: '/portal/production/result', parentId: 200, icon: 'EditOutlined' }` |
| MOCK-MENU-05 | 3단계 화면 메뉴 | `{ id: 301, code: 'QUALITY_CHECK', name: '품질검사', path: '/portal/quality/check', parentId: 300, icon: 'CheckCircleOutlined' }` |
| MOCK-FAVORITES-EMPTY | 빈 즐겨찾기 | `{ userId: 1, menuIds: [], updatedAt: '2026-01-20T00:00:00Z' }` |
| MOCK-FAVORITES-PARTIAL | 즐겨찾기 3개 | `{ userId: 1, menuIds: [101, 201, 202], updatedAt: '2026-01-20T00:00:00Z' }` |
| MOCK-FAVORITES-MAX | 즐겨찾기 10개 | `{ userId: 1, menuIds: [1,2,3,4,5,6,7,8,9,10], updatedAt: '2026-01-20T00:00:00Z' }` |

### 5.2 메뉴 목록 Mock 데이터 (Fixture)

```typescript
// lib/hooks/__tests__/fixtures/menus.fixture.ts
export const mockMenuTree = [
  {
    id: 101,
    code: 'DASHBOARD',
    name: '대시보드',
    path: '/portal/dashboard',
    icon: 'DashboardOutlined',
    parentId: null,
    sortOrder: 1,
    children: [],
  },
  {
    id: 200,
    code: 'PRODUCTION',
    name: '생산관리',
    path: null,
    icon: 'SettingOutlined',
    parentId: null,
    sortOrder: 2,
    children: [
      {
        id: 201,
        code: 'WORK_ORDER',
        name: '작업지시조회',
        path: '/portal/production/work-order',
        icon: 'FileTextOutlined',
        parentId: 200,
        sortOrder: 1,
        children: [],
      },
      {
        id: 202,
        code: 'PRODUCTION_RESULT',
        name: '생산실적입력',
        path: '/portal/production/result',
        icon: 'EditOutlined',
        parentId: 200,
        sortOrder: 2,
        children: [],
      },
    ],
  },
  {
    id: 300,
    code: 'QUALITY',
    name: '품질관리',
    path: null,
    icon: 'SafetyCertificateOutlined',
    parentId: null,
    sortOrder: 3,
    children: [
      {
        id: 301,
        code: 'QUALITY_CHECK',
        name: '품질검사',
        path: '/portal/quality/check',
        icon: 'CheckCircleOutlined',
        parentId: 300,
        sortOrder: 1,
        children: [],
      },
    ],
  },
];
```

### 5.3 즐겨찾기 초기 상태 (Fixture)

```typescript
// lib/hooks/__tests__/fixtures/favorites.fixture.ts
export const emptyFavorites = {
  userId: 1,
  menuIds: [],
  updatedAt: '2026-01-20T00:00:00Z',
};

export const partialFavorites = {
  userId: 1,
  menuIds: [101, 201, 202],
  updatedAt: '2026-01-20T00:00:00Z',
};

export const maxFavorites = {
  userId: 1,
  menuIds: [101, 201, 202, 203, 204, 205, 206, 207, 208, 209],
  updatedAt: '2026-01-20T00:00:00Z',
};

export const corruptedFavorites = 'invalid-json-string';
```

### 5.4 E2E 테스트용 시드 데이터

| 시드 ID | 용도 | 생성 방법 | 포함 데이터 |
|---------|------|----------|------------|
| SEED-FAVORITES-EMPTY | 즐겨찾기 없음 | localStorage 초기화 | 빈 배열 |
| SEED-FAVORITES-3 | 즐겨찾기 3개 | localStorage 설정 | 메뉴 3개 |
| SEED-FAVORITES-10 | 즐겨찾기 최대 | localStorage 설정 | 메뉴 10개 |

### 5.5 테스트 계정

| 계정 ID | 이메일 | 비밀번호 | 역할 | 용도 |
|---------|--------|----------|------|------|
| TEST-USER | user@test.com | test1234 | USER | 일반 사용자 즐겨찾기 테스트 |

---

## 6. data-testid 목록

> 프론트엔드 컴포넌트에 적용할 `data-testid` 속성 정의

### 6.1 사이드바 즐겨찾기 관련

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `favorite-toggle-btn` | 즐겨찾기 토글 버튼 (별 아이콘) | 즐겨찾기 추가/제거 |
| `favorite-toggle-btn[data-favorited="true"]` | 즐겨찾기된 상태 | 상태 확인 |
| `favorite-toggle-btn[data-favorited="false"]` | 즐겨찾기 안된 상태 | 상태 확인 |

### 6.2 빠른 메뉴 관련

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `quick-menu-btn` | 헤더 빠른 메뉴 버튼 | 드롭다운 열기 |
| `quick-menu-dropdown` | 빠른 메뉴 드롭다운 컨테이너 | 드롭다운 표시 확인 |
| `quick-menu-header` | 드롭다운 헤더 ("즐겨찾기") | 헤더 표시 확인 |
| `favorite-menu-item` | 즐겨찾기 메뉴 항목 | 메뉴 클릭 |
| `favorite-menu-item-{menuCode}` | 특정 메뉴 항목 | 특정 메뉴 선택 |
| `quick-menu-empty` | 빈 상태 메시지 | 빈 상태 확인 |
| `quick-menu-hint` | 사용법 힌트 | 힌트 표시 확인 |

### 6.3 컴포넌트별 data-testid 적용 위치

#### FavoriteToggleButton 컴포넌트

```tsx
// components/layout/Sidebar/FavoriteToggleButton.tsx
<button
  data-testid="favorite-toggle-btn"
  data-favorited={isFavorite}
  aria-label={isFavorite ? '즐겨찾기에서 제거' : '즐겨찾기에 추가'}
>
  {isFavorite ? <StarFilled /> : <StarOutlined />}
</button>
```

#### QuickMenu 컴포넌트

```tsx
// components/layout/Header/QuickMenu.tsx
<button data-testid="quick-menu-btn" aria-label="빠른 메뉴 열기">
  <StarOutlined /> 빠른메뉴
</button>

<div data-testid="quick-menu-dropdown" role="menu">
  <div data-testid="quick-menu-header">즐겨찾기</div>

  {favorites.length === 0 ? (
    <div data-testid="quick-menu-empty">즐겨찾기한 메뉴가 없습니다</div>
  ) : (
    favorites.map(menu => (
      <div
        key={menu.id}
        data-testid="favorite-menu-item"
        data-testid-menu={`favorite-menu-item-${menu.code}`}
        role="menuitem"
      >
        {menu.icon && <Icon type={menu.icon} />}
        {menu.name}
      </div>
    ))
  )}

  <div data-testid="quick-menu-hint">
    사이드바 메뉴에서 별 아이콘을 클릭하여 추가하세요
  </div>
</div>
```

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
| 기능 요구사항 (FR) | 100% 커버 |
| 비즈니스 규칙 (BR) | 100% 커버 |
| 에러 케이스 | 80% 커버 |

### 7.3 커버리지 대상 파일

| 파일 경로 | 테스트 유형 | 목표 |
|----------|------------|------|
| `lib/hooks/useFavorites.ts` | 단위 | 90% |
| `components/layout/Sidebar/FavoriteToggleButton.tsx` | 단위+E2E | 85% |
| `components/layout/Header/QuickMenu.tsx` | 단위+E2E | 85% |
| `lib/utils/localStorage.ts` | 단위 | 90% |

---

## 8. 에러 시나리오 테스트

### 8.1 localStorage 관련 에러

| 시나리오 | 테스트 ID | 예상 동작 |
|---------|----------|----------|
| localStorage 용량 초과 | UT-ERR-01 | 에러 토스트 표시, 메모리에만 유지 |
| localStorage 접근 불가 (비공개 모드) | UT-ERR-02 | 세션 동안만 메모리에 유지 |
| 저장된 데이터 손상 | UT-ERR-03 | 빈 배열로 초기화, 사용자 알림 없음 |

### 8.2 네트워크/API 에러

| 시나리오 | 테스트 ID | 예상 동작 |
|---------|----------|----------|
| 메뉴 데이터 로드 실패 | E2E-ERR-01 | 빠른 메뉴에 에러 메시지 표시 |
| 삭제된 메뉴 참조 | UT-ERR-04 | 유효하지 않은 메뉴 ID 자동 정리 |

---

## 관련 문서

- 설계: `010-design.md`
- 추적성 매트릭스: `025-traceability-matrix.md`
- PRD: `.orchay/projects/mes-portal/prd.md`
- 관련 Task: TSK-03-03 (메뉴 API), TSK-01-03 (사이드바), TSK-02-01 (MDI)

---

<!--
Task: TSK-03-04 즐겨찾기 메뉴
Created: 2026-01-20
Author: Claude
-->
