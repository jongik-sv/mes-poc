# 요구사항 추적성 매트릭스 (025-traceability-matrix.md)

**Template Version:** 1.0.0 — **Last Updated:** 2026-01-22

> **목적**: PRD → 기본설계 → 상세설계 → 테스트 4단계 양방향 추적
>
> **참조**: 이 문서는 `010-design.md`와 `026-test-specification.md`와 함께 사용됩니다.

---

## 0. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| Task ID | TSK-06-10 |
| Task명 | [샘플] 설비 모니터링 카드뷰 |
| PRD 참조 | PRD 4.1.1 화면 템플릿 샘플 - 특수 패턴 샘플 - 설비 모니터링 카드뷰 |
| 상세설계 참조 | `010-design.md` |
| 테스트 명세 참조 | `026-test-specification.md` |
| 작성일 | 2026-01-22 |
| 작성자 | Claude |

---

## 1. 기능 요구사항 추적 (FR → 설계 → 테스트)

> PRD → 기본설계 → 상세설계 → 테스트케이스 매핑

| 요구사항 ID | PRD 섹션 | 설계 섹션 | 단위 테스트 | E2E 테스트 | 매뉴얼 TC | 상태 |
|-------------|----------|-----------|-------------|------------|-----------|------|
| FR-001 | PRD 4.1.1 특수 패턴 | 3.1 카드 그리드 | UT-001, UT-002 | E2E-001 | TC-001 | 설계대기 |
| FR-002 | PRD 4.1.1 특수 패턴 | 3.2 상태 표시 | UT-003, UT-004 | E2E-001 | TC-001 | 설계대기 |
| FR-003 | PRD 4.1.1 특수 패턴 | 3.3 상세 Drawer | UT-005 | E2E-002 | TC-002 | 설계대기 |
| FR-004 | PRD 4.1.1 특수 패턴 | 3.4 실시간 갱신 | UT-006, UT-007 | E2E-003 | TC-003 | 설계대기 |
| FR-005 | PRD 4.1.1 특수 패턴 | 3.5 필터링 | UT-008, UT-009 | E2E-004 | TC-004 | 설계대기 |

### 1.1 요구사항별 상세 매핑

#### FR-001: 설비 상태 카드 그리드

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.1.1 특수 패턴 | 설비 상태 카드 그리드 (가동/정지/고장/점검) |
| 설계 | 010-design.md | 3.1 | 카드 그리드 레이아웃 설계 |
| 컴포넌트 | - | - | EquipmentMonitor.tsx, EquipmentCard.tsx |
| 단위 테스트 | 026-test-specification.md | 2.1 | UT-001: 카드 그리드 렌더링, UT-002: 반응형 브레이크포인트 |
| E2E 테스트 | 026-test-specification.md | 3.1 | E2E-001: 카드 그리드 통합 테스트 |

**PRD 원문:**
> - 설비 상태 카드 그리드 (가동/정지/고장/점검)

**인수 조건:**
> - 반응형 카드 그리드 (xs:1, sm:2, md:3, lg:4)

---

#### FR-002: 상태별 색상 구분

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.1.1 특수 패턴 | 상태별 색상 구분 (녹색/회색/빨강/노랑) |
| 설계 | 010-design.md | 3.2 | 상태 뱃지 및 색상 시스템 설계 |
| 컴포넌트 | - | - | EquipmentCard.tsx (StatusBadge) |
| 단위 테스트 | 026-test-specification.md | 2.2 | UT-003: 상태별 색상 매핑, UT-004: 뱃지 렌더링 |
| E2E 테스트 | 026-test-specification.md | 3.1 | E2E-001: 상태 표시 검증 |

**PRD 원문:**
> - 상태별 색상 구분 (녹색/회색/빨강/노랑)

**인수 조건:**
> - 상태별 뱃지 및 색상 적용

---

