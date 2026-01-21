# TSK-06-05 설계 리뷰 결과

## 리뷰 정보

| 항목 | 내용 |
|------|------|
| Task ID | TSK-06-05 |
| Task명 | 팝업(모달) 화면 템플릿 |
| 리뷰어 | claude-1 |
| 리뷰 일자 | 2026-01-21 |
| 리뷰 대상 문서 | 010-design.md, 025-traceability-matrix.md, 026-test-specification.md |

---

## 리뷰 요약

### 검증 결과

| 검증 영역 | 평가 | 비고 |
|----------|------|------|
| 문서 완전성 | WARN | 보안 요구사항 섹션 누락 |
| 요구사항 추적성 | PASS | FR 5, BR 3 매핑 완료 |
| 아키텍처 | WARN | 3건 개선 권장 |
| 보안 | WARN | 2건 Medium 이슈 |
| 테스트 가능성 | PASS | UT 13, E2E 6, TC 9 정의 완료 |

### 이슈 분포

| 우선순위 | 건수 |
|----------|------|
| P1 (Critical) | 0 |
| P2 (High) | 3 |
| P3 (Medium) | 6 |
| P4 (Low) | 6 |
| P5 (Info) | 3 |
| **합계** | **18** |

---

## 상세 이슈 목록

### P2 (High) - 필수 반영

#### ARCH-001: Props 인터페이스 일관성 부족

| 항목 | 내용 |
|------|------|
| **ID** | ARCH-001 |
| **심각도** | High |
| **우선순위** | P2 |
| **카테고리** | design-pattern, consistency |
| **영향 섹션** | 010-design.md 섹션 7.1 Props 인터페이스 |

**설명:**
TSK-06-01(ListTemplate), TSK-06-02(DetailTemplate)의 Props 인터페이스는 공통 패턴을 따르고 있으나, SelectPopupTemplate은 다음 항목들이 누락되어 일관성이 부족:
- `permissions` 속성 부재 - 다른 템플릿은 권한 기반 버튼 제어를 지원
- `error` 상태 처리 인터페이스 부재

**권장사항:**
```typescript
interface SelectPopupTemplateProps<T extends Record<string, unknown>> {
  // ... 기존 props

  // 권한 관리 추가
  permissions?: {
    canSelect?: boolean    // 선택 권한 (기본: true)
  }

  // 에러 상태 추가
  error?: {
    message?: string
    onRetry?: () => void
  }
}
```

---

#### ARCH-004: 검색 필터링 전략 미정의

| 항목 | 내용 |
|------|------|
| **ID** | ARCH-004 |
| **심각도** | High |
| **우선순위** | P2 |
| **카테고리** | architecture, scalability |
| **영향 섹션** | 010-design.md 섹션 7.1 |

**설명:**
TSK-06-01(ListTemplate)에서는 `sortMode: 'client' | 'server'`를 명시하여 클라이언트/서버 정렬 전략을 구분. SelectPopupTemplate에서 `onSearch` 콜백이 있으나, 검색이 클라이언트 측 필터링인지 서버 측 검색인지 명확하지 않음.

대량 데이터(1000건 이상) 선택 시 클라이언트 필터링은 성능 문제를 야기할 수 있음.

**권장사항:**
```typescript
interface SelectPopupTemplateProps<T> {
  // 검색 모드
  searchMode?: 'client' | 'server'  // 기본값: 'client'

  // 서버 검색 시 디바운스 설정
  searchDebounceMs?: number  // 기본값: 300

  // 클라이언트 검색 시 필터링 대상 필드
  searchFields?: (keyof T)[]  // 미지정 시 모든 문자열 필드 검색
}
```

---

#### QA-001: 보안 요구사항 섹션 누락

| 항목 | 내용 |
|------|------|
| **ID** | QA-001 / ARCH-005 |
| **심각도** | High |
| **우선순위** | P2 |
| **카테고리** | completeness, security |
| **영향 섹션** | 010-design.md (신규 섹션 필요) |

