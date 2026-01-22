# 테스트 명세서 (026-test-specification.md)

**Template Version:** 1.0.0 - **Last Updated:** 2026-01-22

> **목적**: 설비 모니터링 카드뷰 샘플 화면의 단위 테스트, E2E 테스트, 매뉴얼 테스트 시나리오 및 테스트 데이터 정의
>
> **참조**: 이 문서는 `010-design.md`, `025-traceability-matrix.md`와 함께 사용됩니다.
>
> **활용 단계**: `/wf:build`, `/wf:test` 단계에서 테스트 코드 생성 기준으로 사용

---

## 0. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| Task ID | TSK-06-10 |
| Task명 | [샘플] 설비 모니터링 카드뷰 |
| Category | development |
| Domain | frontend |
| PRD 참조 | PRD 4.1.1 카드뷰 샘플 |
| 작성일 | 2026-01-22 |
| 작성자 | Claude |

---

## 1. 테스트 전략 개요

### 1.1 테스트 범위

| 테스트 유형 | 범위 | 목표 커버리지 |
|------------|------|--------------|
| 단위 테스트 | EquipmentCard 컴포넌트, 상태 색상 유틸리티, 필터 로직, 실시간 갱신 훅 | 80% 이상 |
| E2E 테스트 | 카드 그리드 렌더링, Drawer 열기/닫기, 필터링 동작, 실시간 갱신 | 100% 시나리오 커버 |
| 매뉴얼 테스트 | UI/UX, 반응형 레이아웃, 접근성, 상태별 색상 확인 | 전체 화면 |

### 1.2 테스트 환경

| 항목 | 내용 |
|------|------|
| 테스트 프레임워크 (단위) | Vitest + React Testing Library |
| 테스트 프레임워크 (E2E) | Playwright |
| UI 컴포넌트 라이브러리 | Ant Design 6.x (Card, Row, Col, Badge, Tag, Drawer, Select) |
| 브라우저 | Chromium (기본), Firefox, WebKit |
| 베이스 URL | `http://localhost:3000` |
| Mock 데이터 | `mock-data/equipment.json` |

### 1.3 테스트 우선순위

| 우선순위 | 영역 | 근거 |
|---------|------|------|
| P1 (Critical) | 카드 그리드 렌더링, 상태별 색상/뱃지 | 핵심 시각화 기능 |
| P2 (High) | Drawer 상세 정보 표시, 필터링 | 사용자 인터랙션 |
| P3 (Medium) | 실시간 갱신 시뮬레이션, 반응형 레이아웃 | 부가 기능 |
| P4 (Low) | 접근성, 키보드 탐색 | 품질 향상 |

### 1.4 테스트 대상 컴포넌트

```typescript
// types/equipment.ts

type EquipmentStatus = 'running' | 'stopped' | 'fault' | 'maintenance';

interface Equipment {
  id: string;
  name: string;           // 설비명
  code: string;           // 설비 코드
  line: string;           // 라인 (1라인, 2라인 등)
  status: EquipmentStatus;
  lastUpdate: string;     // ISO 8601
  operator?: string;      // 담당자
  temperature?: number;   // 온도 (옵션)
  runtime?: number;       // 가동 시간 (분)
  errorCode?: string;     // 고장 코드 (fault 시)
}

// components/sample/EquipmentCard.tsx
interface EquipmentCardProps {
  equipment: Equipment;
  onClick?: (equipment: Equipment) => void;
  loading?: boolean;
}

// screens/sample/EquipmentMonitor.tsx
interface EquipmentMonitorProps {
  refreshInterval?: number;  // 기본값: 5000 (5초)
}
```

---

## 2. 단위 테스트 시나리오

### 2.1 테스트 케이스 목록

| 테스트 ID | 대상 | 시나리오 | 예상 결과 | 요구사항 |
|-----------|------|----------|----------|----------|
| UT-001 | EquipmentCard | 가동(running) 상태 카드 렌더링 | 녹색 배경/뱃지, 설비명, 상태 표시 | FR-001, BR-001 |
| UT-002 | EquipmentCard | 정지(stopped) 상태 카드 렌더링 | 회색 배경/뱃지, 설비명, 상태 표시 | FR-001, BR-002 |
| UT-003 | EquipmentCard | 고장(fault) 상태 카드 렌더링 | 빨간색 배경/뱃지, 설비명, 고장코드 표시 | FR-001, BR-003 |
| UT-004 | EquipmentCard | 점검(maintenance) 상태 카드 렌더링 | 노란색 배경/뱃지, 설비명, 상태 표시 | FR-001, BR-004 |
| UT-005 | EquipmentCard | 카드 클릭 이벤트 핸들링 | onClick 콜백 호출, equipment 데이터 전달 | FR-002 |
| UT-006 | EquipmentCard | 로딩 상태 표시 | Skeleton 또는 Spin 표시 | NFR-001 |
| UT-007 | getStatusColor | 상태별 색상 반환 유틸리티 | running: green, stopped: gray, fault: red, maintenance: gold | BR-001~BR-004 |
| UT-008 | getStatusText | 상태별 텍스트 반환 유틸리티 | running: 가동, stopped: 정지, fault: 고장, maintenance: 점검 | BR-005 |
| UT-009 | filterEquipment | 상태별 필터링 | 선택된 상태의 설비만 반환 | FR-003 |
| UT-010 | filterEquipment | 라인별 필터링 | 선택된 라인의 설비만 반환 | FR-004 |
| UT-011 | filterEquipment | 복합 필터링 (상태 + 라인) | 두 조건 모두 충족하는 설비 반환 | FR-003, FR-004, BR-006 |
| UT-012 | useEquipmentRefresh | 실시간 갱신 훅 타이머 | 지정 간격(5초)으로 갱신 함수 호출 | FR-005, BR-007 |
| UT-013 | EquipmentMonitor | 카드 그리드 렌더링 | 모든 설비 카드가 그리드로 표시 | FR-001 |
| UT-014 | EquipmentMonitor | Drawer 열기 | 카드 클릭 시 Drawer 표시 | FR-002 |
| UT-015 | EquipmentMonitor | Drawer 닫기 | 닫기 버튼 클릭 시 Drawer 숨김 | FR-002 |
| UT-016 | EquipmentDrawer | 상세 정보 표시 | 설비 정보, 담당자, 온도, 가동시간 표시 | FR-002, BR-008 |
| UT-017 | EquipmentCard | data-testid 속성 렌더링 | 모든 testid 속성 존재 | NFR-002 |

### 2.2 테스트 케이스 상세

#### UT-001: 가동(running) 상태 카드 렌더링

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/EquipmentMonitor/__tests__/EquipmentCard.test.tsx` |
| **테스트 블록** | `describe('EquipmentCard') -> describe('상태별 렌더링') -> it('should render running status with green color')` |
| **Mock 의존성** | - |
| **입력 데이터** | `{ id: 'eq-001', name: 'CNC 가공기 1호', status: 'running', line: '1라인', ... }` |
| **검증 포인트** | 1. 녹색 배경 또는 테두리<br>2. 녹색 Badge 표시<br>3. 설비명 '가동' 상태 텍스트<br>4. data-testid `equipment-card-eq-001` 존재 |
| **커버리지 대상** | status='running' 렌더링 분기 (BR-001) |
| **관련 요구사항** | FR-001, BR-001 |

```typescript
it('should render running status with green color', () => {
  const equipment: Equipment = {
    id: 'eq-001',
    name: 'CNC 가공기 1호',
    code: 'CNC-001',
    line: '1라인',
    status: 'running',
    lastUpdate: '2026-01-22T10:30:00Z',
    operator: '홍길동',
    temperature: 45.2,
    runtime: 480
  }

  render(<EquipmentCard equipment={equipment} />)

  // 카드 존재 확인
  const card = screen.getByTestId('equipment-card-eq-001')
  expect(card).toBeInTheDocument()

  // 설비명 확인
  expect(screen.getByText('CNC 가공기 1호')).toBeInTheDocument()

  // 상태 텍스트 확인
  expect(screen.getByText('가동')).toBeInTheDocument()

  // 녹색 Badge/Tag 확인
  const statusBadge = screen.getByTestId('equipment-status-badge-eq-001')
  expect(statusBadge).toHaveClass(/green|success/)
})
```

#### UT-002: 정지(stopped) 상태 카드 렌더링

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/EquipmentMonitor/__tests__/EquipmentCard.test.tsx` |
| **테스트 블록** | `describe('EquipmentCard') -> describe('상태별 렌더링') -> it('should render stopped status with gray color')` |
| **입력 데이터** | `{ id: 'eq-002', name: 'CNC 가공기 2호', status: 'stopped', ... }` |
| **검증 포인트** | 1. 회색 배경 또는 테두리<br>2. 회색 Badge 표시<br>3. '정지' 상태 텍스트 |
| **커버리지 대상** | status='stopped' 렌더링 분기 (BR-002) |
| **관련 요구사항** | FR-001, BR-002 |

