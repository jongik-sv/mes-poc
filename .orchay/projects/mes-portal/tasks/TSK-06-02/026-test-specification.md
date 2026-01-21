# 테스트 명세서 (026-test-specification.md)

**Template Version:** 1.0.0 - **Last Updated:** 2026-01-21

> **목적**: DetailTemplate 컴포넌트의 단위 테스트, E2E 테스트, 매뉴얼 테스트 시나리오 및 테스트 데이터 정의
>
> **참조**: 이 문서는 `010-design.md`와 함께 사용됩니다.
>
> **활용 단계**: `/wf:build`, `/wf:test` 단계에서 테스트 코드 생성 기준으로 사용

---

## 0. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| Task ID | TSK-06-02 |
| Task명 | 상세 화면 템플릿 |
| 상세설계 참조 | `010-design.md` |
| PRD 참조 | PRD 4.1.1 화면 템플릿 - 상세 화면 |
| 작성일 | 2026-01-21 |
| 작성자 | Claude |

---

## 1. 테스트 전략 개요

### 1.1 테스트 범위

| 테스트 유형 | 범위 | 목표 커버리지 |
|------------|------|--------------|
| 단위 테스트 | DetailTemplate 컴포넌트, Props 처리, 이벤트 핸들러 | 80% 이상 |
| E2E 테스트 | 상세 화면 로드, 탭 전환, 버튼 동작 시나리오 | 100% 시나리오 커버 |
| 매뉴얼 테스트 | UI/UX, 접근성, 반응형 레이아웃 | 전체 화면 |

### 1.2 테스트 환경

| 항목 | 내용 |
|------|------|
| 테스트 프레임워크 (단위) | Vitest |
| 테스트 프레임워크 (E2E) | Playwright |
| UI 컴포넌트 라이브러리 | Ant Design 6.x |
| 브라우저 | Chromium (기본), Firefox, WebKit |
| 베이스 URL | `http://localhost:3000` |

### 1.3 테스트 대상 컴포넌트

```typescript
// components/templates/DetailTemplate.tsx
interface DetailTemplateProps {
  title: string
  onEdit?: () => void
  onDelete?: () => Promise<void>
  onBack?: () => void
  descriptions: DescriptionsProps
  tabs?: {
    key: string
    label: string
    children: ReactNode
  }[]
  loading?: boolean
  error?: {
    status?: 403 | 404 | 500 | 'error'
    title?: string
    message?: string
  }
  extra?: ReactNode
  /** 탭 컨텐츠 지연 로딩 활성화 */
  lazyLoadTabs?: boolean
  /** 비활성 탭 컨텐츠 제거 여부 */
  destroyInactiveTabPane?: boolean
  /**
   * 사용자 권한 정보 (API 응답에서 전달)
   * ⚠️ 클라이언트 버튼 숨김은 UX 편의, 실제 권한 검증은 API 레이어
   */
  permissions?: {
    canEdit?: boolean
    canDelete?: boolean
  }
}
```

---

## 2. 단위 테스트 시나리오

### 2.1 테스트 케이스 목록

| 테스트 ID | 대상 | 시나리오 | 예상 결과 | 요구사항 |
|-----------|------|----------|----------|----------|
| UT-001 | DetailTemplate | 기본 렌더링 (데이터 표시) | 제목, Descriptions 정상 렌더링 | FR-001 |
| UT-002 | DetailTemplate | 로딩 상태 표시 | Skeleton 컴포넌트 표시 | FR-002 |
| UT-003 | DetailTemplate | 에러 상태 표시 | 에러 메시지 및 복구 버튼 표시 | FR-003 |
| UT-004 | DetailTemplate | 탭 전환 동작 | 활성 탭 변경, 컨텐츠 전환 | FR-004 |
| UT-005 | DetailTemplate | 수정 버튼 클릭 이벤트 | onEdit 콜백 호출 | FR-005 |
| UT-006 | DetailTemplate | 삭제 버튼 클릭 이벤트 | 확인 다이얼로그 후 onDelete 호출 | FR-006 |
| UT-007 | DetailTemplate | 목록 버튼 클릭 이벤트 | onBack 콜백 호출 | FR-007 |
| UT-008 | DetailTemplate | 권한에 따른 버튼 표시/숨김 | canEdit/canDelete false시 버튼 숨김 | BR-02 |

### 2.2 테스트 케이스 상세

#### UT-001: 기본 렌더링 (데이터 표시)

