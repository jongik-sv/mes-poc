# 테스트 명세서 (026-test-specification.md)

**Template Version:** 1.0.0 — **Last Updated:** 2026-01-22

> **목적**: 단위 테스트, E2E 테스트, 매뉴얼 테스트 시나리오 및 테스트 데이터 정의
>
> **참조**: 이 문서는 `010-design.md`와 `025-traceability-matrix.md`와 함께 사용됩니다.
>
> **활용 단계**: `/wf:build`, `/wf:test` 단계에서 테스트 코드 생성 기준으로 사용

---

## 0. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| Task ID | TSK-06-13 |
| Task명 | [샘플] 조직/부서 트리 |
| 설계 문서 참조 | `010-design.md` |
| 추적성 매트릭스 참조 | `025-traceability-matrix.md` |
| 작성일 | 2026-01-22 |
| 작성자 | Claude |

---

## 1. 테스트 전략 개요

### 1.1 테스트 범위

| 테스트 유형 | 범위 | 목표 커버리지 |
|------------|------|--------------|
| 단위 테스트 | 트리 상태 관리 훅, 유틸리티 함수 | 80% 이상 |
| E2E 테스트 | 주요 사용자 시나리오 (CRUD, DnD, 검색) | 100% 시나리오 커버 |
| 매뉴얼 테스트 | UI/UX, 접근성, 반응형 | 전체 화면 |

### 1.2 테스트 환경

| 항목 | 내용 |
|------|------|
| 테스트 프레임워크 (단위) | Vitest |
| 테스트 프레임워크 (E2E) | Playwright |
| 테스트 데이터 | mock-data/organization.json |
| 브라우저 | Chromium (기본) |
| 베이스 URL | `http://localhost:3000` |

---

## 2. 단위 테스트 시나리오

### 2.1 테스트 케이스 목록

| 테스트 ID | 대상 | 시나리오 | 예상 결과 | 요구사항 |
|-----------|------|----------|----------|----------|
| UT-001 | addNode | 정상 노드 추가 | 트리에 새 노드 추가됨 | FR-002 |
| UT-002 | addNode | 중복 코드 추가 | 에러 반환 | FR-002, BR-003 |
| UT-003 | updateNode | 노드 정보 수정 | 노드 데이터 업데이트됨 | FR-003 |
| UT-004 | deleteNode | 정상 노드 삭제 | 노드가 트리에서 제거됨 | FR-004 |
| UT-005 | moveNode | 정상 노드 이동 | 노드가 새 부모 아래로 이동 | FR-005 |
| UT-006 | filterTree | 검색어로 필터링 | 매칭 노드만 반환 | FR-006 |
| UT-007 | deleteNode | 루트 노드 삭제 시도 | 에러 반환 | BR-001 |
| UT-008 | moveNode | 순환 이동 시도 | 에러 반환 (이동 취소) | BR-002 |
| UT-009 | deleteNode | 하위 노드 포함 삭제 | 노드 및 모든 하위 노드 삭제 | FR-004, BR-004 |

### 2.2 테스트 케이스 상세

#### UT-001: addNode 정상 노드 추가

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/__tests__/OrganizationTree.test.tsx` |
| **테스트 블록** | `describe('useOrganizationTree') → describe('addNode') → it('should add node to parent')` |
| **Mock 의존성** | 기본 트리 데이터 설정 |
| **입력 데이터** | `{ parentId: 'dept-1', name: '새부서', code: 'NEW' }` |
| **검증 포인트** | 부모 노드의 children 배열에 새 노드 포함 확인 |
| **커버리지 대상** | `addNode()` 함수 정상 분기 |
| **관련 요구사항** | FR-002 |

#### UT-002: addNode 중복 코드 추가

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/__tests__/OrganizationTree.test.tsx` |
| **테스트 블록** | `describe('useOrganizationTree') → describe('addNode') → it('should reject duplicate code')` |
| **Mock 의존성** | 기존 코드 'HR' 존재 상태 |
| **입력 데이터** | `{ parentId: 'dept-1', name: '중복부서', code: 'HR' }` |
| **검증 포인트** | 에러 객체 반환, 에러 메시지 '이미 사용 중인 부서 코드' 포함 |
| **커버리지 대상** | `addNode()` 함수 중복 검증 분기 |
| **관련 요구사항** | FR-002, BR-003 |

