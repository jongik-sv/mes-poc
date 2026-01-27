# RBAC 재설계 PRD (Product Requirements Document)

## 1. 개요

### 1.1 프로젝트명
RBAC Redesign - 멀티 테넌트 + RoleGroup 기반 권한 관리 시스템 재설계

### 1.2 목적
기존 단순 RBAC 구조를 **멀티 테넌트(System) + RoleGroup 기반 + 자동 상속** 구조로 확장하여, 제조 현장의 다양한 공장/라인별 권한 분리 및 세밀한 필드 수준 접근 제어를 지원한다.

### 1.3 배경
- 기존 auth-system의 단일 테넌트, User→Role 직접 할당 구조는 다공장 환경에 부적합
- 메뉴 구성의 유연성 부족 (고정 self-reference 구조)
- 화면 필드 수준의 세밀한 권한 제어 필요 (공정별, 라인별 데이터 접근 제한)
- 권한 변경에 대한 선분 이력(SCD Type 2) 감사 요구

### 1.4 범위
- **포함**: 멀티 테넌트, MenuSet, RoleGroup, Permission config(actions + fieldConstraints), 선분 이력
- **제외**: SSO 연동 (Phase 2), MFA (Phase 2), 기존 인증(Authentication) 로직 변경 없음

### 1.5 상위 프로젝트
- auth-system PRD 참조 (인증/세션/비밀번호 정책은 기존 유지)

---

## 2. 목표

### 2.1 비즈니스 목표
- 다공장(멀티 테넌트) 환경에서 공장별 독립적 권한 관리
- RoleGroup 기반 역할 일괄 할당으로 운영 효율성 향상
- 필드 수준 접근 제어로 공정/라인별 데이터 보안 강화
- 선분 이력으로 특정 시점의 권한 상태 추적 가능

### 2.2 기술 목표
- User → RoleGroup → Role 경로로 역할 할당 체계 단순화 (UserRole 제거)
- Permission.menuId FK로 화면-권한 직접 연결 (RoleMenu 제거)
- config JSON으로 actions + fieldConstraints 통합 관리
- category path 기반 메뉴 트리 (self-reference 제거, 재귀 쿼리 불필요)

---

## 3. 핵심 변경사항

| 항목 | 기존 (auth-system) | 변경 후 (RBAC 재설계) |
|------|-------------------|---------------------|
| 테넌트 | 없음 | System (URL/도메인 기반) |
| 메뉴 구성 | 고정 | MenuSet (시스템/사용자별 선택) |
| 메뉴 계층 | parentMenuId (self-ref) | category path (`조업관리/생산실적`) |
| 메뉴 순서 | sortOrder (int) | sortOrder (varchar, 중간 삽입 용이) |
| 역할 할당 | User → Role 직접 | User → RoleGroup → Role (UserRole 제거) |
| 권한 상속 | 수동 | 자동 상속 (상위 Role → 하위 권한 포함) |
| 권한-화면 연결 | resource 문자열 | Permission.menuId (FK 직접 연결) |
| 메뉴 접근 | RoleMenu 테이블 | 제거 (Permission.menuId로 대체) |
| 필드 명명 | code (UK) | 엔티티명Cd (roleCd, permissionCd 등) |
| Permission 구조 | type, action 개별 필드 | config JSON (actions 배열 + fieldConstraints) |
| systemId | Int nullable (공통 개념) | **String NOT NULL** (모든 엔티티는 시스템 소속 필수, systemCd 제거) |
| 감사 이력 | AuditLog 단일 테이블 | 선분 이력 (SCD Type 2, 13+5개 이력 테이블) |

---

## 4. 기능 요구사항

### 4.1 멀티 테넌트 (System)
- [ ] 시스템(테넌트) CRUD
  - [ ] 시스템 ID (String PK, 고유, 예: `mes-factory1`)
  - [ ] 시스템명
  - [ ] 도메인 (고유, 예: `factory1.mes.com`)
  - [ ] 설명
  - [ ] 활성화 상태
- [ ] 도메인 기반 시스템 식별 (로그인 시)
- [ ] 사용자별 접근 가능 시스템 관리

### 4.2 MenuSet 기반 메뉴 구성
- [ ] MenuSet CRUD
  - [ ] 시스템별 메뉴세트 관리
  - [ ] 기본 메뉴세트 지정
  - [ ] 메뉴세트에 메뉴 할당/해제
- [ ] 사용자-시스템-메뉴세트 매핑
  - [ ] 사용자별 시스템 접근 시 사용할 메뉴세트 지정
- [ ] 메뉴 관리
  - [ ] category path 기반 폴더 구조 (`조업관리/생산실적`)
  - [ ] varchar sortOrder (중간 삽입 용이: `100`, `150`, `200`)
  - [ ] 런타임 트리 구축 (별도 폴더 테이블 불필요)

### 4.3 RoleGroup 기반 역할 관리
- [ ] RoleGroup CRUD
  - [ ] 시스템별 역할그룹 관리
  - [ ] 역할그룹에 역할 할당/해제
- [ ] 사용자-역할그룹 할당/해제
  - [ ] User → RoleGroup → Role 경로 (직접 UserRole 없음)
- [ ] 역할 계층 (parentRoleId)
  - [ ] 상위 역할의 하위 권한 자동 포함

### 4.4 Permission config (actions + fieldConstraints)
- [ ] Permission CRUD
  - [ ] 코드, 이름, 화면(menuId) 연결
  - [ ] config JSON: actions 배열 + fieldConstraints
