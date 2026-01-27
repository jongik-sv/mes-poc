# 요구사항 추적성 매트릭스 (025-traceability-matrix.md)

**Template Version:** 1.0.0 — **Last Updated:** 2026-01-27

> **목적**: PRD → 기본설계 → 상세설계 → 테스트 4단계 양방향 추적
>
> **참조**: 이 문서는 `010-design.md`와 `026-test-specification.md`와 함께 사용됩니다.

---

## 0. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| Task ID | TSK-03-02 |
| Task명 | 시스템/역할그룹/권한 정의 관리 화면 |
| 설계 문서 참조 | `010-design.md` |
| 테스트 명세 참조 | `026-test-specification.md` |
| 작성일 | 2026-01-27 |
| 작성자 | Claude |

---

## 1. 기능 요구사항 추적 (FR → 설계 → 테스트)

> PRD → 기본설계 → 화면설계 → 테스트케이스 매핑

| 요구사항 ID | PRD 섹션 | 설계 섹션 | 화면 | 단위 테스트 | E2E 테스트 | 매뉴얼 TC | 상태 |
|-------------|----------|----------|------|-------------|------------|-----------|------|
| FR-001 | 4.1 시스템 CRUD | 5.2 화면1 | /system/systems | UT-001~UT-004 | E2E-001 | TC-001 | 설계완료 |
| FR-002 | 4.1 도메인 고유성 | 5.2 화면1 모달 | /system/systems | UT-005 | E2E-002 | TC-002 | 설계완료 |
| FR-003 | 4.1 활성 상태 관리 | 5.2 화면1 | /system/systems | UT-006 | E2E-001 | TC-001 | 설계완료 |
| FR-004 | 4.3 역할그룹 CRUD | 5.2 화면2 | /system/role-groups | UT-007~UT-010 | E2E-003 | TC-003 | 설계완료 |
| FR-005 | 4.3 역할그룹 역할 할당 | 5.2 화면2 상세 | /system/role-groups | UT-011~UT-012 | E2E-004 | TC-004 | 설계완료 |
| FR-006 | 4.3 시스템별 역할그룹 필터 | 5.2 화면2 | /system/role-groups | UT-013 | E2E-003 | TC-003 | 설계완료 |
| FR-007 | 4.4 권한 CRUD | 5.2 화면3 | /system/permissions | UT-014~UT-017 | E2E-005 | TC-005 | 설계완료 |
| FR-008 | 4.4 actions 체크박스 | 5.2 화면3 모달 | /system/permissions | UT-018 | E2E-006 | TC-006 | 설계완료 |
| FR-009 | 4.4 fieldConstraints 편집 | 5.2 화면3 모달 | /system/permissions | UT-019~UT-020 | E2E-006 | TC-006 | 설계완료 |
| FR-010 | 4.4 메뉴-권한 연결 | 5.2 화면3 | /system/permissions | UT-021 | E2E-005 | TC-005 | 설계완료 |
| FR-011 | 4.4 역할 권한 할당 | 5.2 화면4 | /system/roles | UT-022~UT-024 | E2E-007 | TC-007 | 설계완료 |
| FR-012 | 4.3 사용자 역할그룹 할당 | 5.2 화면5 | /system/users | UT-025~UT-026 | E2E-008 | TC-008 | 설계완료 |
| FR-013 | 4.1 사용자 시스템 접근 | 5.2 화면5 | /system/users | UT-027 | E2E-009 | TC-009 | 설계완료 |
| FR-014 | 4.4 사용자 최종 권한 표시 | 5.2 화면5 | /system/users | UT-028~UT-029 | E2E-010 | TC-010 | 설계완료 |

### 1.1 요구사항별 상세 매핑

#### FR-001: 시스템(테넌트) CRUD

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.1 | 시스템 ID, 시스템명, 도메인, 설명, 활성화 상태 CRUD |
| 설계 | 010-design.md | 5.2 화면1 | Ant Design Table + Modal CRUD 화면 |
| 단위 테스트 | 026-test-specification.md | 2.1 | UT-001~UT-004 |
| E2E 테스트 | 026-test-specification.md | 3.1 | E2E-001 |

#### FR-005: 역할그룹 역할 할당/해제

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.3 | 역할그룹에 역할 할당/해제 |
| 설계 | 010-design.md | 5.2 화면2 | 마스터-디테일 패널, 역할 추가/제거 |
| 단위 테스트 | 026-test-specification.md | 2.1 | UT-011~UT-012 |
| E2E 테스트 | 026-test-specification.md | 3.1 | E2E-004 |

