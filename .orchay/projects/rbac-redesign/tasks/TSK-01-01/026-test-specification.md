# 테스트 명세서 (026-test-specification.md)

---

## 0. 문서 메타데이터

| 항목 | 내용 |
|------|------|
| Task ID | TSK-01-01 |
| Task명 | Prisma 스키마 확장 및 마이그레이션 |
| 설계 참조 | `010-tech-design.md` |
| 추적성 매트릭스 참조 | `025-traceability-matrix.md` |
| 작성일 | 2026-01-27 |
| 작성자 | Claude |

---

## 1. 테스트 전략 개요

### 1.1 테스트 범위

| 테스트 유형 | 범위 | 목표 |
|------------|------|------|
| 마이그레이션 검증 | prisma db push 성공 | 100% |
| 클라이언트 생성 | prisma generate 성공 | 100% |
| 빌드 검증 | pnpm build 성공 (TS 에러 없음) | 100% |
| Seed 검증 | prisma db seed 성공 | 100% |

### 1.2 테스트 환경

| 항목 | 내용 |
|------|------|
| DB | SQLite (dev.db) |
| ORM | Prisma 7.x |
| 검증 도구 | CLI (prisma, pnpm) |

---

## 2. 검증 시나리오

| TC-ID | 시나리오 | 실행 명령 | 예상 결과 | 상태 |
|-------|---------|----------|----------|------|
| TC-001 | DB 스키마 동기화 | `pnpm prisma db push --force-reset` | 성공 | PASS |
| TC-002 | Prisma Client 생성 | `pnpm prisma generate` | 성공 | PASS |
| TC-003 | TypeScript 빌드 | `pnpm build` | 성공 (에러 0) | PASS |
| TC-004 | Seed 데이터 삽입 | `pnpm prisma db seed` | 성공 | PASS |
| TC-005 | Seed 데이터 검증 - permissions | seed 로그 확인 | 26개 생성 | PASS |
| TC-006 | Seed 데이터 검증 - roles | seed 로그 확인 | 7개 생성 | PASS |
| TC-007 | Seed 데이터 검증 - role groups | seed 로그 확인 | 7개 생성 | PASS |
| TC-008 | Seed 데이터 검증 - users | seed 로그 확인 | 5명 생성 | PASS |
| TC-009 | Seed 데이터 검증 - menus | seed 로그 확인 | 17개 생성 | PASS |
| TC-010 | Seed 데이터 검증 - menu-set-menus | seed 로그 확인 | 56개 매핑 | PASS |

---

## 변경 이력

| 버전 | 일자 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0 | 2026-01-27 | Claude | 최초 작성 |
