# 구현 보고서 (TSK-06-05)

**Template Version:** 2.0.0 — **Last Updated:** 2026-01-22

---

## 0. 문서 메타데이터

* **문서명**: `030-implementation.md`
* **Task ID**: TSK-06-05
* **Task 명**: 팝업(모달) 화면 템플릿
* **작성일**: 2026-01-22
* **작성자**: Claude
* **참조 설계서**: `./010-design.md`
* **구현 기간**: 2026-01-22
* **구현 상태**: ✅ 완료

### 문서 위치
```
.orchay/projects/mes-portal/tasks/TSK-06-05/
├── 010-design.md                    ← 설계 문서
├── 025-traceability-matrix.md       ← 추적성 매트릭스
├── 026-test-specification.md        ← 테스트 명세
├── 030-implementation.md            ← 구현 보고서 (본 문서)
└── 070-tdd-test-results.md          ← TDD 테스트 결과서
```

---

## 1. 구현 개요

### 1.1 구현 목적
- 재사용 가능한 선택형 팝업 템플릿 제공
- 검색, 목록, 단일/다중 선택, 값 전달 기능 표준화
- 팝업 화면 개발 생산성 향상

### 1.2 구현 범위
- **포함된 기능**:
  - SelectPopupTemplate 컴포넌트 구현
  - 모달 기반 레이아웃 (Ant Design Modal)
  - 검색 기능 (클라이언트/서버 모드)
  - 단일/다중 선택 기능
  - 선택 완료 시 콜백 지원
  - 페이지네이션 지원
  - 로딩/에러 상태 처리
  - 슬롯 기반 커스터마이징

- **제외된 기능**:
  - 모달 외 팝업 (Drawer 등) - 별도 템플릿으로 구현 예정

### 1.3 구현 유형
- [ ] Backend Only
- [x] Frontend Only
- [ ] Full-stack

### 1.4 기술 스택
- **Frontend**:
  - Framework: Next.js 16.x (App Router), React 19.x
  - UI: Ant Design 6.x
  - Language: TypeScript 5.x
  - Testing: Vitest 2.x + React Testing Library

---

## 2. Frontend 구현 결과

### 2.1 구현된 파일 구조

```
mes-portal/components/templates/SelectPopupTemplate/
├── index.tsx                 # 모듈 export
├── SelectPopupTemplate.tsx   # 메인 컴포넌트 (Client Component)
├── types.ts                  # Props 인터페이스 정의
└── __tests__/
    └── SelectPopupTemplate.spec.tsx  # 단위 테스트
```

### 2.2 컴포넌트 상세

#### 2.2.1 SelectPopupTemplate.tsx

| 항목 | 내용 |
|------|------|
| 컴포넌트 타입 | Client Component ('use client') |
| 주요 Props | open, title, columns, dataSource, rowKey, onSelect, onClose |
| 선택 모드 | 단일(multiple=false), 다중(multiple=true) |
| 검색 모드 | 클라이언트(client), 서버(server) |

**주요 기능 구현:**

| 기능 | 구현 방식 |
|------|----------|
| 모달 | Ant Design Modal |
| 검색 | Input.Search + 클라이언트 필터링 또는 서버 콜백 |
| 목록 | Ant Design Table |
| 단일 선택 | onRow click + rowClassName |
| 다중 선택 | rowSelection (type: 'checkbox') |
| 전체 선택 | 커스텀 체크박스 (data-testid="select-all-checkbox") |
| 로딩 | Spin 컴포넌트 |
| 에러 | Alert + 재시도 버튼 |
| 빈 상태 | Empty 컴포넌트 |

#### 2.2.2 Props 인터페이스 (types.ts)

```typescript
interface SelectPopupTemplateProps<T extends Record<string, unknown>> {
  // 모달 설정
  open: boolean
  onClose: () => void
  title: string
  width?: number | string

  // 데이터 설정
  columns: ColumnType<T>[]
  dataSource: T[]
  loading?: boolean
  rowKey: keyof T | ((record: T) => string)

  // 선택 설정
  multiple?: boolean
  selectedKeys?: Key[]
  onSelect: (selectedRows: T[]) => void
  selectOnRowClick?: boolean

  // 검색 설정
  searchPlaceholder?: string
  onSearch?: (keyword: string) => void
  searchMode?: 'client' | 'server'
  searchDebounceMs?: number
  searchFields?: (keyof T)[]

  // 페이지네이션
  pagination?: TablePaginationConfig | false
  onPaginationChange?: (page: number, pageSize: number) => void
  total?: number

  // 권한 관리
  permissions?: { canSelect?: boolean }

  // 에러 상태
  error?: { message?: string; onRetry?: () => void }

  // 슬롯 커스터마이징
  searchExtra?: ReactNode
  tableHeader?: ReactNode
  footer?: ReactNode | ((selectedRows: T[]) => ReactNode)
}
```

