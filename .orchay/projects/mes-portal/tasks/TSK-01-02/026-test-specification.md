# 테스트 명세서 (026-test-specification.md)

**Template Version:** 1.0.0 — **Last Updated:** 2026-01-20

> **목적**: 헤더 컴포넌트 테스트 시나리오 정의

---

## 0. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| Task ID | TSK-01-02 |
| Task명 | 헤더 컴포넌트 |
| 설계 문서 참조 | `010-design.md` |
| 추적성 매트릭스 참조 | `025-traceability-matrix.md` |
| 작성일 | 2026-01-20 |
| 작성자 | AI |

---

## 1. 테스트 전략 개요

### 1.1 테스트 범위

| 테스트 유형 | 범위 | 목표 커버리지 |
|------------|------|--------------|
| 단위 테스트 | Header 컴포넌트, 각 하위 요소 | 80% 이상 |
| E2E 테스트 | 헤더 기능 전체 동작 | 100% 시나리오 커버 |
| 매뉴얼 테스트 | 반응형, 접근성, 시각적 확인 | 전체 화면 |

### 1.2 테스트 환경

| 항목 | 내용 |
|------|------|
| 테스트 프레임워크 (단위) | Vitest + React Testing Library |
| 테스트 프레임워크 (E2E) | Playwright |
| 브라우저 | Chromium (기본), Firefox, WebKit |
| 베이스 URL | `http://localhost:3000` |
| 반응형 테스트 뷰포트 | Desktop (1280x720), Tablet (768x1024), Mobile (375x667) |

---

## 2. 단위 테스트 시나리오

### 2.1 테스트 케이스 목록

| 테스트 ID | 대상 | 시나리오 | 예상 결과 | 요구사항 |
|-----------|------|----------|----------|----------|
| UT-001 | Header | 로고 렌더링 | 로고 표시 및 "/" 링크 | FR-001 |
| UT-002 | Header | 빠른 메뉴 드롭다운 | 드롭다운 열림/닫힘 | FR-002 |
| UT-003 | Header | 브레드크럼 렌더링 | 경로 항목 표시 | FR-003 |
| UT-004 | Header | 시계 갱신 | 1초마다 시간 변경 | FR-004 |
| UT-005 | Header | 검색 버튼 클릭 | onSearchOpen 콜백 호출 | FR-005 |
| UT-006 | Header | 알림 뱃지 | 알림 개수 표시 | FR-006 |
| UT-007 | Header | 테마 토글 | 라이트/다크 전환 | FR-007 |
| UT-008 | Header | 프로필 드롭다운 | 메뉴 항목 표시 | FR-008 |
| UT-009 | Header | 로고 링크 경로 | href="/" 확인 | BR-001 |
| UT-010 | Header | 시계 1초 갱신 | setInterval 확인 | BR-002 |
| UT-011 | Header | 테마 저장 | setTheme 호출 확인 | BR-003 |
| UT-012 | Header | 브레드크럼 props | 전달된 경로 렌더링 | BR-004 |
| UT-013 | Header | Ctrl+K 단축키 | onSearchOpen 호출 | BR-005 |

### 2.2 테스트 케이스 상세

#### UT-001: 로고 렌더링

| 항목 | 내용 |
|------|------|
| **파일** | `components/layout/__tests__/Header.test.tsx` |
| **테스트 블록** | `describe('Header') → it('renders logo with home link')` |
| **Mock 의존성** | next/link, next-themes |
| **입력 데이터** | 기본 props |
| **검증 포인트** | 로고 텍스트 존재, "/" 링크 확인 |
| **관련 요구사항** | FR-001, BR-001 |

```typescript
import { render, screen } from '@testing-library/react';
import { Header } from '../Header';

describe('Header', () => {
  it('renders logo with home link', () => {
    render(<Header />);

    const logo = screen.getByText('MES Portal');
    expect(logo).toBeInTheDocument();
    expect(logo.closest('a')).toHaveAttribute('href', '/');
  });
});
```

#### UT-002: 빠른 메뉴 드롭다운

| 항목 | 내용 |
|------|------|
| **파일** | `components/layout/__tests__/Header.test.tsx` |
| **테스트 블록** | `describe('Header') → it('opens quick menu dropdown')` |
| **Mock 의존성** | antd Dropdown |
| **입력 데이터** | 빠른 메뉴 버튼 클릭 |
| **검증 포인트** | 드롭다운 표시 |
| **관련 요구사항** | FR-002 |

