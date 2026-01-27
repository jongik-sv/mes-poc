# TSK-02-02 TDD 테스트 결과서

---

## 0. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| Task ID | TSK-02-02 |
| Task명 | RoleGroup / Role / Permission CRUD + 할당 API |
| 작성일 | 2026-01-27 |
| 테스트 프레임워크 | Vitest 4.0.17 |

---

## 1. 테스트 실행 결과 요약

| 항목 | 결과 |
|------|------|
| 테스트 파일 | 12 passed |
| 테스트 케이스 | 78 passed |
| 실패 | 0 |
| 총 소요 시간 | 2.66s |

---

## 2. 파일별 상세 결과

### 2.1 RoleGroups API (33 tests)

| 파일 | 테스트 수 | 결과 |
|------|----------|------|
| `app/api/role-groups/__tests__/route.spec.ts` | 13 | PASS |
| `app/api/role-groups/[id]/__tests__/route.spec.ts` | 11 | PASS |
| `app/api/role-groups/[id]/roles/__tests__/route.spec.ts` | 9 | PASS |

### 2.2 User Extension API (29 tests)

| 파일 | 테스트 수 | 결과 |
|------|----------|------|
| `app/api/users/[id]/role-groups/__tests__/route.spec.ts` | 9 | PASS |
| `app/api/users/[id]/systems/__tests__/route.spec.ts` | 7 | PASS |
| `app/api/users/[id]/systems/[systemId]/__tests__/route.spec.ts` | 8 | PASS |
| `app/api/users/[id]/permissions/__tests__/route.spec.ts` | 5 | PASS |

### 2.3 Roles/Permissions + History API (16 tests)

| 파일 | 테스트 수 | 결과 |
|------|----------|------|
| `app/api/roles/[id]/permissions/__tests__/route.spec.ts` | 3 | PASS |
| `app/api/permissions/[id]/history/__tests__/route.spec.ts` | 4 | PASS |
| `app/api/users/[id]/permissions/history/__tests__/route.spec.ts` | 3 | PASS |
| `app/api/users/[id]/role-groups/history/__tests__/route.spec.ts` | 3 | PASS |
| `app/api/menus/[menuId]/permissions/__tests__/route.spec.ts` | 3 | PASS |

---

## 변경 이력

| 버전 | 일자 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0 | 2026-01-27 | Claude | 최초 작성 |
