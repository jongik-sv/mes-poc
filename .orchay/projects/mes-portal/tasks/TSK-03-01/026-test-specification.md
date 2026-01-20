# 테스트 명세서 (026-test-specification.md)

**Template Version:** 1.0.0 — **Last Updated:** 2026-01-20

> **목적**: 단위 테스트, E2E 테스트 시나리오 및 테스트 데이터 정의
>
> **참조**: 이 문서는 010-design.md와 025-traceability-matrix.md와 함께 사용됩니다.
>
> **활용 단계**: /wf:build, /wf:test 단계에서 테스트 코드 생성 기준으로 사용

---

## 0. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| Task ID | TSK-03-01 |
| Task명 | 메뉴 데이터 모델 |
| 설계 문서 참조 | 010-design.md |
| 추적성 매트릭스 참조 | 025-traceability-matrix.md |
| 작성일 | 2026-01-20 |
| 작성자 | Claude |

---

## 1. 테스트 전략 개요

### 1.1 테스트 범위

| 테스트 유형 | 범위 | 목표 커버리지 |
|------------|------|--------------|
| 단위 테스트 | MenuService, API Route | 80% 이상 |
| E2E 테스트 | 메뉴 API 엔드포인트 | 100% 시나리오 커버 |
| 통합 테스트 | Prisma + API | 주요 흐름 커버 |

### 1.2 테스트 환경

| 항목 | 내용 |
|------|------|
| 테스트 프레임워크 (단위) | Vitest |
| 테스트 프레임워크 (E2E) | Playwright |
| 테스트 데이터베이스 | SQLite (테스트용) |
| API 베이스 URL | http://localhost:3000/api |

---

## 2. 단위 테스트 시나리오

### 2.1 테스트 케이스 목록

| 테스트 ID | 대상 | 시나리오 | 예상 결과 | 요구사항 |
|-----------|------|----------|----------|----------|
| UT-001 | MenuService.create | 정상 메뉴 생성 | 생성된 Menu 객체 반환 | FR-001 |
| UT-002 | MenuService.findAll | 계층형 메뉴 조회 | 트리 구조 배열 반환 | FR-002 |
| UT-003 | MenuService.findAll | 정렬 순서 적용 | sortOrder 순 정렬 | FR-003 |
| UT-004 | MenuService.create | 아이콘 필드 저장 | icon 값 저장 확인 | FR-004 |
| UT-005 | MenuService.findAll | 비활성 메뉴 필터링 | isActive=false 제외 | FR-005 |
| UT-006 | MenuService.create | 중복 코드 거부 | ConflictException 발생 | BR-001 |
| UT-007 | MenuService.create | 4단계 메뉴 거부 | BadRequestException 발생 | BR-002 |
| UT-008 | MenuService.delete | 자식 있는 메뉴 삭제 거부 | BadRequestException 발생 | BR-003 |
| UT-009 | MenuService.findAll | 비활성 메뉴 응답 제외 | 응답에 비활성 메뉴 없음 | BR-004 |

### 2.2 테스트 케이스 상세

#### UT-001: MenuService.create 정상 메뉴 생성

| 항목 | 내용 |
|------|------|
| **파일** | lib/services/__tests__/menu.service.spec.ts |
| **테스트 블록** | describe(MenuService) - describe(create) - it(should create menu with valid data) |
| **Mock 의존성** | Prisma Client mock |
| **입력 데이터** | { code: TEST_MENU, name: 테스트 메뉴, path: /test, icon: TestOutlined, sortOrder: 1 } |
| **검증 포인트** | 반환 객체에 id, code, name, createdAt 포함 확인 |
| **커버리지 대상** | create() 메서드 정상 분기 |
| **관련 요구사항** | FR-001 |

#### UT-002: MenuService.findAll 계층형 메뉴 조회

| 항목 | 내용 |
|------|------|
| **파일** | lib/services/__tests__/menu.service.spec.ts |
| **테스트 블록** | describe(MenuService) - describe(findAll) - it(should return hierarchical menu tree) |
| **Mock 의존성** | Prisma Client mock (부모-자식 관계 데이터) |
| **입력 데이터** | - |
| **검증 포인트** | 1. 최상위 메뉴 반환, 2. children 배열 존재, 3. 2단계 메뉴가 children에 포함 |
| **커버리지 대상** | findAll() 계층 구조 변환 로직 |
| **관련 요구사항** | FR-002 |

