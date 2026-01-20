# 테스트 명세서 (026-test-specification.md)

**Template Version:** 1.0.0 — **Last Updated:** 2026-01-20

> **목적**: 로딩 및 에러 상태 컴포넌트 테스트 시나리오 정의

---

## 0. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| Task ID | TSK-05-01 |
| Task명 | 로딩 및 에러 상태 컴포넌트 |
| 설계 문서 참조 | `010-design.md` |
| 추적성 매트릭스 참조 | `025-traceability-matrix.md` |
| 작성일 | 2026-01-20 |
| 작성자 | AI |

---

## 1. 테스트 전략 개요

### 1.1 테스트 범위

| 테스트 유형 | 범위 | 목표 커버리지 |
|------------|------|--------------|
| 단위 테스트 | PageLoading, ComponentSkeleton, EmptyState, ErrorBoundary, ErrorPage | 80% 이상 |
| E2E 테스트 | 페이지 로딩 흐름, 빈 상태 표시, 에러 처리 | 100% 시나리오 커버 |
| 매뉴얼 테스트 | 시각적 피드백, 애니메이션, 반응형 | 전체 화면 |

### 1.2 테스트 환경

| 항목 | 내용 |
|------|------|
| 테스트 프레임워크 (단위) | Vitest + React Testing Library |
| 테스트 프레임워크 (E2E) | Playwright |
| 브라우저 | Chromium (기본), Firefox, WebKit |
| 베이스 URL | `http://localhost:3000` |
| 반응형 테스트 뷰포트 | Desktop (1280x720), Tablet (768x1024), Mobile (375x667) |

### 1.3 테스트 대상 컴포넌트

| 컴포넌트 | 파일 경로 | 역할 |
|----------|----------|------|
| PageLoading | `components/common/PageLoading.tsx` | 전체 페이지 로딩 스피너 |
| ComponentSkeleton | `components/common/ComponentSkeleton.tsx` | 컴포넌트별 로딩 스켈레톤 |
| EmptyState | `components/common/EmptyState.tsx` | 빈 상태 컴포넌트 |
| ErrorBoundary | `components/common/ErrorBoundary.tsx` | 에러 바운더리 |
| ErrorPage | `app/error.tsx`, `app/not-found.tsx` | 에러 페이지 (404, 500, 403, 네트워크) |

---

## 2. 단위 테스트 시나리오

### 2.1 테스트 케이스 목록

| 테스트 ID | 대상 | 시나리오 | 예상 결과 | 요구사항 |
|-----------|------|----------|----------|----------|
| UT-001 | PageLoading | 로딩 표시 | Spin 컴포넌트 렌더링 | UC-01 |
| UT-002 | PageLoading | 로딩 완료 | 컴포넌트 미표시 | UC-01 |
| UT-003 | PageLoading | 커스텀 메시지 | 지정된 tip 텍스트 표시 | UC-01 |
| UT-004 | PageLoading | 전체 화면 모드 | fullScreen 스타일 적용 | UC-01 |
| UT-005 | PageLoading | 사이즈 옵션 | small/default/large 크기 적용 | UC-01 |
| UT-006 | ComponentSkeleton | 스켈레톤 렌더링 | Skeleton 컴포넌트 렌더링 | UC-01 |
| UT-007 | ComponentSkeleton | 테이블 스켈레톤 | 테이블 형태 스켈레톤 렌더링 | UC-01 |
| UT-008 | ComponentSkeleton | 카드 스켈레톤 | 카드 형태 스켈레톤 렌더링 | UC-01 |
| UT-009 | EmptyState | 기본 빈 상태 | Empty 컴포넌트 + 기본 메시지 | UC-02 |
| UT-010 | EmptyState | 검색 결과 없음 | 검색 안내 메시지 표시 | UC-02 |
| UT-011 | EmptyState | 필터 초기화 버튼 | 버튼 클릭 시 콜백 호출 | UC-02 |
| UT-012 | EmptyState | 커스텀 아이콘 | 지정된 아이콘 표시 | UC-02 |
| UT-013 | EmptyState | 액션 버튼 렌더링 | 액션 버튼 표시 및 클릭 가능 | UC-02 |
| UT-014 | ErrorBoundary | 에러 캐치 | fallback UI 렌더링 | UC-03 |
| UT-015 | ErrorBoundary | 에러 콜백 호출 | onError 콜백 실행 | UC-03 |
| UT-016 | ErrorBoundary | 정상 자식 렌더링 | 에러 없으면 children 렌더링 | UC-03 |
| UT-017 | ErrorBoundary | 커스텀 fallback | 지정된 fallback 컴포넌트 렌더링 | UC-03 |
| UT-018 | ErrorPage | 404 렌더링 | Result status="404" | UC-03 |
| UT-019 | ErrorPage | 500 렌더링 | Result status="500" | UC-03 |
| UT-020 | ErrorPage | 403 렌더링 | Result status="403" 권한 없음 | UC-03 |
| UT-021 | ErrorPage | 네트워크 에러 | 연결 실패 메시지 표시 | UC-03 |
| UT-022 | ErrorPage | 재시도 버튼 | 클릭 시 onRetry 콜백 호출 | UC-03 |
| UT-023 | ErrorPage | 홈으로 버튼 | 클릭 시 홈 이동 | UC-03 |

### 2.2 테스트 케이스 상세

#### UT-001: PageLoading 로딩 표시

| 항목 | 내용 |
|------|------|
| **파일** | `components/common/__tests__/PageLoading.test.tsx` |
| **테스트 블록** | `describe('PageLoading') -> it('renders Spin component when loading')` |
| **Mock 의존성** | - |
| **입력 데이터** | `<PageLoading />` |
| **검증 포인트** | Spin 컴포넌트 존재 확인, data-testid="page-loading" 존재 |
| **커버리지 대상** | PageLoading 컴포넌트 기본 렌더링 |
| **관련 요구사항** | UC-01 |

