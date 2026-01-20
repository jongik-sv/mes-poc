# 테스트 명세서 (026-test-specification.md)

**Template Version:** 1.0.0 — **Last Updated:** 2026-01-20

> **목적**: 키보드 단축키 시스템 테스트 시나리오 정의
>
> **참조**: 이 문서는 설계 문서 및 추적성 매트릭스와 함께 사용됩니다.
>
> **활용 단계**: `/wf:build`, `/wf:test` 단계에서 테스트 코드 생성 기준으로 사용

---

## 0. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| Task ID | TSK-05-06 |
| Task명 | 키보드 단축키 시스템 |
| 카테고리 | development |
| 도메인 | frontend |
| 기술 스펙 | react-hotkeys-hook |
| 작성일 | 2026-01-20 |
| 작성자 | AI |

---

## 1. 테스트 전략 개요

### 1.1 테스트 범위

| 테스트 유형 | 범위 | 목표 커버리지 |
|------------|------|--------------|
| 단위 테스트 | useHotkeys 훅, HotkeyHelp 컴포넌트 | 80% 이상 |
| E2E 테스트 | 전역 단축키 동작, 모달 열기/닫기 | 100% 시나리오 커버 |
| 매뉴얼 테스트 | Mac/Windows 환경, 접근성 | 전체 화면 |

### 1.2 테스트 환경

| 항목 | 내용 |
|------|------|
| 테스트 프레임워크 (단위) | Vitest + React Testing Library |
| 테스트 프레임워크 (E2E) | Playwright |
| 브라우저 | Chromium (기본), Firefox, WebKit |
| 베이스 URL | `http://localhost:3000` |
| 테스트 환경 | Windows, macOS (modifier 키 차이 테스트) |
| 반응형 테스트 뷰포트 | Desktop (1280x720) |

### 1.3 테스트 대상 컴포넌트

| 컴포넌트 | 파일 경로 | 역할 |
|----------|----------|------|
| useHotkeys | `lib/hooks/useHotkeys.ts` | 키보드 단축키 커스텀 훅 |
| HotkeyHelp | `components/common/HotkeyHelp.tsx` | 단축키 도움말 모달 컴포넌트 |

### 1.4 테스트 우선순위

| 우선순위 | 테스트 영역 | 이유 |
|---------|-----------|------|
| P1 (필수) | 전역 단축키 동작 (Ctrl+K, ?) | 핵심 사용자 경험 |
| P1 (필수) | 입력 필드 포커스 시 비활성화 | 사용자 입력 방해 방지 |
| P2 (중요) | 모달 열기/닫기 | UI 인터랙션 |
| P2 (중요) | Mac/Windows modifier 키 | 크로스 플랫폼 지원 |
| P3 (선택) | 단축키 목록 렌더링 | 도움말 기능 |

---

## 2. 단위 테스트 시나리오

### 2.1 테스트 케이스 목록

| 테스트 ID | 대상 | 시나리오 | 예상 결과 | 요구사항 |
|-----------|------|----------|----------|----------|
| UT-0506-001 | useHotkeys | Ctrl+K 키 조합 감지 | 콜백 함수 호출 | FR-001 |
| UT-0506-002 | useHotkeys | Cmd+K (Mac) 키 조합 감지 | 콜백 함수 호출 | FR-001 |
| UT-0506-003 | useHotkeys | 입력 필드 포커스 시 단축키 무시 | 콜백 미호출 | BR-001 |
| UT-0506-004 | useHotkeys | 등록/해제 lifecycle | cleanup 함수 호출 | FR-002 |
| UT-0506-005 | HotkeyHelp | 모달 열기/닫기 | open 상태 변경 | FR-003 |
| UT-0506-006 | HotkeyHelp | 단축키 목록 렌더링 | 모든 단축키 항목 표시 | FR-004 |

### 2.2 테스트 케이스 상세

#### UT-0506-001: useHotkeys 훅 - Ctrl+K 키 조합 감지

| 항목 | 내용 |
|------|------|
| **파일** | `lib/hooks/__tests__/useHotkeys.test.ts` |
| **테스트 블록** | `describe('useHotkeys') -> it('calls callback on Ctrl+K')` |
| **Mock 의존성** | - |
| **입력 데이터** | `{ keys: 'ctrl+k', callback: mockFn }` |
| **검증 포인트** | Ctrl+K 키 이벤트 발생 시 콜백 함수 호출 |
| **커버리지 대상** | useHotkeys 훅 키 이벤트 감지 로직 |
| **관련 요구사항** | FR-001 |

