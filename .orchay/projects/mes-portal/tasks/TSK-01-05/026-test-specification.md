# 테스트 명세서 (026-test-specification.md)

**Template Version:** 1.0.0 — **Last Updated:** 2026-01-20

> **목적**: 단위 테스트, E2E 테스트, 매뉴얼 테스트 시나리오 정의

---

## 0. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| Task ID | TSK-01-05 |
| Task명 | 전역 검색 모달 |
| 설계 문서 참조 | `010-design.md` |
| 추적성 매트릭스 참조 | `025-traceability-matrix.md` |
| 작성일 | 2026-01-20 |
| 작성자 | Claude |

---

## 1. 테스트 전략 개요

### 1.1 테스트 범위

| 테스트 유형 | 범위 | 목표 커버리지 |
|------------|------|--------------|
| 단위 테스트 | GlobalSearch 컴포넌트, 검색 로직 | 80% 이상 |
| E2E 테스트 | 검색 시나리오 전체 | 100% 시나리오 커버 |
| 매뉴얼 테스트 | UI/UX, 접근성, 반응형 | 전체 화면 |

### 1.2 테스트 환경

| 항목 | 내용 |
|------|------|
| 테스트 프레임워크 (단위) | Vitest + React Testing Library |
| 테스트 프레임워크 (E2E) | Playwright |
| 브라우저 | Chromium (기본) |
| 베이스 URL | `http://localhost:3000` |

---

## 2. 단위 테스트 시나리오

### 2.1 테스트 케이스 목록

| 테스트 ID | 대상 | 시나리오 | 예상 결과 | 요구사항 |
|-----------|------|----------|----------|----------|
| UT-001 | GlobalSearch | 모달 렌더링 (isOpen=true) | 모달 표시됨 | FR-001 |
| UT-002 | GlobalSearch | Ctrl+K 키 이벤트 | onOpen 콜백 호출 | FR-002 |
| UT-003 | GlobalSearch | 검색어 입력 | 실시간 필터링 | FR-003 |
| UT-004 | GlobalSearch | 결과 리스트 표시 | 아이콘+이름+경로 표시 | FR-004 |
| UT-005 | GlobalSearch | 화살표 키 입력 | 선택 인덱스 변경 | FR-005 |
| UT-006 | GlobalSearch | Enter 키 입력 | onSelect 콜백 호출 | FR-006 |
| UT-007 | GlobalSearch | Escape 키 입력 | onClose 콜백 호출 | FR-007 |
| UT-008 | filterMenus | 검색 로직 검증 | 대소문자 무시, 부분 일치 | BR-001~003 |
| UT-009 | GlobalSearch | 폴더 메뉴 선택 시도 | 선택 불가 (무시됨) | BR-005 |

### 2.2 테스트 케이스 상세

#### UT-001: 모달 렌더링

| 항목 | 내용 |
|------|------|
| **파일** | `components/common/__tests__/GlobalSearch.test.tsx` |
| **테스트 블록** | `describe('GlobalSearch') → it('renders modal when isOpen is true')` |
| **입력 데이터** | `isOpen={true}` |
| **검증 포인트** | `expect(screen.getByRole('dialog')).toBeInTheDocument()` |
| **관련 요구사항** | FR-001 |

#### UT-002: Ctrl+K 키 이벤트

| 항목 | 내용 |
|------|------|
| **파일** | `components/common/__tests__/GlobalSearch.test.tsx` |
| **테스트 블록** | `describe('GlobalSearch') → it('opens on Ctrl+K keypress')` |
| **Mock 의존성** | useHotkeys mock |
| **실행** | `fireEvent.keyDown(document, { key: 'k', ctrlKey: true })` |
| **검증 포인트** | `expect(onOpen).toHaveBeenCalled()` |
| **관련 요구사항** | FR-002 |

#### UT-003: 검색어 입력

| 항목 | 내용 |
|------|------|
| **파일** | `components/common/__tests__/GlobalSearch.test.tsx` |
| **테스트 블록** | `describe('GlobalSearch') → it('filters results on search input')` |
| **입력 데이터** | `menus: [...], searchTerm: '대시'` |
| **실행** | `await userEvent.type(input, '대시')` |
| **검증 포인트** | 결과에 '대시보드' 포함, 관련 없는 메뉴 제외 |
| **관련 요구사항** | FR-003 |

#### UT-004: 결과 리스트 표시

| 항목 | 내용 |
|------|------|
| **파일** | `components/common/__tests__/GlobalSearch.test.tsx` |
| **테스트 블록** | `describe('GlobalSearch') → it('displays result with icon, name, and path')` |
| **입력 데이터** | 검색 결과 1개 이상 |
| **검증 포인트** | 아이콘 요소, 메뉴명 텍스트, 경로(breadcrumb) 텍스트 존재 |
| **관련 요구사항** | FR-004 |