```typescript
// 테스트 코드 예시
import { render, screen } from '@testing-library/react';
import { PageLoading } from '../PageLoading';

describe('PageLoading', () => {
  it('renders Spin component when loading', () => {
    render(<PageLoading />);

    expect(screen.getByTestId('page-loading')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
```

#### UT-002: PageLoading 로딩 완료

| 항목 | 내용 |
|------|------|
| **파일** | `components/common/__tests__/PageLoading.test.tsx` |
| **테스트 블록** | `describe('PageLoading') -> it('does not render when loading is false')` |
| **Mock 의존성** | - |
| **입력 데이터** | `<PageLoading loading={false} />` |
| **검증 포인트** | data-testid="page-loading" 미존재 |
| **커버리지 대상** | loading prop 조건부 렌더링 |
| **관련 요구사항** | UC-01 |

```typescript
it('does not render when loading is false', () => {
  render(<PageLoading loading={false} />);

  expect(screen.queryByTestId('page-loading')).not.toBeInTheDocument();
});
```

#### UT-003: PageLoading 커스텀 메시지

| 항목 | 내용 |
|------|------|
| **파일** | `components/common/__tests__/PageLoading.test.tsx` |
| **테스트 블록** | `describe('PageLoading') -> it('displays custom tip message')` |
| **입력 데이터** | `<PageLoading tip="데이터 처리 중..." />` |
| **검증 포인트** | "데이터 처리 중..." 텍스트 존재 |
| **관련 요구사항** | UC-01 |

```typescript
it('displays custom tip message', () => {
  render(<PageLoading tip="데이터 처리 중..." />);

  expect(screen.getByText('데이터 처리 중...')).toBeInTheDocument();
});
```

#### UT-004: PageLoading 전체 화면 모드

| 항목 | 내용 |
|------|------|
| **파일** | `components/common/__tests__/PageLoading.test.tsx` |
| **테스트 블록** | `describe('PageLoading') -> it('applies fullScreen styles')` |
| **입력 데이터** | `<PageLoading fullScreen />` |
| **검증 포인트** | 전체 화면 오버레이 스타일 적용 (position: fixed, inset: 0) |
| **관련 요구사항** | UC-01 |

```typescript
it('applies fullScreen styles', () => {
  render(<PageLoading fullScreen />);

  const container = screen.getByTestId('page-loading');
  expect(container).toHaveClass('fullscreen');
});
```

#### UT-005: PageLoading 사이즈 옵션

| 항목 | 내용 |
|------|------|
| **파일** | `components/common/__tests__/PageLoading.test.tsx` |
| **테스트 블록** | `describe('PageLoading') -> it.each(['small', 'default', 'large'])` |
| **입력 데이터** | `<PageLoading size="small" />`, `<PageLoading size="large" />` |
| **검증 포인트** | Spin 컴포넌트에 size prop 전달 |
| **관련 요구사항** | UC-01 |

```typescript
it.each(['small', 'default', 'large'] as const)(
  'renders with size %s',
  (size) => {
    render(<PageLoading size={size} />);

    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
  }
);
```

#### UT-006: ComponentSkeleton 스켈레톤 렌더링

| 항목 | 내용 |
|------|------|
| **파일** | `components/common/__tests__/ComponentSkeleton.test.tsx` |
| **테스트 블록** | `describe('ComponentSkeleton') -> it('renders Skeleton component')` |
| **Mock 의존성** | - |
| **입력 데이터** | `<ComponentSkeleton />` |
| **검증 포인트** | data-testid="component-skeleton" 존재, Skeleton 컴포넌트 렌더링 |
| **커버리지 대상** | ComponentSkeleton 기본 렌더링 |
| **관련 요구사항** | UC-01 |

```typescript
import { render, screen } from '@testing-library/react';
import { ComponentSkeleton } from '../ComponentSkeleton';

describe('ComponentSkeleton', () => {
  it('renders Skeleton component', () => {
    render(<ComponentSkeleton />);

    expect(screen.getByTestId('component-skeleton')).toBeInTheDocument();
  });
});
```

#### UT-007: ComponentSkeleton 테이블 스켈레톤

| 항목 | 내용 |
|------|------|
| **파일** | `components/common/__tests__/ComponentSkeleton.test.tsx` |
| **테스트 블록** | `describe('ComponentSkeleton') -> it('renders table skeleton variant')` |
| **입력 데이터** | `<ComponentSkeleton variant="table" rows={5} />` |
| **검증 포인트** | 5개의 스켈레톤 행 렌더링 |
| **관련 요구사항** | UC-01 |

```typescript
it('renders table skeleton variant', () => {
  render(<ComponentSkeleton variant="table" rows={5} />);

  const skeletonRows = screen.getAllByTestId('skeleton-row');
  expect(skeletonRows).toHaveLength(5);
});
```

#### UT-008: ComponentSkeleton 카드 스켈레톤

| 항목 | 내용 |
|------|------|
| **파일** | `components/common/__tests__/ComponentSkeleton.test.tsx` |
| **테스트 블록** | `describe('ComponentSkeleton') -> it('renders card skeleton variant')` |
| **입력 데이터** | `<ComponentSkeleton variant="card" />` |
| **검증 포인트** | 카드 형태 스켈레톤 (avatar + paragraph) 렌더링 |
| **관련 요구사항** | UC-01 |

```typescript
it('renders card skeleton variant', () => {
  render(<ComponentSkeleton variant="card" />);

  expect(screen.getByTestId('component-skeleton')).toHaveClass('card');
});
```

#### UT-009: EmptyState 기본 빈 상태

| 항목 | 내용 |
|------|------|
| **파일** | `components/common/__tests__/EmptyState.test.tsx` |
| **테스트 블록** | `describe('EmptyState') -> it('renders default empty state')` |
| **Mock 의존성** | - |
| **입력 데이터** | `<EmptyState />` |
| **검증 포인트** | Empty 컴포넌트 렌더링, 기본 메시지 "데이터가 없습니다" 표시 |
| **커버리지 대상** | EmptyState 기본 렌더링 |
| **관련 요구사항** | UC-02 |

