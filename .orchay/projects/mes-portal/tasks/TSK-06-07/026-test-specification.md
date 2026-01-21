# 테스트 명세서 (026-test-specification.md)

**Template Version:** 1.0.0 — **Last Updated:** 2026-01-21

> **목적**: 단위 테스트, E2E 테스트, 매뉴얼 테스트 시나리오 및 테스트 데이터 정의
>
> **참조**: 이 문서는 `010-design.md`와 `025-traceability-matrix.md`와 함께 사용됩니다.
>
> **활용 단계**: `/wf:build`, `/wf:test` 단계에서 테스트 코드 생성 기준으로 사용

---

## 0. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| Task ID | TSK-06-07 |
| Task명 | [샘플] 사용자 목록 화면 |
| 설계 참조 | `010-design.md` |
| 추적성 매트릭스 참조 | `025-traceability-matrix.md` |
| 작성일 | 2026-01-21 |
| 작성자 | Claude |

---

## 1. 테스트 전략 개요

### 1.1 테스트 범위

| 테스트 유형 | 범위 | 목표 커버리지 |
|------------|------|--------------|
| 단위 테스트 | useUserList 훅, 필터 로직 | 80% 이상 |
| E2E 테스트 | 사용자 목록 화면 전체 시나리오 | 100% 시나리오 커버 |
| 매뉴얼 테스트 | UI/UX, 접근성, 반응형 | 전체 화면 |

### 1.2 테스트 환경

| 항목 | 내용 |
|------|------|
| 테스트 프레임워크 (단위) | Vitest |
| 테스트 프레임워크 (E2E) | Playwright |
| 테스트 데이터 | mock-data/users.json |
| 브라우저 | Chromium (기본) |
| 베이스 URL | `http://localhost:3000` |

---

## 2. 단위 테스트 시나리오

### 2.1 테스트 케이스 목록

| 테스트 ID | 대상 | 시나리오 | 예상 결과 | 요구사항 |
|-----------|------|----------|----------|----------|
| UT-001 | useUserList | mock 데이터 로드 | 사용자 배열 반환 | FR-001 |
| UT-002 | filterUsers | 이름 필터링 | 이름 부분 일치 사용자 반환 | FR-002, BR-001 |
| UT-003 | filterUsers | 이메일 필터링 | 이메일 부분 일치 사용자 반환 | FR-003, BR-001 |
| UT-004 | filterUsers | 상태 필터링 | 해당 상태 사용자만 반환 | FR-004, BR-002 |
| UT-005 | useUserList | 조건 초기화 | 모든 필터 초기값으로 리셋 | FR-005 |
| UT-006 | sortUsers | 정렬 로직 | 지정 컬럼 기준 정렬 | FR-006 |
| UT-007 | useUserList | 페이지네이션 | 해당 페이지 데이터 슬라이싱 | FR-007 |
| UT-008 | useUserList | 행 선택 | 선택 목록에 추가/제거 | FR-008, BR-004 |
| UT-009 | useUserList | 삭제 처리 | 선택 항목 목록에서 제거 | FR-009, BR-003 |
| UT-010 | UserDetailModal | 모달 열기/닫기 | 모달 표시/숨김 상태 전환 | FR-010, BR-005 |

### 2.2 테스트 케이스 상세

#### UT-001: mock 데이터 로드

| 항목 | 내용 |
|------|------|
| **파일** | `src/screens/sample/UserList/__tests__/useUserList.test.ts` |
| **테스트 블록** | `describe('useUserList') → it('should load users from mock data')` |
| **Mock 의존성** | mock-data/users.json |
| **입력 데이터** | - |
| **검증 포인트** | users 배열이 25건 반환되는지 확인 |
| **커버리지 대상** | useUserList 초기화 로직 |
| **관련 요구사항** | FR-001 |

#### UT-002: 이름 필터링

| 항목 | 내용 |
|------|------|
| **파일** | `src/screens/sample/UserList/__tests__/useUserList.test.ts` |
| **테스트 블록** | `describe('filterUsers') → it('should filter by name (partial match)')` |
| **Mock 의존성** | 테스트용 사용자 배열 |
| **입력 데이터** | `{ name: '홍' }` |
| **검증 포인트** | 이름에 '홍'이 포함된 사용자만 반환 |
| **커버리지 대상** | filterUsers 함수 이름 필터 분기 |
| **관련 요구사항** | FR-002, BR-001 |