```typescript
// lib/hooks/__tests__/useHotkeys.test.ts
import { renderHook } from '@testing-library/react';
import { fireEvent } from '@testing-library/dom';
import { useHotkeys } from '../useHotkeys';

describe('useHotkeys', () => {
  it('calls callback on Ctrl+K', () => {
    const callback = vi.fn();

    renderHook(() => useHotkeys('ctrl+k', callback));

    fireEvent.keyDown(document, {
      key: 'k',
      ctrlKey: true,
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });
});
```

#### UT-0506-002: useHotkeys 훅 - Cmd+K (Mac) 키 조합 감지

| 항목 | 내용 |
|------|------|
| **파일** | `lib/hooks/__tests__/useHotkeys.test.ts` |
| **테스트 블록** | `describe('useHotkeys') -> it('calls callback on Cmd+K (Mac)')` |
| **Mock 의존성** | navigator.platform mock |
| **입력 데이터** | `{ keys: 'meta+k', callback: mockFn }` |
| **검증 포인트** | Cmd+K (metaKey) 키 이벤트 발생 시 콜백 함수 호출 |
| **커버리지 대상** | useHotkeys 훅 Mac modifier 키 지원 |
| **관련 요구사항** | FR-001 |

```typescript
it('calls callback on Cmd+K (Mac)', () => {
  const callback = vi.fn();

  // Mac 환경 시뮬레이션
  Object.defineProperty(navigator, 'platform', {
    value: 'MacIntel',
    writable: true,
  });

  renderHook(() => useHotkeys('meta+k', callback));

  fireEvent.keyDown(document, {
    key: 'k',
    metaKey: true,
  });

  expect(callback).toHaveBeenCalledTimes(1);
});
```

#### UT-0506-003: useHotkeys 훅 - 입력 필드 포커스 시 단축키 무시

| 항목 | 내용 |
|------|------|
| **파일** | `lib/hooks/__tests__/useHotkeys.test.ts` |
| **테스트 블록** | `describe('useHotkeys') -> it('ignores hotkey when input is focused')` |
| **Mock 의존성** | - |
| **입력 데이터** | `{ keys: 'ctrl+k', callback: mockFn, options: { enableOnFormTags: false } }` |
| **검증 포인트** | input 요소에 포커스된 상태에서 Ctrl+K 시 콜백 미호출 |
| **커버리지 대상** | useHotkeys 훅 enableOnFormTags 옵션 |
| **관련 요구사항** | BR-001 |

```typescript
it('ignores hotkey when input is focused', () => {
  const callback = vi.fn();

  const { container } = render(
    <div>
      <input data-testid="test-input" />
    </div>
  );

  renderHook(() => useHotkeys('ctrl+k', callback, { enableOnFormTags: false }));

  const input = screen.getByTestId('test-input');
  input.focus();

  fireEvent.keyDown(input, {
    key: 'k',
    ctrlKey: true,
  });

  expect(callback).not.toHaveBeenCalled();
});
```

#### UT-0506-004: useHotkeys 훅 - 등록/해제 lifecycle

| 항목 | 내용 |
|------|------|
| **파일** | `lib/hooks/__tests__/useHotkeys.test.ts` |
| **테스트 블록** | `describe('useHotkeys') -> it('cleans up event listener on unmount')` |
| **Mock 의존성** | - |
| **입력 데이터** | `{ keys: 'ctrl+k', callback: mockFn }` |
| **검증 포인트** | 컴포넌트 언마운트 시 이벤트 리스너 해제 |
| **커버리지 대상** | useHotkeys 훅 cleanup 로직 |
| **관련 요구사항** | FR-002 |

```typescript
it('cleans up event listener on unmount', () => {
  const callback = vi.fn();
  const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

  const { unmount } = renderHook(() => useHotkeys('ctrl+k', callback));

  unmount();

  expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

  // 언마운트 후 키 이벤트 발생 시 콜백 미호출
  fireEvent.keyDown(document, {
    key: 'k',
    ctrlKey: true,
  });

  expect(callback).not.toHaveBeenCalled();

  removeEventListenerSpy.mockRestore();
});
```