```typescript
it('should render stopped status with gray color', () => {
  const equipment: Equipment = {
    id: 'eq-002',
    name: 'CNC 가공기 2호',
    code: 'CNC-002',
    line: '1라인',
    status: 'stopped',
    lastUpdate: '2026-01-22T09:00:00Z'
  }

  render(<EquipmentCard equipment={equipment} />)

  expect(screen.getByText('정지')).toBeInTheDocument()

  const statusBadge = screen.getByTestId('equipment-status-badge-eq-002')
  expect(statusBadge).toHaveClass(/gray|default/)
})
```

#### UT-003: 고장(fault) 상태 카드 렌더링

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/EquipmentMonitor/__tests__/EquipmentCard.test.tsx` |
| **테스트 블록** | `describe('EquipmentCard') -> describe('상태별 렌더링') -> it('should render fault status with red color')` |
| **입력 데이터** | `{ id: 'eq-003', name: '프레스 1호', status: 'fault', errorCode: 'E-0045', ... }` |
| **검증 포인트** | 1. 빨간색 배경 또는 테두리<br>2. 빨간색 Badge 표시<br>3. '고장' 상태 텍스트<br>4. 고장 코드 표시 |
| **커버리지 대상** | status='fault' 렌더링 분기 (BR-003) |
| **관련 요구사항** | FR-001, BR-003 |

```typescript
it('should render fault status with red color and error code', () => {
  const equipment: Equipment = {
    id: 'eq-003',
    name: '프레스 1호',
    code: 'PRS-001',
    line: '2라인',
    status: 'fault',
    lastUpdate: '2026-01-22T08:45:00Z',
    errorCode: 'E-0045'
  }

  render(<EquipmentCard equipment={equipment} />)

  expect(screen.getByText('고장')).toBeInTheDocument()
  expect(screen.getByText('E-0045')).toBeInTheDocument()

  const statusBadge = screen.getByTestId('equipment-status-badge-eq-003')
  expect(statusBadge).toHaveClass(/red|error/)
})
```

#### UT-004: 점검(maintenance) 상태 카드 렌더링

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/EquipmentMonitor/__tests__/EquipmentCard.test.tsx` |
| **테스트 블록** | `describe('EquipmentCard') -> describe('상태별 렌더링') -> it('should render maintenance status with yellow color')` |
| **입력 데이터** | `{ id: 'eq-004', name: '용접기 1호', status: 'maintenance', ... }` |
| **검증 포인트** | 1. 노란색 배경 또는 테두리<br>2. 노란색 Badge 표시<br>3. '점검' 상태 텍스트 |
| **커버리지 대상** | status='maintenance' 렌더링 분기 (BR-004) |
| **관련 요구사항** | FR-001, BR-004 |

```typescript
it('should render maintenance status with yellow color', () => {
  const equipment: Equipment = {
    id: 'eq-004',
    name: '용접기 1호',
    code: 'WLD-001',
    line: '3라인',
    status: 'maintenance',
    lastUpdate: '2026-01-22T07:30:00Z',
    operator: '김기술'
  }

  render(<EquipmentCard equipment={equipment} />)

  expect(screen.getByText('점검')).toBeInTheDocument()

  const statusBadge = screen.getByTestId('equipment-status-badge-eq-004')
  expect(statusBadge).toHaveClass(/gold|warning|yellow/)
})
```

#### UT-005: 카드 클릭 이벤트 핸들링

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/EquipmentMonitor/__tests__/EquipmentCard.test.tsx` |
| **테스트 블록** | `describe('EquipmentCard') -> describe('인터랙션') -> it('should call onClick with equipment data when clicked')` |
| **Mock 의존성** | `vi.fn()` for onClick |
| **검증 포인트** | onClick 콜백 호출, 전달된 equipment 객체 확인 |
| **커버리지 대상** | 클릭 이벤트 핸들러 |
| **관련 요구사항** | FR-002 |

```typescript
it('should call onClick with equipment data when clicked', async () => {
  const mockOnClick = vi.fn()
  const equipment: Equipment = {
    id: 'eq-001',
    name: 'CNC 가공기 1호',
    code: 'CNC-001',
    line: '1라인',
    status: 'running',
    lastUpdate: '2026-01-22T10:30:00Z'
  }

  render(<EquipmentCard equipment={equipment} onClick={mockOnClick} />)

  const card = screen.getByTestId('equipment-card-eq-001')
  await userEvent.click(card)

  expect(mockOnClick).toHaveBeenCalledTimes(1)
  expect(mockOnClick).toHaveBeenCalledWith(equipment)
})
```

#### UT-006: 로딩 상태 표시

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/EquipmentMonitor/__tests__/EquipmentCard.test.tsx` |
| **테스트 블록** | `describe('EquipmentCard') -> describe('로딩 상태') -> it('should show loading skeleton when loading')` |
| **입력 데이터** | `{ equipment: mockEquipment, loading: true }` |
| **검증 포인트** | Skeleton 또는 Card.Meta loading 표시 |
| **커버리지 대상** | loading 상태 렌더링 |
| **관련 요구사항** | NFR-001 |

```typescript
it('should show loading skeleton when loading', () => {
  const equipment: Equipment = {
    id: 'eq-001',
    name: 'CNC 가공기 1호',
    code: 'CNC-001',
    line: '1라인',
    status: 'running',
    lastUpdate: '2026-01-22T10:30:00Z'
  }

  render(<EquipmentCard equipment={equipment} loading={true} />)

  // 카드는 렌더링되어야 함
  expect(screen.getByTestId('equipment-card-eq-001')).toBeInTheDocument()

  // Skeleton 또는 로딩 상태 확인
  const skeleton = document.querySelector('.ant-skeleton')
  expect(skeleton).toBeInTheDocument()
})
```

#### UT-007: 상태별 색상 반환 유틸리티

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/EquipmentMonitor/__tests__/utils.test.ts` |
| **테스트 블록** | `describe('getStatusColor') -> it('should return correct color for each status')` |
| **검증 포인트** | 모든 상태에 대한 색상 반환 확인 |
| **커버리지 대상** | getStatusColor 유틸리티 함수 |
| **관련 요구사항** | BR-001~BR-004 |

```typescript
describe('getStatusColor', () => {
  it('should return green for running status', () => {
    expect(getStatusColor('running')).toBe('green')
  })

  it('should return gray for stopped status', () => {
    expect(getStatusColor('stopped')).toBe('default') // Ant Design 기본 회색
  })

  it('should return red for fault status', () => {
    expect(getStatusColor('fault')).toBe('red')
  })

  it('should return gold for maintenance status', () => {
    expect(getStatusColor('maintenance')).toBe('gold')
  })
})
```

#### UT-008: 상태별 텍스트 반환 유틸리티

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/EquipmentMonitor/__tests__/utils.test.ts` |
| **테스트 블록** | `describe('getStatusText') -> it('should return correct text for each status')` |
| **검증 포인트** | 모든 상태에 대한 한글 텍스트 반환 확인 |
| **커버리지 대상** | getStatusText 유틸리티 함수 |
| **관련 요구사항** | BR-005 |

