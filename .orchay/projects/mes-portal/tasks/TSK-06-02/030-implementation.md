# 구현 보고서 (030-implementation.md)

**Template Version:** 1.0.0 - **Last Updated:** 2026-01-22

> **목적**: DetailTemplate 컴포넌트 TDD 기반 구현 결과 문서화
>
> **참조**: `010-design.md`, `026-test-specification.md`

---

## 0. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| Task ID | TSK-06-02 |
| Task명 | 상세 화면 템플릿 |
| 구현 완료일 | 2026-01-22 |
| 구현자 | Claude |
| 상태 | 완료 |

---

## 1. 구현 개요

### 1.1 구현 범위

상세 화면의 표준 템플릿 컴포넌트로, 다음 기능을 제공합니다:

- **헤더 영역**: 제목, 부제목, 수정/삭제 버튼
- **기본 정보 영역**: Ant Design Descriptions 기반 필드 표시
- **탭 영역**: 관련 정보를 탭으로 그룹화
- **하단 영역**: 목록으로 돌아가기 버튼
- **상태 처리**: 로딩, 에러 상태 표시
- **권한 처리**: 버튼 표시/숨김 제어

### 1.2 구현 파일 목록

| 파일 경로 | 설명 | LOC |
|-----------|------|-----|
| `components/templates/DetailTemplate/types.ts` | 타입 정의 | 80 |
| `components/templates/DetailTemplate/DetailTemplate.tsx` | 메인 컴포넌트 | 120 |
| `components/templates/DetailTemplate/DetailHeader.tsx` | 헤더 컴포넌트 | 75 |
| `components/templates/DetailTemplate/DetailDescriptions.tsx` | 기본 정보 컴포넌트 | 50 |
| `components/templates/DetailTemplate/DetailTabs.tsx` | 탭 컴포넌트 | 80 |
| `components/templates/DetailTemplate/DetailFooter.tsx` | 푸터 컴포넌트 | 40 |
| `components/templates/DetailTemplate/DetailError.tsx` | 에러 컴포넌트 | 75 |
| `components/templates/DetailTemplate/DetailSkeleton.tsx` | 스켈레톤 컴포넌트 | 60 |
| `components/templates/DetailTemplate/index.ts` | 모듈 export | 25 |
| `components/templates/index.ts` | 템플릿 통합 export | 15 |
| `components/templates/DetailTemplate/__tests__/DetailTemplate.spec.tsx` | 단위 테스트 | 590 |

**총 구현 라인**: 약 1,200 LOC (테스트 포함)

---

## 2. 아키텍처 설계

### 2.1 컴포넌트 구조

```
DetailTemplate/
├── index.ts              # 모듈 export
├── types.ts              # 타입 정의
├── DetailTemplate.tsx    # 메인 컴포넌트 (오케스트레이터)
├── DetailHeader.tsx      # 헤더 영역
├── DetailDescriptions.tsx # 기본 정보 영역
├── DetailTabs.tsx        # 탭 영역
├── DetailFooter.tsx      # 푸터 영역
├── DetailError.tsx       # 에러 상태
├── DetailSkeleton.tsx    # 로딩 스켈레톤
└── __tests__/
    └── DetailTemplate.spec.tsx
```

### 2.2 컴포넌트 관계도

```
┌─────────────────────────────────────────┐
│           DetailTemplate                │
│  (메인 오케스트레이터 컴포넌트)          │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │       DetailHeader              │   │
│  │  [제목] [부제목]    [수정][삭제] │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │     DetailDescriptions          │   │
│  │  ┌─────────┬─────────┐          │   │
│  │  │ 라벨1   │ 값1     │          │   │
│  │  ├─────────┼─────────┤          │   │
│  │  │ 라벨2   │ 값2     │          │   │
│  │  └─────────┴─────────┘          │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │        DetailTabs               │   │
│  │  [기본정보] [활동이력] [권한]    │   │
│  │  ┌─────────────────────────────┐│   │
│  │  │      탭 컨텐츠 영역         ││   │
│  │  └─────────────────────────────┘│   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │       DetailFooter              │   │
│  │              [목록으로 돌아가기] │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘

상태 분기:
├── loading=true  → DetailSkeleton
├── error         → DetailError
└── 정상          → 위 레이아웃
```

---

## 3. 주요 구현 내용

### 3.1 타입 정의 (types.ts)