#### FR-009: fieldConstraints 동적 편집기

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.4 | 필드별 허용 값 제한 (단일값, 배열, 미지정=전체) |
| 설계 | 010-design.md | 5.2 화면3 모달 | 필드명-값 쌍 동적 추가/삭제 에디터 |
| 단위 테스트 | 026-test-specification.md | 2.1 | UT-019~UT-020 |
| E2E 테스트 | 026-test-specification.md | 3.1 | E2E-006 |

#### FR-011: 역할 권한 할당 (메뉴 트리 매트릭스)

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.4 | 역할에 권한 할당 |
| 설계 | 010-design.md | 5.2 화면4 | 메뉴 트리 + Action별 체크박스 매트릭스 |
| 단위 테스트 | 026-test-specification.md | 2.1 | UT-022~UT-024 |
| E2E 테스트 | 026-test-specification.md | 3.1 | E2E-007 |

#### FR-014: 사용자 최종 권한 표시

| 설계 단계 | 문서 | 섹션 | 구현 항목 |
|----------|------|------|----------|
| PRD | prd.md | 4.4 | 사용자 최종 권한 합집합 계산 |
| 설계 | 010-design.md | 5.2 화면5 | 메뉴 트리 + Actions 태그 + 권한 출처 표시 |
| 단위 테스트 | 026-test-specification.md | 2.1 | UT-028~UT-029 |
| E2E 테스트 | 026-test-specification.md | 3.1 | E2E-010 |

---

## 2. 비즈니스 규칙 추적 (BR → 구현 → 검증)

| 규칙 ID | PRD 출처 | 설계 섹션 | 구현 위치(개념) | 단위 테스트 | E2E 테스트 | 검증 방법 | 상태 |
|---------|----------|----------|-----------------|-------------|------------|-----------|------|
| BR-001 | 4.1 | 8.1 | 시스템 삭제 API + UI 확인 | UT-030 | E2E-011 | 하위 역할그룹 존재 시 삭제 불가 확인 | 설계완료 |
| BR-002 | 4.3 | 8.1 | 역할그룹 삭제 API + UI 확인 | UT-031 | E2E-012 | 할당된 사용자 존재 시 삭제 불가 확인 | 설계완료 |
| BR-003 | 4.4 | 8.1 | 권한 생성 폼 유효성 검사 | UT-032 | E2E-006 | menuId 필수 검증 | 설계완료 |
| BR-004 | 4.4 | 8.1 | 최종 권한 계산 로직 | UT-028 | E2E-010 | 합집합 권한 표시 확인 | 설계완료 |
| BR-005 | 4.1 | 8.1 | 시스템 생성/수정 API | UT-005 | E2E-002 | 도메인 중복 입력 시 에러 확인 | 설계완료 |

### 2.1 비즈니스 규칙별 상세 매핑

#### BR-001: 시스템 삭제 시 하위 역할그룹 존재 불가

| 구분 | 내용 |
|------|------|
| **PRD 원문** | 시스템 삭제 시 데이터 무결성 보장 |
| **설계 표현** | 하위 역할그룹이 있는 시스템은 삭제 버튼 클릭 시 에러 다이얼로그 |
| **구현 위치** | API 409 응답 → 프론트엔드 Modal.error |
| **검증 방법** | 역할그룹이 있는 시스템 삭제 시도 → 에러 메시지 확인 |
| **관련 테스트** | UT-030, E2E-011 |

#### BR-004: 사용자 최종 권한 합집합 계산

| 구분 | 내용 |
|------|------|
| **PRD 원문** | User → RoleGroup → Role → Permission 경로의 합집합 |
| **설계 표현** | 사용자 상세 > 최종 권한 탭에서 메뉴별 합산 actions 표시 |
| **구현 위치** | GET /api/users/:id/permissions 응답 데이터 렌더링 |
| **검증 방법** | 여러 역할그룹의 권한이 합집합으로 표시되는지 확인 |
| **관련 테스트** | UT-028, E2E-010 |

#### BR-005: 도메인 고유성

| 구분 | 내용 |
|------|------|
| **PRD 원문** | 시스템 도메인은 고유해야 함 |
| **설계 표현** | 생성/수정 모달에서 중복 도메인 입력 시 에러 메시지 |
| **구현 위치** | API 409 응답 → Form 에러 표시 |
| **검증 방법** | 기존 도메인과 동일한 값 입력 후 저장 시 에러 확인 |
| **관련 테스트** | UT-005, E2E-002 |

---

## 3. 테스트 역추적 매트릭스

> 테스트 결과 → 요구사항 역추적용

