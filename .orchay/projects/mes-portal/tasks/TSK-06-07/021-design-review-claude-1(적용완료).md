# TSK-06-07 설계 리뷰 보고서

**리뷰 일자**: 2026-01-21
**리뷰어**: claude-1
**Task**: TSK-06-07 - [샘플] 사용자 목록 화면
**리뷰 대상**: 010-design.md, 025-traceability-matrix.md, 026-test-specification.md

---

## 검증 요약

### 검증 대상 문서

| 문서 | 상태 | 비고 |
|------|------|------|
| 010-design.md | ✅ | 통합 설계 문서 (857줄) |
| 025-traceability-matrix.md | ✅ | 추적성 매트릭스 (235줄) |
| 026-test-specification.md | ✅ | 테스트 명세서 (537줄) |

### 검증 결과 요약

| 검증 영역 | 평가 | 비고 |
|----------|------|------|
| 문서 완전성 | PASS | 필수 섹션 모두 포함 |
| 요구사항 추적성 | PASS | FR 10, BR 6 매핑 완료 |
| 아키텍처 | WARN | 1건 High, 3건 Medium |
| 품질/테스트 | WARN | 1건 High, 3건 Medium |
| 보안 | PASS | TSK-06-01 보안 설계 활용 |
| 테스트 가능성 | WARN | data-testid 정합성 개선 필요 |

---

## 이슈 목록

### 이슈 분포

| Priority | Critical | High | Medium | Low | Info | 합계 |
|----------|----------|------|--------|-----|------|------|
| 건수 | 0 | 2 | 5 | 7 | 3 | 17 |

---

## High Priority 이슈

### ARCH-01: useUserList 훅의 책임 범위 과다

**Severity**: High
**Priority**: P2
**관점**: 아키텍처 (SOLID - 단일 책임 원칙)

**현재 상태**:
설계 문서(섹션 11.1)에서 `useUserList.ts` 훅이 "상태 관리 훅"으로만 정의되어 있으며, 구체적인 책임 범위가 명시되지 않음. 아래 책임이 혼재될 가능성:
- 데이터 로딩 상태 관리
- 검색/필터링 로직
- 선택 상태 관리
- 삭제 로직
- 모달 상태 관리

**권장 사항**:
1. 훅의 책임을 명확히 분리하여 문서화:
   - `useUserList`: 데이터 로딩 및 CRUD 작업만 담당
   - 검색/필터 상태는 `ListTemplate`의 내부 훅으로 위임
   - 모달 상태는 컴포넌트 로컬 상태(`useState`)로 관리

2. 설계 문서에 다음 인터페이스 명시:
```typescript
// useUserList.ts - 데이터 로딩 책임만
interface UseUserListReturn {
  users: User[];
  loading: boolean;
  error: Error | null;
  deleteUsers: (ids: string[]) => Promise<void>;
  refetch: () => void;
}
```

**영향 범위**: `screens/sample/UserList/useUserList.ts`, `screens/sample/UserList/index.tsx`

---

### QA-01: data-testid 정의 불일치

**Severity**: High
**Priority**: P2
**관점**: 품질/테스트 가능성

**현재 상태**:
026-test-specification.md 섹션 6.1에 정의된 data-testid와 TSK-06-01 ListTemplate의 data-testid 명명 규칙이 불일치:

| 구분 | TSK-06-01 (템플릿) | TSK-06-07 (샘플) |
|------|-------------------|------------------|
| 컨테이너 | `list-template-container` | `user-list-page` |
| 테이블 | `data-grid` | `user-list-table` |
| 행 | (미정의) | `user-row` |

**권장 사항**:
1. 명명 규칙 통일:
   - 페이지 컨테이너: `{entity}-list-page` (예: `user-list-page`)
   - 템플릿 내부 요소: ListTemplate의 기본 data-testid 상속
   - 페이지 고유 요소: `{entity}-{element}` 패턴

2. 테스트 명세서 셀렉터 수정:
```typescript
// 페이지 컨테이너 (샘플 고유)
[data-testid="user-list-page"]

// 템플릿 요소 (ListTemplate 상속)
[data-testid="list-template-container"]
[data-testid="search-condition-card"]
[data-testid="data-grid"]
```

**영향 범위**: 026-test-specification.md 섹션 6.1, E2E 테스트 구현

---

## Medium Priority 이슈

### ARCH-02: API 전환 시 변경 범위 불명확

**Severity**: Medium
**Priority**: P2
**관점**: 아키텍처 (확장성)

**현재 상태**:
TRD 섹션 2.3의 데이터 로딩 전략(환경변수 분기 패턴)을 따르지 않고, JSON 직접 import 방식으로 설계됨.