| 항목 | 내용 |
|------|------|
| **파일** | `components/templates/__tests__/DetailTemplate.spec.tsx` |
| **테스트 블록** | `describe('DetailTemplate') -> describe('rendering') -> it('should render title and descriptions correctly')` |
| **Mock 의존성** | - |
| **입력 데이터** | `{ title: '사용자 상세', descriptions: { items: [...] } }` |
| **검증 포인트** | 1. 제목 텍스트 렌더링 확인<br>2. Descriptions 컴포넌트 렌더링 확인<br>3. 각 필드 라벨 및 값 표시 확인 |
| **커버리지 대상** | render() 정상 분기, descriptions 매핑 |
| **관련 요구사항** | FR-001: 정보 표시 영역 (읽기 전용) |

```typescript
it('should render title and descriptions correctly', () => {
  const props = {
    title: '사용자 상세',
    descriptions: {
      items: [
        { key: 'name', label: '이름', children: '홍길동' },
        { key: 'email', label: '이메일', children: 'hong@test.com' },
      ],
    },
  }

  render(<DetailTemplate {...props} />)

  expect(screen.getByText('사용자 상세')).toBeInTheDocument()
  expect(screen.getByText('이름')).toBeInTheDocument()
  expect(screen.getByText('홍길동')).toBeInTheDocument()
  expect(screen.getByTestId('detail-template-container')).toBeInTheDocument()
  expect(screen.getByTestId('detail-descriptions')).toBeInTheDocument()
})
```

#### UT-002: 로딩 상태 표시

| 항목 | 내용 |
|------|------|
| **파일** | `components/templates/__tests__/DetailTemplate.spec.tsx` |
| **테스트 블록** | `describe('DetailTemplate') -> describe('loading state') -> it('should display skeleton when loading')` |
| **Mock 의존성** | - |
| **입력 데이터** | `{ title: '사용자 상세', loading: true, descriptions: {...} }` |
| **검증 포인트** | 1. Skeleton 컴포넌트 표시<br>2. 실제 데이터 숨김<br>3. 로딩 표시자(data-testid) 존재 |
| **커버리지 대상** | loading 상태 분기 |
| **관련 요구사항** | FR-002: 로딩 상태 표시 |

```typescript
it('should display skeleton when loading', () => {
  const props = {
    title: '사용자 상세',
    loading: true,
    descriptions: { items: [] },
  }

  render(<DetailTemplate {...props} />)

  expect(screen.getByTestId('detail-loading')).toBeInTheDocument()
  expect(screen.queryByTestId('detail-descriptions')).not.toBeInTheDocument()
})
```

#### UT-003: 에러 상태 표시

| 항목 | 내용 |
|------|------|
| **파일** | `components/templates/__tests__/DetailTemplate.spec.tsx` |
| **테스트 블록** | `describe('DetailTemplate') -> describe('error state') -> it('should display error message and recovery button')` |
| **Mock 의존성** | - |
| **입력 데이터** | `{ title: '사용자 상세', error: new Error('데이터를 찾을 수 없습니다'), descriptions: {...} }` |
| **검증 포인트** | 1. 에러 메시지 표시<br>2. 목록 이동 버튼 표시<br>3. Result 컴포넌트 404 상태 |
| **커버리지 대상** | error 상태 분기 |
| **관련 요구사항** | FR-003: 에러 상태 처리 |

```typescript
it('should display error message and recovery button', () => {
  const onBack = vi.fn()
  const props = {
    title: '사용자 상세',
    error: new Error('항목을 찾을 수 없습니다'),
    descriptions: { items: [] },
    onBack,
  }

  render(<DetailTemplate {...props} />)

  expect(screen.getByTestId('detail-error')).toBeInTheDocument()
  expect(screen.getByText(/찾을 수 없습니다/)).toBeInTheDocument()

  const backButton = screen.getByRole('button', { name: /목록으로/i })
  fireEvent.click(backButton)
  expect(onBack).toHaveBeenCalledTimes(1)
})
```

#### UT-004: 탭 전환 동작

| 항목 | 내용 |
|------|------|
| **파일** | `components/templates/__tests__/DetailTemplate.spec.tsx` |
| **테스트 블록** | `describe('DetailTemplate') -> describe('tabs') -> it('should switch tab content on tab click')` |
| **Mock 의존성** | - |
| **입력 데이터** | tabs 배열 포함 props |
| **검증 포인트** | 1. 탭 헤더 렌더링<br>2. 탭 클릭시 컨텐츠 전환<br>3. 활성 탭 스타일 적용 |
| **커버리지 대상** | tabs 렌더링, 탭 전환 로직 |
| **관련 요구사항** | FR-004: 탭 전환 동작 |