#### FR-003: 카드 클릭 시 상세 정보 Drawer

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.1.1 특수 패턴 | 카드 클릭 시 상세 정보 Drawer |
| 설계 | 010-design.md | 3.3 | Drawer 컴포넌트 설계 |
| 컴포넌트 | - | - | EquipmentDrawer.tsx (또는 EquipmentMonitor.tsx 내장) |
| 단위 테스트 | 026-test-specification.md | 2.3 | UT-005: Drawer 열기/닫기, 상세 정보 표시 |
| E2E 테스트 | 026-test-specification.md | 3.2 | E2E-002: Drawer 상호작용 테스트 |

**PRD 원문:**
> - 카드 클릭 시 상세 정보 Drawer

**인수 조건:**
> - Drawer로 상세 정보 표시

---

#### FR-004: 실시간 상태 갱신 시뮬레이션

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.1.1 특수 패턴 | 실시간 상태 갱신 시뮬레이션 |
| 설계 | 010-design.md | 3.4 | 실시간 갱신 로직 설계 (setInterval) |
| 컴포넌트 | - | - | EquipmentMonitor.tsx (useEffect + setInterval) |
| 단위 테스트 | 026-test-specification.md | 2.4 | UT-006: 갱신 주기 검증, UT-007: 상태 변경 처리 |
| E2E 테스트 | 026-test-specification.md | 3.3 | E2E-003: 실시간 갱신 시나리오 |

**PRD 원문:**
> - 실시간 상태 갱신 시뮬레이션

**인수 조건 (WBS):**
> - 실시간 상태 갱신 시뮬레이션 (5초 간격)

---

#### FR-005: 필터링 (상태별, 라인별)

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.1.1 특수 패턴 | (암묵적 요구사항 - WBS에서 명시) |
| 설계 | 010-design.md | 3.5 | 필터 UI 및 로직 설계 |
| 컴포넌트 | - | - | EquipmentMonitor.tsx (필터 영역) |
| 단위 테스트 | 026-test-specification.md | 2.5 | UT-008: 상태 필터링, UT-009: 라인 필터링 |
| E2E 테스트 | 026-test-specification.md | 3.4 | E2E-004: 필터 조합 테스트 |

**WBS 원문:**
> - 필터링 (상태별, 라인별)

---

## 2. 비즈니스 규칙 추적 (BR → 구현 → 검증)

| 규칙 ID | PRD/WBS 출처 | 설계 섹션 | 구현 위치(개념) | 단위 테스트 | E2E 테스트 | 검증 방법 | 상태 |
|---------|--------------|-----------|-----------------|-------------|------------|-----------|------|
| BR-001 | WBS items | 3.2 | 상태 색상 매핑 | UT-003 | E2E-001 | 상태별 올바른 색상 렌더링 확인 | 설계대기 |
| BR-002 | WBS items | 3.4 | 갱신 타이머 | UT-006 | E2E-003 | 5초 간격 갱신 동작 확인 | 설계대기 |
| BR-003 | WBS acceptance | 3.1 | 반응형 그리드 | UT-002 | E2E-001 | 브레이크포인트별 컬럼 수 확인 | 설계대기 |

### 2.1 비즈니스 규칙별 상세 매핑

#### BR-001: 상태별 색상 규칙

| 구분 | 내용 |
|------|------|
| **WBS 원문** | 상태별 색상 구분 (녹색/회색/빨강/노랑) |
| **설계 표현** | 상태-색상 매핑 상수 정의 |
| **구현 위치** | EquipmentCard.tsx 또는 constants/status.ts |
| **검증 방법** | 각 상태별 렌더링 결과 색상 확인 |
| **관련 테스트** | UT-003, E2E-001 |

