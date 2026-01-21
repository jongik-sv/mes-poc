# TSK-06-04 설계 리뷰 결과서

**Version:** 1.0 --- **Last Updated:** 2026-01-21

> **목적**: 마스터-디테일 화면 템플릿 설계에 대한 다층 품질 검증 결과

---

## 0. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| Task ID | TSK-06-04 |
| Task명 | 마스터-디테일 화면 템플릿 |
| 리뷰어 | claude-1 |
| 리뷰 일시 | 2026-01-21 |
| 설계 문서 버전 | 010-design.md v1.0, 011-ui-design.md v1.0 |

---

## 1. 검증 대상 문서

| 문서 | 경로 | 상태 |
|------|------|------|
| 기본 설계 | `010-design.md` | ✅ 확인됨 |
| UI 설계 | `011-ui-design.md` | ✅ 확인됨 |
| 추적성 매트릭스 | `025-traceability-matrix.md` | ✅ 확인됨 |
| 테스트 명세 | `026-test-specification.md` | ✅ 확인됨 |

**참조 문서:**
- PRD: `.orchay/projects/mes-portal/prd.md`
- TRD: `.orchay/projects/mes-portal/trd.md`

---

## 2. 검증 영역별 평가 요약

| 검증 영역 | 평가 | 비고 |
|----------|------|------|
| 문서 완전성 | **PASS** | 필수 섹션 모두 포함 |
| 요구사항 추적성 | **PASS** | FR 4건, BR 3건 100% 매핑 |
| 아키텍처 | **WARN** | 1건 개선 권장 (의존성 명확화) |
| 보안 | **PASS** | UI 템플릿 레벨에서 위험 없음 |
| 테스트 가능성 | **PASS** | UT 15건, E2E 6건 정의 완료 |

---

## 3. 발견된 이슈

### 3.1 이슈 요약 테이블

| 이슈 ID | 영역 | 심각도 | 우선순위 | 설명 |
|---------|------|--------|----------|------|
| DEP-01 | 의존성 | High | P1 | 분할 패널 라이브러리 선택 미확정 (TRD 정합성 필요) |
| PROPS-01 | Props | High | P2 | 제네릭 타입 D 미사용 - 제거 또는 활용 필요 |
| CON-01 | 일관성 | Medium | P2 | Props 인터페이스 제네릭 타입 파라미터 불일치 (010: 2개, 011: 1개) |
| EXT-01 | 확장성 | Medium | P3 | 다중 마스터 선택 시나리오 미고려 |
| CON-02 | 일관성 | Low | P3 | defaultSplit 타입 불일치 (number vs [number, number]) |
| CON-03 | 일관성 | Low | P3 | maxMasterWidth Props 010-design에 누락 |
| PRD-01 | 커버리지 | Low | P4 | 샘플 화면(카테고리-제품) 명시적 참조 부재 |
| PRD-02 | 커버리지 | Info | P5 | 상하 분할 지원 범위 명시 필요 |

### 3.2 심각도 기준

| 심각도 | 설명 | 예시 |
|--------|------|------|
| **Critical** | 시스템 중단, 데이터 손실, 심각한 보안 | 인증 우회, 데이터 무결성 파괴 |
| **High** | 핵심 기능 오류, 보안 취약점 | API 권한 검증 누락 |
| **Medium** | 부분적 기능 제한, 성능 저하 | 인터페이스 불일치 |
| **Low** | 경미한 불편, 코드 품질 | 네이밍 개선 |
| **Info** | 개선 제안, 모범 사례 | 문서화 권장 |

### 3.3 우선순위 기준

| 우선순위 | 설명 | 조치 시점 |
|----------|------|----------|
| **P1** | 설계 결함, 심각한 위험 | 구현 전 필수 수정 |
| **P2** | 아키텍처 개선, 일관성 문제 | 구현 초기 수정 |
| **P3** | 코드 품질, 확장성 | 구현 중 수정 |
| **P4** | 최적화 기회 | 구현 후 검토 |
| **P5** | 참고 사항 | 다음 iteration |