#### UT-003: MenuService.findAll 정렬 순서 적용

| 항목 | 내용 |
|------|------|
| **파일** | lib/services/__tests__/menu.service.spec.ts |
| **테스트 블록** | describe(MenuService) - describe(findAll) - it(should return menus ordered by sortOrder) |
| **Mock 의존성** | Prisma Client mock (sortOrder 다른 여러 메뉴) |
| **입력 데이터** | - |
| **검증 포인트** | 반환 배열이 sortOrder 오름차순 정렬 |
| **커버리지 대상** | findAll() 정렬 로직 |
| **관련 요구사항** | FR-003 |

#### UT-006: MenuService.create 중복 코드 거부

| 항목 | 내용 |
|------|------|
| **파일** | lib/services/__tests__/menu.service.spec.ts |
| **테스트 블록** | describe(MenuService) - describe(create) - it(should throw ConflictException for duplicate code) |
| **Mock 의존성** | Prisma Client mock (기존 메뉴 존재) |
| **입력 데이터** | { code: EXISTING_CODE, name: 중복 테스트 } |
| **검증 포인트** | ConflictException 발생, 에러 코드 DUPLICATE_MENU_CODE |
| **커버리지 대상** | create() 중복 검증 분기 |
| **관련 요구사항** | BR-001 |

#### UT-007: MenuService.create 4단계 메뉴 거부

| 항목 | 내용 |
|------|------|
| **파일** | lib/services/__tests__/menu.service.spec.ts |
| **테스트 블록** | describe(MenuService) - describe(create) - it(should throw BadRequestException for depth > 3) |
| **Mock 의존성** | Prisma Client mock (3단계 메뉴 존재) |
| **입력 데이터** | { code: LEVEL4, name: 4단계 메뉴, parentId: [3단계메뉴ID] } |
| **검증 포인트** | BadRequestException 발생, 메시지에 3단계 포함 |
| **커버리지 대상** | create() 계층 깊이 검증 |
| **관련 요구사항** | BR-002 |

#### UT-008: MenuService.delete 자식 있는 메뉴 삭제 거부

| 항목 | 내용 |
|------|------|
| **파일** | lib/services/__tests__/menu.service.spec.ts |
| **테스트 블록** | describe(MenuService) - describe(delete) - it(should throw BadRequestException when menu has children) |
| **Mock 의존성** | Prisma Client mock (자식 메뉴 존재) |
| **입력 데이터** | 자식 있는 메뉴 ID |
| **검증 포인트** | BadRequestException 발생, 메시지에 하위 메뉴 포함 |
| **커버리지 대상** | delete() 자식 존재 검증 |
| **관련 요구사항** | BR-003 |

---

## 3. E2E 테스트 시나리오

### 3.1 테스트 케이스 목록

| 테스트 ID | 시나리오 | 사전조건 | 실행 단계 | 예상 결과 | 요구사항 |
|-----------|----------|----------|----------|----------|----------|
| E2E-001 | 메뉴 목록 조회 | 시드 데이터 존재 | GET /api/menus | 메뉴 트리 반환 | FR-001 |
| E2E-002 | 3단계 메뉴 표시 | 3단계 메뉴 시드 | GET /api/menus | children 중첩 확인 | FR-002 |
| E2E-003 | 메뉴 순서 표시 | sortOrder 다른 메뉴들 | GET /api/menus | 정렬순 반환 | FR-003 |
| E2E-004 | 활성 메뉴만 표시 | 활성/비활성 혼합 | GET /api/menus | 활성만 반환 | FR-005 |
| E2E-005 | 중복 코드 생성 에러 | 기존 메뉴 존재 | POST /api/menus | 409 에러 | BR-001 |
| E2E-006 | 4단계 메뉴 생성 에러 | 3단계 메뉴 존재 | POST /api/menus | 400 에러 | BR-002 |
| E2E-007 | 자식 있는 메뉴 삭제 에러 | 부모-자식 관계 | DELETE /api/menus/:id | 400 에러 | BR-003 |