```typescript
// 메인 Props 인터페이스
export interface DetailTemplateProps<T = Record<string, unknown>> {
  // 헤더
  title: string
  subtitle?: string
  titleIcon?: ReactNode
  onEdit?: () => void
  onDelete?: () => Promise<void>
  onBack?: () => void
  extra?: ReactNode

  // 기본 정보
  descriptions: DescriptionsProps & { items: DescriptionsProps['items'] }
  descriptionsTitle?: string

  // 탭
  tabs?: DetailTabItem[]
  defaultActiveTab?: string
  onTabChange?: (activeKey: string) => void
  destroyInactiveTabPane?: boolean
  lazyLoadTabs?: boolean

  // 상태
  loading?: boolean
  error?: DetailErrorState

  // 레이아웃
  className?: string
  gutter?: number

  // 삭제 다이얼로그
  deleteConfirmMessage?: string
  deleteConfirmTitle?: string

  // 권한
  permissions?: DetailTemplatePermissions
}

// 에러 상태 타입
export interface DetailErrorState {
  status?: 403 | 404 | 500 | 'error'
  title?: string
  message?: string
}

// 권한 타입
export interface DetailTemplatePermissions {
  canEdit?: boolean
  canDelete?: boolean
}
```

### 3.2 메인 컴포넌트 (DetailTemplate.tsx)

핵심 기능:
- 상태 기반 분기 렌더링 (loading → error → 정상)
- 권한 기반 버튼 표시 제어
- 삭제 확인 다이얼로그 (Modal.confirm)

```typescript
export function DetailTemplate<T = Record<string, unknown>>({
  // props
}: DetailTemplateProps<T>) {
  const { message } = App.useApp()
  const [deleting, setDeleting] = useState(false)

  // 권한 체크
  const showEdit = Boolean(onEdit) && permissions?.canEdit !== false
  const showDelete = Boolean(onDelete) && permissions?.canDelete !== false

  // 삭제 핸들러 (BR-01: 확인 다이얼로그 필수)
  const handleDelete = useCallback(() => {
    if (!onDelete || deleting) return
    Modal.confirm({
      title: deleteConfirmTitle,
      icon: <ExclamationCircleOutlined />,
      content: deleteConfirmMessage,
      okText: '삭제',
      okType: 'danger',
      cancelText: '취소',
      onOk: async () => {
        // 삭제 로직
      },
    })
  }, [/* deps */])

  // 상태 기반 렌더링
  if (error) return <DetailError ... />
  if (loading) return <DetailSkeleton ... />
  return (/* 정상 레이아웃 */)
}
```

### 3.3 에러 처리 (DetailError.tsx)

에러 상태별 기본 메시지 설정:

```typescript
const ERROR_CONFIG = {
  '403': {
    title: '접근 권한이 없습니다',
    subTitle: '이 항목을 조회할 권한이 없습니다.',
  },
  '404': {
    title: '항목을 찾을 수 없습니다',
    subTitle: '요청하신 항목이 존재하지 않거나 삭제되었습니다.',
  },
  '500': {
    title: '데이터를 불러올 수 없습니다',
    subTitle: '서버에 문제가 발생했습니다.',
  },
  error: {
    title: '연결 상태를 확인해주세요',
    subTitle: '네트워크 연결에 문제가 있습니다.',
  },
}
```

### 3.4 탭 컴포넌트 (DetailTabs.tsx)

Ant Design Tabs 래핑:

```typescript
export function DetailTabs({
  tabs,
  activeKey,
  defaultActiveKey,
  onChange,
  destroyInactiveTabPane = false,
  lazyLoad = false,
  loading,
}: DetailTabsProps) {
  // 탭 아이템 변환 (뱃지 지원)
  const items = mapTabsToItems(tabs)

  return (
    <Card>
      <Tabs
        items={items}
        activeKey={activeKey}
        defaultActiveKey={defaultActiveKey || tabs[0]?.key}
        onChange={onChange}
        destroyOnHidden={destroyInactiveTabPane}
      />
    </Card>
  )
}
```

---

## 4. 요구사항 충족 현황

### 4.1 기능 요구사항

| ID | 요구사항 | 구현 위치 | 상태 |
|----|---------|----------|------|
| FR-001 | 정보 표시 영역 (읽기 전용) | DetailDescriptions.tsx | ✅ |
| FR-002 | 로딩 상태 표시 | DetailSkeleton.tsx | ✅ |
| FR-003 | 에러 상태 처리 | DetailError.tsx | ✅ |
| FR-004 | 탭 전환 동작 | DetailTabs.tsx | ✅ |
| FR-005 | 수정 버튼 클릭 시 폼 모드 전환 | DetailHeader.tsx (onEdit) | ✅ |
| FR-006 | 삭제 버튼 클릭 이벤트 | DetailTemplate.tsx (handleDelete) | ✅ |
| FR-007 | 목록 복귀 기능 | DetailFooter.tsx (onBack) | ✅ |

### 4.2 비즈니스 규칙

