# 구현 보고서 (030-implementation.md)

**Template Version:** 1.0.0 — **Last Updated:** 2026-01-21

> **목적**: Header 컴포넌트 구현 결과 기록

---

## 0. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| Task ID | TSK-01-02 |
| Task명 | 헤더 컴포넌트 |
| 구현 완료일 | 2026-01-21 |
| 구현 방식 | TDD (Test-Driven Development) |
| 상태 전환 | [ap] → [im] |

---

## 1. 구현 요약

### 1.1 구현 범위

| 항목 | 상태 |
|------|------|
| Header 컴포넌트 | ✅ 완료 |
| 로고 (홈 이동) | ✅ 완료 |
| 빠른 메뉴 (즐겨찾기) | ✅ 완료 (빈 상태) |
| 브레드크럼 | ✅ 완료 |
| 시스템 시계 | ✅ 완료 |
| 전역 검색 트리거 | ✅ 완료 |
| 알림 뱃지 | ✅ 완료 |
| 테마 전환 | ✅ 완료 |
| 프로필 드롭다운 | ✅ 완료 |

### 1.2 제외 범위

| 항목 | 이유 | 관련 Task |
|------|------|----------|
| 검색 모달 내부 | 별도 Task로 분리 | TSK-01-05 |
| 알림 패널 내부 | 별도 Task로 분리 | TSK-01-06 |
| 즐겨찾기 데이터 | 별도 Task로 분리 | TSK-03-04 |

---

## 2. 구현 파일 목록

### 2.1 신규 생성 파일

| 파일 | 설명 | 라인 수 |
|------|------|---------|
| `components/layout/Header.tsx` | 헤더 컴포넌트 | 211 |
| `components/layout/__tests__/Header.test.tsx` | 단위 테스트 | 280 |
| `tests/e2e/header.spec.ts` | E2E 테스트 | 110 |
| `playwright.config.ts` | Playwright 설정 | 28 |

### 2.2 수정 파일

| 파일 | 변경 내용 |
|------|----------|
| `components/layout/index.ts` | Header export 추가 |
| `app/(portal)/layout.tsx` | Header 컴포넌트 통합 |
| `package.json` | react-hotkeys-hook, @playwright/test 의존성 추가 |
| `vitest.config.ts` | E2E 테스트 제외 설정 |

---

## 3. 기술 구현 상세

### 3.1 컴포넌트 구조

```typescript
// Header 컴포넌트 Props 인터페이스
interface HeaderProps {
  user?: {
    name: string
    email: string
    avatar?: string
  }
  breadcrumbItems?: Array<{ title: string; path?: string }>
  unreadNotifications?: number
  onSearchOpen?: () => void
  onNotificationOpen?: () => void
  onLogout?: () => void
}
```

### 3.2 주요 기술 사용

| 기능 | 기술 | 설명 |
|------|------|------|
| 테마 전환 | next-themes | useTheme 훅으로 라이트/다크 토글 |
| 키보드 단축키 | react-hotkeys-hook | Ctrl+K 전역 검색 단축키 |
| UI 컴포넌트 | Ant Design | Button, Dropdown, Avatar, Badge, Breadcrumb |
| 라우팅 | next/link | 로고 홈 이동, 브레드크럼 링크 |

### 3.3 상태 관리

```typescript
// 로컬 상태
const [currentTime, setCurrentTime] = useState('')  // 시계
const [mounted, setMounted] = useState(false)       // SSR 호환

// 외부 훅
const { theme, setTheme, resolvedTheme } = useTheme()
```

### 3.4 SSR 호환성

- `mounted` 상태로 클라이언트 사이드 렌더링 확인
- 테마 아이콘은 마운트 후 렌더링

---

## 4. 테스트 결과

### 4.1 단위 테스트

| 항목 | 값 |
|------|-----|
| 총 테스트 | 28 |
| 통과 | 28 |
| 커버리지 (Lines) | 100% |
| 커버리지 (Branches) | 70% |

### 4.2 E2E 테스트

| 항목 | 값 |
|------|-----|
| 총 테스트 | 11 |
| 통과 | 11 |
| 실행 시간 | 7.3s |

### 4.3 요구사항 커버리지

| 유형 | 총 항목 | 커버 | 커버리지 |
|------|---------|------|---------|
| 기능 요구사항 (FR) | 8 | 8 | 100% |
| 비즈니스 규칙 (BR) | 5 | 5 | 100% |

---

## 5. 의존성 변경

### 5.1 추가된 의존성

```json
{
  "dependencies": {
    "react-hotkeys-hook": "^5.2.3"
  },
  "devDependencies": {
    "@playwright/test": "^1.57.0",
    "@vitest/coverage-v8": "^4.0.17"
  }
}
```

---

## 6. 설계 대비 구현 검증

### 6.1 설계 문서 대비 체크리스트

| 설계 항목 | 구현 상태 | 비고 |
|----------|----------|------|
| 로고 클릭 → "/" 이동 | ✅ 완료 | Link href="/" |
| 빠른 메뉴 드롭다운 | ✅ 완료 | 빈 메뉴 (TSK-03-04에서 데이터 연동) |
| 브레드크럼 props | ✅ 완료 | breadcrumbItems prop |
| 시계 1초 갱신 | ✅ 완료 | setInterval(1000) |
| Ctrl+K 단축키 | ✅ 완료 | react-hotkeys-hook |
| 알림 뱃지 | ✅ 완료 | Ant Design Badge |
| 테마 토글 | ✅ 완료 | next-themes |
| 프로필 드롭다운 | ✅ 완료 | 내 정보/설정/로그아웃 메뉴 |

### 6.2 통합 검증 체크리스트

- [x] `components/layout/Header.tsx` 파일 존재
- [x] Ant Design Breadcrumb, Badge, Dropdown, Avatar 사용
- [x] react-hotkeys-hook으로 Ctrl+K 단축키 등록
- [x] next-themes useTheme 훅 사용
- [x] PortalLayout의 header slot에 Header 컴포넌트 적용

---

## 7. 알려진 제한사항

| 제한사항 | 원인 | 해결 방안 |
|----------|------|----------|
| 즐겨찾기 메뉴 빈 상태 | TSK-03-04에서 구현 예정 | 후속 Task 완료 시 해결 |
| 검색 모달 기본 UI | TSK-01-05에서 상세 구현 | 후속 Task 완료 시 교체 |
| 알림 패널 미구현 | TSK-01-06에서 구현 예정 | 후속 Task 완료 시 해결 |

---

## 8. 성능 고려사항

| 항목 | 구현 |
|------|------|
| 시계 메모리 누수 방지 | useEffect cleanup에서 clearInterval |
| SSR 호환 | mounted 상태로 조건부 렌더링 |
| 반응형 | TailwindCSS hidden/md:flex 클래스 |

---

## 9. 테스트 결과 파일

| 파일 | 경로 |
|------|------|
| TDD 테스트 결과 | `070-tdd-test-results.md` |
| E2E 테스트 결과 | `070-e2e-test-results.md` |
| 커버리지 HTML | `test-results/20260121-102553/tdd/coverage/index.html` |
| E2E 리포트 | `playwright-report/index.html` |

---

## 10. 변경 이력

| 버전 | 일자 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0 | 2026-01-21 | Claude | 최초 작성 |

---

## 관련 문서

- 설계: `010-design.md`
- 화면설계: `011-ui-design.md`
- 테스트 명세: `026-test-specification.md`
- 추적성 매트릭스: `025-traceability-matrix.md`
- TDD 테스트 결과: `070-tdd-test-results.md`
- E2E 테스트 결과: `070-e2e-test-results.md`