| 테스트 ID | 테스트 유형 | 검증 대상 요구사항 | 검증 대상 비즈니스 규칙 | 상태 |
|-----------|------------|-------------------|----------------------|------|
| UT-001 | 단위 | FR-001 | - | 미실행 |
| UT-002 | 단위 | FR-001 | - | 미실행 |
| UT-003 | 단위 | FR-001 | - | 미실행 |
| UT-004 | 단위 | FR-001 | - | 미실행 |
| UT-005 | 단위 | FR-002 | BR-005 | 미실행 |
| UT-006 | 단위 | FR-003 | - | 미실행 |
| UT-007 | 단위 | FR-004 | - | 미실행 |
| UT-008 | 단위 | FR-004 | - | 미실행 |
| UT-009 | 단위 | FR-004 | - | 미실행 |
| UT-010 | 단위 | FR-004 | - | 미실행 |
| UT-011 | 단위 | FR-005 | - | 미실행 |
| UT-012 | 단위 | FR-005 | - | 미실행 |
| UT-013 | 단위 | FR-006 | - | 미실행 |
| UT-014 | 단위 | FR-007 | - | 미실행 |
| UT-015 | 단위 | FR-007 | - | 미실행 |
| UT-016 | 단위 | FR-007 | - | 미실행 |
| UT-017 | 단위 | FR-007 | - | 미실행 |
| UT-018 | 단위 | FR-008 | - | 미실행 |
| UT-019 | 단위 | FR-009 | - | 미실행 |
| UT-020 | 단위 | FR-009 | - | 미실행 |
| UT-021 | 단위 | FR-010 | BR-003 | 미실행 |
| UT-022 | 단위 | FR-011 | - | 미실행 |
| UT-023 | 단위 | FR-011 | - | 미실행 |
| UT-024 | 단위 | FR-011 | - | 미실행 |
| UT-025 | 단위 | FR-012 | - | 미실행 |
| UT-026 | 단위 | FR-012 | - | 미실행 |
| UT-027 | 단위 | FR-013 | - | 미실행 |
| UT-028 | 단위 | FR-014 | BR-004 | 미실행 |
| UT-029 | 단위 | FR-014 | - | 미실행 |
| UT-030 | 단위 | - | BR-001 | 미실행 |
| UT-031 | 단위 | - | BR-002 | 미실행 |
| UT-032 | 단위 | - | BR-003 | 미실행 |
| E2E-001 | E2E | FR-001, FR-003 | - | 미실행 |
| E2E-002 | E2E | FR-002 | BR-005 | 미실행 |
| E2E-003 | E2E | FR-004, FR-006 | - | 미실행 |
| E2E-004 | E2E | FR-005 | - | 미실행 |
| E2E-005 | E2E | FR-007, FR-010 | - | 미실행 |
| E2E-006 | E2E | FR-008, FR-009 | BR-003 | 미실행 |
| E2E-007 | E2E | FR-011 | - | 미실행 |
| E2E-008 | E2E | FR-012 | - | 미실행 |
| E2E-009 | E2E | FR-013 | - | 미실행 |
| E2E-010 | E2E | FR-014 | BR-004 | 미실행 |
| E2E-011 | E2E | - | BR-001 | 미실행 |
| E2E-012 | E2E | - | BR-002 | 미실행 |
| TC-001 | 매뉴얼 | FR-001, FR-003 | - | 미실행 |
| TC-002 | 매뉴얼 | FR-002 | BR-005 | 미실행 |
| TC-003 | 매뉴얼 | FR-004, FR-006 | - | 미실행 |
| TC-004 | 매뉴얼 | FR-005 | - | 미실행 |
| TC-005 | 매뉴얼 | FR-007, FR-010 | - | 미실행 |
| TC-006 | 매뉴얼 | FR-008, FR-009 | BR-003 | 미실행 |
| TC-007 | 매뉴얼 | FR-011 | - | 미실행 |
| TC-008 | 매뉴얼 | FR-012 | - | 미실행 |
| TC-009 | 매뉴얼 | FR-013 | - | 미실행 |
| TC-010 | 매뉴얼 | FR-014 | BR-004 | 미실행 |

---

## 4. 데이터 모델 추적

> 설계 엔티티 → API 매핑

| 설계 엔티티 | Prisma 모델 | API Request DTO | API Response DTO |
|------------|-------------|-----------------|------------------|
| System | System | CreateSystemDto | SystemResponseDto |
| RoleGroup | RoleGroup | CreateRoleGroupDto | RoleGroupResponseDto |
| Permission | Permission | CreatePermissionDto | PermissionResponseDto |
| Role | Role | - (기존) | RoleResponseDto |
| User | User | - (기존) | UserResponseDto |
| Menu | Menu | - (기존) | MenuResponseDto |

---

## 5. 인터페이스 추적

> 설계 인터페이스 → API 엔드포인트 매핑

