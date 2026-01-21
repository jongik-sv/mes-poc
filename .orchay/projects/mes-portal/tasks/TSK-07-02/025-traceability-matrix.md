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

> **긍정/부정 KPI 개념**: 설계 문서(010-design.md) 섹션 8.1 참조
> - **긍정 KPI (positive)**: 값 증가가 좋음 - 생산량(production), 가동률(efficiency), 작업지시(orders)
> - **부정 KPI (negative)**: 값 감소가 좋음 - 불량률(defect)

| 규칙 ID | PRD 출처 | 설계 섹션 | 구현 위치(개념) | 단위 테스트 | E2E 테스트 | 검증 방법 | 상태 |
|---------|----------|-----------|-----------------|-------------|------------|-----------|------|
| BR-001 | 4.1.1 | 8.1 | KPICard, ChangeIndicator | UT-004 | E2E-003 | **긍정 KPI** 증가(increase) 시 상승 화살표 + **녹색** 확인 | 설계완료 |
| BR-002 | 4.1.1 | 8.1 | KPICard, ChangeIndicator | UT-004-2 | E2E-003 | **긍정 KPI** 감소(decrease) 시 하락 화살표 + **빨간색** 확인 | 설계완료 |
| BR-003 | 4.1.1 | 8.1 | KPICard, ChangeIndicator | UT-005 | E2E-003 | **부정 KPI(불량률)** 증가(increase) 시 상승 화살표 + **빨간색** 확인 | 설계완료 |
| BR-004 | 4.1.1 | 8.1 | KPICard, ChangeIndicator | UT-005-2 | E2E-003 | **부정 KPI(불량률)** 감소(decrease) 시 하락 화살표 + **녹색** 확인 | 설계완료 |
| BR-005 | 4.1.1 | 8.1 | KPICard, ChangeIndicator | UT-006 | E2E-003 | 변화 없음(neutral) 시 MinusOutlined + **회색** 확인 | 설계완료 |
| BR-006 | 4.1.1 | 8.2 | KPICard | UT-010 | E2E-002 | 정수 값에 천 단위 콤마 적용 (예: 1,247) | 설계완료 |
| BR-007 | 4.1.1 | 8.2 | KPICard | UT-010-2 | E2E-002 | 비율(unit='%')은 소수점 1자리까지 표시 (예: 87.3) | 설계완료 |
| BR-008 | 4.1.1 | 8.2 | KPICard | UT-010-3 | E2E-002 | 수량/건수(unit='개','건')는 정수로 표시 | 설계완료 |
| BR-009 | 4.1.1 | 9.1 | KPICard | UT-007 | E2E-004 | KPI 값 없을 때 "-" 표시 확인 | 설계완료 |

### 2.1 비즈니스 규칙별 상세 매핑

#### BR-001: 긍정 KPI 증가 시 상승 화살표 + 녹색

