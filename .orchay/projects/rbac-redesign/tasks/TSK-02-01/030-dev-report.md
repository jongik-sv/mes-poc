# TSK-02-01 개발 보고서

**Task:** System / MenuSet / Menu CRUD API
**상태:** 완료
**일자:** 2026-01-27

---

## 구현 사항

### Systems API (5 엔드포인트)
- `GET /api/systems` - 목록 조회 (페이징, isActive/search 필터)
- `POST /api/systems` - 시스템 생성 (관리자, systemId/domain 중복 검사)
- `GET /api/systems/:id` - 상세 조회 (관계 카운트 포함)
- `PUT /api/systems/:id` - 수정 (관리자, domain 중복 검사)
- `DELETE /api/systems/:id` - 소프트 삭제 (isActive=false)

### MenuSets API (7 엔드포인트)
- `GET /api/menu-sets` - 목록 조회 (systemId/isActive/search 필터)
- `POST /api/menu-sets` - 메뉴세트 생성 (관리자, menuSetCd 중복 검사)
- `GET /api/menu-sets/:id` - 상세 조회 (메뉴 목록 포함)
- `PUT /api/menu-sets/:id` - 수정 (관리자)
- `DELETE /api/menu-sets/:id` - 삭제 (관리자, cascade)
- `GET /api/menu-sets/:id/menus` - 할당된 메뉴 목록
- `POST /api/menu-sets/:id/menus` - 메뉴 할당 (전체 교체, diff 히스토리)

### 공통 패턴
- Auth.js 세션 검증 + SYSTEM_ADMIN 권한 확인
- `$transaction`으로 메인 작업 + History + AuditLog 원자적 기록
- SCD Type 2 선분 이력 (이전 레코드 validTo 종료 + 신규 생성)
- 응답: `{ success, data?, error?: { code, message } }`

## 생성된 파일

| 파일 | 유형 |
|------|------|
| `app/api/systems/route.ts` | API Route |
| `app/api/systems/[id]/route.ts` | API Route |
| `app/api/systems/__tests__/route.spec.ts` | 테스트 |
| `app/api/systems/[id]/__tests__/route.spec.ts` | 테스트 |
| `app/api/menu-sets/route.ts` | API Route |
| `app/api/menu-sets/[id]/route.ts` | API Route |
| `app/api/menu-sets/[id]/menus/route.ts` | API Route |
| `app/api/menu-sets/__tests__/route.spec.ts` | 테스트 |
| `app/api/menu-sets/[id]/__tests__/route.spec.ts` | 테스트 |
| `app/api/menu-sets/[id]/menus/__tests__/route.spec.ts` | 테스트 |

## 테스트 결과

- 5개 테스트 파일, 42개 테스트 케이스 전부 PASS
- 소요 시간: 1.39s
