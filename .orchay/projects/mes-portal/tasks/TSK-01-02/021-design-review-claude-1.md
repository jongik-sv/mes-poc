# 설계 리뷰 보고서 (021-design-review-claude-1.md)

**Task ID:** TSK-01-02
**Task명:** 헤더 컴포넌트
**리뷰어:** claude-1
**리뷰 일자:** 2026-01-21
**문서 버전:** 1.0

---

## 1. 리뷰 개요

### 1.1 검증 대상

| 파일 | 상태 |
|------|------|
| 010-design.md | PASS |
| 025-traceability-matrix.md | PASS |
| 026-test-specification.md | PASS |

### 1.2 검증 영역 요약

| 검증 영역 | 평가 | 비고 |
|----------|------|------|
| 문서 완전성 | WARN | 접근성 설계, 에러 처리 테스트 누락 |
| 요구사항 추적성 | PASS | FR 8, BR 5 매핑 완료 |
| 아키텍처 | WARN | SRP 위반, 컴포넌트 분리 권장 |
| 보안 | PASS | 세션/로그아웃 요구사항 보강 권장 |
| 테스트 가능성 | WARN | data-testid 미적용, 테스트 로직 개선 필요 |
| 일관성 | WARN | 시계 형식, 아이콘 로직 불일치 |

---

## 2. 이슈 분포 요약

| 심각도 | 개수 |
|--------|------|
| Critical | 0 |
| High | 4 |
| Medium | 12 |
| Low | 5 |
| Info | 2 |

**총 이슈:** P1(0) P2(7) P3(10) P4(4) P5(2) = **23건**

---

## 3. 상세 이슈 목록

### 3.1 아키텍처 이슈

#### ARCH-001: Header 컴포넌트 단일 책임 원칙(SRP) 위반

| 항목 | 내용 |
|------|------|
| 심각도 | High |
| 우선순위 | P2 |
| 설계 섹션 | 12.1 |

**설명:**
현재 Header 컴포넌트가 8가지 기능(로고, 즐겨찾기, 브레드크럼, 시계, 검색, 알림, 테마, 프로필)을 모두 포함하고 있어 테스트 복잡도가 증가하고, 개별 기능 수정 시 전체 컴포넌트에 영향을 줄 수 있습니다.

**권장 조치:**
헤더를 서브 컴포넌트로 분리:
```
components/layout/header/
├── Header.tsx              # 컨테이너 (레이아웃만)
├── HeaderLogo.tsx
├── HeaderQuickMenu.tsx
├── HeaderBreadcrumb.tsx
├── HeaderClock.tsx
├── HeaderSearch.tsx
├── HeaderNotification.tsx
├── HeaderThemeToggle.tsx
└── HeaderProfile.tsx
```

---

#### ARCH-002: 프로필 드롭다운 메뉴 확장성 문제

| 항목 | 내용 |
|------|------|
| 심각도 | High |
| 우선순위 | P2 |
| 설계 섹션 | 12.1 (profileMenuItems) |

**설명:**
프로필 메뉴 항목이 하드코딩되어 역할(Role)별 다른 메뉴 표시나 새로운 메뉴 추가 시 컴포넌트 수정이 필요합니다.

**권장 조치:**
메뉴 항목을 props로 전달받도록 수정:
```typescript
interface HeaderProps {
  profileMenuItems?: MenuItemType[];
  onProfileMenuClick?: (key: string) => void;
}
```

---

#### ARCH-003: 시계로 인한 1초 주기 리렌더링

| 항목 | 내용 |
|------|------|
| 심각도 | High |
| 우선순위 | P2 |
| 설계 섹션 | 12.1 (currentTime useState) |

**설명:**
시계 상태가 1초마다 업데이트되어 Header 전체가 리렌더링됩니다. 자식 컴포넌트들도 불필요하게 리렌더링될 수 있습니다.

**권장 조치:**
1. 시계를 별도 컴포넌트(HeaderClock)로 분리하여 리렌더링 범위 최소화
2. 메뉴 항목 및 콜백 함수 메모이제이션 적용

---

#### ARCH-004: Hydration Mismatch 가능성

| 항목 | 내용 |
|------|------|
| 심각도 | Medium |
| 우선순위 | P3 |
| 설계 섹션 | 12.1 (currentTime 초기값) |

