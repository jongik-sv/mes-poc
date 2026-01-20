# TSK-01-04 - 푸터 컴포넌트 테스트 명세서

## 문서 정보

| 항목 | 내용 |
|------|------|
| Task ID | TSK-01-04 |
| 문서 버전 | 1.0 |
| 작성일 | 2026-01-20 |

---

## 1. 테스트 범위

### 1.1 테스트 대상

| 대상 | 파일 경로 | 설명 |
|------|----------|------|
| Footer 컴포넌트 | components/layout/Footer.tsx | 푸터 UI 컴포넌트 |

### 1.2 테스트 유형

| 유형 | 범위 | 도구 |
|------|------|------|
| 단위 테스트 | 컴포넌트 렌더링 및 동작 | Vitest + Testing Library |
| 통합 테스트 | PortalLayout과의 통합 | Vitest + Testing Library |
| E2E 테스트 | 화면 표시 확인 | Playwright |

---

## 2. 단위 테스트 (Unit Tests)

### UT-01: Footer 컴포넌트 렌더링

| 항목 | 내용 |
|------|------|
| 테스트 ID | UT-01 |
| 테스트명 | Footer 컴포넌트가 정상적으로 렌더링된다 |
| 우선순위 | P1 |
| 사전 조건 | 없음 |
| 테스트 단계 | 1. Footer 컴포넌트 렌더링<br/>2. 푸터 요소 존재 확인 |
| 예상 결과 | footer 역할의 요소가 DOM에 존재 |
| 추적성 | PRD-4.1.1-FT-01 |

**테스트 코드 스켈레톤:**
```typescript
import { render, screen } from '@testing-library/react'
import { Footer } from '@/components/layout/Footer'

describe('Footer', () => {
  it('should render footer element', () => {
    render(<Footer />)
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })
})
```

### UT-02: 버전 정보 표시

| 항목 | 내용 |
|------|------|
| 테스트 ID | UT-02 |
| 테스트명 | 버전 정보가 표시된다 |
| 우선순위 | P1 |
| 사전 조건 | NEXT_PUBLIC_APP_VERSION 환경변수 설정 또는 package.json version 존재 |
| 테스트 단계 | 1. Footer 컴포넌트 렌더링<br/>2. 버전 텍스트 확인 |
| 예상 결과 | "v{버전}" 형식의 텍스트 표시 |
| 추적성 | PRD-4.1.1-FT-03, integrationCheck |

**테스트 코드 스켈레톤:**
```typescript
it('should display version information', () => {
  render(<Footer />)
  expect(screen.getByText(/v\d+\.\d+\.\d+/)).toBeInTheDocument()
})
```

### UT-03: 저작권 텍스트 표시

| 항목 | 내용 |
|------|------|
| 테스트 ID | UT-03 |
| 테스트명 | 저작권 텍스트가 표시된다 |
| 우선순위 | P1 |
| 사전 조건 | 없음 |
| 테스트 단계 | 1. Footer 컴포넌트 렌더링<br/>2. 저작권 텍스트 확인 |
| 예상 결과 | "Copyright ©" 포함 텍스트 표시 |
| 추적성 | PRD-4.1.1-FT-02 |

**테스트 코드 스켈레톤:**
```typescript
it('should display copyright text', () => {
  render(<Footer />)
  expect(screen.getByText(/Copyright ©/)).toBeInTheDocument()
})
```

### UT-04: 푸터 높이 검증

| 항목 | 내용 |
|------|------|
| 테스트 ID | UT-04 |
| 테스트명 | 푸터 높이가 30px이다 |
| 우선순위 | P2 |
| 사전 조건 | CSS 변수 정의됨 |
| 테스트 단계 | 1. Footer 컴포넌트 렌더링<br/>2. 스타일 검증 |
| 예상 결과 | height가 30px 또는 var(--footer-height) |
| 추적성 | PRD-4.1.1-FT-01 |

**테스트 코드 스켈레톤:**
```typescript
it('should have correct height', () => {
  render(<Footer />)
  const footer = screen.getByRole('contentinfo')
  expect(footer).toHaveStyle({ height: 'var(--footer-height)' })
})
```

---

## 3. 통합 테스트 (Integration Tests)

### IT-01: PortalLayout 통합