```typescript
it('should switch tab content on tab click', async () => {
  const props = {
    title: '사용자 상세',
    descriptions: { items: [] },
    tabs: [
      { key: 'info', label: '기본 정보', children: <div>기본 정보 내용</div> },
      { key: 'history', label: '활동 이력', children: <div>활동 이력 내용</div> },
      { key: 'permissions', label: '권한', children: <div>권한 내용</div> },
    ],
  }

  render(<DetailTemplate {...props} />)

  // 초기 탭 확인
  expect(screen.getByTestId('detail-tabs')).toBeInTheDocument()
  expect(screen.getByText('기본 정보 내용')).toBeInTheDocument()

  // 두 번째 탭 클릭
  fireEvent.click(screen.getByTestId('detail-tab-history'))

  await waitFor(() => {
    expect(screen.getByText('활동 이력 내용')).toBeVisible()
  })

  // 세 번째 탭 클릭
  fireEvent.click(screen.getByTestId('detail-tab-permissions'))

  await waitFor(() => {
    expect(screen.getByText('권한 내용')).toBeVisible()
  })
})
```

#### UT-005: 수정 버튼 클릭 이벤트

| 항목 | 내용 |
|------|------|
| **파일** | `components/templates/__tests__/DetailTemplate.spec.tsx` |
| **테스트 블록** | `describe('DetailTemplate') -> describe('actions') -> it('should call onEdit when edit button clicked')` |
| **Mock 의존성** | vi.fn() for onEdit |
| **입력 데이터** | `{ onEdit: mockFn, ... }` |
| **검증 포인트** | 1. 수정 버튼 존재<br>2. 클릭시 onEdit 콜백 호출 |
| **커버리지 대상** | onEdit 핸들러 |
| **관련 요구사항** | FR-005: 수정 버튼 클릭 시 폼 모드로 전환 |

```typescript
it('should call onEdit when edit button clicked', () => {
  const onEdit = vi.fn()
  const props = {
    title: '사용자 상세',
    descriptions: { items: [] },
    onEdit,
  }

  render(<DetailTemplate {...props} />)

  const editButton = screen.getByTestId('detail-edit-btn')
  expect(editButton).toBeInTheDocument()

  fireEvent.click(editButton)
  expect(onEdit).toHaveBeenCalledTimes(1)
})
```

#### UT-006: 삭제 버튼 클릭 이벤트

| 항목 | 내용 |
|------|------|
| **파일** | `components/templates/__tests__/DetailTemplate.spec.tsx` |
| **테스트 블록** | `describe('DetailTemplate') -> describe('actions') -> it('should show confirm dialog and call onDelete')` |
| **Mock 의존성** | vi.fn() for onDelete, Modal.confirm mock |
| **입력 데이터** | `{ onDelete: mockFn, ... }` |
| **검증 포인트** | 1. 삭제 버튼 존재<br>2. 클릭시 확인 다이얼로그 표시<br>3. 확인시 onDelete 콜백 호출 |
| **커버리지 대상** | onDelete 핸들러, 확인 다이얼로그 로직 |
| **관련 요구사항** | BR-01: 삭제 시 확인 다이얼로그 필수 |

```typescript
it('should show confirm dialog and call onDelete when confirmed', async () => {
  const onDelete = vi.fn()
  const props = {
    title: '사용자 상세',
    descriptions: { items: [] },
    onDelete,
  }

  render(<DetailTemplate {...props} />)

  const deleteButton = screen.getByTestId('detail-delete-btn')
  fireEvent.click(deleteButton)

  // 확인 다이얼로그 표시 확인
  await waitFor(() => {
    expect(screen.getByText(/정말 삭제하시겠습니까/)).toBeInTheDocument()
  })

  // 확인 버튼 클릭
  const confirmButton = screen.getByRole('button', { name: /확인/i })
  fireEvent.click(confirmButton)

  await waitFor(() => {
    expect(onDelete).toHaveBeenCalledTimes(1)
  })
})

it('should not call onDelete when cancelled', async () => {
  const onDelete = vi.fn()
  const props = {
    title: '사용자 상세',
    descriptions: { items: [] },
    onDelete,
  }

  render(<DetailTemplate {...props} />)

  fireEvent.click(screen.getByTestId('detail-delete-btn'))

  await waitFor(() => {
    expect(screen.getByText(/정말 삭제하시겠습니까/)).toBeInTheDocument()
  })

  // 취소 버튼 클릭
  const cancelButton = screen.getByRole('button', { name: /취소/i })
  fireEvent.click(cancelButton)

  expect(onDelete).not.toHaveBeenCalled()
})
```

#### UT-007: 목록 버튼 클릭 이벤트

| 항목 | 내용 |
|------|------|
| **파일** | `components/templates/__tests__/DetailTemplate.spec.tsx` |
| **테스트 블록** | `describe('DetailTemplate') -> describe('actions') -> it('should call onBack when back button clicked')` |
| **Mock 의존성** | vi.fn() for onBack |
| **입력 데이터** | `{ onBack: mockFn, ... }` |
| **검증 포인트** | 1. 목록 버튼 존재<br>2. 클릭시 onBack 콜백 호출 |
| **커버리지 대상** | onBack 핸들러 |
| **관련 요구사항** | FR-007: 목록 복귀 기능 |