```typescript
import { render, screen } from '@testing-library/react';
import { EmptyState } from '../EmptyState';

describe('EmptyState', () => {
  it('renders default empty state', () => {
    render(<EmptyState />);

    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    expect(screen.getByTestId('empty-state-message')).toHaveTextContent('데이터가 없습니다');
  });
});
```

#### UT-010: EmptyState 검색 결과 없음

| 항목 | 내용 |
|------|------|
| **파일** | `components/common/__tests__/EmptyState.test.tsx` |
| **테스트 블록** | `describe('EmptyState') -> it('renders search empty state')` |
| **입력 데이터** | `<EmptyState type="search" />` |
| **검증 포인트** | "검색 결과가 없습니다" 메시지 표시 |
| **관련 요구사항** | UC-02 |

```typescript
it('renders search empty state', () => {
  render(<EmptyState type="search" />);

  expect(screen.getByTestId('empty-state-message')).toHaveTextContent('검색 결과가 없습니다');
});
```

#### UT-011: EmptyState 필터 초기화 버튼

| 항목 | 내용 |
|------|------|
| **파일** | `components/common/__tests__/EmptyState.test.tsx` |
| **테스트 블록** | `describe('EmptyState') -> it('calls onReset callback when filter reset button clicked')` |
| **입력 데이터** | `<EmptyState type="filter" onReset={mockFn} />` |
| **검증 포인트** | 버튼 클릭 시 onReset 콜백 호출 |
| **관련 요구사항** | UC-02 |

```typescript
it('calls onReset callback when filter reset button clicked', async () => {
  const onReset = vi.fn();
  const { user } = renderWithUser(<EmptyState type="filter" onReset={onReset} />);

  await user.click(screen.getByTestId('empty-state-action'));

  expect(onReset).toHaveBeenCalledTimes(1);
});
```

#### UT-012: EmptyState 커스텀 아이콘

| 항목 | 내용 |
|------|------|
| **파일** | `components/common/__tests__/EmptyState.test.tsx` |
| **테스트 블록** | `describe('EmptyState') -> it('renders custom icon')` |
| **입력 데이터** | `<EmptyState icon={<CustomIcon data-testid="custom-icon" />} />` |
| **검증 포인트** | 커스텀 아이콘 렌더링 |
| **관련 요구사항** | UC-02 |

```typescript
it('renders custom icon', () => {
  render(<EmptyState icon={<div data-testid="custom-icon">Icon</div>} />);

  expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
});
```

#### UT-013: EmptyState 액션 버튼 렌더링

| 항목 | 내용 |
|------|------|
| **파일** | `components/common/__tests__/EmptyState.test.tsx` |
| **테스트 블록** | `describe('EmptyState') -> it('renders action button')` |
| **입력 데이터** | `<EmptyState action={<Button>새로 추가</Button>} />` |
| **검증 포인트** | 액션 버튼 표시 및 클릭 가능 |
| **관련 요구사항** | UC-02 |

```typescript
it('renders action button', async () => {
  const onClick = vi.fn();
  const { user } = renderWithUser(
    <EmptyState action={<Button onClick={onClick}>새로 추가</Button>} />
  );

  await user.click(screen.getByRole('button', { name: '새로 추가' }));

  expect(onClick).toHaveBeenCalledTimes(1);
});
```

#### UT-014: ErrorBoundary 에러 캐치

| 항목 | 내용 |
|------|------|
| **파일** | `components/common/__tests__/ErrorBoundary.test.tsx` |
| **테스트 블록** | `describe('ErrorBoundary') -> it('catches error and renders fallback UI')` |
| **Mock 의존성** | console.error mock (에러 로그 억제) |
| **입력 데이터** | 에러를 발생시키는 자식 컴포넌트 |
| **검증 포인트** | fallback UI 렌더링, data-testid="error-boundary" 존재 |
| **커버리지 대상** | ErrorBoundary componentDidCatch |
| **관련 요구사항** | UC-03 |

```typescript
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '../ErrorBoundary';

const ThrowError = () => {
  throw new Error('Test error');
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('catches error and renders fallback UI', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    expect(screen.getByText(/오류가 발생했습니다/)).toBeInTheDocument();
  });
});
```

#### UT-015: ErrorBoundary 에러 콜백 호출

| 항목 | 내용 |
|------|------|
| **파일** | `components/common/__tests__/ErrorBoundary.test.tsx` |
| **테스트 블록** | `describe('ErrorBoundary') -> it('calls onError callback with error info')` |
| **입력 데이터** | `<ErrorBoundary onError={mockFn}><ThrowError /></ErrorBoundary>` |
| **검증 포인트** | onError 콜백이 Error 객체와 ErrorInfo 객체와 함께 호출됨 |
| **관련 요구사항** | UC-03 |

```typescript
it('calls onError callback with error info', () => {
  const onError = vi.fn();

  render(
    <ErrorBoundary onError={onError}>
      <ThrowError />
    </ErrorBoundary>
  );

  expect(onError).toHaveBeenCalledTimes(1);
  expect(onError).toHaveBeenCalledWith(
    expect.any(Error),
    expect.objectContaining({ componentStack: expect.any(String) })
  );
});
```

#### UT-016: ErrorBoundary 정상 자식 렌더링

| 항목 | 내용 |
|------|------|
| **파일** | `components/common/__tests__/ErrorBoundary.test.tsx` |
| **테스트 블록** | `describe('ErrorBoundary') -> it('renders children when no error')` |
| **입력 데이터** | `<ErrorBoundary><div>Content</div></ErrorBoundary>` |
| **검증 포인트** | children 정상 렌더링 |
| **관련 요구사항** | UC-03 |

```typescript
it('renders children when no error', () => {
  render(
    <ErrorBoundary>
      <div data-testid="child-content">Content</div>
    </ErrorBoundary>
  );

  expect(screen.getByTestId('child-content')).toBeInTheDocument();
  expect(screen.queryByTestId('error-boundary')).not.toBeInTheDocument();
});
```

#### UT-017: ErrorBoundary 커스텀 fallback

