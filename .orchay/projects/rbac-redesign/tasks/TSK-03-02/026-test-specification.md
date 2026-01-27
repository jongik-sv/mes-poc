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
| Task ID | TSK-03-02 |
| Task명 | 시스템/역할그룹/권한 정의 관리 화면 |
| 설계 문서 참조 | `010-design.md` |
| 추적성 매트릭스 참조 | `025-traceability-matrix.md` |
| 작성일 | 2026-01-27 |
| 작성자 | Claude |

---

## 1. 테스트 전략 개요

### 1.1 테스트 범위

| 테스트 유형 | 범위 | 목표 커버리지 |
|------------|------|--------------|
| 단위 테스트 | 페이지 컴포넌트, 폼 모달, 상세 패널, 유틸리티 | 80% 이상 |
| E2E 테스트 | 5개 화면의 주요 사용자 시나리오 | 100% 시나리오 커버 |
| 매뉴얼 테스트 | UI/UX, 반응형, 접근성, 에러 상태 | 전체 화면 |

### 1.2 테스트 환경

| 항목 | 내용 |
|------|------|
| 테스트 프레임워크 (단위) | Vitest + @testing-library/react |
| 테스트 프레임워크 (E2E) | Playwright |
| 브라우저 | Chromium (기본) |
| 베이스 URL | `http://localhost:3000` |
| API 모킹 | MSW (Mock Service Worker) 또는 fetch mock |

---

## 2. 단위 테스트 시나리오

### 2.1 테스트 케이스 목록

#### 시스템 관리 (`/system/systems`)

| 테스트 ID | 대상 | 시나리오 | 예상 결과 | 요구사항 |
|-----------|------|----------|----------|----------|
| UT-001 | SystemListPage | 시스템 목록 렌더링 | 테이블에 시스템 데이터 표시 | FR-001 |
| UT-002 | SystemListPage | 검색 필터링 | 입력값에 맞는 시스템만 표시 | FR-001 |
| UT-003 | SystemFormModal | 시스템 생성 폼 제출 | POST API 호출, 성공 메시지 | FR-001 |
| UT-004 | SystemFormModal | 시스템 수정 폼 제출 | PUT API 호출, 기존 값 프리필 | FR-001 |
| UT-005 | SystemFormModal | 도메인 중복 에러 처리 | 409 응답 시 에러 메시지 표시 | FR-002, BR-005 |
| UT-006 | SystemListPage | 활성 상태 필터 | 상태 드롭다운으로 필터링 | FR-003 |

#### 역할그룹 관리 (`/system/role-groups`)

| 테스트 ID | 대상 | 시나리오 | 예상 결과 | 요구사항 |
|-----------|------|----------|----------|----------|
| UT-007 | RoleGroupListPage | 역할그룹 목록 렌더링 | 테이블에 역할그룹 데이터 표시 | FR-004 |
| UT-008 | RoleGroupFormModal | 역할그룹 생성 (시스템 선택 포함) | POST API 호출, systemId 포함 | FR-004 |
| UT-009 | RoleGroupFormModal | 역할그룹 수정 | PUT API 호출 | FR-004 |
| UT-010 | RoleGroupListPage | 역할그룹 삭제 확인 다이얼로그 | 확인 후 DELETE API 호출 | FR-004 |
| UT-011 | RoleGroupDetailPanel | 포함 역할 목록 표시 | 선택된 역할그룹의 역할 목록 렌더링 | FR-005 |
| UT-012 | RoleGroupDetailPanel | 역할 추가/제거 | POST/DELETE API 호출 | FR-005 |
| UT-013 | RoleGroupListPage | 시스템별 필터링 | 시스템 드롭다운 선택 시 목록 필터 | FR-006 |

#### 권한 관리 (`/system/permissions`)

| 테스트 ID | 대상 | 시나리오 | 예상 결과 | 요구사항 |
|-----------|------|----------|----------|----------|
| UT-014 | PermissionPage | 메뉴 트리 렌더링 | category 기반 폴더 구조 표시 | FR-007 |
| UT-015 | PermissionPage | 메뉴 선택 시 권한 목록 표시 | 선택된 메뉴의 권한만 표시 | FR-007 |
| UT-016 | PermissionFormModal | 권한 생성 폼 제출 | POST API 호출, config JSON 포함 | FR-007 |
| UT-017 | PermissionFormModal | 권한 수정 | PUT API 호출, 기존 값 프리필 | FR-007 |
| UT-018 | PermissionFormModal | Actions 체크박스 토글 | 선택된 actions 배열 생성 | FR-008 |
| UT-019 | FieldConstraintsEditor | 필드 추가/삭제 | 동적 행 추가, 삭제 동작 | FR-009 |
| UT-020 | FieldConstraintsEditor | 필드 값 입력 및 JSON 변환 | 올바른 fieldConstraints 객체 생성 | FR-009 |
| UT-021 | PermissionPage | 메뉴 미선택 시 빈 상태 | "메뉴를 선택하세요" 안내 표시 | FR-010 |