### 3.2 테스트 케이스 상세

#### E2E-001: 메뉴 목록 조회

| 항목 | 내용 |
|------|------|
| **파일** | tests/e2e/api/menus.spec.ts |
| **테스트명** | test(GET /api/menus returns menu list) |
| **사전조건** | 시드 데이터로 메뉴 생성됨 |
| **실행 단계** | await request.get(/api/menus) |
| **API 확인** | GET /api/menus -> 200 |
| **검증 포인트** | expect(response.body.success).toBe(true), expect(response.body.data).toBeArray() |
| **관련 요구사항** | FR-001 |

#### E2E-005: 중복 코드 생성 에러

| 항목 | 내용 |
|------|------|
| **파일** | tests/e2e/api/menus.spec.ts |
| **테스트명** | test(POST /api/menus returns 409 for duplicate code) |
| **사전조건** | code=DASHBOARD 메뉴 존재 |
| **실행 단계** | await request.post(/api/menus).send({ code: DASHBOARD, name: 중복 }) |
| **API 확인** | POST /api/menus -> 409 |
| **검증 포인트** | expect(response.status).toBe(409), expect(response.body.error.code).toBe(DUPLICATE_MENU_CODE) |
| **관련 요구사항** | BR-001 |

---

## 4. UI 테스트케이스 (매뉴얼)

> 본 Task(TSK-03-01)는 Backend domain으로 UI 매뉴얼 테스트는 해당 없음.
> 사이드바 메뉴 UI 테스트는 TSK-01-03에서 정의됨.

---

## 5. 테스트 데이터 (Fixture)

### 5.1 단위 테스트용 Mock 데이터

| 데이터 ID | 용도 | 값 |
|-----------|------|-----|
| MOCK-MENU-01 | 최상위 메뉴 | { id: 1, code: DASHBOARD, name: 대시보드, path: /portal/dashboard, parentId: null, sortOrder: 1, isActive: true } |
| MOCK-MENU-02 | 부모 메뉴 (폴더) | { id: 2, code: PRODUCTION, name: 생산 관리, path: null, parentId: null, sortOrder: 2, isActive: true } |
| MOCK-MENU-03 | 2단계 메뉴 | { id: 3, code: WORK_ORDER, name: 작업 지시, path: /portal/production/work-order, parentId: 2, sortOrder: 1, isActive: true } |
| MOCK-MENU-04 | 3단계 메뉴 | { id: 4, code: WORK_ORDER_DETAIL, name: 작업 지시 상세, path: /portal/production/work-order/detail, parentId: 3, sortOrder: 1, isActive: true } |
| MOCK-MENU-05 | 비활성 메뉴 | { id: 5, code: INACTIVE, name: 비활성 메뉴, path: /inactive, parentId: null, sortOrder: 99, isActive: false } |

### 5.2 E2E 테스트용 시드 데이터

| 시드 ID | 용도 | 생성 방법 | 포함 데이터 |
|---------|------|----------|------------|
| SEED-MENU-BASE | 기본 E2E 환경 | 자동 시드 | 3단계 메뉴 트리, 5개 메뉴 |
| SEED-MENU-EMPTY | 빈 환경 | 자동 시드 | 메뉴 없음 |
| SEED-MENU-DUPLICATE | 중복 테스트용 | 자동 시드 | code=DUPLICATE_TEST 존재 |

---

## 6. data-testid 목록

> 본 Task(TSK-03-01)는 Backend domain으로 data-testid는 해당 없음.
> 프론트엔드 컴포넌트 data-testid는 TSK-01-03에서 정의됨.

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
| API 엔드포인트 | 100% |
| 기능 요구사항 (FR) | 100% 커버 |
| 비즈니스 규칙 (BR) | 100% 커버 |
| 에러 케이스 | 80% 커버 |

---

## 관련 문서

- 설계 문서: 010-design.md
- 추적성 매트릭스: 025-traceability-matrix.md
- PRD: .orchay/projects/mes-portal/prd.md

---

