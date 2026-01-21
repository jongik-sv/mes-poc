# TSK-06-01 설계 리뷰 결과서

**Template Version:** 1.0.0 - **Last Updated:** 2026-01-21

---

## 0. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| Task ID | TSK-06-01 |
| Task명 | 목록(조회) 화면 템플릿 |
| 리뷰 일자 | 2026-01-21 |
| 리뷰어 | claude-1 |
| 설계 문서 버전 | 010-design.md v2.0 |
| 추적 매트릭스 버전 | 025-traceability-matrix.md v1.0 |
| 테스트 명세 버전 | 026-test-specification.md v1.0 |

---

## 1. 리뷰 요약

### 1.1 검증 대상 문서

| 문서 | 경로 | 상태 |
|------|------|------|
| 010-design.md | `.orchay/projects/mes-portal/tasks/TSK-06-01/` | ✅ 검토 완료 |
| 025-traceability-matrix.md | `.orchay/projects/mes-portal/tasks/TSK-06-01/` | ✅ 검토 완료 |
| 026-test-specification.md | `.orchay/projects/mes-portal/tasks/TSK-06-01/` | ✅ 검토 완료 |
| 011-ui-design.md | `.orchay/projects/mes-portal/tasks/TSK-06-01/` | ✅ 검토 완료 |
| prd.md | `.orchay/projects/mes-portal/` | ✅ 참조 완료 |
| trd.md | `.orchay/projects/mes-portal/` | ✅ 참조 완료 |

### 1.2 검증 영역별 평가

| 검증 영역 | 평가 | 비고 |
|----------|------|------|
| 문서 완전성 | PASS | 필수 섹션 모두 포함 |
| 요구사항 추적성 | PASS | FR 5, BR 3 매핑 완료 |
| 아키텍처 | WARN | 2건 개선 권장 |
| 보안 | FAIL | 2건 필수 수정, 7건 권장 |
| 테스트 가능성 | WARN | UT 10, E2E 6 정의 (일부 상세 누락) |

### 1.3 이슈 분포

| 심각도 | Critical | High | Medium | Low | Info | 합계 |
|--------|----------|------|--------|-----|------|------|
| 건수 | 1 | 4 | 5 | 7 | 6 | 23 |

| 우선순위 | P1 | P2 | P3 | P4 | P5 | 합계 |
|----------|-----|-----|-----|-----|-----|------|
| 건수 | 3 | 4 | 4 | 8 | 4 | 23 |

---

## 2. 아키텍처 리뷰 결과

### 2.1 SOLID 원칙 준수

| 원칙 | 평가 | 심각도 | 우선순위 |
|------|------|--------|----------|
| Single Responsibility | PASS | Info | P4 |
| Open/Closed | PASS | Info | P4 |
| Liskov Substitution | WARN | Medium | P3 |
| Interface Segregation | WARN | Low | P4 |
| Dependency Inversion | PASS | Info | P5 |

#### ARC-001: SearchFieldDefinition 타입 설계 개선 필요

| 항목 | 내용 |
|------|------|
| **평가** | WARN |
| **심각도** | Medium |
| **우선순위** | P3 |
| **발견 사항** | SearchFieldDefinition 인터페이스가 모든 필드 타입의 속성을 하나의 인터페이스에 포함. `showPresets`, `startParamName`, `endParamName`은 `dateRange` 타입에서만 의미 있음. |
| **위치** | 010-design.md 섹션 7.2 |

**개선 권장:**
```typescript
// Discriminated Union 패턴 사용
type SearchFieldDefinition =
  | TextSearchField
  | SelectSearchField
  | DateRangeSearchField
  | ...;

interface DateRangeSearchField {
  type: 'dateRange';
  name: string;
  showPresets?: boolean;
  startParamName?: string;
  endParamName?: string;
}
```

#### ARC-002: Server/Client Component 구분 명시 필요