#### UT-0506-005: HotkeyHelp 컴포넌트 - 모달 열기/닫기

| 항목 | 내용 |
|------|------|
| **파일** | `components/common/__tests__/HotkeyHelp.test.tsx` |
| **테스트 블록** | `describe('HotkeyHelp') -> it('opens and closes modal')` |
| **Mock 의존성** | - |
| **입력 데이터** | `<HotkeyHelp open={true} onClose={mockFn} />` |
| **검증 포인트** | open prop에 따라 모달 표시/숨김, onClose 콜백 호출 |
| **커버리지 대상** | HotkeyHelp 모달 상태 관리 |
| **관련 요구사항** | FR-003 |

```typescript
// components/common/__tests__/HotkeyHelp.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { HotkeyHelp } from '../HotkeyHelp';

describe('HotkeyHelp', () => {
  it('opens and closes modal', async () => {
    const onClose = vi.fn();

    const { rerender } = render(<HotkeyHelp open={false} onClose={onClose} />);

    // 초기 상태: 모달 숨김
    expect(screen.queryByTestId('hotkey-help-modal')).not.toBeInTheDocument();

    // open=true로 변경
    rerender(<HotkeyHelp open={true} onClose={onClose} />);

    // 모달 표시
    expect(screen.getByTestId('hotkey-help-modal')).toBeVisible();

    // 닫기 버튼 클릭
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes modal on Escape key', async () => {
    const onClose = vi.fn();

    render(<HotkeyHelp open={true} onClose={onClose} />);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
```

#### UT-0506-006: HotkeyHelp 컴포넌트 - 단축키 목록 렌더링

| 항목 | 내용 |
|------|------|
| **파일** | `components/common/__tests__/HotkeyHelp.test.tsx` |
| **테스트 블록** | `describe('HotkeyHelp') -> it('renders hotkey list')` |
| **Mock 의존성** | - |
| **입력 데이터** | `<HotkeyHelp open={true} onClose={mockFn} />` |
| **검증 포인트** | 모든 등록된 단축키 항목이 목록에 표시됨 |
| **커버리지 대상** | HotkeyHelp 단축키 목록 렌더링 |
| **관련 요구사항** | FR-004 |

```typescript
it('renders hotkey list', () => {
  render(<HotkeyHelp open={true} onClose={vi.fn()} />);

  const hotkeyList = screen.getByTestId('hotkey-list');
  expect(hotkeyList).toBeInTheDocument();

  // 기본 단축키 항목 확인
  expect(screen.getByTestId('hotkey-item-ctrl-k')).toBeInTheDocument();
  expect(screen.getByText(/전역 검색/)).toBeInTheDocument();

  expect(screen.getByTestId('hotkey-item-?')).toBeInTheDocument();
  expect(screen.getByText(/단축키 도움말/)).toBeInTheDocument();

  expect(screen.getByTestId('hotkey-item-ctrl-w')).toBeInTheDocument();
  expect(screen.getByText(/탭 닫기/)).toBeInTheDocument();

  expect(screen.getByTestId('hotkey-item-escape')).toBeInTheDocument();
  expect(screen.getByText(/모달 닫기/)).toBeInTheDocument();
});
```

---

## 3. E2E 테스트 시나리오

### 3.1 테스트 케이스 목록

| 테스트 ID | 시나리오 | 사전조건 | 실행 단계 | 예상 결과 | 요구사항 |
|-----------|----------|----------|----------|----------|----------|
| E2E-0506-001 | Ctrl+K로 전역 검색 모달 열기 | 포털 접속 | Ctrl+K 입력 | 검색 모달 표시 | FR-001 |
| E2E-0506-002 | ? 키로 단축키 도움말 모달 열기 | 포털 접속 | ? 키 입력 | 도움말 모달 표시 | FR-003 |
| E2E-0506-003 | Ctrl+W로 현재 탭 닫기 | MDI 탭 열림 | Ctrl+W 입력 | 현재 탭 닫힘 | FR-005 |
| E2E-0506-004 | 입력 필드에서 단축키 비활성화 확인 | 입력 필드 포커스 | Ctrl+K 입력 | 검색 모달 미표시 | BR-001 |
| E2E-0506-005 | Escape로 모달 닫기 | 모달 열림 | Escape 입력 | 모달 닫힘 | FR-006 |