#### UT-003: updateNode 노드 정보 수정

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/__tests__/OrganizationTree.test.tsx` |
| **테스트 블록** | `describe('useOrganizationTree') → describe('updateNode') → it('should update node data')` |
| **Mock 의존성** | 기존 노드 'dept-1' 존재 |
| **입력 데이터** | `{ id: 'dept-1', name: '수정된부서명', manager: '김철수' }` |
| **검증 포인트** | 해당 노드의 name, manager 필드 업데이트 확인 |
| **커버리지 대상** | `updateNode()` 함수 |
| **관련 요구사항** | FR-003 |

#### UT-004: deleteNode 정상 노드 삭제

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/__tests__/OrganizationTree.test.tsx` |
| **테스트 블록** | `describe('useOrganizationTree') → describe('deleteNode') → it('should delete leaf node')` |
| **Mock 의존성** | 리프 노드 'dept-leaf' 존재 |
| **입력 데이터** | `'dept-leaf'` |
| **검증 포인트** | 트리에서 해당 노드 제거됨, 부모의 children에서 제거 확인 |
| **커버리지 대상** | `deleteNode()` 함수 정상 분기 |
| **관련 요구사항** | FR-004 |

#### UT-005: moveNode 정상 노드 이동

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/__tests__/OrganizationTree.test.tsx` |
| **테스트 블록** | `describe('useOrganizationTree') → describe('moveNode') → it('should move node to new parent')` |
| **Mock 의존성** | 노드 'dept-a', 새 부모 'dept-b' 존재 |
| **입력 데이터** | `{ nodeId: 'dept-a', newParentId: 'dept-b' }` |
| **검증 포인트** | 노드의 parentId 변경, 새 부모의 children에 포함 |
| **커버리지 대상** | `moveNode()` 함수 정상 분기 |
| **관련 요구사항** | FR-005 |

#### UT-006: filterTree 검색어로 필터링

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/__tests__/OrganizationTree.test.tsx` |
| **테스트 블록** | `describe('useOrganizationTree') → describe('filterTree') → it('should filter by search term')` |
| **Mock 의존성** | 여러 노드 존재 ('인사팀', '재무팀', '생산팀') |
| **입력 데이터** | `'인사'` |
| **검증 포인트** | 반환된 트리에 '인사팀' 포함, 매칭되지 않는 노드 제외 |
| **커버리지 대상** | `filterTree()` 함수 |
| **관련 요구사항** | FR-006 |

#### UT-007: deleteNode 루트 노드 삭제 시도

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/__tests__/OrganizationTree.test.tsx` |
| **테스트 블록** | `describe('useOrganizationTree') → describe('deleteNode') → it('should reject root node deletion')` |
| **Mock 의존성** | 루트 노드 'root' 존재 (parentId: null) |
| **입력 데이터** | `'root'` |
| **검증 포인트** | 에러 반환, 에러 메시지 '루트 노드는 삭제할 수 없습니다' |
| **커버리지 대상** | `deleteNode()` 함수 루트 검증 분기 |
| **관련 요구사항** | BR-001 |

#### UT-008: moveNode 순환 이동 시도

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/__tests__/OrganizationTree.test.tsx` |
| **테스트 블록** | `describe('useOrganizationTree') → describe('moveNode') → it('should reject circular move')` |
| **Mock 의존성** | 노드 'parent' 및 하위 노드 'child' 존재 |
| **입력 데이터** | `{ nodeId: 'parent', newParentId: 'child' }` |
| **검증 포인트** | 에러 반환 또는 이동 취소, 트리 구조 변경 없음 |
| **커버리지 대상** | `moveNode()` 함수 순환 검증 분기 |
| **관련 요구사항** | BR-002 |

#### UT-009: deleteNode 하위 노드 포함 삭제

| 항목 | 내용 |
|------|------|
| **파일** | `screens/sample/__tests__/OrganizationTree.test.tsx` |
| **테스트 블록** | `describe('useOrganizationTree') → describe('deleteNode') → it('should delete node with all children')` |
| **Mock 의존성** | 부모 노드 'parent' 및 하위 노드 2개 존재 |
| **입력 데이터** | `'parent'` |
| **검증 포인트** | 부모 및 모든 하위 노드가 트리에서 제거됨 |
| **커버리지 대상** | `deleteNode()` 함수 재귀 삭제 로직 |
| **관련 요구사항** | FR-004, BR-004 |