#### 역할 권한 할당 (`/system/roles` 탭)

| 테스트 ID | 대상 | 시나리오 | 예상 결과 | 요구사항 |
|-----------|------|----------|----------|----------|
| UT-022 | RolePermissionTab | 권한 매트릭스 렌더링 | 메뉴 트리 + Action별 체크박스 | FR-011 |
| UT-023 | RolePermissionTab | 체크박스 토글 | 변경 상태 추적 (dirty state) | FR-011 |
| UT-024 | RolePermissionTab | 저장 버튼 클릭 | POST API 호출, 변경분만 전송 | FR-011 |

#### 사용자 관리 탭 (`/system/users` 탭)

| 테스트 ID | 대상 | 시나리오 | 예상 결과 | 요구사항 |
|-----------|------|----------|----------|----------|
| UT-025 | UserRoleGroupTab | 역할그룹 목록 렌더링 | 할당된 역할그룹 테이블 표시 | FR-012 |
| UT-026 | UserRoleGroupTab | 역할그룹 추가/제거 | POST/DELETE API 호출 | FR-012 |
| UT-027 | UserSystemTab | 접근 가능 시스템 목록 렌더링 | 시스템별 역할그룹 수, 접근 상태 표시 | FR-013 |
| UT-028 | UserPermissionTab | 최종 권한 트리 렌더링 | 메뉴 트리 + Actions 태그 + 출처 표시 | FR-014 |
| UT-029 | UserPermissionTab | 시스템 필터 변경 | 선택 시스템의 권한만 표시 | FR-014 |

#### 비즈니스 규칙 검증

| 테스트 ID | 대상 | 시나리오 | 예상 결과 | 요구사항 |
|-----------|------|----------|----------|----------|
| UT-030 | SystemListPage | 하위 역할그룹 존재 시 삭제 시도 | 에러 메시지 표시, 삭제 불가 | BR-001 |
| UT-031 | RoleGroupListPage | 할당 사용자 존재 시 삭제 시도 | 에러 메시지 표시, 삭제 불가 | BR-002 |
| UT-032 | PermissionFormModal | actions 미선택 시 저장 시도 | 폼 유효성 검사 에러 | BR-003 |

### 2.2 테스트 케이스 상세

#### UT-001: SystemListPage 시스템 목록 렌더링

| 항목 | 내용 |
|------|------|
| **파일** | `app/(portal)/system/systems/__tests__/SystemListPage.test.tsx` |
| **테스트 블록** | `describe('SystemListPage') → it('시스템 목록을 테이블로 렌더링한다')` |
| **Mock 의존성** | `GET /api/systems` → 시스템 목록 응답 |
| **입력 데이터** | Mock 시스템 3건 |
| **검증 포인트** | 테이블 행 3개, 시스템ID/이름/도메인/활성상태 컬럼 표시 |
| **커버리지 대상** | SystemListPage 컴포넌트 렌더링 로직 |
| **관련 요구사항** | FR-001 |

#### UT-005: SystemFormModal 도메인 중복 에러

| 항목 | 내용 |
|------|------|
| **파일** | `app/(portal)/system/systems/__tests__/SystemFormModal.test.tsx` |
| **테스트 블록** | `describe('SystemFormModal') → it('도메인 중복 시 에러 메시지를 표시한다')` |
| **Mock 의존성** | `POST /api/systems` → 409 응답 |
| **입력 데이터** | `{ id: 'new-sys', name: '새 시스템', domain: 'existing.mes.com' }` |
| **검증 포인트** | 에러 Alert에 "이미 사용 중인 도메인입니다" 텍스트 |
| **커버리지 대상** | 409 에러 핸들링 분기 |
| **관련 요구사항** | FR-002, BR-005 |

#### UT-018: PermissionFormModal Actions 체크박스

| 항목 | 내용 |
|------|------|
| **파일** | `app/(portal)/system/permissions/__tests__/PermissionFormModal.test.tsx` |
| **테스트 블록** | `describe('PermissionFormModal') → it('Actions 체크박스를 토글하면 선택 상태가 변경된다')` |
| **Mock 의존성** | 없음 |
| **입력 데이터** | CREATE, READ 체크박스 클릭 |
| **검증 포인트** | 체크박스 상태 반영, 폼 값에 `actions: ['CREATE', 'READ']` |
| **커버리지 대상** | Actions 체크박스 로직 |
| **관련 요구사항** | FR-008 |