### 3.2 테스트 케이스 상세

#### E2E-0506-001: Ctrl+K로 전역 검색 모달 열기

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/hotkeys.spec.ts` |
| **테스트명** | `test('Ctrl+K로 전역 검색 모달이 열린다')` |
| **사전조건** | 포털 메인 페이지 접속 |
| **data-testid 셀렉터** | |
| - 검색 모달 | `[data-testid="global-search-modal"]` |
| - 검색 입력창 | `[data-testid="global-search-input"]` |
| **실행 단계** | |
| 1 | 포털 접속 |
| 2 | Ctrl+K 키 입력 |
| 3 | 검색 모달 표시 확인 |
| 4 | 검색 입력창 포커스 확인 |
| **검증 포인트** | 검색 모달 표시, 입력창 자동 포커스 |
| **스크린샷** | `e2e-0506-001-search-modal.png` |
| **관련 요구사항** | FR-001 |

```typescript
// tests/e2e/hotkeys.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Keyboard Hotkeys', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Ctrl+K로 전역 검색 모달이 열린다', async ({ page }) => {
    // Ctrl+K 입력
    await page.keyboard.press('Control+k');

    // 검색 모달 표시 확인
    await expect(page.locator('[data-testid="global-search-modal"]')).toBeVisible();

    // 검색 입력창 포커스 확인
    await expect(page.locator('[data-testid="global-search-input"]')).toBeFocused();

    await page.screenshot({ path: 'e2e-0506-001-search-modal.png' });
  });

  test('Mac에서 Cmd+K로 전역 검색 모달이 열린다', async ({ page, browserName }) => {
    // WebKit (Safari) 또는 Mac 환경에서만 실행
    test.skip(browserName !== 'webkit', 'Mac 환경 테스트');

    await page.keyboard.press('Meta+k');

    await expect(page.locator('[data-testid="global-search-modal"]')).toBeVisible();
  });
});
```

#### E2E-0506-002: ? 키로 단축키 도움말 모달 열기

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/hotkeys.spec.ts` |
| **테스트명** | `test('? 키로 단축키 도움말 모달이 열린다')` |
| **사전조건** | 포털 접속, 입력 필드 외 영역 포커스 |
| **data-testid 셀렉터** | |
| - 도움말 모달 | `[data-testid="hotkey-help-modal"]` |
| - 단축키 목록 | `[data-testid="hotkey-list"]` |
| **실행 단계** | |
| 1 | 포털 접속 |
| 2 | ? 키 입력 |
| 3 | 도움말 모달 표시 확인 |
| 4 | 단축키 목록 존재 확인 |
| **검증 포인트** | 도움말 모달 표시, 단축키 목록 렌더링 |
| **스크린샷** | `e2e-0506-002-help-modal.png` |
| **관련 요구사항** | FR-003 |

```typescript
test('? 키로 단축키 도움말 모달이 열린다', async ({ page }) => {
  // body 클릭으로 포커스 이동 (입력 필드 외)
  await page.click('body');

  // ? 키 입력 (Shift+/)
  await page.keyboard.press('Shift+?');

  // 도움말 모달 표시 확인
  await expect(page.locator('[data-testid="hotkey-help-modal"]')).toBeVisible();

  // 단축키 목록 확인
  await expect(page.locator('[data-testid="hotkey-list"]')).toBeVisible();

  await page.screenshot({ path: 'e2e-0506-002-help-modal.png' });
});
```