| 항목 | 내용 |
|------|------|
| **평가** | WARN |
| **심각도** | Low |
| **우선순위** | P4 |
| **발견 사항** | TRD에서 React 19 / Next.js 16 환경에서 `'use client'` 지침을 명시하고 있으나, 설계 문서에서는 Server/Client Component 구분이 언급되지 않음. |
| **위치** | 010-design.md 섹션 11 |

**개선 권장:**
```markdown
### 11.6 Server/Client Component 구분
- ListTemplate, SearchForm, Toolbar는 'use client' 지시어 필요
- Ant Design 컴포넌트 사용으로 인한 클라이언트 렌더링
- 데이터 페칭은 부모 Server Component에서 수행 권장
```

### 2.2 컴포넌트 분할 및 확장성

| 항목 | 평가 | 비고 |
|------|------|------|
| 컴포넌트 분할 | PASS | ListTemplate, SearchForm, Toolbar 명확히 분리 |
| 확장 포인트 | PASS | searchExtra, toolbarExtra, transformValue 등 제공 |
| DataTable 의존 | PASS | TSK-05-04와 명확한 의존 관계 |
| 기술 스택 호환성 | PASS | Ant Design 6.x, React 19 호환 확인 |

---

## 3. 보안 리뷰 결과

### 3.1 Critical/High 이슈

#### SEC-001: onDelete 콜백 권한 확인 누락

| 항목 | 내용 |
|------|------|
| **평가** | FAIL |
| **심각도** | Critical |
| **우선순위** | P1 |
| **발견 사항** | UC-08 (선택 항목 삭제) 기본 흐름에서 권한 확인 단계가 완전 누락. 삭제 권한이 없는 사용자가 삭제 버튼을 클릭할 수 있는 상황에 대한 고려 없음. |
| **OWASP** | A01: Broken Access Control |
| **위치** | 010-design.md 섹션 3.2 UC-08 |

**필수 개선 사항:**
1. Props에 권한 관련 속성 추가:
   ```typescript
   permissions?: {
     canAdd?: boolean;
     canDelete?: boolean;
     canView?: boolean;
   };
   ```
2. UC-08 흐름에 권한 확인 단계 추가
3. 비즈니스 규칙 추가: "BR-08: 삭제 작업 전 사용자 권한 검증 필수"

#### SEC-002: API 파라미터 Sanitization 부재

| 항목 | 내용 |
|------|------|
| **평가** | FAIL |
| **심각도** | High |
| **우선순위** | P1 |
| **발견 사항** | transformSearchParams 함수에서 입력값 sanitization 로직이 완전 부재. text 타입 필드의 경우 사용자 입력이 그대로 API 파라미터로 전달됨. |
| **OWASP** | A03: Injection |
| **위치** | 010-design.md 섹션 7.3 |

**필수 개선 사항:**
```typescript
function sanitizeSearchValue(value: unknown, fieldType: SearchFieldType): unknown {
  if (typeof value === 'string') {
    let sanitized = value.trim();
    sanitized = sanitized.substring(0, MAX_SEARCH_LENGTH);
    // 특수문자 이스케이프 (필요시)
    return sanitized;
  }
  return value;
}
```

#### SEC-003: 서버 측 권한 검증 요구사항 누락

| 항목 | 내용 |
|------|------|
| **평가** | WARN |
| **심각도** | High |
| **우선순위** | P1 |
| **발견 사항** | 서버 측 권한 검증에 대한 요구사항 명세가 없음. 클라이언트 측 권한 체크만으로는 API 직접 호출 공격 방어 불가. |
| **위치** | 010-design.md 전반 |

**개선 권장:**
보안 요구사항 섹션 신설:
```markdown
## 보안 요구사항
- SR-01: 삭제 API는 서버 측에서 세션 기반 사용자 인증 필수
- SR-02: 삭제 API는 서버 측에서 역할 기반 권한 검증 필수
- SR-03: 삭제 대상 리소스에 대한 소유권/접근권 검증 필수
```

### 3.2 Medium/Low 이슈

#### SEC-004: 검색 조건 입력값 검증 부재