#### UT-019: FieldConstraintsEditor 필드 추가/삭제

| 항목 | 내용 |
|------|------|
| **파일** | `components/__tests__/FieldConstraintsEditor.test.tsx` |
| **테스트 블록** | `describe('FieldConstraintsEditor') → it('필드 행을 동적으로 추가/삭제할 수 있다')` |
| **Mock 의존성** | 없음 |
| **입력 데이터** | [+ 필드 추가] 클릭, 필드명 입력, [-] 삭제 클릭 |
| **검증 포인트** | 행 개수 변경, 삭제 후 해당 행 제거 확인 |
| **커버리지 대상** | 동적 폼 필드 추가/삭제 로직 |
| **관련 요구사항** | FR-009 |

#### UT-022: RolePermissionTab 권한 매트릭스 렌더링

| 항목 | 내용 |
|------|------|
| **파일** | `app/(portal)/system/roles/__tests__/RolePermissionTab.test.tsx` |
| **테스트 블록** | `describe('RolePermissionTab') → it('메뉴 트리와 Action별 체크박스 매트릭스를 렌더링한다')` |
| **Mock 의존성** | `GET /api/menus`, `GET /api/roles/:id/permissions` |
| **입력 데이터** | Mock 메뉴 트리 + 권한 목록 |
| **검증 포인트** | 메뉴 폴더 구조, 각 권한별 C/R/U/D/EX/IM 체크박스 |
| **커버리지 대상** | 매트릭스 렌더링 로직 |
| **관련 요구사항** | FR-011 |

#### UT-028: UserPermissionTab 최종 권한 트리 렌더링

| 항목 | 내용 |
|------|------|
| **파일** | `app/(portal)/system/users/__tests__/UserPermissionTab.test.tsx` |
| **테스트 블록** | `describe('UserPermissionTab') → it('메뉴별 최종 권한을 Actions 태그와 출처와 함께 표시한다')` |
| **Mock 의존성** | `GET /api/users/:id/permissions` |
| **입력 데이터** | Mock 최종 권한 데이터 (합집합 결과) |
| **검증 포인트** | Actions 태그 표시 (CREATE, READ 등), 권한 출처 텍스트 |
| **커버리지 대상** | 최종 권한 렌더링 로직 |
| **관련 요구사항** | FR-014, BR-004 |

---

## 3. E2E 테스트 시나리오

### 3.1 테스트 케이스 목록

| 테스트 ID | 시나리오 | 사전조건 | 실행 단계 | 예상 결과 | 요구사항 |
|-----------|----------|----------|----------|----------|----------|
| E2E-001 | 시스템 CRUD 전체 흐름 | 로그인 | 생성→조회→수정→삭제 | 각 단계 정상 완료 | FR-001, FR-003 |
| E2E-002 | 시스템 도메인 중복 에러 | 기존 시스템 존재 | 동일 도메인 생성 시도 | 에러 메시지 표시 | FR-002, BR-005 |
| E2E-003 | 역할그룹 목록 조회 및 필터 | 역할그룹 시드 데이터 | 목록 확인, 시스템 필터 | 필터링 정상 동작 | FR-004, FR-006 |
| E2E-004 | 역할그룹 역할 관리 | 역할그룹, 역할 존재 | 역할 추가/제거 | 역할 목록 갱신 | FR-005 |
| E2E-005 | 권한 관리 (메뉴 트리 + 권한 CRUD) | 메뉴 시드 데이터 | 메뉴 선택→권한 생성→수정→삭제 | 각 단계 정상 완료 | FR-007, FR-010 |
| E2E-006 | 권한 생성 (actions + fieldConstraints) | 메뉴 존재 | actions 선택, fieldConstraints 입력, 저장 | config JSON 정상 생성 | FR-008, FR-009, BR-003 |
| E2E-007 | 역할 권한 할당 매트릭스 | 역할, 권한 존재 | 체크박스 토글→저장 | 권한 할당 반영 | FR-011 |
| E2E-008 | 사용자 역할그룹 관리 | 사용자, 역할그룹 존재 | 역할그룹 추가/제거 | 목록 갱신 | FR-012 |
| E2E-009 | 사용자 시스템 접근 탭 | 사용자에 역할그룹 할당 | 시스템 접근 탭 확인 | 접근 시스템 목록 표시 | FR-013 |
| E2E-010 | 사용자 최종 권한 탭 | 전체 권한 체인 설정 | 최종 권한 탭 확인 | 합집합 권한 표시 | FR-014, BR-004 |
| E2E-011 | 시스템 삭제 제약 | 하위 역할그룹 존재 | 삭제 시도 | 에러 메시지 표시 | BR-001 |
| E2E-012 | 역할그룹 삭제 제약 | 할당 사용자 존재 | 삭제 시도 | 에러 메시지 표시 | BR-002 |

