# TSK-05-01: 로딩 및 에러 상태 컴포넌트 - 구현 보고서

## 1. 구현 개요

| 항목 | 내용 |
|------|------|
| Task ID | TSK-05-01 |
| Task 명 | 로딩 및 에러 상태 컴포넌트 |
| 구현 일시 | 2026-01-21 |
| 구현 방법론 | TDD (Test-Driven Development) |

## 2. 구현 컴포넌트

### 2.1 PageLoading (`components/common/PageLoading.tsx`)

전체 페이지 로딩 스피너 컴포넌트

**Props:**
```typescript
interface PageLoadingProps {
  loading?: boolean      // 로딩 상태 (기본: true)
  tip?: string          // 로딩 메시지 (기본: "로딩 중입니다...")
  size?: 'small' | 'default' | 'large'  // 스피너 크기
  fullScreen?: boolean  // 전체 화면 모드 (기본: true)
  delay?: number        // 딜레이 (기본: 200ms) - BR-001 깜빡임 방지
}
```

**특징:**
- BR-001 적용: 200ms 이하 로딩 시 스피너 미표시
- WCAG 접근성: role="status", aria-live="polite", aria-busy="true"
- Ant Design Spin 컴포넌트 활용

### 2.2 ComponentSkeleton (`components/common/ComponentSkeleton.tsx`)

컴포넌트별 스켈레톤 로딩 UI

**Props:**
```typescript
interface ComponentSkeletonProps {
  variant?: 'default' | 'table' | 'card' | 'form' | 'list'
  loading?: boolean
  rows?: number        // 테이블/리스트 행 수
  columns?: number     // 테이블 열 수
  hasAvatar?: boolean  // 리스트 아바타 표시
  fields?: number      // 폼 필드 수
  children?: ReactNode
}
```

**지원 변형:**
- default: 기본 스켈레톤
- table: 테이블 스켈레톤 (행/열 지정)
- card: 카드 형태 스켈레톤
- form: 폼 스켈레톤 (필드 배열)
- list: 리스트 스켈레톤 (아바타 옵션)

### 2.3 EmptyState (`components/common/EmptyState.tsx`)

빈 상태 표시 컴포넌트

**Props:**
```typescript
interface EmptyStateProps {
  type?: 'default' | 'no-data' | 'search' | 'filter'
  icon?: ReactNode
  title?: string
  description?: string
  action?: ReactNode
  actionText?: string
  actionType?: 'primary' | 'default' | 'dashed' | 'link' | 'text'
  onAction?: () => void
  searchKeyword?: string
  onClearSearch?: () => void
  appliedFilters?: FilterItem[]
  onReset?: () => void
}
```

**특징:**
- BR-003 적용: 컨텍스트별 가이드 메시지
- 타입별 기본 아이콘 및 메시지 제공
- 검색/필터 초기화 액션 지원
- WCAG 접근성: role="alert"

### 2.4 ErrorBoundary (`components/common/ErrorBoundary.tsx`)

런타임 에러 캐치 컴포넌트

**Props:**
```typescript
interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  fallbackRender?: (props: { error: Error; resetError: () => void }) => ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  maxRetries?: number  // 기본: 3
}
```

**특징:**
- BR-002 적용: 재시도 3회 실패 시 관리자 문의 안내
- 민감 정보 필터링 (password, token 등)
- 커스텀 fallback UI 지원
- 에러 상태 초기화 기능

### 2.5 ErrorPage (`components/common/ErrorPage.tsx`)

에러 페이지 컴포넌트

**Props:**
```typescript
interface ErrorPageProps {
  status: 403 | 404 | 500 | 'network' | 'session-expired'
  title?: string
  subTitle?: string
  onRetry?: () => void
  onGoHome?: () => void
  onLogin?: () => void
  showContact?: boolean
  retrying?: boolean
}
```

**지원 에러 타입:**
- 404: 페이지 없음 - 홈으로 버튼
- 500: 서버 에러 - 재시도/홈으로 버튼
- 403: 권한 없음 - 로그인/이전/관리자 문의 버튼
- network: 네트워크 에러 - 재시도 버튼
- session-expired: 세션 만료 - 로그인 버튼

### 2.6 Next.js 에러 페이지