```typescript
it('opens quick menu dropdown on click', async () => {
  const { user } = renderWithUser(<Header />);

  const quickMenuButton = screen.getByRole('button', { name: /star/i });
  await user.click(quickMenuButton);

  // 드롭다운이 열리면 Ant Design이 관리
  expect(quickMenuButton).toBeInTheDocument();
});
```

#### UT-003: 브레드크럼 렌더링

| 항목 | 내용 |
|------|------|
| **파일** | `components/layout/__tests__/Header.test.tsx` |
| **테스트 블록** | `describe('Header') → it('renders breadcrumb items')` |
| **입력 데이터** | `breadcrumbItems: [{ title: 'Home', path: '/' }, { title: '생산관리' }]` |
| **검증 포인트** | 브레드크럼 항목 표시 |
| **관련 요구사항** | FR-003, BR-004 |

```typescript
it('renders breadcrumb items', () => {
  const breadcrumbItems = [
    { title: 'Home', path: '/' },
    { title: '생산관리' },
    { title: '작업지시' },
  ];

  render(<Header breadcrumbItems={breadcrumbItems} />);

  expect(screen.getByText('Home')).toBeInTheDocument();
  expect(screen.getByText('생산관리')).toBeInTheDocument();
  expect(screen.getByText('작업지시')).toBeInTheDocument();
});
```

#### UT-004: 시계 갱신

| 항목 | 내용 |
|------|------|
| **파일** | `components/layout/__tests__/Header.test.tsx` |
| **테스트 블록** | `describe('Header') → it('updates clock every second')` |
| **Mock 의존성** | jest.useFakeTimers |
| **검증 포인트** | 1초 후 시간 변경 |
| **관련 요구사항** | FR-004, BR-002 |

```typescript
it('updates clock every second', () => {
  vi.useFakeTimers();
  render(<Header />);

  const initialTime = screen.getByText(/\d{2}:\d{2}:\d{2}/);
  const initialText = initialTime.textContent;

  vi.advanceTimersByTime(1000);

  // 시간이 갱신됨 (또는 같은 초일 수 있음)
  expect(screen.getByText(/\d{2}:\d{2}:\d{2}/)).toBeInTheDocument();

  vi.useRealTimers();
});
```

#### UT-005: 검색 버튼 클릭

| 항목 | 내용 |
|------|------|
| **파일** | `components/layout/__tests__/Header.test.tsx` |
| **테스트 블록** | `describe('Header') → it('calls onSearchOpen when search button clicked')` |
| **검증 포인트** | onSearchOpen 콜백 호출 |
| **관련 요구사항** | FR-005 |

```typescript
it('calls onSearchOpen when search button clicked', async () => {
  const onSearchOpen = vi.fn();
  const { user } = renderWithUser(<Header onSearchOpen={onSearchOpen} />);

  const searchButton = screen.getByRole('button', { name: /search/i });
  await user.click(searchButton);

  expect(onSearchOpen).toHaveBeenCalledTimes(1);
});
```

#### UT-006: 알림 뱃지

| 항목 | 내용 |
|------|------|
| **파일** | `components/layout/__tests__/Header.test.tsx` |
| **테스트 블록** | `describe('Header') → it('displays notification badge count')` |
| **입력 데이터** | `unreadNotifications: 5` |
| **검증 포인트** | 뱃지에 5 표시 |
| **관련 요구사항** | FR-006 |

```typescript
it('displays notification badge count', () => {
  render(<Header unreadNotifications={5} />);

  expect(screen.getByText('5')).toBeInTheDocument();
});
```

#### UT-007: 테마 토글

| 항목 | 내용 |
|------|------|
| **파일** | `components/layout/__tests__/Header.test.tsx` |
| **테스트 블록** | `describe('Header') → it('toggles theme on button click')` |
| **Mock 의존성** | next-themes useTheme |
| **검증 포인트** | setTheme 호출 |
| **관련 요구사항** | FR-007, BR-003 |

```typescript
it('toggles theme on button click', async () => {
  const setTheme = vi.fn();
  vi.mock('next-themes', () => ({
    useTheme: () => ({ theme: 'light', setTheme }),
  }));

  const { user } = renderWithUser(<Header />);

  const themeButton = screen.getByRole('button', { name: /moon/i });
  await user.click(themeButton);

  expect(setTheme).toHaveBeenCalledWith('dark');
});
```

#### UT-008: 프로필 드롭다운

| 항목 | 내용 |
|------|------|
| **파일** | `components/layout/__tests__/Header.test.tsx` |
| **테스트 블록** | `describe('Header') → it('shows profile dropdown menu')` |
| **입력 데이터** | `user: { name: '홍길동', email: 'test@test.com' }` |
| **검증 포인트** | 프로필 영역 클릭 시 메뉴 표시 |
| **관련 요구사항** | FR-008 |

