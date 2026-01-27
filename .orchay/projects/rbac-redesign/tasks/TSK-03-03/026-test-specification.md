# 테스트 명세서 (026-test-specification.md)

**Template Version:** 1.0.0 — **Last Updated:** 2026-01-27

> **목적**: 단위 테스트, E2E 테스트, 매뉴얼 테스트 시나리오 및 테스트 데이터 정의
>
> **참조**: 이 문서는 `010-design.md`와 `025-traceability-matrix.md`와 함께 사용됩니다.
>
> **활용 단계**: `/wf:build`, `/wf:test` 단계에서 테스트 코드 생성 기준으로 사용

---

## 0. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| Task ID | TSK-03-03 |
| Task명 | 권한 통합 관리 화면 |
| 설계 참조 | `010-design.md` |
| 추적성 매트릭스 참조 | `025-traceability-matrix.md` |
| 작성일 | 2026-01-27 |
| 작성자 | Claude |

---

## 1. 테스트 전략 개요

### 1.1 테스트 범위

| 테스트 유형 | 범위 | 목표 커버리지 |
|------------|------|--------------|
| 단위 테스트 | 컴포넌트 렌더링, 상태 관리, 필터 로직 | 80% 이상 |
| E2E 테스트 | 3단 마스터-디테일 전체 흐름, 변경 확인 모달 | 100% 시나리오 커버 |
| 매뉴얼 테스트 | UI/UX, 접근성, 반응형, 필터 조합 | 전체 화면 |

### 1.2 테스트 환경

| 항목 | 내용 |
|------|------|
| 테스트 프레임워크 (단위) | Vitest + @testing-library/react |
| 테스트 프레임워크 (E2E) | Playwright |
| 테스트 데이터베이스 | SQLite (테스트용) |
| 브라우저 | Chromium (기본) |
| 베이스 URL | `http://localhost:3000` |

---

## 2. 단위 테스트 시나리오

### 2.1 테스트 케이스 목록

| 테스트 ID | 대상 | 시나리오 | 예상 결과 | 요구사항 |
|-----------|------|----------|----------|----------|
| UT-001 | AuthorityPage | 사용자 목록 렌더링 | 사용자 목록이 표시됨 | FR-001 |
| UT-002 | RoleGroupColumn | 사용자 선택 시 역할그룹 표시 | 보유/전체 역할그룹 목록 표시 | FR-002 |
| UT-003 | RoleColumn | 역할그룹 선택 시 역할 표시 | 보유/전체 역할 목록 표시 | FR-003 |
| UT-004 | PermissionColumn | 역할 선택 시 권한 표시 | 보유/전체 권한 목록 표시 | FR-004 |
| UT-005 | PermissionColumn | 권한 목록에 메뉴/액션 정보 표시 | 메뉴명, 액션 태그 표시 | FR-004 |
| UT-006 | ColumnFilter | 검색 필터 동작 | 입력값으로 목록 필터링 | FR-005 |
| UT-007 | ConfirmChangesModal | 변경 확인 모달 표시 | 추가(녹색)/제거(적색) 구분 표시 | FR-006 |
| UT-008 | AuthorityPage | 상위 선택 변경 시 하위 리셋 | 하위 컬럼 초기화 | BR-001 |
| UT-009 | ConfirmChangesModal | 저장 전 모달 필수 표시 | [저장] 클릭 시 모달 open | BR-002 |
| UT-010 | OwnedList | 보유 목록 읽기전용 | 체크박스 없음, 클릭만 가능 | BR-003 |
| UT-011 | AllList | 전체 목록 체크박스 | 체크박스로 할당/해제 가능 | BR-004 |
| UT-012 | ColumnFilter | 소유여부 필터 | 보유/미보유/전체 구분 필터링 | BR-005 |

### 2.2 테스트 케이스 상세

#### UT-001: AuthorityPage 사용자 목록 렌더링

| 항목 | 내용 |
|------|------|
| **파일** | `app/(portal)/system/authority/__tests__/AuthorityPage.test.tsx` |
| **테스트 블록** | `describe('AuthorityPage') → it('should render user list')` |
| **Mock 의존성** | GET /api/users → 사용자 목록 Mock |
| **입력 데이터** | - |
| **검증 포인트** | 사용자 이름이 화면에 표시됨, 검색 입력란 존재 |
| **커버리지 대상** | AuthorityPage 초기 렌더링 |
| **관련 요구사항** | FR-001 |

