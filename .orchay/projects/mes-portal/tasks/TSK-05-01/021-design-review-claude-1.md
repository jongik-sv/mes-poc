# 설계 리뷰 결과 (021-design-review-claude-1.md)

**Task ID**: TSK-05-01
**Task명**: 로딩 및 에러 상태 컴포넌트
**리뷰 일자**: 2026-01-20
**리뷰어**: claude-1

---

## 1. 리뷰 개요

### 1.1 검증 대상 문서

| 문서 | 상태 | 비고 |
|------|------|------|
| 010-design.md | ✅ 존재 | 통합 설계 문서 |
| 025-traceability-matrix.md | ✅ 존재 | 추적성 매트릭스 |
| 026-test-specification.md | ✅ 존재 | 테스트 명세 |

### 1.2 리뷰 결과 요약

| 검증 영역 | 평가 | 비고 |
|----------|------|------|
| 문서 완전성 | WARN | 4건 개선 필요 |
| 요구사항 추적성 | WARN | 5건 불일치 |
| 아키텍처 | WARN | 10건 개선 권장 |
| 보안 | WARN | 8건 보안 강화 필요 |
| 테스트 가능성 | WARN | 4건 수정 필요 |

### 1.3 이슈 분포

| 심각도 | Architecture | Security | Quality | 합계 |
|--------|--------------|----------|---------|------|
| Critical | 0 | 0 | 1 | 1 |
| High | 1 | 1 | 5 | 7 |
| Medium | 5 | 4 | 6 | 15 |
| Low | 2 | 2 | 2 | 6 |
| Info | 2 | 1 | 1 | 4 |
| **합계** | **10** | **8** | **15** | **33** |

---

## 2. 이슈 목록

### 2.1 Critical (구현 전 필수 수정)

| ID | 영역 | 우선순위 | 설명 |
|----|------|----------|------|
| QA-005 | 추적성 | P1 | 추적성 매트릭스와 테스트 명세서의 단위 테스트 ID 불일치 (UT-001~019 vs UT-001~023) |

**상세**:
- 추적성 매트릭스: UT-001 ~ UT-019 (19개)
- 테스트 명세서: UT-001 ~ UT-023 (23개)
- UT-020 ~ UT-023 (403 렌더링, 네트워크 에러, 재시도 버튼, 홈으로 버튼)이 누락됨

**권장 조치**:
- 025-traceability-matrix.md 섹션 1 및 3에 UT-020 ~ UT-023 추가
- 각 테스트의 요구사항 매핑 완료 (FR-011, FR-010 등)

---

### 2.2 High (다음 단계 전 수정 권장)

| ID | 영역 | 우선순위 | 설명 |
|----|------|----------|------|
| ARCH-002 | 확장성 | P1 | ErrorBoundary와 ErrorPage 책임 분리 불명확 |
| SEC-001 | 로깅 | P1 | 에러 로깅 시 민감 정보 노출 위험 |
| QA-001 | 완전성 | P1 | 세션 만료(FR-012) 전용 화면 설계 누락 |
| QA-006 | 추적성 | P1 | BR-001 정의 불일치 (200ms vs 3초) |
| QA-007 | 추적성 | P2 | 테스트 명세서 요구사항 참조가 UC로만 되어있음 |
| QA-010 | 테스트가능성 | P1 | ComponentSkeleton 컴포넌트 설계 누락 |
| QA-014 | 성능 | P2 | 로딩 지연 표시 임계값 문서 간 불일치 |

---

### 2.3 Medium (구현 중 수정 권장)

