# 요구사항 추적성 매트릭스 (025-traceability-matrix.md)

**Template Version:** 1.0.0 — **Last Updated:** 2026-01-21

> **목적**: PRD → 기본설계 → 상세설계 → 테스트 4단계 양방향 추적
>
> **참조**: 이 문서는 `010-design.md`와 `026-test-specification.md`와 함께 사용됩니다.

---

## 0. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| Task ID | TSK-07-02 |
| Task명 | KPI 카드 위젯 |
| 설계 문서 참조 | `010-design.md` |
| 테스트 명세 참조 | `026-test-specification.md` |
| 작성일 | 2026-01-21 |
| 작성자 | Claude |

---

## 1. 기능 요구사항 추적 (FR → 설계 → 테스트)

> PRD → 기본설계 → 상세설계 → 테스트케이스 매핑

| 요구사항 ID | PRD 섹션 | 설계 섹션 | 컴포넌트 | 단위 테스트 | E2E 테스트 | 매뉴얼 TC | 상태 |
|-------------|----------|-----------|----------|-------------|------------|-----------|------|
| FR-001 | 4.1.2 | 3.1 | KPICard | UT-001, UT-002 | E2E-001 | TC-001 | 설계완료 |
| FR-002 | 4.1.2 | 3.2 | KPICard | UT-003, UT-004 | E2E-001 | TC-002 | 설계완료 |
| FR-003 | 4.1.2 | 3.3 | KPICard | UT-005, UT-006 | E2E-001 | TC-003 | 설계완료 |
| FR-004 | 4.1.1 | 3.4 | KPICard | UT-007, UT-008 | E2E-002 | TC-004 | 설계완료 |
| FR-005 | TRD 2.3 | 3.5 | Dashboard | UT-001 | E2E-003, E2E-004 | TC-005, TC-006 | 설계완료 |

### 1.1 요구사항별 상세 매핑

#### FR-001: 가동률 카드 표시

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.1.2 | 주요 KPI 지표 표시 (가동률) |
| 설계 | 010-design.md | 3.1 | KPICard 컴포넌트 - 가동률 표시 |
| 단위 테스트 | 026-test-specification.md | 2.1 | UT-001: 가동률 값 렌더링, UT-002: 가동률 단위(%) 표시 |
| E2E 테스트 | 026-test-specification.md | 3.1 | E2E-001: 대시보드 KPI 카드 통합 테스트 |

#### FR-002: 불량률 카드 표시

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.1.2 | 주요 KPI 지표 표시 (불량률) |
| 설계 | 010-design.md | 3.2 | KPICard 컴포넌트 - 불량률 표시 |
| 단위 테스트 | 026-test-specification.md | 2.2 | UT-003: 불량률 값 렌더링, UT-004: 불량률 단위(%) 표시 |
| E2E 테스트 | 026-test-specification.md | 3.1 | E2E-001: 대시보드 KPI 카드 통합 테스트 |

#### FR-003: 생산량 카드 표시

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.1.2 | 주요 KPI 지표 표시 (생산량) |
| 설계 | 010-design.md | 3.3 | KPICard 컴포넌트 - 생산량 표시 |
| 단위 테스트 | 026-test-specification.md | 2.3 | UT-005: 생산량 값 렌더링, UT-006: 생산량 단위(EA) 표시 |
| E2E 테스트 | 026-test-specification.md | 3.1 | E2E-001: 대시보드 KPI 카드 통합 테스트 |

#### FR-004: 증감률 표시 (화살표 + 색상)

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.1.1 | KPI 카드 위젯 - 숫자, 증감률 표시 |
| 설계 | 010-design.md | 3.4 | KPICard 컴포넌트 - 증감률 시각화 (ArrowUp/ArrowDown + 색상) |
| 단위 테스트 | 026-test-specification.md | 2.4 | UT-007: 증감률 방향 표시, UT-008: 증감률 색상 적용 |
| E2E 테스트 | 026-test-specification.md | 3.2 | E2E-002: 증감률 시각화 테스트 |

#### FR-005: mock-data/dashboard.json 데이터 로드

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| TRD | trd.md | 2.3 | Mock 데이터 사용 - JSON import 방식 |
| 설계 | 010-design.md | 3.5 | Dashboard 화면에서 mock-data/dashboard.json 로드 |
| 단위 테스트 | 026-test-specification.md | 2.1 | UT-001: Mock 데이터 로드 및 렌더링 |
| E2E 테스트 | 026-test-specification.md | 3.3, 3.4 | E2E-003: 데이터 로드 성공, E2E-004: 데이터 표시 정확성 |