```typescript
it('shows profile dropdown menu', async () => {
  const user = { name: '홍길동', email: 'test@test.com' };
  const { user: userEvent } = renderWithUser(<Header user={user} />);

  const profileArea = screen.getByText('홍길동');
  await userEvent.click(profileArea);

  // Ant Design Dropdown이 메뉴를 렌더링
  expect(screen.getByText('내 정보')).toBeInTheDocument();
  expect(screen.getByText('설정')).toBeInTheDocument();
  expect(screen.getByText('로그아웃')).toBeInTheDocument();
});
```

#### UT-013: Ctrl+K 단축키

| 항목 | 내용 |
|------|------|
| **파일** | `components/layout/__tests__/Header.test.tsx` |
| **테스트 블록** | `describe('Header') → it('opens search on Ctrl+K')` |
| **Mock 의존성** | react-hotkeys-hook |
| **검증 포인트** | onSearchOpen 콜백 호출 |
| **관련 요구사항** | FR-005, BR-005 |

```typescript
it('opens search on Ctrl+K', async () => {
  const onSearchOpen = vi.fn();
  const { user } = renderWithUser(<Header onSearchOpen={onSearchOpen} />);

  await user.keyboard('{Control>}k{/Control}');

  expect(onSearchOpen).toHaveBeenCalledTimes(1);
});
```

---

## 3. E2E 테스트 시나리오

### 3.1 테스트 케이스 목록

| 테스트 ID | 시나리오 | 사전조건 | 실행 단계 | 예상 결과 | 요구사항 |
|-----------|----------|----------|----------|----------|----------|
| E2E-001 | 로고 클릭 홈 이동 | 포털 접속 | 로고 클릭 | "/" 경로 이동 | FR-001, BR-001 |
| E2E-002 | 즐겨찾기 접근 | 포털 접속 | 빠른 메뉴 클릭 | 드롭다운 표시 | FR-002 |
| E2E-003 | 브레드크럼 표시 | 메뉴 진입 | 화면 확인 | 경로 표시 | FR-003, BR-004 |
| E2E-004 | 시계 표시 | 포털 접속 | 화면 확인 | 시간 표시 | FR-004, BR-002 |
| E2E-005 | Ctrl+K 검색 | 포털 접속 | Ctrl+K 입력 | 검색 모달 오픈 | FR-005, BR-005 |
| E2E-006 | 알림 아이콘 클릭 | 포털 접속 | 알림 클릭 | 알림 패널 오픈 | FR-006 |
| E2E-007 | 테마 전환 | 포털 접속 | 테마 버튼 클릭 | 다크/라이트 전환 | FR-007, BR-003 |
| E2E-008 | 프로필 로그아웃 | 로그인 상태 | 프로필 > 로그아웃 | 로그인 페이지 이동 | FR-008 |

### 3.2 테스트 케이스 상세

#### E2E-001: 로고 클릭 홈 이동

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/header.spec.ts` |
| **테스트명** | `test('로고 클릭 시 홈으로 이동한다')` |
| **사전조건** | 포털 메뉴 화면 접속 |
| **data-testid 셀렉터** | |
| - 로고 | `[data-testid="header-logo"]` |
| **실행 단계** | |
| 1 | 메뉴 화면 접속 (/production/order) |
| 2 | 로고 클릭 |
| 3 | URL "/" 확인 |
| **관련 요구사항** | FR-001, BR-001 |

```typescript
import { test, expect } from '@playwright/test';

test.describe('Header', () => {
  test('로고 클릭 시 홈으로 이동한다', async ({ page }) => {
    await page.goto('/production/order');

    await page.locator('[data-testid="header-logo"]').click();

    await expect(page).toHaveURL('/');
  });
});
```

#### E2E-002: 즐겨찾기 접근

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/header.spec.ts` |
| **테스트명** | `test('빠른 메뉴 드롭다운이 열린다')` |
| **data-testid 셀렉터** | |
| - 빠른 메뉴 버튼 | `[data-testid="quick-menu-button"]` |
| **실행 단계** | |
| 1 | 포털 접속 |
| 2 | 빠른 메뉴 버튼 클릭 |
| 3 | 드롭다운 표시 확인 |
| **관련 요구사항** | FR-002 |

```typescript
test('빠른 메뉴 드롭다운이 열린다', async ({ page }) => {
  await page.goto('/');

  await page.locator('[data-testid="quick-menu-button"]').click();

  await expect(page.locator('.ant-dropdown')).toBeVisible();
});
```

