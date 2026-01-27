# 요구사항 추적성 매트릭스 (025-traceability-matrix.md)

---

## 0. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| Task ID | TSK-02-01 |
| Task명 | System / MenuSet / Menu CRUD API |
| 설계 참조 | `010-design.md` |
| 테스트 명세 참조 | `026-test-specification.md` |
| 작성일 | 2026-01-27 |
| 작성자 | Claude |

---

## 1. 기능 요구사항 추적 (FR → 설계 → 테스트)

| 요구사항 ID | PRD 섹션 | 기본설계 섹션 | 설계 섹션 | 단위 테스트 | E2E 테스트 | 상태 |
|-------------|----------|--------------|-----------|-------------|------------|------|
| FR-01 | §4.1 | §1.2 | 010 §2 | UT-001~003 | - | 구현완료 |
| FR-02 | §4.1 | §1.2 | 010 §2 | UT-004~006 | - | 구현완료 |
| FR-03 | §4.2 | §1.3 | 010 §3 | UT-007~010 | - | 구현완료 |
| FR-04 | §4.2 | §1.3 | 010 §3 | UT-011~013 | - | 구현완료 |
| FR-05 | §4.2 | §1.3 | 010 §3 | UT-014~015 | - | 구현완료 |
| FR-06 | §4.2 | - | 010 §4 | 기존 유지 | - | 구현완료 |

### 1.1 요구사항별 상세 매핑

#### FR-01: System CRUD (목록/생성)

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | §4.1 | 시스템(공장) 관리 CRUD |
| TRD | trd.md | §5.2 | GET/POST /api/systems |
| 설계 | 010-design.md | §2 | System API 엔드포인트 설계 |
| 단위 테스트 | 026-test-specification.md | §2 | UT-001~003 |

#### FR-02: System CRUD (상세/수정/삭제)

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | §4.1 | 시스템 상세 조회, 수정, 비활성화 |
| TRD | trd.md | §5.2 | GET/PUT/DELETE /api/systems/:id |
| 설계 | 010-design.md | §2 | System [id] API |
| 단위 테스트 | 026-test-specification.md | §2 | UT-004~006 |

#### FR-03: MenuSet CRUD (목록/생성)

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | §4.2 | 메뉴세트 관리 |
| TRD | trd.md | §5.3 | GET/POST /api/menu-sets |
| 설계 | 010-design.md | §3 | MenuSet API |
| 단위 테스트 | 026-test-specification.md | §2 | UT-007~010 |

#### FR-04: MenuSet CRUD (상세/수정/삭제)

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | §4.2 | 메뉴세트 상세 조회, 수정, 삭제 |
| TRD | trd.md | §5.3 | GET/PUT/DELETE /api/menu-sets/:id |
| 설계 | 010-design.md | §3 | MenuSet [id] API |
| 단위 테스트 | 026-test-specification.md | §2 | UT-011~013 |

#### FR-05: MenuSet 메뉴 할당

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | §4.2 | 메뉴세트에 메뉴 할당/조회 |
| TRD | trd.md | §5.3 | POST/GET /api/menu-sets/:id/menus |
| 설계 | 010-design.md | §3 | MenuSet Menus API |
| 단위 테스트 | 026-test-specification.md | §2 | UT-014~015 |

#### FR-06: Menu API 수정

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | §4.2 | 메뉴 CRUD (기존 + systemId/category 추가) |
| TRD | trd.md | §5.3 | 기존 /api/menus 유지 |
| 설계 | 010-design.md | §4 | Menu API 스키마 적합성 수정 |
| 단위 테스트 | 기존 테스트 | - | 기존 유지 |

---

## 2. 비즈니스 규칙 추적 (BR → 구현 → 검증)

| 규칙 ID | PRD 출처 | 구현 위치 | 단위 테스트 | 검증 방법 | 상태 |
|---------|----------|----------|-------------|-----------|------|
| BR-01 | §4.1 | Systems route.ts | UT-003 | 중복 systemId/domain 시 409 반환 | 구현완료 |
| BR-02 | §4.1 | Systems [id] route.ts | UT-006 | isActive=false 소프트 삭제 | 구현완료 |
| BR-03 | §4.2 | MenuSets route.ts | UT-010 | 중복 menuSetCd 시 409 반환 | 구현완료 |
| BR-04 | §4.2 | MenuSets [id]/menus route.ts | UT-015 | 메뉴 할당 시 기존 삭제 후 재할당 | 구현완료 |
| BR-05 | 공통 | 모든 mutation route | 모든 UT | SYSTEM_ADMIN 권한 필수 | 구현완료 |
| BR-06 | §4.7 | 모든 mutation route | 모든 UT | 변경 시 History 테이블 기록 | 구현완료 |