```typescript
it('should call onBack when back button clicked', () => {
  const onBack = vi.fn()
  const props = {
    title: '사용자 상세',
    descriptions: { items: [] },
    onBack,
  }

  render(<DetailTemplate {...props} />)

  const backButton = screen.getByRole('button', { name: /목록으로/i })
  fireEvent.click(backButton)

  expect(onBack).toHaveBeenCalledTimes(1)
})
```

#### UT-008: 권한에 따른 버튼 표시/숨김

| 항목 | 내용 |
|------|------|
| **파일** | `components/templates/__tests__/DetailTemplate.spec.tsx` |
| **테스트 블록** | `describe('DetailTemplate') -> describe('permissions') -> it('should hide buttons based on permissions')` |
| **Mock 의존성** | - |
| **입력 데이터** | `{ permissions: { canEdit: false, canDelete: false }, ... }` |
| **검증 포인트** | 1. canEdit=false: 수정 버튼 숨김<br>2. canDelete=false: 삭제 버튼 숨김<br>3. 기본값(undefined): 버튼 표시 |
| **커버리지 대상** | permissions 체크 로직 |
| **관련 요구사항** | BR-02: 권한 없으면 수정/삭제 버튼 숨김 |

```typescript
describe('permissions', () => {
  it('should hide edit button when canEdit is false', () => {
    const props = {
      title: '사용자 상세',
      descriptions: { items: [] },
      onEdit: vi.fn(),
      permissions: { canEdit: false },
    }

    render(<DetailTemplate {...props} />)

    expect(screen.queryByTestId('detail-edit-btn')).not.toBeInTheDocument()
  })

  it('should hide delete button when canDelete is false', () => {
    const props = {
      title: '사용자 상세',
      descriptions: { items: [] },
      onDelete: vi.fn(),
      permissions: { canDelete: false },
    }

    render(<DetailTemplate {...props} />)

    expect(screen.queryByTestId('detail-delete-btn')).not.toBeInTheDocument()
  })

  it('should show buttons by default when permissions not specified', () => {
    const props = {
      title: '사용자 상세',
      descriptions: { items: [] },
      onEdit: vi.fn(),
      onDelete: vi.fn(),
    }

    render(<DetailTemplate {...props} />)

    expect(screen.getByTestId('detail-edit-btn')).toBeInTheDocument()
    expect(screen.getByTestId('detail-delete-btn')).toBeInTheDocument()
  })
})
```

---

## 3. E2E 테스트 시나리오

### 3.1 테스트 케이스 목록

| 테스트 ID | 시나리오 | 사전조건 | 실행 단계 | 예상 결과 | 요구사항 |
|-----------|----------|----------|----------|----------|----------|
| E2E-001 | 상세 페이지 로드 및 정보 표시 | 로그인 상태, 유효한 ID | 1. 상세 페이지 접속 | 상세 정보 표시됨 | FR-001 |
| E2E-002 | 탭 전환 및 데이터 유지 | 상세 페이지 로드 완료 | 1. 탭 전환 2. 원래 탭 복귀 | 데이터 유지됨 | FR-004 |
| E2E-003 | 수정 버튼 클릭 후 폼 모드 전환 | 상세 페이지 로드 완료 | 1. 수정 버튼 클릭 | 수정 폼 표시 | FR-005 |
| E2E-004 | 삭제 확인 다이얼로그 | 상세 페이지 로드 완료 | 1. 삭제 클릭 2. 확인 | 삭제 후 목록 이동 | BR-01 |

### 3.2 테스트 케이스 상세

#### E2E-001: 상세 페이지 로드 및 정보 표시

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/detail-template.spec.ts` |
| **테스트명** | `test('사용자가 상세 정보를 조회할 수 있다')` |
| **사전조건** | 로그인 (fixture 사용), 테스트 데이터 존재 |
| **data-testid 셀렉터** | |
| - 페이지 컨테이너 | `[data-testid="detail-template-container"]` |
| - 정보 영역 | `[data-testid="detail-descriptions"]` |
| - 로딩 표시 | `[data-testid="detail-loading"]` |
| **API 확인** | `GET /api/users/{id}` -> 200 |
| **검증 포인트** | `expect(page.locator('[data-testid="detail-descriptions"]')).toBeVisible()` |
| **스크린샷** | `e2e-001-detail-loaded.png` |
| **관련 요구사항** | FR-001 |

```typescript
test('사용자가 상세 정보를 조회할 수 있다', async ({ page }) => {
  // Given: 로그인 상태로 상세 페이지 접속
  await page.goto('/users/user-1')

  // When: 페이지 로딩 완료 대기
  await page.waitForSelector('[data-testid="detail-template-container"]')

  // Then: 상세 정보가 표시됨
  await expect(page.locator('[data-testid="detail-descriptions"]')).toBeVisible()
  await expect(page.getByText('홍길동')).toBeVisible()
  await expect(page.getByText('hong@test.com')).toBeVisible()

  // 스크린샷 저장
  await page.screenshot({ path: 'e2e-001-detail-loaded.png' })
})
```

#### E2E-002: 탭 전환 및 데이터 유지

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/detail-template.spec.ts` |
| **테스트명** | `test('탭 전환 시 데이터가 유지된다')` |
| **사전조건** | 상세 페이지 로드 완료 |
| **data-testid 셀렉터** | |
| - 탭 컨테이너 | `[data-testid="detail-tabs"]` |
| - 기본 정보 탭 | `[data-testid="detail-tab-info"]` |
| - 활동 이력 탭 | `[data-testid="detail-tab-history"]` |
| **검증 포인트** | 탭 전환 후 데이터 유지, 원래 탭 복귀시 상태 보존 |
| **스크린샷** | `e2e-002-tab-switch.png` |
| **관련 요구사항** | FR-004 |

