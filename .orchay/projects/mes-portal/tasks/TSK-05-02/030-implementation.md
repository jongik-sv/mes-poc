# 구현 보고서 (030-implementation.md)

**Task ID:** TSK-05-02
**Task명:** 확인 다이얼로그
**구현 완료일:** 2026-01-22
**카테고리:** development
**도메인:** frontend

---

## 1. 구현 개요

### 1.1 구현 목표

사용자의 실수로 인한 데이터 손실을 방지하기 위해 재사용 가능한 확인 다이얼로그 유틸리티 함수를 구현합니다.

### 1.2 구현 범위

- 삭제 확인 다이얼로그 (`confirmDelete`)
- 저장되지 않은 변경사항 경고 다이얼로그 (`confirmDiscard`)
- 일괄 작업 확인 다이얼로그 (`confirmBulkDelete`)

---

## 2. 구현 결과

### 2.1 생성된 파일

| 파일 경로 | 설명 | 라인 수 |
|----------|------|---------|
| `lib/utils/confirm.ts` | 확인 다이얼로그 유틸리티 함수 | 233 |
| `lib/utils/__tests__/confirm.spec.ts` | 단위 테스트 | 202 |

### 2.2 구현된 함수

#### confirmDelete

```typescript
function confirmDelete(options: ConfirmDeleteOptions): Promise<boolean>
```

- **목적:** 데이터 삭제 전 사용자 확인
- **특징:**
  - danger 스타일 적용 (빨간색 버튼)
  - Promise 기반 비동기 API
  - 기본 제목/버튼 텍스트 제공
  - 커스텀 항목명 지원

#### confirmDiscard

```typescript
function confirmDiscard(options: ConfirmDiscardOptions): Promise<boolean>
```

- **목적:** 저장되지 않은 변경사항 폐기 전 경고
- **특징:**
  - `isDirty` 상태에 따른 조건부 다이얼로그 표시
  - dirty=false일 때 즉시 진행 (다이얼로그 없음)
  - "계속 수정" / "나가기" 버튼

#### confirmBulkDelete

```typescript
function confirmBulkDelete(options: ConfirmBulkDeleteOptions): Promise<boolean>
```

- **목적:** 일괄 작업(삭제 등) 전 확인
- **특징:**
  - 정확한 건수 표시 (예: "5건을 삭제하시겠습니까?")
  - 커스텀 작업명 지원 (삭제, 상태 변경 등)
  - danger 스타일 적용

---

## 3. 설계 대비 구현 매핑

### 3.1 요구사항 매핑

| 요구사항 ID | 설계 내용 | 구현 위치 | 상태 |
|-------------|----------|----------|------|
| FR-001 | 삭제 확인 다이얼로그 | `confirmDelete()` | ✅ 완료 |
| FR-002 | 저장되지 않은 변경사항 경고 | `confirmDiscard()` | ✅ 완료 |
| FR-003 | 일괄 작업 확인 | `confirmBulkDelete()` | ✅ 완료 |

### 3.2 비즈니스 규칙 매핑

| 규칙 ID | 규칙 내용 | 구현 방법 | 상태 |
|---------|----------|----------|------|
| BR-001 | 삭제 작업 확인 필수 | Modal.confirm 호출 | ✅ 완료 |
| BR-002 | 위험 작업 빨간색 버튼 | `okButtonProps: { danger: true }` | ✅ 완료 |
| BR-003 | 일괄 작업 건수 명시 | `${count}건` 메시지 포함 | ✅ 완료 |
| BR-004 | 변경사항 있으면 경고 | `isDirty` 조건 분기 | ✅ 완료 |

### 3.3 테스트 시나리오 매핑

| 테스트 ID | 설계 시나리오 | 테스트 함수 | 결과 |
|-----------|-------------|------------|------|
| UT-001 | 확인 클릭 시 resolve | `should resolve when OK clicked` | ✅ Pass |
| UT-002 | danger 버튼 스타일 | `should render danger button` | ✅ Pass |
| UT-003 | dirty=true 다이얼로그 | `should show dialog when dirty` | ✅ Pass |
| UT-004 | dirty=false 즉시 진행 | `should proceed without dialog` | ✅ Pass |
| UT-005 | 건수 메시지 표시 | `should display count in message` | ✅ Pass |
| UT-006 | 취소 시 false 반환 | `should return false when canceled` | ✅ Pass |