**설명:**
TSK-06-01(목록 화면 템플릿)에는 보안 요구사항 섹션(8.3)이 포함되어 있으나, TSK-06-05 설계 문서에는 누락. 팝업 템플릿도 검색 기능이 있으므로 입력값 Sanitization, XSS 방어 가이드라인 등 보안 고려사항이 필요함.

**권장사항:**
010-design.md에 보안 요구사항 섹션 추가:

```markdown
## X. 보안 요구사항

### X.1 XSS 방어 가이드라인 (SEC-002)

**컬럼 render 함수 사용 시 주의사항:**

| 패턴 | 안전성 | 예시 |
|------|--------|------|
| React 기본 텍스트 | 안전 | `render: (text) => <span>{text}</span>` |
| dangerouslySetInnerHTML | 위험 (금지) | `render: (text) => <div dangerouslySetInnerHTML={{...}} />` |

### X.2 검색 입력값 Sanitization (SEC-001)

- 검색어 최대 길이 제한: 100자
- 제어 문자 제거
- 서버 검색 시 SQL Injection 방지 (서버 측)
```

---

### P3 (Medium) - 권장 반영

#### ARCH-002: Server/Client Component 구분 명시 누락

| 항목 | 내용 |
|------|------|
| **ID** | ARCH-002 / QA-002 |
| **심각도** | Medium |
| **우선순위** | P3 |
| **카테고리** | architecture, next.js |
| **영향 섹션** | 010-design.md 섹션 11 구현 범위 |

**설명:**
TRD에서 React 19 / Next.js 16 환경에서 `'use client'` 지침을 명시. TSK-06-01 설계 문서에서는 Server/Client Component 구분을 명시하고 있으나, TSK-06-05에는 해당 내용이 없음.

**권장사항:**
다음 섹션 추가:
```markdown
### 11.x Server/Client Component 구분

| 컴포넌트 | 타입 | 사유 |
|----------|------|------|
| SelectPopupTemplate | Client Component | Ant Design Modal/Table 사용, 상태 관리 |
| 부모 페이지 | Server Component (권장) | 초기 데이터 페칭 |
```

---

#### ARCH-003: 단일 선택 모드에서의 UX 명확화 필요

| 항목 | 내용 |
|------|------|
| **ID** | ARCH-003 |
| **심각도** | Medium |
| **우선순위** | P3 |
| **카테고리** | design-pattern, ux |
| **영향 섹션** | 010-design.md 섹션 4, 6, 8 |

**설명:**
BR-01에서 "단일 선택 시 행 클릭으로 선택"이라고 정의되어 있으나, 두 가지 UX 패턴이 혼재될 수 있음:
1. **즉시 선택 패턴**: 행 클릭 즉시 선택 완료 및 팝업 닫힘
2. **확인 필요 패턴**: 행 클릭으로 선택 후, "선택완료" 버튼 클릭 필요

와이어프레임에는 "선택완료" 버튼이 있어 패턴 2로 보이나, 명확히 해야 함.

**권장사항:**
```typescript
interface SelectPopupTemplateProps<T> {
  // 단일 선택 시 즉시 완료 여부
  selectOnRowClick?: boolean  // 기본값: false (확인 버튼 필요)
}
```

---

#### QA-003: Props 인터페이스 타입 정의 불완전

| 항목 | 내용 |
|------|------|
| **ID** | QA-003 / ARCH-009 |
| **심각도** | Medium |
| **우선순위** | P3 |
| **카테고리** | completeness, type-safety |
| **영향 섹션** | 010-design.md 섹션 7.1 |

**설명:**
Props 인터페이스에서 `ColumnType<T>`와 `TablePaginationConfig` 타입의 출처(Ant Design)가 명시되지 않음. 또한 Generic 타입 `T`에 대한 제약 조건이 없음. TSK-06-01에서는 `T extends Record<string, unknown>`으로 명시함.

