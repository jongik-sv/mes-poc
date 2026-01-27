# 사용자 매뉴얼: 권한 병합 및 체크 로직

**버전:** 1.0.0 -- **최종 수정일:** 2026-01-27

---

## 0. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| Task ID | TSK-03-01 |
| Task명 | 권한 병합 및 체크 로직 구현 |
| 대상 기능 | 권한 병합 엔진 및 권한 체크 API/Hook |
| 작성일 | 2026-01-27 |
| 버전 | 1.0.0 |

---

## 1. 개요

다중 역할을 가진 사용자의 권한을 자동으로 병합하고, 서버/클라이언트 양측에서 메뉴 및 액션 단위로 권한을 체크하는 기능이다.

### 1.1 구성 요소

```
┌─────────────────────────────────────────────────────────────┐
│  사용자 요청                                                  │
├──────────────────────┬──────────────────────────────────────┤
│  서버 (API Route)     │  클라이언트 (React)                   │
│                      │                                      │
│  permission-merge.ts │  usePermission Hook                  │
│  ability.ts          │    - can(menuId, action)             │
│  api-guard.ts        │    - getFieldConstraints()           │
│    requireMenu       │    - permissions                     │
│    Permission()      │                                      │
└──────────────────────┴──────────────────────────────────────┘
```

### 1.2 주요 기능 요약

| 구성 요소 | 설명 |
|----------|------|
| permission-merge.ts | 다중 역할 권한을 하나로 병합 (핵심 엔진) |
| ability.ts | 병합된 권한을 CASL Ability로 변환 |
| api-guard.ts | API Route에서 권한 검증 |
| usePermission Hook | 클라이언트에서 권한 체크 |

---

## 2. 시나리오별 사용 가이드

### 시나리오 1: API Route에서 권한 검증하기

**목표**: 서버 측 API에서 특정 메뉴의 액션 권한을 검증한다.

#### 단계별 안내

**Step 1.** API Route 파일에서 `requireMenuPermission`을 import한다.

```typescript
import { requireMenuPermission } from '@/lib/auth/api-guard';
```

**Step 2.** API 핸들러 내에서 권한 검증을 호출한다.

```typescript
export async function POST(request: Request) {
  // menuId와 action을 지정하여 권한 체크
  await requireMenuPermission('order-management', 'create');

  // 권한이 있으면 여기까지 도달
  // 권한이 없으면 403 에러 자동 반환
  return Response.json({ success: true });
}
```

**Step 3.** 권한이 없는 사용자가 접근하면 자동으로 403 Forbidden 응답이 반환된다.

> **Tip**: menuId는 시스템에 등록된 메뉴 식별자와 정확히 일치해야 한다.

---

### 시나리오 2: 클라이언트에서 버튼/UI 권한 제어하기

**목표**: React 컴포넌트에서 사용자 권한에 따라 UI 요소를 표시/숨김 처리한다.

#### 단계별 안내

**Step 1.** 컴포넌트에서 `usePermission` Hook을 import한다.

```typescript
import { usePermission } from '@/hooks/usePermission';
```

**Step 2.** Hook에서 `can()` 함수를 사용하여 권한을 확인한다.

```typescript
function OrderPage() {
  const { can } = usePermission();

  return (
    <div>
      {can('order-management', 'create') && (
        <button>신규 주문 등록</button>
      )}
      {can('order-management', 'delete') && (
        <button>주문 삭제</button>
      )}
    </div>
  );
}
```

**Step 3.** 권한이 없는 액션의 UI 요소는 렌더링되지 않는다.

> **주의**: 클라이언트 권한 체크는 UX 편의용이며, 반드시 서버 측 검증(api-guard)과 함께 사용해야 한다.

---

### 시나리오 3: 필드 제약 조건 활용하기

**목표**: 특정 필드에 대한 제약 조건(허용 값 목록)을 조회하여 UI에 반영한다.

#### 단계별 안내

**Step 1.** `usePermission` Hook에서 `getFieldConstraints`를 사용한다.

```typescript
const { getFieldConstraints } = usePermission();
```

**Step 2.** 메뉴와 필드명을 지정하여 제약 조건을 조회한다.