#### UT-003: 이메일 필터링

| 항목 | 내용 |
|------|------|
| **파일** | `src/screens/sample/UserList/__tests__/useUserList.test.ts` |
| **테스트 블록** | `describe('filterUsers') → it('should filter by email (partial match)')` |
| **Mock 의존성** | 테스트용 사용자 배열 |
| **입력 데이터** | `{ email: '@company' }` |
| **검증 포인트** | 이메일에 '@company'가 포함된 사용자만 반환 |
| **커버리지 대상** | filterUsers 함수 이메일 필터 분기 |
| **관련 요구사항** | FR-003, BR-001 |

#### UT-004: 상태 필터링

| 항목 | 내용 |
|------|------|
| **파일** | `src/screens/sample/UserList/__tests__/useUserList.test.ts` |
| **테스트 블록** | `describe('filterUsers') → it('should filter by status (exact match)')` |
| **Mock 의존성** | 테스트용 사용자 배열 |
| **입력 데이터** | `{ status: 'active' }` |
| **검증 포인트** | status가 'active'인 사용자만 반환 |
| **커버리지 대상** | filterUsers 함수 상태 필터 분기 |
| **관련 요구사항** | FR-004, BR-002 |

#### UT-005: 조건 초기화

| 항목 | 내용 |
|------|------|
| **파일** | `src/screens/sample/UserList/__tests__/useUserList.test.ts` |
| **테스트 블록** | `describe('useUserList') → it('should reset all filters')` |
| **Mock 의존성** | - |
| **입력 데이터** | 필터 적용 후 reset 호출 |
| **검증 포인트** | 모든 필터가 초기값으로 복원 |
| **커버리지 대상** | resetFilters 함수 |
| **관련 요구사항** | FR-005 |

#### UT-006: 정렬 로직

| 항목 | 내용 |
|------|------|
| **파일** | `src/screens/sample/UserList/__tests__/useUserList.test.ts` |
| **테스트 블록** | `describe('sortUsers') → it('should sort by specified column')` |
| **Mock 의존성** | 테스트용 사용자 배열 |
| **입력 데이터** | `{ field: 'name', order: 'ascend' }` |
| **검증 포인트** | 이름 기준 오름차순 정렬 |
| **커버리지 대상** | sortUsers 함수 |
| **관련 요구사항** | FR-006 |

#### UT-007: 페이지네이션

| 항목 | 내용 |
|------|------|
| **파일** | `src/screens/sample/UserList/__tests__/useUserList.test.ts` |
| **테스트 블록** | `describe('useUserList') → it('should paginate data')` |
| **Mock 의존성** | 25건 사용자 배열 |
| **입력 데이터** | `{ page: 2, pageSize: 10 }` |
| **검증 포인트** | 11~20번째 사용자 반환 |
| **커버리지 대상** | paginateData 로직 |
| **관련 요구사항** | FR-007 |

#### UT-008: 행 선택

| 항목 | 내용 |
|------|------|
| **파일** | `src/screens/sample/UserList/__tests__/useUserList.test.ts` |
| **테스트 블록** | `describe('useUserList') → it('should toggle row selection')` |
| **Mock 의존성** | - |
| **입력 데이터** | 사용자 ID 배열 |
| **검증 포인트** | selectedRows에 추가/제거 |
| **커버리지 대상** | setSelectedRows 로직 |
| **관련 요구사항** | FR-008, BR-004 |

#### UT-009: 삭제 처리

| 항목 | 내용 |
|------|------|
| **파일** | `src/screens/sample/UserList/__tests__/useUserList.test.ts` |
| **테스트 블록** | `describe('useUserList') → it('should delete selected users')` |
| **Mock 의존성** | 25건 사용자 배열 |
| **입력 데이터** | 삭제할 사용자 ID 2건 |
| **검증 포인트** | users 배열에서 해당 사용자 제거, 23건 남음 |
| **커버리지 대상** | deleteUsers 함수 |
| **관련 요구사항** | FR-009, BR-003 |