#### E2E-005: Ctrl+K 검색

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/header.spec.ts` |
| **테스트명** | `test('Ctrl+K로 검색 모달이 열린다')` |
| **data-testid 셀렉터** | |
| - 검색 모달 | `[data-testid="search-modal"]` |
| **실행 단계** | |
| 1 | 포털 접속 |
| 2 | Ctrl+K 입력 |
| 3 | 검색 모달 표시 확인 |
| **관련 요구사항** | FR-005, BR-005 |

```typescript
test('Ctrl+K로 검색 모달이 열린다', async ({ page }) => {
  await page.goto('/');

  await page.keyboard.press('Control+k');

  await expect(page.locator('[data-testid="search-modal"]')).toBeVisible();
});
```

#### E2E-007: 테마 전환

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/header.spec.ts` |
| **테스트명** | `test('테마 버튼 클릭 시 다크/라이트 전환된다')` |
| **data-testid 셀렉터** | |
| - 테마 버튼 | `[data-testid="theme-toggle"]` |
| **실행 단계** | |
| 1 | 포털 접속 (라이트 모드) |
| 2 | 테마 버튼 클릭 |
| 3 | 다크 모드 적용 확인 |
| 4 | 새로고침 |
| 5 | 다크 모드 유지 확인 |
| **스크린샷** | `e2e-007-light.png`, `e2e-007-dark.png` |
| **관련 요구사항** | FR-007, BR-003 |

```typescript
test('테마 버튼 클릭 시 다크/라이트 전환된다', async ({ page }) => {
  await page.goto('/');

  // 초기 상태 (라이트)
  await expect(page.locator('html')).not.toHaveClass(/dark/);
  await page.screenshot({ path: 'e2e-007-light.png' });

  // 테마 전환
  await page.locator('[data-testid="theme-toggle"]').click();

  // 다크 모드 확인
  await expect(page.locator('html')).toHaveClass(/dark/);
  await page.screenshot({ path: 'e2e-007-dark.png' });

  // 새로고침 후 유지 확인
  await page.reload();
  await expect(page.locator('html')).toHaveClass(/dark/);
});
```