---

## 3. E2E 테스트 시나리오

### 3.1 테스트 케이스 목록

| 테스트 ID | 시나리오 | 사전조건 | 실행 단계 | 예상 결과 | 요구사항 |
|-----------|----------|----------|----------|----------|----------|
| E2E-001 | 트리 조회 | 로그인 상태 | 페이지 접속 | 트리 표시됨 | FR-001 |
| E2E-002 | 노드 추가 | 로그인 상태 | 우클릭 → 추가 → 입력 → 저장 | 새 노드 추가됨 | FR-002 |
| E2E-003 | 노드 수정 | 로그인 상태 | 우클릭 → 수정 → 변경 → 저장 | 노드 정보 업데이트 | FR-003 |
| E2E-004 | 노드 삭제 | 로그인 상태 | 우클릭 → 삭제 → 확인 | 노드 삭제됨 | FR-004 |
| E2E-005 | 드래그 앤 드롭 | 로그인 상태 | 노드 드래그 → 새 위치 드롭 | 노드 이동됨 | FR-005 |
| E2E-006 | 검색 기능 | 트리 로드됨 | 검색어 입력 | 매칭 노드 강조 | FR-006 |
| E2E-007 | 루트 삭제 거부 | 로그인 상태 | 루트 노드 우클릭 → 삭제 | 삭제 메뉴 비활성화 | BR-001 |
| E2E-008 | 순환 이동 거부 | 로그인 상태 | 자기 하위로 드래그 | 드롭 불가 표시 | BR-002 |

### 3.2 테스트 케이스 상세

#### E2E-001: 트리 조회

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/organization-tree.spec.ts` |
| **테스트명** | `test('사용자가 조직 트리를 조회할 수 있다')` |
| **사전조건** | 로그인 (fixture 사용) |
| **data-testid 셀렉터** | |
| - 페이지 컨테이너 | `[data-testid="organization-tree-page"]` |
| - 트리 컨테이너 | `[data-testid="organization-tree"]` |
| - 트리 노드 | `[data-testid="tree-node"]` |
| - 상세 패널 | `[data-testid="organization-detail"]` |
| **실행 단계** | |
| 1 | `await page.goto('/sample/organization-tree')` |
| 2 | `await page.waitForSelector('[data-testid="organization-tree"]')` |
| **검증 포인트** | `expect(page.locator('[data-testid="organization-tree"]')).toBeVisible()` |
| **스크린샷** | `e2e-001-tree-view.png` |
| **관련 요구사항** | FR-001 |

#### E2E-002: 노드 추가

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/organization-tree.spec.ts` |
| **테스트명** | `test('사용자가 새 노드를 추가할 수 있다')` |
| **사전조건** | 로그인 (fixture 사용) |
| **data-testid 셀렉터** | |
| - 컨텍스트 메뉴 | `[data-testid="context-menu"]` |
| - 추가 메뉴 항목 | `[data-testid="menu-add-child"]` |
| - 추가 모달 | `[data-testid="organization-modal"]` |
| - 부서명 입력 | `[data-testid="input-name"]` |
| - 부서 코드 입력 | `[data-testid="input-code"]` |
| - 저장 버튼 | `[data-testid="btn-save"]` |
| **실행 단계** | |
| 1 | `await page.click('[data-testid="tree-node-dept-1"]', { button: 'right' })` |
| 2 | `await page.click('[data-testid="menu-add-child"]')` |
| 3 | `await page.fill('[data-testid="input-name"]', '새부서')` |
| 4 | `await page.fill('[data-testid="input-code"]', 'NEW01')` |
| 5 | `await page.click('[data-testid="btn-save"]')` |
| **검증 포인트** | `expect(page.locator('[data-testid="organization-tree"]')).toContainText('새부서')` |
| **스크린샷** | `e2e-002-add-before.png`, `e2e-002-add-after.png` |
| **관련 요구사항** | FR-002 |