#### UT-010: 모달 열기/닫기

| 항목 | 내용 |
|------|------|
| **파일** | `src/screens/sample/UserList/__tests__/UserDetailModal.test.tsx` |
| **테스트 블록** | `describe('UserDetailModal') → it('should open/close modal')` |
| **Mock 의존성** | - |
| **입력 데이터** | user 객체, open 상태 |
| **검증 포인트** | open=true 시 모달 표시, open=false 시 숨김 |
| **커버리지 대상** | UserDetailModal 컴포넌트 |
| **관련 요구사항** | FR-010, BR-005 |

---

## 3. E2E 테스트 시나리오

### 3.1 테스트 케이스 목록

| 테스트 ID | 시나리오 | 사전조건 | 실행 단계 | 예상 결과 | 요구사항 |
|-----------|----------|----------|----------|----------|----------|
| E2E-001 | 목록 조회 | - | 1. 페이지 접속 | 사용자 목록 25건 표시 | FR-001 |
| E2E-002 | 이름/이메일 검색 | - | 1. 이름 입력 2. 검색 | 필터링된 목록 표시 | FR-002, FR-003 |
| E2E-003 | 상태 필터 | - | 1. 상태 선택 2. 검색 | 해당 상태만 표시 | FR-004 |
| E2E-004 | 조건 초기화 | 조건 입력 상태 | 1. 초기화 클릭 | 전체 목록 표시 | FR-005 |
| E2E-005 | 정렬 | - | 1. 컬럼 헤더 클릭 | 정렬된 목록 표시 | FR-006 |
| E2E-006 | 페이지 이동 | 25건 데이터 | 1. 페이지 2 클릭 | 11~20번째 데이터 표시 | FR-007 |
| E2E-007 | 행 선택 | - | 1. 체크박스 클릭 | 선택 건수 표시, 삭제 버튼 활성화 | FR-008 |
| E2E-008 | 삭제 | 2건 선택 | 1. 삭제 클릭 2. 확인 | 목록에서 제거, 토스트 표시 | FR-009 |
| E2E-009 | 상세 보기 | - | 1. 행 클릭 | 상세 모달 표시 | FR-010 |

### 3.2 테스트 케이스 상세

#### E2E-001: 목록 조회

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/sample/user-list.spec.ts` |
| **테스트명** | `test('사용자 목록을 조회할 수 있다')` |
| **사전조건** | - |
| **data-testid 셀렉터** | |
| - 페이지 컨테이너 | `[data-testid="user-list-page"]` |
| - 목록 테이블 | `[data-testid="user-list-table"]` |
| - 테이블 행 | `[data-testid="user-row"]` |
| **실행 단계** | |
| 1 | `await page.goto('/sample/users')` |
| 2 | `await page.waitForSelector('[data-testid="user-list-table"]')` |
| **검증 포인트** | `expect(page.locator('[data-testid="user-row"]')).toHaveCount(10)` (첫 페이지 10건) |
| **스크린샷** | `e2e-001-user-list.png` |
| **관련 요구사항** | FR-001 |

#### E2E-002: 이름/이메일 검색

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/sample/user-list.spec.ts` |
| **테스트명** | `test('이름으로 사용자를 검색할 수 있다')` |
| **사전조건** | 페이지 로드 완료 |
| **data-testid 셀렉터** | |
| - 이름 입력 | `[data-testid="search-name-input"]` |
| - 검색 버튼 | `[data-testid="search-btn"]` |
| **실행 단계** | |
| 1 | `await page.fill('[data-testid="search-name-input"]', '홍')` |
| 2 | `await page.click('[data-testid="search-btn"]')` |
| 3 | `await page.waitForSelector('[data-testid="user-list-table"]')` |
| **검증 포인트** | 모든 행의 이름에 '홍'이 포함되어 있는지 확인 |
| **스크린샷** | `e2e-002-search-name.png` |
| **관련 요구사항** | FR-002, FR-003, BR-001 |