**권장사항:**
```typescript
import type { ColumnType, TablePaginationConfig } from 'antd/es/table'

interface SelectPopupTemplateProps<T extends Record<string, unknown>> {
  // ...
}
```

---

#### QA-004: 파일 구조 명세 누락

| 항목 | 내용 |
|------|------|
| **ID** | QA-004 |
| **심각도** | Medium |
| **우선순위** | P3 |
| **카테고리** | completeness |
| **영향 섹션** | 010-design.md 섹션 11 |

**설명:**
TSK-06-01에는 11.1 파일 구조가 상세히 명시되어 있으나, TSK-06-05에는 단순히 "components/templates/SelectPopupTemplate.tsx 신규"만 언급됨.

**권장사항:**
```markdown
### 11.x 파일 구조

```
components/templates/SelectPopupTemplate/
├── index.tsx                 # 메인 컴포넌트
├── types.ts                  # Props 인터페이스
└── SelectPopupTemplate.spec.tsx  # 단위 테스트
```
```

---

#### ARCH-007: 컴포넌트 합성(Composition) 패턴 개선 필요

| 항목 | 내용 |
|------|------|
| **ID** | ARCH-007 |
| **심각도** | Medium |
| **우선순위** | P3 |
| **카테고리** | extensibility, design-pattern |
| **영향 섹션** | 010-design.md 섹션 7.1 |

**설명:**
현재 설계는 모든 기능을 Props로 제어하는 설정 기반(Configuration-based) 패턴. 복잡한 커스터마이징(예: 검색 영역에 추가 필터)이 어려움.

**권장사항:**
슬롯 기반 커스터마이징 지원:
```typescript
interface SelectPopupTemplateProps<T> {
  // 슬롯 기반 커스터마이징
  searchExtra?: ReactNode     // 검색 영역 추가 요소
  tableHeader?: ReactNode     // 테이블 상단 추가 요소
  footer?: ReactNode | ((selectedRows: T[]) => ReactNode)  // 커스텀 푸터
}
```

---

#### ARCH-008: 페이지네이션 상태 관리 명확화 필요

| 항목 | 내용 |
|------|------|
| **ID** | ARCH-008 |
| **심각도** | Medium |
| **우선순위** | P3 |
| **카테고리** | state-management |
| **영향 섹션** | 010-design.md 섹션 7.1 |

**설명:**
`pagination?: TablePaginationConfig` prop이 정의되어 있으나, 페이지네이션 상태가 Controlled인지 Uncontrolled인지 명확하지 않음.

**권장사항:**
```typescript
interface SelectPopupTemplateProps<T> {
  // 페이지네이션 (서버 모드 시 controlled)
  pagination?: TablePaginationConfig | false
  onPaginationChange?: (page: number, pageSize: number) => void
  total?: number  // 서버 페이지네이션 시 전체 건수
}
```

---

### P4 (Low) - 선택적 반영

#### SEC-003: 선택 데이터 검증 미정의

| 항목 | 내용 |
|------|------|
| **ID** | SEC-003 |
| **심각도** | Low |
| **우선순위** | P4 |
| **카테고리** | validation |
| **영향 섹션** | 010-design.md 섹션 7.1 |

**설명:**
`onSelect` 콜백으로 선택된 행 데이터가 부모 컴포넌트로 전달되는데, 전달되는 데이터의 무결성 검증 방안이 명시되지 않음.

**권장사항:**
- 선택 개수 제한 옵션 고려 (`maxSelection?: number`)
- 부모 컴포넌트에서 받은 데이터 재검증 권장 문구 추가

---

#### SEC-004: 권한 기반 접근 제어 미정의

| 항목 | 내용 |
|------|------|
| **ID** | SEC-004 |
| **심각도** | Low |
| **우선순위** | P4 |
| **카테고리** | authorization |
| **영향 섹션** | 010-design.md |