#### E2E-003: 노드 수정

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/organization-tree.spec.ts` |
| **테스트명** | `test('사용자가 노드 정보를 수정할 수 있다')` |
| **사전조건** | 로그인 (fixture 사용) |
| **data-testid 셀렉터** | |
| - 수정 메뉴 항목 | `[data-testid="menu-edit"]` |
| **실행 단계** | |
| 1 | `await page.click('[data-testid="tree-node-dept-1"]', { button: 'right' })` |
| 2 | `await page.click('[data-testid="menu-edit"]')` |
| 3 | `await page.fill('[data-testid="input-name"]', '수정된부서명')` |
| 4 | `await page.click('[data-testid="btn-save"]')` |
| **검증 포인트** | `expect(page.locator('[data-testid="organization-tree"]')).toContainText('수정된부서명')` |
| **스크린샷** | `e2e-003-edit.png` |
| **관련 요구사항** | FR-003 |

#### E2E-004: 노드 삭제

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/organization-tree.spec.ts` |
| **테스트명** | `test('사용자가 노드를 삭제할 수 있다')` |
| **사전조건** | 로그인 (fixture 사용) |
| **data-testid 셀렉터** | |
| - 삭제 메뉴 항목 | `[data-testid="menu-delete"]` |
| - 확인 버튼 | `.ant-modal-confirm-btns .ant-btn-primary` |
| **실행 단계** | |
| 1 | `await page.click('[data-testid="tree-node-dept-leaf"]', { button: 'right' })` |
| 2 | `await page.click('[data-testid="menu-delete"]')` |
| 3 | `await page.click('.ant-modal-confirm-btns .ant-btn-primary')` |
| **검증 포인트** | `expect(page.locator('[data-testid="tree-node-dept-leaf"]')).not.toBeVisible()` |
| **스크린샷** | `e2e-004-delete-confirm.png`, `e2e-004-delete-after.png` |
| **관련 요구사항** | FR-004 |

#### E2E-005: 드래그 앤 드롭

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/organization-tree.spec.ts` |
| **테스트명** | `test('사용자가 드래그 앤 드롭으로 노드를 이동할 수 있다')` |
| **사전조건** | 로그인 (fixture 사용) |
| **data-testid 셀렉터** | |
| - 소스 노드 | `[data-testid="tree-node-dept-a"]` |
| - 타겟 노드 | `[data-testid="tree-node-dept-b"]` |
| **실행 단계** | |
| 1 | 소스 노드 위치 확인 (부모: root) |
| 2 | `await page.dragAndDrop('[data-testid="tree-node-dept-a"]', '[data-testid="tree-node-dept-b"]')` |
| 3 | 노드 위치 변경 확인 |
| **검증 포인트** | dept-a가 dept-b의 children 안에 위치 확인 |
| **스크린샷** | `e2e-005-dnd-before.png`, `e2e-005-dnd-after.png` |
| **관련 요구사항** | FR-005 |

#### E2E-006: 검색 기능

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/organization-tree.spec.ts` |
| **테스트명** | `test('사용자가 검색으로 노드를 찾을 수 있다')` |
| **사전조건** | 트리 로드됨 |
| **data-testid 셀렉터** | |
| - 검색 입력 | `[data-testid="search-input"]` |
| - 검색 결과 개수 | `[data-testid="search-count"]` |
| - 강조된 노드 | `.ant-tree-node-highlighted` |
| **실행 단계** | |
| 1 | `await page.fill('[data-testid="search-input"]', '인사')` |
| 2 | `await page.waitForSelector('[data-testid="search-count"]')` |
| **검증 포인트** | `expect(page.locator('[data-testid="search-count"]')).toContainText('1건')` |
| **스크린샷** | `e2e-006-search.png` |
| **관련 요구사항** | FR-006 |