```typescript
describe('getStatusText', () => {
  it('should return "가동" for running status', () => {
    expect(getStatusText('running')).toBe('가동')
  })

  it('should return "정지" for stopped status', () => {
    expect(getStatusText('stopped')).toBe('정지')
  })

  it('should return "고장" for fault status', () => {
    expect(getStatusText('fault')).toBe('고장')
  })

  it('should return "점검" for maintenance status', () => {
    expect(getStatusText('maintenance')).toBe('점검')
  })
})
```

#### UT-009: 상태별 필터링

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/EquipmentMonitor/__tests__/utils.test.ts` |
| **테스트 블록** | `describe('filterEquipment') -> describe('상태 필터') -> it('should filter by status')` |
| **입력 데이터** | 다양한 상태의 설비 목록, 필터: 'running' |
| **검증 포인트** | running 상태인 설비만 반환 |
| **커버리지 대상** | filterEquipment - 상태 필터 분기 |
| **관련 요구사항** | FR-003 |

```typescript
it('should filter equipment by status', () => {
  const equipments: Equipment[] = [
    { id: 'eq-001', name: 'CNC 1호', code: 'CNC-001', line: '1라인', status: 'running', lastUpdate: '2026-01-22T10:00:00Z' },
    { id: 'eq-002', name: 'CNC 2호', code: 'CNC-002', line: '1라인', status: 'stopped', lastUpdate: '2026-01-22T10:00:00Z' },
    { id: 'eq-003', name: 'CNC 3호', code: 'CNC-003', line: '2라인', status: 'running', lastUpdate: '2026-01-22T10:00:00Z' },
    { id: 'eq-004', name: '프레스 1호', code: 'PRS-001', line: '2라인', status: 'fault', lastUpdate: '2026-01-22T10:00:00Z' }
  ]

  const filtered = filterEquipment(equipments, { status: 'running' })

  expect(filtered).toHaveLength(2)
  expect(filtered.every(eq => eq.status === 'running')).toBe(true)
})
```

#### UT-010: 라인별 필터링

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/EquipmentMonitor/__tests__/utils.test.ts` |
| **테스트 블록** | `describe('filterEquipment') -> describe('라인 필터') -> it('should filter by line')` |
| **입력 데이터** | 다양한 라인의 설비 목록, 필터: '1라인' |
| **검증 포인트** | 1라인 설비만 반환 |
| **커버리지 대상** | filterEquipment - 라인 필터 분기 |
| **관련 요구사항** | FR-004 |

```typescript
it('should filter equipment by line', () => {
  const equipments: Equipment[] = [
    { id: 'eq-001', name: 'CNC 1호', code: 'CNC-001', line: '1라인', status: 'running', lastUpdate: '2026-01-22T10:00:00Z' },
    { id: 'eq-002', name: 'CNC 2호', code: 'CNC-002', line: '1라인', status: 'stopped', lastUpdate: '2026-01-22T10:00:00Z' },
    { id: 'eq-003', name: 'CNC 3호', code: 'CNC-003', line: '2라인', status: 'running', lastUpdate: '2026-01-22T10:00:00Z' },
    { id: 'eq-004', name: '프레스 1호', code: 'PRS-001', line: '2라인', status: 'fault', lastUpdate: '2026-01-22T10:00:00Z' }
  ]

  const filtered = filterEquipment(equipments, { line: '1라인' })

  expect(filtered).toHaveLength(2)
  expect(filtered.every(eq => eq.line === '1라인')).toBe(true)
})
```

#### UT-011: 복합 필터링 (상태 + 라인)

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/EquipmentMonitor/__tests__/utils.test.ts` |
| **테스트 블록** | `describe('filterEquipment') -> describe('복합 필터') -> it('should filter by status AND line')` |
| **입력 데이터** | 다양한 상태/라인의 설비 목록, 필터: { status: 'running', line: '1라인' } |
| **검증 포인트** | 두 조건 모두 만족하는 설비만 반환 |
| **커버리지 대상** | filterEquipment - AND 조건 분기 (BR-006) |
| **관련 요구사항** | FR-003, FR-004, BR-006 |

```typescript
it('should filter equipment by status AND line', () => {
  const equipments: Equipment[] = [
    { id: 'eq-001', name: 'CNC 1호', code: 'CNC-001', line: '1라인', status: 'running', lastUpdate: '2026-01-22T10:00:00Z' },
    { id: 'eq-002', name: 'CNC 2호', code: 'CNC-002', line: '1라인', status: 'stopped', lastUpdate: '2026-01-22T10:00:00Z' },
    { id: 'eq-003', name: 'CNC 3호', code: 'CNC-003', line: '2라인', status: 'running', lastUpdate: '2026-01-22T10:00:00Z' },
    { id: 'eq-004', name: '프레스 1호', code: 'PRS-001', line: '2라인', status: 'fault', lastUpdate: '2026-01-22T10:00:00Z' }
  ]

  const filtered = filterEquipment(equipments, { status: 'running', line: '1라인' })

  expect(filtered).toHaveLength(1)
  expect(filtered[0].id).toBe('eq-001')
})
```

#### UT-012: 실시간 갱신 훅 타이머

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/EquipmentMonitor/__tests__/useEquipmentRefresh.test.ts` |
| **테스트 블록** | `describe('useEquipmentRefresh') -> it('should call refresh function at specified interval')` |
| **Mock 의존성** | `vi.useFakeTimers()` |
| **검증 포인트** | 5초 간격으로 갱신 함수 호출 |
| **커버리지 대상** | useEquipmentRefresh 훅 타이머 로직 (BR-007) |
| **관련 요구사항** | FR-005, BR-007 |

```typescript
import { renderHook, act } from '@testing-library/react'

describe('useEquipmentRefresh', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should call refresh function at specified interval', () => {
    const mockRefresh = vi.fn()

    renderHook(() => useEquipmentRefresh(mockRefresh, 5000))

    // 초기 호출 없음
    expect(mockRefresh).not.toHaveBeenCalled()

    // 5초 경과
    act(() => {
      vi.advanceTimersByTime(5000)
    })
    expect(mockRefresh).toHaveBeenCalledTimes(1)

    // 10초 경과 (총 2회)
    act(() => {
      vi.advanceTimersByTime(5000)
    })
    expect(mockRefresh).toHaveBeenCalledTimes(2)
  })

  it('should clear interval on unmount', () => {
    const mockRefresh = vi.fn()

    const { unmount } = renderHook(() => useEquipmentRefresh(mockRefresh, 5000))

    unmount()

    act(() => {
      vi.advanceTimersByTime(10000)
    })

    // unmount 후 호출되지 않아야 함
    expect(mockRefresh).not.toHaveBeenCalled()
  })
})
```

#### UT-013: EquipmentMonitor 카드 그리드 렌더링

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/EquipmentMonitor/__tests__/EquipmentMonitor.test.tsx` |
| **테스트 블록** | `describe('EquipmentMonitor') -> describe('렌더링') -> it('should render equipment cards in grid')` |
| **Mock 의존성** | `mock-data/equipment.json` |
| **검증 포인트** | 모든 설비 카드가 그리드 레이아웃으로 표시 |
| **커버리지 대상** | EquipmentMonitor 기본 렌더링 |
| **관련 요구사항** | FR-001 |

```typescript
it('should render equipment cards in grid', async () => {
  render(<EquipmentMonitor />)

  // 페이지 컨테이너 확인
  expect(screen.getByTestId('equipment-monitor-page')).toBeInTheDocument()

  // 카드 그리드 확인
  await waitFor(() => {
    const cards = screen.getAllByTestId(/^equipment-card-/)
    expect(cards.length).toBeGreaterThan(0)
  })
})
```

#### UT-014: EquipmentMonitor Drawer 열기

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/EquipmentMonitor/__tests__/EquipmentMonitor.test.tsx` |
| **테스트 블록** | `describe('EquipmentMonitor') -> describe('Drawer') -> it('should open drawer when card is clicked')` |
| **검증 포인트** | 카드 클릭 시 Drawer 표시, 설비 정보 포함 |
| **커버리지 대상** | Drawer 열기 로직 |
| **관련 요구사항** | FR-002 |