**설명:**
시계가 빈 문자열('')로 초기화되어 서버/클라이언트 렌더링 결과가 달라 Hydration mismatch 경고가 발생할 수 있습니다.

**권장 조치:**
```typescript
const [isMounted, setIsMounted] = useState(false);
useEffect(() => { setIsMounted(true); }, []);
// 렌더링 시
{isMounted && <span>{currentTime}</span>}
```

---

#### ARCH-005: 빠른 메뉴(즐겨찾기) 데이터 인터페이스 미정의

| 항목 | 내용 |
|------|------|
| 심각도 | Medium |
| 우선순위 | P3 |
| 설계 섹션 | 12.1 (Dropdown items: []) |

**설명:**
빠른 메뉴 드롭다운이 빈 배열로 하드코딩되어 있고, TSK-03-04에서 구현될 즐겨찾기 데이터를 받을 인터페이스가 정의되지 않았습니다.

**권장 조치:**
HeaderProps에 즐겨찾기 관련 인터페이스 추가:
```typescript
interface HeaderProps {
  favoriteMenus?: Array<{ key: string; label: string; path: string; icon?: React.ReactNode }>;
  onFavoriteClick?: (path: string) => void;
}
```

---

#### ARCH-006: 브레드크럼 MDI 연동 방식 미정의

| 항목 | 내용 |
|------|------|
| 심각도 | Medium |
| 우선순위 | P3 |
| 설계 섹션 | 12.1 (Breadcrumb Link) |

**설명:**
브레드크럼에서 Link 컴포넌트를 사용하고 있으나, MDI 환경에서는 일반 라우터 네비게이션 대신 탭을 열어야 할 수 있습니다.

**권장 조치:**
브레드크럼 클릭 핸들러를 props로 전달받을 수 있도록 수정:
```typescript
onBreadcrumbClick?: (path: string) => void;
```

---

#### ARCH-007: 알림 뱃지 최대값 미처리

| 항목 | 내용 |
|------|------|
| 심각도 | Low |
| 우선순위 | P4 |
| 설계 섹션 | 12.1 (Badge count) |

**설명:**
unreadNotifications가 큰 숫자일 때 Badge 표시 방식이 정의되지 않아 레이아웃이 깨질 수 있습니다.

**권장 조치:**
Badge의 overflowCount 속성 사용:
```typescript
<Badge count={unreadNotifications} size="small" overflowCount={99}>
```

---

### 3.2 보안 이슈

#### SEC-001: 세션 만료 처리 요구사항 미정의

| 항목 | 내용 |
|------|------|
| 심각도 | Medium |
| 우선순위 | P2 |
| 설계 섹션 | 9.1 |

**설명:**
세션 만료 에러 처리가 언급되어 있으나 다음 보안 요구사항이 누락되었습니다:
- 클라이언트 측 인메모리 사용자 데이터 정리
- localStorage/sessionStorage의 민감 정보 정리
- 진행 중인 API 요청 취소

**권장 조치:**
세션 만료 시 클라이언트 정리 절차를 설계에 명시합니다.

---

#### SEC-002: 로그아웃 보안 요구사항 미정의

| 항목 | 내용 |
|------|------|
| 심각도 | Medium |
| 우선순위 | P2 |
| 설계 섹션 | 12.1 (onLogout) |

**설명:**
로그아웃이 단순 콜백으로만 정의되어 안전한 세션 종료 절차가 명시되지 않았습니다:
- 서버 측 세션/토큰 무효화
- 클라이언트 측 토큰 정리
- 로그아웃 완료 확인 후 리다이렉트

**권장 조치:**
onLogout 콜백 구현 요구사항에 서버 API 호출 및 클라이언트 정리 절차 포함.

---

#### SEC-003: 사용자 입력 데이터 검증 요구사항 미명시

| 항목 | 내용 |
|------|------|
| 심각도 | Medium |
| 우선순위 | P2 |
| 설계 섹션 | 7.2 (UserInfo 타입) |

**설명:**
user.name, breadcrumbItems.title 등 사용자 데이터의 검증 및 정규화 요구사항이 명시되지 않았습니다. React가 기본 이스케이프를 제공하지만, 명시적 요구사항이 필요합니다.