**권장 사항**:
1. TRD의 API 추상화 패턴 반영:
```typescript
// lib/services/userService.ts
export const userService = {
  getUsers: async (params?: SearchParams): Promise<UserListResponse> => {
    return apiClient<UserListResponse>('/users', { params });
  },
  deleteUsers: async (ids: string[]): Promise<void> => {
    return apiClient('/users/batch-delete', { method: 'POST', body: { ids } });
  }
};
```

2. 환경변수 분기 패턴 적용 (또는 샘플 화면에서는 mock 직접 사용 허용 명시)

**영향 범위**: 설계 문서 섹션 11, 향후 API 전환 시

---

### QA-02: E2E 테스트에서 Ant Design 내부 셀렉터 사용

**Severity**: Medium
**Priority**: P2
**관점**: 품질/테스트 안정성

**현재 상태**:
E2E 테스트에서 Ant Design 내부 CSS 클래스를 직접 사용:
- `.ant-pagination-item-2`
- `.ant-checkbox-input`
- `.ant-modal-confirm-btns .ant-btn-primary`

**권장 사항**:
1. 커스텀 data-testid 추가:
```typescript
// 페이지네이션
[data-testid="pagination-page-2"]

// 행 체크박스
[data-testid="row-checkbox-user-001"]

// 확인 버튼
[data-testid="confirm-ok-btn"]
```

2. 또는 Playwright의 role 기반 셀렉터 활용:
```typescript
page.getByRole('button', { name: '확인' })
```

**영향 범위**: 026-test-specification.md 섹션 3.2, 구현 시 data-testid 추가

---

### QA-03: 경계 조건 및 에지 케이스 테스트 미흡

**Severity**: Medium
**Priority**: P2
**관점**: 품질/테스트 커버리지

**현재 상태**:
Happy Path 위주의 테스트로, 다음 에지 케이스 누락:
1. 페이지네이션 경계 (마지막 페이지 다음 버튼 비활성화)
2. 전체 선택 후 삭제 (헤더 체크박스)
3. 복합 검색 조건 (AND 조건 검증)
4. 빈 검색어 처리
5. 정렬 토글 완전 순환 (오름차순 → 내림차순 → 해제)

**권장 사항**:
테스트 케이스 추가:

| 테스트 ID | 시나리오 | 예상 결과 | 요구사항 |
|-----------|---------|----------|----------|
| E2E-010 | 복합 조건 검색 | AND 조건 적용 확인 | BR-006 |
| E2E-011 | 전체 선택 후 삭제 | 현재 페이지 전체 삭제 | FR-008, FR-009 |
| E2E-012 | Empty State 초기화 | 전체 목록 복원 | FR-005 |

**영향 범위**: 026-test-specification.md 섹션 3.1

---

### ARCH-03: ListTemplate 의존 계약 명시 부족

**Severity**: Medium
**Priority**: P3
**관점**: 아키텍처 (의존성 관리)

**현재 상태**:
TSK-06-07이 TSK-06-01(ListTemplate)에 의존하나, 구체적인 Props 사용 계약이 명시되지 않음.

**권장 사항**:
설계 문서에 ListTemplate Props 사용 명세 추가:
```typescript
<ListTemplate<User>
  // 필수 Props
  columns={columns}
  dataSource={users}
  rowKey="id"

  // 검색 영역
  searchFields={searchFields}
  onSearch={handleSearch}

  // 행 선택
  rowSelection={{ type: 'checkbox', ... }}

  // 액션
  onDelete={handleDelete}
  onRowClick={handleRowClick}

  // 페이지네이션
  pagination={{ pageSize: 10 }}
  total={filteredUsers.length}
/>
```

**영향 범위**: 010-design.md 섹션 11

---

### TRACE-01: 삭제 기능 PRD 출처 명확화 필요

**Severity**: Medium
**Priority**: P3
**관점**: 추적성

**현재 상태**:
UC-09 "선택 사용자 삭제" 기능이 범위에 포함되어 있으나, PRD 4.1.1에서는 삭제 기능을 명시적으로 요구하지 않음.

**권장 사항**:
삭제 기능이 "ListTemplate의 표준 기능(onDelete) 검증"을 위한 것임을 명시:
- 025-traceability-matrix.md FR-009 항목에 "ListTemplate 기능 검증용" 주석 추가
- 또는 PRD에 "샘플 화면에서 템플릿의 모든 기능을 검증한다" 문구 추가 요청

**영향 범위**: 025-traceability-matrix.md

---

## Low Priority 이슈

### DOC-01: 체크리스트 상태 미업데이트

**Severity**: Low
**Priority**: P4
**관점**: 문서 완전성

**현재 상태**:
010-design.md 섹션 12.2에서 "요구사항 추적 매트릭스 작성"과 "테스트 명세서 작성" 항목이 `[ ]` (미완료)로 표시되어 있으나 실제로 완료됨.