```typescript
it('should open drawer when card is clicked', async () => {
  render(<EquipmentMonitor />)

  // 첫 번째 카드 클릭
  await waitFor(() => {
    const cards = screen.getAllByTestId(/^equipment-card-/)
    expect(cards.length).toBeGreaterThan(0)
  })

  const firstCard = screen.getAllByTestId(/^equipment-card-/)[0]
  await userEvent.click(firstCard)

  // Drawer 표시 확인
  await waitFor(() => {
    expect(screen.getByTestId('equipment-drawer')).toBeInTheDocument()
  })
})
```

#### UT-015: EquipmentMonitor Drawer 닫기

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/EquipmentMonitor/__tests__/EquipmentMonitor.test.tsx` |
| **테스트 블록** | `describe('EquipmentMonitor') -> describe('Drawer') -> it('should close drawer when close button is clicked')` |
| **검증 포인트** | 닫기 버튼 클릭 시 Drawer 숨김 |
| **커버리지 대상** | Drawer 닫기 로직 |
| **관련 요구사항** | FR-002 |

```typescript
it('should close drawer when close button is clicked', async () => {
  render(<EquipmentMonitor />)

  // 카드 클릭하여 Drawer 열기
  await waitFor(() => {
    const cards = screen.getAllByTestId(/^equipment-card-/)
    expect(cards.length).toBeGreaterThan(0)
  })

  const firstCard = screen.getAllByTestId(/^equipment-card-/)[0]
  await userEvent.click(firstCard)

  await waitFor(() => {
    expect(screen.getByTestId('equipment-drawer')).toBeInTheDocument()
  })

  // 닫기 버튼 클릭
  const closeButton = screen.getByTestId('equipment-drawer-close')
  await userEvent.click(closeButton)

  // Drawer 숨김 확인
  await waitFor(() => {
    expect(screen.queryByTestId('equipment-drawer')).not.toBeInTheDocument()
  })
})
```

#### UT-016: EquipmentDrawer 상세 정보 표시

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/EquipmentMonitor/__tests__/EquipmentDrawer.test.tsx` |
| **테스트 블록** | `describe('EquipmentDrawer') -> it('should display equipment details')` |
| **검증 포인트** | 설비 코드, 상태, 담당자, 온도, 가동시간 등 표시 |
| **커버리지 대상** | EquipmentDrawer 상세 정보 렌더링 (BR-008) |
| **관련 요구사항** | FR-002, BR-008 |

```typescript
it('should display equipment details', () => {
  const equipment: Equipment = {
    id: 'eq-001',
    name: 'CNC 가공기 1호',
    code: 'CNC-001',
    line: '1라인',
    status: 'running',
    lastUpdate: '2026-01-22T10:30:00Z',
    operator: '홍길동',
    temperature: 45.2,
    runtime: 480
  }

  render(<EquipmentDrawer equipment={equipment} open={true} onClose={() => {}} />)

  // 설비명 확인
  expect(screen.getByText('CNC 가공기 1호')).toBeInTheDocument()

  // 설비 코드 확인
  expect(screen.getByText('CNC-001')).toBeInTheDocument()

  // 라인 확인
  expect(screen.getByText('1라인')).toBeInTheDocument()

  // 담당자 확인
  expect(screen.getByText('홍길동')).toBeInTheDocument()

  // 온도 확인
  expect(screen.getByText(/45\.2/)).toBeInTheDocument()

  // 가동시간 확인 (480분 = 8시간)
  expect(screen.getByText(/480분|8시간/)).toBeInTheDocument()
})
```

#### UT-017: data-testid 속성 렌더링

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/EquipmentMonitor/__tests__/EquipmentCard.test.tsx` |
| **테스트 블록** | `describe('EquipmentCard') -> describe('접근성') -> it('should render all required data-testid attributes')` |
| **검증 포인트** | 모든 필수 data-testid 속성 존재 확인 |
| **커버리지 대상** | data-testid 속성 렌더링 |
| **관련 요구사항** | NFR-002 |

```typescript
it('should render all required data-testid attributes', () => {
  const equipment: Equipment = {
    id: 'eq-001',
    name: 'CNC 가공기 1호',
    code: 'CNC-001',
    line: '1라인',
    status: 'running',
    lastUpdate: '2026-01-22T10:30:00Z'
  }

  render(<EquipmentCard equipment={equipment} />)

  expect(screen.getByTestId('equipment-card-eq-001')).toBeInTheDocument()
  expect(screen.getByTestId('equipment-status-badge-eq-001')).toBeInTheDocument()
  expect(screen.getByTestId('equipment-name-eq-001')).toBeInTheDocument()
  expect(screen.getByTestId('equipment-line-eq-001')).toBeInTheDocument()
})
```

---

## 3. E2E 테스트 시나리오

### 3.1 테스트 케이스 목록

| 테스트 ID | 시나리오 | 사전조건 | 실행 단계 | 예상 결과 | 요구사항 |
|-----------|----------|----------|----------|----------|----------|
| E2E-001 | 설비 모니터링 페이지 로드 | 로그인 | 1. 페이지 접속 | 카드 그리드 표시, 4가지 상태 색상 확인 | FR-001, BR-001~BR-004 |
| E2E-002 | 반응형 카드 그리드 확인 | 페이지 로드 | 1. 브라우저 크기 조절 | xs:1열, sm:2열, md:3열, lg:4열 | NFR-003 |
| E2E-003 | 카드 클릭 시 Drawer 표시 | 페이지 로드 | 1. 설비 카드 클릭 | Drawer 열림, 상세 정보 표시 | FR-002 |
| E2E-004 | Drawer 닫기 | Drawer 열림 | 1. 닫기 버튼 또는 배경 클릭 | Drawer 닫힘 | FR-002 |
| E2E-005 | 상태별 필터링 | 페이지 로드 | 1. 상태 필터 선택 | 선택된 상태 설비만 표시 | FR-003 |
| E2E-006 | 라인별 필터링 | 페이지 로드 | 1. 라인 필터 선택 | 선택된 라인 설비만 표시 | FR-004 |
| E2E-007 | 복합 필터링 | 페이지 로드 | 1. 상태 + 라인 필터 선택 | 두 조건 만족하는 설비만 표시 | FR-003, FR-004, BR-006 |
| E2E-008 | 실시간 갱신 시뮬레이션 | 페이지 로드 | 1. 5초 대기 | 설비 상태 변경 확인 | FR-005, BR-007 |

### 3.2 테스트 케이스 상세

#### E2E-001: 설비 모니터링 페이지 로드

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/equipment-monitor.spec.ts` |
| **테스트명** | `test('설비 모니터링 페이지가 정상적으로 로드된다')` |
| **사전조건** | 로그인 (fixture 사용) |
| **data-testid 셀렉터** | |
| - 페이지 컨테이너 | `[data-testid="equipment-monitor-page"]` |
| - 설비 카드 | `[data-testid^="equipment-card-"]` |
| **검증 포인트** | 1. 페이지 로드 확인<br>2. 설비 카드 그리드 표시<br>3. 4가지 상태 색상 확인 |
| **스크린샷** | `e2e-001-equipment-monitor.png` |
| **관련 요구사항** | FR-001, BR-001~BR-004 |

```typescript
test('설비 모니터링 페이지가 정상적으로 로드된다', async ({ page }) => {
  // Given: 설비 모니터링 페이지 접속
  await page.goto('/sample/equipment-monitor')
  await page.waitForSelector('[data-testid="equipment-monitor-page"]')

  // Then: 설비 카드 그리드 표시 확인
  const cards = page.locator('[data-testid^="equipment-card-"]')
  await expect(cards).toHaveCount.greaterThan(0)

  // 4가지 상태 색상 확인 (녹색, 회색, 빨강, 노랑)
  const runningCard = page.locator('[data-testid="equipment-status-badge-eq-001"]')
  await expect(runningCard).toHaveClass(/green|success/)

  // 스크린샷
  await page.screenshot({ path: 'e2e-001-equipment-monitor.png' })
})
```