### 3.2 테스트 케이스 상세

#### E2E-001: 시스템 CRUD 전체 흐름

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/system-management.spec.ts` |
| **테스트명** | `test('시스템을 생성, 조회, 수정, 삭제할 수 있다')` |
| **사전조건** | 관리자 로그인 (fixture) |
| **data-testid 셀렉터** | |
| - 페이지 컨테이너 | `[data-testid="system-list-page"]` |
| - 목록 테이블 | `[data-testid="system-table"]` |
| - 생성 버튼 | `[data-testid="create-system-btn"]` |
| - 모달 | `[data-testid="system-form-modal"]` |
| - ID 입력 | `[data-testid="system-id-input"]` |
| - 이름 입력 | `[data-testid="system-name-input"]` |
| - 도메인 입력 | `[data-testid="system-domain-input"]` |
| - 저장 버튼 | `[data-testid="save-system-btn"]` |
| - 편집 버튼 | `[data-testid="edit-system-btn"]` |
| - 삭제 버튼 | `[data-testid="delete-system-btn"]` |
| **실행 단계** | |
| 1 | `await page.goto('/system/systems')` |
| 2 | `await page.click('[data-testid="create-system-btn"]')` |
| 3 | `await page.fill('[data-testid="system-id-input"]', 'test-factory')` |
| 4 | `await page.fill('[data-testid="system-name-input"]', '테스트 공장')` |
| 5 | `await page.fill('[data-testid="system-domain-input"]', 'test.mes.com')` |
| 6 | `await page.click('[data-testid="save-system-btn"]')` |
| 7 | 목록에서 '테스트 공장' 확인 |
| 8 | 편집 → 이름 변경 → 저장 |
| 9 | 삭제 → 확인 → 목록에서 사라짐 |
| **API 확인** | POST → 201, PUT → 200, DELETE → 200 |
| **검증 포인트** | 각 단계에서 목록이 올바르게 갱신 |
| **관련 요구사항** | FR-001, FR-003 |

#### E2E-005: 권한 관리 (메뉴 트리 + 권한 CRUD)

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/permission-management.spec.ts` |
| **테스트명** | `test('메뉴를 선택하여 권한을 생성, 수정, 삭제할 수 있다')` |
| **사전조건** | 관리자 로그인, 메뉴 시드 데이터 |
| **data-testid 셀렉터** | |
| - 메뉴 트리 | `[data-testid="menu-tree"]` |
| - 메뉴 노드 | `[data-testid="menu-tree-node-{menuId}"]` |
| - 권한 목록 | `[data-testid="permission-list"]` |
| - 권한 추가 버튼 | `[data-testid="create-permission-btn"]` |
| - 권한 모달 | `[data-testid="permission-form-modal"]` |
| - 권한 코드 입력 | `[data-testid="permission-code-input"]` |
| - 권한명 입력 | `[data-testid="permission-name-input"]` |
| - 빈 상태 안내 | `[data-testid="permission-empty-state"]` |
| **실행 단계** | |
| 1 | `await page.goto('/system/permissions')` |
| 2 | 빈 상태 안내 확인 |
| 3 | 메뉴 트리에서 노드 클릭 |
| 4 | 권한 목록 패널 표시 확인 |
| 5 | [권한 추가] 클릭 → 모달 입력 → 저장 |
| 6 | 목록에 새 권한 표시 확인 |
| **API 확인** | GET /api/menus → 200, GET /api/menus/:menuId/permissions → 200, POST /api/permissions → 201 |
| **관련 요구사항** | FR-007, FR-010 |

