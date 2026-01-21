# TSK-02-01 - MDI 상태 관리 구현 보고서

## 0. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| **문서명** | `030-implementation.md` |
| **Task ID** | TSK-02-01 |
| **Task명** | MDI 상태 관리 |
| **작성일** | 2026-01-21 |
| **작성자** | Claude |
| **참조 설계서** | `010-design.md` |
| **구현 상태** | :white_check_mark: 완료 |

---

## 1. 구현 개요

### 1.1 구현 목적

MES Portal에서 탭 기반 다중 화면(MDI) 관리를 위한 상태 관리 로직 구현. 사용자가 여러 화면을 탭으로 열고, 닫고, 전환하며 작업할 수 있도록 React Context 기반의 중앙 집중식 상태 관리 시스템 제공.

### 1.2 구현 범위

**포함된 기능**:
- MDI Context/Provider 생성 (React Context API)
- 탭 목록 상태 관리 (열린 탭 배열)
- 활성 탭 상태 관리 (현재 선택된 탭)
- 탭 열기/닫기/전환 함수 (`openTab`, `closeTab`, `setActiveTab`)
- 전체 탭 닫기/다른 탭 닫기 (`closeAllTabs`, `closeOtherTabs`)
- 탭 조회 함수 (`getTab`, `getTabs`)
- 보안 검증 (path 검증, 권한 검증 인터페이스)
- useMDI 커스텀 훅

**제외된 기능** (후속 Task에서 구현):
- TabBar UI 컴포넌트 (TSK-02-02)
- 탭 드래그 앤 드롭 (TSK-02-03)
- 탭 컨텍스트 메뉴 (TSK-02-04)
- MDI 컨텐츠 영역 컴포넌트 (TSK-02-05)

### 1.3 구현 유형

- [ ] Backend Only
- [x] Frontend Only
- [ ] Full-stack

### 1.4 기술 스택

**Frontend**:
- Framework: Next.js 16.x (App Router), React 19.x
- State: React Context API + useReducer
- Testing: Vitest 4.x, @testing-library/react
- E2E: Playwright

---

## 2. Frontend 구현 결과

### 2.1 구현된 컴포넌트

#### 2.1.1 타입 정의

| 파일 | 설명 |
|------|------|
| `lib/mdi/types.ts` | Tab, MDIState, MDIContextType, MDIConfig 인터페이스 |

**주요 타입**:

```typescript
interface Tab {
  id: string;           // 고유 식별자
  title: string;        // 탭 제목
  path: string;         // 화면 경로
  icon?: string;        // 아이콘
  closable: boolean;    // 닫기 가능 여부
  params?: Record<string, unknown>; // 파라미터
}

interface MDIState {
  tabs: Tab[];
  activeTabId: string | null;
}
```

#### 2.1.2 Context/Provider

| 파일 | 설명 |
|------|------|
| `lib/mdi/context.tsx` | MDIProvider, useMDI 훅 |

**제공 함수**:

| 함수 | 파라미터 | 설명 |
|------|----------|------|
| `openTab` | tab: Tab | 새 탭 열기 (중복 시 활성화) |
| `closeTab` | tabId: string | 탭 닫기 |
| `closeAllTabs` | - | 모든 탭 닫기 (closable=true만) |
| `closeOtherTabs` | tabId: string | 지정 탭 제외 닫기 |
| `setActiveTab` | tabId: string | 활성 탭 변경 |
| `getTab` | tabId: string | 탭 정보 조회 |
| `getTabs` | - | 전체 탭 목록 조회 |

#### 2.1.3 모듈 내보내기

| 파일 | 설명 |
|------|------|
| `lib/mdi/index.ts` | MDIProvider, useMDI, 타입 내보내기 |

### 2.2 보안 구현

| SEC ID | 구현 내용 | 상태 |
|--------|----------|------|
| SEC-01 | title XSS 방지 (React JSX 기본 이스케이프) | :white_check_mark: |
| SEC-02 | path 경로 검증 (`isValidPath` 함수) | :white_check_mark: |
| SEC-03 | 권한 검증 인터페이스 (`canAccessPath` 콜백) | :white_check_mark: |
| SEC-04 | params 민감정보 정책 (문서화) | :white_check_mark: |

### 2.3 TDD 테스트 결과

#### 2.3.1 테스트 커버리지