#### E2E-002: 반응형 카드 그리드 확인

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/equipment-monitor.spec.ts` |
| **테스트명** | `test('화면 크기에 따라 카드 그리드 열 수가 조정된다')` |
| **검증 포인트** | lg: 4열, md: 3열, sm: 2열, xs: 1열 |
| **스크린샷** | `e2e-002-responsive-*.png` |
| **관련 요구사항** | NFR-003 |

```typescript
test('화면 크기에 따라 카드 그리드 열 수가 조정된다', async ({ page }) => {
  await page.goto('/sample/equipment-monitor')

  // Desktop (lg: 1200px+) - 4열
  await page.setViewportSize({ width: 1280, height: 720 })
  await page.waitForSelector('[data-testid="equipment-monitor-page"]')
  await page.screenshot({ path: 'e2e-002-responsive-desktop.png' })

  // Tablet (md: 768px~1199px) - 3열
  await page.setViewportSize({ width: 992, height: 768 })
  await page.screenshot({ path: 'e2e-002-responsive-tablet.png' })

  // Small Tablet (sm: 576px~767px) - 2열
  await page.setViewportSize({ width: 768, height: 1024 })
  await page.screenshot({ path: 'e2e-002-responsive-small-tablet.png' })

  // Mobile (xs: ~575px) - 1열
  await page.setViewportSize({ width: 375, height: 667 })
  await page.screenshot({ path: 'e2e-002-responsive-mobile.png' })

  // 모바일에서도 모든 카드 표시 확인
  const cards = page.locator('[data-testid^="equipment-card-"]')
  await expect(cards).toHaveCount.greaterThan(0)
})
```

#### E2E-003: 카드 클릭 시 Drawer 표시

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/equipment-monitor.spec.ts` |
| **테스트명** | `test('설비 카드 클릭 시 상세 정보 Drawer가 표시된다')` |
| **data-testid 셀렉터** | |
| - Drawer | `[data-testid="equipment-drawer"]` |
| - 설비명 | `[data-testid="equipment-drawer-name"]` |
| - 설비 코드 | `[data-testid="equipment-drawer-code"]` |
| **검증 포인트** | Drawer 열림, 상세 정보 표시 |
| **스크린샷** | `e2e-003-drawer-open.png` |
| **관련 요구사항** | FR-002 |

```typescript
test('설비 카드 클릭 시 상세 정보 Drawer가 표시된다', async ({ page }) => {
  await page.goto('/sample/equipment-monitor')
  await page.waitForSelector('[data-testid="equipment-monitor-page"]')

  // 첫 번째 설비 카드 클릭
  const firstCard = page.locator('[data-testid^="equipment-card-"]').first()
  await firstCard.click()

  // Drawer 표시 확인
  await expect(page.locator('[data-testid="equipment-drawer"]')).toBeVisible()

  // 상세 정보 표시 확인
  await expect(page.locator('[data-testid="equipment-drawer-name"]')).toBeVisible()
  await expect(page.locator('[data-testid="equipment-drawer-code"]')).toBeVisible()
  await expect(page.locator('[data-testid="equipment-drawer-status"]')).toBeVisible()

  await page.screenshot({ path: 'e2e-003-drawer-open.png' })
})
```

#### E2E-004: Drawer 닫기

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/equipment-monitor.spec.ts` |
| **테스트명** | `test('Drawer 닫기 버튼 클릭 시 Drawer가 닫힌다')` |
| **data-testid 셀렉터** | |
| - 닫기 버튼 | `[data-testid="equipment-drawer-close"]` |
| **검증 포인트** | Drawer 숨김 |
| **관련 요구사항** | FR-002 |

```typescript
test('Drawer 닫기 버튼 클릭 시 Drawer가 닫힌다', async ({ page }) => {
  await page.goto('/sample/equipment-monitor')
  await page.waitForSelector('[data-testid="equipment-monitor-page"]')

  // 카드 클릭하여 Drawer 열기
  const firstCard = page.locator('[data-testid^="equipment-card-"]').first()
  await firstCard.click()
  await expect(page.locator('[data-testid="equipment-drawer"]')).toBeVisible()

  // 닫기 버튼 클릭
  await page.click('[data-testid="equipment-drawer-close"]')

  // Drawer 숨김 확인
  await expect(page.locator('[data-testid="equipment-drawer"]')).not.toBeVisible()
})
```

#### E2E-005: 상태별 필터링

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/equipment-monitor.spec.ts` |
| **테스트명** | `test('상태 필터 선택 시 해당 상태 설비만 표시된다')` |
| **data-testid 셀렉터** | |
| - 상태 필터 | `[data-testid="status-filter"]` |
| **검증 포인트** | 선택된 상태 설비만 표시 |
| **스크린샷** | `e2e-005-filter-status.png` |
| **관련 요구사항** | FR-003 |

```typescript
test('상태 필터 선택 시 해당 상태 설비만 표시된다', async ({ page }) => {
  await page.goto('/sample/equipment-monitor')
  await page.waitForSelector('[data-testid="equipment-monitor-page"]')

  // 초기 카드 수 확인
  const initialCount = await page.locator('[data-testid^="equipment-card-"]').count()

  // 상태 필터 - '가동' 선택
  await page.click('[data-testid="status-filter"]')
  await page.click('text=가동')

  // 필터링된 카드 수 확인
  await page.waitForTimeout(300) // 필터 적용 대기
  const filteredCards = page.locator('[data-testid^="equipment-card-"]')
  const filteredCount = await filteredCards.count()

  // 필터링되어 카드 수 감소 또는 동일
  expect(filteredCount).toBeLessThanOrEqual(initialCount)

  // 모든 카드가 '가동' 상태인지 확인
  const statusBadges = page.locator('[data-testid^="equipment-status-badge-"]')
  for (let i = 0; i < await statusBadges.count(); i++) {
    await expect(statusBadges.nth(i)).toHaveClass(/green|success/)
  }

  await page.screenshot({ path: 'e2e-005-filter-status.png' })
})
```

#### E2E-006: 라인별 필터링

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/equipment-monitor.spec.ts` |
| **테스트명** | `test('라인 필터 선택 시 해당 라인 설비만 표시된다')` |
| **data-testid 셀렉터** | |
| - 라인 필터 | `[data-testid="line-filter"]` |
| **검증 포인트** | 선택된 라인 설비만 표시 |
| **스크린샷** | `e2e-006-filter-line.png` |
| **관련 요구사항** | FR-004 |

```typescript
test('라인 필터 선택 시 해당 라인 설비만 표시된다', async ({ page }) => {
  await page.goto('/sample/equipment-monitor')
  await page.waitForSelector('[data-testid="equipment-monitor-page"]')

  // 라인 필터 - '1라인' 선택
  await page.click('[data-testid="line-filter"]')
  await page.click('text=1라인')

  // 필터링된 카드 확인
  await page.waitForTimeout(300)

  // 모든 카드가 '1라인'인지 확인
  const lineLabels = page.locator('[data-testid^="equipment-line-"]')
  for (let i = 0; i < await lineLabels.count(); i++) {
    await expect(lineLabels.nth(i)).toContainText('1라인')
  }

  await page.screenshot({ path: 'e2e-006-filter-line.png' })
})
```

#### E2E-007: 복합 필터링

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/equipment-monitor.spec.ts` |
| **테스트명** | `test('상태와 라인 동시 필터링이 정상 동작한다')` |
| **검증 포인트** | 두 조건 모두 만족하는 설비만 표시 (BR-006) |
| **스크린샷** | `e2e-007-filter-combined.png` |
| **관련 요구사항** | FR-003, FR-004, BR-006 |

