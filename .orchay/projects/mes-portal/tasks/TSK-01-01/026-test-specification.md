# 테스트 명세서 (026-test-specification.md)

**Template Version:** 1.0.0 — **Last Updated:** 2026-01-20

> **목적**: 레이아웃 컴포넌트 구조 테스트 시나리오 정의

---

## 0. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| Task ID | TSK-01-01 |
| Task명 | 레이아웃 컴포넌트 구조 |
| 설계 문서 참조 | `010-design.md` |
| 추적성 매트릭스 참조 | `025-traceability-matrix.md` |
| 작성일 | 2026-01-20 |
| 작성자 | AI |

---

## 1. 테스트 전략 개요

### 1.1 테스트 범위

| 테스트 유형 | 범위 | 목표 커버리지 |
|------------|------|--------------|
| 단위 테스트 | PortalLayout 컴포넌트, 상태 관리 | 80% 이상 |
| E2E 테스트 | 레이아웃 렌더링, 사이드바 토글 | 100% 시나리오 커버 |
| 매뉴얼 테스트 | 반응형, 접근성 | 전체 화면 |

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
| UT-001 | PortalLayout | 정상 렌더링 | 모든 영역 표시 | FR-001 |
| UT-002 | PortalLayout | 사이드바 토글 | collapsed 상태 변경 | FR-002 |
| UT-003 | PortalLayout | breakpoint 반응 | 화면 크기별 상태 | FR-003 |
| UT-004 | useLayoutState | localStorage 저장 | 상태 지속 | BR-001 |
| UT-005 | PortalLayout | 모바일 초기 상태 | collapsed = true | BR-002 |

### 2.2 테스트 케이스 상세

#### UT-001: PortalLayout 정상 렌더링

| 항목 | 내용 |
|------|------|
| **파일** | `components/layout/__tests__/PortalLayout.test.tsx` |
| **테스트 블록** | `describe('PortalLayout') → it('renders all layout sections')` |
| **Mock 의존성** | - |
| **입력 데이터** | `<PortalLayout><div>Content</div></PortalLayout>` |
| **검증 포인트** | Header, Sider, Content, Footer 영역 존재 확인 |
| **커버리지 대상** | PortalLayout 컴포넌트 렌더링 |
| **관련 요구사항** | FR-001 |

```typescript
// 테스트 코드 예시
import { render, screen } from '@testing-library/react';
import { PortalLayout } from '../PortalLayout';

describe('PortalLayout', () => {
  it('renders all layout sections', () => {
    render(
      <PortalLayout
        header={<div data-testid="header">Header</div>}
        sidebar={<div data-testid="sidebar">Sidebar</div>}
        footer={<div data-testid="footer">Footer</div>}
      >
        <div data-testid="content">Content</div>
      </PortalLayout>
    );

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('content')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });
});
```

#### UT-002: 사이드바 토글

| 항목 | 내용 |
|------|------|
| **파일** | `components/layout/__tests__/PortalLayout.test.tsx` |
| **테스트 블록** | `describe('PortalLayout') → it('toggles sidebar collapsed state')` |
| **Mock 의존성** | - |
| **입력 데이터** | 토글 버튼 클릭 이벤트 |
| **검증 포인트** | collapsed 상태 true ↔ false 전환 |
| **커버리지 대상** | setCollapsed 함수 |
| **관련 요구사항** | FR-002 |

```typescript
it('toggles sidebar collapsed state', async () => {
  const { user } = renderWithUser(<PortalLayout>Content</PortalLayout>);

  const sider = screen.getByRole('complementary');
  expect(sider).toHaveStyle({ width: '240px' });

  const toggleButton = screen.getByRole('button', { name: /toggle/i });
  await user.click(toggleButton);

  expect(sider).toHaveStyle({ width: '60px' });
});
```

#### UT-003: breakpoint 반응

| 항목 | 내용 |
|------|------|
| **파일** | `components/layout/__tests__/PortalLayout.test.tsx` |
| **테스트 블록** | `describe('PortalLayout') → it('responds to viewport changes')` |
| **Mock 의존성** | window.matchMedia mock |
| **입력 데이터** | 뷰포트 크기 변경 시뮬레이션 |
| **검증 포인트** | breakpoint별 레이아웃 변화 |
| **관련 요구사항** | FR-003 |

#### UT-004: localStorage 상태 저장

