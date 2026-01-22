# 요구사항 추적성 매트릭스 (025-traceability-matrix.md)

**Template Version:** 1.0.0 — **Last Updated:** 2026-01-22

> **목적**: PRD → 기본설계 → 상세설계 → 테스트 4단계 양방향 추적
>
> **참조**: 이 문서는 `010-design.md`와 `026-test-specification.md`와 함께 사용됩니다.

---

## 0. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| Task ID | TSK-06-11 |
| Task명 | [샘플] 작업 일정 캘린더 |
| PRD 참조 | PRD 4.1.1 화면 템플릿 샘플 - 특수 패턴 샘플 - 작업 일정 캘린더 |
| 상세설계 참조 | `010-design.md` |
| 테스트 명세 참조 | `026-test-specification.md` |
| 작성일 | 2026-01-22 |
| 작성자 | Claude |

---

## 1. 기능 요구사항 추적 (FR → 설계 → 테스트)

> PRD → 기본설계 → 상세설계 → 테스트케이스 매핑

| 요구사항 ID | PRD 섹션 | 설계 섹션 | 단위 테스트 | E2E 테스트 | 매뉴얼 TC | 상태 |
|-------------|----------|-----------|-------------|------------|-----------|------|
| FR-001 | PRD 4.1.1 특수 패턴 | 3.1 | UT-001 | E2E-001 | TC-001 | 설계대기 |
| FR-002 | PRD 4.1.1 특수 패턴 | 3.2 | UT-002, UT-003 | E2E-002 | TC-002 | 설계대기 |
| FR-003 | PRD 4.1.1 특수 패턴 | 3.3 | UT-004, UT-005 | E2E-003 | TC-003 | 설계대기 |
| FR-004 | PRD 4.1.1 특수 패턴 | 3.4 | UT-006 | E2E-004 | TC-004 | 설계대기 |
| FR-005 | PRD 4.1.1 특수 패턴 | 3.5 | UT-007, UT-008 | E2E-005 | TC-005 | 설계대기 |
| FR-006 | PRD 4.1.1 특수 패턴 | 3.6 | UT-009, UT-010 | E2E-006 | TC-006 | 설계대기 |
| FR-007 | PRD 4.1.1 특수 패턴 | 3.7 | UT-011 | E2E-007 | TC-007 | 설계대기 |
| FR-008 | PRD 4.1.1 특수 패턴 | 3.8 | UT-012 | E2E-008 | TC-008 | 설계대기 |
| FR-009 | PRD 4.1.1 특수 패턴 | 3.9 | UT-013 | E2E-001 | TC-001 | 설계대기 |

### 1.1 요구사항별 상세 매핑

#### FR-001: 캘린더 진입 및 초기 표시

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.1.1 특수 패턴 | 작업 일정 캘린더 - 캘린더 패턴 검증 |
| 설계 | 010-design.md | 3.1 | 캘린더 초기 화면 진입 시 월간 뷰로 표시 |
| 컴포넌트 | - | - | WorkCalendar/index.tsx |
| 단위 테스트 | 026-test-specification.md | 2.1 | UT-001: 캘린더 초기 렌더링 |
| E2E 테스트 | 026-test-specification.md | 3.1 | E2E-001: 캘린더 초기 로드 |

**PRD 원문:**
> - 작업 일정 캘린더 - 캘린더 패턴 검증

**인수 조건:**
> - 캘린더 진입 시 현재 월의 월간 뷰로 표시
> - 오늘 날짜 강조 표시

---

#### FR-002: 월간/주간/일간 뷰 전환

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.1.1 특수 패턴 | 월간/주간/일간 뷰 전환 |
| 설계 | 010-design.md | 3.2 | 뷰 모드 전환 UI 및 로직 설계 |
| 컴포넌트 | - | - | WorkCalendar/index.tsx (ViewSwitcher) |
| 단위 테스트 | 026-test-specification.md | 2.2 | UT-002: 뷰 모드 전환, UT-003: 뷰별 레이아웃 |
| E2E 테스트 | 026-test-specification.md | 3.2 | E2E-002: 뷰 전환 시나리오 |