#### UT-005: 화살표 키 네비게이션

| 항목 | 내용 |
|------|------|
| **파일** | `components/common/__tests__/GlobalSearch.test.tsx` |
| **테스트 블록** | `describe('GlobalSearch') → it('navigates results with arrow keys')` |
| **입력 데이터** | 검색 결과 3개 |
| **실행** | `fireEvent.keyDown(input, { key: 'ArrowDown' })` × 2 |
| **검증 포인트** | 3번째 항목에 selected 클래스 적용 |
| **관련 요구사항** | FR-005 |

#### UT-006: Enter로 선택

| 항목 | 내용 |
|------|------|
| **파일** | `components/common/__tests__/GlobalSearch.test.tsx` |
| **테스트 블록** | `describe('GlobalSearch') → it('selects item on Enter key')` |
| **Mock 의존성** | onSelect mock |
| **실행** | ArrowDown → Enter |
| **검증 포인트** | `expect(onSelect).toHaveBeenCalledWith(expectedMenu)` |
| **관련 요구사항** | FR-006 |

#### UT-007: Escape로 닫기

| 항목 | 내용 |
|------|------|
| **파일** | `components/common/__tests__/GlobalSearch.test.tsx` |
| **테스트 블록** | `describe('GlobalSearch') → it('closes modal on Escape key')` |
| **Mock 의존성** | onClose mock |
| **실행** | `fireEvent.keyDown(input, { key: 'Escape' })` |
| **검증 포인트** | `expect(onClose).toHaveBeenCalled()` |
| **관련 요구사항** | FR-007 |

#### UT-008: 검색 로직 (대소문자, 부분 일치)

| 항목 | 내용 |
|------|------|
| **파일** | `components/common/__tests__/GlobalSearch.test.tsx` |
| **테스트 블록** | `describe('filterMenus') → it('matches case-insensitive and partial')` |
| **입력 데이터** | `menus: [{ name: 'Dashboard' }, { name: '대시보드' }]` |
| **검증 포인트** | |
| - 대소문자 | `filterMenus('dash')` → 'Dashboard' 포함 |
| - 부분 일치 | `filterMenus('대시')` → '대시보드' 포함 |
| **관련 요구사항** | BR-001, BR-002, BR-003 |

#### UT-009: 폴더 메뉴 선택 불가

| 항목 | 내용 |
|------|------|
| **파일** | `components/common/__tests__/GlobalSearch.test.tsx` |
| **테스트 블록** | `describe('GlobalSearch') → it('ignores selection of folder menu')` |
| **입력 데이터** | 폴더 메뉴 (path 없음) |
| **실행** | 폴더 메뉴 클릭 또는 Enter |
| **검증 포인트** | `expect(onSelect).not.toHaveBeenCalled()` |
| **관련 요구사항** | BR-005 |

---

## 3. E2E 테스트 시나리오

### 3.1 테스트 케이스 목록

| 테스트 ID | 시나리오 | 사전조건 | 실행 단계 | 예상 결과 | 요구사항 |
|-----------|----------|----------|----------|----------|----------|
| E2E-001 | 검색 모달 열기 | 로그인 | Ctrl+K 입력 | 모달 표시, 입력창 포커스 | FR-001, FR-002 |
| E2E-002 | 메뉴 검색 | 모달 열림 | 검색어 입력 | 필터링된 결과 표시 | FR-003, FR-004 |
| E2E-003 | 키보드로 선택 | 결과 있음 | 화살표 + Enter | 해당 화면 탭 열림 | FR-005, FR-006, BR-005 |
| E2E-004 | 모달 닫기 | 모달 열림 | Escape 입력 | 모달 닫힘 | FR-007 |
| E2E-005 | 권한 필터링 | 제한된 사용자 | 검색 | 권한 있는 메뉴만 표시 | BR-004 |

### 3.2 테스트 케이스 상세