| 파일 | Statements | Branches | Functions | Lines |
|------|------------|----------|-----------|-------|
| context.tsx | 89.53% | 85.00% | 100% | 89.33% |
| types.ts | 80.00% | 75.00% | 100% | 100% |
| **전체 (lib/mdi)** | **89.01%** | **84.09%** | **100%** | **89.74%** |

**품질 기준 달성**:
- :white_check_mark: 테스트 커버리지 80% 이상: 89.74%
- :white_check_mark: 모든 단위 테스트 통과: 18/18 통과
- :white_check_mark: 정적 분석 통과: TypeScript 컴파일 에러 0건

#### 2.3.2 테스트 케이스 매핑

| 테스트 ID | 설계 시나리오 | 결과 |
|-----------|--------------|------|
| UT-001 | 초기 상태 확인 | :white_check_mark: Pass |
| UT-002 | getTabs 호출 | :white_check_mark: Pass |
| UT-003 | 새 탭 열기 | :white_check_mark: Pass |
| UT-004 | 중복 탭 열기 | :white_check_mark: Pass (BR-MDI-01) |
| UT-005 | 비활성 탭 닫기 | :white_check_mark: Pass |
| UT-006 | 활성 탭 닫기 (오른쪽 탭 존재) | :white_check_mark: Pass |
| UT-007 | 활성 탭 닫기 (왼쪽만 존재) | :white_check_mark: Pass |
| UT-008 | 탭 전환 | :white_check_mark: Pass |
| UT-009 | 최대 탭 초과 | :white_check_mark: Pass (BR-MDI-02) |
| UT-010 | closable=false 탭 닫기 | :white_check_mark: Pass (BR-MDI-03) |
| UT-011 | 마지막 탭 닫기 | :white_check_mark: Pass |
| UT-012 | 모든 탭 닫기 | :white_check_mark: Pass |
| UT-013 | 다른 탭 닫기 | :white_check_mark: Pass |

### 2.4 E2E 테스트 결과

#### 2.4.1 테스트 실행 요약

| 항목 | 값 |
|------|-----|
| 총 테스트 수 | 7 |
| 성공 | 2 |
| 건너뜀 | 5 (후속 Task 필요) |

#### 2.4.2 테스트 케이스 매핑

| 테스트 ID | 설계 시나리오 | 결과 | 비고 |
|-----------|--------------|------|------|
| E2E-001 | 포털 초기 상태 | :white_check_mark: Pass | |
| E2E-002 | 메뉴 클릭 화면 전환 | :white_check_mark: Pass | |
| E2E-003 | 탭 닫기 | SKIP | TSK-02-02 필요 |
| E2E-004 | 상태 유지 | SKIP | TSK-02-02, TSK-02-05 필요 |
| E2E-005 | 최대 탭 제한 | SKIP | TSK-02-02 필요 |
| E2E-006 | 모든 탭 닫기 | SKIP | TSK-02-04 필요 |
| E2E-007 | 다른 탭 닫기 | SKIP | TSK-02-04 필요 |

---

## 3. 요구사항 커버리지

### 3.1 기능 요구사항 커버리지

| 요구사항 ID | 요구사항 설명 | 테스트 ID | 결과 |
|-------------|--------------|-----------|------|
| FR-MDI-01 | 탭 기반 다중 화면 관리 | UT-001, UT-002, E2E-001 | :white_check_mark: |
| FR-MDI-02 | 여러 화면 동시 열기 및 전환 | UT-003, UT-004, E2E-002 | :white_check_mark: |
| FR-MDI-03 | 탭 닫기 (개별) | UT-005~UT-007, UT-011 | :white_check_mark: |
| FR-MDI-03-A | 탭 닫기 (전체) | UT-012 | :white_check_mark: |
| FR-MDI-03-B | 탭 닫기 (다른 탭) | UT-013 | :white_check_mark: |
| FR-MDI-04 | 화면 상태 유지 | UT-008 | :white_check_mark: |
| FR-MDI-05 | 최대 탭 개수 제한 | UT-009 | :white_check_mark: |

### 3.2 비즈니스 규칙 커버리지