**PRD 원문:**
> - 월간/주간/일간 뷰 전환

**인수 조건:**
> - Radio.Group으로 월간/주간/일간 선택
> - 뷰 전환 시 현재 날짜 기준 유지

---

#### FR-003: 일정 목록 표시 (색상 구분)

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.1.1 특수 패턴 | 작업 일정 색상 구분 표시 |
| 설계 | 010-design.md | 3.3 | 일정 유형별 색상 매핑 및 표시 설계 |
| 컴포넌트 | - | - | WorkCalendar/index.tsx (dateCellRender) |
| 단위 테스트 | 026-test-specification.md | 2.3 | UT-004: 일정 색상 매핑, UT-005: 일정 뱃지 렌더링 |
| E2E 테스트 | 026-test-specification.md | 3.3 | E2E-003: 일정 표시 검증 |

**PRD 원문:**
> - 작업 일정 색상 구분 표시

**인수 조건:**
> - 일정 유형별 색상 구분 (생산: 파랑, 점검: 노랑, 긴급: 빨강, 기타: 회색)
> - Calendar dateCellRender로 일정 Badge 표시

---

#### FR-004: 일정 클릭 시 상세 팝업

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.1.1 특수 패턴 | 일정 클릭 시 상세 팝업 |
| 설계 | 010-design.md | 3.4 | 상세 정보 Modal 컴포넌트 설계 |
| 컴포넌트 | - | - | WorkCalendar/ScheduleDetailModal.tsx |
| 단위 테스트 | 026-test-specification.md | 2.4 | UT-006: 상세 Modal 열기/닫기 |
| E2E 테스트 | 026-test-specification.md | 3.4 | E2E-004: 상세 팝업 상호작용 |

**PRD 원문:**
> - 일정 클릭 시 상세 팝업

**인수 조건:**
> - 일정 클릭 시 상세 정보 Modal 표시
> - 제목, 기간, 유형, 설명, 담당자 등 상세 정보 표시
> - 수정/삭제 버튼 제공

---

#### FR-005: 새 일정 추가 (모달)

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.1.1 특수 패턴 | 새 일정 추가 모달 |
| 설계 | 010-design.md | 3.5 | 일정 추가 Form Modal 설계 |
| 컴포넌트 | - | - | WorkCalendar/ScheduleFormModal.tsx |
| 단위 테스트 | 026-test-specification.md | 2.5 | UT-007: 추가 Modal 열기, UT-008: 폼 제출 |
| E2E 테스트 | 026-test-specification.md | 3.5 | E2E-005: 일정 추가 시나리오 |

**PRD 원문:**
> - 새 일정 추가 모달

**인수 조건:**
> - 일정 추가 버튼 또는 빈 날짜 클릭 시 추가 Modal 표시
> - 필수 필드: 제목, 시작일, 종료일, 유형
> - 유효성 검사 후 목록에 추가

---

#### FR-006: 일정 수정

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.1.1 특수 패턴 | (상세 팝업 내 수정 기능) |
| 설계 | 010-design.md | 3.6 | 일정 수정 기능 설계 |
| 컴포넌트 | - | - | WorkCalendar/ScheduleFormModal.tsx (edit mode) |
| 단위 테스트 | 026-test-specification.md | 2.6 | UT-009: 수정 Modal 초기값, UT-010: 수정 제출 |
| E2E 테스트 | 026-test-specification.md | 3.6 | E2E-006: 일정 수정 시나리오 |

**PRD 원문:**
> - (상세 팝업에서 수정 버튼 클릭 시 수정 모달 표시)

**인수 조건:**
> - 상세 Modal에서 수정 버튼 클릭 시 수정 Form Modal 표시
> - 기존 데이터 초기값으로 로드
> - 수정 완료 시 목록 갱신

---