#### E2E-001: 검색 모달 열기

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/global-search.spec.ts` |
| **테스트명** | `test('Ctrl+K로 검색 모달 열기')` |
| **사전조건** | 로그인 완료 |
| **data-testid 셀렉터** | |
| - 검색 모달 | `[data-testid="global-search-modal"]` |
| - 검색 입력창 | `[data-testid="global-search-input"]` |
| **실행 단계** | |
| 1 | `await page.keyboard.press('Control+k')` |
| 2 | 모달 표시 확인 |
| 3 | 입력창 포커스 확인 |
| **검증 포인트** | `expect(modal).toBeVisible()`, `expect(input).toBeFocused()` |
| **관련 요구사항** | FR-001, FR-002 |

#### E2E-002: 메뉴 검색

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/global-search.spec.ts` |
| **테스트명** | `test('검색어 입력 시 메뉴 필터링')` |
| **사전조건** | 모달 열림 |
| **data-testid 셀렉터** | |
| - 검색 결과 목록 | `[data-testid="search-results"]` |
| - 검색 결과 아이템 | `[data-testid="search-result-item"]` |
| - 결과 없음 | `[data-testid="search-no-results"]` |
| **실행 단계** | |
| 1 | `await page.fill('[data-testid="global-search-input"]', '대시')` |
| 2 | 결과 확인 |
| **검증 포인트** | 결과에 '대시보드' 포함 |
| **관련 요구사항** | FR-003, FR-004 |

#### E2E-003: 키보드로 선택

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/global-search.spec.ts` |
| **테스트명** | `test('화살표 키와 Enter로 메뉴 선택')` |
| **사전조건** | 검색 결과 있음 |
| **data-testid 셀렉터** | |
| - 선택된 항목 | `[data-testid="search-result-item"].selected` |
| - MDI 탭 | `[data-testid="mdi-tab-bar"]` |
| **실행 단계** | |
| 1 | `await page.keyboard.press('ArrowDown')` |
| 2 | 선택 항목 변경 확인 |
| 3 | `await page.keyboard.press('Enter')` |
| 4 | MDI 탭 열림 확인, 모달 닫힘 확인 |
| **검증 포인트** | 탭 바에 선택한 메뉴 탭 추가됨 |
| **관련 요구사항** | FR-005, FR-006, BR-005 |

#### E2E-004: 모달 닫기

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/global-search.spec.ts` |
| **테스트명** | `test('Escape로 모달 닫기')` |
| **사전조건** | 모달 열림 |
| **실행 단계** | |
| 1 | `await page.keyboard.press('Escape')` |
| 2 | 모달 숨김 확인 |
| **검증 포인트** | `expect(modal).not.toBeVisible()` |
| **관련 요구사항** | FR-007 |