---

## 4. 기술적 구현 세부사항

### 4.1 사용된 기술

| 기술 | 버전 | 용도 |
|------|------|------|
| Ant Design | 6.x | Modal.confirm API |
| @ant-design/icons | 6.x | ExclamationCircleFilled 아이콘 |
| React | 19.x | createElement |
| TypeScript | 5.x | 타입 정의 |

### 4.2 주요 설계 결정

1. **Promise 기반 API**: 콜백 대신 Promise를 반환하여 async/await 패턴 지원
2. **JSX 대신 createElement**: `.ts` 파일에서 JSX 파싱 문제 방지
3. **기본값 제공**: title, okText, cancelText에 합리적인 기본값 제공
4. **조건부 다이얼로그**: `confirmDiscard`에서 dirty 상태 확인으로 불필요한 다이얼로그 방지

### 4.3 인터페이스 정의

```typescript
// 삭제 확인 옵션
interface ConfirmDeleteOptions {
  title?: string;
  content?: ReactNode;
  itemName?: string;
  okText?: string;
  cancelText?: string;
}

// 변경사항 폐기 확인 옵션
interface ConfirmDiscardOptions {
  isDirty: boolean;
  title?: string;
  content?: ReactNode;
  okText?: string;
  cancelText?: string;
}

// 일괄 작업 확인 옵션
interface ConfirmBulkDeleteOptions {
  count: number;
  action?: string;
  title?: string;
  okText?: string;
  cancelText?: string;
}
```

---

## 5. 테스트 결과 요약

### 5.1 단위 테스트

| 항목 | 값 |
|------|-----|
| 총 테스트 수 | 15 |
| 성공 | 15 |
| 실패 | 0 |
| 커버리지 (Lines) | 100% |
| 커버리지 (Branch) | 94.44% |
| 커버리지 (Functions) | 100% |

### 5.2 E2E 테스트

- **상태:** 해당 없음 (UI 유틸리티 함수)
- **비고:** 이 함수를 사용하는 화면에서 E2E 테스트 수행 예정

---

## 6. 사용 예시

### 6.1 삭제 확인

```tsx
import { confirmDelete } from '@/lib/utils/confirm';

const handleDelete = async (id: string) => {
  const confirmed = await confirmDelete({
    itemName: '사용자 "홍길동"',
  });

  if (confirmed) {
    await deleteUser(id);
    message.success('삭제되었습니다.');
  }
};
```

### 6.2 저장되지 않은 변경사항 경고

```tsx
import { confirmDiscard } from '@/lib/utils/confirm';

const handleNavigate = async () => {
  const canLeave = await confirmDiscard({
    isDirty: form.isFieldsTouched(),
  });

  if (canLeave) {
    router.push('/list');
  }
};
```

### 6.3 일괄 삭제

```tsx
import { confirmBulkDelete } from '@/lib/utils/confirm';

const handleBulkDelete = async () => {
  const confirmed = await confirmBulkDelete({
    count: selectedRows.length,
  });

  if (confirmed) {
    await deleteUsers(selectedRows.map(r => r.id));
    message.success(`${selectedRows.length}건이 삭제되었습니다.`);
  }
};
```

---

## 7. 연관 문서

| 문서 | 경로 |
|------|------|
| 설계 문서 | `010-design.md` |
| 추적성 매트릭스 | `025-traceability-matrix.md` |
| 테스트 명세 | `026-test-specification.md` |
| TDD 테스트 결과 | `070-tdd-test-results.md` |

---

## 8. 결론

TSK-05-02 확인 다이얼로그 구현이 성공적으로 완료되었습니다.

- **구현 완료:** 3개 유틸리티 함수 (`confirmDelete`, `confirmDiscard`, `confirmBulkDelete`)
- **테스트 완료:** 15개 단위 테스트 100% 통과
- **요구사항 충족:** FR 3건, BR 4건 모두 커버
- **품질 기준:** TDD 커버리지 100% 달성

---

<!--
TSK-05-02 구현 보고서
Version: 1.0
Created: 2026-01-22
-->