#### E2E-0506-003: Ctrl+W로 현재 탭 닫기

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/hotkeys.spec.ts` |
| **테스트명** | `test('Ctrl+W로 현재 MDI 탭이 닫힌다')` |
| **사전조건** | MDI 탭이 2개 이상 열림 |
| **data-testid 셀렉터** | |
| - MDI 탭 바 | `[data-testid="mdi-tab-bar"]` |
| - MDI 탭 아이템 | `[data-testid="mdi-tab-item"]` |
| **실행 단계** | |
| 1 | 메뉴 2개 열어서 탭 2개 생성 |
| 2 | Ctrl+W 입력 |
| 3 | 현재 탭 닫힘 확인 |
| 4 | 이전 탭으로 전환 확인 |
| **검증 포인트** | 탭 개수 감소, 활성 탭 변경 |
| **스크린샷** | `e2e-0506-003-tab-before.png`, `e2e-0506-003-tab-after.png` |
| **관련 요구사항** | FR-005 |

```typescript
test('Ctrl+W로 현재 MDI 탭이 닫힌다', async ({ page }) => {
  // 메뉴 2개 열기
  await page.click('[data-testid="menu-production-order"]');
  await page.click('[data-testid="menu-production-result"]');

  // 탭 2개 확인
  const tabs = page.locator('[data-testid="mdi-tab-item"]');
  await expect(tabs).toHaveCount(2);

  await page.screenshot({ path: 'e2e-0506-003-tab-before.png' });

  // Ctrl+W 입력 (브라우저 탭 닫기 방지를 위해 포커스 확인)
  await page.keyboard.press('Control+w');

  // 탭 1개로 감소 확인
  await expect(tabs).toHaveCount(1);

  await page.screenshot({ path: 'e2e-0506-003-tab-after.png' });
});
```

#### E2E-0506-004: 입력 필드에서 단축키 비활성화 확인

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/hotkeys.spec.ts` |
| **테스트명** | `test('입력 필드 포커스 시 Ctrl+K가 동작하지 않는다')` |
| **사전조건** | 입력 필드가 있는 페이지 접속 |
| **data-testid 셀렉터** | |
| - 검색 입력창 | `[data-testid="search-input"]` |
| - 검색 모달 | `[data-testid="global-search-modal"]` |
| **실행 단계** | |
| 1 | 입력 필드 클릭하여 포커스 |
| 2 | Ctrl+K 입력 |
| 3 | 검색 모달 미표시 확인 |
| **검증 포인트** | 입력 필드 포커스 시 전역 단축키 비활성화 |
| **관련 요구사항** | BR-001 |

```typescript
test('입력 필드 포커스 시 Ctrl+K가 동작하지 않는다', async ({ page }) => {
  // 입력 필드가 있는 페이지로 이동
  await page.goto('/production/order');

  // 입력 필드 포커스
  const input = page.locator('[data-testid="search-input"]');
  await input.focus();

  // Ctrl+K 입력
  await page.keyboard.press('Control+k');

  // 검색 모달이 열리지 않음 확인
  await expect(page.locator('[data-testid="global-search-modal"]')).not.toBeVisible();

  // 입력 필드에 'k'가 입력되지 않음 확인 (Ctrl+K는 일반 문자 입력이 아님)
  await expect(input).toHaveValue('');
});

test('textarea 포커스 시 ? 키가 문자로 입력된다', async ({ page }) => {
  await page.goto('/production/order');

  const textarea = page.locator('[data-testid="memo-textarea"]');
  await textarea.focus();

  // ? 키 입력
  await page.keyboard.press('Shift+?');

  // 도움말 모달 미표시
  await expect(page.locator('[data-testid="hotkey-help-modal"]')).not.toBeVisible();

  // textarea에 '?' 문자 입력됨
  await expect(textarea).toHaveValue('?');
});
```

