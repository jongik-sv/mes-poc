# TSK-03-01 사용자 매뉴얼 - 사용자 메뉴 시뮬레이션 API

## 1. API 개요

사용자 메뉴 시뮬레이션 API는 특정 사용자가 접근 가능한 메뉴를 트리 구조로 반환합니다. 역할그룹 할당 변경 시 저장 전에 메뉴 변경 결과를 미리 확인할 수 있는 시뮬레이션 기능을 제공합니다.

## 2. 접근 경로

```
GET /api/users/:id/menus
GET /api/users/:id/menus?roleGroupIds=rg-1,rg-2,rg-3
```

## 3. 기능 설명

### 3.1 사용자 실제 할당 기반 메뉴 조회

사용자에게 실제 할당된 역할그룹을 기반으로 접근 가능한 메뉴 트리를 조회합니다.

**요청:**
```
GET /api/users/user-1/menus
```

**응답 예시:**
```json
{
  "menus": [
    {
      "key": "cat-생산관리",
      "title": "생산관리",
      "children": [
        { "key": "1", "title": "작업지시", "icon": "ScheduleOutlined", "path": "/production/work-order" },
        { "key": "2", "title": "생산현황", "icon": "BarChartOutlined", "path": "/production/status" }
      ]
    }
  ],
  "summary": {
    "totalMenus": 2,
    "totalCategories": 1
  }
}
```

### 3.2 역할그룹 시뮬레이션 조회

`roleGroupIds` 쿼리 파라미터를 전달하면 해당 역할그룹 조합으로 접근 가능한 메뉴를 미리 확인할 수 있습니다. 실제 할당 상태와 무관하게 시뮬레이션 결과를 반환합니다.

**요청:**
```
GET /api/users/user-1/menus?roleGroupIds=rg-1,rg-2,rg-3
```

이 기능은 사용자 권한 할당 화면(TSK-02-01)의 메뉴 시뮬레이션 패널에서 체크박스 변경 시 300ms debounce 후 호출됩니다.

### 3.3 응답 구조

- `menus`: 카테고리별로 그룹핑된 트리 구조 (부모 노드: 카테고리, 자식 노드: 메뉴)
- `summary.totalMenus`: 접근 가능한 총 메뉴 수
- `summary.totalCategories`: 메뉴가 속한 카테고리 수

### 3.4 에러 처리

| 상황 | 상태 코드 | 응답 |
|------|----------|------|
| 존재하지 않는 사용자 ID | 404 | `{ "error": "사용자를 찾을 수 없습니다" }` |
| roleGroupIds 형식 오류 | 400 | `{ "error": "잘못된 roleGroupIds 형식입니다" }` |

## 4. 주의사항

- 이 API는 읽기 전용이며, 역할그룹 할당 상태를 변경하지 않습니다.
- `roleGroupIds` 파라미터는 쉼표(,)로 구분된 문자열입니다.
- 비활성(isActive=false) 메뉴는 조회 결과에 포함되지 않습니다.
- 여러 역할그룹/역할/권한이 동일 메뉴를 참조하는 경우 중복 없이 1개만 반환됩니다.
- category가 null인 메뉴는 "기타" 카테고리로 분류됩니다.
- 프론트엔드에서 debounce 300ms 적용을 권장합니다 (연속 호출 방지).