| 항목 | 내용 |
|------|------|
| **파일** | `components/common/__tests__/ErrorBoundary.test.tsx` |
| **테스트 블록** | `describe('ErrorBoundary') -> it('renders custom fallback component')` |
| **입력 데이터** | `<ErrorBoundary fallback={<div>Custom Error</div>}><ThrowError /></ErrorBoundary>` |
| **검증 포인트** | 커스텀 fallback 컴포넌트 렌더링 |
| **관련 요구사항** | UC-03 |

```typescript
it('renders custom fallback component', () => {
  render(
    <ErrorBoundary fallback={<div data-testid="custom-fallback">Custom Error</div>}>
      <ThrowError />
    </ErrorBoundary>
  );

  expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
});
```

#### UT-018: ErrorPage 404 렌더링

| 항목 | 내용 |
|------|------|
| **파일** | `components/common/__tests__/ErrorPage.test.tsx` |
| **테스트 블록** | `describe('ErrorPage') -> it('renders 404 page')` |
| **Mock 의존성** | - |
| **입력 데이터** | `<ErrorPage statusCode={404} />` |
| **검증 포인트** | Result status="404", "페이지를 찾을 수 없습니다" 메시지 |
| **커버리지 대상** | ErrorPage 404 상태 렌더링 |
| **관련 요구사항** | UC-03 |

```typescript
import { render, screen } from '@testing-library/react';
import { ErrorPage } from '../ErrorPage';

describe('ErrorPage', () => {
  it('renders 404 page', () => {
    render(<ErrorPage statusCode={404} />);

    expect(screen.getByTestId('error-page')).toBeInTheDocument();
    expect(screen.getByTestId('error-page-title')).toHaveTextContent('404');
    expect(screen.getByTestId('error-page-message')).toHaveTextContent('페이지를 찾을 수 없습니다');
  });
});
```

#### UT-019: ErrorPage 500 렌더링

| 항목 | 내용 |
|------|------|
| **파일** | `components/common/__tests__/ErrorPage.test.tsx` |
| **테스트 블록** | `describe('ErrorPage') -> it('renders 500 page')` |
| **입력 데이터** | `<ErrorPage statusCode={500} />` |
| **검증 포인트** | Result status="500", "서버 오류가 발생했습니다" 메시지 |
| **관련 요구사항** | UC-03 |

```typescript
it('renders 500 page', () => {
  render(<ErrorPage statusCode={500} />);

  expect(screen.getByTestId('error-page-title')).toHaveTextContent('500');
  expect(screen.getByTestId('error-page-message')).toHaveTextContent('서버 오류가 발생했습니다');
});
```

#### UT-020: ErrorPage 403 렌더링

| 항목 | 내용 |
|------|------|
| **파일** | `components/common/__tests__/ErrorPage.test.tsx` |
| **테스트 블록** | `describe('ErrorPage') -> it('renders 403 page')` |
| **입력 데이터** | `<ErrorPage statusCode={403} />` |
| **검증 포인트** | "접근 권한이 없습니다" 메시지, 관리자 문의 안내 |
| **관련 요구사항** | UC-03 |

```typescript
it('renders 403 page', () => {
  render(<ErrorPage statusCode={403} />);

  expect(screen.getByTestId('error-page-title')).toHaveTextContent('403');
  expect(screen.getByTestId('error-page-message')).toHaveTextContent('접근 권한이 없습니다');
});
```

#### UT-021: ErrorPage 네트워크 에러

| 항목 | 내용 |
|------|------|
| **파일** | `components/common/__tests__/ErrorPage.test.tsx` |
| **테스트 블록** | `describe('ErrorPage') -> it('renders network error page')` |
| **입력 데이터** | `<ErrorPage type="network" />` |
| **검증 포인트** | "네트워크 연결을 확인해주세요" 메시지, 재시도 버튼 표시 |
| **관련 요구사항** | UC-03 |

```typescript
it('renders network error page', () => {
  render(<ErrorPage type="network" />);

  expect(screen.getByTestId('error-page-message')).toHaveTextContent('네트워크 연결을 확인해주세요');
  expect(screen.getByTestId('error-page-retry-btn')).toBeInTheDocument();
});
```

#### UT-022: ErrorPage 재시도 버튼

| 항목 | 내용 |
|------|------|
| **파일** | `components/common/__tests__/ErrorPage.test.tsx` |
| **테스트 블록** | `describe('ErrorPage') -> it('calls onRetry when retry button clicked')` |
| **입력 데이터** | `<ErrorPage statusCode={500} onRetry={mockFn} />` |
| **검증 포인트** | 재시도 버튼 클릭 시 onRetry 콜백 호출 |
| **관련 요구사항** | UC-03 |

```typescript
it('calls onRetry when retry button clicked', async () => {
  const onRetry = vi.fn();
  const { user } = renderWithUser(<ErrorPage statusCode={500} onRetry={onRetry} />);

  await user.click(screen.getByTestId('error-page-retry-btn'));

  expect(onRetry).toHaveBeenCalledTimes(1);
});
```

#### UT-023: ErrorPage 홈으로 버튼

| 항목 | 내용 |
|------|------|
| **파일** | `components/common/__tests__/ErrorPage.test.tsx` |
| **테스트 블록** | `describe('ErrorPage') -> it('navigates to home when home button clicked')` |
| **Mock 의존성** | next/navigation mock |
| **입력 데이터** | `<ErrorPage statusCode={404} />` |
| **검증 포인트** | 홈으로 버튼 클릭 시 "/" 경로로 이동 |
| **관련 요구사항** | UC-03 |

```typescript
it('navigates to home when home button clicked', async () => {
  const push = vi.fn();
  vi.mocked(useRouter).mockReturnValue({ push } as any);

  const { user } = renderWithUser(<ErrorPage statusCode={404} />);

  await user.click(screen.getByRole('button', { name: /홈으로/i }));

  expect(push).toHaveBeenCalledWith('/');
});
```

---

## 3. E2E 테스트 시나리오

### 3.1 테스트 케이스 목록

