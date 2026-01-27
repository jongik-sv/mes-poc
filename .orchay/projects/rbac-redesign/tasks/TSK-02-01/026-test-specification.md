# 테스트 명세서 (026-test-specification.md)

---

## 0. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| Task ID | TSK-02-01 |
| Task명 | System / MenuSet / Menu CRUD API |
| 설계 참조 | `010-design.md` |
| 추적성 매트릭스 참조 | `025-traceability-matrix.md` |
| 작성일 | 2026-01-27 |
| 작성자 | Claude |

---

## 1. 테스트 전략 개요

### 1.1 테스트 범위

| 테스트 유형 | 범위 | 목표 커버리지 |
|------------|------|--------------|
| 단위 테스트 | Systems API route, MenuSets API route, MenuSets Menus route | 80% 이상 |
| E2E 테스트 | 해당 없음 (API 전용 태스크, 화면은 TSK-03-02) | - |

### 1.2 테스트 환경

| 항목 | 내용 |
|------|------|
| 테스트 프레임워크 | Vitest |
| Mock 방식 | vi.mock (auth, prisma) |
| 실행 명령 | `pnpm vitest run app/api/systems app/api/menu-sets` |

---

## 2. 단위 테스트 시나리오

### 2.1 Systems API 테스트 (`app/api/systems/__tests__/route.spec.ts`)

| 테스트 ID | 대상 | 시나리오 | 예상 결과 | 요구사항 |
|-----------|------|----------|----------|----------|
| UT-001 | GET /api/systems | 페이지네이션 목록 조회 | 200, items + pagination | FR-01 |
| UT-002 | GET /api/systems | isActive 필터, search 검색 | 200, 필터링된 목록 | FR-01 |
| UT-003 | POST /api/systems | 중복 systemId 또는 domain | 409, 에러 반환 | FR-01, BR-01 |
| UT-004 | GET /api/systems/:id | 상세 조회 (관계 카운트 포함) | 200, menuSetsCount/rolesCount/menusCount | FR-02 |
| UT-005 | PUT /api/systems/:id | 관리자 수정, domain 중복 검사 | 200, 업데이트된 시스템 | FR-02 |
| UT-006 | DELETE /api/systems/:id | 소프트 삭제 (isActive=false) | 200, 비활성화 | FR-02, BR-02 |

### 2.2 Systems API 테스트 상세

#### UT-001: GET /api/systems 페이지네이션

| 항목 | 내용 |
|------|------|
| **파일** | `app/api/systems/__tests__/route.spec.ts` |
| **Mock** | `prisma.system.findMany`, `prisma.system.count`, `auth()` → session |
| **입력** | `?page=1&pageSize=10` |
| **검증** | `success: true`, `data.items` 배열, `data.total/page/pageSize/totalPages` 포함 |
| **관련 요구사항** | FR-01 |

#### UT-003: POST /api/systems 중복 검사

| 항목 | 내용 |
|------|------|
| **파일** | `app/api/systems/__tests__/route.spec.ts` |
| **Mock** | `prisma.system.findUnique` → 기존 데이터 반환, admin session |
| **입력** | `{ systemId: 'existing-id', name: 'Test', domain: 'test.com' }` |
| **검증** | 409 응답, `error.code: 'DUPLICATE_SYSTEM_ID'` 또는 `'DUPLICATE_DOMAIN'` |
| **관련 요구사항** | FR-01, BR-01 |

#### UT-006: DELETE /api/systems/:id 소프트 삭제

| 항목 | 내용 |
|------|------|
| **파일** | `app/api/systems/[id]/__tests__/route.spec.ts` |
| **Mock** | `prisma.$transaction`, admin session |
| **입력** | DELETE /api/systems/mes-factory1 |
| **검증** | `prisma.system.update({ isActive: false })` 호출, SystemHistory CREATE, AuditLog 기록 |
| **관련 요구사항** | FR-02, BR-02 |

### 2.3 MenuSets API 테스트 (`app/api/menu-sets/__tests__/route.spec.ts`)

| 테스트 ID | 대상 | 시나리오 | 예상 결과 | 요구사항 |
|-----------|------|----------|----------|----------|
| UT-007 | GET /api/menu-sets | 페이지네이션 목록 + systemId 필터 | 200, 필터링된 목록 | FR-03 |
| UT-008 | POST /api/menu-sets | 미인증/비관리자 | 401/403 | FR-03, BR-05 |
| UT-009 | POST /api/menu-sets | 정상 생성 (관리자) | 201, 생성된 메뉴세트 | FR-03 |
| UT-010 | POST /api/menu-sets | 중복 menuSetCd | 409 | FR-03, BR-03 |

### 2.4 MenuSets [id] API 테스트 (`app/api/menu-sets/[id]/__tests__/route.spec.ts`)

| 테스트 ID | 대상 | 시나리오 | 예상 결과 | 요구사항 |
|-----------|------|----------|----------|----------|
| UT-011 | GET /api/menu-sets/:id | 상세 조회 (메뉴 목록 포함) | 200, menuSetMenus 포함 | FR-04 |
| UT-012 | PUT /api/menu-sets/:id | 관리자 수정 | 200, 업데이트된 메뉴세트 | FR-04 |
| UT-013 | DELETE /api/menu-sets/:id | 관리자 삭제 | 200, 삭제됨 | FR-04 |

### 2.5 MenuSet Menus API 테스트 (`app/api/menu-sets/[id]/menus/__tests__/route.spec.ts`)

| 테스트 ID | 대상 | 시나리오 | 예상 결과 | 요구사항 |
|-----------|------|----------|----------|----------|
| UT-014 | GET /api/menu-sets/:id/menus | 할당된 메뉴 조회 | 200, 메뉴 목록 | FR-05 |
| UT-015 | POST /api/menu-sets/:id/menus | 메뉴 할당 (기존 삭제+재할당) | 200, 할당 결과 | FR-05, BR-04 |

---

## 3. 테스트 데이터 (Fixture)

### 3.1 단위 테스트용 Mock 데이터

| 데이터 ID | 용도 | 값 |
|-----------|------|-----|
| MOCK-ADMIN | 관리자 세션 | `{ user: { id: 'admin001', email: 'admin@test.com' } }` |
| MOCK-USER | 일반 사용자 세션 | `{ user: { id: 'user001', email: 'user@test.com' } }` |
| MOCK-ADMIN-USER | 관리자 DB 레코드 | `{ userId: 'admin001', isActive: true, userRoleGroups: [{ roleGroup: { roleGroupRoles: [{ role: { roleCd: 'SYSTEM_ADMIN' } }] } }] }` |
| MOCK-SYSTEM | 시스템 | `{ systemId: 'mes-factory1', name: '공장1 MES', domain: 'factory1.mes.com', isActive: true }` |
| MOCK-MENUSET | 메뉴세트 | `{ menuSetId: 1, menuSetCd: 'ADMIN_SET', name: '관리자 메뉴세트', systemId: 'mes-factory1' }` |

---

## 4. 테스트 커버리지 목표

### 4.1 단위 테스트 커버리지

| 대상 | 목표 | 최소 |
|------|------|------|
| Lines | 80% | 70% |
| Branches | 75% | 65% |
| Functions | 85% | 75% |

---

## 관련 문서

- 설계: `010-design.md`
- 추적성 매트릭스: `025-traceability-matrix.md`
- PRD: `.orchay/projects/rbac-redesign/prd.md`
- TRD: `.orchay/projects/rbac-redesign/trd.md`

---

## 변경 이력

| 버전 | 일자 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0 | 2026-01-27 | Claude | 최초 작성 |