| 항목 | 내용 |
|------|------|
| 테스트 ID | IT-01 |
| 테스트명 | Footer가 PortalLayout 내에서 정상 표시된다 |
| 우선순위 | P1 |
| 사전 조건 | PortalLayout 구현 완료 (TSK-01-01) |
| 테스트 단계 | 1. PortalLayout 렌더링<br/>2. Footer 존재 확인<br/>3. 위치 확인 (하단) |
| 예상 결과 | 레이아웃 하단에 Footer 표시 |
| 추적성 | TSK-01-01 의존성 |

**테스트 코드 스켈레톤:**
```typescript
import { render, screen } from '@testing-library/react'
import { PortalLayout } from '@/components/layout/PortalLayout'

describe('PortalLayout + Footer Integration', () => {
  it('should render Footer within PortalLayout', () => {
    render(
      <PortalLayout>
        <div>Content</div>
      </PortalLayout>
    )
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    expect(screen.getByText(/Copyright/)).toBeInTheDocument()
  })
})
```

---

## 4. E2E 테스트 (End-to-End Tests)

### E2E-01: 포털 화면 푸터 확인

| 항목 | 내용 |
|------|------|
| 테스트 ID | E2E-01 |
| 테스트명 | 포털 화면에서 푸터가 표시된다 |
| 우선순위 | P1 |
| 사전 조건 | 로그인 완료 상태 |
| 테스트 단계 | 1. 포털 메인 페이지 접속<br/>2. 화면 하단 스크롤<br/>3. 푸터 영역 확인<br/>4. 저작권/버전 텍스트 확인 |
| 예상 결과 | 화면 하단에 푸터 표시, 저작권 및 버전 정보 확인 가능 |
| 추적성 | PRD-4.1.1-FT-01~03 |

**테스트 코드 스켈레톤:**
```typescript
import { test, expect } from '@playwright/test'

test.describe('Footer E2E', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 처리
    await page.goto('/login')
    await page.fill('[name="email"]', 'admin@example.com')
    await page.fill('[name="password"]', 'password')
    await page.click('button[type="submit"]')
    await page.waitForURL('/portal')
  })

  test('should display footer with copyright and version', async ({ page }) => {
    // 푸터 확인
    const footer = page.locator('footer')
    await expect(footer).toBeVisible()

    // 저작권 확인
    await expect(footer).toContainText('Copyright')

    // 버전 확인
    await expect(footer).toContainText(/v\d+\.\d+\.\d+/)
  })

  test('footer should have correct height', async ({ page }) => {
    const footer = page.locator('footer')
    const box = await footer.boundingBox()
    expect(box?.height).toBe(30)
  })
})
```

---

## 5. 수동 테스트 체크리스트

### MT-01: 시각적 검증

| 체크 항목 | 확인 결과 | 비고 |
|----------|----------|------|
| [ ] 푸터가 화면 하단에 고정 표시됨 | | |
| [ ] 저작권 텍스트가 좌측에 표시됨 | | |
| [ ] 버전 정보가 우측에 표시됨 | | |
| [ ] 푸터 높이가 적절함 (30px) | | |
| [ ] 라이트 모드에서 가독성 양호 | | |
| [ ] 다크 모드에서 가독성 양호 | | |

### MT-02: 반응형 테스트

| 화면 크기 | 체크 항목 | 확인 결과 |
|----------|----------|----------|
| 데스크톱 (1920x1080) | [ ] 푸터 정상 표시 | |
| 태블릿 (768x1024) | [ ] 푸터 정상 표시 | |
| 모바일 (375x667) | [ ] 푸터 정상 표시 | |

---

## 6. 테스트 실행 계획

### 6.1 실행 순서

1. 단위 테스트 (UT-01 ~ UT-04)
2. 통합 테스트 (IT-01)
3. E2E 테스트 (E2E-01)
4. 수동 테스트 (MT-01 ~ MT-02)

### 6.2 실행 명령어

```bash
# 단위 테스트
pnpm test components/layout/Footer

# E2E 테스트
pnpm test:e2e tests/e2e/footer.spec.ts

# 전체 테스트
pnpm test
```

---

## 7. 테스트 커버리지 목표

| 테스트 유형 | 목표 커버리지 |
|-----------|-------------|
| 단위 테스트 | 100% (컴포넌트) |
| 통합 테스트 | 100% (레이아웃 통합) |
| E2E 테스트 | 핵심 시나리오 1개 |

---

## 변경 이력

| 버전 | 일자 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0 | 2026-01-20 | Claude | 최초 작성 |