---

## 4. 이슈 상세

### 4.1 DEP-01: 분할 패널 라이브러리 미확정

**심각도:** High | **우선순위:** P1

**현재 상태:**
```markdown
# 010-design.md Section 11.2
| 의존 항목 | 이유 | 상태 |
|----------|------|------|
| react-split-pane 또는 Ant Design Splitter | 분할 패널 | 라이브러리 |
```

**문제점:**
- TRD에 분할 패널 라이브러리가 명시되지 않음
- "또는"으로 선택이 불확실하여 구현 시 혼란 발생 가능

**권고:**
TRD 1.2 UI/스타일링 스택과의 정합성을 위해 **Ant Design Splitter**로 확정 필요

```markdown
# 수정 제안 (010-design.md)
| 의존 항목 | 이유 | 상태 |
|----------|------|------|
| Ant Design Splitter | 분할 패널 (TRD 정합, Ant Design 6.x 내장) | 라이브러리 |
```

---

### 4.2 PROPS-01 / CON-01: Props 인터페이스 불일치

**심각도:** High (PROPS-01), Medium (CON-01) | **우선순위:** P2

**현재 상태:**

`010-design.md` (Section 7.1):
```typescript
interface MasterDetailTemplateProps<M, D> {
  // M: 마스터 타입, D: 디테일 타입 (미사용)
}
```

`011-ui-design.md` (Section 4.1):
```typescript
interface MasterDetailTemplateProps<M = unknown> {
  // M: 마스터 타입만 정의
}
```

**문제점:**
1. 제네릭 타입 `D`가 선언되었으나 Props에서 사용되지 않음
2. 두 문서 간 인터페이스 정의 불일치

**권고:**
`011-ui-design.md` 기준으로 통일 (D 타입 제거)

```typescript
// 통일된 인터페이스
interface MasterDetailTemplateProps<M = unknown> {
  // 마스터 영역
  masterTitle?: string
  masterContent: ReactNode
  masterSearchable?: boolean
  onMasterSearch?: (keyword: string) => void
  selectedMaster?: M | null
  onMasterSelect?: (item: M) => void

  // 디테일 영역
  detailTitle?: ReactNode
  detailContent: ReactNode
  detailLoading?: boolean
  detailEmpty?: ReactNode

  // 레이아웃
  defaultSplit?: [number, number]  // [마스터%, 디테일%]
  minMasterWidth?: number
  minDetailWidth?: number
  maxMasterWidth?: number | string

  // 이벤트
  onSplitChange?: (sizes: [number, number]) => void
}
```

---

### 4.3 EXT-01: 다중 선택 미고려

**심각도:** Medium | **우선순위:** P3

**현재 상태:**
```typescript
selectedMaster?: M  // 단일 선택만 지원
```

**권고:**
MVP에서는 단일 선택으로 구현하고, 향후 확장 가능하도록 문서에 명시

```typescript
// v1.0 (현재): 단일 선택
selectedMaster?: M

// v2.0 (향후): 다중 선택 지원 확장
selectedMaster?: M | M[]
selectionMode?: 'single' | 'multiple'
```

---

### 4.4 CON-02 / CON-03: Props 세부 사항 불일치

**심각도:** Low | **우선순위:** P3

**CON-02: defaultSplit 타입**
- `010-design.md`: `defaultSplit?: number` (0-100)
- `011-ui-design.md`: `defaultSplit?: [number, number]` ([마스터%, 디테일%])

**CON-03: maxMasterWidth 누락**
- `011-ui-design.md`에는 정의되어 있으나 `010-design.md`에는 없음

**권고:**
`010-design.md` Section 7.1에 다음 내용 반영:
```typescript
defaultSplit?: [number, number]  // [마스터%, 디테일%], 기본값 [30, 70]
maxMasterWidth?: number | string  // 마스터 패널 최대 너비
```

---

## 5. 검증 영역별 상세 결과

### 5.1 아키텍처 검증

