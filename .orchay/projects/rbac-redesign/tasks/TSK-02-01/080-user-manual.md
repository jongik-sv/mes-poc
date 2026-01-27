# 사용자 매뉴얼 (080-manual.md)

---

## 0. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| Task ID | TSK-02-01 |
| Task명 | System / MenuSet / Menu CRUD API |
| 대상 기능 | System, MenuSet API (개발자용) |
| 작성일 | 2026-01-27 |
| 버전 | 1.0.0 |

---

# 사용자 매뉴얼: System / MenuSet API

**버전:** 1.0.0 — **최종 수정일:** 2026-01-27

---

## 1. 개요

멀티 테넌트 시스템 관리 및 메뉴세트 구성을 위한 REST API. 관리자(SYSTEM_ADMIN)만 생성/수정/삭제 가능.

### 1.1 API 목록

| Method | Endpoint | 설명 | 권한 |
|--------|----------|------|------|
| GET | `/api/systems` | 시스템 목록 | 인증 |
| POST | `/api/systems` | 시스템 생성 | 관리자 |
| GET | `/api/systems/:id` | 시스템 상세 | 인증 |
| PUT | `/api/systems/:id` | 시스템 수정 | 관리자 |
| DELETE | `/api/systems/:id` | 시스템 비활성화 | 관리자 |
| GET | `/api/menu-sets` | 메뉴세트 목록 | 인증 |
| POST | `/api/menu-sets` | 메뉴세트 생성 | 관리자 |
| GET | `/api/menu-sets/:id` | 메뉴세트 상세 | 인증 |
| PUT | `/api/menu-sets/:id` | 메뉴세트 수정 | 관리자 |
| DELETE | `/api/menu-sets/:id` | 메뉴세트 삭제 | 관리자 |
| GET | `/api/menu-sets/:id/menus` | 할당된 메뉴 목록 | 인증 |
| POST | `/api/menu-sets/:id/menus` | 메뉴 할당 | 관리자 |

---

## 2. 시나리오별 사용 가이드

### 시나리오 1: 시스템 등록하기

**목표**: 새 공장 시스템을 등록

**Step 1.** POST `/api/systems`

```json
{
  "systemId": "mes-factory2",
  "name": "공장2 MES",
  "domain": "factory2.mes.com",
  "description": "2공장 MES 시스템"
}
```

**Step 2.** 응답 확인

```json
{
  "success": true,
  "data": {
    "systemId": "mes-factory2",
    "name": "공장2 MES",
    "domain": "factory2.mes.com",
    "isActive": true
  }
}
```

> **주의**: `systemId`와 `domain`은 고유해야 합니다. 중복 시 409 에러.

### 시나리오 2: 메뉴세트 생성 및 메뉴 할당하기

**목표**: 관리자용 메뉴세트를 만들고 메뉴를 할당

**Step 1.** POST `/api/menu-sets`

```json
{
  "systemId": "mes-factory1",
  "menuSetCd": "FACTORY1_ADMIN",
  "name": "공장1 관리자 메뉴",
  "isDefault": false
}
```

**Step 2.** POST `/api/menu-sets/1/menus`

```json
{
  "menuIds": [1, 2, 3, 5, 8, 12]
}
```

> **Tip**: 메뉴 할당은 전체 교체 방식입니다. 기존 할당이 모두 제거되고 새 목록으로 교체됩니다.

### 시나리오 3: 시스템 목록 조회 (필터링)

**목표**: 활성 시스템만 검색

**Step 1.** GET `/api/systems?isActive=true&search=공장&page=1&pageSize=10`

**Step 2.** 응답

```json
{
  "success": true,
  "data": {
    "items": [...],
    "total": 2,
    "page": 1,
    "pageSize": 10,
    "totalPages": 1
  }
}
```

### 시나리오 4: 시스템 비활성화

**목표**: 시스템을 비활성화 (소프트 삭제)

**Step 1.** DELETE `/api/systems/mes-factory2`

> **주의**: 실제 삭제가 아닌 `isActive=false` 처리입니다. 복구 가능합니다.

---

## 3. 에러 코드

| 코드 | HTTP | 설명 |
|------|------|------|
| `UNAUTHORIZED` | 401 | 인증 필요 |
| `FORBIDDEN` | 403 | 관리자 권한 필요 |
| `DUPLICATE_SYSTEM_ID` | 409 | systemId 중복 |
| `DUPLICATE_DOMAIN` | 409 | domain 중복 |
| `DUPLICATE_MENU_SET_CD` | 409 | menuSetCd 중복 |
| `NOT_FOUND` | 404 | 리소스 없음 |
| `VALIDATION_ERROR` | 400 | 필수 필드 누락 |

---

## 4. FAQ / 트러블슈팅

### Q1. 403 Forbidden 응답
- SYSTEM_ADMIN 역할이 있는 사용자로 로그인했는지 확인하세요

### Q2. 메뉴 할당 후 기존 메뉴가 사라짐
- POST `/api/menu-sets/:id/menus`는 전체 교체 방식입니다. 기존 + 신규를 모두 포함해서 전송하세요

### Q3. 시스템 삭제 후 복구
- PUT `/api/systems/:id`로 `{ "isActive": true }`를 전송하면 복구됩니다

---

## 5. 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| 1.0.0 | 2026-01-27 | 초기 작성 |