**권장 조치:**
- "모든 사용자 입력 데이터는 서버에서 검증 및 정규화 후 전달" 요구사항 추가
- user.name, breadcrumbItems.title 최대 길이 제한 명시

---

#### SEC-004: 클라이언트 노출 사용자 정보 검토

| 항목 | 내용 |
|------|------|
| 심각도 | Low |
| 우선순위 | P3 |
| 설계 섹션 | 5.3, 12.1 |

**설명:**
프로필 드롭다운에 이메일이 표시되며, 이메일은 PII(개인식별정보)에 해당합니다.

**권장 조치:**
이메일 마스킹 고려(예: `a***@mes.com`) 또는 표시 여부 설정 옵션 제공.

---

### 3.3 품질/테스트 이슈

#### QA-001: data-testid 셀렉터 미적용

| 항목 | 내용 |
|------|------|
| 심각도 | High |
| 우선순위 | P2 |
| 설계 섹션 | 12.1 |

**설명:**
026-test-specification.md에 11개의 data-testid가 정의되어 있으나, 010-design.md의 구현 코드에는 data-testid 속성이 포함되어 있지 않습니다. E2E 테스트 실행 시 셀렉터를 찾을 수 없어 테스트가 실패합니다.

**권장 조치:**
구현 코드에 data-testid 속성 추가:
- `header-logo`, `quick-menu-button`, `header-breadcrumb`
- `header-clock`, `search-button`, `notification-button`
- `theme-toggle`, `profile-dropdown`, `logout-menu`

---

#### QA-002: 시계 갱신 테스트(UT-004) 로직 불완전

| 항목 | 내용 |
|------|------|
| 심각도 | Medium |
| 우선순위 | P3 |
| 설계 섹션 | 026-test-specification 2.2 |

**설명:**
현재 UT-004 테스트 코드가 시계 갱신을 제대로 검증하지 못합니다. "같은 초일 수 있음" 주석이 있어 실제 갱신 여부를 확인하지 않습니다.

**권장 조치:**
Mock Date를 사용하여 시간 변화를 명시적으로 검증:
```typescript
vi.setSystemTime(new Date('2026-01-20T14:00:00'));
render(<Header />);
expect(screen.getByText('14:00:00')).toBeInTheDocument();

vi.advanceTimersByTime(1000);
expect(screen.getByText('14:00:01')).toBeInTheDocument();
```

---

#### QA-003: E2E 테스트 인증 fixture 누락

| 항목 | 내용 |
|------|------|
| 심각도 | Medium |
| 우선순위 | P3 |
| 설계 섹션 | 026-test-specification 3.2 |

**설명:**
E2E-001, E2E-008 등에서 "로그인 상태"를 사전조건으로 명시하나, 테스트 코드에 로그인 fixture가 없습니다.

**권장 조치:**
Playwright fixture를 통한 인증 상태 설정 또는 beforeEach에서 로그인 프로세스 수행.

---

#### QA-004: 접근성(A11y) 설계 누락

| 항목 | 내용 |
|------|------|
| 심각도 | Medium |
| 우선순위 | P3 |
| 설계 섹션 | 6 (인터랙션 설계) |

**설명:**
PRD에 "키보드 및 접근성" 요구사항이 있으나, 설계 문서에서 헤더의 ARIA 속성, 포커스 순서, 스크린 리더 호환성이 구체화되지 않았습니다.

**권장 조치:**
010-design.md에 "접근성 설계" 항목 추가:
- 각 버튼의 aria-label
- 키보드 포커스 순서 정의
- 스크린 리더 테스트 시나리오

---

#### QA-005: 에러 처리 테스트 케이스 누락

| 항목 | 내용 |
|------|------|
| 심각도 | Medium |
| 우선순위 | P3 |
| 설계 섹션 | 9.1, 026-test-specification |

**설명:**
010-design.md에 에러 처리 상황이 정의되어 있으나, 테스트 명세서에 대응하는 테스트 케이스가 없습니다.

**권장 조치:**
에러 상태 테스트 케이스 추가:
- UT-ERR-001: 세션 만료 시 동작
- UT-ERR-002: 알림 API 실패 시 뱃지 표시
- UT-ERR-003: 즐겨찾기 없음 시 빈 상태 메시지

---