#### UT-002: RoleGroupColumn 사용자 선택 시 역할그룹 표시

| 항목 | 내용 |
|------|------|
| **파일** | `app/(portal)/system/authority/__tests__/RoleGroupColumn.test.tsx` |
| **테스트 블록** | `describe('RoleGroupColumn') → it('should show owned and all role groups when user selected')` |
| **Mock 의존성** | GET /api/users/:id/role-groups → 보유 역할그룹 Mock |
| **입력 데이터** | `selectedUserId: 'user-1'` |
| **검증 포인트** | 상단 보유 목록에 할당된 역할그룹, 하단 전체 목록에 체크박스 |
| **커버리지 대상** | RoleGroupColumn 데이터 로딩 및 렌더링 |
| **관련 요구사항** | FR-002 |

#### UT-007: ConfirmChangesModal 변경 확인 모달

| 항목 | 내용 |
|------|------|
| **파일** | `app/(portal)/system/authority/__tests__/ConfirmChangesModal.test.tsx` |
| **테스트 블록** | `describe('ConfirmChangesModal') → it('should display added and removed items')` |
| **Mock 의존성** | - |
| **입력 데이터** | `{ added: ['생산관리그룹'], removed: ['품질조회그룹'] }` |
| **검증 포인트** | 추가 항목이 녹색, 제거 항목이 적색으로 구분 표시 |
| **커버리지 대상** | ConfirmChangesModal 렌더링 |
| **관련 요구사항** | FR-006 |

#### UT-008: 상위 선택 변경 시 하위 리셋

| 항목 | 내용 |
|------|------|
| **파일** | `app/(portal)/system/authority/__tests__/AuthorityPage.test.tsx` |
| **테스트 블록** | `describe('AuthorityPage') → it('should reset child columns when parent selection changes')` |
| **Mock 의존성** | GET /api/users, GET /api/users/:id/role-groups |
| **입력 데이터** | 사용자 A 선택 후 사용자 B 선택 |
| **검증 포인트** | 3~4단 컬럼이 빈 상태로 리셋됨 |
| **커버리지 대상** | 상위 선택 변경 로직 |
| **관련 요구사항** | BR-001 |

---

## 3. E2E 테스트 시나리오

### 3.1 테스트 케이스 목록

| 테스트 ID | 시나리오 | 사전조건 | 실행 단계 | 예상 결과 | 요구사항 |
|-----------|----------|----------|----------|----------|----------|
| E2E-001 | 사용자 목록 조회 | 로그인 상태 | 1. /system/authority 접속 | 사용자 목록 표시 | FR-001 |
| E2E-002 | 역할그룹 할당 | 사용자 존재 | 1. 사용자 선택 2. 체크박스 토글 3. 저장 | 역할그룹 할당됨 | FR-002 |
| E2E-003 | 역할그룹 선택 시 역할 표시 | 역할그룹 할당됨 | 1. 역할그룹 클릭 | 역할 목록 표시 | FR-003 |
| E2E-004 | 역할 선택 시 권한 표시 | 역할 존재 | 1. 역할 클릭 | 권한 목록 표시 | FR-004 |
| E2E-005 | 필터로 검색 | 데이터 존재 | 1. 검색어 입력 | 필터링된 결과 | FR-005 |
| E2E-006 | 변경 확인 모달 | 변경사항 존재 | 1. [저장] 클릭 | 모달 표시, 추가/제거 구분 | FR-006 |
| E2E-007 | 상위 변경 시 하위 갱신 | 사용자 선택됨 | 1. 다른 사용자 선택 | 하위 컬럼 리셋 | BR-001 |
| E2E-008 | 모달 없이 저장 불가 | 변경사항 존재 | 1. [저장] 클릭 | 반드시 모달 표시 | BR-002 |
| E2E-009 | 보유 목록 읽기전용 | 할당 데이터 존재 | 1. 보유 목록 확인 | 체크박스 없음 | BR-003 |
| E2E-010 | 전체 목록 체크박스 | 데이터 존재 | 1. 하단 목록 확인 | 체크박스 존재, 토글 가능 | BR-004 |
| E2E-011 | 소유여부 필터 | 데이터 존재 | 1. 소유여부 필터 변경 | 보유/미보유 분류 | BR-005 |