| 항목 | 내용 |
|------|------|
| **평가** | WARN |
| **심각도** | Medium |
| **우선순위** | P2 |
| **발견 사항** | 필드 타입별 기본 검증 규칙 미정의. 최대 길이, 허용 문자 패턴 등 입력 검증 규칙 부재. |
| **OWASP** | A03: Injection |
| **위치** | 010-design.md 섹션 7.2 |

#### SEC-005: XSS 방어 가이드라인 부재

| 항목 | 내용 |
|------|------|
| **평가** | WARN |
| **심각도** | Medium |
| **우선순위** | P2 |
| **발견 사항** | DataTable에 표시되는 dataSource 데이터의 XSS 방어 명세 없음. columns render 함수에서 커스텀 HTML 삽입 시 취약점 발생 가능. |
| **OWASP** | A07: XSS |
| **위치** | 010-design.md 섹션 5, 7 |

#### SEC-006: CSRF 방어 요구사항 부재

| 항목 | 내용 |
|------|------|
| **평가** | WARN |
| **심각도** | High |
| **우선순위** | P2 |
| **발견 사항** | 삭제 API 호출 시 CSRF 토큰 처리에 대한 명세 없음. |
| **위치** | 010-design.md 섹션 8 |

#### SEC-007: 민감 데이터 마스킹 미지원

| 항목 | 내용 |
|------|------|
| **평가** | WARN |
| **심각도** | Medium |
| **우선순위** | P3 |
| **발견 사항** | 컬럼 정의에서 민감 데이터 마스킹에 대한 지원 명세 없음. |
| **위치** | 010-design.md 섹션 7.2 |

---

## 4. 품질 리뷰 결과

### 4.1 문서 완전성

| 항목 | 평가 | 비고 |
|------|------|------|
| 개요 섹션 | PASS | 배경, 목적, 범위, 참조 문서 명확 |
| 사용자 분석 | PASS | 5개 사용자 유형, 3개 페르소나 정의 |
| 유즈케이스 | PASS | 9개 UC 다이어그램 및 상세 명세 |
| 화면 설계 | PASS | 와이어프레임, 반응형 설계 포함 |
| Props 인터페이스 | PASS | TypeScript 인터페이스 완전 정의 |
| 에러 처리 | PASS | 4개 에러 상황 및 복구 방법 정의 |

#### QA-001: 체크리스트 상태 불일치

| 항목 | 내용 |
|------|------|
| **평가** | WARN |
| **심각도** | Low |
| **우선순위** | P4 |
| **발견 사항** | 010-design.md 12.2절에서 요구사항 추적 매트릭스/테스트 명세서가 "작성 예정"으로 체크 해제되어 있으나 실제로는 작성 완료됨. |
| **위치** | 010-design.md 섹션 12.2 |

### 4.2 요구사항 추적성

| 항목 | 평가 | 비고 |
|------|------|------|
| PRD 매핑 | PASS | PRD 4.1.1 요구사항 100% 매핑 |
| FR -> 테스트 | PASS | 5개 FR 모두 UT/E2E 매핑 완료 |
| BR -> 테스트 | PASS | 3개 BR 모두 테스트 매핑 완료 |

#### QA-002: 테스트 ID 불일치

| 항목 | 내용 |
|------|------|
| **평가** | WARN |
| **심각도** | High |
| **우선순위** | P2 |
| **발견 사항** | 추적 매트릭스에 UT-006~UT-010이 정의되어 있으나 테스트 명세서 2.1절에는 UT-001~UT-005만 목록에 존재. 상세 시나리오 누락. |
| **위치** | 025-traceability-matrix.md, 026-test-specification.md |

#### QA-003: E2E-006 시나리오 누락

| 항목 | 내용 |
|------|------|
| **평가** | WARN |
| **심각도** | Medium |
| **우선순위** | P3 |
| **발견 사항** | 추적 매트릭스에 E2E-006(BR-003 검증)이 정의되었으나 테스트 명세서 3.1절에 5건만 목록됨. |
| **위치** | 026-test-specification.md 섹션 3.1 |