### 2.3 TDD 테스트 결과

#### 2.3.1 테스트 커버리지

```
File                    | % Stmts | % Branch | % Funcs | % Lines |
------------------------|---------|----------|---------|---------|
SelectPopupTemplate.tsx |   88.76 |    87.01 |   92.3  |   89.65 |
------------------------|---------|----------|---------|---------|
전체                    |   88.76 |    87.01 |   92.3  |   89.65 |
```

**품질 기준 달성 여부**:
- ✅ 테스트 커버리지 80% 이상: 88.76%
- ✅ 모든 테스트 통과: 35/35 통과
- ✅ 요구사항 100% 커버

#### 2.3.2 테스트 시나리오 매핑

| 테스트 ID | 설계 시나리오 | 결과 | 요구사항 |
|-----------|-------------|------|---------|
| UT-001 | 모달 열기 | ✅ Pass | FR-001 |
| UT-002 | 모달 닫기 | ✅ Pass | FR-001 |
| UT-003 | 검색 필드 표시 | ✅ Pass | FR-002 |
| UT-004 | 검색 실행 | ✅ Pass | FR-002 |
| UT-005 | 검색 디바운스 | ✅ Pass | FR-002 |
| UT-006 | 단일 선택 | ✅ Pass | FR-003, BR-001 |
| UT-007 | 다중 선택 | ✅ Pass | FR-003, BR-002 |
| UT-008 | 전체 선택 | ✅ Pass | FR-003 |
| UT-009 | 선택 확인 | ✅ Pass | FR-004 |
| UT-010 | 선택 데이터 전달 | ✅ Pass | FR-004 |
| UT-011 | 페이지네이션 표시 | ✅ Pass | FR-005 |
| UT-012 | 로딩 상태 | ✅ Pass | - |
| UT-013 | 선택 없이 확인 비활성화 | ✅ Pass | BR-003 |

#### 2.3.3 테스트 실행 결과

```
✓ components/templates/SelectPopupTemplate/__tests__/SelectPopupTemplate.spec.tsx (35 tests) 33916ms

Test Files  1 passed (1)
Tests       35 passed (35)
Duration    36.27s
```

### 2.4 data-testid 목록

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `select-popup-modal` | Modal | 모달 컨테이너 |
| `select-popup-search` | Input | 검색 입력 필드 |
| `select-popup-search-btn` | Button | 검색 버튼 |
| `select-popup-table` | Table | 테이블 컨테이너 |
| `select-popup-loading` | Spin | 로딩 인디케이터 |
| `select-popup-empty` | Empty | 빈 상태 표시 |
| `select-popup-cancel` | Button | 취소 버튼 |
| `select-popup-confirm` | Button | 확인 버튼 |
| `selected-count` | span | 선택 개수 표시 |
| `select-all-checkbox` | input | 전체 선택 체크박스 |

---

## 3. 요구사항 커버리지

### 3.1 기능 요구사항 커버리지

| 요구사항 ID | 요구사항 설명 | 테스트 ID | 결과 |
|-------------|-------------|-----------|------|
| FR-001 | 팝업 열기/닫기 | UT-001, UT-002 | ✅ |
| FR-002 | 항목 검색 | UT-003, UT-004, UT-005 | ✅ |
| FR-003 | 항목 선택 (단일/다중) | UT-006, UT-007, UT-008 | ✅ |
| FR-004 | 선택 확인 및 값 전달 | UT-009, UT-010 | ✅ |
| FR-005 | 페이지네이션 지원 | UT-011 | ✅ |

### 3.2 비즈니스 규칙 커버리지

| 규칙 ID | 규칙 설명 | 테스트 ID | 결과 |
|---------|----------|-----------|------|
| BR-001 | 단일 선택 시 행 클릭 | UT-006 | ✅ |
| BR-002 | 다중 선택 시 체크박스 | UT-007 | ✅ |
| BR-003 | 선택 없이 확인 불가 | UT-013 | ✅ |

