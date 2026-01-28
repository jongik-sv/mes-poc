# 요구사항 추적성 매트릭스 (025-traceability-matrix.md)

**Template Version:** 1.0.0 — **Last Updated:** 2026-01-28

> **목적**: PRD → 기본설계 → 상세설계 → 테스트 4단계 양방향 추적
>
> **참조**: 이 문서는 `010-tech-design.md`와 `026-test-spec.md`와 함께 사용됩니다.

---

## 0. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| Task ID | TSK-03-01 |
| Task명 | 사용자 메뉴 시뮬레이션 API 구현 |
| 설계 문서 참조 | `010-tech-design.md` |
| 테스트 명세 참조 | `026-test-spec.md` |
| 작성일 | 2026-01-28 |
| 작성자 | Claude |

---

## 1. 기능 요구사항 추적 (FR → 설계 → 테스트)

| 요구사항 ID | PRD 섹션 | 설계 섹션 | 구현 파일 | 단위 테스트 | 통합 테스트 | 상태 |
|-------------|----------|----------|----------|-------------|------------|------|
| FR-301 | 4.3.1 | 4.1 | `route.ts`, `menu-simulation.ts` | UT-301, UT-302 | IT-301 | 설계완료 |
| FR-302 | 4.3.1 | 4.1 | `route.ts`, `menu-simulation.ts` | UT-303, UT-304 | IT-302 | 설계완료 |
| FR-303 | 4.3.1 | 4.4 | `menu-simulation.ts` | UT-305, UT-306 | IT-301 | 설계완료 |
| FR-304 | 4.3.1 | 4.3 | `menu-simulation.ts` | UT-307 | IT-301 | 설계완료 |

### 1.1 요구사항별 상세 매핑

#### FR-301: GET /api/users/:id/menus 엔드포인트로 사용자 메뉴 트리 조회

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.3.1 | GET /api/users/{id}/menus 엔드포인트 |
| 설계 | 010-tech-design.md | 4.1 | API 엔드포인트 설계 |
| 구현 | `app/api/users/[id]/menus/route.ts` | GET 핸들러 | 사용자 실제 할당 기반 메뉴 트리 조회 |
| 구현 | `lib/auth/menu-simulation.ts` | `getMenuTreeForUser()` | 체인 조회 + 트리 빌드 |
| 단위 테스트 | 026-test-spec.md | 2.2 | UT-301, UT-302 |

#### FR-302: roleGroupIds 쿼리 파라미터로 시뮬레이션 메뉴 트리 조회

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.3.1 | 역할그룹 ID 목록을 쿼리 파라미터로 받아 시뮬레이션 지원 |
| 설계 | 010-tech-design.md | 4.1 | roleGroupIds 쿼리 파라미터 파싱 |
| 구현 | `app/api/users/[id]/menus/route.ts` | GET 핸들러 | roleGroupIds 파라미터 처리 |
| 구현 | `lib/auth/menu-simulation.ts` | `getMenuTreeForUser(userId, roleGroupIds?)` | 시뮬레이션 모드 분기 |
| 단위 테스트 | 026-test-spec.md | 2.2 | UT-303, UT-304 |

#### FR-303: 응답에 summary (totalMenus, totalCategories) 포함

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.3.1 (acceptance) | 응답에 summary 포함 |
| 설계 | 010-tech-design.md | 4.4 | calculateSummary() 함수 |
| 구현 | `lib/auth/menu-simulation.ts` | `calculateSummary()` | totalMenus, totalCategories 계산 |
| 단위 테스트 | 026-test-spec.md | 2.2 | UT-305, UT-306 |

#### FR-304: 트리 노드에 icon, path 정보 포함

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.3.1 (acceptance) | 트리 노드에 icon, path 정보 포함 |
| 설계 | 010-tech-design.md | 4.3 | buildCategoryTree() 함수 - MenuTreeNode 생성 |
| 구현 | `lib/auth/menu-simulation.ts` | `buildCategoryTree()` | menu.icon, menu.path를 노드에 매핑 |
| 단위 테스트 | 026-test-spec.md | 2.2 | UT-307 |

---

## 2. 비즈니스 규칙 추적 (BR → 구현 → 검증)

| 규칙 ID | PRD 출처 | 설계 섹션 | 구현 위치 | 단위 테스트 | 통합 테스트 | 검증 방법 | 상태 |
|---------|----------|----------|----------|-------------|------------|-----------|------|
| BR-301 | 4.3.1 | 4.2 | `menu-simulation.ts` | UT-308 | IT-301 | 중복 메뉴 제거 확인 | 설계완료 |
| BR-302 | 4.3.1 | 4.3 | `menu-simulation.ts` | UT-309, UT-310 | IT-301 | category path 기반 트리 구조 확인 | 설계완료 |

### 2.1 비즈니스 규칙별 상세 매핑

#### BR-301: 중복 메뉴 제거