### 3.2 테스트 케이스 상세

#### E2E-001: 사용자 목록 조회

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/authority.spec.ts` |
| **테스트명** | `test('사용자 목록이 권한 통합 관리 페이지에 표시된다')` |
| **사전조건** | 로그인 (fixture 사용) |
| **data-testid 셀렉터** | |
| - 페이지 컨테이너 | `[data-testid="authority-page"]` |
| - 사용자 컬럼 | `[data-testid="user-column"]` |
| - 사용자 항목 | `[data-testid="user-item"]` |
| **API 확인** | `GET /api/users` → 200 |
| **검증 포인트** | `expect(page.locator('[data-testid="user-column"]')).toBeVisible()` |
| **스크린샷** | `e2e-001-user-list.png` |
| **관련 요구사항** | FR-001 |

#### E2E-002: 역할그룹 할당

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/authority.spec.ts` |
| **테스트명** | `test('사용자에게 역할그룹을 할당할 수 있다')` |
| **사전조건** | 로그인, 사용자/역할그룹 존재 |
| **data-testid 셀렉터** | |
| - 역할그룹 컬럼 | `[data-testid="role-group-column"]` |
| - 보유 목록 | `[data-testid="role-group-owned-list"]` |
| - 전체 목록 | `[data-testid="role-group-all-list"]` |
| - 체크박스 | `[data-testid="role-group-checkbox-{id}"]` |
| - 저장 버튼 | `[data-testid="save-btn"]` |
| - 확인 버튼 | `[data-testid="confirm-btn"]` |
| **실행 단계** | |
| 1 | `await page.click('[data-testid="user-item-user1"]')` |
| 2 | `await page.click('[data-testid="role-group-checkbox-rg3"]')` |
| 3 | `await page.click('[data-testid="save-btn"]')` |
| 4 | `await page.click('[data-testid="confirm-btn"]')` |
| **API 확인** | `PUT /api/users/user1/role-groups` → 200 |
| **검증 포인트** | `expect(page.locator('[data-testid="role-group-owned-list"]')).toContainText('설비관리그룹')` |
| **스크린샷** | `e2e-002-assign-before.png`, `e2e-002-assign-after.png` |
| **관련 요구사항** | FR-002 |

