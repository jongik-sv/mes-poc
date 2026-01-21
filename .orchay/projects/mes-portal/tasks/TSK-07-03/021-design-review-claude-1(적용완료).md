# TSK-07-03 설계 리뷰 결과

## 문서 정보

| 항목 | 내용 |
|------|------|
| Task ID | TSK-07-03 |
| Task명 | 차트 위젯 |
| 리뷰어 | claude-1 |
| 리뷰일 | 2026-01-21 |
| 리뷰 대상 | 010-design.md, 025-traceability-matrix.md, 026-test-specification.md |

---

## 검증 대상

| 문서 | 상태 |
|------|------|
| 010-design.md | ✅ |
| 025-traceability-matrix.md | ✅ |
| 026-test-specification.md | ✅ |

---

## 검증 결과 요약

| 검증 영역 | 평가 | 비고 |
|----------|------|------|
| 문서 완전성 | PASS | 필수 섹션 모두 포함 |
| 요구사항 추적성 | WARN | 실시간 갱신 제외 근거 미기록 |
| 아키텍처 | PASS | SOLID 준수, 컴포넌트 분할 적절 |
| 보안 | WARN | XSS 방지, 데이터 검증 보완 필요 |
| 테스트 가능성 | PASS | UT 13, E2E 8, TC 7 정의 |

**이슈 분포:** P1(1) P2(4) P3(5) P4(4) P5(4) = **총 18건**

---

## 발견 이슈

### Critical/High (P1-P2) - 구현 전 필수 수정

| ID | 영역 | 심각도 | 우선순위 | 설명 | 권장 조치 |
|----|------|--------|----------|------|----------|
| QA-001 | 추적성 | High | P1 | PRD 4.1.1 "실시간 차트 갱신" 요구사항이 Phase 2로 제외되었으나 추적성 매트릭스에 제외 근거 미기록 | 025-traceability-matrix.md에 "제외된 요구사항" 섹션 추가 |
| SEC-001 | XSS | Medium | P2 | 툴팁에 `datum.time`, `datum.value` 등 데이터 직접 표시, HTML 이스케이핑 처리 미명시 | @ant-design/charts 기본 이스케이핑 동작 확인 또는 sanitize 함수 명시 |
| SEC-002 | 데이터 검증 | Medium | P2 | 섹션 7.5 유효성 규칙이 정의되었으나 실제 검증 함수 구현 명세 없음 | `validateProductionTrend()`, `sanitizeChartData()` 등 유틸리티 설계 추가 |
| QA-002 | 문서 일관성 | Medium | P2 | 010-design.md 12.2 체크리스트가 미완료([ ])로 표시되어 있으나 025, 026 문서 실제 작성됨 | 체크리스트를 [x]로 업데이트 |
| QA-003 | 테스트 명세 | Medium | P2 | E2E-006(목표 미달 색상), E2E-007(파이 차트 그룹화) 테스트 케이스 상세 누락 | 섹션 3.2에 테스트 상세 추가 |

### Medium (P3) - 구현 초기 수정

| ID | 영역 | 심각도 | 우선순위 | 설명 | 권장 조치 |
|----|------|--------|----------|------|----------|
| ARCH-001 | 의존성 | Medium | P3 | 차트 라이브러리(@ant-design/charts) 직접 의존으로 결합도 높음 | Phase 2에서 차트 어댑터 패턴 검토 |
| ARCH-004 | 번들 | Medium | P3 | @ant-design/charts 전체 import 시 번들 크기 증가 우려 | 필요한 차트만 named import 명시 |
| SEC-003 | 에러 노출 | Low | P3 | 섹션 9.3에서 `error.message` 사용자에게 직접 표시, 내부 정보 노출 가능 | 사용자 친화적 에러 메시지 매핑 정의 |
| QA-004 | data-testid | Low | P3 | `chart-wrapper-{name}` 패턴의 구체적인 name 값 미정의 | chart-wrapper-line, chart-wrapper-bar, chart-wrapper-pie 명시 |
| QA-005 | 추적성 | Low | P3 | FR-004 "툴팁" 요구사항의 PRD 출처가 불명확 (4.1.1 공통 컴포넌트와 혼동) | PRD 섹션 참조 명확화 |