### 4.3 테스트 가능성

| 항목 | 평가 | 비고 |
|------|------|------|
| data-testid 정의 | PASS | 47개 셀렉터 정의 (026-test-specification.md 섹션 6) |
| 테스트 환경 | PASS | Vitest, Playwright, 브라우저 목록 정의 |
| Fixture 데이터 | PASS | Mock 데이터, Seed 데이터 구체적 정의 |
| 커버리지 목표 | PASS | UT 80%, E2E 100% 시나리오 목표 명시 |

#### QA-004: 설계 문서 내 data-testid 누락

| 항목 | 내용 |
|------|------|
| **평가** | WARN |
| **심각도** | Medium |
| **우선순위** | P3 |
| **발견 사항** | 010-design.md에는 data-testid 정의가 없음. 테스트 명세서에만 존재하여 구현 시 누락 가능성. |
| **위치** | 010-design.md 섹션 5 |

---

## 5. 개선 권장 사항 요약

### 5.1 필수 수정 (P1) - 구현 전 반드시 보완

| ID | 항목 | 조치 사항 |
|----|------|----------|
| SEC-001 | 권한 확인 | Props에 permissions 속성 추가, UC-08에 권한 확인 흐름 추가 |
| SEC-002 | Sanitization | transformSearchParams에 입력값 sanitization 로직 추가 |
| SEC-003 | 서버 보안 | 보안 요구사항 섹션 신설 (SR-01~03) |

### 5.2 권장 수정 (P2) - 구현 초기 보완

| ID | 항목 | 조치 사항 |
|----|------|----------|
| SEC-004 | 입력 검증 | 필드 타입별 기본 검증 규칙 정의 |
| SEC-005 | XSS 방어 | 컬럼 render 함수 사용 가이드라인 추가 |
| SEC-006 | CSRF | CSRF 토큰 처리 요구사항 명시 |
| QA-002 | 테스트 ID | UT-006~010 테스트 시나리오 상세 추가 |

### 5.3 선택 수정 (P3-P5) - 구현 중/후 보완 가능

| ID | 항목 | 조치 사항 | 우선순위 |
|----|------|----------|----------|
| ARC-001 | LSP | SearchFieldDefinition Discriminated Union 패턴 적용 | P3 |
| SEC-007 | 마스킹 | 민감 데이터 마스킹 옵션 추가 | P3 |
| QA-003 | E2E | E2E-006 시나리오 상세 추가 | P3 |
| QA-004 | testid | 설계 문서에 주요 data-testid 명시 | P3 |
| ARC-002 | Component | Server/Client Component 구분 명시 | P4 |
| QA-001 | 체크리스트 | 12.2절 체크리스트 상태 업데이트 | P4 |

---

## 6. 종합 평가

### 6.1 강점

- **PRD 요구사항 충실 반영**: 화면 템플릿, 테이블 기능, 폼 상태 관리 요구사항 100% 매핑
- **상세한 설계 문서**: 9개 유즈케이스, 4개 사용자 시나리오, 완전한 Props 인터페이스
- **확장 가능한 아키텍처**: SOLID 원칙의 SRP, OCP, DIP 잘 적용
- **포괄적인 테스트 준비**: 47개 data-testid, Fixture 데이터, 커버리지 목표 명시

### 6.2 개선 필요 사항

- **보안 요구사항 부족**: 권한 검증, 입력 sanitization, CSRF 방어 등 보안 관련 명세 대부분 누락
- **테스트 문서 일부 불일치**: 추적 매트릭스와 테스트 명세서 간 테스트 ID 불일치

### 6.3 최종 권장

**결론: 조건부 승인**

P1 우선순위 항목(SEC-001, SEC-002, SEC-003) 보완 후 구현 단계 진입을 권장합니다. 보안 관련 설계 보완은 구현 전 필수이며, P2 항목들은 구현 초기에 점진적으로 보완 가능합니다.

---

## 7. 리뷰어 서명