#### E2E-006: 변경 확인 모달

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/authority.spec.ts` |
| **테스트명** | `test('변경 확인 모달에 추가/제거 항목이 표시된다')` |
| **사전조건** | 체크박스 변경 완료 |
| **data-testid 셀렉터** | |
| - 변경 모달 | `[data-testid="confirm-changes-modal"]` |
| - 추가 항목 | `[data-testid="added-item"]` |
| - 제거 항목 | `[data-testid="removed-item"]` |
| **API 확인** | - (모달은 클라이언트 전용) |
| **검증 포인트** | `expect(page.locator('[data-testid="added-item"]')).toBeVisible()` |
| **스크린샷** | `e2e-006-confirm-modal.png` |
| **관련 요구사항** | FR-006 |

---

## 4. UI 테스트케이스 (매뉴얼)

### 4.1 테스트 케이스 목록

| TC-ID | 테스트 항목 | 사전조건 | 테스트 단계 | 예상 결과 | 우선순위 | 요구사항 |
|-------|-----------|---------|-----------|----------|---------|----------|
| TC-001 | 사용자 목록 표시 | 로그인 | 1. /system/authority 접속 | 사용자 목록 표시 | High | FR-001 |
| TC-002 | 역할그룹 할당/해제 | 사용자 선택 | 1. 체크박스 토글 2. 저장 | 할당 변경 완료 | High | FR-002 |
| TC-003 | 3단 마스터-디테일 탐색 | 데이터 존재 | 1. 사용자→역할그룹→역할→권한 순서 클릭 | 각 단계 데이터 갱신 | High | FR-003, FR-004 |
| TC-004 | 변경 확인 모달 | 변경사항 존재 | 1. [저장] 클릭 2. 모달 확인 | 추가/제거 구분 표시 | High | FR-006 |
| TC-005 | 필터 조합 테스트 | 데이터 존재 | 1. 검색+상태+소유여부 조합 | 올바른 필터링 | Medium | FR-005 |
| TC-006 | 로딩/빈 상태 | - | 1. 각 상태 확인 | 적절한 안내 메시지 | Medium | - |
| TC-007 | 접근성 확인 | - | 1. 키보드만으로 탐색 | 모든 기능 접근 가능 | Medium | - |
| TC-008 | 미저장 이탈 경고 | 변경사항 존재 | 1. 페이지 이탈 시도 | 경고 메시지 표시 | Medium | BR-002 |

### 4.2 매뉴얼 테스트 상세

#### TC-001: 사용자 목록 표시

**테스트 목적**: 권한 통합 관리 페이지에 접근하여 사용자 목록이 정상적으로 표시되는지 확인

**테스트 단계**:
1. 관리자 계정으로 로그인
2. 사이드바에서 "권한 통합 관리" 메뉴 클릭
3. 사용자 목록 컬럼이 표시되는지 확인

**예상 결과**:
- 사용자 목록이 1단 컬럼에 표시됨
- 검색 입력란과 상태 필터가 존재함
- 2~4단 컬럼은 빈 상태 안내 메시지 표시

**검증 기준**:
- [ ] 사용자 목록이 정상 로드됨
- [ ] 검색 입력란이 동작함
- [ ] 빈 상태 메시지가 적절함

#### TC-003: 3단 마스터-디테일 탐색

**테스트 목적**: 사용자 → 역할그룹 → 역할 → 권한 순서로 3단 마스터-디테일이 정상 동작하는지 확인

**테스트 단계**:
1. 사용자 목록에서 특정 사용자 클릭
2. 역할그룹 컬럼에 보유/전체 목록 표시 확인
3. 역할그룹 클릭 시 역할 컬럼 갱신 확인
4. 역할 클릭 시 권한 컬럼 갱신 확인
5. 다른 사용자 선택 시 하위 컬럼 리셋 확인

**예상 결과**:
- 각 단계에서 적절한 데이터가 표시됨
- 상위 변경 시 하위 컬럼이 리셋됨
- 상단은 보유 목록(읽기전용), 하단은 전체 목록(체크박스)

**검증 기준**:
- [ ] 사용자 선택 → 역할그룹 표시
- [ ] 역할그룹 선택 → 역할 표시
- [ ] 역할 선택 → 권한 표시
- [ ] 상위 변경 시 하위 리셋

---

## 5. 테스트 데이터 (Fixture)

### 5.1 단위 테스트용 Mock 데이터

| 데이터 ID | 용도 | 값 |
|-----------|------|-----|
| MOCK-USER-01 | 일반 사용자 | `{ id: 'user-1', name: '김생산', email: 'kim@factory.com', status: 'ACTIVE' }` |
| MOCK-USER-02 | 두 번째 사용자 | `{ id: 'user-2', name: '이품질', email: 'lee@factory.com', status: 'ACTIVE' }` |
| MOCK-RG-01 | 생산관리그룹 | `{ id: 'rg-1', code: 'RG-001', name: '생산관리그룹', systemId: 'factory1' }` |
| MOCK-RG-02 | 품질조회그룹 | `{ id: 'rg-2', code: 'RG-002', name: '품질조회그룹', systemId: 'factory1' }` |
| MOCK-RG-03 | 설비관리그룹 | `{ id: 'rg-3', code: 'RG-003', name: '설비관리그룹', systemId: 'factory2' }` |
| MOCK-ROLE-01 | 생산관리자 | `{ id: 'role-1', code: 'PROD-MGR', name: '생산관리자', status: 'ACTIVE' }` |
| MOCK-ROLE-02 | 조업담당자 | `{ id: 'role-2', code: 'OPS-MGR', name: '조업담당자', status: 'ACTIVE' }` |
| MOCK-PERM-01 | 생산조회 | `{ id: 'perm-1', code: 'PROD-READ', name: '생산조회', actions: ['READ'], menuId: 'menu-1' }` |
| MOCK-PERM-02 | 생산편집 | `{ id: 'perm-2', code: 'PROD-EDIT', name: '생산편집', actions: ['READ', 'UPDATE'], menuId: 'menu-1' }` |

### 5.2 E2E 테스트용 시드 데이터

| 시드 ID | 용도 | 생성 방법 | 포함 데이터 |
|---------|------|----------|------------|
| SEED-E2E-BASE | 기본 E2E 환경 | 자동 시드 | 사용자 3명, 역할그룹 3개, 역할 5개, 권한 10개, 할당 관계 포함 |
| SEED-E2E-EMPTY | 빈 환경 | 자동 시드 | 사용자 1명 (역할그룹 미할당) |
| SEED-E2E-FULL | 전체 할당 | 자동 시드 | 사용자 1명에 모든 역할그룹 할당 |

### 5.3 테스트 계정

| 계정 ID | 이메일 | 비밀번호 | 역할 | 용도 |
|---------|--------|----------|------|------|
| TEST-ADMIN | admin@test.com | test1234 | ADMIN | 권한 통합 관리 기능 테스트 |
| TEST-USER | user@test.com | test1234 | USER | 권한 없는 접근 테스트 |

---

## 6. data-testid 목록

> 프론트엔드 컴포넌트에 적용할 `data-testid` 속성 정의

### 6.1 페이지별 셀렉터

#### 권한 통합 관리 페이지

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `authority-page` | 페이지 컨테이너 | 페이지 로드 확인 |
| `save-btn` | 저장 버튼 | 저장 액션 |
| `reset-btn` | 초기화 버튼 | 변경사항 초기화 |

#### 사용자 컬럼

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `user-column` | 사용자 컬럼 컨테이너 | 컬럼 표시 확인 |
| `user-search-input` | 사용자 검색 입력 | 검색 기능 |
| `user-status-filter` | 상태 필터 | 필터링 |
| `user-item` | 사용자 항목 | 항목 클릭 |
| `user-item-{id}` | 특정 사용자 항목 | 특정 사용자 선택 |

#### 역할그룹 컬럼

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `role-group-column` | 역할그룹 컬럼 컨테이너 | 컬럼 표시 확인 |
| `role-group-search-input` | 검색 입력 | 검색 기능 |
| `role-group-owned-list` | 보유 역할그룹 목록 | 읽기전용 목록 확인 |
| `role-group-all-list` | 전체 역할그룹 목록 | 체크박스 목록 확인 |
| `role-group-checkbox-{id}` | 역할그룹 체크박스 | 할당/해제 |
| `role-group-ownership-filter` | 소유여부 필터 | 보유/미보유 필터 |

#### 역할 컬럼

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `role-column` | 역할 컬럼 컨테이너 | 컬럼 표시 확인 |
| `role-search-input` | 검색 입력 | 검색 기능 |
| `role-owned-list` | 보유 역할 목록 | 읽기전용 확인 |
| `role-all-list` | 전체 역할 목록 | 체크박스 확인 |
| `role-checkbox-{id}` | 역할 체크박스 | 할당/해제 |

#### 권한 컬럼

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `permission-column` | 권한 컬럼 컨테이너 | 컬럼 표시 확인 |
| `permission-search-input` | 검색 입력 | 검색 기능 |
| `permission-menu-filter` | 메뉴 필터 | 메뉴별 필터 |
| `permission-action-filter` | 액션 필터 | 액션별 필터 |
| `permission-owned-list` | 보유 권한 목록 | 읽기전용 확인 |
| `permission-all-list` | 전체 권한 목록 | 체크박스 확인 |
| `permission-checkbox-{id}` | 권한 체크박스 | 할당/해제 |

#### 변경 확인 모달

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `confirm-changes-modal` | 모달 컨테이너 | 모달 표시 확인 |
| `added-item` | 추가 항목 | 추가 항목 확인 |
| `removed-item` | 제거 항목 | 제거 항목 확인 |
| `confirm-btn` | 확인 버튼 | 저장 실행 |
| `cancel-btn` | 취소 버튼 | 모달 닫기 |

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
- PRD: `.orchay/projects/rbac-redesign/prd.md`