| ID | 규칙 | 구현 방식 | 상태 |
|----|------|----------|------|
| BR-01 | 삭제 시 확인 다이얼로그 필수 | Modal.confirm 사용 | ✅ |
| BR-02 | 권한에 따른 버튼 표시/숨김 | permissions prop 체크 | ✅ |
| BR-06 | 삭제 중 중복 클릭 방지 | deleting state 체크 | ✅ |

---

## 5. 테스트 결과

### 5.1 단위 테스트 결과

| 항목 | 결과 |
|------|------|
| 총 테스트 케이스 | 43 |
| 통과 | 43 |
| 실패 | 0 |
| 커버리지 | 80%+ (목표 달성) |

### 5.2 테스트 케이스 매핑

| 테스트 ID | 요구사항 | 결과 |
|-----------|----------|------|
| UT-001 | FR-001 | ✅ |
| UT-002 | FR-002 | ✅ |
| UT-003 | FR-003 | ✅ |
| UT-004 | FR-004 | ✅ |
| UT-005 | FR-005 | ✅ |
| UT-006 | FR-006, BR-01 | ✅ |
| UT-007 | FR-007 | ✅ |
| UT-008 | BR-02 | ✅ |

---

## 6. 사용 예시

### 6.1 기본 사용법

```tsx
import { DetailTemplate } from '@/components/templates'

function UserDetailPage({ userId }: { userId: string }) {
  const { data: user, isLoading, error } = useUser(userId)
  const router = useRouter()

  return (
    <DetailTemplate
      title="사용자 상세"
      subtitle={user?.name}
      loading={isLoading}
      error={error && { status: 404, message: '사용자를 찾을 수 없습니다' }}
      descriptions={{
        items: [
          { key: 'name', label: '이름', children: user?.name },
          { key: 'email', label: '이메일', children: user?.email },
          { key: 'status', label: '상태', children: user?.status },
        ],
      }}
      tabs={[
        { key: 'history', label: '활동 이력', children: <HistoryTable /> },
        { key: 'permissions', label: '권한', children: <PermissionsPanel /> },
      ]}
      onEdit={() => router.push(`/users/${userId}/edit`)}
      onDelete={async () => {
        await deleteUser(userId)
        router.push('/users')
      }}
      onBack={() => router.push('/users')}
      permissions={{ canEdit: true, canDelete: user?.status !== 'DELETED' }}
    />
  )
}
```

### 6.2 권한 기반 버튼 제어

```tsx
<DetailTemplate
  // ...
  permissions={{
    canEdit: hasPermission('USER_EDIT'),
    canDelete: hasPermission('USER_DELETE'),
  }}
/>
```

### 6.3 커스텀 삭제 메시지

```tsx
<DetailTemplate
  // ...
  deleteConfirmTitle="사용자 삭제"
  deleteConfirmMessage={`${user.name} 사용자를 삭제하시겠습니까?`}
/>
```

---

## 7. 주요 이슈 및 해결

### 7.1 Ant Design Tabs 경고

**문제**: `destroyInactiveTabPane` deprecated 경고

**해결**: `destroyOnHidden`으로 변경

```typescript
// Before
<Tabs destroyInactiveTabPane={true} />

// After
<Tabs destroyOnHidden={true} />
```

### 7.2 Modal.confirm 테스트

**문제**: Testing Library에서 Modal.confirm 버튼 선택 어려움

**해결**: DOM 직접 쿼리 사용

```typescript
// 모달 확인 버튼
const modal = document.querySelector('.ant-modal-confirm')
const confirmButton = modal?.querySelector('.ant-btn-dangerous')

// 모달 취소 버튼
const cancelButton = modal?.querySelector('.ant-btn:not(.ant-btn-dangerous)')
```

### 7.3 테스트 간 모달 정리

**문제**: 이전 테스트의 모달이 다음 테스트에 영향

**해결**: afterEach에서 cleanup 및 대기 시간 추가

```typescript
afterEach(async () => {
  const modals = document.querySelectorAll('.ant-modal-root')
  if (modals.length > 0) {
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  cleanup()
})
```

---

## 8. 향후 개선 사항

1. **E2E 테스트 추가**: Playwright 기반 통합 테스트 구현
2. **스토리북 문서화**: 각 상태별 스토리 추가
3. **접근성 개선**: aria-label, 키보드 네비게이션 강화
4. **반응형 레이아웃**: 모바일 대응 스타일 최적화

---

## 관련 문서

- 설계 문서: `010-design.md`
- 테스트 명세서: `026-test-specification.md`
- 테스트 결과서: `070-tdd-test-results.md`
- 추적성 매트릭스: `025-traceability-matrix.md`

---

## 변경 이력

| 버전 | 일자 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0 | 2026-01-22 | Claude | 최초 작성 - TDD 기반 구현 완료 |