---

## 3. 테스트 역추적 매트릭스

| 테스트 ID | 테스트 유형 | 검증 대상 요구사항 | 검증 대상 규칙 | 상태 |
|-----------|------------|-------------------|---------------|------|
| UT-001 | 단위 | FR-01 | - | PASS |
| UT-002 | 단위 | FR-01 | - | PASS |
| UT-003 | 단위 | FR-01 | BR-01 | PASS |
| UT-004 | 단위 | FR-02 | - | PASS |
| UT-005 | 단위 | FR-02 | - | PASS |
| UT-006 | 단위 | FR-02 | BR-02 | PASS |
| UT-007 | 단위 | FR-03 | - | PASS |
| UT-008 | 단위 | FR-03 | BR-05 | PASS |
| UT-009 | 단위 | FR-03 | - | PASS |
| UT-010 | 단위 | FR-03 | BR-03 | PASS |
| UT-011 | 단위 | FR-04 | - | PASS |
| UT-012 | 단위 | FR-04 | - | PASS |
| UT-013 | 단위 | FR-04 | - | PASS |
| UT-014 | 단위 | FR-05 | - | PASS |
| UT-015 | 단위 | FR-05 | BR-04 | PASS |

---

## 4. 데이터 모델 추적

| 기본설계 엔티티 | Prisma 모델 | API Request DTO | API Response DTO |
|----------------|------------|-----------------|------------------|
| System | System | CreateSystemDto (systemId, name, domain, description?) | SystemResponse (systemId, name, domain, description, isActive, createdAt, updatedAt) |
| MenuSet | MenuSet | CreateMenuSetDto (systemId, menuSetCd, name, description?, isDefault?) | MenuSetResponse (menuSetId, menuSetCd, name, systemId, description, isDefault, isActive) |
| MenuSetMenu | MenuSetMenu | AssignMenusDto ({ menuIds: number[] }) | Menu[] |

---

## 5. 인터페이스 추적

| TRD API 정의 | 구현 파일 | Method | Endpoint | 요구사항 |
|-------------|----------|--------|----------|----------|
| §5.2 System 목록 | app/api/systems/route.ts | GET | /api/systems | FR-01 |
| §5.2 System 생성 | app/api/systems/route.ts | POST | /api/systems | FR-01 |
| §5.2 System 상세 | app/api/systems/[id]/route.ts | GET | /api/systems/:id | FR-02 |
| §5.2 System 수정 | app/api/systems/[id]/route.ts | PUT | /api/systems/:id | FR-02 |
| §5.2 System 삭제 | app/api/systems/[id]/route.ts | DELETE | /api/systems/:id | FR-02 |
| §5.3 MenuSet 목록 | app/api/menu-sets/route.ts | GET | /api/menu-sets | FR-03 |
| §5.3 MenuSet 생성 | app/api/menu-sets/route.ts | POST | /api/menu-sets | FR-03 |
| §5.3 MenuSet 상세 | app/api/menu-sets/[id]/route.ts | GET | /api/menu-sets/:id | FR-04 |
| §5.3 MenuSet 수정 | app/api/menu-sets/[id]/route.ts | PUT | /api/menu-sets/:id | FR-04 |
| §5.3 MenuSet 삭제 | app/api/menu-sets/[id]/route.ts | DELETE | /api/menu-sets/:id | FR-04 |
| §5.3 메뉴 할당 | app/api/menu-sets/[id]/menus/route.ts | POST | /api/menu-sets/:id/menus | FR-05 |
| §5.3 할당 메뉴 조회 | app/api/menu-sets/[id]/menus/route.ts | GET | /api/menu-sets/:id/menus | FR-05 |

---

## 6. 추적성 검증 요약

### 6.1 커버리지 통계

| 구분 | 총 항목 | 매핑 완료 | 미매핑 | 커버리지 |
|------|---------|----------|--------|---------|
| 기능 요구사항 (FR) | 6 | 6 | 0 | 100% |
| 비즈니스 규칙 (BR) | 6 | 6 | 0 | 100% |
| 단위 테스트 (UT) | 15 | 15 | 0 | 100% |
| API 엔드포인트 | 12 | 12 | 0 | 100% |

---

## 변경 이력

| 버전 | 일자 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0 | 2026-01-27 | Claude | 최초 작성 |