| 설계 인터페이스 | API명 | Method | Endpoint | 요구사항 |
|----------------|------|--------|----------|----------|
| 시스템 목록 조회 | SystemList | GET | /api/systems | FR-001 |
| 시스템 생성 | SystemCreate | POST | /api/systems | FR-001 |
| 시스템 상세 조회 | SystemDetail | GET | /api/systems/:id | FR-001 |
| 시스템 수정 | SystemUpdate | PUT | /api/systems/:id | FR-001 |
| 시스템 삭제 | SystemDelete | DELETE | /api/systems/:id | FR-001, BR-001 |
| 역할그룹 목록 조회 | RoleGroupList | GET | /api/role-groups | FR-004 |
| 역할그룹 생성 | RoleGroupCreate | POST | /api/role-groups | FR-004 |
| 역할그룹 상세 조회 | RoleGroupDetail | GET | /api/role-groups/:id | FR-004 |
| 역할그룹 수정 | RoleGroupUpdate | PUT | /api/role-groups/:id | FR-004 |
| 역할그룹 삭제 | RoleGroupDelete | DELETE | /api/role-groups/:id | FR-004, BR-002 |
| 역할그룹 역할 조회 | RoleGroupRoles | GET | /api/role-groups/:id/roles | FR-005 |
| 역할그룹 역할 할당 | RoleGroupAddRole | POST | /api/role-groups/:id/roles | FR-005 |
| 권한 목록 조회 | PermissionList | GET | /api/permissions | FR-007 |
| 권한 생성 | PermissionCreate | POST | /api/permissions | FR-007, BR-003 |
| 권한 수정 | PermissionUpdate | PUT | /api/permissions/:id | FR-007 |
| 권한 삭제 | PermissionDelete | DELETE | /api/permissions/:id | FR-007 |
| 메뉴별 권한 조회 | MenuPermissions | GET | /api/menus/:menuId/permissions | FR-010 |
| 역할 권한 조회 | RolePermissions | GET | /api/roles/:id/permissions | FR-011 |
| 역할 권한 할당 | RoleAddPermission | POST | /api/roles/:id/permissions | FR-011 |
| 사용자 역할그룹 조회 | UserRoleGroups | GET | /api/users/:id/role-groups | FR-012 |
| 사용자 역할그룹 할당 | UserAddRoleGroup | POST | /api/users/:id/role-groups | FR-012 |
| 사용자 시스템 조회 | UserSystems | GET | /api/users/:id/systems | FR-013 |
| 사용자 최종 권한 조회 | UserPermissions | GET | /api/users/:id/permissions | FR-014 |
| 메뉴 트리 조회 | MenuTree | GET | /api/menus | FR-010, FR-011, FR-014 |

---

## 6. 화면 추적

> 설계 화면 → 컴포넌트 매핑

| 설계 화면 | 경로 | 주요 컴포넌트 | 요구사항 |
|----------|------|-------------|----------|
| 시스템 관리 | /system/systems | SystemListPage, SystemFormModal | FR-001, FR-002, FR-003 |
| 역할그룹 관리 | /system/role-groups | RoleGroupListPage, RoleGroupDetailPanel, RoleGroupFormModal | FR-004, FR-005, FR-006 |
| 권한 관리 | /system/permissions | PermissionPage, MenuTree, PermissionList, PermissionFormModal | FR-007, FR-008, FR-009, FR-010 |
| 역할 권한 할당 | /system/roles (탭) | RolePermissionTab, PermissionMatrix | FR-011 |
| 사용자 역할그룹 | /system/users (탭) | UserRoleGroupTab | FR-012 |
| 사용자 시스템 접근 | /system/users (탭) | UserSystemTab | FR-013 |
| 사용자 최종 권한 | /system/users (탭) | UserPermissionTab | FR-014 |

---

## 7. 추적성 검증 요약

### 7.1 커버리지 통계

| 구분 | 총 항목 | 매핑 완료 | 미매핑 | 커버리지 |
|------|---------|----------|--------|---------|
| 기능 요구사항 (FR) | 14 | 14 | 0 | 100% |
| 비즈니스 규칙 (BR) | 5 | 5 | 0 | 100% |
| 단위 테스트 (UT) | 32 | 32 | 0 | 100% |
| E2E 테스트 | 12 | 12 | 0 | 100% |
| 매뉴얼 테스트 (TC) | 10 | 10 | 0 | 100% |

### 7.2 미매핑 항목 (있는 경우)

| 구분 | ID | 설명 | 미매핑 사유 |
|------|-----|------|-----------|
| - | - | - | - |

---

## 관련 문서

- 설계 문서: `010-design.md`
- 테스트 명세: `026-test-specification.md`
- PRD: `.orchay/projects/rbac-redesign/prd.md`