**설명:**
팝업을 통해 선택된 데이터가 부모 화면에서 중요한 작업(등록, 수정 등)에 사용될 수 있으나, 해당 데이터에 대한 접근 권한 검증 메커니즘이 설계에 포함되지 않음.

**권장사항:**
- 팝업 표시 전 데이터 접근 권한 검증은 부모 컴포넌트 책임임을 명시
- 서버 측 권한 검증 필수임을 강조하는 보안 요구사항 섹션 추가

---

#### QA-005: 검색 디바운스 구현 상세 누락

| 항목 | 내용 |
|------|------|
| **ID** | QA-005 |
| **심각도** | Low |
| **우선순위** | P4 |
| **카테고리** | completeness |
| **영향 섹션** | 010-design.md 섹션 6.1 |

**설명:**
테스트 명세서 UT-005에 "검색 디바운스" 테스트가 정의되어 있으나, 010-design.md에 디바운스 동작에 대한 상세 명세(지연 시간, 구현 방식)가 없음.

**권장사항:**
010-design.md 섹션 6.1 인터랙션 설계에 디바운스 지연 시간(예: 300ms) 명시.

---

#### QA-006: 전체 선택 체크박스 data-testid 불일치

| 항목 | 내용 |
|------|------|
| **ID** | QA-006 |
| **심각도** | Low |
| **우선순위** | P4 |
| **카테고리** | consistency |
| **영향 섹션** | 026-test-specification.md 섹션 3.2 E2E-004 |

**설명:**
테스트 명세서 6.1에 `select-all-checkbox`가 정의되어 있으나, E2E 테스트 코드(E2E-004)에서는 `.ant-checkbox-input`으로 접근하고 있어 data-testid 활용이 일관되지 않음.

**권장사항:**
E2E-004 테스트 코드에서 `[data-testid="select-all-checkbox"]` 셀렉터 사용으로 변경 권장.

---

#### QA-007: UT-003, UT-004 등 테스트 코드 상세 누락

| 항목 | 내용 |
|------|------|
| **ID** | QA-007 |
| **심각도** | Low |
| **우선순위** | P4 |
| **카테고리** | completeness |
| **영향 섹션** | 026-test-specification.md 섹션 2.2 |

**설명:**
UT-001, UT-002, UT-006, UT-007, UT-009, UT-012, UT-013에 대해서는 상세 코드 예시가 있으나, UT-003, UT-004, UT-005, UT-008, UT-010, UT-011에 대한 상세 코드가 없음.

**권장사항:**
모든 단위 테스트에 대한 코드 예시 추가 또는 "상세 구현 시 작성" 명시 권장.

---

#### QA-008: 매뉴얼 테스트 TC-004 비즈니스 규칙 매핑 오류

| 항목 | 내용 |
|------|------|
| **ID** | QA-008 |
| **심각도** | Low |
| **우선순위** | P4 |
| **카테고리** | traceability |
| **영향 섹션** | 025-traceability-matrix.md 섹션 3 |

**설명:**
추적성 매트릭스에서 TC-004(값 전달)가 BR-003(선택 없이 확인 불가)과 매핑되어 있으나, TC-004의 목적은 "값 전달"이므로 FR-004와의 매핑이 더 적절함.

**권장사항:**
추적성 매트릭스 TC-004 행의 "검증 대상 비즈니스 규칙"을 재검토하여 정확한 매핑 수행.

---

### P5 (Info) - 참고 사항

#### SEC-005: 민감 데이터 노출 고려 미흡

| 항목 | 내용 |
|------|------|
| **ID** | SEC-005 |
| **심각도** | Info |
| **우선순위** | P5 |
| **카테고리** | data-exposure |
| **영향 섹션** | 010-design.md 섹션 7.1 |