#### E2E-003: 상태 필터

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/sample/user-list.spec.ts` |
| **테스트명** | `test('상태로 사용자를 필터링할 수 있다')` |
| **사전조건** | 페이지 로드 완료 |
| **data-testid 셀렉터** | |
| - 상태 셀렉트 | `[data-testid="search-status-select"]` |
| - 검색 버튼 | `[data-testid="search-btn"]` |
| **실행 단계** | |
| 1 | `await page.click('[data-testid="search-status-select"]')` |
| 2 | `await page.click('[data-testid="status-option-inactive"]')` |
| 3 | `await page.click('[data-testid="search-btn"]')` |
| **검증 포인트** | 모든 행의 상태가 '비활성'인지 확인 |
| **스크린샷** | `e2e-003-filter-status.png` |
| **관련 요구사항** | FR-004, BR-002 |

#### E2E-004: 조건 초기화

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/sample/user-list.spec.ts` |
| **테스트명** | `test('검색 조건을 초기화할 수 있다')` |
| **사전조건** | 검색 조건 입력 상태 |
| **data-testid 셀렉터** | |
| - 초기화 버튼 | `[data-testid="reset-btn"]` |
| **실행 단계** | |
| 1 | `await page.fill('[data-testid="search-name-input"]', '테스트')` |
| 2 | `await page.click('[data-testid="reset-btn"]')` |
| **검증 포인트** | 이름 입력 필드가 비어있고, 전체 목록 표시 |
| **스크린샷** | `e2e-004-reset.png` |
| **관련 요구사항** | FR-005 |

#### E2E-005: 정렬

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/sample/user-list.spec.ts` |
| **테스트명** | `test('컬럼 헤더 클릭으로 정렬할 수 있다')` |
| **사전조건** | 페이지 로드 완료 |
| **data-testid 셀렉터** | |
| - 이름 컬럼 헤더 | `[data-testid="column-header-name"]` |
| **실행 단계** | |
| 1 | `await page.click('[data-testid="column-header-name"]')` |
| **검증 포인트** | 첫 행의 이름이 가나다순 첫 번째인지 확인 |
| **스크린샷** | `e2e-005-sort.png` |
| **관련 요구사항** | FR-006 |

#### E2E-006: 페이지 이동

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/sample/user-list.spec.ts` |
| **테스트명** | `test('페이지를 이동할 수 있다')` |
| **사전조건** | 25건 데이터, 10건/페이지 |
| **data-testid 셀렉터** | |
| - 페이지 2 버튼 | `.ant-pagination-item-2` |
| **실행 단계** | |
| 1 | `await page.click('.ant-pagination-item-2')` |
| **검증 포인트** | 11~20번째 데이터가 표시되는지 확인 |
| **스크린샷** | `e2e-006-pagination.png` |
| **관련 요구사항** | FR-007 |

#### E2E-007: 행 선택

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/sample/user-list.spec.ts` |
| **테스트명** | `test('행을 선택할 수 있다')` |
| **사전조건** | 페이지 로드 완료 |
| **data-testid 셀렉터** | |
| - 첫 행 체크박스 | `[data-testid="user-row"]:first-child .ant-checkbox-input` |
| - 선택 건수 | `[data-testid="selected-count"]` |
| - 삭제 버튼 | `[data-testid="delete-btn"]` |
| **실행 단계** | |
| 1 | `await page.click('[data-testid="user-row"]:first-child .ant-checkbox-input')` |
| **검증 포인트** | "1건 선택됨" 표시, 삭제 버튼 활성화 |
| **스크린샷** | `e2e-007-select.png` |
| **관련 요구사항** | FR-008, BR-004 |

#### E2E-008: 삭제

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/sample/user-list.spec.ts` |
| **테스트명** | `test('선택한 사용자를 삭제할 수 있다')` |
| **사전조건** | 2건 선택 상태 |
| **data-testid 셀렉터** | |
| - 삭제 버튼 | `[data-testid="delete-btn"]` |
| - 확인 버튼 | `.ant-modal-confirm-btns .ant-btn-primary` |
| **실행 단계** | |
| 1 | 2건 체크박스 선택 |
| 2 | `await page.click('[data-testid="delete-btn"]')` |
| 3 | `await page.click('.ant-modal-confirm-btns .ant-btn-primary')` |
| **검증 포인트** | 목록에서 제거, 토스트 메시지 표시 |
| **스크린샷** | `e2e-008-delete.png` |
| **관련 요구사항** | FR-009, BR-003 |