#### QA-006: Mac 단축키(Cmd+K) 테스트 커버리지 미흡

| 항목 | 내용 |
|------|------|
| 심각도 | Medium |
| 우선순위 | P3 |
| 설계 섹션 | 12.1, 026-test-specification 2.2 |

**설명:**
구현 코드에서 `meta+k`(Cmd+K)를 지원하나, 테스트 명세서에는 Ctrl+K만 테스트합니다.

**권장 조치:**
UT-013, E2E-005에 Mac 단축키 테스트 케이스 추가.

---

#### QA-007: UT-002 빠른 메뉴 테스트 검증 부족

| 항목 | 내용 |
|------|------|
| 심각도 | Medium |
| 우선순위 | P3 |
| 설계 섹션 | 026-test-specification 2.2 |

**설명:**
UT-002 테스트가 버튼 존재만 확인하고 드롭다운 실제 표시 여부를 검증하지 않습니다.

**권장 조치:**
드롭다운 열림 상태 검증 로직 추가 (aria-expanded 또는 메뉴 항목 확인).

---

#### QA-008: 헤더 높이 60px 테스트 누락

| 항목 | 내용 |
|------|------|
| 심각도 | Medium |
| 우선순위 | P3 |
| 설계 섹션 | PRD 4.1.1, 026-test-specification |

**설명:**
PRD에 "헤더 높이: 고정 (60px)" 요구사항이 있으나, 이를 검증하는 테스트 케이스가 없습니다.

**권장 조치:**
UT-LAYOUT-001: 헤더 높이 60px 검증 테스트 추가.

---

### 3.4 일관성 이슈

#### CON-001: 시계 형식 불일치

| 항목 | 내용 |
|------|------|
| 심각도 | Medium |
| 우선순위 | P3 |
| 설계 섹션 | UC-04, 5.1, 5.2, 12.1 |

**설명:**
시계 형식이 문서 내에서 다르게 정의됨:
- UC-04: "YYYY-MM-DD HH:mm:ss" 또는 "HH:mm:ss"
- 와이어프레임: "14:32" (HH:mm)
- 섹션 5.2: "HH:mm:ss"
- 구현 코드: toLocaleTimeString (HH:mm:ss)

**권장 조치:**
시계 형식을 단일 기준으로 통일 (예: 기본 HH:mm:ss, 반응형에서 HH:mm).

---

#### CON-002: 테마 버튼 아이콘 로직 불일치

| 항목 | 내용 |
|------|------|
| 심각도 | Medium |
| 우선순위 | P3 |
| 설계 섹션 | 12.1, 026-test-specification TC-007 |

**설명:**
TC-007의 검증 기준과 구현 코드의 아이콘 로직이 불일치:
- TC-007: "라이트 모드: 달 아이콘, 다크 모드: 해 아이콘"
- 구현: 다크→해(전환 대상), 라이트→달(전환 대상)

**권장 조치:**
아이콘의 의미(현재 상태 vs 전환 대상)를 명확히 정의하고 테스트 케이스 수정.

---

#### CON-003: 반응형 breakpoint 불일치

| 항목 | 내용 |
|------|------|
| 심각도 | Low |
| 우선순위 | P4 |
| 설계 섹션 | 5.4, 026-test-specification 1.2 |

**설명:**
설계 문서의 breakpoint(1024px+, 768-1023px, 767px-)와 테스트 환경 뷰포트(1280x720, 768x1024, 375x667)가 불일치합니다.

**권장 조치:**
breakpoint 정의 통일 및 CSS Variables로 중앙 관리.

---

#### CON-004: PRD 요구사항 ID 부재

| 항목 | 내용 |
|------|------|
| 심각도 | Low |
| 우선순위 | P4 |
| 설계 섹션 | 025-traceability-matrix |

**설명:**
PRD 4.1.1에 요구사항 ID(FR-001~FR-008)가 명시되지 않아, 설계 단계에서 자체 부여한 ID와의 매핑 근거가 불분명합니다.

**권장 조치:**
PRD에 요구사항 ID 명시 또는 매핑 근거 문서화.

---

#### CON-005: 테마 아이콘 Hydration 문제

| 항목 | 내용 |
|------|------|
| 심각도 | Low |
| 우선순위 | P4 |
| 설계 섹션 | 12.1 |

