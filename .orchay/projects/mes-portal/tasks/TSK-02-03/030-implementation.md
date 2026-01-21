# TSK-02-03 구현 보고서

## 개요

| 항목 | 값 |
|------|-----|
| Task ID | TSK-02-03 |
| Task 명 | 탭 드래그 앤 드롭 |
| 구현 일시 | 2026-01-21 |
| 구현 유형 | Frontend Only |

## 구현 범위

### 기능 요구사항 (FR)

| ID | 요구사항 | 구현 상태 | 구현 위치 |
|----|----------|-----------|-----------|
| FR-001 | 탭 드래그로 순서 변경 | 완료 | TabBar.tsx, SortableTabItem.tsx |
| FR-002 | 순서 상태 유지 | 완료 | context.tsx (REORDER_TABS) |
| FR-003 | 드래그 시각적 피드백 | 완료 | DragOverlay, SortableTabItem opacity |

### 비즈니스 규칙 (BR)

| ID | 규칙 | 구현 상태 | 구현 위치 |
|----|------|-----------|-----------|
| BR-001 | ESC 키로 드래그 취소 | 완료 | TabBar.tsx:88-98 |
| BR-002 | 같은 위치 드롭 무시 | 완료 | context.tsx:REORDER_TABS |
| BR-003 | 영역 밖 드롭 시 취소 | 완료 | TabBar.tsx:131-143 (over 검사) |

## 기술 구현

### 의존성 추가

```json
{
  "@dnd-kit/core": "^6.3.1",
  "@dnd-kit/sortable": "^10.0.0",
  "@dnd-kit/utilities": "^3.2.2"
}
```

### 파일 변경 내역

#### 1. lib/mdi/types.ts
- `reorderTabs` 함수 시그니처 추가

```typescript
/** 탭 순서 변경 (드래그 앤 드롭) - TSK-02-03 */
reorderTabs: (activeId: string, overId: string) => void;
```

#### 2. lib/mdi/context.tsx
- `REORDER_TABS` 액션 타입 추가
- `reorderTabs` 리듀서 로직 구현
- `reorderTabs` 콜백 함수 생성

```typescript
case 'REORDER_TABS': {
  const { activeId, overId } = action.payload;
  if (activeId === overId) return state;
  const oldIndex = state.tabs.findIndex((tab) => tab.id === activeId);
  const newIndex = state.tabs.findIndex((tab) => tab.id === overId);
  if (oldIndex === -1 || newIndex === -1) return state;
  const newTabs = [...state.tabs];
  const [movedTab] = newTabs.splice(oldIndex, 1);
  newTabs.splice(newIndex, 0, movedTab);
  return { ...state, tabs: newTabs };
}
```

#### 3. components/mdi/SortableTabItem.tsx (신규)
- `useSortable` 훅 사용
- 드래그 상태에 따른 스타일 적용
- TabContextMenu와 통합 (TSK-02-04와 연동)

```typescript
const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: tab.id });
```

#### 4. components/mdi/TabBar.tsx
- DndContext 통합
- SortableContext (horizontalListSortingStrategy)
- DragOverlay 컴포넌트
- ESC 키 이벤트 핸들러
- PointerSensor, KeyboardSensor 설정

#### 5. components/mdi/index.ts
- `SortableTabItem` export 추가

### 테스트 파일

| 파일 | 테스트 수 | 통과율 |
|------|-----------|--------|
| lib/mdi/__tests__/context.spec.tsx | 32 (7 신규) | 100% |
| tests/e2e/mdi-tab-dnd.spec.ts | 4 | 100% |

## 아키텍처 결정

### DnD 라이브러리 선택: @dnd-kit

**선택 이유:**
1. React 18/19 호환성 우수
2. 접근성(A11Y) 기본 지원
3. 키보드 네비게이션 지원
4. 가벼운 번들 사이즈
5. 유연한 센서 시스템

### 드래그 활성화 조건

```typescript
useSensor(PointerSensor, {
  activationConstraint: {
    distance: 5, // 5px 이상 이동 시 드래그 시작
  },
})
```

**이유:** 탭 클릭과 드래그를 구분하기 위해 최소 이동 거리 설정

## 테스트 결과 요약

| 구분 | 통과 | 실패 | 총계 | 통과율 |
|------|------|------|------|--------|
| Unit Tests | 32 | 0 | 32 | 100% |
| E2E Tests | 4 | 0 | 4 | 100% |

## 알려진 제한사항

1. 탭 간 컨텐츠 영역으로의 드래그는 지원하지 않음 (요구사항 외)
2. 멀티 탭 선택 드래그는 미지원 (향후 확장 가능)

## 요구사항 추적성

| 설계 문서 | 구현 | 테스트 |
|-----------|------|--------|
| 010-design.md FR-001 | context.tsx, TabBar.tsx | TC-REORDER-01~07, E2E-001 |
| 010-design.md BR-001 | TabBar.tsx:88-98 | E2E-002 |
| 010-design.md BR-003 | TabBar.tsx:131-143 | E2E-003 |
| 026-test-specification.md | 전체 | 070-tdd-test-results.md, 070-e2e-test-results.md |