- [ ] actions: `CREATE`, `READ`, `UPDATE`, `DELETE`, `EXPORT`, `IMPORT`
- [ ] fieldConstraints
  - [ ] 필드별 허용 값 제한 (단일값, 배열, 미지정=전체)
  - [ ] 예: `{ "PROC_CD": ["2CGL", "3CGL"] }` → 해당 값만 콤보박스에 표시
- [ ] 역할-권한 할당 (RolePermission)

### 4.5 권한 병합 규칙
- [ ] 같은 menuId에 대한 복수 Permission 보유 시 합집합(Union) 병합
  - [ ] actions: 합집합
  - [ ] fieldConstraints 같은 필드: 값 합집합
  - [ ] fieldConstraints 한쪽 없음: 제약 해제 (전체)
  - [ ] fieldConstraints 다른 필드: 각각 유지

### 4.6 권한 체크 흐름
- [ ] 화면 접근 시 menuId 기반 Permission 조회
- [ ] config.actions → 버튼 표시/숨김
- [ ] config.fieldConstraints → 콤보박스 값 필터링
- [ ] 서버 측 동일 제약 적용 (보안)

### 4.7 감사 이력 (SCD Type 2)
- [ ] 마스터 테이블 변경 이력 (8개)
  - System, User, MenuSet, Menu, RoleGroup, Role, Permission, SecuritySetting
  - changeType: `CREATE`, `UPDATE`, `DELETE`
- [ ] 매핑 테이블 변경 이력 (5개)
  - MenuSetMenu, UserSystemMenuSet, UserRoleGroup, RoleGroupRole, RolePermission
  - changeType: `ASSIGN`, `REVOKE`
- [ ] 선분 이력 구조: `validFrom` ~ `validTo` (null = 현재 유효)
- [ ] 특정 시점 권한 상태 조회
  - `WHERE validFrom <= :시점 AND (validTo IS NULL OR validTo > :시점)`

---

## 5. 화면 요구사항

### 5.1 권한 통합 관리 화면 (`/system/authority`)
- [ ] 사용자 기준 3단 마스터-디테일 (역할그룹 → 역할 → 권한)
- [ ] 각 컬럼: 상단(보유 목록) + 하단(전체 목록, 체크박스로 할당/해제)
- [ ] 조회, 등록(할당), 해제, 생성, 수정 모두 한 화면에서 가능
- [ ] 등록 확인 모달 (추가 할당/해제 변경사항 표시)
- [ ] 반응형 동작 (상위 선택 시 하위 자동 갱신)

### 5.2 권한 정의 관리 화면 (`/system/permissions`)
- [ ] 메뉴 트리 (category 기반) + 권한 상세 패널
- [ ] 권한 생성/수정 모달
  - Actions 체크박스
  - Field Constraints 동적 추가 (필드명 + 제약 값)
- [ ] 할당된 역할 표시

### 5.3 역할 관리 화면 개선 (`/system/roles`)
- [ ] 역할 상세에 [권한 할당] 탭 추가
- [ ] 메뉴 트리 기반 권한 체크박스 매트릭스

### 5.4 사용자 관리 화면 개선 (`/system/users`)
- [ ] [역할그룹] 탭: 할당된 역할그룹 및 포함 역할 표시
- [ ] [시스템 접근] 탭: 시스템별 메뉴세트 설정
- [ ] 최종 권한 (계산된 결과) 표시

### 5.5 시스템(테넌트) 관리 화면 (`/system/systems`)
- [ ] 시스템 CRUD 테이블 (코드, 이름, 도메인, 상태)

### 5.6 역할그룹 관리 화면 (`/system/role-groups`)
- [ ] 역할그룹 CRUD 테이블 (코드, 이름, 시스템, 포함 역할, 상태)
- [ ] 역할그룹 상세: 포함된 역할 관리, 할당된 사용자 수

---

## 6. 비기능 요구사항

> 기존 auth-system PRD의 비기능 요구사항 유지 (보안, 성능, 가용성, 확장성)

### 6.1 추가 성능 요구사항
- 권한 병합 계산: 200ms 이내
- 선분 이력 시점 조회: 3초 이내 (100만 건 기준)

---

## 7. 제거 대상

| 테이블 | 제거 이유 | 대체 방안 |
|--------|----------|----------|
| UserRole | RoleGroup으로 역할 관리 통합 | User → UserRoleGroup → RoleGroup → Role |
| RoleMenu | Permission.menuId로 대체 | Permission.menuId FK로 메뉴-권한 연결 |

---

## 8. 용어 정의

| 용어 | 설명 |
|------|------|
| System | 멀티 테넌트 단위 (공장, 사업장 등) |
| MenuSet | 시스템/사용자별 메뉴 구성 세트 |
| RoleGroup | 역할의 집합, 사용자에게 일괄 할당 |
| Permission config | actions + fieldConstraints를 담은 JSON |
| fieldConstraints | 화면 필드별 허용 값 제한 (콤보박스 필터링) |
| SCD Type 2 | Slowly Changing Dimension Type 2, 선분 이력 관리 방식 |
| 선분 이력 | validFrom ~ validTo로 유효 기간을 관리하는 이력 구조 |

---

## 9. 변경 이력

| 버전 | 작성일 | 작성자 | 변경 내용 |
|------|--------|--------|----------|
| 1.0 | 2026-01-27 | Claude | RBAC-REDESIGN-PLAN.md에서 PRD 분리 |