---

## 4. 주요 기술적 결정사항

### 4.1 아키텍처 결정

1. **Client Component 사용**
   - 배경: Ant Design Modal/Table이 상태 관리 필요
   - 선택: 'use client' 지시어 사용
   - 대안: Server Component + 클라이언트 컴포넌트 분리
   - 근거: 단일 컴포넌트로 관리 편의성

2. **내부 선택 상태 관리**
   - 배경: 외부 controlled와 내부 uncontrolled 모드 지원 필요
   - 선택: useEffect로 외부 selectedKeys와 동기화
   - 대안: 완전 controlled 방식
   - 근거: 사용 편의성과 유연성

3. **전체 선택 체크박스 별도 구현**
   - 배경: Ant Design Table 전체 선택이 테스트에서 접근 어려움
   - 선택: 테이블 상단에 커스텀 전체 선택 체크박스
   - 대안: Table rowSelection 기본 전체 선택 사용
   - 근거: 테스트 용이성 및 UI 명확성

### 4.2 구현 패턴

- **디자인 패턴**: Compound Component (슬롯 기반 커스터마이징)
- **상태 관리**: useState + useCallback + useMemo 조합
- **에러 핸들링**: error prop으로 외부 에러 상태 주입

---

## 5. 알려진 이슈 및 제약사항

### 5.1 알려진 이슈

| 이슈 ID | 이슈 내용 | 심각도 | 해결 계획 |
|---------|----------|--------|----------|
| - | 현재 없음 | - | - |

### 5.2 기술적 제약사항

- Ant Design Modal의 destroyOnClose가 deprecated (destroyOnHidden 사용 권장)
- Ant Design Space의 direction이 deprecated (orientation 사용 권장)
- 위 경고는 Ant Design 7.x에서 해결 예정

### 5.3 미커버 라인

| 라인 | 설명 | 사유 |
|------|------|------|
| 171 | selectOnRowClick 즉시 완료 | 테스트 시나리오에서 미사용 |
| 208-209 | onPaginationChange 콜백 | 서버 페이지네이션 시나리오 미테스트 |
| 348 | 모달 마스크 클릭 | Ant Design 내부 처리 |

---

## 6. 구현 완료 체크리스트

### 6.1 Frontend 체크리스트

- [x] SelectPopupTemplate 컴포넌트 구현 완료
- [x] Types 정의 완료
- [x] TDD 테스트 작성 및 통과 (커버리지 88.76%)
- [x] 설계 요구사항 충족 (FR 100%, BR 100%)
- [x] data-testid 적용 완료

### 6.2 통합 체크리스트

- [x] 요구사항 커버리지 100% 달성
- [x] TDD 테스트 결과서 작성 (070-tdd-test-results.md)
- [x] 구현 보고서 작성 (030-implementation.md)
- [ ] WBS 상태 업데이트 (`[im]` 구현)

---

## 7. 참고 자료

### 7.1 관련 문서

- 설계서: `./010-design.md`
- 추적성 매트릭스: `./025-traceability-matrix.md`
- 테스트 명세: `./026-test-specification.md`
- TDD 결과서: `./070-tdd-test-results.md`

### 7.2 소스 코드 위치

```
mes-portal/components/templates/SelectPopupTemplate/
├── index.tsx
├── SelectPopupTemplate.tsx
├── types.ts
└── __tests__/SelectPopupTemplate.spec.tsx
```

### 7.3 사용 예시

```tsx
import { SelectPopupTemplate } from '@/components/templates'

<SelectPopupTemplate
  open={isOpen}
  onClose={() => setIsOpen(false)}
  title="사용자 선택"
  columns={[
    { title: '코드', dataIndex: 'code', key: 'code' },
    { title: '이름', dataIndex: 'name', key: 'name' },
  ]}
  dataSource={users}
  rowKey="id"
  multiple={true}
  searchPlaceholder="검색어 입력"
  searchMode="client"
  searchFields={['name', 'code']}
  onSelect={(selectedUsers) => {
    handleSelect(selectedUsers)
    setIsOpen(false)
  }}
/>
```

---

## 8. 다음 단계

### 8.1 다음 워크플로우

- `/wf:verify TSK-06-05` - 통합테스트 시작

---

## 부록: 변경 이력

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0.0 | 2026-01-22 | Claude | 최초 작성 |