#### E2E-006: 권한 생성 (actions + fieldConstraints)

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/permission-management.spec.ts` |
| **테스트명** | `test('actions 선택과 fieldConstraints 입력으로 권한을 생성할 수 있다')` |
| **사전조건** | 메뉴 선택 상태 |
| **data-testid 셀렉터** | |
| - Actions 체크박스 | `[data-testid="action-checkbox-CREATE"]` ~ `[data-testid="action-checkbox-IMPORT"]` |
| - 필드 추가 버튼 | `[data-testid="add-field-constraint-btn"]` |
| - 필드명 입력 | `[data-testid="field-name-input-{index}"]` |
| - 필드값 입력 | `[data-testid="field-value-input-{index}"]` |
| - 필드 삭제 버튼 | `[data-testid="remove-field-constraint-btn-{index}"]` |
| **실행 단계** | |
| 1 | [권한 추가] 클릭 |
| 2 | 코드/이름 입력 |
| 3 | CREATE, READ, UPDATE 체크 |
| 4 | [필드 추가] 클릭 → 필드명: lineId, 값: LINE-01,LINE-02 |
| 5 | [저장] 클릭 |
| **API 확인** | POST /api/permissions → 201, body에 config.actions와 config.fieldConstraints 포함 |
| **관련 요구사항** | FR-008, FR-009, BR-003 |

#### E2E-007: 역할 권한 할당 매트릭스

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/role-permission.spec.ts` |
| **테스트명** | `test('역할 상세의 권한 할당 탭에서 체크박스로 권한을 할당할 수 있다')` |
| **사전조건** | 역할, 권한, 메뉴 시드 데이터 |
| **data-testid 셀렉터** | |
| - 권한 할당 탭 | `[data-testid="role-permission-tab"]` |
| - 매트릭스 테이블 | `[data-testid="permission-matrix"]` |
| - 매트릭스 체크박스 | `[data-testid="perm-check-{permId}-{action}"]` |
| - 저장 버튼 | `[data-testid="save-role-permissions-btn"]` |
| **실행 단계** | |
| 1 | 역할 상세 접근 → [권한 할당] 탭 클릭 |
| 2 | 매트릭스 렌더링 확인 |
| 3 | 체크박스 토글 |
| 4 | [저장] 클릭 |
| **API 확인** | POST /api/roles/:id/permissions → 200 |
| **관련 요구사항** | FR-011 |