```typescript
test('상태와 라인 동시 필터링이 정상 동작한다', async ({ page }) => {
  await page.goto('/sample/equipment-monitor')
  await page.waitForSelector('[data-testid="equipment-monitor-page"]')

  // 상태 필터 - '가동' 선택
  await page.click('[data-testid="status-filter"]')
  await page.click('text=가동')

  // 라인 필터 - '1라인' 선택
  await page.click('[data-testid="line-filter"]')
  await page.click('text=1라인')

  await page.waitForTimeout(300)

  // 모든 카드가 두 조건 만족하는지 확인
  const cards = page.locator('[data-testid^="equipment-card-"]')
  const count = await cards.count()

  if (count > 0) {
    // 상태 확인
    const statusBadges = page.locator('[data-testid^="equipment-status-badge-"]')
    for (let i = 0; i < await statusBadges.count(); i++) {
      await expect(statusBadges.nth(i)).toHaveClass(/green|success/)
    }

    // 라인 확인
    const lineLabels = page.locator('[data-testid^="equipment-line-"]')
    for (let i = 0; i < await lineLabels.count(); i++) {
      await expect(lineLabels.nth(i)).toContainText('1라인')
    }
  }

  await page.screenshot({ path: 'e2e-007-filter-combined.png' })
})
```

#### E2E-008: 실시간 갱신 시뮬레이션

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/equipment-monitor.spec.ts` |
| **테스트명** | `test('5초 간격으로 설비 상태가 갱신된다')` |
| **검증 포인트** | 5초 후 상태 변경 확인 (BR-007) |
| **스크린샷** | `e2e-008-refresh-before.png`, `e2e-008-refresh-after.png` |
| **관련 요구사항** | FR-005, BR-007 |

```typescript
test('5초 간격으로 설비 상태가 갱신된다', async ({ page }) => {
  await page.goto('/sample/equipment-monitor')
  await page.waitForSelector('[data-testid="equipment-monitor-page"]')

  // 초기 상태 스크린샷
  await page.screenshot({ path: 'e2e-008-refresh-before.png' })

  // 최종 업데이트 시간 기록
  const initialUpdateTime = await page.locator('[data-testid="last-update-time"]').textContent()

  // 5초 대기 (실시간 갱신 간격)
  await page.waitForTimeout(5500)

  // 갱신 후 스크린샷
  await page.screenshot({ path: 'e2e-008-refresh-after.png' })

  // 업데이트 시간 변경 확인
  const newUpdateTime = await page.locator('[data-testid="last-update-time"]').textContent()
  expect(newUpdateTime).not.toBe(initialUpdateTime)
})
```

---

## 4. UI 테스트케이스 (매뉴얼)

### 4.1 테스트 케이스 목록

| TC-ID | 테스트 항목 | 사전조건 | 테스트 단계 | 예상 결과 | 우선순위 | 요구사항 |
|-------|-----------|---------|-----------|----------|---------|----------|
| TC-001 | 카드 그리드 레이아웃 | 페이지 로드 | 1. 카드 배치 확인 | 균일한 카드 크기, 간격 일정 | High | FR-001 |
| TC-002 | 상태별 색상 구분 | 페이지 로드 | 1. 4가지 상태 카드 색상 확인 | 녹색/회색/빨강/노랑 명확히 구분 | High | BR-001~BR-004 |
| TC-003 | 뱃지 표시 확인 | 페이지 로드 | 1. 각 카드의 뱃지 확인 | 상태에 맞는 뱃지 색상 및 텍스트 | High | BR-001~BR-005 |
| TC-004 | 반응형 그리드 | 페이지 로드 | 1. 브라우저 크기 조절 | xs:1, sm:2, md:3, lg:4열 | Medium | NFR-003 |
| TC-005 | Drawer 상세 정보 | 카드 클릭 | 1. Drawer 내용 확인 | 설비명, 코드, 라인, 담당자, 온도, 가동시간 | Medium | FR-002, BR-008 |
| TC-006 | 필터 UI | 페이지 로드 | 1. 필터 드롭다운 확인 | 상태/라인 필터 선택 가능, 다중 선택 | Medium | FR-003, FR-004 |
| TC-007 | 접근성 (키보드) | 페이지 로드 | 1. Tab으로 탐색 | 카드 포커스 이동, Enter로 Drawer 열기 | Low | A11y |
| TC-008 | 다크 모드 | 다크 테마 | 1. 다크 모드 전환 | 카드 색상 적절히 적용, 대비 유지 | Low | A11y |
| TC-009 | 고장 코드 표시 | 고장 상태 설비 존재 | 1. 고장 카드 확인 | 고장 코드 표시 | Medium | BR-003 |

### 4.2 매뉴얼 테스트 상세

#### TC-001: 카드 그리드 레이아웃

**테스트 목적**: 설비 카드가 그리드 레이아웃으로 균일하게 표시되는지 확인

**테스트 단계**:
1. 설비 모니터링 페이지 `/sample/equipment-monitor` 접속
2. 카드 배치 및 크기 확인
3. 카드 간 간격 확인

**예상 결과**:
- 모든 카드 동일한 높이/너비
- 카드 간 간격 균일 (16px 또는 24px)
- Row/Col 기반 반응형 그리드

**검증 기준**:
- [ ] 카드 크기 일관성 (모두 동일)
- [ ] 카드 간 수평/수직 간격 동일
- [ ] 마지막 행 카드도 정렬 유지

---

#### TC-002: 상태별 색상 구분

**테스트 목적**: 4가지 설비 상태가 색상으로 명확히 구분되는지 확인

**테스트 단계**:
1. 페이지 로드 후 각 상태 카드 확인
2. 가동(running) - 녹색 확인
3. 정지(stopped) - 회색 확인
4. 고장(fault) - 빨간색 확인
5. 점검(maintenance) - 노란색 확인

**예상 결과**:
- 가동: 녹색 (#52c41a 또는 유사)
- 정지: 회색 (#8c8c8c 또는 유사)
- 고장: 빨간색 (#ff4d4f 또는 유사)
- 점검: 노란색 (#faad14 또는 유사)

**검증 기준**:
- [ ] 각 상태별 색상 명확히 구분
- [ ] 색상 대비 충분 (WCAG AA 기준)
- [ ] 색상 일관성 (배경, 테두리, 뱃지)

---

#### TC-003: 뱃지 표시 확인

**테스트 목적**: 각 카드에 상태를 나타내는 뱃지가 올바르게 표시되는지 확인

**테스트 단계**:
1. 각 상태별 카드의 뱃지 확인
2. 뱃지 색상 확인
3. 뱃지 텍스트 확인

**예상 결과**:
- 가동: 녹색 뱃지, '가동' 텍스트
- 정지: 회색 뱃지, '정지' 텍스트
- 고장: 빨간색 뱃지, '고장' 텍스트
- 점검: 노란색 뱃지, '점검' 텍스트

**검증 기준**:
- [ ] 뱃지 위치 일관성 (카드 우상단 또는 상단)
- [ ] 뱃지 텍스트 가독성
- [ ] 뱃지 색상과 상태 일치

---

#### TC-004: 반응형 그리드

**테스트 목적**: 화면 크기에 따라 카드 그리드 열 수가 올바르게 조정되는지 확인

**테스트 단계**:
1. 데스크톱 (1200px+): 4열 확인
2. 태블릿 (992px): 3열 확인
3. 작은 태블릿 (768px): 2열 확인
4. 모바일 (576px 미만): 1열 확인

**예상 결과**:
- lg (>= 1200px): 4열
- md (>= 992px): 3열
- sm (>= 768px): 2열
- xs (< 768px): 1열

**검증 기준**:
- [ ] 각 breakpoint에서 열 수 정확
- [ ] 리사이즈 시 부드러운 전환
- [ ] 모바일에서도 카드 정보 가독성 유지

---

#### TC-005: Drawer 상세 정보

**테스트 목적**: Drawer에 설비 상세 정보가 올바르게 표시되는지 확인

**테스트 단계**:
1. 설비 카드 클릭
2. Drawer 열림 확인
3. 상세 정보 항목 확인

**예상 결과**:
- 설비명, 설비 코드
- 라인 정보
- 현재 상태 (색상 포함)
- 담당자 (있는 경우)
- 온도 (있는 경우)
- 가동 시간 (있는 경우)
- 마지막 업데이트 시간

**검증 기준**:
- [ ] 모든 정보 항목 표시
- [ ] 정보 레이블과 값 구분 명확
- [ ] 상태 색상 카드와 일치
- [ ] 닫기 버튼 동작

---

## 5. 테스트 데이터 (Fixture)

### 5.1 Mock 데이터 구조

```typescript
// mock-data/equipment.json

