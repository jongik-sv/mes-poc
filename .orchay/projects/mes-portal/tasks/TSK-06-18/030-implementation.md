# 구현 보고서

| 항목 | 내용 |
|------|------|
| Task ID | TSK-06-18 |
| Task 명 | [샘플] 공정 관리 |
| 구현 일시 | 2026-01-23 |
| 상태 | 완료 |

---

## 1. 구현 개요

공정 관리 CRUD 샘플 화면을 구현하였습니다. 기존 템플릿 컴포넌트(ListTemplate, DetailTemplate, FormTemplate)를 조합하여 목록-상세-폼 화면 전환 패턴을 구현하였습니다.

### 1.1 주요 기능

- **목록 조회**: 공정 목록 표시, 검색 조건(코드/공정명/상태), 페이징
- **상세 조회**: 기본 정보 Descriptions, 설비 연결/이력 탭
- **공정 등록**: 폼 입력, 유효성 검사, 중복 코드 검사
- **공정 수정**: 기존 데이터 로드, 수정 후 저장
- **공정 삭제**: 확인 다이얼로그 후 삭제

---

## 2. 파일 구조

```
mes-portal/
├── app/(portal)/sample/process-management/
│   └── page.tsx                    # 라우트 페이지
├── mock-data/
│   └── processes.json              # Mock 데이터
├── screens/sample/ProcessManagement/
│   ├── index.tsx                   # 메인 컴포넌트 (뷰 전환)
│   ├── types.ts                    # 타입 정의
│   ├── useProcessData.ts           # 데이터 관리 훅
│   ├── ProcessList.tsx             # 목록 화면
│   ├── ProcessDetail.tsx           # 상세 화면
│   ├── ProcessForm.tsx             # 등록/수정 폼
│   ├── EquipmentTab.tsx            # 설비 연결 탭
│   └── HistoryTab.tsx              # 이력 탭
├── lib/mdi/screenRegistry.ts       # 화면 레지스트리 등록
└── tests/e2e/
    └── process-management.spec.ts  # E2E 테스트
```

---

## 3. 구현 상세

### 3.1 타입 정의 (`types.ts`)

```typescript
// 공정 상태
export type ProcessStatus = 'active' | 'inactive'

// 공정 데이터
export interface ProcessData {
  id: string
  code: string
  name: string
  status: ProcessStatus
  order: number
  description?: string
  equipmentCount: number
  createdAt: string
  updatedAt: string
  equipment?: EquipmentData[]
  history?: HistoryData[]
  [key: string]: unknown
}

// 폼 값
export interface ProcessFormValues {
  code: string
  name: string
  status: ProcessStatus
  order?: number
  description?: string
  [key: string]: unknown
}

// 검색 파라미터
export interface ProcessSearchParams {
  code?: string
  name?: string
  status?: ProcessStatus | ''
  [key: string]: unknown
}

// 화면 모드
export type ViewMode = 'list' | 'detail' | 'form'
export type FormMode = 'create' | 'edit'
```

### 3.2 데이터 관리 훅 (`useProcessData.ts`)

```typescript
export function useProcessData() {
  const [processes, setProcesses] = useState<ProcessData[]>([])
  const [searchParams, setSearchParams] = useState<ProcessSearchParams>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // CRUD 함수들
  const createProcess = async (values: ProcessFormValues): Promise<ProcessData>
  const updateProcess = async (id: string, values: ProcessFormValues): Promise<ProcessData>
  const deleteProcess = async (id: string): Promise<void>
  const deleteProcesses = async (ids: string[]): Promise<void>

  // 검색/필터
  const filteredProcesses = useMemo(() => {...})

  // 기존 코드 목록 (중복 검사용)
  const existingCodes = useMemo(() => processes.map(p => p.code), [processes])

  return {
    processes: filteredProcesses,
    existingCodes,
    loading,
    error,
    setSearchParams,
    getProcessById,
    createProcess,
    updateProcess,
    deleteProcess,
    deleteProcesses,
    refetch,
  }
}
```

### 3.3 메인 컴포넌트 (`index.tsx`)

```typescript
export function ProcessManagement() {
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [formMode, setFormMode] = useState<FormMode>('create')
  const [selectedProcess, setSelectedProcess] = useState<ProcessData | null>(null)

  // 뷰 전환 핸들러들
  const handleRowClick = (record: ProcessData) => {
    setSelectedProcess(getProcessById(record.id))
    setViewMode('detail')
  }

  const handleAdd = () => {
    setSelectedProcess(null)
    setFormMode('create')
    setViewMode('form')
  }

  // 화면 렌더링
  return (
    <div data-testid="process-management-page">
      {viewMode === 'list' && <ProcessList {...} />}
      {viewMode === 'detail' && <ProcessDetail {...} />}
      {viewMode === 'form' && <ProcessForm {...} />}
    </div>
  )
}
```

### 3.4 목록 화면 (`ProcessList.tsx`)

- **ListTemplate** 사용
- 검색 조건: 공정코드, 공정명, 상태
- 테이블 컬럼: 공정코드, 공정명, 상태, 설비수, 생성일
- 정렬: 클라이언트 사이드
- 행 클릭 시 상세 화면 전환
- 비활성 행 스타일 적용 (BR-05)

