# TSK-01-01 - Prisma 스키마 확장 및 마이그레이션 기술 설계 문서

**Template Version:** 1.0.0 — **Last Updated:** 2026-01-27

---

## 0. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| Task ID | TSK-01-01 |
| Task명 | Prisma 스키마 확장 및 마이그레이션 |
| Category | infrastructure |
| 상태 | [dd] 상세설계 |
| 작성일 | 2026-01-27 |
| 작성자 | Claude |

### 상위 문서 참조

| 문서 유형 | 경로 | 참조 섹션 |
|----------|------|----------|
| PRD | `.orchay/projects/rbac-redesign/prd.md` | §4.1~4.4, §4.7 |
| TRD | `.orchay/projects/rbac-redesign/trd.md` | §2, §3 전체 |

---

## 1. 개요

### 1.1 배경

기존 auth-system의 단순 RBAC 구조를 멀티 테넌트 + RoleGroup 기반으로 재설계해야 함. 현재 스키마는 Int PK, UserRole 직접 할당, Permission의 type/resource/action 개별 필드, parentId self-ref 메뉴 구조를 사용.

### 1.2 목적

- TRD §3 기준으로 Prisma 스키마를 전면 재작성
- System(String PK), User(String PK), category path 메뉴, Permission config JSON, 선분 이력 18개 테이블 구현

### 1.3 범위

**포함 범위:**
- 모든 기존 모델 변경 (System, User, Menu, Role, Permission 등)
- UserRole, RoleMenu 제거
- 선분 이력 테이블 13개 (마스터 8 + 매핑 5) 추가
- 마이그레이션 실행

**제외 범위:**
- API 개발 → TSK-02-01, TSK-02-02
- Seed 데이터 → 마이그레이션 후 별도 작업

---

## 2. 현재 상태 (As-Is)

### 2.1 현재 모델 구조

| 모델 | PK | 특징 |
|------|-----|------|
| System | Int autoincrement | code, domain 별도 |
| User | Int autoincrement | email, password 등 |
| Menu | Int autoincrement | parentId self-ref |
| Permission | Int autoincrement | type/resource/action 개별 필드 |
| Role | Int autoincrement | systemId 없음 |
| UserRole | Int autoincrement | User↔Role 직접 매핑 |
| RoleMenu | Int autoincrement | Role↔Menu 직접 매핑 |

### 2.2 문제점

| 문제점 | 영향 | 심각도 |
|--------|------|--------|
| 단일 테넌트 | 다공장 독립 관리 불가 | High |
| UserRole 직접 할당 | 역할 일괄 관리 불가 | Medium |
| Permission 개별 필드 | 필드 수준 접근 제어 불가 | High |
| parentId self-ref 메뉴 | 동적 카테고리 구성 불가 | Medium |

---

## 3. 목표 상태 (To-Be)

### 3.1 주요 변경

| 항목 | As-Is | To-Be |
|------|-------|-------|
| System PK | Int (autoincrement) | String ("mes-factory1") |
| User PK | Int (autoincrement) | String (사번 "41000132") |
| Menu 계층 | parentId self-ref | category path + String sortOrder |
| Permission | type/resource/action | config JSON + menuId FK |
| 역할 할당 | UserRole | UserRoleGroup → RoleGroupRole |
| 메뉴 접근 | RoleMenu | Permission.menuId |
| 감사 이력 | AuditLog 단일 | 선분 이력 13개 테이블 |

---

## 4. 구현 계획

### 4.1 구현 단계

1. Prisma 스키마 전면 재작성 (TRD §3 기준)
2. 기존 DB 삭제 후 새 마이그레이션 실행
3. Prisma Client 재생성

### 4.2 변경 파일

| 파일 | 변경 유형 |
|------|----------|
| `prisma/schema.prisma` | 전면 재작성 |

### 4.3 롤백 계획

- Git revert로 이전 스키마 복원
- `prisma migrate reset`으로 DB 초기화

---

## 5. 검증 계획

| 테스트 항목 | 방법 | 기대 결과 |
|------------|------|----------|
| 마이그레이션 | `pnpm prisma migrate dev` | 성공 |
| Client 생성 | `pnpm prisma generate` | 성공 |
| FK 관계 | Prisma Studio 확인 | 모든 관계 정상 |

---

## 변경 이력

| 버전 | 일자 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0 | 2026-01-27 | Claude | 최초 작성 |