### Low/Info (P4-P5) - 구현 후 검토

| ID | 영역 | 심각도 | 우선순위 | 설명 | 권장 조치 |
|----|------|--------|----------|------|----------|
| ARCH-002 | 타입 | Low | P4 | `types.ts`가 TSK-07-01과 별도 관리 가능성 | 공통 타입 파일로 통합 권장 |
| SEC-004 | Prototype Pollution | Low | P4 | `groupSmallItems()`에서 spread 연산자 사용 시 방어 코드 없음 | 입력 데이터 순수성 확인 가드 추가 |
| SEC-005 | DoS | Low | P4 | 데이터 배열 크기 제한 미명시, 대량 데이터 시 렌더링 성능 저하 가능 | MAX_DATA_POINTS 제한 정의 |
| QA-006 | 테스트 데이터 | Low | P4 | MOCK_RATIO_MANY의 percentage 합계 검증 필요 | 테스트 데이터 정확성 확인 |
| ARCH-003 | Error Boundary | Info | P5 | ChartWrapper에 Error Boundary 내장 필요 | TSK-07-01의 WidgetErrorBoundary 재사용 검토 |
| SEC-006 | 타입 안전성 | Info | P5 | TypeScript 타입 정의는 있으나 런타임 검증 없음 | Zod 등 런타임 스키마 검증 권장 |
| QA-007 | 비즈니스 규칙 | Info | P5 | BR-002 목표 미달 색상 규칙의 경계값 조건 불명확 (정확히 0.9일 때?) | 경계값 조건 명확화 (>=0.9, 0.7<=x<0.9, <0.7) |

---

## 긍정적 평가

### 아키텍처
- 명확한 컴포넌트 경계: LineChart, BarChart, PieChart 유형별 분리 우수
- SOLID 원칙 전반적 준수 (SRP, OCP, ISP)
- TRD 1.2 @ant-design/charts 라이브러리 지정 준수
- 데이터 변환 로직 분리: `transformLinePerformance()` 함수 명시

### 품질
- 설계 문서 12개 섹션으로 체계적 구성
- 와이어프레임과 코드 예시 풍부
- 추적성 매트릭스 100% 커버리지 (FR 5개, BR 5개)
- 에러 처리 3가지 상태(로딩/빈데이터/에러) 명확 정의

### 테스트
- data-testid 7개 핵심 셀렉터 정의
- 단위 테스트 13개, E2E 8개, 매뉴얼 TC 7개
- 차트별 테스트 전략 상세 (Canvas 렌더링, 비동기, 호버 등 고려)

---

## 권장 조치 요약

| 우선순위 | 조치 항목 | 예상 소요 |
|----------|----------|----------|
| P1 | 실시간 갱신 요구사항 제외 근거 문서화 | 10분 |
| P2 | @ant-design/charts XSS 방지 동작 확인/문서화 | 15분 |
| P2 | 데이터 검증 유틸리티 설계 추가 | 20분 |
| P2 | 010-design.md 체크리스트 업데이트 | 5분 |
| P2 | E2E-006, E2E-007 테스트 상세 추가 | 20분 |

---

## 결론

TSK-07-03 차트 위젯 설계는 **조건부 승인**입니다.

- 아키텍처 관점에서 SOLID 원칙을 준수하고 TRD 스택을 올바르게 활용
- 문서 완전성과 테스트 가능성은 양호
- **P1-P2 이슈 5건을 구현 전 반드시 해결 필요**
- 특히 QA-001(실시간 갱신 제외 근거)과 SEC-001, SEC-002(XSS/데이터 검증)는 설계 문서 보완 필수

---

## 적용 결과

> 적용일: 2026-01-21

### 적용 통계

| 구분 | 건수 | 비율 |
|------|------|------|
| ✅ 적용 | 12건 | 67% |
| 📝 조정 적용 | 2건 | 11% |
| ⏸️ 보류 | 4건 | 22% |

### P1 이슈 (1건)