| 테스트 ID | 시나리오 | 사전조건 | 실행 단계 | 예상 결과 | 요구사항 |
|-----------|----------|----------|----------|----------|----------|
| E2E-001 | 페이지 초기 로딩 | 로그인 | 페이지 접속 | 로딩 스피너 표시 후 콘텐츠 | UC-01 |
| E2E-002 | 빈 목록 페이지 | 데이터 없음 | 목록 페이지 접속 | Empty 상태 표시 | UC-02 |
| E2E-003 | API 에러 발생 | API 오류 설정 | 데이터 조회 | 에러 메시지 + 재시도 버튼 | UC-03 |
| E2E-004 | 404 페이지 접근 | - | 존재하지 않는 URL 접근 | 404 에러 페이지 표시 | UC-03 |
| E2E-005 | 에러 복구 (재시도) | 일시적 오류 | 재시도 버튼 클릭 | 정상 콘텐츠 표시 | UC-03, BR-02 |
| E2E-006 | 스켈레톤 로딩 | 데이터 로딩 중 | 테이블 컴포넌트 로딩 | 스켈레톤 표시 후 데이터 | UC-01 |

### 3.2 테스트 케이스 상세

#### E2E-001: 페이지 초기 로딩

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/loading-states.spec.ts` |
| **테스트명** | `test('페이지 초기 로딩 시 스피너가 표시된다')` |
| **사전조건** | 로그인 (fixture 사용) |
| **data-testid 셀렉터** | |
| - 로딩 스피너 | `[data-testid="page-loading"]` |
| - 페이지 콘텐츠 | `[data-testid="page-content"]` |
| **실행 단계** | |
| 1 | 페이지 접속 (네트워크 쓰로틀링 적용) |
| 2 | 로딩 스피너 표시 확인 |
| 3 | 데이터 로드 완료 대기 |
| 4 | 콘텐츠 표시 확인 |
| **검증 포인트** | 로딩 -> 콘텐츠 전환 |
| **스크린샷** | `e2e-001-loading.png`, `e2e-001-loaded.png` |
| **관련 요구사항** | UC-01 |

```typescript
// tests/e2e/loading-states.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Loading States', () => {
  test('페이지 초기 로딩 시 스피너가 표시된다', async ({ page }) => {
    // 네트워크 쓰로틀링으로 로딩 상태 확인
    await page.route('**/api/**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await route.continue();
    });

    await page.goto('/dashboard');

    // 로딩 스피너 표시 확인
    await expect(page.locator('[data-testid="page-loading"]')).toBeVisible();
    await page.screenshot({ path: 'e2e-001-loading.png' });

    // 콘텐츠 로드 대기
    await expect(page.locator('[data-testid="page-content"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-testid="page-loading"]')).not.toBeVisible();
    await page.screenshot({ path: 'e2e-001-loaded.png' });
  });
});
```

#### E2E-002: 빈 목록 페이지

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/loading-states.spec.ts` |
| **테스트명** | `test('데이터가 없을 때 Empty 상태가 표시된다')` |
| **사전조건** | 빈 데이터 API 응답 |
| **data-testid 셀렉터** | |
| - 빈 상태 | `[data-testid="empty-state"]` |
| - 빈 상태 메시지 | `[data-testid="empty-state-message"]` |
| **검증 포인트** | Empty 컴포넌트 표시, 안내 메시지 확인 |
| **스크린샷** | `e2e-002-empty-state.png` |
| **관련 요구사항** | UC-02 |

```typescript
test('데이터가 없을 때 Empty 상태가 표시된다', async ({ page }) => {
  // 빈 데이터 응답 설정
  await page.route('**/api/items', (route) =>
    route.fulfill({
      status: 200,
      body: JSON.stringify({ items: [], total: 0 }),
    })
  );

  await page.goto('/items');

  await expect(page.locator('[data-testid="empty-state"]')).toBeVisible();
  await expect(page.locator('[data-testid="empty-state-message"]')).toContainText('데이터가 없습니다');
  await page.screenshot({ path: 'e2e-002-empty-state.png' });
});
```

#### E2E-003: API 에러 발생

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/loading-states.spec.ts` |
| **테스트명** | `test('API 에러 발생 시 에러 메시지와 재시도 버튼이 표시된다')` |
| **사전조건** | API 500 에러 응답 |
| **data-testid 셀렉터** | |
| - 에러 페이지 | `[data-testid="error-page"]` |
| - 에러 메시지 | `[data-testid="error-page-message"]` |
| - 재시도 버튼 | `[data-testid="error-page-retry-btn"]` |
| **검증 포인트** | 에러 메시지 표시, 재시도 버튼 클릭 가능 |
| **스크린샷** | `e2e-003-error-state.png` |
| **관련 요구사항** | UC-03 |

```typescript
test('API 에러 발생 시 에러 메시지와 재시도 버튼이 표시된다', async ({ page }) => {
  await page.route('**/api/data', (route) =>
    route.fulfill({
      status: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    })
  );

  await page.goto('/data');

  await expect(page.locator('[data-testid="error-page"]')).toBeVisible();
  await expect(page.locator('[data-testid="error-page-message"]')).toContainText('서버 오류');
  await expect(page.locator('[data-testid="error-page-retry-btn"]')).toBeVisible();
  await page.screenshot({ path: 'e2e-003-error-state.png' });
});
```

#### E2E-004: 404 페이지 접근

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/loading-states.spec.ts` |
| **테스트명** | `test('존재하지 않는 페이지 접근 시 404 페이지가 표시된다')` |
| **사전조건** | - |
| **data-testid 셀렉터** | |
| - 에러 페이지 | `[data-testid="error-page"]` |
| - 에러 제목 | `[data-testid="error-page-title"]` |
| **실행 단계** | |
| 1 | 존재하지 않는 URL 접근 |
| 2 | 404 페이지 표시 확인 |
| 3 | 홈으로 버튼 확인 |
| **검증 포인트** | 404 에러 페이지 렌더링 |
| **스크린샷** | `e2e-004-404-page.png` |
| **관련 요구사항** | UC-03 |