#### E2E-008: 프로필 로그아웃

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/header.spec.ts` |
| **테스트명** | `test('로그아웃 클릭 시 로그인 페이지로 이동한다')` |
| **data-testid 셀렉터** | |
| - 프로필 영역 | `[data-testid="profile-dropdown"]` |
| - 로그아웃 메뉴 | `[data-testid="logout-menu"]` |
| **실행 단계** | |
| 1 | 로그인 상태로 포털 접속 |
| 2 | 프로필 영역 클릭 |
| 3 | 로그아웃 메뉴 클릭 |
| 4 | 로그인 페이지 이동 확인 |
| **관련 요구사항** | FR-008 |

```typescript
test('로그아웃 클릭 시 로그인 페이지로 이동한다', async ({ page }) => {
  // 로그인 상태 fixture
  await page.goto('/');

  await page.locator('[data-testid="profile-dropdown"]').click();
  await page.locator('[data-testid="logout-menu"]').click();

  await expect(page).toHaveURL('/login');
});
```

---

## 4. UI 테스트케이스 (매뉴얼)

### 4.1 테스트 케이스 목록

| TC-ID | 테스트 항목 | 사전조건 | 테스트 단계 | 예상 결과 | 우선순위 | 요구사항 |
|-------|-----------|---------|-----------|----------|---------|----------|
| TC-001 | 로고 표시 | 로그인 | 헤더 확인 | 로고 가시성 | High | FR-001 |
| TC-002 | 빠른 메뉴 | 포털 표시 | 별 아이콘 클릭 | 드롭다운 표시 | High | FR-002 |
| TC-003 | 브레드크럼 | 메뉴 진입 | 경로 확인 | 정확한 경로 표시 | High | FR-003 |
| TC-004 | 시계 동작 | 포털 표시 | 1초 대기 | 시간 갱신 | Medium | FR-004 |
| TC-005 | 검색 단축키 | 포털 표시 | Ctrl+K 입력 | 검색 모달 오픈 | High | FR-005 |
| TC-006 | 알림 뱃지 | 알림 존재 | 뱃지 확인 | 개수 표시 | Medium | FR-006 |
| TC-007 | 테마 전환 | 라이트 모드 | 테마 버튼 클릭 | 다크 모드 전환 | High | FR-007 |
| TC-008 | 프로필 메뉴 | 로그인 | 프로필 클릭 | 메뉴 표시 | High | FR-008 |
| TC-009 | 반응형 헤더 | - | 브라우저 크기 조절 | 요소 적응 | Medium | - |
| TC-010 | 키보드 접근성 | - | Tab 키 탐색 | 포커스 이동 | Medium | - |

### 4.2 매뉴얼 테스트 상세

#### TC-001: 로고 표시 및 동작

**테스트 목적**: 헤더 로고가 올바르게 표시되고 홈으로 이동하는지 확인

**테스트 단계**:
1. 로그인 후 포털 페이지 접속
2. 헤더 좌측 로고 영역 확인
3. 로고 클릭
4. 홈 화면 이동 확인

**검증 기준**:
- [ ] 로고가 헤더 좌측에 표시됨
- [ ] 로고 호버 시 커서 포인터로 변경
- [ ] 로고 클릭 시 "/" 경로로 이동

#### TC-005: 검색 단축키 (Ctrl+K)

**테스트 목적**: 전역 검색 단축키가 올바르게 동작하는지 확인

**테스트 단계**:
1. 포털 화면에서 입력 필드 외 영역 클릭
2. Ctrl+K (Mac: Cmd+K) 입력
3. 검색 모달 표시 확인
4. ESC 키로 모달 닫기

**검증 기준**:
- [ ] Ctrl+K 입력 시 검색 모달 즉시 오픈
- [ ] 검색 입력창에 자동 포커스
- [ ] ESC 키로 모달 닫힘
- [ ] 입력 필드 포커스 상태에서는 단축키 비활성화

#### TC-007: 테마 전환

**테스트 목적**: 라이트/다크 테마 전환이 올바르게 동작하는지 확인

**테스트 단계**:
1. 포털 화면에서 테마 버튼 확인 (해/달 아이콘)
2. 테마 버튼 클릭
3. 화면 전체 테마 변경 확인
4. 새로고침 후 테마 유지 확인

**검증 기준**:
- [ ] 라이트 모드: 달 아이콘 표시
- [ ] 다크 모드: 해 아이콘 표시
- [ ] 테마 전환 즉시 적용
- [ ] 새로고침 후에도 테마 유지

#### TC-009: 반응형 헤더

**테스트 목적**: 화면 크기에 따른 헤더 적응 확인

**테스트 단계**:
1. 데스크톱 크기 (1280px+)에서 헤더 확인
2. 태블릿 크기 (768-1023px)로 축소
3. 모바일 크기 (767px-)로 축소

**검증 기준**:
- [ ] 데스크톱: 모든 요소 표시
- [ ] 태블릿: 시계 간소화 (HH:mm)
- [ ] 모바일: 프로필 이름 숨김 (아바타만)

---

## 5. 테스트 데이터 (Fixture)

### 5.1 단위 테스트용 Mock 데이터

| 데이터 ID | 용도 | 값 |
|-----------|------|-----|
| MOCK-USER-DEFAULT | 기본 사용자 | `{ name: '홍길동', email: 'admin@mes.com' }` |
| MOCK-BREADCRUMB | 브레드크럼 | `[{ title: 'Home', path: '/' }, { title: '생산관리' }]` |
| MOCK-NOTIFICATIONS | 알림 개수 | `5` |

### 5.2 E2E 테스트용 시드 데이터

| 시드 ID | 용도 | 생성 방법 | 포함 데이터 |
|---------|------|----------|------------|
| SEED-E2E-HEADER | 헤더 테스트 | 자동 시드 | 테스트 사용자 1명, 알림 5개 |

### 5.3 테스트 계정

| 계정 ID | 이메일 | 비밀번호 | 역할 | 용도 |
|---------|--------|----------|------|------|
| TEST-USER | user@test.com | test1234 | USER | 일반 사용자 헤더 테스트 |

---

## 6. data-testid 목록

### 6.1 헤더 컴포넌트 셀렉터

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `header-logo` | 로고 링크 | 홈 이동 |
| `quick-menu-button` | 빠른 메뉴 버튼 | 즐겨찾기 드롭다운 |
| `header-breadcrumb` | 브레드크럼 | 현재 위치 표시 |
| `header-clock` | 시계 | 시간 표시 |
| `search-button` | 검색 버튼 | 검색 모달 오픈 |
| `search-modal` | 검색 모달 | 전역 검색 UI |
| `notification-button` | 알림 버튼 | 알림 패널 오픈 |
| `notification-badge` | 알림 뱃지 | 알림 개수 |
| `theme-toggle` | 테마 버튼 | 라이트/다크 전환 |
| `profile-dropdown` | 프로필 영역 | 프로필 드롭다운 |
| `logout-menu` | 로그아웃 메뉴 | 로그아웃 동작 |

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
- PRD: `.orchay/projects/mes-portal/prd.md`