#### E2E-007: 루트 삭제 거부

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/organization-tree.spec.ts` |
| **테스트명** | `test('루트 노드는 삭제할 수 없다')` |
| **사전조건** | 로그인 (fixture 사용) |
| **실행 단계** | |
| 1 | `await page.click('[data-testid="tree-node-root"]', { button: 'right' })` |
| 2 | 삭제 메뉴 항목 상태 확인 |
| **검증 포인트** | `expect(page.locator('[data-testid="menu-delete"]')).toBeDisabled()` |
| **스크린샷** | `e2e-007-root-delete.png` |
| **관련 요구사항** | BR-001 |

#### E2E-008: 순환 이동 거부

| 항목 | 내용 |
|------|------|
| **파일** | `tests/e2e/organization-tree.spec.ts` |
| **테스트명** | `test('자기 하위로 노드를 이동할 수 없다')` |
| **사전조건** | 로그인 (fixture 사용) |
| **실행 단계** | |
| 1 | 부모 노드를 자식 노드 위로 드래그 시도 |
| 2 | 드롭 불가 표시 확인 |
| **검증 포인트** | 드롭 후 트리 구조 변경 없음 확인 |
| **스크린샷** | `e2e-008-circular-move.png` |
| **관련 요구사항** | BR-002 |

---

## 4. UI 테스트케이스 (매뉴얼)

### 4.1 테스트 케이스 목록

| TC-ID | 테스트 항목 | 사전조건 | 테스트 단계 | 예상 결과 | 우선순위 | 요구사항 |
|-------|-----------|---------|-----------|----------|---------|----------|
| TC-001 | 트리 렌더링 | 로그인 | 페이지 접속 | 계층 구조 표시 | High | FR-001 |
| TC-002 | 노드 추가 | 트리 표시 | 우클릭 → 추가 | 새 노드 추가됨 | High | FR-002 |
| TC-003 | 노드 수정 | 트리 표시 | 우클릭 → 수정 | 정보 업데이트 | High | FR-003 |
| TC-004 | 노드 삭제 | 트리 표시 | 우클릭 → 삭제 | 노드 제거됨 | High | FR-004 |
| TC-005 | 드래그 앤 드롭 | 트리 표시 | 노드 드래그 | 위치 이동됨 | Medium | FR-005 |
| TC-006 | 검색 기능 | 트리 표시 | 검색어 입력 | 노드 강조 | Medium | FR-006 |
| TC-007 | 반응형 확인 | - | 브라우저 크기 조절 | 레이아웃 적응 | Medium | - |
| TC-008 | 키보드 접근성 | - | 키보드만 사용 | 모든 기능 접근 가능 | Medium | - |
| TC-009 | 상세 패널 | 노드 선택 | 노드 클릭 | 상세 정보 표시 | High | FR-001 |
| TC-010 | 빈 상태 | 데이터 없음 | 페이지 접속 | Empty 상태 표시 | Low | - |

### 4.2 매뉴얼 테스트 상세

#### TC-001: 트리 렌더링

**테스트 목적**: 조직 트리가 계층 구조로 정상 렌더링되는지 확인

**테스트 단계**:
1. 로그인 완료
2. 사이드바에서 "샘플 > 조직/부서 트리" 메뉴 클릭
3. 트리 영역에 조직 구조가 표시되는지 확인

**예상 결과**:
- 루트 노드가 펼쳐진 상태로 표시됨
- 계층 구조가 들여쓰기로 구분됨
- 각 노드에 아이콘과 이름이 표시됨
- 하위 노드가 있는 경우 펼침/접힘 화살표 표시

**검증 기준**:
- [ ] 트리가 정상적으로 로드됨
- [ ] 폴더/파일 아이콘이 적절히 표시됨
- [ ] 펼침/접힘 토글 동작 확인

#### TC-005: 드래그 앤 드롭

**테스트 목적**: 드래그 앤 드롭으로 노드 위치를 이동할 수 있는지 확인

**테스트 단계**:
1. 트리에서 이동할 노드를 찾음
2. 노드를 마우스로 드래그 시작
3. 새 부모 노드 위치로 드래그
4. 드롭하여 이동 완료

**예상 결과**:
- 드래그 중 프리뷰가 표시됨
- 드롭 가능 위치에 시각적 표시
- 드롭 후 노드가 새 위치로 이동
- 하위 노드도 함께 이동

**검증 기준**:
- [ ] 드래그 프리뷰 표시
- [ ] 드롭 가능/불가 영역 구분
- [ ] 이동 후 트리 구조 업데이트
- [ ] 이동 후 자동 펼침 (이동된 노드 보임)

---

## 5. 테스트 데이터 (Fixture)

### 5.1 단위 테스트용 Mock 데이터

| 데이터 ID | 용도 | 값 |
|-----------|------|-----|
| MOCK-ORG-ROOT | 루트 노드 | `{ id: 'root', name: '주식회사 A', code: 'ROOT', parentId: null }` |
| MOCK-ORG-DEPT1 | 1레벨 부서 | `{ id: 'dept-1', name: '경영지원본부', code: 'MGMT', parentId: 'root' }` |
| MOCK-ORG-DEPT2 | 1레벨 부서 | `{ id: 'dept-2', name: '생산본부', code: 'PROD', parentId: 'root' }` |
| MOCK-ORG-LEAF | 리프 노드 | `{ id: 'dept-leaf', name: '인사팀', code: 'HR', parentId: 'dept-1' }` |

### 5.2 E2E 테스트용 시드 데이터

| 시드 ID | 용도 | 생성 방법 | 포함 데이터 |
|---------|------|----------|------------|
| SEED-ORG-BASE | 기본 E2E 환경 | mock-data/organization.json | 3레벨 조직 구조, 10개 노드 |
| SEED-ORG-EMPTY | 빈 환경 | 빈 JSON | 데이터 없음 (Empty State 테스트) |

### 5.3 테스트 계정

| 계정 ID | 이메일 | 비밀번호 | 역할 | 용도 |
|---------|--------|----------|------|------|
| TEST-ADMIN | admin@test.com | test1234 | ADMIN | 관리자 기능 (CRUD) 테스트 |
| TEST-USER | user@test.com | test1234 | USER | 조회 전용 테스트 |

---

## 6. data-testid 목록

> 프론트엔드 컴포넌트에 적용할 `data-testid` 속성 정의

### 6.1 페이지별 셀렉터

#### 조직 트리 메인 페이지

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `organization-tree-page` | 페이지 컨테이너 | 페이지 로드 확인 |
| `organization-tree` | 트리 컨테이너 | 트리 표시 확인 |
| `tree-node` | 트리 노드 (공통) | 노드 개수 확인 |
| `tree-node-{id}` | 특정 노드 | 특정 노드 선택 |
| `organization-detail` | 상세 패널 | 상세 정보 표시 확인 |
| `search-input` | 검색 입력창 | 검색 기능 |
| `search-count` | 검색 결과 개수 | 검색 결과 확인 |
| `btn-add-root` | 루트 추가 버튼 | 루트 노드 추가 |

#### 컨텍스트 메뉴

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `context-menu` | 컨텍스트 메뉴 컨테이너 | 메뉴 표시 확인 |
| `menu-add-child` | 하위 노드 추가 | 추가 기능 |
| `menu-edit` | 수정 | 수정 기능 |
| `menu-delete` | 삭제 | 삭제 기능 |

#### 추가/수정 모달

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `organization-modal` | 모달 컨테이너 | 모달 표시 확인 |
| `input-name` | 부서명 입력 | 부서명 입력 |
| `input-code` | 부서 코드 입력 | 코드 입력 |
| `input-manager` | 담당자 입력 | 담당자 입력 |
| `input-contact` | 연락처 입력 | 연락처 입력 |
| `input-headcount` | 인원 입력 | 인원 입력 |
| `input-description` | 설명 입력 | 설명 입력 |
| `btn-save` | 저장 버튼 | 저장 액션 |
| `btn-cancel` | 취소 버튼 | 취소 액션 |
| `error-message` | 에러 메시지 | 에러 표시 확인 |

#### 상세 패널

| data-testid | 요소 | 용도 |
|-------------|------|------|
| `detail-name` | 부서명 표시 | 이름 확인 |
| `detail-code` | 부서 코드 표시 | 코드 확인 |
| `detail-manager` | 담당자 표시 | 담당자 확인 |
| `detail-contact` | 연락처 표시 | 연락처 확인 |
| `detail-headcount` | 인원 표시 | 인원 확인 |
| `btn-detail-edit` | 수정 버튼 | 수정 모달 열기 |
| `btn-detail-delete` | 삭제 버튼 | 삭제 확인 |

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
- PRD: `.orchay/projects/mes-portal/prd.md`

---

<!--
TSK-06-13 테스트 명세서
Version: 1.0
Created: 2026-01-22
-->