{
  "equipment": [
    {
      "id": "eq-001",
      "name": "CNC 가공기 1호",
      "code": "CNC-001",
      "line": "1라인",
      "status": "running",
      "lastUpdate": "2026-01-22T10:30:00Z",
      "operator": "홍길동",
      "temperature": 45.2,
      "runtime": 480
    },
    {
      "id": "eq-002",
      "name": "CNC 가공기 2호",
      "code": "CNC-002",
      "line": "1라인",
      "status": "stopped",
      "lastUpdate": "2026-01-22T09:00:00Z"
    },
    {
      "id": "eq-003",
      "name": "프레스 1호",
      "code": "PRS-001",
      "line": "2라인",
      "status": "fault",
      "lastUpdate": "2026-01-22T08:45:00Z",
      "errorCode": "E-0045"
    },
    {
      "id": "eq-004",
      "name": "용접기 1호",
      "code": "WLD-001",
      "line": "3라인",
      "status": "maintenance",
      "lastUpdate": "2026-01-22T07:30:00Z",
      "operator": "김기술"
    },
    {
      "id": "eq-005",
      "name": "조립기 1호",
      "code": "ASM-001",
      "line": "1라인",
      "status": "running",
      "lastUpdate": "2026-01-22T10:25:00Z",
      "operator": "이작업",
      "temperature": 38.5,
      "runtime": 360
    },
    {
      "id": "eq-006",
      "name": "검사기 1호",
      "code": "INS-001",
      "line": "2라인",
      "status": "running",
      "lastUpdate": "2026-01-22T10:28:00Z",
      "operator": "박검사",
      "runtime": 420
    },
    {
      "id": "eq-007",
      "name": "도장기 1호",
      "code": "PNT-001",
      "line": "3라인",
      "status": "stopped",
      "lastUpdate": "2026-01-22T06:00:00Z"
    },
    {
      "id": "eq-008",
      "name": "포장기 1호",
      "code": "PKG-001",
      "line": "4라인",
      "status": "running",
      "lastUpdate": "2026-01-22T10:30:00Z",
      "operator": "최포장",
      "runtime": 500
    }
  ],
  "lines": ["1라인", "2라인", "3라인", "4라인"],
  "statuses": [
    { "value": "running", "label": "가동", "color": "green" },
    { "value": "stopped", "label": "정지", "color": "default" },
    { "value": "fault", "label": "고장", "color": "red" },
    { "value": "maintenance", "label": "점검", "color": "gold" }
  ]
}
```

### 5.2 단위 테스트용 Mock 데이터

| 데이터 ID | 용도 | 값 |
|-----------|------|-----|
| MOCK-EQ-RUNNING | 가동 상태 설비 | `{ id: 'eq-001', name: 'CNC 가공기 1호', status: 'running', ... }` |
| MOCK-EQ-STOPPED | 정지 상태 설비 | `{ id: 'eq-002', name: 'CNC 가공기 2호', status: 'stopped', ... }` |
| MOCK-EQ-FAULT | 고장 상태 설비 | `{ id: 'eq-003', name: '프레스 1호', status: 'fault', errorCode: 'E-0045', ... }` |
| MOCK-EQ-MAINTENANCE | 점검 상태 설비 | `{ id: 'eq-004', name: '용접기 1호', status: 'maintenance', ... }` |
| MOCK-EQ-LIST | 설비 목록 | 위 JSON의 equipment 배열 |
| MOCK-LINES | 라인 목록 | `['1라인', '2라인', '3라인', '4라인']` |

### 5.3 테스트용 TypeScript Fixture

```typescript
// fixtures/equipment.fixtures.ts

import type { Equipment, EquipmentStatus } from '@/types/equipment'

export const mockRunningEquipment: Equipment = {
  id: 'eq-001',
  name: 'CNC 가공기 1호',
  code: 'CNC-001',
  line: '1라인',
  status: 'running',
  lastUpdate: '2026-01-22T10:30:00Z',
  operator: '홍길동',
  temperature: 45.2,
  runtime: 480
}

export const mockStoppedEquipment: Equipment = {
  id: 'eq-002',
  name: 'CNC 가공기 2호',
  code: 'CNC-002',
  line: '1라인',
  status: 'stopped',
  lastUpdate: '2026-01-22T09:00:00Z'
}

export const mockFaultEquipment: Equipment = {
  id: 'eq-003',
  name: '프레스 1호',
  code: 'PRS-001',
  line: '2라인',
  status: 'fault',
  lastUpdate: '2026-01-22T08:45:00Z',
  errorCode: 'E-0045'
}

export const mockMaintenanceEquipment: Equipment = {
  id: 'eq-004',
  name: '용접기 1호',
  code: 'WLD-001',
  line: '3라인',
  status: 'maintenance',
  lastUpdate: '2026-01-22T07:30:00Z',
  operator: '김기술'
}

export const mockEquipmentList: Equipment[] = [
  mockRunningEquipment,
  mockStoppedEquipment,
  mockFaultEquipment,
  mockMaintenanceEquipment,
  {
    id: 'eq-005',
    name: '조립기 1호',
    code: 'ASM-001',
    line: '1라인',
    status: 'running',
    lastUpdate: '2026-01-22T10:25:00Z',
    operator: '이작업',
    temperature: 38.5,
    runtime: 360
  }
]

export const mockLines = ['1라인', '2라인', '3라인', '4라인']

export const mockStatuses: { value: EquipmentStatus; label: string; color: string }[] = [
  { value: 'running', label: '가동', color: 'green' },
  { value: 'stopped', label: '정지', color: 'default' },
  { value: 'fault', label: '고장', color: 'red' },
  { value: 'maintenance', label: '점검', color: 'gold' }
]
```

---

## 6. data-testid 목록

> 프론트엔드 컴포넌트에 적용할 `data-testid` 속성 정의

### 6.1 페이지 레벨 셀렉터

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `equipment-monitor-page` | 페이지 컨테이너 | 페이지 로드 확인 |
| `last-update-time` | 마지막 갱신 시간 | 실시간 갱신 확인 |

### 6.2 필터 영역 셀렉터

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `status-filter` | 상태 필터 Select | 상태 필터링 테스트 |
| `line-filter` | 라인 필터 Select | 라인 필터링 테스트 |
| `filter-reset-btn` | 필터 초기화 버튼 | 필터 리셋 테스트 |

### 6.3 카드 영역 셀렉터

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `equipment-card-grid` | 카드 그리드 컨테이너 | 그리드 레이아웃 확인 |
| `equipment-card-{id}` | 개별 설비 카드 | 특정 설비 카드 식별 |
| `equipment-status-badge-{id}` | 상태 뱃지 | 상태 색상 확인 |
| `equipment-name-{id}` | 설비명 | 설비명 표시 확인 |
| `equipment-line-{id}` | 라인 정보 | 라인 표시 확인 |
| `equipment-error-code-{id}` | 고장 코드 | 고장 코드 표시 확인 |

### 6.4 Drawer 영역 셀렉터

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `equipment-drawer` | Drawer 컨테이너 | Drawer 표시 확인 |
| `equipment-drawer-close` | Drawer 닫기 버튼 | 닫기 동작 테스트 |
| `equipment-drawer-name` | 설비명 (Drawer) | 상세 설비명 확인 |
| `equipment-drawer-code` | 설비 코드 | 설비 코드 확인 |
| `equipment-drawer-status` | 상태 (Drawer) | 상세 상태 확인 |
| `equipment-drawer-line` | 라인 (Drawer) | 라인 정보 확인 |
| `equipment-drawer-operator` | 담당자 | 담당자 정보 확인 |
| `equipment-drawer-temperature` | 온도 | 온도 정보 확인 |
| `equipment-drawer-runtime` | 가동 시간 | 가동 시간 확인 |

### 6.5 셀렉터 사용 예시

```typescript
// 컴포넌트 구현 시 적용 예시