| 항목 | 평가 | 비고 |
|------|------|------|
| SOLID 원칙 | WARN | SRP 부분 준수, Props 책임 분리 권장 |
| 컴포넌트 분할 | PASS | MasterPanel/DetailPanel 분리 양호 |
| 확장성 | WARN | 단일 선택만 지원, 다중 선택 미고려 |
| 재사용성 | PASS | 제네릭, Render Props 패턴 적용 |
| 의존성 관리 | WARN | 라이브러리 선택 미확정 |
| 상태 관리 | PASS | Controlled Component 패턴 양호 |

### 5.2 보안 검증

| 항목 | 평가 | 비고 |
|------|------|------|
| XSS | PASS | React 자동 이스케이프 적용 |
| 데이터 노출 | PASS | 민감 정보 직접 처리 없음 |
| OWASP Top 10 | N/A | UI 컴포넌트, 백엔드 연동 시 검토 |

### 5.3 품질 검증

| 항목 | 평가 | 비고 |
|------|------|------|
| 문서 완전성 | PASS | 필수 섹션 모두 포함 |
| 요구사항 추적성 | PASS | FR 4건, BR 3건 100% 매핑 |
| 테스트 가능성 | PASS | UT 15건, E2E 6건, data-testid 완비 |
| PRD 커버리지 | PASS | 핵심 요구사항 100% 충족 |
| 문서간 일관성 | WARN | Props 인터페이스 불일치 |

---

## 6. 커버리지 통계

### 6.1 요구사항 커버리지

| 구분 | 총 항목 | 매핑 완료 | 커버리지 |
|------|---------|----------|---------|
| 기능 요구사항 (FR) | 4 | 4 | **100%** |
| 비즈니스 규칙 (BR) | 3 | 3 | **100%** |

### 6.2 테스트 커버리지 (정의)

| 테스트 유형 | 정의된 케이스 | 목표 커버리지 |
|------------|-------------|--------------|
| 단위 테스트 | 15개 | 80% |
| E2E 테스트 | 6개 | 100% 시나리오 |
| 매뉴얼 테스트 | 9개 | 전체 화면 |

---

## 7. 권고 조치 사항

### 7.1 구현 전 필수 조치 (P1)

- [ ] **DEP-01**: TRD에 Ant Design Splitter 명시 및 010-design.md 의존성 확정

### 7.2 구현 초기 조치 (P2)

- [ ] **PROPS-01 / CON-01**: Props 인터페이스 통일 (D 타입 제거, 011-ui-design.md 기준)

### 7.3 구현 중 조치 (P3)

- [ ] **EXT-01**: 다중 선택 지원 향후 확장 가능성 문서화
- [ ] **CON-02**: defaultSplit 타입 통일 ([number, number])
- [ ] **CON-03**: 010-design.md에 maxMasterWidth 추가

### 7.4 향후 검토 (P4-P5)

- [ ] **PRD-01**: 샘플 화면 구현 시 PRD 참조 문서화
- [ ] **PRD-02**: 상하 분할 지원 범위 명시

---

## 8. 결론

TSK-06-04 마스터-디테일 화면 템플릿 설계는 **전반적으로 양호한 품질 수준**을 달성하였습니다.

**강점:**
- PRD/TRD 요구사항에 대한 추적성 100% 달성
- 테스트 명세 완전성 (UT 15개, E2E 6개, Manual 9개)
- data-testid 정의 완비로 테스트 자동화 준비 완료
- UI 설계의 접근성 고려 상세함

**개선 필요:**
- 분할 패널 라이브러리 확정 (P1)
- Props 인터페이스 통일 (P2)

**최종 평가:**
P1 이슈 해소 후 구현 진행 가능

---

## 9. 이슈 분포

```
이슈 분포: P1(1) P2(2) P3(3) P4(1) P5(1) = 8건
```

---

## 변경 이력

| 버전 | 일자 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0 | 2026-01-21 | claude | 최초 작성 |

---

<!--
TSK-06-04 설계 리뷰 결과서
Reviewer: claude-1
Version: 1.0
-->