| ID | 판단 | 적용 내용 |
|----|------|----------|
| QA-001 | ✅ 적용 | 025-traceability-matrix.md에 "제외된 요구사항" 섹션(8장) 추가 - 실시간 갱신, 차트 내보내기, 드릴다운, 게이지 차트 제외 근거 문서화 |

### P2 이슈 (4건)

| ID | 판단 | 적용 내용 |
|----|------|----------|
| SEC-001 | ✅ 적용 | 010-design.md 7.7절 "XSS 방지 대책" 추가 - @ant-design/charts Canvas 기반 렌더링으로 XSS 위험 낮음 확인, customContent 사용 시 주의사항 문서화 |
| SEC-002 | ✅ 적용 | 010-design.md 7.6절 "데이터 검증 유틸리티" 추가 - validateProductionTrend(), validateLinePerformance(), validateProductRatio(), sanitizeChartData() 함수 설계 |
| QA-002 | ✅ 적용 | 010-design.md 12.2절 체크리스트 [x]로 업데이트 |
| QA-003 | ✅ 적용 | 026-test-specification.md에 E2E-006, E2E-007 테스트 상세 추가 - 목표 미달 색상 확인, 파이 차트 그룹화 테스트 코드 포함 |

### P3 이슈 (5건)

| ID | 판단 | 적용 내용 |
|----|------|----------|
| ARCH-001 | ⏸️ 보류 | Phase 2에서 어댑터 패턴 검토 - 현재 직접 의존이 TRD 준수이며 MVP에 충분 |
| ARCH-004 | ✅ 적용 | 010-design.md 11.5절에 named import 예시 추가 - 번들 최적화 가이드 |
| SEC-003 | ✅ 적용 | 010-design.md 9.3절에 에러 메시지 매핑 추가 - ERROR_MESSAGES 상수 및 getErrorMessage() 함수 설계 |
| QA-004 | ✅ 적용 | 010-design.md 11.8절에 chart-wrapper-line/bar/pie testid 추가 |
| QA-005 | 📝 조정 | 025-traceability-matrix.md FR-004에 PRD 참조 명확화 - "4.1.1 차트 위젯 - 데이터 포인트 호버 시 상세 정보 툴팁" |

### P4-P5 이슈 (8건)

| ID | 판단 | 적용 내용/보류 사유 |
|----|------|-------------------|
| ARCH-002 | ⏸️ 보류 | 공통 타입 통합은 리팩토링 범위 - Task 완료 후 전체 리팩토링 시 검토 |
| SEC-004 | ⏸️ 보류 | 입력 데이터가 내부 JSON에서 오므로 Prototype Pollution 위험 낮음 |
| SEC-005 | 📝 조정 | 010-design.md 7.8절에 MAX_DATA_POINTS 권장값 정의 (LINE: 100, BAR: 20, PIE: 10) |
| QA-006 | ✅ 적용 | 026-test-specification.md MOCK_RATIO_MANY 데이터 수정 - percentage 합계 100% 검증 |
| ARCH-003 | ⏸️ 보류 | TSK-07-01의 WidgetErrorBoundary 재사용 - 별도 Error Boundary 불필요 |
| SEC-006 | ⏸️ 보류 | Zod 런타임 검증 도입은 인프라 작업 - TypeScript 타입으로 현재 충분 |
| QA-007 | ✅ 적용 | 010-design.md BR-02에 경계값 조건 표 추가 - 90%/70% 경계 및 target=0 처리 명시 |

### 수정된 문서

| 문서 | 수정 내용 |
|------|----------|
| 010-design.md | 7.6절(데이터 검증), 7.7절(XSS 방지), 7.8절(데이터 크기 제한), 8장 BR-02 경계값, 9.3절(에러 메시지), 11.5절(named import), 11.8절(testid), 12.2절(체크리스트) |
| 025-traceability-matrix.md | 8장(제외된 요구사항), FR-004(PRD 참조) |
| 026-test-specification.md | E2E-006, E2E-007 상세, MOCK_RATIO_MANY 수정 |

---

<!--
021-design-review-claude-1.md
Generated by: Claude
Review Date: 2026-01-21
Applied: 2026-01-21
-->