// EquipmentMonitor.tsx
<div data-testid="equipment-monitor-page" className={styles.container}>
  <div className={styles.filterArea}>
    <Select data-testid="status-filter" placeholder="상태 선택" />
    <Select data-testid="line-filter" placeholder="라인 선택" />
  </div>

  <Row data-testid="equipment-card-grid" gutter={[16, 16]}>
    {filteredEquipment.map(eq => (
      <Col key={eq.id} xs={24} sm={12} md={8} lg={6}>
        <EquipmentCard equipment={eq} onClick={handleCardClick} />
      </Col>
    ))}
  </Row>

  <Drawer
    data-testid="equipment-drawer"
    open={drawerOpen}
    onClose={() => setDrawerOpen(false)}
  >
    <EquipmentDetail equipment={selectedEquipment} />
  </Drawer>
</div>

// EquipmentCard.tsx
<Card
  data-testid={`equipment-card-${equipment.id}`}
  hoverable
  onClick={() => onClick?.(equipment)}
>
  <Badge
    data-testid={`equipment-status-badge-${equipment.id}`}
    color={getStatusColor(equipment.status)}
    text={getStatusText(equipment.status)}
  />
  <div data-testid={`equipment-name-${equipment.id}`}>{equipment.name}</div>
  <div data-testid={`equipment-line-${equipment.id}`}>{equipment.line}</div>
  {equipment.errorCode && (
    <div data-testid={`equipment-error-code-${equipment.id}`}>
      {equipment.errorCode}
    </div>
  )}
</Card>
```

---

## 7. 테스트 커버리지 목표

### 7.1 단위 테스트 커버리지

| 대상 | 목표 | 최소 |
|------|------|------|
| Lines | 85% | 75% |
| Branches | 80% | 70% |
| Functions | 90% | 80% |
| Statements | 85% | 75% |

### 7.2 E2E 테스트 커버리지

| 구분 | 목표 |
|------|------|
| 주요 사용자 시나리오 | 100% |
| 기능 요구사항 (FR) | 100% 커버 |
| 비즈니스 규칙 (BR) | 100% 커버 |
| 에러 케이스 | 80% 커버 |

### 7.3 품질 게이트

| 항목 | 조건 | 실패 시 액션 |
|------|------|-------------|
| 단위 테스트 통과율 | 100% | 빌드 실패 |
| 커버리지 최소 기준 | Lines 75% 이상 | 경고 |
| E2E 테스트 통과율 | 100% | 배포 차단 |
| 카드 렌더링 성능 | 100개 카드 < 500ms | 최적화 필요 |

---

## 8. 위험 영역 및 집중 테스트 대상

### 8.1 고위험 영역

| 영역 | 위험 요소 | 테스트 전략 |
|------|----------|------------|
| 상태 색상 매핑 | 색상 상수 오류 | 모든 상태 색상 단위 테스트 |
| 실시간 갱신 | 메모리 누수, 타이머 정리 | 훅 unmount 시 cleanup 테스트 |
| 필터링 로직 | 복합 필터 AND 조건 누락 | 복합 필터 경계값 테스트 |
| 반응형 그리드 | breakpoint 경계 오류 | E2E 다양한 뷰포트 테스트 |

### 8.2 경계값 테스트

| 테스트 항목 | 경계값 | 테스트 케이스 |
|------------|--------|--------------|
| 설비 목록 개수 | 0, 1, 50, 100 | 빈 목록, 대용량 렌더링 |
| 갱신 간격 | 1000ms, 5000ms, 30000ms | 타이머 정확성 |
| 필터 조합 | 전체, 단일, 복합, 없음 | 필터 조합별 결과 |
| 뷰포트 크기 | 375, 576, 768, 992, 1200 | breakpoint 경계 |

### 8.3 접근성 테스트 포인트

| 항목 | 검증 내용 |
|------|----------|
| 카드 | role="article", aria-label 설비명 포함 |
| 상태 뱃지 | aria-label 상태 설명 |
| 필터 | aria-label="상태 필터", "라인 필터" |
| Drawer | role="dialog", aria-labelledby |
| 키보드 | Tab 탐색, Enter 클릭, Escape 닫기 |

---

## 9. 요구사항 추적 매트릭스

| 요구사항 ID | 요구사항 설명 | 단위 테스트 | E2E 테스트 | 매뉴얼 테스트 |
|-------------|--------------|------------|-----------|--------------|
| FR-001 | 설비 상태 카드 그리드 표시 | UT-001~UT-004, UT-013 | E2E-001, E2E-002 | TC-001, TC-002, TC-003 |
| FR-002 | 카드 클릭 시 Drawer 상세 정보 표시 | UT-005, UT-014~UT-016 | E2E-003, E2E-004 | TC-005 |
| FR-003 | 상태별 필터링 | UT-009, UT-011 | E2E-005, E2E-007 | TC-006 |
| FR-004 | 라인별 필터링 | UT-010, UT-011 | E2E-006, E2E-007 | TC-006 |
| FR-005 | 실시간 상태 갱신 시뮬레이션 (5초) | UT-012 | E2E-008 | - |
| BR-001 | 가동(running) 상태 → 녹색 | UT-001, UT-007 | E2E-001 | TC-002 |
| BR-002 | 정지(stopped) 상태 → 회색 | UT-002, UT-007 | E2E-001 | TC-002 |
| BR-003 | 고장(fault) 상태 → 빨간색, 고장코드 표시 | UT-003, UT-007 | E2E-001 | TC-002, TC-009 |
| BR-004 | 점검(maintenance) 상태 → 노란색 | UT-004, UT-007 | E2E-001 | TC-002 |
| BR-005 | 상태 텍스트 한글 표시 | UT-008 | E2E-001 | TC-003 |
| BR-006 | 복합 필터 AND 조건 적용 | UT-011 | E2E-007 | TC-006 |
| BR-007 | 5초 간격 갱신 | UT-012 | E2E-008 | - |
| BR-008 | Drawer 상세 정보 (담당자, 온도, 가동시간) | UT-016 | E2E-003 | TC-005 |
| NFR-001 | 로딩 상태 표시 | UT-006 | - | - |
| NFR-002 | data-testid 속성 | UT-017 | E2E-001 ~ E2E-008 | - |
| NFR-003 | 반응형 카드 그리드 (xs:1, sm:2, md:3, lg:4) | - | E2E-002 | TC-004 |

---

## 관련 문서

- 설계 문서: `010-design.md` (작성 예정)
- 추적성 매트릭스: `025-traceability-matrix.md` (작성 예정)
- PRD: `.orchay/projects/mes-portal/prd.md` (섹션 4.1.1 화면 템플릿 샘플 - 설비 모니터링 카드뷰)
- TRD: `.orchay/projects/mes-portal/trd.md` (Ant Design Card, Badge, Drawer 컴포넌트)

---

## 변경 이력

| 버전 | 일자 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0 | 2026-01-22 | Claude | 최초 작성 |

---

<!--
Task: TSK-06-10 [샘플] 설비 모니터링 카드뷰
Domain: frontend
Category: development
Created: 2026-01-22

테스트 범위:
- 단위 테스트: 17개 케이스 (UT-001 ~ UT-017)
- E2E 테스트: 8개 시나리오 (E2E-001 ~ E2E-008)
- 매뉴얼 테스트: 9개 케이스 (TC-001 ~ TC-009)
- data-testid: 22개 정의
-->