```typescript
test('탭 전환 시 데이터가 유지된다', async ({ page }) => {
  // Given: 상세 페이지 로드 완료
  await page.goto('/users/user-1')
  await page.waitForSelector('[data-testid="detail-tabs"]')

  // 기본 정보 탭 내용 확인
  const initialContent = await page.locator('[data-testid="detail-tab-info"]').textContent()

  // When: 활동 이력 탭 클릭
  await page.click('[data-testid="detail-tab-history"]')

  // Then: 활동 이력 탭 내용 표시
  await expect(page.getByText('활동 이력')).toBeVisible()

  // When: 기본 정보 탭으로 복귀
  await page.click('[data-testid="detail-tab-info"]')

  // Then: 기존 데이터가 유지됨
  const restoredContent = await page.locator('[data-testid="detail-tab-info"]').textContent()
  expect(restoredContent).toBe(initialContent)

  await page.screenshot({ path: 'e2e-002-tab-switch.png' })
})
```

#### E2E-003: 수정 버튼 클릭 후 폼 모드 전환

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/detail-template.spec.ts` |
| **테스트명** | `test('수정 버튼 클릭 시 수정 폼으로 전환된다')` |
| **사전조건** | 상세 페이지 로드 완료, 수정 권한 있음 |
| **data-testid 셀렉터** | |
| - 수정 버튼 | `[data-testid="detail-edit-btn"]` |
| **API 확인** | - |
| **URL 확인** | `/users/user-1/edit` 또는 쿼리 파라미터 `?mode=edit` |
| **스크린샷** | `e2e-003-edit-mode.png` |
| **관련 요구사항** | FR-005 |

```typescript
test('수정 버튼 클릭 시 수정 폼으로 전환된다', async ({ page }) => {
  // Given: 상세 페이지 로드 완료
  await page.goto('/users/user-1')
  await page.waitForSelector('[data-testid="detail-template-container"]')

  // When: 수정 버튼 클릭
  await page.click('[data-testid="detail-edit-btn"]')

  // Then: 수정 폼 페이지로 이동 또는 폼 모드 전환
  await expect(page).toHaveURL(/\/users\/user-1\/edit|mode=edit/)

  // 또는 폼 컴포넌트가 표시되는 경우
  // await expect(page.locator('[data-testid="form-template-container"]')).toBeVisible()

  await page.screenshot({ path: 'e2e-003-edit-mode.png' })
})
```

#### E2E-004: 삭제 확인 다이얼로그

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/detail-template.spec.ts` |
| **테스트명** | `test('삭제 확인 다이얼로그가 표시되고 삭제 후 목록으로 이동한다')` |
| **사전조건** | 상세 페이지 로드 완료, 삭제 권한 있음 |
| **data-testid 셀렉터** | |
| - 삭제 버튼 | `[data-testid="detail-delete-btn"]` |
| **API 확인** | `DELETE /api/users/{id}` -> 200 |
| **URL 확인** | 삭제 후 `/users` (목록 페이지) |
| **스크린샷** | `e2e-004-delete-confirm.png`, `e2e-004-after-delete.png` |
| **관련 요구사항** | BR-01 |

