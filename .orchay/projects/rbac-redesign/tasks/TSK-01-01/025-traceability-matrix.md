# 요구사항 추적성 매트릭스 (025-traceability-matrix.md)

---

## 0. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| Task ID | TSK-01-01 |
| Task명 | Prisma 스키마 확장 및 마이그레이션 |
| 설계 참조 | `010-tech-design.md` |
| 테스트 명세 참조 | `026-test-specification.md` |
| 작성일 | 2026-01-27 |
| 작성자 | Claude |

---

## 1. 기능 요구사항 추적

| 요구사항 ID | PRD 섹션 | TRD 섹션 | 구현 항목 | 검증 방법 | 상태 |
|-------------|----------|----------|----------|-----------|------|
| FR-01 | §4.1 | §3 | System 모델 (String PK) | migrate + seed | 완료 |
| FR-02 | §4.1 | §3 | User 모델 (String PK, 사번) | migrate + seed | 완료 |
| FR-03 | §4.2 | §3 | MenuSet, MenuSetMenu 모델 | migrate + seed | 완료 |
| FR-04 | §4.2 | §3 | Menu 모델 (category path, sortOrder String) | migrate + seed | 완료 |
| FR-05 | §4.3 | §3 | RoleGroup, RoleGroupRole 모델 | migrate + seed | 완료 |
| FR-06 | §4.3 | §3 | UserRoleGroup 모델 | migrate + seed | 완료 |
| FR-07 | §4.3 | §3 | UserSystemMenuSet 모델 | migrate + seed | 완료 |
| FR-08 | §4.4 | §3 | Permission 모델 (config JSON, menuId FK) | migrate + seed | 완료 |
| FR-09 | §4.4 | §3 | Role 모델 (systemId, parentRoleId) | migrate + seed | 완료 |
| FR-10 | §4.7 | §3 | 선분 이력 테이블 13개 (마스터 8 + 매핑 5) | migrate | 완료 |
| FR-11 | - | §3 | UserRole, RoleMenu 테이블 제거 | migrate | 완료 |

---

## 2. 데이터 모델 추적

| TRD 엔티티 | Prisma 모델 | PK 타입 | 주요 변경사항 |
|-----------|------------|---------|-------------|
| System | System | String (systemId) | Int → String PK |
| User | User | String (userId) | Int → String PK (사번) |
| MenuSet | MenuSet | Int (autoincrement) | 신규 |
| MenuSetMenu | MenuSetMenu | 복합 (menuSetId, menuId) | 신규 |
| Menu | Menu | Int (autoincrement) | parentId 제거, category/sortOrder 추가 |
| RoleGroup | RoleGroup | Int (autoincrement) | 신규 |
| RoleGroupRole | RoleGroupRole | 복합 | 신규 |
| UserRoleGroup | UserRoleGroup | 복합 | 신규 (UserRole 대체) |
| UserSystemMenuSet | UserSystemMenuSet | 복합 | 신규 |
| Role | Role | Int (autoincrement) | systemId 추가, roleCd 추가 |
| Permission | Permission | Int (autoincrement) | config JSON, menuId FK, systemId 추가 |
| *History (13개) | *History | Int (autoincrement) | 신규 (SCD Type 2) |

---

## 3. 검증 요약

| 검증 항목 | 방법 | 결과 |
|----------|------|------|
| prisma db push | CLI 실행 | PASS |
| prisma generate | CLI 실행 | PASS |
| pnpm build | 빌드 | PASS |
| prisma db seed | Seed 실행 | PASS (26 perms, 7 roles, 7 role groups, 5 users, 17 menus) |

---

## 변경 이력

| 버전 | 일자 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0 | 2026-01-27 | Claude | 최초 작성 |