#### FR-007: 일정 삭제

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.1.1 특수 패턴 | (상세 팝업 내 삭제 기능) |
| 설계 | 010-design.md | 3.7 | 일정 삭제 기능 설계 |
| 컴포넌트 | - | - | WorkCalendar/ScheduleDetailModal.tsx (delete action) |
| 단위 테스트 | 026-test-specification.md | 2.7 | UT-011: 삭제 확인 다이얼로그 |
| E2E 테스트 | 026-test-specification.md | 3.7 | E2E-007: 일정 삭제 시나리오 |

**PRD 원문:**
> - (상세 팝업에서 삭제 버튼 클릭 시 삭제 확인)

**인수 조건:**
> - 상세 Modal에서 삭제 버튼 클릭 시 확인 다이얼로그 표시
> - 확인 시 목록에서 제거

---

#### FR-008: 일정 드래그 이동 (선택)

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.1.1 특수 패턴 | (선택적 기능) |
| 설계 | 010-design.md | 3.8 | 드래그 앤 드롭 일정 이동 설계 |
| 컴포넌트 | - | - | WorkCalendar/index.tsx (DnD 로직) |
| 단위 테스트 | 026-test-specification.md | 2.8 | UT-012: 드래그 이동 처리 |
| E2E 테스트 | 026-test-specification.md | 3.8 | E2E-008: 드래그 이동 시나리오 |

**PRD 원문:**
> - (선택적 기능 - 드래그 앤 드롭으로 일정 날짜 변경)

**인수 조건:**
> - 일정 드래그 시 다른 날짜로 이동 가능
> - 이동 시 시간 범위 유지 (시작-종료 간격 동일)

---

#### FR-009: 날짜 네비게이션 (이전/다음/오늘)

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.1.1 특수 패턴 | (캘린더 기본 기능) |
| 설계 | 010-design.md | 3.9 | 날짜 네비게이션 UI 설계 |
| 컴포넌트 | - | - | WorkCalendar/index.tsx (Calendar headerRender) |
| 단위 테스트 | 026-test-specification.md | 2.9 | UT-013: 네비게이션 버튼 동작 |
| E2E 테스트 | 026-test-specification.md | 3.1 | E2E-001: 초기 로드 및 네비게이션 |

**PRD 원문:**
> - (캘린더 기본 네비게이션 기능)

**인수 조건:**
> - 이전/다음 버튼으로 월/주/일 이동
> - 오늘 버튼으로 현재 날짜로 이동

---

## 2. 비즈니스 규칙 추적 (BR → 구현 → 검증)

| 규칙 ID | PRD/WBS 출처 | 설계 섹션 | 구현 위치(개념) | 단위 테스트 | E2E 테스트 | 검증 방법 | 상태 |
|---------|--------------|-----------|-----------------|-------------|------------|-----------|------|
| BR-001 | PRD 4.1.1 | 3.5, 3.6 | Form validation | UT-014 | E2E-005 | 종료일 >= 시작일 검증 | 설계대기 |
| BR-002 | PRD 4.1.1 | 3.5 | Form validation | UT-015 | E2E-005 | 필수 필드 누락 시 에러 표시 | 설계대기 |
| BR-003 | PRD 4.1.1 | 3.3 | 색상 매핑 상수 | UT-004 | E2E-003 | 유형별 올바른 색상 적용 | 설계대기 |
| BR-004 | PRD 4.1.1 | 3.8 | 드래그 로직 | UT-012 | E2E-008 | 드래그 시 기간 간격 유지 | 설계대기 |

### 2.1 비즈니스 규칙별 상세 매핑

#### BR-001: 일정 기간 검증 (종료일 >= 시작일)

| 구분 | 내용 |
|------|------|
| **PRD 원문** | (암묵적 요구사항 - 일정 추가/수정 시 기간 유효성) |
| **설계 표현** | 종료일은 시작일보다 같거나 이후여야 한다 |
| **구현 위치** | ScheduleFormModal.tsx Form.Item rules |
| **검증 방법** | 종료일 < 시작일 입력 시 유효성 에러 표시 |
| **관련 테스트** | UT-014, E2E-005 |

**검증 규칙:**
| 조건 | 결과 | 메시지 |
|------|------|--------|
| endDate >= startDate | 통과 | - |
| endDate < startDate | 실패 | "종료일은 시작일 이후여야 합니다" |