```typescript
test('삭제 확인 다이얼로그가 표시되고 삭제 후 목록으로 이동한다', async ({ page }) => {
  // Given: 상세 페이지 로드 완료
  await page.goto('/users/user-test-delete')
  await page.waitForSelector('[data-testid="detail-template-container"]')

  // When: 삭제 버튼 클릭
  await page.click('[data-testid="detail-delete-btn"]')

  // Then: 확인 다이얼로그 표시
  await expect(page.getByText('정말 삭제하시겠습니까?')).toBeVisible()
  await page.screenshot({ path: 'e2e-004-delete-confirm.png' })

  // API 응답 대기 설정
  const deleteResponse = page.waitForResponse(
    response => response.url().includes('/api/users/') && response.request().method() === 'DELETE'
  )

  // When: 확인 버튼 클릭
  await page.click('button:has-text("확인")')

  // Then: API 호출 확인 및 목록 페이지로 이동
  await deleteResponse
  await expect(page).toHaveURL('/users')

  // 성공 토스트 메시지 확인
  await expect(page.getByText('삭제되었습니다')).toBeVisible()

  await page.screenshot({ path: 'e2e-004-after-delete.png' })
})

test('삭제 취소 시 페이지가 유지된다', async ({ page }) => {
  // Given: 상세 페이지에서 삭제 다이얼로그 표시
  await page.goto('/users/user-1')
  await page.waitForSelector('[data-testid="detail-template-container"]')
  await page.click('[data-testid="detail-delete-btn"]')

  // When: 취소 버튼 클릭
  await page.click('button:has-text("취소")')

  // Then: 현재 페이지 유지
  await expect(page).toHaveURL('/users/user-1')
  await expect(page.locator('[data-testid="detail-template-container"]')).toBeVisible()
})
```

---

## 4. UI 테스트케이스 (매뉴얼)

### 4.1 테스트 케이스 목록

| TC-ID | 테스트 항목 | 사전조건 | 테스트 단계 | 예상 결과 | 우선순위 | 요구사항 |
|-------|-----------|---------|-----------|----------|---------|----------|
| TC-001 | 상세 정보 표시 확인 | 로그인 | 1. 목록에서 항목 클릭 2. 상세 화면 확인 | 모든 필드 정상 표시 | High | FR-001 |
| TC-002 | 탭 전환 UX 확인 | 상세 화면 | 1. 각 탭 클릭 2. 전환 애니메이션 확인 | 부드러운 전환 | Medium | FR-004 |
| TC-003 | 반응형 레이아웃 확인 | 상세 화면 | 1. 브라우저 크기 조절 | 레이아웃 적응 | Medium | - |
| TC-004 | 접근성 (키보드 네비게이션) | 상세 화면 | 1. Tab 키로 포커스 이동 2. Enter로 버튼 실행 | 모든 기능 접근 가능 | Medium | A11y |
| TC-005 | 로딩 상태 확인 | 느린 네트워크 | 1. 상세 페이지 접속 | Skeleton 표시 | Low | FR-002 |
| TC-006 | 없는 항목 접근 | 잘못된 ID | 1. 존재하지 않는 ID로 접근 | 404 에러 화면 | Medium | FR-003 |

### 4.2 매뉴얼 테스트 상세

#### TC-001: 상세 정보 표시 확인

**테스트 목적**: 사용자가 상세 화면에서 모든 정보를 정확히 확인할 수 있는지 검증

**테스트 단계**:
1. 로그인 완료
2. 목록 화면에서 특정 항목 클릭 (또는 행 더블클릭)
3. 상세 화면이 표시되는지 확인
4. 헤더 영역의 제목 확인
5. 기본 정보 영역(Descriptions)의 각 필드 라벨과 값 확인
6. 수정/삭제 버튼 표시 확인

**예상 결과**:
- 페이지 제목이 정확히 표시됨
- Descriptions 컴포넌트에 모든 필드가 읽기 전용으로 표시됨
- 필드 라벨과 값이 정렬되어 표시됨
- 빈 값은 '-' 또는 'N/A'로 표시됨

**검증 기준**:
- [ ] 제목이 화면 상단에 표시됨
- [ ] 모든 필드 라벨이 표시됨
- [ ] 모든 필드 값이 정확히 표시됨
- [ ] 날짜/시간 형식이 올바름
- [ ] 상태값이 적절한 뱃지로 표시됨

#### TC-002: 탭 전환 UX 확인

**테스트 목적**: 탭 전환 시 사용자 경험이 자연스러운지 검증

**테스트 단계**:
1. 상세 화면 로드 완료
2. 첫 번째 탭 내용 확인
3. 두 번째 탭 클릭
4. 전환 애니메이션 확인
5. 두 번째 탭 내용 확인
6. 다시 첫 번째 탭 클릭
7. 데이터 유지 확인

**예상 결과**:
- 탭 전환이 0.3초 이내에 완료됨
- 활성 탭에 하이라이트 표시
- 비활성 탭의 데이터가 유지됨
- 깜빡임 없이 부드러운 전환

**검증 기준**:
- [ ] 탭 전환 애니메이션이 자연스러움
- [ ] 활성 탭 표시가 명확함
- [ ] 탭 내용이 즉시 표시됨
- [ ] 스크롤 위치가 유지됨 (해당 시)

