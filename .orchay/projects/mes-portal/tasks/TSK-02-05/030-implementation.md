# TSK-02-05 - MDI 컨텐츠 영역 구현 보고서

## 문서 정보

| 항목 | 내용 |
|------|------|
| Task ID | TSK-02-05 |
| 문서 버전 | 1.0 |
| 작성일 | 2026-01-21 |
| 상태 | 구현완료 |

---

## 1. 구현 개요

### 1.1 구현 목표

- MDI 탭 시스템에서 활성 탭의 화면을 렌더링하는 컨텐츠 영역 컴포넌트 구현
- 동적 컴포넌트 로딩을 통한 효율적인 화면 관리
- 탭 전환 시 상태 유지 (unmount 방지)
- 보안적 경로 검증 시스템

### 1.2 구현 범위

| 항목 | 구현 여부 |
|------|----------|
| MDIContent 컴포넌트 | O |
| TabPane 컴포넌트 | O |
| ScreenLoader 컴포넌트 | O |
| screenRegistry 시스템 | O |
| ErrorBoundary | O |
| TabErrorFallback | O |
| 샘플 화면 (Dashboard, SampleTable, SampleForm) | O |

---

## 2. 구현 상세

### 2.1 파일 구조

```
mes-portal/
├── components/mdi/
│   ├── MDIContent.tsx          # 메인 컨텐츠 컨테이너
│   ├── TabPane.tsx             # 탭 패널 래퍼
│   ├── ScreenLoader.tsx        # 동적 화면 로더
│   ├── ErrorBoundary.tsx       # 에러 바운더리
│   ├── TabErrorFallback.tsx    # 탭 에러 폴백 UI
│   ├── index.ts                # 모듈 내보내기 (업데이트)
│   └── __tests__/
│       ├── MDIContent.test.tsx
│       ├── TabPane.test.tsx
│       └── ScreenLoader.test.tsx
├── lib/mdi/
│   ├── screenRegistry.ts       # 화면 레지스트리
│   └── __tests__/
│       └── screenRegistry.test.ts
├── screens/
│   ├── dashboard/
│   │   └── Dashboard.tsx       # 대시보드 샘플 화면
│   └── sample/
│       ├── SampleTable.tsx     # 테이블 샘플 화면
│       └── SampleForm.tsx      # 폼 샘플 화면
└── tests/e2e/
    └── mdi-content.spec.ts     # E2E 테스트
```

### 2.2 핵심 컴포넌트

#### 2.2.1 MDIContent

```typescript
// 주요 기능
- 탭이 없을 때 빈 상태 표시
- 모든 탭에 대해 TabPane 렌더링
- 활성 탭만 display: block, 나머지는 display: none
- ErrorBoundary로 탭별 에러 격리
```

#### 2.2.2 TabPane

```typescript
// 주요 기능
- 탭별 컨텐츠 래퍼
- display 토글로 상태 유지 (unmount 방지)
- ARIA 접근성 속성 (role="tabpanel", aria-hidden, aria-labelledby)
```

#### 2.2.3 ScreenLoader

```typescript
// 주요 기능
- React.lazy + Suspense로 동적 로딩
- 경로 검증 후 화면 로드
- 잘못된 경로 시 ScreenNotFound 표시
- 로딩 중 LoadingFallback 표시
```

#### 2.2.4 screenRegistry

```typescript
// 주요 기능
- 경로 → 컴포넌트 로더 매핑
- Object.freeze로 불변성 보장
- validateScreenPath: 경로 보안 검증
  - path traversal 방지 (..)
  - 프로토콜 주입 방지 (javascript:, data:)
  - 특수 문자 차단 (?, #)
- getScreenLoader: 안전한 로더 획득
```

### 2.3 보안 구현

| 보안 요구사항 | 구현 방법 |
|--------------|----------|
| Path Traversal 방지 | `..` 패턴 거부 |
| 프로토콜 주입 방지 | `^[a-z]+:` 패턴 거부 |
| 레지스트리 불변성 | Object.freeze 적용 |
| 통일된 에러 메시지 | 화면 없음/권한 없음 구분 안함 |

---

## 3. 테스트 결과

### 3.1 단위 테스트 (TDD)

| 테스트 파일 | 테스트 수 | 통과 | 실패 |
|------------|----------|------|------|
| MDIContent.test.tsx | 10 | 10 | 0 |
| TabPane.test.tsx | 10 | 10 | 0 |
| ScreenLoader.test.tsx | 7 | 7 | 0 |
| screenRegistry.test.ts | 13 | 13 | 0 |
| **합계** | **40** | **40** | **0** |

### 3.2 E2E 테스트

| 상태 | 테스트 수 |
|------|----------|
| PASS | 4 |
| SKIP | 5 |
| FAIL | 0 |

스킵 사유: 전체 시스템 통합 전 개별 컴포넌트 E2E 한계

---

## 4. 요구사항 추적

| 요구사항 ID | 설명 | 구현 상태 |
|-------------|------|----------|
| FR-4.1 | 활성 탭 화면 표시 | 완료 |
| FR-4.2 | 비활성 탭 display:none | 완료 |
| FR-4.3 | 동적 컴포넌트 로딩 | 완료 |
| FR-4.4 | 빈 상태 표시 | 완료 |
| BR-7 | 상태 유지 (unmount 방지) | 완료 |
| SEC-01 | 경로 검증 | 완료 |
| ACC-01 | ARIA 접근성 | 완료 |

---

## 5. 의존성

### 5.1 상위 의존성

| Task ID | 명칭 | 상태 |
|---------|------|------|
| TSK-02-01 | MDI 상태 관리 | 구현완료 |
| TSK-02-02 | 탭 바 컴포넌트 | 구현완료 |

### 5.2 하위 의존성

| Task ID | 명칭 | 상태 |
|---------|------|------|
| TSK-02-03 | 탭 드래그 앤 드롭 | 대기 |
| TSK-02-04 | 탭 컨텍스트 메뉴 | 대기 |

---

## 6. 특이사항

### 6.1 구현 결정

1. **display: none vs conditional rendering**
   - 선택: display: none
   - 이유: 탭 전환 시 컴포넌트 상태 유지, 폼 입력값 보존

2. **screenRegistry 불변성**
   - Object.freeze 적용
   - 런타임 수정 시도 시 TypeError 발생 (strict mode)

3. **에러 메시지 통일**
   - 보안 상 화면 없음/권한 없음 구분하지 않음
   - 일관된 "요청하신 화면에 접근할 수 없습니다" 메시지

### 6.2 알려진 제한사항

- E2E 테스트 5개 스킵 (전체 통합 시 활성화 예정)
- 샘플 화면은 플레이스홀더 수준

---

## 7. 변경 이력

| 버전 | 일자 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| 1.0 | 2026-01-21 | 최초 작성 | Claude |