```typescript
test('존재하지 않는 페이지 접근 시 404 페이지가 표시된다', async ({ page }) => {
  await page.goto('/non-existent-page');

  await expect(page.locator('[data-testid="error-page"]')).toBeVisible();
  await expect(page.locator('[data-testid="error-page-title"]')).toContainText('404');
  await expect(page.getByRole('button', { name: /홈으로/i })).toBeVisible();
  await page.screenshot({ path: 'e2e-004-404-page.png' });
});
```

#### E2E-005: 에러 복구 (재시도)

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/loading-states.spec.ts` |
| **테스트명** | `test('재시도 버튼 클릭 시 데이터를 다시 로드한다')` |
| **사전조건** | 첫 요청 실패 -> 두 번째 요청 성공 |
| **data-testid 셀렉터** | |
| - 재시도 버튼 | `[data-testid="error-page-retry-btn"]` |
| - 페이지 콘텐츠 | `[data-testid="page-content"]` |
| **실행 단계** | |
| 1 | 에러 페이지 확인 |
| 2 | 재시도 버튼 클릭 |
| 3 | 정상 콘텐츠 표시 확인 |
| **스크린샷** | `e2e-005-retry-success.png` |
| **관련 요구사항** | UC-03, BR-02 |

```typescript
test('재시도 버튼 클릭 시 데이터를 다시 로드한다', async ({ page }) => {
  let requestCount = 0;

  await page.route('**/api/data', (route) => {
    requestCount++;
    if (requestCount === 1) {
      route.fulfill({ status: 500 });
    } else {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ data: 'success' }),
      });
    }
  });

  await page.goto('/data');

  // 에러 상태 확인
  await expect(page.locator('[data-testid="error-page"]')).toBeVisible();

  // 재시도
  await page.click('[data-testid="error-page-retry-btn"]');

  // 성공 상태 확인
  await expect(page.locator('[data-testid="page-content"]')).toBeVisible();
  await page.screenshot({ path: 'e2e-005-retry-success.png' });
});
```

#### E2E-006: 스켈레톤 로딩

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/loading-states.spec.ts` |
| **테스트명** | `test('테이블 로딩 시 스켈레톤이 표시된다')` |
| **사전조건** | 느린 네트워크 응답 |
| **data-testid 셀렉터** | |
| - 스켈레톤 | `[data-testid="component-skeleton"]` |
| - 테이블 | `[data-testid="data-table"]` |
| **검증 포인트** | 스켈레톤 -> 테이블 전환 |
| **스크린샷** | `e2e-006-skeleton.png`, `e2e-006-table.png` |
| **관련 요구사항** | UC-01 |

```typescript
test('테이블 로딩 시 스켈레톤이 표시된다', async ({ page }) => {
  await page.route('**/api/table-data', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await route.fulfill({
      status: 200,
      body: JSON.stringify({ items: [{ id: 1, name: 'Item 1' }] }),
    });
  });

  await page.goto('/table');

  // 스켈레톤 표시 확인
  await expect(page.locator('[data-testid="component-skeleton"]')).toBeVisible();
  await page.screenshot({ path: 'e2e-006-skeleton.png' });

  // 테이블 로드 대기
  await expect(page.locator('[data-testid="data-table"]')).toBeVisible({ timeout: 10000 });
  await page.screenshot({ path: 'e2e-006-table.png' });
});
```

---

## 4. UI 테스트케이스 (매뉴얼)

### 4.1 테스트 케이스 목록

| TC-ID | 테스트 항목 | 사전조건 | 테스트 단계 | 예상 결과 | 우선순위 | 요구사항 |
|-------|-----------|---------|-----------|----------|---------|----------|
| TC-001 | 로딩 스피너 시각적 확인 | - | 로딩 상태 관찰 | 스피너 애니메이션 동작 | High | UC-01 |
| TC-002 | 스켈레톤 애니메이션 확인 | - | 스켈레톤 로딩 관찰 | 펄스 애니메이션 동작 | High | UC-01 |
| TC-003 | 빈 상태 아이콘/메시지 확인 | 데이터 없음 | 빈 목록 조회 | 적절한 아이콘과 메시지 | High | UC-02 |
| TC-004 | 에러 페이지 레이아웃 확인 | 에러 발생 | 에러 페이지 조회 | 중앙 정렬, 명확한 메시지 | High | UC-03 |
| TC-005 | 재시도 버튼 동작 확인 | 에러 상태 | 재시도 버튼 클릭 | 로딩 후 재조회 | High | UC-03, BR-02 |
| TC-006 | 반응형 레이아웃 확인 | - | 화면 크기 변경 | 모든 크기에서 적절한 표시 | Medium | - |
| TC-007 | 키보드 접근성 | - | Tab 키 탐색 | 버튼 포커스 이동 가능 | Medium | - |
| TC-008 | 장시간 로딩 메시지 | 3초+ 로딩 | 로딩 대기 | 추가 안내 메시지 표시 | Medium | BR-01 |
| TC-009 | 재시도 3회 실패 안내 | 연속 실패 | 재시도 3회 | 관리자 문의 안내 표시 | Medium | BR-02 |

### 4.2 매뉴얼 테스트 상세

#### TC-001: 로딩 스피너 시각적 확인

**테스트 목적**: 로딩 스피너가 사용자에게 시스템 동작 상태를 명확히 전달하는지 확인

**테스트 단계**:
1. 로그인 후 대시보드 페이지 접속
2. 개발자 도구에서 네트워크 쓰로틀링 적용 (Slow 3G)
3. 페이지 새로고침
4. 로딩 스피너 표시 확인
5. 스피너 애니메이션이 부드럽게 동작하는지 확인

**검증 기준**:
- [ ] 스피너가 화면 중앙에 표시됨
- [ ] "불러오는 중..." 메시지가 표시됨
- [ ] 애니메이션이 부드럽게 회전함
- [ ] 배경이 약간 어두워짐 (fullScreen 모드)

#### TC-002: 스켈레톤 애니메이션 확인