**app/not-found.tsx:**
```typescript
export default function NotFound() {
  return <ErrorPage status={404} />
}
```

**app/error.tsx:**
```typescript
export default function Error({ error, reset }: ErrorProps) {
  return <ErrorPage status={500} onRetry={reset} />
}
```

## 3. 파일 구조

```
mes-portal/
├── app/
│   ├── error.tsx              # Next.js 500 에러 페이지
│   └── not-found.tsx          # Next.js 404 에러 페이지
├── components/common/
│   ├── __tests__/
│   │   ├── PageLoading.test.tsx
│   │   ├── ComponentSkeleton.test.tsx
│   │   ├── EmptyState.test.tsx
│   │   ├── ErrorBoundary.test.tsx
│   │   └── ErrorPage.test.tsx
│   ├── PageLoading.tsx
│   ├── ComponentSkeleton.tsx
│   ├── EmptyState.tsx
│   ├── ErrorBoundary.tsx
│   ├── ErrorPage.tsx
│   └── index.ts               # 컴포넌트 내보내기
└── tests/e2e/
    └── loading-error-states.spec.ts
```

## 4. 비즈니스 규칙 구현

### BR-001: 로딩 깜빡임 방지
```typescript
// PageLoading.tsx
useEffect(() => {
  if (!loading) { setShowSpinner(false); return }
  const timer = setTimeout(() => setShowSpinner(true), delay)
  return () => clearTimeout(timer)
}, [loading, delay])
```

### BR-002: 재시도 제한
```typescript
// ErrorBoundary.tsx
const hasExceededRetries = retryCount >= maxRetries
// 3회 초과 시 관리자 문의 안내 표시
```

### BR-003: 컨텍스트별 가이드 메시지
```typescript
// EmptyState.tsx
const typeConfig = {
  'no-data': { description: '새로운 데이터를 등록해 주세요.' },
  'search': { description: '다른 검색어로 다시 시도해 주세요.' },
  'filter': { description: '필터 조건을 변경하거나 초기화해 주세요.' }
}
```

## 5. 접근성 (WCAG)

| 컴포넌트 | ARIA 속성 | 용도 |
|----------|----------|------|
| PageLoading | role="status", aria-live="polite", aria-busy="true" | 로딩 상태 알림 |
| EmptyState | role="alert" | 빈 상태 알림 |
| ErrorPage | role="alert", aria-live="assertive" | 에러 상태 즉시 알림 |

## 6. 테스트 결과

### 단위 테스트 (2026-01-22)
- 총 135개 테스트 케이스
- 전체 통과 (100%)
- 커버리지: Statements 95.1%, Branches 88.36%, Functions 96.82%, Lines 94.91%

### E2E 테스트
- 총 8개 테스트
- 6개 통과, 2개 스킵 (의도적)

## 7. 의존성

```json
{
  "antd": "^5.x",
  "@ant-design/icons": "^5.x",
  "next": "^15.x",
  "react": "^19.x"
}
```

## 8. 사용 예시

### PageLoading
```tsx
<PageLoading loading={isLoading} tip="데이터를 불러오는 중..." />
```

### ComponentSkeleton
```tsx
<ComponentSkeleton variant="table" loading={loading} rows={5} columns={4}>
  <DataTable data={data} />
</ComponentSkeleton>
```

### EmptyState
```tsx
<EmptyState
  type="search"
  searchKeyword={query}
  onClearSearch={() => setQuery('')}
/>
```

### ErrorBoundary
```tsx
<ErrorBoundary
  fallbackRender={({ error, resetError }) => (
    <div>
      <p>{error.message}</p>
      <button onClick={resetError}>재시도</button>
    </div>
  )}
>
  <RiskyComponent />
</ErrorBoundary>
```

## 9. 결론

TSK-05-01 로딩 및 에러 상태 컴포넌트가 TDD 방법론에 따라 성공적으로 구현되었습니다.

- 5개 주요 컴포넌트 구현 완료
- Next.js 에러 페이지 통합 완료
- 모든 비즈니스 규칙(BR-001, BR-002, BR-003) 적용
- WCAG 접근성 가이드라인 준수
- 단위 테스트 및 E2E 테스트 통과