**설명:**
팝업을 통해 참조 데이터(담당자, 품목 등)를 선택하는 시나리오에서, `dataSource`에 민감 정보가 포함될 수 있음. 컬럼 정의 시 불필요한 민감 정보 노출을 방지하는 가이드라인이 필요함.

**권장사항:**
- 팝업에 표시할 컬럼은 필요 최소한의 정보만 포함하도록 가이드라인 추가
- 민감 정보 필드는 마스킹 처리 권장

---

#### QA-009: 에러 복구 방법 상세 부족

| 항목 | 내용 |
|------|------|
| **ID** | QA-009 |
| **심각도** | Info |
| **우선순위** | P5 |
| **카테고리** | completeness |
| **영향 섹션** | 010-design.md 섹션 9 |

**설명:**
에러 처리에서 "조회 실패" 시 "재시도 버튼"이 언급되나, 재시도 버튼의 위치, 동작 방식에 대한 상세가 없음.

---

#### QA-010: 설계 문서 상태 "작성중" 미갱신

| 항목 | 내용 |
|------|------|
| **ID** | QA-010 |
| **심각도** | Info |
| **우선순위** | P5 |
| **카테고리** | consistency |
| **영향 섹션** | 010-design.md 문서 정보 |

**설명:**
문서 정보에 상태가 "작성중"으로 되어 있으나, 체크리스트에서는 모든 설계 항목이 완료로 표시됨. 문서 상태와 체크리스트 간 불일치.

---

## 긍정적 평가 사항

1. **SOLID - Single Responsibility**: 선택형 팝업이라는 단일 책임에 집중한 설계
2. **Controlled Component 패턴**: `open`, `selectedKeys` 등 상태를 부모에서 제어하는 올바른 패턴 적용
3. **TypeScript Generics 활용**: `<T>` 제네릭으로 다양한 데이터 타입 지원
4. **Ant Design 통합**: TRD의 "Ant Design 컴포넌트 우선 사용" 원칙 준수
5. **명확한 유즈케이스**: UC-01~UC-05로 사용자 시나리오 정의
6. **요구사항 추적성**: FR-001 ~ FR-005 및 BR-001 ~ BR-003에 대한 추적성 매트릭스 100% 매핑 완료
7. **테스트 커버리지**: UT-001 ~ UT-013 단위 테스트 및 E2E-001 ~ E2E-006 E2E 테스트 정의 완료
8. **data-testid 목록**: 체계적으로 정의됨
9. **와이어프레임**: 명확하게 작성됨

---

## 결론

TSK-06-05 팝업(모달) 화면 템플릿 설계는 전반적으로 잘 작성되었으며, 핵심 기능과 요구사항이 명확히 정의되어 있습니다. 그러나 TSK-06-01(목록 화면 템플릿) 리뷰에서 보강된 항목들(보안 요구사항, Server/Client Component 구분 등)이 이 문서에는 반영되지 않아 일관성 측면에서 보완이 필요합니다.

**P2 (High) 우선순위 이슈 3건**은 구현 전 필수 반영이 권장되며, **P3 (Medium) 이슈 6건**은 구현 초기에 반영하는 것이 좋습니다.

---

---

## 리뷰 적용 결과

**적용 일자:** 2026-01-21

### 적용 판단 요약

| 우선순위 | 총 건수 | 적용 | 조정 적용 | 보류 |
|----------|--------|------|----------|------|
| P2 (High) | 3 | 3 | 0 | 0 |
| P3 (Medium) | 6 | 6 | 0 | 0 |
| P4 (Low) | 6 | 2 | 0 | 4 |
| P5 (Info) | 3 | 1 | 0 | 2 |
| **합계** | **18** | **12** | **0** | **6** |

### 상세 적용 내역

#### P2 (High) - 모두 적용

