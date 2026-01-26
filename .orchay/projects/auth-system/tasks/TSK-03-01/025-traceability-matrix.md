# 요구사항 추적 매트릭스 (025-traceability-matrix.md)

**Task ID:** TSK-03-01
**Task명:** 역할/권한 CRUD API
**Last Updated:** 2026-01-26

---

## 1. PRD → 설계 추적

| PRD 요구사항 | 설계 문서 섹션 | 구현 컴포넌트 |
|-------------|---------------|--------------|
| PRD 4.2.1 역할 관리 | 010-design.md 4.2-4.3 | app/api/roles/route.ts, app/api/roles/[id]/route.ts |
| PRD 4.2.2 권한 관리 | 010-design.md 4.4-4.5 | app/api/permissions/route.ts, app/api/permissions/[id]/route.ts |
| PRD 4.2.3 역할-권한 매핑 | 010-design.md 4.4 | app/api/roles/[id]/permissions/route.ts |
| PRD 4.2.4 사용자-역할 할당 | 010-design.md 4.5 | app/api/users/[id]/roles/route.ts |

---

## 2. 설계 → 테스트 추적

| 설계 항목 | 테스트 ID | 테스트 설명 |
|----------|----------|------------|
| GET /api/roles | UT-ROLE-001~005 | 역할 목록 조회 테스트 |
| POST /api/roles | UT-ROLE-006~011 | 역할 생성 테스트 |
| GET /api/roles/:id | UT-ROLE-012~014 | 역할 상세 조회 테스트 |
| PUT /api/roles/:id | UT-ROLE-015~018 | 역할 수정 테스트 |
| DELETE /api/roles/:id | UT-ROLE-019~022 | 역할 삭제 테스트 |
| GET /api/permissions | UT-PERM-001~004 | 권한 목록 조회 테스트 |
| POST /api/permissions | UT-PERM-005~009 | 권한 생성 테스트 |
| GET /api/permissions/:id | UT-PERM-010~012 | 권한 상세 조회 테스트 |
| PUT /api/permissions/:id | UT-PERM-013~015 | 권한 수정 테스트 |
| DELETE /api/permissions/:id | UT-PERM-016~018 | 권한 삭제 테스트 |
| PUT /api/roles/:id/permissions | UT-RP-001~006 | 역할-권한 매핑 테스트 |
| PUT /api/users/:id/roles | UT-UR-001~006 | 사용자-역할 할당 테스트 |

---

## 3. 비즈니스 규칙 추적

| 규칙 ID | 설명 | 테스트 ID | 구현 위치 |
|---------|------|----------|----------|
| BR-03-01 | 시스템 역할 삭제 불가 | UT-ROLE-021 | app/api/roles/[id]/route.ts:313-325 |
| BR-03-02 | 중복 코드 생성 불가 | UT-ROLE-009, UT-PERM-008 | route.ts 중복 검사 로직 |
| BR-03-03 | 역할 계층 레벨 자동 계산 | UT-ROLE-011, UT-ROLE-018 | POST/PUT /api/roles 레벨 계산 로직 |

---

## 4. 커버리지 매트릭스

| 기능 | 단위 테스트 | 통합 테스트 | E2E 테스트 |
|-----|------------|------------|-----------|
| 역할 CRUD | ✅ 22개 | - | - |
| 권한 CRUD | ✅ 18개 | - | - |
| 역할-권한 매핑 | ✅ 6개 | - | - |
| 사용자-역할 할당 | ✅ 6개 | - | - |

---

## 변경 이력

| 버전 | 일자 | 작성자 | 변경 내용 |
|-----|------|--------|----------|
| 1.0 | 2026-01-26 | Claude | 최초 작성 |