| 구분 | 내용 |
|------|------|
| **PRD 원문** | 중복 메뉴 제거 (여러 역할/권한이 같은 메뉴 참조 가능) |
| **설계 표현** | 010-tech-design.md 4.2: Prisma distinct + Set 기반 이중 방어 |
| **구현 위치** | `lib/auth/menu-simulation.ts` - Prisma 쿼리 `distinct: ['id']` |
| **검증 방법** | 동일 메뉴를 참조하는 2개 이상 권한 존재 시 메뉴 1개만 반환 |
| **관련 테스트** | UT-308, IT-301 |

#### BR-302: category path 기반 트리 구조 빌드

| 구분 | 내용 |
|------|------|
| **PRD 원문** | category path 기반 트리 구조 빌드, 카테고리 기반 폴더 구조 |
| **설계 표현** | 010-tech-design.md 4.3: buildCategoryTree() 함수 |
| **구현 위치** | `lib/auth/menu-simulation.ts` - `buildCategoryTree()` |
| **검증 방법** | 동일 category의 메뉴가 같은 부모 노드 하위에 위치, sortOrder 순 정렬 |
| **관련 테스트** | UT-309, UT-310, IT-301 |

---

## 3. 테스트 역추적 매트릭스

| 테스트 ID | 테스트 유형 | 검증 대상 요구사항 | 검증 대상 비즈니스 규칙 | 상태 |
|-----------|------------|-------------------|----------------------|------|
| UT-301 | 단위 | FR-301 | - | 미실행 |
| UT-302 | 단위 | FR-301 | - | 미실행 |
| UT-303 | 단위 | FR-302 | - | 미실행 |
| UT-304 | 단위 | FR-302 | - | 미실행 |
| UT-305 | 단위 | FR-303 | - | 미실행 |
| UT-306 | 단위 | FR-303 | - | 미실행 |
| UT-307 | 단위 | FR-304 | - | 미실행 |
| UT-308 | 단위 | - | BR-301 | 미실행 |
| UT-309 | 단위 | - | BR-302 | 미실행 |
| UT-310 | 단위 | - | BR-302 | 미실행 |
| IT-301 | 통합 | FR-301, FR-303, FR-304 | BR-301, BR-302 | 미실행 |
| IT-302 | 통합 | FR-302 | - | 미실행 |
| IT-303 | 통합 | - | - | 미실행 |

---

## 4. 데이터 모델 추적

| 설계 엔티티 | Prisma 모델 | 관련 필드 | 용도 |
|-------------|------------|----------|------|
| UserRoleGroup | UserRoleGroup | userId, roleGroupId | 사용자 역할그룹 할당 조회 |
| RoleGroupRole | RoleGroupRole | roleGroupId, roleId | 역할그룹 → 역할 매핑 |
| RolePermission | RolePermission | roleId, permissionId | 역할 → 권한 매핑 |
| Permission | Permission | id, menuId | 권한 → 메뉴 연결 |
| Menu | Menu | id, name, path, icon, category, sortOrder, isActive | 메뉴 트리 노드 데이터 |

---

## 5. 인터페이스 추적

| 설계 인터페이스 | 구현 함수 | 파일 | 요구사항 |
|----------------|----------|------|----------|
| GET API 핸들러 | `GET()` | `app/api/users/[id]/menus/route.ts` | FR-301, FR-302 |
| 메뉴 트리 조회 | `getMenuTreeForUser()` | `lib/auth/menu-simulation.ts` | FR-301, FR-302 |
| 카테고리 트리 빌드 | `buildCategoryTree()` | `lib/auth/menu-simulation.ts` | FR-304, BR-302 |
| 요약 계산 | `calculateSummary()` | `lib/auth/menu-simulation.ts` | FR-303 |
| 응답 타입 | `MenuTreeResponse` | `lib/types/menu-tree.ts` | FR-301, FR-303 |
| 노드 타입 | `MenuTreeNode` | `lib/types/menu-tree.ts` | FR-304 |

---

## 6. 화면 추적

> 해당 없음 (백엔드 API Task). 프론트엔드 메뉴 시뮬레이션 컴포넌트는 TSK-02-01 범위.

---

## 7. 추적성 검증 요약

### 7.1 커버리지 통계

| 구분 | 총 항목 | 매핑 완료 | 미매핑 | 커버리지 |
|------|---------|----------|--------|---------|
| 기능 요구사항 (FR) | 4 | 4 | 0 | 100% |
| 비즈니스 규칙 (BR) | 2 | 2 | 0 | 100% |
| 단위 테스트 (UT) | 10 | 10 | 0 | 100% |
| 통합 테스트 (IT) | 3 | 3 | 0 | 100% |

### 7.2 미매핑 항목 (있는 경우)

| 구분 | ID | 설명 | 미매핑 사유 |
|------|-----|------|-----------|
| - | - | - | - |

---

## 관련 문서

- 설계 문서: `010-tech-design.md`
- 테스트 명세: `026-test-spec.md`
- PRD: `.orchay/projects/rbac-enhancement/prd.md`