#### TC-003: 반응형 레이아웃 확인

**테스트 목적**: 다양한 화면 크기에서 레이아웃이 적절히 적응하는지 검증

**테스트 단계**:
1. 데스크톱 크기 (1920x1080)에서 화면 확인
2. 노트북 크기 (1366x768)에서 화면 확인
3. 태블릿 크기 (768x1024)에서 화면 확인
4. 모바일 크기 (375x667)에서 화면 확인

**예상 결과**:
- 데스크톱: Descriptions 2-3컬럼 레이아웃
- 태블릿: Descriptions 1-2컬럼 레이아웃
- 모바일: Descriptions 1컬럼 레이아웃, 버튼 세로 배치

**검증 기준**:
- [ ] 모든 정보가 잘림 없이 표시됨
- [ ] 버튼이 터치 가능한 크기 유지 (모바일)
- [ ] 탭이 스크롤 가능하게 변경됨 (좁은 화면)
- [ ] 텍스트 가독성 유지

#### TC-004: 접근성 (키보드 네비게이션)

**테스트 목적**: 키보드만으로 모든 기능에 접근 가능한지 검증

**테스트 단계**:
1. 상세 화면에서 마우스 사용 금지
2. Tab 키로 포커스 이동 순서 확인
3. Enter 키로 버튼 실행 확인
4. 화살표 키로 탭 전환 확인
5. Escape 키로 다이얼로그 닫기 확인

**예상 결과**:
- 논리적인 포커스 순서: 제목 -> 수정 버튼 -> 삭제 버튼 -> 탭 -> 목록 버튼
- Enter로 버튼 실행 가능
- 포커스 표시가 명확함 (outline)

**검증 기준**:
- [ ] 모든 인터랙티브 요소에 포커스 가능
- [ ] 포커스 순서가 논리적
- [ ] 포커스 표시가 명확함
- [ ] 키보드로 모든 기능 실행 가능

---

## 5. 테스트 데이터 (Fixture)

### 5.1 단위 테스트용 Mock 데이터

| 데이터 ID | 용도 | 값 |
|-----------|------|-----|
| MOCK-USER-01 | 일반 사용자 상세 | `{ id: 'user-1', name: '홍길동', email: 'hong@test.com', status: 'ACTIVE', createdAt: '2026-01-01T00:00:00Z' }` |
| MOCK-USER-ADMIN | 관리자 사용자 상세 | `{ id: 'user-admin', name: '관리자', email: 'admin@test.com', role: 'ADMIN', status: 'ACTIVE' }` |
| MOCK-USER-INACTIVE | 비활성 사용자 | `{ id: 'user-2', name: '김철수', email: 'kim@test.com', status: 'INACTIVE', deletedAt: '2026-01-15T00:00:00Z' }` |
| MOCK-DESCRIPTIONS | Descriptions 항목 | `{ items: [{ key: 'name', label: '이름', children: '홍길동' }, { key: 'email', label: '이메일', children: 'hong@test.com' }, { key: 'status', label: '상태', children: <Badge status="success" text="활성" /> }] }` |
| MOCK-TABS | 탭 데이터 | `[{ key: 'info', label: '기본 정보', children: <InfoPanel /> }, { key: 'history', label: '활동 이력', children: <HistoryTable /> }]` |

### 5.2 E2E 테스트용 시드 데이터

| 시드 ID | 용도 | 생성 방법 | 포함 데이터 |
|---------|------|----------|------------|
| SEED-E2E-DETAIL | 상세 화면 E2E 테스트 | 자동 시드 | 사용자 3명 (user-1, user-2, user-test-delete) |
| SEED-E2E-TABS | 탭 컨텐츠 테스트 | 자동 시드 | 사용자 1명 + 활동 이력 5건 |
| SEED-E2E-EMPTY-TABS | 빈 탭 테스트 | 자동 시드 | 사용자 1명 (관련 데이터 없음) |

### 5.3 테스트 계정

| 계정 ID | 이메일 | 비밀번호 | 역할 | 용도 |
|---------|--------|----------|------|------|
| TEST-USER | user@test.com | test1234 | USER | 일반 사용자 상세 조회 테스트 |
| TEST-ADMIN | admin@test.com | test1234 | ADMIN | 관리자 권한 (수정/삭제) 테스트 |
| TEST-VIEWER | viewer@test.com | test1234 | VIEWER | 읽기 전용 권한 테스트 (버튼 숨김) |

### 5.4 Mock 데이터 코드