---

## 2. 비즈니스 규칙 추적 (BR → 구현 → 검증)

| 규칙 ID | PRD 출처 | 설계 섹션 | 구현 위치(개념) | 단위 테스트 | E2E 테스트 | 검증 방법 | 상태 |
|---------|----------|-----------|-----------------|-------------|------------|-----------|------|
| BR-001 | 4.1.1 | 4.1 | KPICard | UT-007 | E2E-002 | 양수 증감률 시 상승 화살표 + 녹색 확인 | 설계완료 |
| BR-002 | 4.1.1 | 4.2 | KPICard | UT-007 | E2E-002 | 음수 증감률 시 하락 화살표 + 빨간색 확인 | 설계완료 |
| BR-003 | 4.1.1 | 4.3 | KPICard | UT-007 | E2E-002 | 0% 증감률 시 변화 없음 표시 + 회색 확인 | 설계완료 |
| BR-004 | 4.1.1 | 4.4 | KPICard | UT-008 | E2E-004 | KPI 값 없을 때 "-" 표시 확인 | 설계완료 |

### 2.1 비즈니스 규칙별 상세 매핑

#### BR-001: 증감률 양수일 때 상승 화살표 + 녹색

| 구분 | 내용 |
|------|------|
| **PRD 원문** | KPI 카드 위젯 - 증감률 표시 |
| **설계 표현** | 증감률 > 0: ArrowUpOutlined 아이콘 + colorSuccess(#52c41a) 적용 |
| **구현 위치** | KPICard 컴포넌트 - changeRate prop 처리 로직 |
| **검증 방법** | changeRate가 양수일 때 ArrowUpOutlined 렌더링 및 녹색 스타일 확인 |
| **관련 테스트** | UT-007, E2E-002 |

#### BR-002: 증감률 음수일 때 하락 화살표 + 빨간색

| 구분 | 내용 |
|------|------|
| **PRD 원문** | KPI 카드 위젯 - 증감률 표시 |
| **설계 표현** | 증감률 < 0: ArrowDownOutlined 아이콘 + colorError(#ff4d4f) 적용 |
| **구현 위치** | KPICard 컴포넌트 - changeRate prop 처리 로직 |
| **검증 방법** | changeRate가 음수일 때 ArrowDownOutlined 렌더링 및 빨간색 스타일 확인 |
| **관련 테스트** | UT-007, E2E-002 |

#### BR-003: 증감률 0일 때 변화 없음 표시 + 회색

| 구분 | 내용 |
|------|------|
| **PRD 원문** | KPI 카드 위젯 - 증감률 표시 (변화 없음 케이스) |
| **설계 표현** | 증감률 === 0: MinusOutlined 또는 텍스트 "-" + 회색(colorTextSecondary) 적용 |
| **구현 위치** | KPICard 컴포넌트 - changeRate prop 처리 로직 |
| **검증 방법** | changeRate가 0일 때 변화 없음 표시 및 회색 스타일 확인 |
| **관련 테스트** | UT-007, E2E-002 |

#### BR-004: KPI 값이 없을 때 "-" 표시

| 구분 | 내용 |
|------|------|
| **PRD 원문** | KPI 카드 위젯 - 데이터 없음 처리 |
| **설계 표현** | value가 null/undefined일 때 Ant Design Statistic에 "-" 표시 |
| **구현 위치** | KPICard 컴포넌트 - value prop null 처리 |
| **검증 방법** | value prop이 없을 때 "-" 텍스트 표시 확인 |
| **관련 테스트** | UT-008, E2E-004 |

---

## 3. 테스트 역추적 매트릭스

> 테스트 결과 → 요구사항 역추적용 (build/verify 단계 결과서 생성 시 활용)

| 테스트 ID | 테스트 유형 | 검증 대상 요구사항 | 검증 대상 비즈니스 규칙 | 상태 |
|-----------|------------|-------------------|----------------------|------|
| UT-001 | 단위 | FR-001, FR-005 | - | 미실행 |
| UT-002 | 단위 | FR-001 | - | 미실행 |
| UT-003 | 단위 | FR-002 | - | 미실행 |
| UT-004 | 단위 | FR-002 | - | 미실행 |
| UT-005 | 단위 | FR-003 | - | 미실행 |
| UT-006 | 단위 | FR-003 | - | 미실행 |
| UT-007 | 단위 | FR-004 | BR-001, BR-002, BR-003 | 미실행 |
| UT-008 | 단위 | FR-004 | BR-004 | 미실행 |
| E2E-001 | E2E | FR-001, FR-002, FR-003 | - | 미실행 |
| E2E-002 | E2E | FR-004 | BR-001, BR-002, BR-003 | 미실행 |
| E2E-003 | E2E | FR-005 | - | 미실행 |
| E2E-004 | E2E | FR-005 | BR-004 | 미실행 |
| TC-001 | 매뉴얼 | FR-001 | - | 미실행 |
| TC-002 | 매뉴얼 | FR-002 | - | 미실행 |
| TC-003 | 매뉴얼 | FR-003 | - | 미실행 |
| TC-004 | 매뉴얼 | FR-004 | BR-001, BR-002, BR-003 | 미실행 |
| TC-005 | 매뉴얼 | FR-005 | - | 미실행 |
| TC-006 | 매뉴얼 | FR-005 | BR-004 | 미실행 |

---

## 4. 데이터 모델 추적

> Mock 데이터 구조 → Props 인터페이스 매핑

| Mock 데이터 필드 | Props 인터페이스 | 타입 | 용도 |
|-----------------|-----------------|------|------|
| dashboard.kpi.operatingRate | KPICardProps.value | number | 가동률 값 |
| dashboard.kpi.defectRate | KPICardProps.value | number | 불량률 값 |
| dashboard.kpi.production | KPICardProps.value | number | 생산량 값 |
| dashboard.kpi.*.changeRate | KPICardProps.changeRate | number | 증감률 |
| - | KPICardProps.title | string | 카드 제목 |
| - | KPICardProps.unit | string | 단위 (%, EA 등) |
| - | KPICardProps.icon | ReactNode | 카드 아이콘 |

### 4.1 Mock 데이터 구조 (dashboard.json)

```json
{
  "kpi": {
    "operatingRate": {
      "value": 87.5,
      "changeRate": 2.3,
      "unit": "%"
    },
    "defectRate": {
      "value": 1.2,
      "changeRate": -0.5,
      "unit": "%"
    },
    "production": {
      "value": 15420,
      "changeRate": 5.8,
      "unit": "EA"
    }
  }
}
```

---

## 5. 인터페이스 추적

> 컴포넌트 Props 인터페이스 매핑

| 인터페이스 | Props | 타입 | 요구사항 |
|-----------|-------|------|----------|
| KPICardProps | title | string | FR-001, FR-002, FR-003 |
| KPICardProps | value | number \| null | FR-001, FR-002, FR-003 |
| KPICardProps | unit | string | FR-001, FR-002, FR-003 |
| KPICardProps | changeRate | number | FR-004 |
| KPICardProps | icon | ReactNode | FR-001, FR-002, FR-003 |
| KPICardProps | loading | boolean | - (UI 상태) |

### 5.1 TypeScript 인터페이스 정의

```typescript
interface KPICardProps {
  /** 카드 제목 (예: "가동률", "불량률", "생산량") */
  title: string;

  /** KPI 값 (null일 경우 "-" 표시) */
  value: number | null;

  /** 단위 (예: "%", "EA") */
  unit?: string;

  /** 증감률 (양수: 상승, 음수: 하락, 0: 변화없음) */
  changeRate?: number;

  /** 카드 아이콘 */
  icon?: React.ReactNode;

  /** 로딩 상태 */
  loading?: boolean;
}
```

---

## 6. 화면 추적

> 기본설계 화면 요구사항 → 상세설계 컴포넌트 매핑

| 기본설계 화면 | 상세설계 화면 | 컴포넌트 | 요구사항 |
|--------------|--------------|----------|----------|
| 대시보드 KPI 영역 | /sample/dashboard | KPICard | FR-001, FR-002, FR-003, FR-004 |
| 가동률 카드 | 대시보드 상단 1번째 | KPICard | FR-001 |
| 불량률 카드 | 대시보드 상단 2번째 | KPICard | FR-002 |
| 생산량 카드 | 대시보드 상단 3번째 | KPICard | FR-003 |

### 6.1 컴포넌트 구조

```
Dashboard (screens/dashboard/Dashboard.tsx)
└── KPICardArea (FR-001, FR-002, FR-003)
    └── Row/Col (반응형 그리드)
        ├── KPICard (가동률) - FR-001, FR-004
        │   └── Ant Design Card + Statistic
        │       ├── title: "가동률"
        │       ├── value: {operatingRate.value}
        │       ├── suffix: "%"
        │       └── changeRate indicator
        ├── KPICard (불량률) - FR-002, FR-004
        │   └── Ant Design Card + Statistic
        │       ├── title: "불량률"
        │       ├── value: {defectRate.value}
        │       ├── suffix: "%"
        │       └── changeRate indicator
        └── KPICard (생산량) - FR-003, FR-004
            └── Ant Design Card + Statistic
                ├── title: "생산량"
                ├── value: {production.value}
                ├── suffix: "EA"
                └── changeRate indicator
```

### 6.2 KPI 카드 레이아웃

```
┌─────────────────────────────────────────────────────────────┐
│                        KPI Card Area                          │
├─────────────────┬─────────────────┬─────────────────┬────────┤
│  ┌───────────┐  │  ┌───────────┐  │  ┌───────────┐  │ ...    │
│  │ [icon]    │  │  │ [icon]    │  │  │ [icon]    │  │        │
│  │ 가동률    │  │  │ 불량률    │  │  │ 생산량    │  │        │
│  │           │  │  │           │  │  │           │  │        │
│  │  87.5%    │  │  │   1.2%    │  │  │ 15,420 EA │  │        │
│  │           │  │  │           │  │  │           │  │        │
│  │ ▲ +2.3%   │  │  │ ▼ -0.5%   │  │  │ ▲ +5.8%   │  │        │
│  │ (녹색)    │  │  │ (빨간색)  │  │  │ (녹색)    │  │        │
│  └───────────┘  │  └───────────┘  │  └───────────┘  │        │
│    FR-001       │    FR-002       │    FR-003       │        │
│    BR-001       │    BR-002       │    BR-001       │        │
└─────────────────┴─────────────────┴─────────────────┴────────┘
```

### 6.3 증감률 표시 규칙 (FR-004, BR-001~003)

| 증감률 조건 | 아이콘 | 색상 | 예시 |
|------------|--------|------|------|
| changeRate > 0 | ArrowUpOutlined | colorSuccess (#52c41a) | ▲ +2.3% |
| changeRate < 0 | ArrowDownOutlined | colorError (#ff4d4f) | ▼ -0.5% |
| changeRate === 0 | MinusOutlined | colorTextSecondary | - 0% |

---

## 7. 추적성 검증 요약

### 7.1 커버리지 통계

| 구분 | 총 항목 | 매핑 완료 | 미매핑 | 커버리지 |
|------|---------|----------|--------|---------|
| 기능 요구사항 (FR) | 5 | 5 | 0 | 100% |
| 비즈니스 규칙 (BR) | 4 | 4 | 0 | 100% |
| 단위 테스트 (UT) | 8 | 8 | 0 | 100% |
| E2E 테스트 | 4 | 4 | 0 | 100% |
| 매뉴얼 테스트 (TC) | 6 | 6 | 0 | 100% |

### 7.2 미매핑 항목 (있는 경우)

| 구분 | ID | 설명 | 미매핑 사유 |
|------|-----|------|-----------|
| - | - | - | 해당 없음 |

### 7.3 요구사항 커버리지 요약

| 요구사항 | 설명 | 설계 | 단위 테스트 | E2E 테스트 | 상태 |
|----------|------|------|-------------|------------|------|
| FR-001 | 가동률 카드 표시 | O | UT-001, UT-002 | E2E-001 | 완료 |
| FR-002 | 불량률 카드 표시 | O | UT-003, UT-004 | E2E-001 | 완료 |
| FR-003 | 생산량 카드 표시 | O | UT-005, UT-006 | E2E-001 | 완료 |
| FR-004 | 증감률 표시 | O | UT-007, UT-008 | E2E-002 | 완료 |
| FR-005 | Mock 데이터 로드 | O | UT-001 | E2E-003, E2E-004 | 완료 |
| BR-001 | 양수 증감률 처리 | O | UT-007 | E2E-002 | 완료 |
| BR-002 | 음수 증감률 처리 | O | UT-007 | E2E-002 | 완료 |
| BR-003 | 0% 증감률 처리 | O | UT-007 | E2E-002 | 완료 |
| BR-004 | 값 없음 처리 | O | UT-008 | E2E-004 | 완료 |

---

## 관련 문서

- 설계: `010-design.md`
- 테스트 명세: `026-test-specification.md`
- PRD: `.orchay/projects/mes-portal/prd.md` (섹션 4.1.1, 4.1.2)
- TRD: `.orchay/projects/mes-portal/trd.md` (섹션 2.3)
- WBS: `.orchay/projects/mes-portal/wbs.yaml`
- 의존 Task: TSK-07-01 (대시보드 레이아웃)

---

## 변경 이력

| 버전 | 일자 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0 | 2026-01-21 | Claude | 최초 작성 |

---

<!--
Task: TSK-07-02 KPI 카드 위젯
Domain: frontend
Category: development
Created: 2026-01-21
-->
