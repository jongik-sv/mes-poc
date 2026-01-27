# 구현 보고서

---

## 0. 문서 메타데이터

* **문서명**: `030-implementation.md`
* **Task ID**: TSK-02-01
* **Task 명**: System / MenuSet / Menu CRUD API
* **작성일**: 2026-01-27
* **작성자**: Claude
* **참조 설계서**: `./010-design.md`
* **구현 기간**: 2026-01-27
* **구현 상태**: 완료

---

## 1. 구현 개요

### 1.1 구현 목적
- TRD §5.2, §5.3 기준 System CRUD API 및 MenuSet CRUD API 개발
- 멀티 테넌트(System) 관리 + 메뉴세트 기반 메뉴 구성 API 제공

### 1.2 구현 범위
- **포함된 기능**:
  - System CRUD API (5개 엔드포인트)
  - MenuSet CRUD API (5개 엔드포인트)
  - MenuSet-Menu 할당/조회 API (2개 엔드포인트)

- **제외된 기능**:
  - 관리 화면 → TSK-03-02
  - RoleGroup/Role/Permission API → TSK-02-02

### 1.3 구현 유형
- [x] Backend Only

### 1.4 기술 스택
- **Backend**:
  - Runtime: Node.js
  - Framework: Next.js 16.x (Route Handlers)
  - ORM: Prisma 7.x
  - Database: SQLite (PoC)
  - Testing: Vitest 4.x

---

## 2. Backend 구현 결과

### 2.1 구현된 컴포넌트

#### 2.1.1 Systems API
- **파일**: `app/api/systems/route.ts`, `app/api/systems/[id]/route.ts`
- **주요 엔드포인트**:

| HTTP Method | Endpoint | 설명 |
|-------------|----------|------|
| GET | `/api/systems` | 시스템 목록 (페이징, isActive/search 필터) |
| POST | `/api/systems` | 시스템 생성 (관리자, systemId/domain 중복 검사) |
| GET | `/api/systems/:id` | 시스템 상세 (관계 카운트 포함) |
| PUT | `/api/systems/:id` | 시스템 수정 (관리자, domain 중복 검사) |
| DELETE | `/api/systems/:id` | 시스템 소프트 삭제 (isActive=false) |

#### 2.1.2 MenuSets API
- **파일**: `app/api/menu-sets/route.ts`, `app/api/menu-sets/[id]/route.ts`, `app/api/menu-sets/[id]/menus/route.ts`
- **주요 엔드포인트**:

| HTTP Method | Endpoint | 설명 |
|-------------|----------|------|
| GET | `/api/menu-sets` | 메뉴세트 목록 (systemId/isActive/search 필터) |
| POST | `/api/menu-sets` | 메뉴세트 생성 (관리자, menuSetCd 중복 검사) |
| GET | `/api/menu-sets/:id` | 메뉴세트 상세 (메뉴 목록 포함) |
| PUT | `/api/menu-sets/:id` | 메뉴세트 수정 (관리자) |
| DELETE | `/api/menu-sets/:id` | 메뉴세트 삭제 (관리자, cascade) |
| GET | `/api/menu-sets/:id/menus` | 할당된 메뉴 목록 |
| POST | `/api/menu-sets/:id/menus` | 메뉴 할당 (전체 교체, diff 히스토리) |

#### 2.1.3 공통 패턴
- **인증**: `auth()` 세션 검증 + SYSTEM_ADMIN 역할 확인
- **히스토리**: `$transaction`으로 메인 작업 + History + AuditLog 원자적 기록
- **SCD Type 2**: 이전 레코드 `validTo` 종료 + 신규 레코드 생성
- **응답**: `{ success, data?, error?: { code, message } }`
- **페이징**: `{ items, total, page, pageSize, totalPages }`

### 2.2 TDD 테스트 결과

#### 2.2.1 테스트 실행 결과
```
✓ app/api/systems/__tests__/route.spec.ts (10 tests) 21ms
✓ app/api/systems/[id]/__tests__/route.spec.ts (6 tests) 19ms
✓ app/api/menu-sets/__tests__/route.spec.ts (10 tests) 28ms
✓ app/api/menu-sets/[id]/__tests__/route.spec.ts (9 tests) 24ms
✓ app/api/menu-sets/[id]/menus/__tests__/route.spec.ts (7 tests) 22ms

Test Files  5 passed (5)
Tests       42 passed (42)
Duration    1.39s
```

#### 2.2.2 테스트 시나리오 매핑