#### E2E-009: 상세 보기

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/sample/user-list.spec.ts` |
| **테스트명** | `test('행 클릭 시 상세 모달이 표시된다')` |
| **사전조건** | 페이지 로드 완료 |
| **data-testid 셀렉터** | |
| - 테이블 행 | `[data-testid="user-row"]:first-child` |
| - 상세 모달 | `[data-testid="user-detail-modal"]` |
| **실행 단계** | |
| 1 | `await page.click('[data-testid="user-row"]:first-child td:nth-child(2)')` |
| **검증 포인트** | 상세 모달이 표시되고 사용자 정보 포함 |
| **스크린샷** | `e2e-009-detail.png` |
| **관련 요구사항** | FR-010, BR-005 |

---

## 4. UI 테스트케이스 (매뉴얼)

### 4.1 테스트 케이스 목록

| TC-ID | 테스트 항목 | 사전조건 | 테스트 단계 | 예상 결과 | 우선순위 | 요구사항 |
|-------|-----------|---------|-----------|----------|---------|----------|
| TC-001 | 목록 조회 | - | 1. 페이지 접속 | 목록 표시됨 | High | FR-001 |
| TC-002 | 이름/이메일 검색 | - | 1. 검색어 입력 2. 검색 | 필터링됨 | High | FR-002, FR-003 |
| TC-003 | 상태 필터 | - | 1. 상태 선택 2. 검색 | 필터링됨 | Medium | FR-004 |
| TC-004 | 조건 초기화 | 조건 입력 | 1. 초기화 클릭 | 리셋됨 | Medium | FR-005 |
| TC-005 | 정렬 | - | 1. 헤더 클릭 | 정렬됨 | Medium | FR-006 |
| TC-006 | 페이지 이동 | 25건 | 1. 페이지 클릭 | 페이지 변경 | Medium | FR-007 |
| TC-007 | 행 선택 | - | 1. 체크박스 클릭 | 선택 표시 | Medium | FR-008 |
| TC-008 | 삭제 | 선택 상태 | 1. 삭제 클릭 2. 확인 | 삭제됨 | High | FR-009 |
| TC-009 | 상세 보기 | - | 1. 행 클릭 | 모달 표시 | Medium | FR-010 |
| TC-010 | 반응형 | - | 1. 화면 크기 변경 | 레이아웃 적응 | Low | - |
| TC-011 | 접근성 | - | 1. 키보드 탐색 | 모든 기능 접근 | Low | - |

### 4.2 매뉴얼 테스트 상세

#### TC-001: 목록 조회

**테스트 목적**: 사용자가 사용자 목록 페이지에 접근하여 데이터를 조회할 수 있는지 확인

**테스트 단계**:
1. 브라우저에서 /sample/users 접속
2. 페이지 로드 완료 대기
3. 목록 테이블 표시 확인

**예상 결과**:
- 검색 조건 영역 표시
- 사용자 목록 테이블 표시 (10건/페이지)
- 페이지네이션 컨트롤 표시
- 총 건수 표시

**검증 기준**:
- [ ] 검색 조건 영역이 표시됨
- [ ] 테이블에 사용자 데이터가 표시됨
- [ ] 페이지네이션이 동작함

#### TC-008: 삭제

**테스트 목적**: 선택한 사용자를 삭제할 수 있는지 확인

**테스트 단계**:
1. 삭제할 사용자 2건 체크박스 선택
2. 삭제 버튼 클릭
3. 확인 다이얼로그에서 확인 클릭

**예상 결과**:
- 확인 다이얼로그가 표시됨: "2명의 사용자를 삭제하시겠습니까?"
- 확인 클릭 시 목록에서 해당 사용자 제거
- "삭제되었습니다" 토스트 메시지 표시

**검증 기준**:
- [ ] 확인 다이얼로그가 표시됨
- [ ] 삭제 후 목록이 갱신됨
- [ ] 토스트 메시지가 표시됨

---

## 5. 테스트 데이터 (Fixture)

### 5.1 단위 테스트용 Mock 데이터

| 데이터 ID | 용도 | 값 |
|-----------|------|-----|
| MOCK-USER-01 | 활성 사용자 | `{ id: 'user-001', name: '홍길동', email: 'hong@company.com', status: 'active', role: 'ADMIN' }` |
| MOCK-USER-02 | 비활성 사용자 | `{ id: 'user-002', name: '김영희', email: 'kim@company.com', status: 'inactive', role: 'USER' }` |
| MOCK-USER-03 | 대기 사용자 | `{ id: 'user-003', name: '이철수', email: 'lee@company.com', status: 'pending', role: 'USER' }` |

### 5.2 E2E 테스트용 시드 데이터

| 시드 ID | 용도 | 생성 방법 | 포함 데이터 |
|---------|------|----------|------------|
| SEED-E2E-BASE | 기본 E2E 환경 | mock-data/users.json 사용 | 사용자 25명 |

### 5.3 mock-data/users.json

```json
{
  "users": [
    {
      "id": "user-001",
      "name": "홍길동",
      "email": "hong@company.com",
      "status": "active",
      "role": "ADMIN",
      "roleLabel": "관리자",
      "department": "시스템관리팀",
      "phone": "010-1234-5678",
      "createdAt": "2026-01-15T09:00:00Z",
      "lastLoginAt": "2026-01-21T14:30:00Z"
    },
    // ... 총 25건
  ],
  "total": 25
}
```

---

## 6. data-testid 목록

> 프론트엔드 컴포넌트에 적용할 `data-testid` 속성 정의

### 6.1 페이지별 셀렉터

#### 사용자 목록 페이지

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `user-list-page` | 페이지 컨테이너 | 페이지 로드 확인 |
| `search-condition-card` | 검색 조건 Card | 검색 영역 표시 확인 |
| `search-name-input` | 이름 검색 입력 | 이름 검색 |
| `search-email-input` | 이메일 검색 입력 | 이메일 검색 |
| `search-status-select` | 상태 셀렉트 | 상태 필터링 |
| `status-option-active` | 활성 옵션 | 활성 상태 선택 |
| `status-option-inactive` | 비활성 옵션 | 비활성 상태 선택 |
| `status-option-pending` | 대기 옵션 | 대기 상태 선택 |
| `search-btn` | 검색 버튼 | 검색 실행 |
| `reset-btn` | 초기화 버튼 | 조건 초기화 |
| `user-list-table` | 사용자 테이블 | 테이블 표시 확인 |
| `user-row` | 테이블 행 | 행 데이터 확인 |
| `column-header-name` | 이름 컬럼 헤더 | 정렬 클릭 |
| `column-header-email` | 이메일 컬럼 헤더 | 정렬 클릭 |
| `selected-count` | 선택 건수 표시 | 선택 상태 확인 |
| `total-count` | 총 건수 표시 | 총 건수 확인 |
| `delete-btn` | 삭제 버튼 | 삭제 실행 |

#### 사용자 상세 모달

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `user-detail-modal` | 모달 컨테이너 | 모달 표시 확인 |
| `user-detail-name` | 이름 표시 | 이름 확인 |
| `user-detail-email` | 이메일 표시 | 이메일 확인 |
| `user-detail-status` | 상태 표시 | 상태 확인 |
| `user-detail-role` | 역할 표시 | 역할 확인 |
| `modal-close-btn` | 닫기 버튼 | 모달 닫기 |

---

## 7. 테스트 커버리지 목표

### 7.1 단위 테스트 커버리지

| 대상 | 목표 | 최소 |
|------|------|------|
| Lines | 80% | 70% |
| Branches | 75% | 65% |
| Functions | 85% | 75% |
| Statements | 80% | 70% |

### 7.2 E2E 테스트 커버리지

| 구분 | 목표 |
|------|------|
| 주요 사용자 시나리오 | 100% |
| 기능 요구사항 (FR) | 100% 커버 |
| 비즈니스 규칙 (BR) | 100% 커버 |
| 에러 케이스 | 80% 커버 |

---

## 관련 문서

- 설계: `010-design.md`
- 추적성 매트릭스: `025-traceability-matrix.md`
- PRD: `.orchay/projects/mes-portal/prd.md`

---

<!--
TSK-06-07 Test Specification
Version: 1.0
Created: 2026-01-21
-->
