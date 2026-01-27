# 구현 보고서

---

## 0. 문서 메타데이터

* **Task ID**: TSK-02-02
* **Task 명**: RoleGroup / Role / Permission CRUD + 할당 API
* **작성일**: 2026-01-27
* **구현 상태**: 완료

---

## 1. 구현 개요

### 1.1 구현 목적
- TRD §5.1, §5.4, §5.5, §5.6 기준 역할그룹/역할/권한 관리 + 사용자 할당 + 이력 조회 API 개발

### 1.2 구현 범위
- RoleGroup CRUD + 역할 할당 API (6개 엔드포인트)
- User 확장 API (7개 엔드포인트): 역할그룹 할당, 시스템 접근 관리, 최종 권한 조회
- Roles/Permissions 확장 (2개): 역할 권한 GET, 메뉴별 권한 GET
- History API (3개): 권한/역할그룹 변경 이력 조회
- 기존 테스트 정리 (이전 스키마 기반 route.test.ts 삭제)

---

## 2. Backend 구현 결과

### 2.1 RoleGroup API

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/role-groups` | 역할그룹 목록 (systemId/isActive/search 필터) |
| POST | `/api/role-groups` | 역할그룹 생성 |
| GET | `/api/role-groups/:id` | 역할그룹 상세 |
| PUT | `/api/role-groups/:id` | 역할그룹 수정 (SCD Type 2) |
| DELETE | `/api/role-groups/:id` | 역할그룹 삭제 (cascade + 히스토리) |
| GET | `/api/role-groups/:id/roles` | 할당된 역할 조회 |
| POST | `/api/role-groups/:id/roles` | 역할 할당 (전체 교체, diff 히스토리) |

### 2.2 User Extension API

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/users/:id/role-groups` | 사용자 역할그룹 목록 |
| POST | `/api/users/:id/role-groups` | 역할그룹 할당 (전체 교체) |
| GET | `/api/users/:id/systems` | 사용자 시스템-메뉴셋 매핑 |
| POST | `/api/users/:id/systems` | 시스템 접근 설정 (upsert) |
| PUT | `/api/users/:id/systems/:sysId` | 메뉴셋 변경 |
| DELETE | `/api/users/:id/systems/:sysId` | 시스템 접근 해제 |
| GET | `/api/users/:id/permissions` | 최종 권한 계산 (병합 결과) |

### 2.3 Roles/Permissions 확장 + History API

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/roles/:id/permissions` | 역할 권한 (메뉴별 그룹) |
| GET | `/api/menus/:menuId/permissions` | 메뉴별 권한 목록 |
| GET | `/api/permissions/:id/history` | 권한 변경 이력 (?from, ?to) |
| GET | `/api/users/:id/permissions/history` | 특정 시점 권한 (?asOf) |
| GET | `/api/users/:id/role-groups/history` | 역할그룹 할당 이력 (?from, ?to) |

### 2.4 TDD 테스트 결과

```
Test Files  12 passed (12)
Tests       78 passed (78)
Duration    2.66s
```

---

## 3. 생성/수정된 파일

| 파일 | 유형 |
|------|------|
| `app/api/role-groups/route.ts` | 신규 |
| `app/api/role-groups/[id]/route.ts` | 신규 |
| `app/api/role-groups/[id]/roles/route.ts` | 신규 |
| `app/api/users/[id]/role-groups/route.ts` | 신규 |
| `app/api/users/[id]/systems/route.ts` | 신규 |
| `app/api/users/[id]/systems/[systemId]/route.ts` | 신규 |
| `app/api/users/[id]/permissions/route.ts` | 신규 |
| `app/api/roles/[id]/permissions/route.ts` | 수정 (GET 추가) |
| `app/api/permissions/[id]/history/route.ts` | 신규 |
| `app/api/users/[id]/permissions/history/route.ts` | 신규 |
| `app/api/users/[id]/role-groups/history/route.ts` | 신규 |
| `app/api/menus/[menuId]/permissions/route.ts` | 신규 |
| 테스트 파일 12개 | 신규 |

---

## 4. 다음 단계

- TSK-03-01: 권한 병합 및 체크 로직 구현
- TSK-03-02: 시스템/역할그룹/권한 정의 관리 화면

---

## 부록: 변경 이력

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0.0 | 2026-01-27 | Claude | 최초 작성 |