| 구분 | 내용 |
|------|------|
| **PRD 원문** | KPI 카드 위젯 - 증감률 표시 |
| **설계 표현** | 긍정 KPI(생산량/가동률/작업지시) + changeType='increase': ArrowUpOutlined + colorSuccess(#52c41a) |
| **구현 위치** | ChangeIndicator 컴포넌트 - getChangeColor() 함수 |
| **검증 방법** | valueType='positive' + changeType='increase' 시 녹색 상승 화살표 확인 |
| **관련 테스트** | UT-004, E2E-003 |

#### BR-002: 긍정 KPI 감소 시 하락 화살표 + 빨간색

| 구분 | 내용 |
|------|------|
| **PRD 원문** | KPI 카드 위젯 - 증감률 표시 |
| **설계 표현** | 긍정 KPI(생산량/가동률) + changeType='decrease': ArrowDownOutlined + colorError(#ff4d4f) |
| **구현 위치** | ChangeIndicator 컴포넌트 - getChangeColor() 함수 |
| **검증 방법** | valueType='positive' + changeType='decrease' 시 빨간색 하락 화살표 확인 |
| **관련 테스트** | UT-004-2, E2E-003 |

#### BR-003: 부정 KPI(불량률) 증가 시 상승 화살표 + 빨간색

| 구분 | 내용 |
|------|------|
| **PRD 원문** | KPI 카드 위젯 - 증감률 표시 (불량률 특수 규칙) |
| **설계 표현** | 부정 KPI(불량률) + changeType='increase': ArrowUpOutlined + colorError(#ff4d4f) |
| **구현 위치** | ChangeIndicator 컴포넌트 - getChangeColor() 함수 |
| **검증 방법** | valueType='negative' + changeType='increase' 시 **빨간색** 상승 화살표 확인 |
| **관련 테스트** | UT-005, E2E-003 |

#### BR-004: 부정 KPI(불량률) 감소 시 하락 화살표 + 녹색

| 구분 | 내용 |
|------|------|
| **PRD 원문** | KPI 카드 위젯 - 증감률 표시 (불량률 특수 규칙) |
| **설계 표현** | 부정 KPI(불량률) + changeType='decrease': ArrowDownOutlined + colorSuccess(#52c41a) |
| **구현 위치** | ChangeIndicator 컴포넌트 - getChangeColor() 함수 |
| **검증 방법** | valueType='negative' + changeType='decrease' 시 **녹색** 하락 화살표 확인 |
| **관련 테스트** | UT-005-2, E2E-003 |

#### BR-005: 변화 없음(neutral) 시 회색 표시

| 구분 | 내용 |
|------|------|
| **PRD 원문** | KPI 카드 위젯 - 증감률 표시 (변화 없음 케이스) |
| **설계 표현** | changeType='neutral': MinusOutlined + colorTextSecondary(회색) |
| **구현 위치** | ChangeIndicator 컴포넌트 - getChangeColor() 함수 |
| **검증 방법** | changeType='neutral' 시 회색 스타일 확인 |
| **관련 테스트** | UT-006, E2E-003 |

#### BR-006: 천 단위 콤마 적용

| 구분 | 내용 |
|------|------|
| **PRD 원문** | KPI 카드 위젯 - 숫자 포맷팅 |
| **설계 표현** | 정수 값에 toLocaleString('ko-KR') 적용 |
| **구현 위치** | KPICard 컴포넌트 - formatKPIValue() 함수 |
| **검증 방법** | 1247 → "1,247" 포맷팅 확인 |
| **관련 테스트** | UT-010, E2E-002 |

#### BR-007: 비율 소수점 1자리 표시

| 구분 | 내용 |
|------|------|
| **PRD 원문** | KPI 카드 위젯 - 숫자 포맷팅 |
| **설계 표현** | unit='%'일 때 value.toFixed(1) 적용 |
| **구현 위치** | KPICard 컴포넌트 - formatKPIValue() 함수 |
| **검증 방법** | 87.35 → "87.4" 포맷팅 확인 |
| **관련 테스트** | UT-010-2, E2E-002 |

#### BR-008: 수량/건수 정수 표시

| 구분 | 내용 |
|------|------|
| **PRD 원문** | KPI 카드 위젯 - 숫자 포맷팅 |
| **설계 표현** | unit='개' 또는 '건'일 때 정수로 표시 (소수점 버림) |
| **구현 위치** | KPICard 컴포넌트 - formatKPIValue() 함수 |
| **검증 방법** | 15.7 → "15" 포맷팅 확인 |
| **관련 테스트** | UT-010-3, E2E-002 |

#### BR-009: KPI 값이 없을 때 "-" 표시

| 구분 | 내용 |
|------|------|
| **PRD 원문** | KPI 카드 위젯 - 데이터 없음 처리 |
| **설계 표현** | value가 null/undefined일 때 Ant Design Statistic에 "-" 표시 |
| **구현 위치** | KPICard 컴포넌트 - value prop null 처리 |
| **검증 방법** | value prop이 없을 때 "-" 텍스트 표시 확인 |
| **관련 테스트** | UT-007, E2E-004 |

---

## 3. 테스트 역추적 매트릭스

> 테스트 결과 → 요구사항 역추적용 (build/verify 단계 결과서 생성 시 활용)

| 테스트 ID | 테스트 유형 | 검증 대상 요구사항 | 검증 대상 비즈니스 규칙 | 상태 |
|-----------|------------|-------------------|----------------------|------|
| UT-001 | 단위 | FR-001 (가동률) | BR-006, BR-007 | 미실행 |
| UT-002 | 단위 | FR-002 (불량률) | BR-003, BR-004, BR-007 | 미실행 |
| UT-003 | 단위 | FR-003 (생산량) | BR-006, BR-008 | 미실행 |
| UT-004 | 단위 | FR-004, FR-006 (작업지시) | BR-001, BR-008 | 미실행 |
| UT-004-2 | 단위 | FR-004 | BR-002 | 미실행 |
| UT-005 | 단위 | FR-004 (불량률 증감) | BR-003 | 미실행 |
| UT-005-2 | 단위 | FR-004 (불량률 증감) | BR-004 | 미실행 |
| UT-006 | 단위 | FR-004 | BR-005 | 미실행 |
| UT-007 | 단위 | FR-001~FR-006 | BR-009 | 미실행 |
| UT-008 | 단위 | FR-004 | - | 미실행 |
| UT-010 | 단위 | FR-003 | BR-006 | 미실행 |
| UT-010-2 | 단위 | FR-001, FR-002 | BR-007 | 미실행 |
| UT-010-3 | 단위 | FR-003, FR-006 | BR-008 | 미실행 |
| E2E-001 | E2E | FR-001, FR-002, FR-003, FR-006 | - | 미실행 |
| E2E-002 | E2E | FR-001~FR-006 | BR-006, BR-007, BR-008 | 미실행 |
| E2E-003 | E2E | FR-004 | BR-001, BR-002, BR-003, BR-004, BR-005 | 미실행 |
| E2E-004 | E2E | FR-005 | BR-009 | 미실행 |
| TC-001 | 매뉴얼 | FR-001 | - | 미실행 |
| TC-002 | 매뉴얼 | FR-002 | BR-003, BR-004 | 미실행 |
| TC-003 | 매뉴얼 | FR-003 | - | 미실행 |
| TC-004 | 매뉴얼 | FR-006 (작업지시) | - | 미실행 |
| TC-005 | 매뉴얼 | FR-004 | BR-001~BR-005 | 미실행 |
| TC-006 | 매뉴얼 | FR-005 | BR-009 | 미실행 |

---

## 4. 데이터 모델 추적

> Mock 데이터 구조 → Props 인터페이스 매핑 (설계 문서 010-design.md 섹션 7 기준)

| Mock 데이터 필드 | KPICardData 인터페이스 | 타입 | 용도 |
|-----------------|----------------------|------|------|
| kpiCards[].id | id | string | KPI 고유 ID (production, efficiency, defect, orders) |
| kpiCards[].title | title | string | 카드 제목 (금일 생산량, 가동률 등) |
| kpiCards[].value | value | number | 현재 KPI 값 |
| kpiCards[].unit | unit | string | 단위 (개, %, 건) |
| kpiCards[].change | change | number | 변화율 (양수: 증가, 음수: 감소) |
| kpiCards[].changeType | changeType | KPIChangeType | 변화 유형 ('increase' \| 'decrease' \| 'neutral') |
| kpiCards[].icon | icon | string | 아이콘 이름 |
| - (KPI_CONFIG에서 조회) | valueType | KPIValueType | KPI 유형 ('positive' \| 'negative') |

### 4.1 Mock 데이터 구조 (dashboard.json)

> 설계 문서 섹션 7.2 기준 - kpiCards 배열 구조

```json
{
  "kpiCards": [
    {
      "id": "production",
      "title": "금일 생산량",
      "value": 1247,
      "unit": "개",
      "change": 12.5,
      "changeType": "increase",
      "icon": "package"
    },
    {
      "id": "efficiency",
      "title": "가동률",
      "value": 87.3,
      "unit": "%",
      "change": 2.1,
      "changeType": "increase",
      "icon": "activity"
    },
    {
      "id": "defect",
      "title": "불량률",
      "value": 1.2,
      "unit": "%",
      "change": -0.3,
      "changeType": "decrease",
      "icon": "alert-triangle"
    },
    {
      "id": "orders",
      "title": "작업지시",
      "value": 15,
      "unit": "건",
      "change": 0,
      "changeType": "neutral",
      "icon": "clipboard"
    }
  ]
}
```

---

## 5. 인터페이스 추적

> 컴포넌트 Props 인터페이스 매핑 (설계 문서 010-design.md 섹션 7.3 기준)

| 인터페이스 | Props | 타입 | 요구사항 |
|-----------|-------|------|----------|
| KPICardData | id | string | FR-001~FR-006 |
| KPICardData | title | string | FR-001~FR-006 |
| KPICardData | value | number | FR-001~FR-006 |
| KPICardData | unit | string | FR-001~FR-006 |
| KPICardData | change | number | FR-004 |
| KPICardData | changeType | KPIChangeType | FR-004, BR-001~BR-005 |
| KPICardData | icon | string | FR-001~FR-006 |
| KPICardProps | data | KPICardData | FR-001~FR-006 |
| KPICardProps | loading | boolean | - (UI 상태) |
| KPICardProps | valueType | KPIValueType | BR-001~BR-004 |
| KPICardProps | onClick | () => void | - (향후 확장) |
| KPICardProps | className | string | - (스타일링) |

### 5.1 TypeScript 인터페이스 정의

```typescript
// types/dashboard.ts (설계 문서 섹션 7.3 기준)

/**
 * KPI 변화 유형
 */
type KPIChangeType = 'increase' | 'decrease' | 'neutral';

/**
 * KPI 유형 (긍정/부정 판단용)
 * - positive: 값 증가가 좋은 KPI (생산량, 가동률, 작업지시)
 * - negative: 값 감소가 좋은 KPI (불량률)
 */
type KPIValueType = 'positive' | 'negative';

/**
 * KPI 카드 데이터 인터페이스
 */
interface KPICardData {
  id: string;              // 고유 ID (production, efficiency, defect, orders)
  title: string;           // 제목 (금일 생산량, 가동률 등)
  value: number;           // 현재 값
  unit: string;            // 단위 (개, %, 건)
  change: number;          // 변화율 (양수: 증가, 음수: 감소)
  changeType: KPIChangeType; // 변화 유형
  icon: string;            // 아이콘 이름
}

/**
 * KPICard 컴포넌트 Props
 */
interface KPICardProps {
  data: KPICardData;
  loading?: boolean;
  valueType?: KPIValueType; // 기본값: 'positive'
  onClick?: () => void;
  className?: string;
}
```

---

## 6. 화면 추적

> 기본설계 화면 요구사항 → 상세설계 컴포넌트 매핑 (설계 문서 섹션 5 기준)

| 기본설계 화면 | 상세설계 화면 | 컴포넌트 | 요구사항 |
|--------------|--------------|----------|----------|
| 대시보드 KPI 영역 | /sample/dashboard | KPICardGroup | FR-001~FR-006, FR-004 |
| 가동률 카드 | 대시보드 상단 (id=efficiency) | KPICard | FR-001, BR-001, BR-002 |
| 불량률 카드 | 대시보드 상단 (id=defect) | KPICard | FR-002, BR-003, BR-004 |
| 생산량 카드 | 대시보드 상단 (id=production) | KPICard | FR-003, BR-001, BR-002 |
| 작업지시 카드 | 대시보드 상단 (id=orders) | KPICard | FR-006, BR-001, BR-005 |

### 6.1 컴포넌트 구조

```
Dashboard (screens/dashboard/Dashboard.tsx)
└── KPICardGroup (FR-001~FR-006)
    └── Row/Col (반응형 그리드: xs=24 sm=12 md=6)
        ├── KPICard (가동률/efficiency) - FR-001, FR-004
        │   └── Ant Design Card + Statistic
        │       ├── data.id: "efficiency"
        │       ├── data.title: "가동률"
        │       ├── data.value: 87.3
        │       ├── data.unit: "%"
        │       ├── data.changeType: "increase"
        │       ├── valueType: "positive"
        │       └── ChangeIndicator (change=2.1, green)
        ├── KPICard (불량률/defect) - FR-002, FR-004
        │   └── Ant Design Card + Statistic
        │       ├── data.id: "defect"
        │       ├── data.title: "불량률"
        │       ├── data.value: 1.2
        │       ├── data.unit: "%"
        │       ├── data.changeType: "decrease"
        │       ├── valueType: "negative" ← 부정 KPI
        │       └── ChangeIndicator (change=-0.3, GREEN - 감소가 좋음)
        ├── KPICard (생산량/production) - FR-003, FR-004
        │   └── Ant Design Card + Statistic
        │       ├── data.id: "production"
        │       ├── data.title: "금일 생산량"
        │       ├── data.value: 1247
        │       ├── data.unit: "개"
        │       ├── data.changeType: "increase"
        │       ├── valueType: "positive"
        │       └── ChangeIndicator (change=12.5, green)
        └── KPICard (작업지시/orders) - FR-006, FR-004
            └── Ant Design Card + Statistic
                ├── data.id: "orders"
                ├── data.title: "작업지시"
                ├── data.value: 15
                ├── data.unit: "건"
                ├── data.changeType: "neutral"
                ├── valueType: "positive"
                └── ChangeIndicator (change=0, gray)
```

### 6.2 KPI 카드 레이아웃 (설계 문서 섹션 5.2 기준)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  대시보드                                                                     │
│                                                                               │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│  │ [⚡] 가동률      │ │ [⚠️] 불량률      │ │ [📦] 금일 생산량 │ │ [📋] 작업지시    │
│  │                  │ │                  │ │                  │ │                  │
│  │    87.3 %        │ │    1.2 %         │ │   1,247 개       │ │    15 건         │
│  │                  │ │                  │ │                  │ │                  │
│  │   ▲ +2.1%       │ │   ▼ -0.3%       │ │   ▲ +12.5%      │ │   ─ 0%          │
│  │   (녹색)         │ │   (녹색)         │ │   (녹색)         │ │   (회색)         │
│  └──────────────────┘ └──────────────────┘ └──────────────────┘ └──────────────────┘
│    id=efficiency      id=defect           id=production        id=orders         │
│    FR-001, BR-001    FR-002, BR-003,BR-004 FR-003, BR-001      FR-006, BR-005    │
│    valueType=positive valueType=negative   valueType=positive  valueType=positive │
└──────────────────────────────────────────────────────────────────────────────┘

레이아웃: Row + Col (xs={24} sm={12} md={6}) - 반응형 4열/2열/1열
```

### 6.3 증감률 표시 규칙 (FR-004, BR-001~BR-005)

> **핵심**: KPI 유형(valueType)과 변화 방향(changeType)의 조합으로 색상 결정

| KPI 유형 | changeType | 화살표 | 색상 | 예시 |
|----------|------------|--------|------|------|
| positive | increase | ArrowUpOutlined | colorSuccess (#52c41a) | 가동률 ▲ +2.1% (녹색) |
| positive | decrease | ArrowDownOutlined | colorError (#ff4d4f) | 생산량 ▼ -5.0% (빨간색) |
| **negative** | **increase** | ArrowUpOutlined | **colorError (#ff4d4f)** | **불량률 ▲ +0.5% (빨간색)** |
| **negative** | **decrease** | ArrowDownOutlined | **colorSuccess (#52c41a)** | **불량률 ▼ -0.3% (녹색)** |
| any | neutral | MinusOutlined | colorTextSecondary | 작업지시 ─ 0% (회색) |

**불량률 특수 규칙 (BR-003, BR-004)**:
- 불량률은 `valueType='negative'`로 설정
- 불량률 증가(increase) → 나쁨 → **빨간색**
- 불량률 감소(decrease) → 좋음 → **녹색**

---

## 7. 추적성 검증 요약

### 7.1 커버리지 통계

| 구분 | 총 항목 | 매핑 완료 | 미매핑 | 커버리지 |
|------|---------|----------|--------|---------|
| 기능 요구사항 (FR) | 6 | 6 | 0 | 100% |
| 비즈니스 규칙 (BR) | 9 | 9 | 0 | 100% |
| 단위 테스트 (UT) | 14 | 14 | 0 | 100% |
| E2E 테스트 | 4 | 4 | 0 | 100% |
| 매뉴얼 테스트 (TC) | 6 | 6 | 0 | 100% |

### 7.2 미매핑 항목 (있는 경우)

| 구분 | ID | 설명 | 미매핑 사유 |
|------|-----|------|-----------|
| - | - | - | 해당 없음 |

### 7.3 요구사항 커버리지 요약

| 요구사항 | 설명 | 설계 | 단위 테스트 | E2E 테스트 | 상태 |
|----------|------|------|-------------|------------|------|
| FR-001 | 가동률 카드 표시 | O | UT-001 | E2E-001, E2E-002 | 완료 |
| FR-002 | 불량률 카드 표시 | O | UT-002 | E2E-001, E2E-002 | 완료 |
| FR-003 | 생산량 카드 표시 | O | UT-003 | E2E-001, E2E-002 | 완료 |
| FR-004 | 증감률 표시 | O | UT-004~UT-006 | E2E-003 | 완료 |
| FR-005 | Mock 데이터 로드 | O | - | E2E-004 | 완료 |
| FR-006 | 작업지시 카드 표시 | O | UT-004 | E2E-001, E2E-002 | 완료 |
| BR-001 | 긍정 KPI 증가 → 녹색 | O | UT-004 | E2E-003 | 완료 |
| BR-002 | 긍정 KPI 감소 → 빨간색 | O | UT-004-2 | E2E-003 | 완료 |
| BR-003 | 부정 KPI(불량률) 증가 → 빨간색 | O | UT-005 | E2E-003 | 완료 |
| BR-004 | 부정 KPI(불량률) 감소 → 녹색 | O | UT-005-2 | E2E-003 | 완료 |
| BR-005 | 변화 없음(neutral) → 회색 | O | UT-006 | E2E-003 | 완료 |
| BR-006 | 천 단위 콤마 포맷팅 | O | UT-010 | E2E-002 | 완료 |
| BR-007 | 비율 소수점 1자리 표시 | O | UT-010-2 | E2E-002 | 완료 |
| BR-008 | 수량/건수 정수 표시 | O | UT-010-3 | E2E-002 | 완료 |
| BR-009 | 값 없음 시 "-" 표시 | O | UT-007 | E2E-004 | 완료 |

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
| 1.1 | 2026-01-21 | Claude | 설계 리뷰 반영: BR 정의 수정 (긍정/부정 KPI 개념), 작업지시(orders) 카드 추가, data-testid 통일, Mock 데이터 구조 통일 |

---

<!--
Task: TSK-07-02 KPI 카드 위젯
Domain: frontend
Category: development
Created: 2026-01-21
-->