#### E2E-0506-005: Escape로 모달 닫기

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/hotkeys.spec.ts` |
| **테스트명** | `test('Escape 키로 열린 모달이 닫힌다')` |
| **사전조건** | 모달이 열린 상태 |
| **data-testid 셀렉터** | |
| - 검색 모달 | `[data-testid="global-search-modal"]` |
| - 도움말 모달 | `[data-testid="hotkey-help-modal"]` |
| **실행 단계** | |
| 1 | Ctrl+K로 검색 모달 열기 |
| 2 | Escape 입력 |
| 3 | 검색 모달 닫힘 확인 |
| 4 | ? 키로 도움말 모달 열기 |
| 5 | Escape 입력 |
| 6 | 도움말 모달 닫힘 확인 |
| **검증 포인트** | Escape 키로 모든 모달 닫기 |
| **관련 요구사항** | FR-006 |

```typescript
test('Escape 키로 열린 모달이 닫힌다', async ({ page }) => {
  // 검색 모달 테스트
  await page.keyboard.press('Control+k');
  await expect(page.locator('[data-testid="global-search-modal"]')).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(page.locator('[data-testid="global-search-modal"]')).not.toBeVisible();

  // 도움말 모달 테스트
  await page.click('body');
  await page.keyboard.press('Shift+?');
  await expect(page.locator('[data-testid="hotkey-help-modal"]')).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(page.locator('[data-testid="hotkey-help-modal"]')).not.toBeVisible();
});
```

---

## 4. UI 테스트케이스 (매뉴얼)

### 4.1 테스트 케이스 목록

| TC-ID | 테스트 항목 | 사전조건 | 테스트 단계 | 예상 결과 | 우선순위 | 요구사항 |
|-------|-----------|---------|-----------|----------|---------|----------|
| TC-0506-001 | 모든 단축키 동작 확인 | 포털 접속 | 각 단축키 입력 | 해당 기능 동작 | High | FR-001~006 |
| TC-0506-002 | Mac/Windows 환경별 modifier 키 확인 | 각 OS 환경 | Ctrl/Cmd+K 입력 | 검색 모달 열림 | High | FR-001 |
| TC-0506-003 | 접근성 - 키보드만으로 전체 기능 사용 가능 여부 | 포털 접속 | 키보드만 사용 | 모든 기능 접근 가능 | Medium | - |

### 4.2 매뉴얼 테스트 상세

#### TC-0506-001: 모든 단축키 동작 확인

**테스트 목적**: 등록된 모든 키보드 단축키가 올바르게 동작하는지 확인

**테스트 단계**:
1. 포털 메인 페이지 접속
2. 입력 필드 외 영역 클릭하여 포커스 이동
3. 다음 단축키를 순서대로 테스트:

| 단축키 | 테스트 방법 | 예상 결과 |
|--------|-----------|----------|
| Ctrl+K (Windows) / Cmd+K (Mac) | 키 조합 입력 | 전역 검색 모달 열림 |
| ? | Shift+/ 입력 | 단축키 도움말 모달 열림 |
| Ctrl+W | MDI 탭 열린 상태에서 입력 | 현재 탭 닫힘 |
| Escape | 모달 열린 상태에서 입력 | 모달 닫힘 |
| Ctrl+1~9 | 탭 여러 개 열린 상태에서 입력 | 해당 번호 탭으로 전환 |

**검증 기준**:
- [ ] Ctrl+K: 검색 모달 즉시 열림
- [ ] ?: 도움말 모달 열림, 단축키 목록 표시
- [ ] Ctrl+W: 현재 활성 탭 닫힘
- [ ] Escape: 열린 모달/드롭다운 닫힘
- [ ] Ctrl+1~9: 해당 번호 탭으로 전환 (탭 존재 시)

#### TC-0506-002: Mac/Windows 환경별 modifier 키 확인

**테스트 목적**: 운영체제별 modifier 키가 올바르게 처리되는지 확인

**테스트 단계**:

**Windows 환경:**
1. Windows PC에서 포털 접속
2. Ctrl+K 입력 -> 검색 모달 열림 확인
3. Cmd+K 입력 -> 아무 동작 없음 확인

**macOS 환경:**
1. Mac에서 포털 접속
2. Cmd+K 입력 -> 검색 모달 열림 확인
3. Ctrl+K 입력 -> 검색 모달 열림 확인 (옵션에 따라)

**검증 기준**:
- [ ] Windows: Ctrl 키가 primary modifier로 동작
- [ ] Mac: Cmd 키가 primary modifier로 동작
- [ ] 도움말 모달에서 현재 OS에 맞는 키 표시 (Ctrl/Cmd)

#### TC-0506-003: 접근성 - 키보드만으로 전체 기능 사용 가능 여부

**테스트 목적**: 마우스 없이 키보드만으로 모든 주요 기능에 접근 가능한지 확인

**테스트 단계**:
1. 포털 접속 후 마우스 사용 금지
2. Tab 키로 요소 간 이동
3. Enter로 버튼/링크 활성화
4. 단축키로 모달 열기/닫기
5. 화살표 키로 메뉴/드롭다운 탐색

**검증 기준**:
- [ ] Tab 키로 모든 인터랙티브 요소에 접근 가능
- [ ] 포커스 링이 명확히 표시됨
- [ ] Enter 키로 버튼/링크 활성화 가능
- [ ] Escape 키로 모달/드롭다운 닫기 가능
- [ ] 단축키로 주요 기능 빠르게 접근 가능
- [ ] 스크린 리더에서 단축키 안내 읽힘

---

## 5. 테스트 데이터 (Fixture)

### 5.1 단위 테스트용 Mock 데이터

| 데이터 ID | 용도 | 값 |
|-----------|------|-----|
| MOCK-HOTKEY-SEARCH | 검색 단축키 | `{ key: 'ctrl+k', callback: vi.fn() }` |
| MOCK-HOTKEY-HELP | 도움말 단축키 | `{ key: '?', callback: vi.fn() }` |
| MOCK-HOTKEY-CLOSE-TAB | 탭 닫기 단축키 | `{ key: 'ctrl+w', callback: vi.fn() }` |
| MOCK-HOTKEY-ESCAPE | 모달 닫기 | `{ key: 'escape', callback: vi.fn() }` |
| MOCK-HOTKEY-LIST | 단축키 목록 | 아래 참조 |

```typescript
// Mock 단축키 목록
const MOCK_HOTKEY_LIST = [
  { key: 'Ctrl+K', description: '전역 검색', category: '탐색' },
  { key: '?', description: '단축키 도움말', category: '도움말' },
  { key: 'Ctrl+W', description: '현재 탭 닫기', category: 'MDI' },
  { key: 'Escape', description: '모달/드롭다운 닫기', category: '일반' },
  { key: 'Ctrl+1~9', description: '탭 전환', category: 'MDI' },
];
```

### 5.2 E2E 테스트용 시드 데이터

| 시드 ID | 용도 | 생성 방법 | 포함 데이터 |
|---------|------|----------|------------|
| SEED-E2E-HOTKEY | 단축키 테스트 | 자동 시드 | 테스트 사용자 1명, MDI 탭 설정 |

### 5.3 테스트 계정

| 계정 ID | 이메일 | 비밀번호 | 역할 | 용도 |
|---------|--------|----------|------|------|
| TEST-USER | user@test.com | test1234 | USER | 단축키 기능 테스트 |

---

## 6. data-testid 목록

> 프론트엔드 컴포넌트에 적용할 `data-testid` 속성 정의

### 6.1 컴포넌트별 셀렉터

#### HotkeyHelp 컴포넌트

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `hotkey-help-modal` | 모달 컨테이너 | 모달 표시/숨김 확인 |
| `hotkey-help-trigger-btn` | 도움말 버튼 | 버튼 클릭 테스트 |
| `hotkey-list` | 단축키 목록 컨테이너 | 목록 존재 확인 |
| `hotkey-item-ctrl-k` | Ctrl+K 항목 | 개별 단축키 확인 |
| `hotkey-item-?` | ? 항목 | 개별 단축키 확인 |
| `hotkey-item-ctrl-w` | Ctrl+W 항목 | 개별 단축키 확인 |
| `hotkey-item-escape` | Escape 항목 | 개별 단축키 확인 |
| `hotkey-item-ctrl-1-9` | Ctrl+1~9 항목 | 개별 단축키 확인 |

#### 전역 검색 모달

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `global-search-modal` | 검색 모달 컨테이너 | 모달 표시/숨김 확인 |
| `global-search-input` | 검색 입력창 | 포커스 확인, 입력 테스트 |

#### MDI 탭 관련

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `mdi-tab-bar` | 탭 바 컨테이너 | 탭 영역 확인 |
| `mdi-tab-item` | 탭 아이템 | 탭 개수 확인 |
| `mdi-tab-item-{id}` | 특정 탭 | 탭 전환 확인 |

---

## 7. 테스트 커버리지 목표

### 7.1 단위 테스트 커버리지

| 대상 | 목표 | 최소 |
|------|------|------|
| Lines | 80% | 70% |
| Branches | 75% | 65% |
| Functions | 85% | 75% |
| Statements | 80% | 70% |

### 7.2 컴포넌트별 커버리지 목표

| 컴포넌트 | Lines | Branches | Functions |
|----------|-------|----------|-----------|
| useHotkeys | 90% | 85% | 100% |
| HotkeyHelp | 85% | 80% | 90% |

### 7.3 E2E 테스트 커버리지

| 구분 | 목표 |
|------|------|
| 주요 사용자 시나리오 | 100% |
| 기능 요구사항 (FR) | 100% 커버 |
| 비즈니스 규칙 (BR) | 100% 커버 |
| 에러 케이스 | 80% 커버 |

---

## 8. 위험 기반 테스트 우선순위

### 8.1 위험 평가 매트릭스

| 영역 | 발생 확률 | 영향도 | 위험 점수 | 테스트 우선순위 |
|------|----------|--------|----------|----------------|
| 입력 필드에서 단축키 비활성화 | 높음 | 높음 | 9 | P1 (필수) |
| Ctrl+K 전역 검색 | 높음 | 중 | 6 | P1 (필수) |
| Mac/Windows modifier 차이 | 중 | 중 | 4 | P2 (중요) |
| 모달 열기/닫기 | 중 | 낮음 | 2 | P2 (중요) |
| 단축키 목록 렌더링 | 낮음 | 낮음 | 1 | P3 (선택) |

### 8.2 테스트 실행 순서

1. **P1 (필수)**: 입력 필드 비활성화, Ctrl+K 전역 검색
2. **P2 (중요)**: Mac/Windows modifier, 모달 열기/닫기, Escape 닫기
3. **P3 (선택)**: 단축키 목록 렌더링, 접근성 테스트

---

## 9. 경계 조건 및 엣지 케이스

### 9.1 경계 조건 테스트

| 조건 | 테스트 케이스 | 예상 결과 |
|------|-------------|----------|
| 동시 키 입력 | Ctrl+K+L 동시 입력 | Ctrl+K만 처리 |
| 빠른 연속 입력 | Ctrl+K 빠르게 2회 | 모달 토글 (열림->닫힘 또는 유지) |
| modifier 키만 입력 | Ctrl만 눌렀다 뗌 | 아무 동작 없음 |
| 모달 중첩 상태 | 검색 모달 열린 상태에서 ? 입력 | 검색 모달 유지 또는 도움말로 전환 |

### 9.2 엣지 케이스 테스트

| 케이스 | 설명 | 테스트 방법 |
|--------|------|------------|
| 비활성 탭에서 단축키 | 브라우저 탭이 비활성 상태 | 탭 전환 후 단축키 테스트 |
| 다중 모달 상태 | 여러 모달 열림 | Escape로 순차 닫기 확인 |
| contenteditable 요소 | div[contenteditable] 포커스 | 단축키 비활성화 확인 |
| iframe 내부 | iframe 안에서 단축키 | 이벤트 전파 확인 |

### 9.3 브라우저 호환성 테스트

| 브라우저 | 버전 | 테스트 항목 |
|---------|------|-----------|
| Chrome | 최신 | 모든 단축키 |
| Firefox | 최신 | 모든 단축키 |
| Safari | 최신 | Cmd 키 modifier |
| Edge | 최신 | 모든 단축키 |

---

## 10. 요구사항 추적

### 10.1 기능 요구사항 (FR) 매핑

| 요구사항 ID | 설명 | 테스트 케이스 |
|------------|------|-------------|
| FR-001 | Ctrl/Cmd+K 전역 검색 | UT-0506-001, UT-0506-002, E2E-0506-001 |
| FR-002 | 단축키 등록/해제 lifecycle | UT-0506-004 |
| FR-003 | 단축키 도움말 모달 | UT-0506-005, E2E-0506-002 |
| FR-004 | 단축키 목록 표시 | UT-0506-006 |
| FR-005 | Ctrl+W 탭 닫기 | E2E-0506-003 |
| FR-006 | Escape 모달 닫기 | E2E-0506-005 |

### 10.2 비즈니스 규칙 (BR) 매핑

| 규칙 ID | 설명 | 테스트 케이스 |
|---------|------|-------------|
| BR-001 | 입력 필드 포커스 시 전역 단축키 비활성화 | UT-0506-003, E2E-0506-004 |

---

## 관련 문서

- PRD: `.orchay/projects/mes-portal/prd.md`
- TRD: `.orchay/projects/mes-portal/trd.md`
- 헤더 컴포넌트 설계: `.orchay/projects/mes-portal/tasks/TSK-01-02/010-design.md`
- 전역 검색 설계: `.orchay/projects/mes-portal/tasks/TSK-01-05/010-design.md`

---

## 변경 이력

| 버전 | 일자 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0 | 2026-01-20 | AI | 최초 작성 |