---

#### BR-002: 필수 필드 검증 (제목, 시작일, 종료일)

| 구분 | 내용 |
|------|------|
| **PRD 원문** | 새 일정 추가 모달 |
| **설계 표현** | 제목, 시작일, 종료일, 유형은 필수 입력 필드 |
| **구현 위치** | ScheduleFormModal.tsx Form.Item rules (required) |
| **검증 방법** | 필수 필드 미입력 시 제출 차단 및 에러 표시 |
| **관련 테스트** | UT-015, E2E-005 |

**필수 필드:**
| 필드명 | 필수 여부 | 에러 메시지 |
|--------|----------|-------------|
| title | Y | "제목을 입력해주세요" |
| startDate | Y | "시작일을 선택해주세요" |
| endDate | Y | "종료일을 선택해주세요" |
| type | Y | "유형을 선택해주세요" |
| description | N | - |
| assignee | N | - |

---

#### BR-003: 일정 유형별 색상 표시

| 구분 | 내용 |
|------|------|
| **PRD 원문** | 작업 일정 색상 구분 표시 |
| **설계 표현** | 일정 유형별 색상 매핑 상수 정의 |
| **구현 위치** | constants/schedule.ts 또는 WorkCalendar 내부 |
| **검증 방법** | 각 유형별 렌더링 결과 색상 확인 |
| **관련 테스트** | UT-004, E2E-003 |