```typescript
// fixtures/detail-template.fixtures.ts

export const mockUserDetail = {
  id: 'user-1',
  name: '홍길동',
  email: 'hong@test.com',
  phone: '010-1234-5678',
  department: '개발팀',
  position: '선임 개발자',
  status: 'ACTIVE',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-15T10:30:00Z',
}

export const mockDescriptionsProps = {
  bordered: true,
  column: { xs: 1, sm: 2, md: 3 },
  items: [
    { key: 'name', label: '이름', children: mockUserDetail.name },
    { key: 'email', label: '이메일', children: mockUserDetail.email },
    { key: 'phone', label: '전화번호', children: mockUserDetail.phone },
    { key: 'department', label: '부서', children: mockUserDetail.department },
    { key: 'position', label: '직급', children: mockUserDetail.position },
    { key: 'status', label: '상태', children: '활성' },
    { key: 'createdAt', label: '등록일', children: '2026-01-01' },
    { key: 'updatedAt', label: '수정일', children: '2026-01-15' },
  ],
}

export const mockTabs = [
  {
    key: 'info',
    label: '기본 정보',
    children: '<InfoPanel />',
  },
  {
    key: 'history',
    label: '활동 이력',
    children: '<HistoryTable />',
  },
  {
    key: 'permissions',
    label: '권한',
    children: '<PermissionsPanel />',
  },
]

export const mockPermissions = {
  admin: { canEdit: true, canDelete: true },
  user: { canEdit: true, canDelete: false },
  viewer: { canEdit: false, canDelete: false },
}
```

---

## 6. data-testid 목록

> 프론트엔드 컴포넌트에 적용할 `data-testid` 속성 정의

### 6.1 DetailTemplate 컴포넌트 셀렉터

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `detail-template-container` | 페이지 컨테이너 | 페이지 로드 확인 |
| `detail-descriptions` | Descriptions 컴포넌트 | 기본 정보 영역 확인 |
| `detail-tabs` | Tabs 컴포넌트 | 탭 영역 존재 확인 |
| `detail-tab-{key}` | 개별 탭 아이템 | 특정 탭 클릭/확인 |
| `detail-edit-btn` | 수정 버튼 | 수정 버튼 클릭 |
| `detail-delete-btn` | 삭제 버튼 | 삭제 버튼 클릭 |
| `detail-back-btn` | 목록 버튼 | 목록 이동 버튼 클릭 |
| `detail-loading` | 로딩 스켈레톤 | 로딩 상태 확인 |
| `detail-error` | 에러 표시 영역 | 에러 상태 확인 |
| `detail-header` | 헤더 영역 | 제목 및 액션 버튼 영역 |
| `detail-content` | 컨텐츠 영역 | 메인 컨텐츠 영역 |
| `detail-footer` | 푸터 영역 | 하단 버튼 영역 |

### 6.2 관련 다이얼로그 셀렉터

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `delete-confirm-dialog` | 삭제 확인 다이얼로그 | 다이얼로그 표시 확인 |
| `delete-confirm-btn` | 확인 버튼 | 삭제 확인 |
| `delete-cancel-btn` | 취소 버튼 | 삭제 취소 |

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

### 7.3 측정 방법

- **단위 테스트**: Vitest coverage report (`vitest run --coverage`)
- **E2E 테스트**: Playwright test report (`npx playwright test --reporter=html`)
- **커버리지 리포트 위치**: `coverage/` 디렉토리

---

## 8. 요구사항 추적 매트릭스

| 요구사항 ID | 요구사항 설명 | 단위 테스트 | E2E 테스트 | 매뉴얼 테스트 |
|-------------|--------------|------------|-----------|--------------|
| FR-001 | 정보 표시 영역 (읽기 전용) | UT-001 | E2E-001 | TC-001 |
| FR-002 | 로딩 상태 표시 | UT-002 | - | TC-005 |
| FR-003 | 에러 상태 표시 | UT-003 | - | TC-006 |
| FR-004 | 탭 전환 동작 | UT-004 | E2E-002 | TC-002 |
| FR-005 | 수정 버튼 클릭 시 폼 모드 전환 | UT-005 | E2E-003 | - |
| FR-006 | 삭제 버튼 클릭 이벤트 | UT-006 | E2E-004 | - |
| FR-007 | 목록 복귀 기능 | UT-007 | - | - |
| BR-01 | 삭제 시 확인 다이얼로그 필수 | UT-006 | E2E-004 | - |
| BR-02 | 권한에 따른 버튼 표시/숨김 | UT-008 | - | - |

---

## 관련 문서

- 설계 문서: `010-design.md`
- PRD: `.orchay/projects/mes-portal/prd.md` (4.1.1 화면 템플릿 - 상세 화면)
- TRD: `.orchay/projects/mes-portal/trd.md`

---

## 변경 이력

| 버전 | 일자 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0 | 2026-01-21 | Claude | 최초 작성 |
| 1.1 | 2026-01-21 | Claude | 리뷰 반영 - Props 인터페이스 업데이트, 요구사항 ID FR-XXX 형식 통일 |
