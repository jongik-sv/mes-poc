# TDD 테스트 결과서 (070-tdd-test-results.md)

**Task ID:** TSK-03-01
**Task명:** 메뉴 데이터 모델
**실행일시:** 2026-01-21 16:07:38
**테스트 환경:** Vitest 4.0.17 + jsdom

---

## 1. 테스트 실행 요약

| 항목 | 값 |
|------|-----|
| 총 테스트 수 | 27 |
| 성공 | 27 |
| 실패 | 0 |
| 스킵 | 0 |
| 실행 시간 | 826ms |
| 통과율 | 100% |

---

## 2. 테스트 케이스 상세

### 2.1 findAll (메뉴 목록 조회)

| 테스트 ID | 테스트명 | 결과 | 실행시간 |
|-----------|---------|------|----------|
| UT-001 | should return menu list | PASS | 4ms |
| UT-002 | should return hierarchical menu tree | PASS | 1ms |
| UT-003 | should return menus ordered by sortOrder | PASS | 0ms |
| UT-005 | should filter out inactive menus | PASS | 2ms |
| UT-009 | should only include active menus in response | PASS | 1ms |

### 2.2 create (메뉴 생성)

| 테스트 ID | 테스트명 | 결과 | 실행시간 |
|-----------|---------|------|----------|
| UT-001 | should create menu with valid data | PASS | 1ms |
| UT-004 | should save icon field correctly | PASS | 0ms |
| UT-006 | should throw ConflictException for duplicate code | PASS | 1ms |
| UT-007 | should throw BadRequestException for depth > 3 | PASS | 0ms |

### 2.3 input validation (입력 검증)

| 테스트 ID | 테스트명 | 결과 | 실행시간 |
|-----------|---------|------|----------|
| UT-011-1 | should throw for invalid code format | PASS | 0ms |
| UT-011-2 | should throw for invalid path with javascript: | PASS | 0ms |
| UT-011-3 | should throw for invalid icon | PASS | 0ms |
| UT-011-4 | should throw for empty name | PASS | 0ms |
| UT-011-5 | should throw for negative sortOrder | PASS | 0ms |
| UT-011-6 | should throw for code with forbidden characters in name | PASS | 0ms |

### 2.4 boundary values (경계값)

| 테스트 ID | 테스트명 | 결과 | 실행시간 |
|-----------|---------|------|----------|
| UT-012-1 | should accept sortOrder = 0 | PASS | 0ms |
| UT-012-2 | should accept code with max length (50 chars) | PASS | 0ms |
| UT-012-3 | should reject code exceeding max length | PASS | 0ms |
| UT-012-4 | should accept exactly 3-level menu | PASS | 0ms |

### 2.5 update (메뉴 수정)

| 테스트 ID | 테스트명 | 결과 | 실행시간 |
|-----------|---------|------|----------|
| UT-010-1 | should throw BadRequestException for circular reference | PASS | 0ms |
| UT-010-2 | should throw BadRequestException for self-reference | PASS | 0ms |
| - | should throw if menu not found | PASS | 0ms |

### 2.6 delete (메뉴 삭제)

| 테스트 ID | 테스트명 | 결과 | 실행시간 |
|-----------|---------|------|----------|
| UT-008 | should throw BadRequestException when menu has children | PASS | 0ms |
| - | should delete menu without children | PASS | 0ms |
| - | should throw if menu not found | PASS | 0ms |

### 2.7 findById (단일 메뉴 조회)

| 테스트명 | 결과 | 실행시간 |
|---------|------|----------|
| should return menu by id | PASS | 0ms |
| should return null for non-existent menu | PASS | 0ms |

---

## 3. 요구사항 커버리지 매핑

### 3.1 기능 요구사항 (FR)

| 요구사항 ID | 설명 | 테스트 ID | 결과 |
|-------------|------|-----------|------|
| FR-001 | DB 기반 메뉴 구조 관리 | UT-001 | PASS |
| FR-002 | 계층형 메뉴 지원 | UT-002 | PASS |
| FR-003 | 메뉴 순서 관리 | UT-003 | PASS |
| FR-004 | 메뉴 아이콘 지원 | UT-004 | PASS |
| FR-005 | 메뉴 활성화 상태 | UT-005, UT-009 | PASS |

### 3.2 비즈니스 규칙 (BR)

| 규칙 ID | 설명 | 테스트 ID | 결과 |
|---------|------|-----------|------|
| BR-001 | 메뉴 코드 유일성 | UT-006 | PASS |
| BR-002 | 계층 깊이 제한 (최대 3단계) | UT-007, UT-012-4 | PASS |
| BR-003 | 비활성 메뉴 필터링 | UT-009 | PASS |
| BR-004 | sortOrder 정렬 | UT-003 | PASS |
| BR-005 | 순환 참조 금지 | UT-010-1, UT-010-2 | PASS |
| BR-006 | 자식 메뉴 삭제 보호 | UT-008 | PASS |

---

## 4. 테스트-수정 루프 이력

| 시도 | 실패 테스트 | 원인 | 수정 내용 |
|------|------------|------|----------|
| 1차 | 3개 | Mock 설정 문제 | rejects.toMatchObject 대신 try-catch로 변경 |
| 2차 | 2개 | Mock 초기화 문제 | beforeEach에서 mockReset() 추가 |
| 3차 | 0개 | - | 27/27 통과 |

---

## 5. 테스트 파일 위치

```
mes-portal/
├── lib/services/__tests__/
│   └── menu.service.spec.ts    # 단위 테스트 (27건)
└── test-results/20260121-160738/
    └── tdd/
        ├── test-results.json   # 테스트 결과 JSON
        └── coverage/           # 커버리지 리포트
```

---

## 6. 결론

- 모든 27개 단위 테스트 통과 (100%)
- 기능 요구사항 (FR-001 ~ FR-005) 100% 커버
- 비즈니스 규칙 (BR-001 ~ BR-006) 100% 커버
- 입력 검증 및 경계값 테스트 완료

---

<!--
TSK-03-01 TDD 테스트 결과서
Generated: 2026-01-21
-->
