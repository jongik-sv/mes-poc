# TSK-06-19: 알림 설정 관리 샘플 - 구현 보고서

## 개요

| 항목 | 내용 |
|------|------|
| Task ID | TSK-06-19 |
| 구현 유형 | Frontend Only |
| 구현 일자 | 2026-01-23 |
| 상태 | ✅ 완료 |

## 구현 범위

### 기능 요구사항 구현 현황

| ID | 요구사항 | 구현 상태 |
|----|----------|----------|
| FR-001 | 4개 카테고리 표시 (생산/품질/설비/시스템) | ✅ |
| FR-002 | 카테고리별 Switch 토글 | ✅ |
| FR-003 | 수신자 추가/삭제/편집 | ✅ |
| FR-004 | Ctrl+S 단축키 저장 | ✅ |
| FR-005 | 기본값 복원 (확인 다이얼로그) | ✅ |
| FR-006 | 미저장 이탈 경고 (beforeunload) | ✅ |
| FR-007 | 이메일 유효성/중복 검사 | ✅ |

## 파일 구조

```
mes-portal/
├── app/(portal)/sample/notification-settings/
│   └── page.tsx                        # 페이지 라우트
├── screens/sample/NotificationSettings/
│   ├── index.tsx                       # 메인 컴포넌트
│   ├── types.ts                        # 타입 정의
│   ├── CategorySettings.tsx            # 카테고리 설정 컴포넌트
│   ├── RecipientTable.tsx              # 수신자 테이블 컴포넌트
│   └── __tests__/
│       ├── NotificationSettings.test.tsx
│       ├── CategorySettings.test.tsx
│       └── RecipientTable.test.tsx
├── mock-data/
│   └── notification-settings.json      # Mock 데이터
├── lib/mdi/
│   └── screenRegistry.ts               # MDI 화면 등록 (추가)
└── tests/e2e/
    └── notification-settings.spec.ts   # E2E 테스트
```

## 주요 구현 내용

### 1. 타입 정의 (types.ts)

```typescript
export interface NotificationCategory {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

export interface NotificationRecipient {
  id: string;
  name: string;
  email: string;
  isNew?: boolean;  // 새로 추가된 행 표시
}

export interface NotificationSettingsData {
  categories: NotificationCategory[];
  recipients: NotificationRecipient[];
}

export const DEFAULT_SETTINGS: NotificationSettingsData = { ... };
```

### 2. 메인 컴포넌트 (index.tsx)

**주요 기능:**
- 상태 관리: useState로 categories, recipients, isDirty, emailErrors 관리
- Ctrl+S 단축키: useGlobalHotkeys 훅 사용
- 미저장 경고: beforeunload 이벤트 리스너
- 이메일 검증: 정규식 + 중복 체크
- 기본값 복원: Modal.confirm 사용

**핵심 로직:**

```typescript
// 이메일 유효성 검사
const validateEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// 중복 이메일 검사
const checkDuplicateEmail = (email: string, excludeId: string): boolean => {
  return recipients.some(
    (r) => r.id !== excludeId && r.email.toLowerCase() === email.toLowerCase()
  );
};

// Ctrl+S 저장
useGlobalHotkeys({
  onSave: handleSave,
});

// 미저장 경고
useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (isDirty) {
      e.preventDefault();
      e.returnValue = '';
    }
  };
  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [isDirty]);
```

### 3. CategorySettings 컴포넌트

- Ant Design List + Switch 사용
- data-testid 패턴: `category-switch-{id}`, `category-name-{id}`
- 접근성: aria-label 제공

### 4. RecipientTable 컴포넌트

- Ant Design Table 사용
- 인라인 편집 (Input)
- 새 행 추가 시 자동 포커스 (useRef + InputRef)
- 이메일 에러 표시

### 5. MDI 시스템 통합

screenRegistry.ts에 화면 등록:
```typescript
'/sample/notification-settings': () => import('@/screens/sample/NotificationSettings'),
```

menus.json에 메뉴 추가:
```json
{
  "id": "6-13",
  "code": "SAMPLE_NOTIFICATION_SETTINGS",
  "name": "알림 설정",
  "path": "/sample/notification-settings",
  "icon": "BellOutlined",
  "sortOrder": 13,
  "isActive": true
}
```

## 테스트 결과

### 단위 테스트

| 파일 | 테스트 수 | 결과 |
|------|----------|------|
| NotificationSettings.test.tsx | 9 | ✅ Pass |
| CategorySettings.test.tsx | 5 | ✅ Pass |
| RecipientTable.test.tsx | 9 | ✅ Pass |
| **합계** | **23** | **✅ All Pass** |

### E2E 테스트

| 테스트 케이스 | 결과 |
|--------------|------|
| E2E-001: 설정 화면 접근 | ✅ Pass |
| E2E-002: 카테고리 토글 | ✅ Pass |
| E2E-003: 수신자 추가 | ✅ Pass |
| E2E-004: 수신자 삭제 | ✅ Pass |
| E2E-005: Ctrl+S 저장 | ✅ Pass |
| E2E-006: 기본값 복원 | ✅ Pass |
| E2E-007: 미저장 경고 | ✅ Pass |
| E2E-008: 이메일 중복 오류 | ✅ Pass |
| **합계** | **8/8 Pass** |

## 기술적 결정 사항

### 1. Ant Design List 컴포넌트 사용

카테고리 설정에 List 컴포넌트를 사용했으나, Ant Design 7.x에서 deprecated 예정입니다. 향후 마이그레이션 시 대안을 검토해야 합니다.

### 2. InputRef 타입 사용

RecipientTable에서 새 행 추가 시 포커스를 위해 `useRef<InputRef>`를 사용했습니다. 일반 `HTMLInputElement` 대신 Ant Design의 `InputRef` 타입을 사용해야 합니다.

### 3. E2E 테스트 접근 방식

MDI 시스템 특성상 `page.goto()` 대신 메뉴 클릭 방식으로 페이지에 접근합니다:
```typescript
await page.click('text=샘플 화면');
await page.click('text=알림 설정');
```

## 알려진 이슈

### 1. Ant Design 경고 메시지

- `[antd: List] The List component is deprecated.`
- `[antd: Spin] 'tip' only work in nest or fullscreen pattern.`

이들은 기능에는 영향을 주지 않지만, 향후 업그레이드 시 대응이 필요합니다.

## 결론

TSK-06-19 알림 설정 관리 샘플 화면이 TDD 방식으로 성공적으로 구현되었습니다. 모든 기능 요구사항이 충족되었으며, 단위 테스트 23개와 E2E 테스트 8개가 모두 통과했습니다.
