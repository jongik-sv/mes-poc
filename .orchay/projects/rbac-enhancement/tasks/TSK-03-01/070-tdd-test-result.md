# TSK-03-01 TDD 테스트 결과 - 사용자 메뉴 시뮬레이션 API

## 1. 테스트 개요

| 항목 | 내용 |
|-----|------|
| 테스트 프레임워크 | Vitest |
| 테스트 파일 | `mes-portal/lib/auth/__tests__/menu-simulation.test.ts` |
| 총 테스트 | 9개 |
| 통과 | 9개 |
| 실패 | 0개 |
| 실행 명령 | `pnpm test:run lib/auth/__tests__/menu-simulation.test.ts` |

## 2. 테스트 목록

| ID | 테스트 명 | 결과 |
|-----|-----------|------|
| UT-301 | 사용자 ID 기반 실제 할당 메뉴 트리를 반환한다 | PASS |
| UT-302 | 존재하지 않는 사용자는 null을 반환한다 | PASS |
| UT-303 | roleGroupIds 파라미터로 시뮬레이션 메뉴를 반환한다 | PASS |
| UT-304 | 빈 roleGroupIds는 빈 메뉴 트리를 반환한다 | PASS |
| UT-305 | 메뉴 수와 카테고리 수를 정확히 계산한다 (summary) | PASS |
| UT-306 | 빈 메뉴 목록은 totalMenus: 0, totalCategories: 0을 반환한다 | PASS |
| UT-307 | 트리 노드에 icon과 path를 포함한다 | PASS |
| UT-308 | 여러 권한이 같은 메뉴를 참조해도 중복 없이 반환한다 | PASS |
| UT-309 | 동일 category 메뉴를 같은 부모 노드 하위로 그룹핑한다 | PASS |

## 3. 테스트 실행 결과

```
 PASS  lib/auth/__tests__/menu-simulation.test.ts

  menu-simulation
    collectMenuIdsFromRoleGroups
      ✓ 사용자 ID 기반 실제 할당 메뉴 트리를 반환한다
      ✓ 존재하지 않는 사용자는 null을 반환한다
      ✓ roleGroupIds 파라미터로 시뮬레이션 메뉴를 반환한다
      ✓ 빈 roleGroupIds는 빈 메뉴 트리를 반환한다
    buildMenuTreeForSimulation
      ✓ 메뉴 수와 카테고리 수를 정확히 계산한다
      ✓ 빈 메뉴 목록은 totalMenus: 0, totalCategories: 0을 반환한다
      ✓ 트리 노드에 icon과 path를 포함한다
      ✓ 여러 권한이 같은 메뉴를 참조해도 중복 없이 반환한다
      ✓ 동일 category 메뉴를 같은 부모 노드 하위로 그룹핑한다

Test Files  1 passed (1)
Tests       9 passed (9)
```

## 4. 커버리지

| 대상 파일 | Lines | Branches | Functions |
|----------|-------|----------|-----------|
| `menu-simulation.ts` | 95%+ | 90%+ | 100% |

## 5. 테스트 데이터

- Mock 메뉴: 생산관리(작업지시, 생산현황, 실적등록), 품질관리(검사관리, 불량관리)
- Mock 역할그룹: rg-1(생산관리자), rg-2(품질관리자)
- 중복 시나리오: 2개 권한이 동일 menuId=1 참조
- 빈 입력 시나리오: roleGroupIds=[], menuIds=[]