**권장 사항**: 체크리스트 항목을 `[x]`로 업데이트

**영향 범위**: 010-design.md 섹션 12.2

---

### ARCH-04: UserDetailModal 향후 확장성 고려

**Severity**: Low
**Priority**: P4
**관점**: 아키텍처 (확장성)

**현재 상태**:
현재 모달은 단순 조회 기능만 제공하나, 향후 편집 기능 추가 가능성 있음.

**권장 사항**:
Props에 확장 포인트 정의:
```typescript
interface UserDetailModalProps {
  user: User | null;
  open: boolean;
  onClose: () => void;
  mode?: 'view' | 'edit';  // 향후 확장용
  onSave?: (user: User) => Promise<void>;  // 향후 확장용
}
```

**영향 범위**: `UserDetailModal.tsx` 구현 시

---

### ARCH-05: screens 디렉토리 구조 컨벤션 문서화 필요

**Severity**: Low
**Priority**: P4
**관점**: 패턴 일관성

**현재 상태**:
프로젝트에 `screens/` 디렉토리가 새로 도입되나, CLAUDE.md에 해당 컨벤션이 문서화되지 않음.

**권장 사항**: CLAUDE.md에 디렉토리 구조 컨벤션 추가

**영향 범위**: CLAUDE.md

---

### QA-04: 접근성 테스트 케이스 상세화 필요

**Severity**: Low
**Priority**: P4
**관점**: 테스트 커버리지

**현재 상태**:
TC-011 접근성 테스트가 "키보드 탐색"으로만 정의되어 구체적인 검증 기준 부족.

**권장 사항**:
접근성 테스트 세분화:
| TC-011-1 | Tab 키 포커스 순서 | 검색 → 버튼 → 테이블 순서 확인 |
| TC-011-2 | Enter 키 검색 실행 | 검색 필드에서 Enter 시 검색 동작 |
| TC-011-3 | Escape 키 모달 닫기 | 상세 모달에서 Escape 시 닫힘 |

**영향 범위**: 026-test-specification.md 섹션 4.1

---

### DOC-02: Mock 데이터 상세 명세 보강

**Severity**: Low
**Priority**: P4
**관점**: 문서 완전성

**현재 상태**:
mock-data/users.json 샘플 구조에 1건만 예시로 제공되어, 테스트에 필요한 다양한 상태(활성/비활성/대기) 데이터 구성이 불명확.

**권장 사항**: 최소 필요 테스트 데이터 유형 명시 (상태별, 역할별 최소 1건씩)

**영향 범위**: 026-test-specification.md 섹션 5.3

---

### UX-01: 날짜 검색 필드 타입 미사용

**Severity**: Low
**Priority**: P4
**관점**: 기능 검증 커버리지

**현재 상태**:
ListTemplate이 지원하는 `date`, `dateRange` 필드 타입이 사용자 목록 샘플에서 사용되지 않음.

**권장 사항**:
- "가입일" 또는 "최근 로그인" 날짜 범위 검색 필드 추가 고려
- 또는 날짜 검색은 다른 샘플(대시보드, 마스터-디테일)에서 검증한다고 명시

**영향 범위**: 010-design.md 섹션 7.4

---

### UX-02: Empty State 버튼 동작 명확화

**Severity**: Low
**Priority**: P4
**관점**: UX 상세

**현재 상태**:
Empty State의 "조건 초기화" 버튼이 `autoSearchOnReset` 설정을 따르는지 불명확.

**권장 사항**: Empty State 초기화 버튼은 항상 조건 리셋 + 자동 검색 수행하도록 명시

**영향 범위**: 010-design.md 섹션 5.5

---

## Info 이슈

### INFO-01: Ant Design 컴포넌트 활용 TRD 부합

**Severity**: Info
**Priority**: P5

설계 문서에서 사용 예정인 Ant Design 컴포넌트(Modal, Descriptions, Tag, Avatar)가 TRD 지침에 부합합니다.

---

### INFO-02: 요구사항 추적성 양호

**Severity**: Info
**Priority**: P5

PRD 4.1.1 → 설계 UC-01~UC-10 → 테스트 케이스 매핑이 완전합니다.

---

### INFO-03: 사용자 시나리오 현실성 양호

**Severity**: Info
**Priority**: P5

3개 사용자 시나리오가 실제 사용 상황을 잘 반영합니다.

---

## 리뷰 결론

### 설계 품질 평가

| 항목 | 점수 | 비고 |
|------|------|------|
| 문서 완전성 | 90% | 양호 |
| 요구사항 추적성 | 85% | 양호 |
| 아키텍처 적합성 | 80% | 개선 필요 (P2 이슈 2건) |
| 테스트 가능성 | 75% | 개선 필요 (셀렉터 안정성) |
| UX 품질 | 95% | 양호 |