| ID | 제목 | 판단 | 적용 내용 |
|----|------|------|----------|
| ARCH-001 | Props 인터페이스 일관성 부족 | ✅ 적용 | `permissions`, `error` 속성 추가, Generic 제약 `T extends Record<string, unknown>` 적용 |
| ARCH-004 | 검색 필터링 전략 미정의 | ✅ 적용 | `searchMode`, `searchDebounceMs`, `searchFields` prop 추가 |
| QA-001 | 보안 요구사항 섹션 누락 | ✅ 적용 | 섹션 7 보안 요구사항 신규 추가 (SEC-001, SEC-002, 데이터 노출 제한) |

#### P3 (Medium) - 모두 적용

| ID | 제목 | 판단 | 적용 내용 |
|----|------|------|----------|
| ARCH-002 | Server/Client Component 구분 | ✅ 적용 | 11.2 Server/Client Component 구분 섹션 추가 |
| ARCH-003 | 단일 선택 모드 UX 명확화 | ✅ 적용 | `selectOnRowClick` prop 추가 (기본값: false) |
| QA-003 | Props 인터페이스 타입 정의 불완전 | ✅ 적용 | import 문 명시, Generic 제약 조건 추가 |
| QA-004 | 파일 구조 명세 누락 | ✅ 적용 | 11.1 파일 구조 섹션 추가 |
| ARCH-007 | 컴포넌트 합성 패턴 개선 | ✅ 적용 | `searchExtra`, `tableHeader`, `footer` 슬롯 prop 추가 |
| ARCH-008 | 페이지네이션 상태 관리 명확화 | ✅ 적용 | `onPaginationChange`, `total` prop 추가 |

#### P4 (Low) - 2건 적용, 4건 보류

| ID | 제목 | 판단 | 사유 |
|----|------|------|------|
| QA-005 | 검색 디바운스 구현 상세 누락 | ✅ 적용 | 6.3 검색 디바운스 섹션 추가 |
| QA-006 | 전체 선택 체크박스 data-testid 불일치 | ✅ 적용 | E2E-004 테스트 코드에 data-testid 활용 수정 |
| QA-008 | TC-004 비즈니스 규칙 매핑 오류 | ✅ 적용 | 추적성 매트릭스 TC-004 BR 매핑 수정 |
| SEC-003 | 선택 데이터 검증 미정의 | ⏸️ 보류 | 검증 책임은 부모 컴포넌트에 있으며, 보안 가이드라인에 명시 완료 |
| SEC-004 | 권한 기반 접근 제어 미정의 | ⏸️ 보류 | 7.3 데이터 노출 제한 섹션에서 권한 검증 책임 명시 완료 |
| QA-007 | UT-003~011 테스트 코드 상세 누락 | ⏸️ 보류 | 구현 단계(/wf:build)에서 작성 예정 |

#### P5 (Info) - 1건 적용, 2건 보류

| ID | 제목 | 판단 | 사유 |
|----|------|------|------|
| SEC-005 | 민감 데이터 노출 고려 | ✅ 적용 | 7.3 데이터 노출 제한 섹션에 가이드라인 추가 |
| QA-009 | 에러 복구 방법 상세 부족 | ⏸️ 보류 | 재시도 버튼 위치를 에러 처리 테이블에 명시 완료 |
| QA-010 | 설계 문서 상태 미갱신 | ✅ 적용 | 문서 상태를 "리뷰반영"으로 변경 |

### 수정된 문서 목록

| 문서 | 수정 내용 |
|------|----------|
| 010-design.md | Props 인터페이스 확장, 보안 요구사항 섹션 추가, 파일 구조/Server/Client 구분 추가, 문서 상태 변경, 디바운스 명세 추가 |
| 025-traceability-matrix.md | TC-004 비즈니스 규칙 매핑 수정 |
| 026-test-specification.md | E2E-004 테스트 코드 data-testid 활용 수정 |

---

## 변경 이력

| 버전 | 일자 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0 | 2026-01-21 | claude-1 | 최초 작성 |
| 1.1 | 2026-01-21 | Claude | 리뷰 적용 결과 섹션 추가 |
