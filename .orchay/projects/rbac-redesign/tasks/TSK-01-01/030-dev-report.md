# TSK-01-01 개발 보고서

**Task:** Prisma 스키마 확장 및 마이그레이션
**상태:** 완료
**일자:** 2026-01-27

## 변경 사항

### Prisma Schema 전면 재작성
- System PK: Int → String (`systemId`)
- User PK: Int → String (`userId`, 사번)
- Menu: parentId self-ref 제거 → category path + String sortOrder
- Permission: type/resource/action → config JSON + menuId FK
- UserRole, RoleMenu 제거
- 신규 모델: MenuSet, MenuSetMenu, RoleGroup, RoleGroupRole, UserRoleGroup, UserSystemMenuSet
- 선분 이력 테이블 13개 추가 (마스터 8 + 매핑 5)

### 코드 마이그레이션
- ~30개 파일 수정 (API routes, auth, services, components, types)
- tsconfig.json에서 scripts 폴더 exclude 추가
- `@/lib/generated/prisma` → `@/lib/generated/prisma/client` import 수정

## 검증 결과

| 항목 | 결과 |
|------|------|
| `prisma db push` | ✅ 성공 |
| `prisma generate` | ✅ 성공 |
| `pnpm build` | ✅ 성공 |
| `prisma db seed` | ✅ 성공 (26 permissions, 7 roles, 7 role groups, 5 users, 17 menus, 56 menu-set-menu mappings) |