#### E2E-005: 권한 기반 메뉴 필터링

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/global-search.spec.ts` |
| **테스트명** | `test('권한 없는 메뉴는 검색 결과에 표시 안 됨')` |
| **사전조건** | 제한된 권한 사용자로 로그인 |
| **실행 단계** | |
| 1 | Ctrl+K로 모달 열기 |
| 2 | 관리자 전용 메뉴명 검색 (예: "사용자 관리") |
| 3 | 결과 확인 |
| **검증 포인트** | 권한 없는 메뉴는 결과에 없음 |
| **관련 요구사항** | BR-004 |

---

## 4. UI 테스트케이스 (매뉴얼)

### 4.1 테스트 케이스 목록

| TC-ID | 테스트 항목 | 사전조건 | 테스트 단계 | 예상 결과 | 우선순위 | 요구사항 |
|-------|-----------|---------|-----------|----------|---------|----------|
| TC-001 | 모달 표시 | 로그인 | Ctrl+K 또는 검색 아이콘 클릭 | 모달 중앙 표시 | High | FR-001 |
| TC-002 | 단축키 동작 | 로그인 | Ctrl+K 입력 | 모달 열림 | High | FR-002 |
| TC-003 | 검색 기능 | 모달 열림 | 검색어 입력 | 실시간 필터링 | High | FR-003, FR-004 |
| TC-004 | 키보드 탐색 | 결과 있음 | 화살표 키 입력 | 선택 항목 변경 | Medium | FR-005 |
| TC-005 | 메뉴 선택 | 결과 있음 | Enter 또는 클릭 | 화면 탭 열림 | High | FR-006 |
| TC-006 | 모달 닫기 | 모달 열림 | Escape 또는 바깥 클릭 | 모달 닫힘 | Medium | FR-007 |
| TC-007 | 반응형 | - | 다양한 화면 크기 | 적절한 너비 조정 | Low | - |
| TC-008 | 접근성 | - | 스크린 리더 테스트 | ARIA 안내 동작 | Low | - |

### 4.2 매뉴얼 테스트 상세

#### TC-001: 모달 표시

**테스트 목적**: 전역 검색 모달이 올바르게 표시되는지 확인

**테스트 단계**:
1. 포털에 로그인
2. Ctrl+K 키 입력
3. 모달 표시 위치 및 스타일 확인

**예상 결과**:
- 모달이 화면 중앙 상단에 표시됨
- 오버레이 배경이 어둡게 표시됨
- 검색 입력창에 자동 포커스

**검증 기준**:
- [ ] 모달 너비 480px (데스크톱)
- [ ] 상단에서 약 20% 위치
- [ ] 입력창 placeholder "메뉴 또는 화면 검색..."
- [ ] Ctrl+K 힌트 배지 표시

#### TC-003: 검색 기능

**테스트 목적**: 실시간 검색 필터링이 올바르게 동작하는지 확인

**테스트 단계**:
1. 모달 열기
2. "대시" 입력
3. 결과 확인
4. "존재하지않는검색어" 입력
5. 결과 없음 상태 확인

**예상 결과**:
- 검색어 입력 시 실시간으로 결과 필터링
- 결과에 아이콘, 메뉴명, 경로 표시
- 매칭된 텍스트 하이라이트
- 결과 없을 때 안내 메시지 표시

**검증 기준**:
- [ ] 타이핑 후 150ms 내 필터링
- [ ] 대소문자 구분 없이 검색
- [ ] 부분 일치 검색 동작
- [ ] 결과 없음 시 아이콘 + 메시지

---

## 5. 테스트 데이터 (Fixture)

### 5.1 단위 테스트용 Mock 데이터

| 데이터 ID | 용도 | 값 |
|-----------|------|-----|
| MOCK-MENU-01 | 화면 메뉴 | `{ id: '1', code: 'DASHBOARD', name: '대시보드', path: '/dashboard', icon: 'DashboardOutlined' }` |
| MOCK-MENU-02 | 폴더 메뉴 | `{ id: '2', code: 'PRODUCTION', name: '생산관리', icon: 'BuildOutlined', children: [...] }` |
| MOCK-MENU-TREE | 3단계 메뉴 | 상위 → 하위 계층 구조 |

### 5.2 E2E 테스트용 시드 데이터

| 시드 ID | 용도 | 포함 데이터 |
|---------|------|------------|
| SEED-MENU-BASE | 기본 메뉴 | 1단계 5개, 2단계 10개, 3단계 5개 |
| SEED-USER-ADMIN | 관리자 | 전체 메뉴 접근 |
| SEED-USER-LIMITED | 제한 사용자 | 일부 메뉴만 접근 |

### 5.3 테스트 계정

| 계정 ID | 이메일 | 역할 | 용도 |
|---------|--------|------|------|
| TEST-ADMIN | admin@test.com | ADMIN | 전체 메뉴 검색 |
| TEST-USER | user@test.com | USER | 권한 필터링 테스트 |

---

## 6. data-testid 목록

### 6.1 GlobalSearch 컴포넌트

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `global-search-modal` | 모달 컨테이너 | 모달 표시 확인 |
| `global-search-input` | 검색 입력창 | 검색어 입력 |
| `global-search-hint` | Ctrl+K 힌트 | - |
| `search-results` | 결과 목록 컨테이너 | 결과 유무 확인 |
| `search-result-item` | 결과 아이템 | 각 결과 항목 |
| `search-result-item-{id}` | 특정 결과 | 특정 메뉴 선택 |
| `search-no-results` | 결과 없음 | 빈 상태 확인 |
| `search-keyboard-hints` | 하단 키보드 힌트 | - |

### 6.2 예시

```tsx
<Modal data-testid="global-search-modal">
  <Input
    data-testid="global-search-input"
    suffix={<span data-testid="global-search-hint">Ctrl+K</span>}
  />
  <List data-testid="search-results">
    {results.map(r => (
      <Item key={r.id} data-testid={`search-result-item-${r.id}`}>
        ...
      </Item>
    ))}
  </List>
  <Empty data-testid="search-no-results" />
  <div data-testid="search-keyboard-hints">↑↓ 이동  ↵ 열기  esc 닫기</div>
</Modal>
```

---

## 7. 테스트 커버리지 목표

### 7.1 단위 테스트 커버리지

| 대상 | 목표 | 최소 |
|------|------|------|
| Lines | 80% | 70% |
| Branches | 75% | 65% |
| Functions | 85% | 75% |

### 7.2 E2E 테스트 커버리지

| 구분 | 목표 |
|------|------|
| 주요 사용자 시나리오 | 100% |
| 기능 요구사항 (FR) | 100% |
| 비즈니스 규칙 (BR) | 100% |

---

## 관련 문서

- 설계: `010-design.md`
- 추적성 매트릭스: `025-traceability-matrix.md`
- PRD: `.orchay/projects/mes-portal/prd.md`

---

<!--
TSK-01-05 전역 검색 모달
Version: 1.0
Created: 2026-01-20
-->