### 3.5 상세 화면 (`ProcessDetail.tsx`)

- **DetailTemplate** 사용
- 기본 정보: Descriptions (공정코드, 공정명, 상태, 순서, 연결 설비, 생성일, 수정일, 설명)
- 탭:
  - 설비 연결: EquipmentTab (Table)
  - 이력: HistoryTab (Timeline)
- 헤더 버튼: 수정, 삭제
- 삭제 시 확인 다이얼로그 (BR-01)

### 3.6 폼 화면 (`ProcessForm.tsx`)

- **FormTemplate** 사용
- 입력 필드:
  - 공정코드 (필수, 영문/숫자, 최대 20자, 중복 검사)
  - 공정명 (필수, 최대 50자)
  - 상태 (필수, 활성/비활성)
  - 순서 (선택, 1-999)
  - 설명 (선택, 최대 500자)
- 유효성 검사 (BR-02)
- 중복 코드 검사 (BR-04)
- 변경 감지 및 이탈 경고 (BR-03)

---

## 4. 비즈니스 룰 구현

| BR | 설명 | 구현 위치 |
|----|------|----------|
| BR-01 | 삭제 시 확인 다이얼로그 | DetailTemplate (Modal.confirm) |
| BR-02 | 저장 전 유효성 검사 | ProcessForm (Form.Item rules) |
| BR-03 | 변경 감지 및 이탈 경고 | FormTemplate (enableDirtyCheck) |
| BR-04 | 공정코드 중복 불가 | ProcessForm (validateCode) |
| BR-05 | 비활성 공정 회색 표시 | ProcessList (rowClassName) |
| BR-06 | 삭제 중 중복 클릭 방지 | DetailTemplate (deleting state) |

---

## 5. 템플릿 조합

### 5.1 ListTemplate 활용

```typescript
<ListTemplate<ProcessData>
  searchFields={searchFields}
  onSearch={handleSearch}
  columns={columns}
  dataSource={processes}
  onAdd={onAdd}
  onDelete={handleDelete}
  onRowClick={onRowClick}
/>
```

### 5.2 DetailTemplate 활용

```typescript
<DetailTemplate
  title="공정 상세"
  subtitle={process?.name}
  onEdit={onEdit}
  onDelete={onDelete}
  onBack={onBack}
  descriptions={{ items: descriptionItems }}
  tabs={tabs}
  deleteConfirmMessage="이 공정을 삭제하시겠습니까?"
/>
```

### 5.3 FormTemplate 활용

```typescript
<FormTemplate<ProcessFormValues>
  title="공정"
  mode={mode}
  initialValues={formInitialValues}
  onSubmit={handleSubmit}
  onCancel={onCancel}
  enableDirtyCheck={true}
>
  <Form.Item name="code" rules={[...]} />
  <Form.Item name="name" rules={[...]} />
  ...
</FormTemplate>
```

---

## 6. 화면 레지스트리 등록

```typescript
// lib/mdi/screenRegistry.ts
export const screenRegistry = Object.freeze({
  // ...
  '/sample/process-management': () => import('@/screens/sample/ProcessManagement'),
})
```

---

## 7. 메뉴 등록

```json
// mock-data/menus.json
{
  "id": "6-12",
  "code": "SAMPLE_PROCESS_MANAGEMENT",
  "name": "공정 관리",
  "path": "/sample/process-management",
  "icon": "SettingOutlined",
  "sortOrder": 12,
  "isActive": true
}
```

---

## 8. 테스트

### 8.1 E2E 테스트

- 테스트 파일: `tests/e2e/process-management.spec.ts`
- 테스트 케이스: 10개
- 결과: 모두 통과 (10/10)

### 8.2 테스트 커버리지

| 요구사항 | 테스트 케이스 | 결과 |
|---------|-------------|------|
| FR-001 (목록 조회) | E2E-001 | PASS |
| FR-002 (상세 조회) | E2E-002 | PASS |
| FR-003 (공정 등록) | E2E-003 | PASS |
| FR-004 (공정 수정) | E2E-004 | PASS |
| FR-005 (공정 삭제) | E2E-005 | PASS |
| BR-01 ~ BR-05 | 각 테스트 케이스 | PASS |

---

## 9. 성능 고려사항

- **클라이언트 사이드 필터링**: Mock 데이터 기반, 실제 API 연동 시 서버 사이드 필터링 권장
- **메모이제이션**: `useMemo`, `useCallback` 활용하여 불필요한 재렌더링 방지
- **지연 로딩**: 탭 컨텐츠는 선택 시에만 렌더링

---

## 10. 향후 개선사항

1. **API 연동**: Mock 데이터 대신 실제 API 호출
2. **서버 사이드 페이징**: 대용량 데이터 처리를 위한 서버 사이드 페이징
3. **권한 관리**: 사용자 권한에 따른 버튼 표시/숨김
4. **벌크 편집**: 다중 선택 후 일괄 상태 변경
5. **엑셀 내보내기**: 검색 결과 엑셀 다운로드

---

## 11. 결론

공정 관리 샘플 화면이 성공적으로 구현되었습니다. 기존 템플릿 컴포넌트를 활용하여 일관된 UI/UX를 유지하면서 CRUD 기능을 구현하였으며, 모든 E2E 테스트가 통과하였습니다.