**설명:**
next-themes의 useTheme은 초기 로딩 시 theme가 undefined일 수 있어 아이콘이 의도치 않게 표시될 수 있습니다.

**권장 조치:**
resolvedTheme 또는 마운트 확인 후 렌더링:
```typescript
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);
if (!mounted) return <Button type="text" icon={<LoadingOutlined />} disabled />;
```

---

## 4. 우선순위별 조치 계획

### P2 (구현 전 필수 반영)

| 번호 | 이슈 | 조치 |
|------|------|------|
| 1 | ARCH-001 | 서브 컴포넌트 분리 구조 설계 반영 |
| 2 | ARCH-002 | profileMenuItems props 인터페이스 추가 |
| 3 | ARCH-003 | 시계 컴포넌트 분리, 메모이제이션 적용 |
| 4 | SEC-001 | 세션 만료 시 클라이언트 정리 절차 명시 |
| 5 | SEC-002 | 로그아웃 보안 요구사항 상세화 |
| 6 | SEC-003 | 사용자 입력 데이터 검증 요구사항 추가 |
| 7 | QA-001 | 구현 코드에 data-testid 속성 추가 |

### P3 (구현 중 반영)

| 번호 | 이슈 | 조치 |
|------|------|------|
| 1 | ARCH-004 | 시계 Hydration 처리 |
| 2 | ARCH-005 | 즐겨찾기 인터페이스 추가 |
| 3 | ARCH-006 | 브레드크럼 클릭 핸들러 추가 |
| 4 | SEC-004 | 이메일 마스킹 검토 |
| 5 | QA-002 | 시계 테스트 로직 개선 |
| 6 | QA-003 | E2E 인증 fixture 추가 |
| 7 | QA-004 | 접근성 설계 추가 |
| 8 | QA-005 | 에러 처리 테스트 추가 |
| 9 | QA-006 | Mac 단축키 테스트 추가 |
| 10 | QA-007 | UT-002 검증 강화 |
| 11 | QA-008 | 헤더 높이 테스트 추가 |
| 12 | CON-001 | 시계 형식 통일 |
| 13 | CON-002 | 테마 아이콘 로직 명확화 |

### P4 (구현 후 검토)

| 번호 | 이슈 | 조치 |
|------|------|------|
| 1 | ARCH-007 | 알림 뱃지 overflowCount 적용 |
| 2 | CON-003 | breakpoint 정의 통일 |
| 3 | CON-004 | PRD 요구사항 ID 매핑 |
| 4 | CON-005 | 테마 아이콘 Hydration 처리 |

---

## 5. 권장 컴포넌트 구조

```
components/layout/header/
├── index.ts                  # 배럴 export
├── Header.tsx                # 컨테이너 (레이아웃만 담당)
├── Header.types.ts           # 타입 정의
├── components/
│   ├── HeaderLogo.tsx
│   ├── HeaderQuickMenu.tsx
│   ├── HeaderBreadcrumb.tsx
│   ├── HeaderClock.tsx       # 자체 상태 관리
│   ├── HeaderSearch.tsx
│   ├── HeaderNotification.tsx
│   ├── HeaderThemeToggle.tsx
│   └── HeaderProfile.tsx
└── hooks/
    ├── useClock.ts           # 시계 로직 훅
    └── useHeaderHotkeys.ts   # 단축키 로직 훅
```

---

## 6. 결론

TSK-01-02 헤더 컴포넌트 설계는 PRD 기능 요구사항을 충족하며, 추적성 매트릭스가 체계적으로 구성되어 있습니다. 그러나 다음 영역에서 개선이 필요합니다:

1. **아키텍처**: 단일 책임 원칙을 위한 컴포넌트 분리 필요
2. **보안**: 세션/로그아웃 관련 보안 요구사항 구체화 필요
3. **테스트**: data-testid 적용 및 테스트 로직 개선 필요
4. **일관성**: 시계 형식, 아이콘 로직 등 문서 간 통일 필요

**Critical 이슈가 없으므로 구현 진행이 가능**하나, P2 우선순위 이슈(7건)는 구현 전 또는 구현과 병행하여 해결하는 것을 권장합니다.

---

## 변경 이력

| 버전 | 일자 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0 | 2026-01-21 | claude-1 | 최초 작성 |