| 항목 | 내용 |
|------|------|
| **파일** | `lib/hooks/__tests__/useLayoutState.test.ts` |
| **테스트 블록** | `describe('useLayoutState') → it('persists collapsed state to localStorage')` |
| **Mock 의존성** | localStorage mock |
| **검증 포인트** | localStorage.setItem 호출 확인 |
| **관련 요구사항** | BR-001 |

#### UT-005: 모바일 초기 상태

| 항목 | 내용 |
|------|------|
| **파일** | `components/layout/__tests__/PortalLayout.test.tsx` |
| **테스트 블록** | `describe('PortalLayout') → it('starts collapsed on mobile')` |
| **Mock 의존성** | window.innerWidth mock (375px) |
| **검증 포인트** | 초기 collapsed = true |
| **관련 요구사항** | BR-002 |

---

## 3. E2E 테스트 시나리오

### 3.1 테스트 케이스 목록

| 테스트 ID | 시나리오 | 사전조건 | 실행 단계 | 예상 결과 | 요구사항 |
|-----------|----------|----------|----------|----------|----------|
| E2E-001 | 레이아웃 표시 | 로그인 | 포털 접속 | 모든 영역 표시 | FR-001 |
| E2E-002 | 사이드바 토글 | 포털 표시 | 토글 클릭 | 사이드바 접힘/펼침 | FR-002 |
| E2E-003 | 반응형 동작 | 포털 표시 | 뷰포트 변경 | 레이아웃 적응 | FR-003, BR-002 |
| E2E-004 | 상태 지속성 | 사이드바 접음 | 새로고침 | 접힌 상태 유지 | BR-001 |

### 3.2 테스트 케이스 상세

#### E2E-001: 레이아웃 표시

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/layout.spec.ts` |
| **테스트명** | `test('포털 레이아웃이 정상적으로 표시된다')` |
| **사전조건** | 로그인 (fixture 사용) |
| **data-testid 셀렉터** | |
| - 레이아웃 컨테이너 | `[data-testid="portal-layout"]` |
| - 헤더 | `[data-testid="portal-header"]` |
| - 사이드바 | `[data-testid="portal-sidebar"]` |
| - 컨텐츠 | `[data-testid="portal-content"]` |
| - 푸터 | `[data-testid="portal-footer"]` |
| **검증 포인트** | 모든 영역 visible |
| **스크린샷** | `e2e-001-layout.png` |
| **관련 요구사항** | FR-001 |

```typescript
// tests/e2e/layout.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Portal Layout', () => {
  test('포털 레이아웃이 정상적으로 표시된다', async ({ page }) => {
    await page.goto('/portal');

    await expect(page.locator('[data-testid="portal-layout"]')).toBeVisible();
    await expect(page.locator('[data-testid="portal-header"]')).toBeVisible();
    await expect(page.locator('[data-testid="portal-sidebar"]')).toBeVisible();
    await expect(page.locator('[data-testid="portal-content"]')).toBeVisible();
    await expect(page.locator('[data-testid="portal-footer"]')).toBeVisible();

    await page.screenshot({ path: 'e2e-001-layout.png' });
  });
});
```

#### E2E-002: 사이드바 토글

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/layout.spec.ts` |
| **테스트명** | `test('사이드바를 접고 펼 수 있다')` |
| **data-testid 셀렉터** | |
| - 토글 버튼 | `[data-testid="sidebar-toggle"]` |
| - 사이드바 | `[data-testid="portal-sidebar"]` |
| **실행 단계** | |
| 1 | 사이드바 초기 너비 확인 (240px) |
| 2 | 토글 버튼 클릭 |
| 3 | 사이드바 접힘 확인 (60px) |
| 4 | 토글 버튼 다시 클릭 |
| 5 | 사이드바 펼침 확인 (240px) |
| **스크린샷** | `e2e-002-sidebar-expanded.png`, `e2e-002-sidebar-collapsed.png` |
| **관련 요구사항** | FR-002 |

#### E2E-003: 반응형 동작

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/layout.spec.ts` |
| **테스트명** | `test('반응형 레이아웃이 동작한다')` |
| **뷰포트 테스트** | |
| - Desktop | `{ width: 1280, height: 720 }` → 사이드바 펼침 |
| - Tablet | `{ width: 768, height: 1024 }` → 사이드바 접힘 |
| - Mobile | `{ width: 375, height: 667 }` → 사이드바 숨김/오버레이 |
| **스크린샷** | `e2e-003-desktop.png`, `e2e-003-tablet.png`, `e2e-003-mobile.png` |
| **관련 요구사항** | FR-003, BR-002 |

#### E2E-004: 상태 지속성

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/layout.spec.ts` |
| **테스트명** | `test('사이드바 상태가 새로고침 후에도 유지된다')` |
| **실행 단계** | |
| 1 | 사이드바 접기 |
| 2 | 페이지 새로고침 |
| 3 | 사이드바 접힌 상태 확인 |
| **관련 요구사항** | BR-001 |