```typescript
// 'line' 필드에 대한 제약 조건 조회
const lineConstraints = getFieldConstraints('order-management', 'line');

// 결과 예시:
// ['LINE-A', 'LINE-B']  -> 허용된 값 목록
// null                   -> 제약 없음 (모든 값 허용)
```

**Step 3.** 조회된 제약 조건을 Select/Filter 등 UI 컴포넌트에 반영한다.

```typescript
// null이면 전체 옵션 표시, 배열이면 해당 값만 표시
const options = lineConstraints
  ? allLines.filter(l => lineConstraints.includes(l.id))
  : allLines;
```

---

### 시나리오 4: 권한 병합 로직 직접 사용하기

**목표**: 서버 측에서 사용자의 병합된 권한 목록을 직접 조회한다.

#### 단계별 안내

**Step 1.** `getUserMergedPermissions`를 import한다.

```typescript
import { getUserMergedPermissions } from '@/lib/auth/permission-merge';
```

**Step 2.** 사용자 ID로 병합된 권한을 조회한다.

```typescript
const permissions = await getUserMergedPermissions(userId);
// 선택적으로 시스템 ID 필터 가능
const permissions = await getUserMergedPermissions(userId, 'mes-system');
```

**Step 3.** 반환된 `MergedPermission[]` 배열을 활용한다.

```typescript
// MergedPermission 구조:
// {
//   menuId: string,
//   actions: string[],           // 합집합된 액션 목록
//   fieldConstraints: Record<string, string[]> | null
// }
```

---

## 3. 병합 규칙 안내

개발자가 알아야 할 핵심 병합 규칙 4가지:

| 규칙 | 설명 | 예시 |
|------|------|------|
| BR-001 | actions는 합집합 | ['read'] + ['read','write'] = ['read','write'] |
| BR-002 | 같은 필드의 값은 합집합 | line:['A'] + line:['B'] = line:['A','B'] |
| BR-003 | 한쪽에 제약 없으면 제약 해제 | line:['A'] + (없음) = null (무제한) |
| BR-004 | 부모 역할 권한 자동 상속 | 자식 역할은 부모의 모든 권한 포함 |

---

## 4. 상태별 동작

| 상태 | 동작 |
|------|------|
| 권한 로딩 중 | `can()` 기본 false 반환, UI 비활성 |
| 권한 없음 | `can()` false, API 403 반환 |
| 권한 있음 | `can()` true, API 정상 처리 |
| DB 조회 실패 | 서버 500 에러, 클라이언트 기본 거부 |

---

## 5. FAQ / 트러블슈팅

### Q1. can()이 항상 false를 반환합니다.
- 사용자에게 역할이 할당되어 있는지 확인한다.
- menuId 값이 DB에 등록된 값과 정확히 일치하는지 확인한다.
- 권한 데이터 로딩이 완료되었는지 확인한다.

### Q2. fieldConstraints가 null인데 필터가 동작하지 않습니다.
- null은 "제약 없음"을 의미하므로, 모든 값을 허용하도록 UI 로직을 구현해야 한다.
- null과 빈 배열([])은 다른 의미이다. 빈 배열은 "아무것도 허용하지 않음"이다.

### Q3. 역할을 변경했는데 권한이 즉시 반영되지 않습니다.
- 현재 캐싱이 미구현 상태이므로 페이지 새로고침 시 반영된다.
- 향후 실시간 반영 기능이 추가될 예정이다.

### Q4. API에서 권한 체크 없이 접근이 가능합니다.
- `requireMenuPermission()` 호출이 API 핸들러의 최상단에 있는지 확인한다.
- await를 빠뜨리면 비동기 검증이 무시될 수 있다.

---

## 6. 관련 문서

| 문서 | 경로 |
|------|------|
| 상세설계 | `tasks/TSK-03-01/020-detail-design.md` |
| 구현 보고서 | `tasks/TSK-03-01/030-implementation.md` |
| 테스트 결과 | `tasks/TSK-03-01/070-tdd-test-results.md` |

---

## 7. 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| 1.0.0 | 2026-01-27 | 초기 작성 |