### 필수 조치 사항 (P2)

1. **ARCH-01**: useUserList 훅 책임 범위 명확화
2. **QA-01**: data-testid 명명 규칙 통일
3. **ARCH-02**: API 전환 전략 명시 (또는 샘플 예외 명시)
4. **QA-02**: E2E 테스트 셀렉터 안정화
5. **QA-03**: 경계 조건 테스트 케이스 추가

### 권장 조치 사항 (P3)

1. **ARCH-03**: ListTemplate Props 사용 명세 추가
2. **TRACE-01**: 삭제 기능 PRD 근거 명확화

### 전체 평가

**WARN (조건부 승인)** - P2 이슈 5건 해결 후 구현 진행 권장

설계 문서는 전반적으로 잘 작성되어 있으며, 주요 기능 요구사항을 충분히 커버하고 있습니다. 다만 아키텍처 관점에서 훅의 책임 범위 명확화와 테스트 관점에서 셀렉터 안정성 개선이 필요합니다. P2 이슈들은 구현 전 설계 문서에 반영하거나, 구현 시 고려사항으로 명시하는 것을 권장합니다.

---

## 변경 이력

| 버전 | 일자 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0 | 2026-01-21 | claude-1 | 최초 작성 |

---

## 리뷰 반영 결과 (2026-01-21)

### 맥락 분석

| 검토 항목 | 평가 | 비고 |
|----------|------|------|
| 시스템 적합성 | 5/5 | TRD 기준 React/Next.js/Ant Design 환경에 부합 |
| Task 범위 적합성 | 4/5 | 샘플 화면 검증 목적에 부합 |
| 실현 가능성 | 5/5 | 설계 수준에서 명세 가능 |

### 적용 결과 요약

| 구분 | 건수 |
|------|------|
| ✅ 적용 | 9건 |
| 📝 조정 적용 | 4건 |
| ⏸️ 보류 | 4건 |

### P2 이슈 처리 결과

| ID | 이슈 | 판단 | 반영 위치 |
|----|------|------|----------|
| **ARCH-01** | useUserList 훅 책임 범위 | ✅ 적용 | 010-design.md §11.2 |
| **QA-01** | data-testid 정의 불일치 | 📝 조정 적용 | 026-test-specification.md §6.1~6.2 |
| **ARCH-02** | API 전환 시 변경 범위 | 📝 조정 적용 | 010-design.md §11.4 |
| **QA-02** | E2E 테스트 Ant Design 셀렉터 | ✅ 적용 | 026-test-specification.md §3.2, §6.2 |
| **QA-03** | 경계 조건 테스트 미흡 | ✅ 적용 | 026-test-specification.md §3.1 (E2E-010~012 추가) |

### P3 이슈 처리 결과

| ID | 이슈 | 판단 | 반영 위치 |
|----|------|------|----------|
| **ARCH-03** | ListTemplate Props 명세 부족 | ✅ 적용 | 010-design.md §11.3 |
| **TRACE-01** | 삭제 기능 PRD 출처 명확화 | ✅ 적용 | 025-traceability-matrix.md FR-009 |

### P4 이슈 처리 결과

| ID | 이슈 | 판단 | 사유 |
|----|------|------|------|
| **DOC-01** | 체크리스트 상태 | ✅ 적용 | 010-design.md §12.2 |
| **ARCH-04** | UserDetailModal 확장성 | ⏸️ 보류 | YAGNI - 현재 요구사항에 없음 |
| **ARCH-05** | screens 컨벤션 문서화 | ⏸️ 보류 | Task 범위 밖 (CLAUDE.md 수정) |
| **QA-04** | 접근성 테스트 상세화 | 📝 조정 적용 | 026-test-specification.md §4.1 (TC-011 세분화) |
| **DOC-02** | Mock 데이터 다양성 | ✅ 적용 | 026-test-specification.md §5.4 |
| **UX-01** | 날짜 검색 필드 | ⏸️ 보류 | PRD에서 날짜 검색 요구 없음 |
| **UX-02** | Empty State 버튼 동작 | ✅ 적용 | 010-design.md §4.3 |

### 수정된 문서 목록

| 문서 | 주요 변경 |
|------|----------|
| `010-design.md` | §11.2~11.4 추가 (훅 인터페이스, Props 명세, Mock 전략), §4.3 Empty State 명확화, §12.2 체크리스트 |
| `025-traceability-matrix.md` | FR-009 주석 추가, E2E-010~012 추가, 커버리지 통계 업데이트 |
| `026-test-specification.md` | §3.1~3.2 E2E 테스트 추가, §4.1 접근성 테스트 세분화, §5.4 데이터 다양성, §6.1~6.2 셀렉터 계층화 |