| ID | 영역 | 우선순위 | 설명 |
|----|------|----------|------|
| ARCH-001 | SRP | P2 | EmptyState 3가지 타입을 단일 컴포넌트에서 처리 |
| ARCH-003 | OCP | P2 | PageLoadingProps size 속성이 고정 enum |
| ARCH-005 | DIP | P2 | 에러 로깅 서비스 의존성 주입 방식 미정의 |
| ARCH-007 | 확장성 | P2 | 재시도 로직 상태 관리 방안 누락 |
| ARCH-010 | ISP | P2 | EmptyStateProps 인터페이스 비대 |
| SEC-002 | 인증 | P2 | 403/401 구분 처리 미흡 |
| SEC-003 | 정보노출 | P2 | 에러 메시지에 시스템 정보 노출 가능성 |
| SEC-004 | 세션 | P2 | 세션 만료 처리 보안 강화 필요 |
| SEC-006 | 정보노출 | P2 | 컴포넌트 스택 노출 방지 필요 |
| QA-002 | 완전성 | P2 | 버튼 로딩 상태(FR-003) 설계 미흡 |
| QA-003 | 완전성 | P2 | 403 에러 페이지 와이어프레임 누락 |
| QA-008 | 추적성 | P3 | E2E 테스트 개수 불일치 (11개 vs 6개) |
| QA-011 | 테스트가능성 | P2 | PageLoading Props에 loading prop 누락 |
| QA-012 | 테스트가능성 | P3 | ErrorPage 컴포넌트 설계 미정의 |
| QA-015 | 성능 | P3 | 재시도 지수 백오프 사양 누락 |

---

### 2.4 Low (개선 권장)

| ID | 영역 | 우선순위 | 설명 |
|----|------|----------|------|
| ARCH-004 | 패턴준수 | P3 | Skeleton Props 인터페이스 미정의 |
| ARCH-008 | 패턴준수 | P3 | CSS 예시가 TRD 가이드라인과 불일치 |
| SEC-005 | DoS방지 | P3 | 재시도 로직 Rate Limiting 부재 |
| SEC-007 | Injection | P3 | 검색어/필터 입력값 길이 제한 미정의 |
| QA-004 | 완전성 | P4 | 체크리스트 상태 업데이트 필요 |
| QA-013 | 테스트가능성 | P4 | EmptyState onReset prop 누락 |

---

### 2.5 Info (참고)

| ID | 영역 | 우선순위 | 설명 |
|----|------|----------|------|
| ARCH-006 | 컴포넌트분할 | P4 | Next.js 특수 파일과 공통 컴포넌트 관계 미명시 |
| ARCH-009 | 확장성 | P5 | 세션 만료 화면 범위 불일치 |
| SEC-008 | 정보노출 | P4 | 404 페이지 URL 정보 노출 방지 |
| QA-009 | 추적성 | P5 | 커버리지 통계 수치 불일치 |

---

## 3. 상세 권장 조치

### 3.1 P1 필수 수정 사항

#### 3.1.1 추적성 매트릭스 UT ID 보완 (QA-005)

```markdown
# 025-traceability-matrix.md 섹션 3에 추가

| UT-020 | 단위 | FR-011 | - | 미실행 |
| UT-021 | 단위 | FR-010 | - | 미실행 |
| UT-022 | 단위 | FR-010 | - | 미실행 |
| UT-023 | 단위 | FR-008 | - | 미실행 |
```

#### 3.1.2 ErrorBoundary/ErrorPage 책임 분리 (ARCH-002)

```typescript
// ErrorBoundary: 런타임 에러 캐치 전용 (React Class 컴포넌트)
interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackRender?: (props: { error: Error; resetError: () => void }) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

// ErrorPage: HTTP 상태 코드 기반 에러 표시 전용 (Functional 컴포넌트)
interface ErrorPageProps {
  status: 403 | 404 | 500 | 'network' | 'session-expired';
  onRetry?: () => void;
  onGoHome?: () => void;
}
```

#### 3.1.3 에러 로깅 민감 정보 필터링 (SEC-001)

```typescript
// lib/error/sanitizer.ts
interface SanitizedError {
  message: string;
  code?: string;
  timestamp: string;
  // 스택 트레이스 제외
}

const sanitizeError = (error: Error): SanitizedError => ({
  message: error.message.replace(/token=\w+/gi, 'token=[REDACTED]'),
  code: (error as any).code,
  timestamp: new Date().toISOString(),
});

// Production 환경에서만 적용
const handleError = (error: Error, errorInfo: ErrorInfo) => {
  if (process.env.NODE_ENV === 'production') {
    logError(sanitizeError(error));
  } else {
    console.error(error, errorInfo);
  }
};
```

#### 3.1.4 BR-001 정의 명확화 (QA-006)