#### E2E-010: 사용자 최종 권한 탭

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/user-permissions.spec.ts` |
| **테스트명** | `test('사용자 최종 권한 탭에서 합집합 권한이 메뉴 트리로 표시된다')` |
| **사전조건** | 사용자 → 역할그룹 → 역할 → 권한 전체 체인 시드 |
| **data-testid 셀렉터** | |
| - 최종 권한 탭 | `[data-testid="user-permission-tab"]` |
| - 시스템 필터 | `[data-testid="user-perm-system-filter"]` |
| - 권한 트리 | `[data-testid="user-permission-tree"]` |
| - Actions 태그 | `[data-testid="perm-actions-{menuId}"]` |
| - 권한 출처 | `[data-testid="perm-source-{menuId}"]` |
| **실행 단계** | |
| 1 | 사용자 상세 → [최종 권한] 탭 클릭 |
| 2 | 시스템 필터에서 대상 시스템 선택 |
| 3 | 메뉴별 Actions 태그 확인 |
| 4 | 권한 출처 (역할그룹명 > 역할명) 확인 |
| **API 확인** | GET /api/users/:id/permissions → 200 |
| **관련 요구사항** | FR-014, BR-004 |

---

## 4. UI 테스트케이스 (매뉴얼)

### 4.1 테스트 케이스 목록

| TC-ID | 테스트 항목 | 사전조건 | 테스트 단계 | 예상 결과 | 우선순위 | 요구사항 |
|-------|-----------|---------|-----------|----------|---------|----------|
| TC-001 | 시스템 목록 조회 및 CRUD | 로그인 | 목록 확인, 생성/수정/삭제 | CRUD 정상 동작 | High | FR-001, FR-003 |
| TC-002 | 시스템 도메인 중복 검증 | 기존 시스템 존재 | 동일 도메인 입력 후 저장 | 에러 메시지 | High | FR-002, BR-005 |
| TC-003 | 역할그룹 목록 및 필터 | 역할그룹 존재 | 목록 확인, 시스템 필터 변경 | 필터링 동작 | High | FR-004, FR-006 |
| TC-004 | 역할그룹 역할 관리 | 역할그룹 존재 | 행 클릭 → 상세 패널 → 역할 추가/제거 | 역할 목록 갱신 | High | FR-005 |
| TC-005 | 권한 관리 메뉴 트리 | 메뉴 존재 | 메뉴 트리 탐색, 노드 선택 | 권한 목록 표시 | High | FR-007, FR-010 |
| TC-006 | 권한 생성 (actions + fieldConstraints) | 메뉴 선택 | 체크박스 선택, 필드 추가 | 정상 생성 | High | FR-008, FR-009, BR-003 |
| TC-007 | 역할 권한 할당 매트릭스 | 역할, 권한 존재 | 체크박스 토글 → 저장 | 할당 반영 | High | FR-011 |
| TC-008 | 사용자 역할그룹 관리 | 사용자 존재 | 역할그룹 탭 → 추가/제거 | 역할그룹 갱신 | High | FR-012 |
| TC-009 | 사용자 시스템 접근 확인 | 역할그룹 할당 완료 | 시스템 접근 탭 확인 | 접근 시스템 목록 | Medium | FR-013 |
| TC-010 | 사용자 최종 권한 확인 | 전체 체인 설정 | 최종 권한 탭, 시스템 필터 | 합집합 권한 표시 | High | FR-014, BR-004 |
| TC-011 | 로딩/빈 상태 표시 | - | 각 화면 초기 상태 확인 | 적절한 안내 메시지 | Medium | - |
| TC-012 | 에러 상태 표시 | API 오류 상태 | 네트워크 차단 후 조작 | 에러 메시지 | Medium | - |
| TC-013 | 반응형 레이아웃 | 데스크톱/태블릿 | 브라우저 크기 조절 | 레이아웃 적응 | Low | - |

### 4.2 매뉴얼 테스트 상세

#### TC-001: 시스템 목록 조회 및 CRUD

**테스트 목적**: 시스템 관리 화면에서 CRUD 전체 흐름이 정상 동작하는지 확인

**테스트 단계**:
1. 관리자로 로그인
2. 사이드바에서 시스템 관리 > 시스템 목록 클릭
3. 시스템 목록 테이블 표시 확인
4. [시스템 등록] 클릭 → 모달 표시 확인
5. 시스템ID, 이름, 도메인 입력 → [저장]
6. 목록에 새 시스템 표시 확인
7. 편집 아이콘 클릭 → 수정 모달 확인 → 이름 변경 → [저장]
8. 삭제 아이콘 클릭 → 확인 다이얼로그 → [확인]
9. 목록에서 삭제 확인

**예상 결과**:
- 모든 CRUD 작업 후 목록이 즉시 갱신
- 성공 시 토스트 메시지 표시

**검증 기준**:
- [ ] 생성 후 목록에 신규 항목 표시
- [ ] 수정 후 변경된 값 반영
- [ ] 삭제 후 목록에서 제거
- [ ] 각 작업 후 성공 메시지 표시

#### TC-006: 권한 생성 (actions + fieldConstraints)

**테스트 목적**: 권한 생성 모달에서 actions 체크박스와 fieldConstraints 동적 에디터가 정상 동작하는지 확인

**테스트 단계**:
1. 권한 관리 페이지 접근
2. 메뉴 트리에서 특정 메뉴 클릭
3. [권한 추가] 클릭
4. 권한 코드, 이름 입력
5. CREATE, READ, UPDATE 체크박스 선택
6. [필드 추가] 클릭 → 필드명: lineId, 값: LINE-01,LINE-02 입력
7. [필드 추가] 클릭 → 추가 필드 입력
8. 첫 번째 필드 [-] 클릭 → 행 삭제 확인
9. [저장] 클릭

**예상 결과**:
- Actions 체크박스 정상 토글
- 필드 행 동적 추가/삭제
- 저장 후 권한 목록에 신규 권한 표시
- config에 actions 배열과 fieldConstraints 객체 정상 포함

**검증 기준**:
- [ ] 체크박스 시각적 상태 변경
- [ ] 필드 행 추가 시 새 입력란 표시
- [ ] 필드 행 삭제 시 해당 행 제거
- [ ] 저장 성공 후 목록 갱신

#### TC-010: 사용자 최종 권한 확인

**테스트 목적**: 사용자의 최종 계산된 권한이 메뉴 트리와 함께 올바르게 표시되는지 확인

**테스트 단계**:
1. 사용자 관리 → 특정 사용자 상세
2. [최종 권한] 탭 클릭
3. 시스템 필터 드롭다운에서 시스템 선택
4. 메뉴 트리 구조 확인
5. 각 메뉴별 Actions 태그 확인 (CREATE, READ 등)
6. 권한 출처 (역할그룹 > 역할) 텍스트 확인
7. 다른 시스템 선택 → 권한 변경 확인

**예상 결과**:
- 시스템별 최종 권한이 다르게 표시
- 여러 경로의 권한이 합집합으로 표시
- 권한 출처가 명확히 표시

**검증 기준**:
- [ ] 메뉴 트리 구조 정상 표시
- [ ] Actions 태그 색상 구분
- [ ] 권한 출처 경로 정확
- [ ] 시스템 필터 변경 시 데이터 갱신

---

## 5. 테스트 데이터 (Fixture)

### 5.1 단위 테스트용 Mock 데이터

| 데이터 ID | 용도 | 값 |
|-----------|------|-----|
| MOCK-SYSTEM-01 | 활성 시스템 | `{ id: 'factory1', name: '제1공장', domain: 'f1.mes.com', isActive: true }` |
| MOCK-SYSTEM-02 | 비활성 시스템 | `{ id: 'hq', name: '본사', domain: 'hq.mes.com', isActive: false }` |
| MOCK-ROLEGROUP-01 | 역할그룹 (역할 포함) | `{ id: 'rg-1', code: 'RG-001', name: '생산관리그룹', systemId: 'factory1', roleCount: 3, userCount: 5 }` |
| MOCK-ROLEGROUP-02 | 역할그룹 (빈 역할) | `{ id: 'rg-2', code: 'RG-002', name: '품질조회그룹', systemId: 'factory1', roleCount: 0, userCount: 0 }` |
| MOCK-PERMISSION-01 | 읽기 전용 권한 | `{ id: 'perm-1', code: 'PROD-R', name: '생산조회', menuId: 'menu-1', config: { actions: ['READ'], fieldConstraints: {} } }` |
| MOCK-PERMISSION-02 | CRUD 권한 + 필드 제약 | `{ id: 'perm-2', code: 'PROD-CRUD', name: '생산전체', menuId: 'menu-1', config: { actions: ['CREATE','READ','UPDATE','DELETE'], fieldConstraints: { lineId: ['LINE-01'] } } }` |
| MOCK-MENU-TREE | 메뉴 트리 | `[{ id: 'menu-1', name: '생산실적', category: '조업관리/생산실적', sortOrder: '100' }, { id: 'menu-2', name: '검사실적', category: '품질관리/검사실적', sortOrder: '200' }]` |
| MOCK-USER-PERMISSIONS | 최종 권한 | `[{ menuId: 'menu-1', menuName: '생산실적', actions: ['CREATE','READ','UPDATE'], source: '생산관리그룹 > 생산관리자' }]` |

### 5.2 E2E 테스트용 시드 데이터

| 시드 ID | 용도 | 생성 방법 | 포함 데이터 |
|---------|------|----------|------------|
| SEED-E2E-BASE | 기본 E2E 환경 | 자동 시드 | 시스템 2개, 역할그룹 3개, 역할 5개, 권한 10개, 메뉴 8개, 사용자 3명 |
| SEED-E2E-EMPTY | 빈 환경 | 자동 시드 | 관리자 1명만 |
| SEED-E2E-FULL-CHAIN | 전체 권한 체인 | 자동 시드 | 사용자→역할그룹→역할→권한 완전 연결 |
| SEED-E2E-DELETE-CONSTRAINT | 삭제 제약 테스트 | 자동 시드 | 하위 데이터가 있는 시스템/역할그룹 |

### 5.3 테스트 계정

| 계정 ID | 이메일 | 비밀번호 | 역할 | 용도 |
|---------|--------|----------|------|------|
| TEST-ADMIN | admin@test.com | test1234 | ADMIN | 전체 관리 기능 테스트 |
| TEST-USER | user@test.com | test1234 | USER | 읽기 전용 기능 테스트 |

---

## 6. data-testid 목록

> 프론트엔드 컴포넌트에 적용할 `data-testid` 속성 정의

### 6.1 페이지별 셀렉터

#### 시스템 관리 페이지

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `system-list-page` | 페이지 컨테이너 | 페이지 로드 확인 |
| `system-table` | 시스템 테이블 | 목록 표시 확인 |
| `system-row-{id}` | 테이블 행 | 특정 시스템 식별 |
| `create-system-btn` | 시스템 등록 버튼 | 생성 모달 열기 |
| `edit-system-btn` | 편집 버튼 | 수정 모달 열기 |
| `delete-system-btn` | 삭제 버튼 | 삭제 확인 |
| `system-search-input` | 검색 입력 | 검색 기능 |
| `system-status-filter` | 상태 필터 | 상태 필터링 |
| `system-form-modal` | 생성/수정 모달 | 모달 표시 확인 |
| `system-id-input` | 시스템 ID 입력 | ID 입력 |
| `system-name-input` | 시스템명 입력 | 이름 입력 |
| `system-domain-input` | 도메인 입력 | 도메인 입력 |
| `system-description-input` | 설명 입력 | 설명 입력 |
| `system-active-switch` | 활성 상태 스위치 | 상태 토글 |
| `save-system-btn` | 저장 버튼 | 저장 액션 |
| `cancel-system-btn` | 취소 버튼 | 취소 액션 |

#### 역할그룹 관리 페이지

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `role-group-list-page` | 페이지 컨테이너 | 페이지 로드 확인 |
| `role-group-table` | 역할그룹 테이블 | 목록 표시 확인 |
| `role-group-row-{id}` | 테이블 행 | 특정 역할그룹 식별 |
| `create-role-group-btn` | 등록 버튼 | 생성 모달 열기 |
| `role-group-system-filter` | 시스템 필터 | 시스템별 필터링 |
| `role-group-detail-panel` | 상세 패널 | 상세 정보 표시 |
| `role-group-roles-list` | 포함 역할 목록 | 역할 목록 표시 |
| `add-role-to-group-btn` | 역할 추가 버튼 | 역할 선택 모달 |
| `remove-role-from-group-btn` | 역할 제거 버튼 | 역할 제거 확인 |
| `role-group-form-modal` | 생성/수정 모달 | 모달 표시 확인 |
| `role-group-code-input` | 코드 입력 | 코드 입력 |
| `role-group-name-input` | 이름 입력 | 이름 입력 |
| `role-group-system-select` | 시스템 선택 | 소속 시스템 선택 |
| `save-role-group-btn` | 저장 버튼 | 저장 액션 |

#### 권한 관리 페이지

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `permission-page` | 페이지 컨테이너 | 페이지 로드 확인 |
| `menu-tree` | 메뉴 트리 | 트리 표시 확인 |
| `menu-tree-node-{menuId}` | 메뉴 노드 | 특정 메뉴 선택 |
| `permission-list` | 권한 목록 패널 | 권한 목록 표시 |
| `permission-empty-state` | 빈 상태 안내 | 메뉴 미선택 상태 |
| `create-permission-btn` | 권한 추가 버튼 | 생성 모달 열기 |
| `edit-permission-btn` | 편집 버튼 | 수정 모달 열기 |
| `delete-permission-btn` | 삭제 버튼 | 삭제 확인 |
| `permission-form-modal` | 생성/수정 모달 | 모달 표시 확인 |
| `permission-code-input` | 권한 코드 입력 | 코드 입력 |
| `permission-name-input` | 권한명 입력 | 이름 입력 |
| `action-checkbox-CREATE` | CREATE 체크박스 | Action 선택 |
| `action-checkbox-READ` | READ 체크박스 | Action 선택 |
| `action-checkbox-UPDATE` | UPDATE 체크박스 | Action 선택 |
| `action-checkbox-DELETE` | DELETE 체크박스 | Action 선택 |
| `action-checkbox-EXPORT` | EXPORT 체크박스 | Action 선택 |
| `action-checkbox-IMPORT` | IMPORT 체크박스 | Action 선택 |
| `add-field-constraint-btn` | 필드 추가 버튼 | 필드 제약 행 추가 |
| `field-name-input-{index}` | 필드명 입력 | 필드명 입력 |
| `field-value-input-{index}` | 필드값 입력 | 허용 값 입력 |
| `remove-field-constraint-btn-{index}` | 필드 삭제 버튼 | 행 삭제 |
| `save-permission-btn` | 저장 버튼 | 저장 액션 |

#### 역할 권한 할당 탭

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `role-permission-tab` | 권한 할당 탭 | 탭 전환 |
| `permission-matrix` | 매트릭스 테이블 | 매트릭스 표시 |
| `perm-check-{permId}-{action}` | 권한 체크박스 | 개별 권한 토글 |
| `save-role-permissions-btn` | 저장 버튼 | 변경 저장 |

#### 사용자 관리 탭

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `user-role-group-tab` | 역할그룹 탭 | 탭 전환 |
| `user-role-group-table` | 역할그룹 테이블 | 목록 표시 |
| `add-user-role-group-btn` | 역할그룹 추가 | 할당 모달 |
| `remove-user-role-group-btn` | 역할그룹 제거 | 할당 해제 |
| `user-system-tab` | 시스템 접근 탭 | 탭 전환 |
| `user-system-table` | 시스템 테이블 | 접근 시스템 목록 |
| `user-permission-tab` | 최종 권한 탭 | 탭 전환 |
| `user-perm-system-filter` | 시스템 필터 | 시스템별 필터 |
| `user-permission-tree` | 권한 트리 | 최종 권한 표시 |
| `perm-actions-{menuId}` | Actions 태그 | 메뉴별 액션 |
| `perm-source-{menuId}` | 권한 출처 | 경로 출처 표시 |

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

- 설계 문서: `010-design.md`
- 추적성 매트릭스: `025-traceability-matrix.md`
- PRD: `.orchay/projects/rbac-redesign/prd.md`