**색상 매핑 규칙:**
| 유형 | 색상 | Ant Design Badge status |
|------|------|------------------------|
| 생산 (PRODUCTION) | 파랑 (#1890ff / processing) | processing |
| 점검 (MAINTENANCE) | 노랑 (#faad14 / warning) | warning |
| 긴급 (URGENT) | 빨강 (#f5222d / error) | error |
| 기타 (OTHER) | 회색 (#8c8c8c / default) | default |

---

#### BR-004: 드래그 시 시간 범위 유지

| 구분 | 내용 |
|------|------|
| **PRD 원문** | (선택적 기능 - 드래그 이동) |
| **설계 표현** | 일정을 다른 날짜로 드래그 시 시작-종료 간격은 유지된다 |
| **구현 위치** | WorkCalendar/index.tsx 드래그 핸들러 |
| **검증 방법** | 3일 기간 일정 드래그 시 이동 후에도 3일 유지 확인 |
| **관련 테스트** | UT-012, E2E-008 |

**예시:**
| 드래그 전 | 드래그 후 (3일 이동) | 기간 |
|----------|---------------------|------|
| 1/10 ~ 1/12 | 1/13 ~ 1/15 | 3일 (유지) |

---

## 3. 테스트 역추적 매트릭스

> 테스트 결과 → 요구사항 역추적용 (build/verify 단계 결과서 생성 시 활용)

| 테스트 ID | 테스트 유형 | 검증 대상 요구사항 | 검증 대상 비즈니스 규칙 | 상태 |
|-----------|------------|-------------------|----------------------|------|
| UT-001 | 단위 | FR-001 | - | 미실행 |
| UT-002 | 단위 | FR-002 | - | 미실행 |
| UT-003 | 단위 | FR-002 | - | 미실행 |
| UT-004 | 단위 | FR-003 | BR-003 | 미실행 |
| UT-005 | 단위 | FR-003 | - | 미실행 |
| UT-006 | 단위 | FR-004 | - | 미실행 |
| UT-007 | 단위 | FR-005 | - | 미실행 |
| UT-008 | 단위 | FR-005 | - | 미실행 |
| UT-009 | 단위 | FR-006 | - | 미실행 |
| UT-010 | 단위 | FR-006 | - | 미실행 |
| UT-011 | 단위 | FR-007 | - | 미실행 |
| UT-012 | 단위 | FR-008 | BR-004 | 미실행 |
| UT-013 | 단위 | FR-009 | - | 미실행 |
| UT-014 | 단위 | - | BR-001 | 미실행 |
| UT-015 | 단위 | - | BR-002 | 미실행 |
| E2E-001 | E2E | FR-001, FR-009 | - | 미실행 |
| E2E-002 | E2E | FR-002 | - | 미실행 |
| E2E-003 | E2E | FR-003 | BR-003 | 미실행 |
| E2E-004 | E2E | FR-004 | - | 미실행 |
| E2E-005 | E2E | FR-005 | BR-001, BR-002 | 미실행 |
| E2E-006 | E2E | FR-006 | - | 미실행 |
| E2E-007 | E2E | FR-007 | - | 미실행 |
| E2E-008 | E2E | FR-008 | BR-004 | 미실행 |
| TC-001 | 매뉴얼 | FR-001, FR-009 | - | 미실행 |
| TC-002 | 매뉴얼 | FR-002 | - | 미실행 |
| TC-003 | 매뉴얼 | FR-003 | BR-003 | 미실행 |
| TC-004 | 매뉴얼 | FR-004 | - | 미실행 |
| TC-005 | 매뉴얼 | FR-005 | BR-001, BR-002 | 미실행 |
| TC-006 | 매뉴얼 | FR-006 | - | 미실행 |
| TC-007 | 매뉴얼 | FR-007 | - | 미실행 |
| TC-008 | 매뉴얼 | FR-008 | BR-004 | 미실행 |

---

## 4. 데이터 모델 추적

> Mock 데이터 구조 → 컴포넌트 Props 매핑

| Mock 데이터 | 데이터 위치 | 컴포넌트 Props | 사용 컴포넌트 |
|------------|------------|---------------|--------------|
| Schedule | mock-data/schedules.json | ScheduleData | WorkCalendar |
| ScheduleType | mock-data/schedules.json | type prop | Badge, ScheduleFormModal |

### 4.1 데이터 구조 명세

```typescript
// Schedule 데이터 구조
interface Schedule {
  id: string;
  title: string;
  startDate: string;       // ISO 8601 format (YYYY-MM-DD)
  endDate: string;         // ISO 8601 format (YYYY-MM-DD)
  type: ScheduleType;
  description?: string;
  assignee?: string;
  createdAt?: string;
  updatedAt?: string;
}

// 일정 유형 열거형
type ScheduleType = 'PRODUCTION' | 'MAINTENANCE' | 'URGENT' | 'OTHER';

// 일정 유형 정보
interface ScheduleTypeInfo {
  key: ScheduleType;
  label: string;
  color: string;
  badgeStatus: 'processing' | 'warning' | 'error' | 'default';
}
```

---

## 5. 인터페이스 추적

> 이 Task는 프론트엔드 전용으로, API 엔드포인트 없음 (Mock 데이터 사용)

| 인터페이스 유형 | 설명 | 데이터 소스 | 요구사항 |
|----------------|------|------------|----------|
| Mock Data Load | 일정 목록 로드 | mock-data/schedules.json | FR-001, FR-003 |
| CRUD Operations | 일정 추가/수정/삭제 | 클라이언트 사이드 상태 관리 | FR-005, FR-006, FR-007 |

---

## 6. 화면 추적

> 설계 화면 요구사항 → 컴포넌트 매핑

| 화면 설계 | 화면 파일 | 컴포넌트 | 요구사항 |
|----------|----------|----------|----------|
| 작업 일정 캘린더 메인 | components/screens/sample/WorkCalendar/index.tsx | WorkCalendar | FR-001, FR-002, FR-003, FR-008, FR-009 |
| 일정 상세 Modal | components/screens/sample/WorkCalendar/ScheduleDetailModal.tsx | ScheduleDetailModal | FR-004, FR-007 |
| 일정 추가/수정 Modal | components/screens/sample/WorkCalendar/ScheduleFormModal.tsx | ScheduleFormModal | FR-005, FR-006 |

### 6.1 컴포넌트 계층 구조

```
WorkCalendar/index.tsx (components/screens/sample/)
├── 헤더 영역 (Calendar headerRender)
│   ├── 날짜 네비게이션 (이전/다음/오늘) → FR-009
│   ├── 현재 날짜 표시
│   └── 뷰 모드 전환 (Radio.Group) → FR-002
├── 일정 추가 버튼 → FR-005
├── Calendar 컴포넌트 (Ant Design)
│   └── dateCellRender → FR-003
│       └── 일정 Badge (색상 구분)
├── ScheduleDetailModal.tsx → FR-004, FR-007
│   ├── 일정 상세 정보 표시
│   ├── 수정 버튼 → FR-006 연결
│   └── 삭제 버튼 (확인 다이얼로그)
└── ScheduleFormModal.tsx → FR-005, FR-006
    ├── 제목 입력 (필수)
    ├── 날짜 범위 선택 (필수) → BR-001, BR-002
    ├── 유형 선택 (필수)
    ├── 설명 입력 (선택)
    └── 담당자 입력 (선택)
```

### 6.2 UI 스펙 매핑

| PRD/WBS uiSpec | 컴포넌트 | 사용 여부 |
|----------------|----------|----------|
| Ant Design Calendar | WorkCalendar | O |
| Ant Design Badge | dateCellRender | O |
| Ant Design Modal | ScheduleDetailModal, ScheduleFormModal | O |
| Ant Design Form | ScheduleFormModal | O |
| Ant Design DatePicker.RangePicker | ScheduleFormModal | O |
| Ant Design Select | ScheduleFormModal (유형 선택) | O |
| Ant Design Radio.Group | WorkCalendar (뷰 전환) | O |
| Ant Design Button | 네비게이션, 추가, 수정, 삭제 | O |
| Ant Design Descriptions | ScheduleDetailModal | O |
| Ant Design Popconfirm | 삭제 확인 | O |

---

## 7. 추적성 검증 요약

### 7.1 커버리지 통계

| 구분 | 총 항목 | 매핑 완료 | 미매핑 | 커버리지 |
|------|---------|----------|--------|---------|
| 기능 요구사항 (FR) | 9 | 9 | 0 | 100% |
| 비즈니스 규칙 (BR) | 4 | 4 | 0 | 100% |
| 단위 테스트 (UT) | 15 | 15 | 0 | 100% |
| E2E 테스트 | 8 | 8 | 0 | 100% |
| 매뉴얼 테스트 (TC) | 8 | 8 | 0 | 100% |
| 화면 컴포넌트 | 3 | 3 | 0 | 100% |

### 7.2 요구사항-테스트 커버리지

| 요구사항 | UT 커버 | E2E 커버 | TC 커버 | 전체 커버 |
|----------|---------|----------|---------|----------|
| FR-001 | O (1건) | O (1건) | O (1건) | 완전 |
| FR-002 | O (2건) | O (1건) | O (1건) | 완전 |
| FR-003 | O (2건) | O (1건) | O (1건) | 완전 |
| FR-004 | O (1건) | O (1건) | O (1건) | 완전 |
| FR-005 | O (2건) | O (1건) | O (1건) | 완전 |
| FR-006 | O (2건) | O (1건) | O (1건) | 완전 |
| FR-007 | O (1건) | O (1건) | O (1건) | 완전 |
| FR-008 | O (1건) | O (1건) | O (1건) | 완전 |
| FR-009 | O (1건) | O (1건) | O (1건) | 완전 |

### 7.3 미매핑 항목

| 구분 | ID | 설명 | 미매핑 사유 |
|------|-----|------|-----------|
| - | - | - | 해당 없음 |

---

## 관련 문서

- 상세설계: `010-design.md`
- 테스트 명세: `026-test-specification.md`
- PRD: `.orchay/projects/mes-portal/prd.md` (섹션 4.1.1 특수 패턴 샘플)
- WBS: `.orchay/projects/mes-portal/wbs.yaml` (TSK-06-11)
- Mock 데이터: `mes-portal/mock-data/schedules.json`

---

## 변경 이력

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0.0 | 2026-01-22 | Claude | 초안 작성 |

---

<!--
Template Version: 1.0.0
Based on: .orchay/templates/025-traceability-matrix.md
-->