---

## 4. UI 테스트케이스 (매뉴얼)

### 4.1 테스트 케이스 목록

| TC-ID | 테스트 항목 | 사전조건 | 테스트 단계 | 예상 결과 | 우선순위 | 요구사항 |
|-------|-----------|---------|-----------|----------|---------|----------|
| TC-001 | 레이아웃 구조 | 로그인 | 포털 접속 | 영역 구분 명확 | High | FR-001 |
| TC-002 | 사이드바 토글 | 포털 표시 | 토글 클릭 | 애니메이션 부드러움 | High | FR-002 |
| TC-003 | 반응형 확인 | - | 브라우저 크기 조절 | 레이아웃 적응 | Medium | FR-003 |
| TC-004 | CSS Variables | - | 개발자 도구 확인 | 변수 적용됨 | Medium | FR-001 |
| TC-005 | 키보드 접근성 | - | Tab 키 탐색 | 포커스 이동 | Medium | - |

### 4.2 매뉴얼 테스트 상세

#### TC-001: 레이아웃 구조

**테스트 목적**: 포털 레이아웃의 각 영역이 설계대로 구성되었는지 확인

**테스트 단계**:
1. 로그인 후 포털 페이지 접속
2. 헤더 영역 확인 (상단 60px)
3. 사이드바 영역 확인 (좌측 240px)
4. 컨텐츠 영역 확인 (나머지 영역)
5. 푸터 영역 확인 (하단 30px)

**검증 기준**:
- [ ] 헤더가 상단에 고정되어 있음
- [ ] 사이드바가 헤더 아래 좌측에 위치
- [ ] 컨텐츠가 사이드바 우측에 위치
- [ ] 푸터가 컨텐츠 아래에 위치
- [ ] 각 영역의 크기가 CSS Variables와 일치

#### TC-002: 사이드바 토글

**테스트 목적**: 사이드바 접기/펼치기 기능이 원활하게 동작하는지 확인

**테스트 단계**:
1. 사이드바 하단의 토글 버튼 확인
2. 토글 버튼 클릭
3. 사이드바가 60px로 축소되는지 확인
4. 다시 토글 버튼 클릭
5. 사이드바가 240px로 확장되는지 확인

**검증 기준**:
- [ ] 토글 애니메이션이 부드럽게 동작 (0.2s)
- [ ] 접힌 상태에서 아이콘만 표시
- [ ] 컨텐츠 영역이 자동으로 조절됨

---

## 5. 테스트 데이터 (Fixture)

### 5.1 단위 테스트용 Mock 데이터

| 데이터 ID | 용도 | 값 |
|-----------|------|-----|
| MOCK-LAYOUT-DEFAULT | 기본 레이아웃 상태 | `{ collapsed: false, breakpoint: 'desktop' }` |
| MOCK-LAYOUT-COLLAPSED | 접힌 상태 | `{ collapsed: true, breakpoint: 'desktop' }` |
| MOCK-LAYOUT-MOBILE | 모바일 상태 | `{ collapsed: true, breakpoint: 'mobile' }` |

### 5.2 E2E 테스트용 시드 데이터

| 시드 ID | 용도 | 생성 방법 | 포함 데이터 |
|---------|------|----------|------------|
| SEED-E2E-LAYOUT | 레이아웃 테스트 | 자동 시드 | 테스트 사용자 1명 |

### 5.3 테스트 계정

| 계정 ID | 이메일 | 비밀번호 | 역할 | 용도 |
|---------|--------|----------|------|------|
| TEST-USER | user@test.com | test1234 | USER | 일반 사용자 레이아웃 테스트 |

---

## 6. data-testid 목록

### 6.1 레이아웃 컴포넌트 셀렉터

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `portal-layout` | Layout 컨테이너 | 전체 레이아웃 확인 |
| `portal-header` | Header 영역 | 헤더 표시 확인 |
| `portal-sidebar` | Sider 영역 | 사이드바 표시 확인 |
| `portal-content` | Content 영역 | 컨텐츠 표시 확인 |
| `portal-footer` | Footer 영역 | 푸터 표시 확인 |
| `sidebar-toggle` | 토글 버튼 | 사이드바 토글 |
| `tab-bar` | 탭 바 영역 | MDI 탭 영역 (슬롯) |

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