**테스트 목적**: 스켈레톤 로딩이 실제 컨텐츠 레이아웃과 유사하게 표시되는지 확인

**테스트 단계**:
1. 테이블이 있는 페이지 접속
2. 네트워크 쓰로틀링 적용
3. 페이지 새로고침
4. 스켈레톤 표시 확인
5. 실제 테이블로 전환 확인

**검증 기준**:
- [ ] 스켈레톤이 테이블 행과 유사한 형태로 표시됨
- [ ] 펄스 애니메이션이 적용됨
- [ ] 실제 데이터로 부드럽게 전환됨

#### TC-003: 빈 상태 아이콘/메시지 확인

**테스트 목적**: 데이터가 없을 때 사용자에게 명확한 안내를 제공하는지 확인

**테스트 단계**:
1. 목록 페이지 접속
2. 존재하지 않는 검색어 입력
3. 빈 상태 화면 확인
4. 필터 초기화 버튼 클릭
5. 전체 목록 표시 확인

**검증 기준**:
- [ ] 빈 상태 아이콘이 적절하게 표시됨
- [ ] "검색 결과가 없습니다" 메시지가 표시됨
- [ ] "필터 초기화" 버튼이 클릭 가능함
- [ ] 버튼 클릭 시 전체 목록이 다시 표시됨

#### TC-004: 에러 페이지 레이아웃 확인

**테스트 목적**: 에러 발생 시 사용자에게 적절한 안내와 복구 방법을 제공하는지 확인

**테스트 단계**:
1. 존재하지 않는 URL 접속 (/non-existent)
2. 404 페이지 표시 확인
3. 레이아웃 검사 (중앙 정렬, 여백)
4. 홈으로 버튼 클릭
5. 홈 페이지 이동 확인

**검증 기준**:
- [ ] "404" 상태 코드가 크게 표시됨
- [ ] "페이지를 찾을 수 없습니다" 메시지가 표시됨
- [ ] 추가 설명 문구가 표시됨
- [ ] "홈으로 이동" 버튼이 작동함

#### TC-005: 재시도 버튼 동작 확인

**테스트 목적**: 에러 발생 시 재시도 기능이 정상 동작하는지 확인

**테스트 단계**:
1. 개발자 도구에서 네트워크 오프라인 설정
2. 데이터 조회 시도
3. 네트워크 에러 화면 표시 확인
4. 네트워크 온라인으로 변경
5. 재시도 버튼 클릭
6. 정상 데이터 표시 확인

**검증 기준**:
- [ ] 네트워크 에러 메시지가 표시됨
- [ ] 재시도 버튼이 활성화됨
- [ ] 버튼 클릭 시 로딩 상태 표시
- [ ] 정상 복구 시 데이터 표시

#### TC-006: 반응형 레이아웃 확인

**테스트 목적**: 로딩/에러 상태 컴포넌트가 다양한 화면 크기에서 적절히 표시되는지 확인

**테스트 단계**:
1. 데스크톱 (1280px)에서 에러 페이지 확인
2. 태블릿 (768px)에서 에러 페이지 확인
3. 모바일 (375px)에서 에러 페이지 확인
4. 각 크기에서 버튼 터치/클릭 영역 확인

**검증 기준**:
- [ ] 데스크톱: 여유 있는 간격, 큰 버튼
- [ ] 태블릿: 적절한 간격 유지
- [ ] 모바일: 폰트 크기 축소, 터치 친화적 버튼 (44px 이상)

#### TC-007: 키보드 접근성

**테스트 목적**: 키보드만으로 로딩/에러 상태 컴포넌트를 탐색할 수 있는지 확인

**테스트 단계**:
1. 에러 페이지 접속
2. Tab 키로 버튼 포커스 이동
3. Enter 키로 버튼 활성화
4. 포커스 링 시각적 확인

**검증 기준**:
- [ ] Tab 키로 모든 버튼에 접근 가능
- [ ] 포커스 링이 명확히 표시됨
- [ ] Enter 키로 버튼 활성화 가능
- [ ] 스크린 리더에서 버튼 라벨 읽힘

#### TC-008: 장시간 로딩 메시지

**테스트 목적**: 로딩이 3초 이상 지속될 때 추가 안내 메시지가 표시되는지 확인

**테스트 단계**:
1. 매우 느린 네트워크 쓰로틀링 적용
2. 페이지 접속
3. 0-3초: 기본 로딩 메시지 확인
4. 3초 이후: 추가 안내 메시지 확인

**검증 기준**:
- [ ] 0-3초: "불러오는 중..." 표시
- [ ] 3초+: "잠시만 기다려주세요. 데이터를 준비 중입니다." 표시

#### TC-009: 재시도 3회 실패 안내

**테스트 목적**: 재시도 3회 실패 시 관리자 문의 안내가 표시되는지 확인

**테스트 단계**:
1. 네트워크 오프라인 상태 유지
2. 재시도 버튼 3회 클릭
3. 안내 메시지 변경 확인

**검증 기준**:
- [ ] 재시도 1-2회: "다시 시도" 버튼 표시
- [ ] 재시도 3회 실패: "문제가 지속되면 관리자에게 문의해주세요" 안내

---

## 5. 테스트 데이터 (Fixture)

### 5.1 단위 테스트용 Mock 데이터

| 데이터 ID | 용도 | 값 |
|-----------|------|-----|
| MOCK-LOADING-DEFAULT | 기본 로딩 상태 | `{ loading: true, tip: '불러오는 중...' }` |
| MOCK-LOADING-CUSTOM | 커스텀 로딩 상태 | `{ loading: true, tip: '데이터 처리 중...', size: 'large' }` |
| MOCK-EMPTY-DEFAULT | 기본 빈 상태 | `{ type: 'default', title: '데이터가 없습니다' }` |
| MOCK-EMPTY-SEARCH | 검색 빈 상태 | `{ type: 'search', title: '검색 결과가 없습니다' }` |
| MOCK-EMPTY-FILTER | 필터 빈 상태 | `{ type: 'filter', title: '필터 조건에 맞는 데이터가 없습니다' }` |
| MOCK-ERROR-404 | 404 에러 | `{ statusCode: 404, message: '페이지를 찾을 수 없습니다' }` |
| MOCK-ERROR-500 | 500 에러 | `{ statusCode: 500, message: '서버 오류가 발생했습니다' }` |
| MOCK-ERROR-403 | 403 에러 | `{ statusCode: 403, message: '접근 권한이 없습니다' }` |
| MOCK-ERROR-NETWORK | 네트워크 에러 | `{ type: 'network', message: '네트워크 연결을 확인해주세요' }` |