| 테스트 ID | 시나리오 | 결과 | 비고 |
|-----------|---------|------|------|
| UT-001 | GET /api/systems 페이징 목록 | PASS | FR-01 |
| UT-002 | GET /api/systems isActive/search 필터 | PASS | FR-01 |
| UT-003 | POST /api/systems 중복 검사 (409) | PASS | BR-01 |
| UT-004 | GET /api/systems/:id 상세 조회 | PASS | FR-02 |
| UT-005 | PUT /api/systems/:id 수정 | PASS | FR-02 |
| UT-006 | DELETE /api/systems/:id 소프트 삭제 | PASS | BR-02 |
| UT-007 | GET /api/menu-sets 페이징+필터 | PASS | FR-03 |
| UT-008 | POST /api/menu-sets 인증/권한 검사 | PASS | BR-05 |
| UT-009 | POST /api/menu-sets 정상 생성 | PASS | FR-03 |
| UT-010 | POST /api/menu-sets 중복 menuSetCd (409) | PASS | BR-03 |
| UT-011 | GET /api/menu-sets/:id 상세 | PASS | FR-04 |
| UT-012 | PUT /api/menu-sets/:id 수정 | PASS | FR-04 |
| UT-013 | DELETE /api/menu-sets/:id 삭제 | PASS | FR-04 |
| UT-014 | GET /api/menu-sets/:id/menus 할당 메뉴 | PASS | FR-05 |
| UT-015 | POST /api/menu-sets/:id/menus 메뉴 할당 | PASS | BR-04 |

---

## 3. 요구사항 커버리지

### 3.1 기능 요구사항 커버리지
| 요구사항 ID | 요구사항 설명 | 테스트 ID | 결과 |
|-------------|-------------|-----------|------|
| FR-01 | System 목록/생성 API | UT-001~003 | PASS |
| FR-02 | System 상세/수정/삭제 API | UT-004~006 | PASS |
| FR-03 | MenuSet 목록/생성 API | UT-007~010 | PASS |
| FR-04 | MenuSet 상세/수정/삭제 API | UT-011~013 | PASS |
| FR-05 | MenuSet 메뉴 할당/조회 API | UT-014~015 | PASS |

### 3.2 비즈니스 규칙 커버리지
| 규칙 ID | 규칙 설명 | 테스트 ID | 결과 |
|---------|----------|-----------|------|
| BR-01 | systemId/domain 중복 불가 | UT-003 | PASS |
| BR-02 | System 삭제는 소프트 삭제 | UT-006 | PASS |
| BR-03 | menuSetCd 중복 불가 | UT-010 | PASS |
| BR-04 | 메뉴 할당 시 전체 교체 + 히스토리 | UT-015 | PASS |
| BR-05 | 변경 작업은 SYSTEM_ADMIN 필수 | UT-008 | PASS |
| BR-06 | 변경 시 History 테이블 기록 | 전체 POST/PUT/DELETE | PASS |

---

## 4. 주요 기술적 결정사항

1. **소프트 삭제 (System)**
   - 배경: System 삭제 시 관련 데이터(MenuSet, Role 등) 참조 무결성
   - 선택: `isActive=false` 소프트 삭제
   - 근거: 복구 가능성 보장, FK 무결성 유지

2. **메뉴 할당 전체 교체 방식 (MenuSet Menus)**
   - 배경: 부분 추가/삭제 vs 전체 교체
   - 선택: 기존 전체 삭제 후 새로 할당 (diff 계산으로 히스토리 기록)
   - 근거: 구현 단순성, 클라이언트에서 전체 목록 전송이 자연스러움

---

## 5. 구현 완료 체크리스트

### 5.1 Backend 체크리스트
- [x] API 엔드포인트 구현 완료 (12개)
- [x] 비즈니스 로직 구현 완료 (중복 검사, 소프트 삭제, 전체 교체 할당)
- [x] 선분 이력 기록 구현 (SystemHistory, MenuSetHistory, MenuSetMenuHistory)
- [x] TDD 테스트 작성 및 통과 (42/42 PASS)
- [x] 감사 로그 기록 구현

---

## 6. 생성된 파일 목록

| 파일 | 유형 |
|------|------|
| `app/api/systems/route.ts` | API Route |
| `app/api/systems/[id]/route.ts` | API Route |
| `app/api/menu-sets/route.ts` | API Route |
| `app/api/menu-sets/[id]/route.ts` | API Route |
| `app/api/menu-sets/[id]/menus/route.ts` | API Route |
| `app/api/systems/__tests__/route.spec.ts` | 테스트 (10) |
| `app/api/systems/[id]/__tests__/route.spec.ts` | 테스트 (6) |
| `app/api/menu-sets/__tests__/route.spec.ts` | 테스트 (10) |
| `app/api/menu-sets/[id]/__tests__/route.spec.ts` | 테스트 (9) |
| `app/api/menu-sets/[id]/menus/__tests__/route.spec.ts` | 테스트 (7) |

---

## 7. 다음 단계

- TSK-02-02: RoleGroup / Role / Permission CRUD + 할당 API
- TSK-03-02: 시스템/역할그룹/권한 정의 관리 화면

---

## 부록: 변경 이력

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0.0 | 2026-01-27 | Claude | 최초 작성 |
