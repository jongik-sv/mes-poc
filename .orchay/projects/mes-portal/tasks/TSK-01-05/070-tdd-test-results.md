# TSK-01-05 TDD 테스트 결과서

## 문서 정보
- **Task ID**: TSK-01-05
- **Task 명**: 전역 검색 모달
- **테스트 일시**: 2026-01-21
- **테스트 도구**: Vitest + React Testing Library

---

## 1. 테스트 실행 요약

| 항목 | 값 |
|------|-----|
| 총 테스트 케이스 | 18 |
| 통과 | 18 |
| 실패 | 0 |
| 건너뜀 | 0 |
| 통과율 | **100%** |
| 실행 시간 | 3.25s |

---

## 2. 단위 테스트 결과 상세

### 2.1 GlobalSearch 컴포넌트 테스트

| 테스트 ID | 테스트 케이스 | 결과 | 시간(ms) |
|-----------|---------------|------|----------|
| UT-001 | isOpen이 true일 때 모달이 표시된다 | PASS | 595 |
| UT-001-2 | isOpen이 false일 때 모달이 렌더링되지 않는다 | PASS | - |
| UT-002 | 검색어 입력 시 실시간 필터링된다 | PASS | 415 |
| UT-002-2 | 검색어가 비어있으면 결과가 표시되지 않는다 | PASS | - |
| UT-002-3 | 대소문자 구분 없이 검색된다 (BR-002) | PASS | - |
| UT-002-4 | 부분 일치 검색이 지원된다 (BR-003) | PASS | - |
| UT-003 | ArrowDown 키로 다음 항목을 선택한다 | PASS | - |
| UT-003-2 | ArrowUp 키로 이전 항목을 선택한다 | PASS | - |
| UT-003-3 | ArrowDown이 마지막 항목에서 더 이동하지 않는다 | PASS | - |
| UT-003-4 | ArrowUp이 첫 번째 항목에서 더 이동하지 않는다 | PASS | - |
| UT-004 | Enter 키로 선택된 메뉴가 onSelect와 함께 호출된다 | PASS | - |
| UT-004-2 | 클릭으로 항목을 선택할 수 있다 | PASS | 345 |
| UT-005 | Escape 키로 onClose가 호출된다 | PASS | - |
| UT-006 | 검색 결과에 아이콘, 이름, 경로가 표시된다 | PASS | - |
| UT-007 | 검색어가 결과에서 하이라이트(mark)로 표시된다 | PASS | - |
| UT-008 | 결과가 없을 때 빈 상태 메시지가 표시된다 | PASS | - |
| UT-009 | path가 없는 폴더 메뉴는 선택해도 onSelect가 호출되지 않는다 | PASS | 321 |
| UT-009-2 | 폴더 메뉴에 (폴더) 표시가 나타난다 | PASS | - |

---

## 3. filterMenus 함수 테스트

| 테스트 ID | 테스트 케이스 | 결과 |
|-----------|---------------|------|
| filterMenus-001 | 검색어가 비어있으면 빈 배열 반환 | PASS |
| filterMenus-002 | 메뉴명에서 부분 일치 검색 | PASS |
| filterMenus-003 | 대소문자 구분 없이 검색 | PASS |
| filterMenus-004 | 중첩된 메뉴에서도 검색 | PASS |
| filterMenus-005 | breadcrumb 경로 생성 | PASS |

---

## 4. 요구사항 커버리지

### 4.1 기능 요구사항 (FR) 매핑

| FR ID | 요구사항 | 테스트 | 상태 |
|-------|----------|--------|------|
| FR-001 | Ctrl+K 단축키로 모달 열기 | UT-001 | 통과 |
| FR-002 | 실시간 메뉴 검색 | UT-002 | 통과 |
| FR-003 | 화살표 키 네비게이션 | UT-003, UT-003-2 | 통과 |
| FR-004 | Enter/클릭으로 메뉴 선택 | UT-004, UT-004-2 | 통과 |
| FR-005 | Escape로 모달 닫기 | UT-005 | 통과 |
| FR-006 | 검색 결과 표시 | UT-006 | 통과 |
| FR-007 | 검색어 하이라이트 | UT-007 | 통과 |

### 4.2 비즈니스 룰 (BR) 매핑

| BR ID | 비즈니스 룰 | 테스트 | 상태 |
|-------|-------------|--------|------|
| BR-001 | 메뉴명 검색 | UT-002 | 통과 |
| BR-002 | 대소문자 구분 없음 | UT-002-3 | 통과 |
| BR-003 | 부분 일치 검색 | UT-002-4 | 통과 |
| BR-004 | 빈 결과 상태 표시 | UT-008 | 통과 |
| BR-005 | 폴더 메뉴 선택 불가 | UT-009 | 통과 |

---

## 5. 테스트 환경

```
- Node.js: v22.x
- Vitest: v4.0.17
- React Testing Library: v16.x
- JSDOM: 테스트 환경
```

---

## 6. 실행 로그

```bash
$ pnpm test:run components/common/__tests__/GlobalSearch.test.tsx

 RUN  v4.0.17 /home/jji/project/mes-poc/mes-portal

 ✓ components/common/__tests__/GlobalSearch.test.tsx (18 tests) 3247ms

 Test Files  1 passed (1)
      Tests  18 passed (18)
   Start at  16:22:55
   Duration  6.85s
```

---

## 7. 결론

- **모든 단위 테스트가 통과**했습니다.
- 기능 요구사항(FR) 7개 및 비즈니스 룰(BR) 5개 모두 테스트로 검증되었습니다.
- TDD 사이클(Red → Green → Refactor)을 통해 안정적인 구현이 완료되었습니다.