| 역할 | 리뷰어 | 일자 | 서명 |
|------|--------|------|------|
| System Architect | Claude | 2026-01-21 | ✓ |
| Security Engineer | Claude | 2026-01-21 | ✓ |
| Quality Engineer | Claude | 2026-01-21 | ✓ |

---

## 8. 적용 결과

> **적용 일자**: 2026-01-21
> **적용자**: Claude

### 8.1 적용 요약

| 구분 | 건수 | 처리 |
|------|------|------|
| ✅ 적용 | 11건 | 설계 문서에 반영 완료 |
| 📝 조정 적용 | 2건 | 맥락에 맞게 조정하여 반영 |
| ⏸️ 보류 | 4건 | 범위 초과 또는 구현 단계 처리 |
| - Pass | 6건 | 이미 적합 |

### 8.2 적용 상세

#### ✅ 적용 (11건)

| ID | 항목 | 적용 위치 |
|----|------|----------|
| SEC-001 | 권한 인터페이스 | 010-design.md 7.2 Props 인터페이스, UC-08 흐름 |
| SEC-002 | Sanitization | 010-design.md 7.3 변환 로직 |
| SEC-004 | 입력 검증 규칙 | 010-design.md 7.4 필드별 검증 규칙 |
| SEC-005 | XSS 방어 가이드 | 010-design.md 8.3.1 XSS 방어 가이드라인 |
| QA-001 | 체크리스트 상태 | 010-design.md 12.2 연관 문서 작성 |
| QA-002 | 테스트 ID 불일치 | 026-test-specification.md UT-006~010 추가 |
| QA-003 | E2E-006 누락 | 026-test-specification.md E2E-006 추가 |
| QA-004 | data-testid | 010-design.md 11.7 주요 data-testid 정의 |
| ARC-002 | Server/Client 구분 | 010-design.md 11.6 Server/Client Component 구분 |
| BR-008 | 삭제 권한 규칙 | 010-design.md 8.1 비즈니스 규칙 추가 |
| 문서 버전 | 변경 이력 | 010-design.md, 026-test-specification.md, 025-traceability-matrix.md |

#### 📝 조정 적용 (2건)

| ID | 원본 | 조정 내용 | 사유 |
|----|------|----------|------|
| SEC-003 | 서버 보안 요구사항 상세 | 보안 요구사항 섹션 신설 (SR-01~04) | 클라이언트 템플릿이므로 서버 측 검증 요구사항만 명세 |
| SEC-006 | CSRF 토큰 처리 상세 | SR-04로 간략 명시 | 서버 프레임워크 설정에 위임 |

#### ⏸️ 보류 (4건)

| ID | 항목 | 보류 사유 |
|----|------|----------|
| ARC-001 | Discriminated Union | 현재 인터페이스도 타입 안전성 충분, 구현 단계에서 필요시 리팩토링 |
| SEC-007 | 민감 데이터 마스킹 | 범위 초과 - 각 사용 화면에서 columns render로 처리 |
| SOLID-SRP/DIP | Pass 항목 | 이미 적합 판정 |
| ARC 컴포넌트 분할 | Pass 항목 | 이미 적합 판정 |

### 8.3 수정된 문서

| 문서 | 버전 변경 | 주요 변경 |
|------|----------|----------|
| 010-design.md | 2.0 → 2.1 | 권한, 보안, 검증 규칙, Server/Client 구분 추가 |
| 026-test-specification.md | 1.0 → 1.1 | UT-006~010, E2E-006 상세 시나리오 추가 |
| 025-traceability-matrix.md | 1.0 → 1.1 | 관련 문서 참조 업데이트 |

---

## 변경 이력

| 버전 | 일자 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0 | 2026-01-21 | Claude | 최초 작성 - 3개 관점(아키텍처, 보안, 품질) 통합 리뷰 |
| 1.1 | 2026-01-21 | Claude | 적용 결과 섹션 추가 (/wf:apply) |

---

<!--
author: Claude
Review Type: Design Review (wf:review)
Review ID: claude-1
Status: Applied
-->