```markdown
# 010-design.md 섹션 8.1 수정

| 규칙 ID | 규칙 설명 | 적용 상황 | 예외 |
|---------|----------|----------|------|
| BR-01 | 로딩 200ms 미만 시 스피너 미표시 (깜빡임 방지) | 전체 로딩 | 없음 |
| BR-02 | 재시도 3회 실패 시 관리자 문의 안내 | 네트워크 에러 | 없음 |
| BR-03 | 빈 상태에서 항상 다음 행동 안내 제공 | 데이터 없음 | 없음 |
| BR-04 | 로딩 시간 3초 이상 시 추가 안내 표시 | 장시간 로딩 | 없음 |
```

### 3.2 P2 우선 수정 사항

#### 3.2.1 세션 만료 화면 와이어프레임 추가 (QA-001)

```markdown
# 010-design.md 5.2절에 추가

#### 화면 7: 세션 만료 (Session Expired)

**와이어프레임:**
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                         🔒                              │
│                                                         │
│                   세션이 만료되었습니다                    │
│           보안을 위해 자동으로 로그아웃되었습니다            │
│                                                         │
│                   [ 다시 로그인 ]                        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### 3.2.2 EmptyState 컴포넌트 분리 권장 (ARCH-001)

```typescript
// Discriminated Union 패턴 적용
type EmptyStateProps =
  | { type: 'default'; title?: string; description?: string; action?: ReactNode; }
  | { type: 'search'; searchKeyword: string; onClearSearch: () => void; }
  | { type: 'filter'; appliedFilters: FilterItem[]; onResetFilter: () => void; };
```

#### 3.2.3 PageLoading Props 보완 (QA-011)

```typescript
// 010-design.md 7.2절 수정
interface PageLoadingProps {
  loading?: boolean;      // 로딩 표시 여부 (기본: true)
  tip?: string;           // 로딩 메시지 (기본: "불러오는 중...")
  size?: 'small' | 'default' | 'large';
  fullScreen?: boolean;   // 전체 화면 오버레이
  delay?: number;         // 깜빡임 방지 지연 (기본: 200ms)
}
```

---

## 4. 긍정적 평가 사항

### 4.1 아키텍처
- Ant Design 컴포넌트(Spin, Skeleton, Empty, Result) 활용이 TRD 가이드라인과 일치
- 접근성(ARIA, 키보드 네비게이션) 고려가 충실함
- 반응형 설계가 적절히 고려됨
- 에러 타입별 복구 방법이 사용자 관점에서 잘 정의됨

### 4.2 보안
- 에러 메시지가 사용자 친화적이며 기술적 상세 미노출
- 404/500 에러 페이지 기본 메시지가 보안 원칙 준수

### 4.3 품질
- PRD 요구사항 커버리지: 모든 PRD 4.1.1 항목이 FR로 매핑됨 (12/12)
- 요구사항-테스트 매핑: 모든 FR에 단위/E2E/매뉴얼 테스트 할당됨
- data-testid 정의: 일관된 네이밍 컨벤션 적용 (kebab-case)
- 테스트 커버리지 목표: 적절한 목표 설정 (80% 라인 커버리지)
- 경계 조건 테스트: tip 50자, description 100자 등 명확한 경계값 정의

---

## 5. 리뷰 결론

### 5.1 최종 평가

| 항목 | 결과 |
|------|------|
| 리뷰 결과 | **조건부 승인** |
| Critical 이슈 | 1건 (P1 해결 필수) |
| High 이슈 | 7건 (P1/P2 해결 권장) |
| 총 이슈 | 33건 |

### 5.2 다음 단계 진행 조건

구현 단계 진행을 위해 다음 사항의 수정이 필요합니다:

**필수 (P1)**:
1. 추적성 매트릭스 UT-020~UT-023 추가
2. BR-001/BR-004 비즈니스 규칙 분리 정의
3. 세션 만료 화면 설계 추가
4. ComponentSkeleton 컴포넌트 설계 명확화

**권장 (P2)**:
1. ErrorBoundary/ErrorPage 책임 분리
2. 에러 로깅 민감 정보 필터링 정책 추가
3. PageLoading Props 인터페이스 보완
4. 403 에러 페이지 와이어프레임 추가

---

## 변경 이력

| 버전 | 일자 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0 | 2026-01-20 | claude-1 | 최초 작성 (Architecture/Security/Quality 3개 관점 통합) |