**색상 매핑 규칙:**
| 상태 | 색상 | 의미 |
|------|------|------|
| 가동 (RUNNING) | 녹색 (#52c41a / success) | 정상 가동 중 |
| 정지 (STOPPED) | 회색 (#8c8c8c / default) | 계획된 정지 |
| 고장 (ERROR) | 빨강 (#f5222d / error) | 설비 이상 |
| 점검 (MAINTENANCE) | 노랑 (#faad14 / warning) | 유지보수 중 |

---

#### BR-002: 갱신 주기 규칙

| 구분 | 내용 |
|------|------|
| **WBS 원문** | 실시간 상태 갱신 시뮬레이션 (5초 간격) |
| **설계 표현** | REFRESH_INTERVAL = 5000ms |
| **구현 위치** | EquipmentMonitor.tsx useEffect |
| **검증 방법** | 5초마다 상태 갱신 함수 호출 확인 |
| **관련 테스트** | UT-006, UT-007, E2E-003 |

---

#### BR-003: 반응형 그리드 규칙

| 구분 | 내용 |
|------|------|
| **WBS 원문** | 반응형 카드 그리드 (xs:1, sm:2, md:3, lg:4) |
| **설계 표현** | Ant Design Row/Col span 설정 |
| **구현 위치** | EquipmentMonitor.tsx 그리드 레이아웃 |
| **검증 방법** | 각 브레이크포인트에서 컬럼 수 확인 |
| **관련 테스트** | UT-002, E2E-001 |

**브레이크포인트 규칙:**
| 화면 크기 | 브레이크포인트 | 컬럼 수 | Col span |
|-----------|---------------|---------|----------|
| xs | < 576px | 1 | 24 |
| sm | >= 576px | 2 | 12 |
| md | >= 768px | 3 | 8 |
| lg | >= 992px | 4 | 6 |

---

## 3. 테스트 역추적 매트릭스

> 테스트 결과 → 요구사항 역추적용 (build/verify 단계 결과서 생성 시 활용)

| 테스트 ID | 테스트 유형 | 검증 대상 요구사항 | 검증 대상 비즈니스 규칙 | 상태 |
|-----------|------------|-------------------|----------------------|------|
| UT-001 | 단위 | FR-001 | - | 미실행 |
| UT-002 | 단위 | FR-001 | BR-003 | 미실행 |
| UT-003 | 단위 | FR-002 | BR-001 | 미실행 |
| UT-004 | 단위 | FR-002 | - | 미실행 |
| UT-005 | 단위 | FR-003 | - | 미실행 |
| UT-006 | 단위 | FR-004 | BR-002 | 미실행 |
| UT-007 | 단위 | FR-004 | - | 미실행 |
| UT-008 | 단위 | FR-005 | - | 미실행 |
| UT-009 | 단위 | FR-005 | - | 미실행 |
| E2E-001 | E2E | FR-001, FR-002 | BR-001, BR-003 | 미실행 |
| E2E-002 | E2E | FR-003 | - | 미실행 |
| E2E-003 | E2E | FR-004 | BR-002 | 미실행 |
| E2E-004 | E2E | FR-005 | - | 미실행 |
| TC-001 | 매뉴얼 | FR-001, FR-002 | BR-001, BR-003 | 미실행 |
| TC-002 | 매뉴얼 | FR-003 | - | 미실행 |
| TC-003 | 매뉴얼 | FR-004 | BR-002 | 미실행 |
| TC-004 | 매뉴얼 | FR-005 | - | 미실행 |

---

## 4. 데이터 모델 추적

> Mock 데이터 구조 → 컴포넌트 Props 매핑

| Mock 데이터 | 데이터 위치 | 컴포넌트 Props | 사용 컴포넌트 |
|------------|------------|---------------|--------------|
| Equipment | mock-data/equipment.json | EquipmentData | EquipmentCard, EquipmentMonitor |
| EquipmentStatus | mock-data/equipment.json | status prop | EquipmentCard (Badge) |
| ProductionLine | mock-data/equipment.json | lineId, lineName | 필터 드롭다운 |

### 4.1 데이터 구조 명세

```typescript
// Equipment 데이터 구조
interface Equipment {
  id: string;
  name: string;
  code: string;
  status: EquipmentStatus;
  lineId: string;
  lineName: string;
  lastUpdateTime: string;
  operatingRate?: number;
  productionCount?: number;
  errorMessage?: string;
}

// 상태 열거형
type EquipmentStatus = 'RUNNING' | 'STOPPED' | 'ERROR' | 'MAINTENANCE';

// 생산 라인
interface ProductionLine {
  id: string;
  name: string;
}
```

---

## 5. 인터페이스 추적

> 이 Task는 프론트엔드 전용으로, API 엔드포인트 없음 (Mock 데이터 사용)

| 인터페이스 유형 | 설명 | 데이터 소스 | 요구사항 |
|----------------|------|------------|----------|
| Mock Data Load | 설비 목록 로드 | mock-data/equipment.json | FR-001 |
| 상태 갱신 시뮬레이션 | 랜덤 상태 변경 | 클라이언트 사이드 로직 | FR-004 |

---

## 6. 화면 추적

> 설계 화면 요구사항 → 컴포넌트 매핑

| 화면 설계 | 화면 파일 | 컴포넌트 | 요구사항 |
|----------|----------|----------|----------|
| 설비 모니터링 메인 | screens/sample/EquipmentMonitor.tsx | EquipmentMonitor | FR-001, FR-004, FR-005 |
| 설비 상태 카드 | components/sample/EquipmentCard.tsx | EquipmentCard | FR-002 |
| 설비 상세 Drawer | (EquipmentMonitor 내장 또는 별도) | EquipmentDrawer | FR-003 |

### 6.1 컴포넌트 계층 구조

```
EquipmentMonitor.tsx (screens/sample/)
├── 필터 영역 (상태 필터, 라인 필터) → FR-005
├── 카드 그리드 (Row/Col) → FR-001
│   └── EquipmentCard.tsx (components/sample/) → FR-002
│       ├── 상태 Badge
│       ├── 설비 정보
│       └── 가동률 표시
├── Drawer (설비 상세) → FR-003
└── 실시간 갱신 로직 (useEffect) → FR-004
```

### 6.2 UI 스펙 매핑

| PRD/WBS uiSpec | 컴포넌트 | 사용 여부 |
|----------------|----------|----------|
| Ant Design Card | EquipmentCard | O |
| Ant Design Row, Col | EquipmentMonitor | O |
| Ant Design Badge | EquipmentCard | O |
| Ant Design Tag | EquipmentCard (상태 표시) | O |
| Ant Design Drawer | EquipmentMonitor | O |
| Ant Design Select | 필터 영역 | O |

---

## 7. 추적성 검증 요약

### 7.1 커버리지 통계

| 구분 | 총 항목 | 매핑 완료 | 미매핑 | 커버리지 |
|------|---------|----------|--------|---------|
| 기능 요구사항 (FR) | 5 | 5 | 0 | 100% |
| 비즈니스 규칙 (BR) | 3 | 3 | 0 | 100% |
| 단위 테스트 (UT) | 9 | 9 | 0 | 100% |
| E2E 테스트 | 4 | 4 | 0 | 100% |
| 매뉴얼 테스트 (TC) | 4 | 4 | 0 | 100% |
| 화면 컴포넌트 | 3 | 3 | 0 | 100% |

### 7.2 요구사항-테스트 커버리지

| 요구사항 | UT 커버 | E2E 커버 | TC 커버 | 전체 커버 |
|----------|---------|----------|---------|----------|
| FR-001 | O (2건) | O (1건) | O (1건) | 완전 |
| FR-002 | O (2건) | O (1건) | O (1건) | 완전 |
| FR-003 | O (1건) | O (1건) | O (1건) | 완전 |
| FR-004 | O (2건) | O (1건) | O (1건) | 완전 |
| FR-005 | O (2건) | O (1건) | O (1건) | 완전 |

### 7.3 미매핑 항목

| 구분 | ID | 설명 | 미매핑 사유 |
|------|-----|------|-----------|
| - | - | - | 해당 없음 |

---

## 관련 문서

- 상세설계: `010-design.md`
- 테스트 명세: `026-test-specification.md`
- PRD: `.orchay/projects/mes-portal/prd.md` (섹션 4.1.1 특수 패턴 샘플)
- WBS: `.orchay/projects/mes-portal/wbs.yaml` (TSK-06-10)
- Mock 데이터: `mes-portal/mock-data/equipment.json`

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