| 규칙 ID | 규칙 설명 | 테스트 ID | 결과 |
|---------|----------|-----------|------|
| BR-MDI-01 | 동일 ID 탭 중복 열기 불가 | UT-004 | :white_check_mark: |
| BR-MDI-02 | 최대 탭 개수 제한 | UT-009 | :white_check_mark: |
| BR-MDI-03 | closable=false 탭 닫기 불가 | UT-010 | :white_check_mark: |
| BR-MDI-04 | 탭 전환 시 상태 유지 | UT-008 | :white_check_mark: |

---

## 4. 주요 기술적 결정사항

### 4.1 아키텍처 결정

1. **상태 관리: React Context + useReducer**
   - 배경: MDI 상태가 여러 컴포넌트에서 공유됨
   - 선택: React Context API + useReducer
   - 대안: Zustand, Redux Toolkit
   - 근거: 외부 의존성 최소화, React 내장 기능 활용, TRD 권장

2. **액션 패턴: Reducer 기반**
   - 배경: 상태 변경 로직이 복잡 (탭 열기/닫기/전환)
   - 선택: useReducer로 액션 기반 상태 관리
   - 근거: 예측 가능한 상태 변경, 테스트 용이성

### 4.2 구현 패턴

- **디자인 패턴**: Provider 패턴, Custom Hook 패턴
- **에러 핸들링**: console.warn으로 개발 시 경고, 콜백으로 UI 피드백

---

## 5. 알려진 이슈 및 제약사항

### 5.1 기술적 제약사항

- **SSR 제약**: Context는 클라이언트에서만 동작 (`'use client'` 지시어 필수)
- **세션 간 상태**: 새로고침 시 탭 상태 초기화 (sessionStorage 영속성은 선택적 확장)

### 5.2 향후 개선 필요 사항

- sessionStorage 영속성 구현 (새로고침 시 탭 상태 복원)
- 탭 순서 변경 함수 (`reorderTabs`) - TSK-02-03에서 구현

---

## 6. 구현 완료 체크리스트

### 6.1 Frontend 체크리스트

- [x] MDI Context/Provider 구현 완료
- [x] 타입 정의 완료
- [x] 모든 API 함수 구현 (openTab, closeTab, closeAllTabs, closeOtherTabs, setActiveTab, getTab, getTabs)
- [x] 보안 검증 로직 구현 (path 검증, 권한 검증 인터페이스)
- [x] TDD 테스트 작성 및 통과 (커버리지 89.74%)
- [x] E2E 테스트 작성 (활성화된 테스트 통과)
- [x] TypeScript 컴파일 에러 없음

### 6.2 통합 체크리스트

- [x] 설계서 요구사항 충족 확인
- [x] 요구사항 커버리지 100% 달성 (FR/BR → 테스트 ID)
- [x] 테스트 결과서 작성 완료
- [x] 구현 보고서 작성 완료

---

## 7. 참고 자료

### 7.1 관련 문서

- 설계서: `010-design.md`
- 추적성 매트릭스: `025-traceability-matrix.md`
- 테스트 명세서: `026-test-specification.md`
- TDD 테스트 결과서: `070-tdd-test-results.md`
- E2E 테스트 결과서: `070-e2e-test-results.md`

### 7.2 소스 코드 위치

| 구분 | 경로 |
|------|------|
| 타입 정의 | `lib/mdi/types.ts` |
| Context/Provider | `lib/mdi/context.tsx` |
| 모듈 내보내기 | `lib/mdi/index.ts` |
| 단위 테스트 | `lib/mdi/__tests__/context.spec.tsx` |
| E2E 테스트 | `tests/e2e/mdi.spec.ts` |

---

## 8. 다음 단계

### 8.1 후속 Task

| Task ID | 내용 | 의존성 |
|---------|------|--------|
| TSK-02-02 | 탭 바 컴포넌트 | TSK-02-01 |
| TSK-02-03 | 탭 드래그 앤 드롭 | TSK-02-02 |
| TSK-02-04 | 탭 컨텍스트 메뉴 | TSK-02-02 |
| TSK-02-05 | MDI 컨텐츠 영역 | TSK-02-01, TSK-02-02 |

### 8.2 다음 워크플로우

- `/wf:verify TSK-02-01` - 통합테스트 시작

---

## 변경 이력

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0 | 2026-01-21 | Claude | 최초 작성 |

---

<!--
Task: TSK-02-01 MDI 상태 관리
Created: 2026-01-21
Author: Claude
-->