### 5.2 E2E 테스트용 시드 데이터

| 시드 ID | 용도 | 생성 방법 | 포함 데이터 |
|---------|------|----------|------------|
| SEED-E2E-LOADING | 로딩 테스트 | 자동 시드 | 테스트 사용자 1명, 지연 API |
| SEED-E2E-EMPTY | 빈 상태 테스트 | 자동 시드 | 테스트 사용자 1명, 빈 데이터 |
| SEED-E2E-ERROR | 에러 테스트 | 자동 시드 | 테스트 사용자 1명, 에러 API |

### 5.3 테스트 계정

| 계정 ID | 이메일 | 비밀번호 | 역할 | 용도 |
|---------|--------|----------|------|------|
| TEST-USER | user@test.com | test1234 | USER | 일반 사용자 테스트 |
| TEST-RESTRICTED | restricted@test.com | test1234 | GUEST | 권한 제한 테스트 (403) |

---

## 6. data-testid 목록

### 6.1 컴포넌트별 셀렉터

#### PageLoading 컴포넌트

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `page-loading` | 로딩 컨테이너 | 전체 로딩 컴포넌트 확인 |

#### ComponentSkeleton 컴포넌트

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `component-skeleton` | 스켈레톤 컨테이너 | 스켈레톤 표시 확인 |
| `skeleton-row` | 스켈레톤 행 (테이블) | 테이블 스켈레톤 행 개수 확인 |

#### EmptyState 컴포넌트

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `empty-state` | Empty 컨테이너 | 빈 상태 표시 확인 |
| `empty-state-message` | 메시지 텍스트 | 안내 메시지 확인 |
| `empty-state-action` | 액션 버튼 | 버튼 클릭 테스트 |

#### ErrorBoundary 컴포넌트

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `error-boundary` | 에러 바운더리 fallback | 에러 캐치 확인 |

#### ErrorPage 컴포넌트

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `error-page` | 에러 페이지 컨테이너 | 에러 페이지 표시 확인 |
| `error-page-title` | 에러 코드/제목 | 상태 코드 확인 |
| `error-page-message` | 에러 메시지 | 에러 설명 확인 |
| `error-page-retry-btn` | 재시도 버튼 | 재시도 기능 테스트 |

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
| PageLoading | 90% | 85% | 100% |
| ComponentSkeleton | 85% | 80% | 100% |
| EmptyState | 85% | 80% | 90% |
| ErrorBoundary | 80% | 75% | 85% |
| ErrorPage | 85% | 80% | 90% |

### 7.3 E2E 테스트 커버리지

| 구분 | 목표 |
|------|------|
| 주요 사용자 시나리오 | 100% |
| 유즈케이스 (UC) | 100% 커버 |
| 비즈니스 규칙 (BR) | 100% 커버 |
| 에러 케이스 | 80% 커버 |

---

## 8. 위험 기반 테스트 우선순위

### 8.1 위험 평가 매트릭스

| 영역 | 발생 확률 | 영향도 | 위험 점수 | 테스트 우선순위 |
|------|----------|--------|----------|----------------|
| ErrorBoundary 에러 캐치 | 중 | 높음 | 6 | P1 (필수) |
| ErrorPage 재시도 기능 | 높음 | 중 | 6 | P1 (필수) |
| EmptyState 액션 버튼 | 높음 | 낮음 | 3 | P2 (중요) |
| PageLoading 전체 화면 | 낮음 | 낮음 | 1 | P3 (선택) |
| ComponentSkeleton 변형 | 낮음 | 낮음 | 1 | P3 (선택) |

### 8.2 테스트 실행 순서

1. **P1 (필수)**: ErrorBoundary, ErrorPage 핵심 기능
2. **P2 (중요)**: EmptyState, PageLoading 기본 기능
3. **P3 (선택)**: 스켈레톤 변형, 반응형, 접근성

---

## 9. 경계 조건 및 엣지 케이스

### 9.1 경계 조건 테스트

| 조건 | 테스트 케이스 | 예상 결과 |
|------|-------------|----------|
| tip 최대 길이 (50자) | 50자 문자열 입력 | 정상 표시 |
| tip 초과 길이 (51자+) | 100자 문자열 입력 | 잘림 처리 (ellipsis) |
| description 최대 (100자) | 100자 문자열 입력 | 정상 표시 |
| 로딩 시간 경계 (3초) | 정확히 3초 대기 | 추가 메시지 전환 |
| 재시도 횟수 (3회) | 정확히 3회 실패 | 관리자 문의 안내 |

### 9.2 엣지 케이스 테스트

| 케이스 | 설명 | 테스트 방법 |
|--------|------|------------|
| 빠른 네트워크 | 로딩 상태가 거의 보이지 않음 | 스피너 깜빡임 방지 확인 |
| 동시 에러 | 여러 컴포넌트 에러 발생 | 각각 ErrorBoundary 처리 |
| 빈 children | ErrorBoundary 자식 없음 | 기본 fallback 표시 |
| undefined props | 모든 props가 undefined | 기본값 적용 확인 |

---

## 관련 문서

- 설계: `010-design.md`
- 추적성 매트릭스: `025-traceability-matrix.md`
- PRD: `.orchay/projects/mes-portal/prd.md`
- TRD: `.orchay/projects/mes-portal/trd.md`

---

## 변경 이력

| 버전 | 일자 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0 | 2026-01-20 | AI | 최초 작성 |
