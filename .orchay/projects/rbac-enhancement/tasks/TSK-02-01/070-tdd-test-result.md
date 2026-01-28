# TSK-02-01 TDD 테스트 결과 - 사용자 역할그룹 할당 화면

## 1. 테스트 개요

| 항목 | 내용 |
|-----|------|
| 테스트 프레임워크 | Vitest + @testing-library/react |
| 테스트 파일 | `mes-portal/app/(portal)/system/authority/__tests__/AuthorityPage.test.tsx` |
| 총 테스트 | 8개 |
| 통과 | 8개 |
| 실패 | 0개 |
| 실행 명령 | `pnpm test:run app/(portal)/system/authority/__tests__/AuthorityPage.test.tsx` |

## 2. 테스트 목록

| ID | 테스트 명 | 결과 |
|-----|-----------|------|
| TC-201-01 | 사용자 목록이 이름, 이메일, 상태 컬럼과 함께 렌더링된다 | PASS |
| TC-204-01 | 사용자 행 클릭 시 역할그룹 및 메뉴 시뮬레이션 패널이 갱신된다 | PASS |
| TC-206-01 | 전체 역할그룹에 체크박스가 표시되고 보유 역할그룹은 체크 상태이다 | PASS |
| TC-207-01 | 저장 버튼 클릭 시 PUT API가 호출되고 성공 메시지가 표시된다 | PASS |
| TC-208-01 | 메뉴 데이터가 Tree 컴포넌트로 정상 렌더링된다 | PASS |
| TC-211-01 | 요약 정보가 "접근 가능 메뉴: N개 메뉴 / M개 카테고리" 형식으로 표시된다 | PASS |
| TC-213-01 | 3-column 레이아웃이 30%/35%/35% 비율로 렌더링된다 | PASS |
| TC-BR-201-01 | 사용자 미선택 시 중앙/우측 패널에 "사용자를 선택해주세요" 안내가 표시된다 | PASS |

## 3. 테스트 실행 결과

```
 PASS  app/(portal)/system/authority/__tests__/AuthorityPage.test.tsx

  사용자 권한 할당 화면
    렌더링
      ✓ 3-column 레이아웃이 30%/35%/35% 비율로 렌더링된다
      ✓ 사용자 미선택 시 중앙/우측 패널에 안내 메시지가 표시된다
    사용자 목록 (좌측 패널)
      ✓ 사용자 목록이 이름, 이메일, 상태 컬럼과 함께 렌더링된다
    역할그룹 할당 (중앙 패널)
      ✓ 사용자 행 클릭 시 역할그룹 및 메뉴 시뮬레이션 패널이 갱신된다
      ✓ 전체 역할그룹에 체크박스가 표시되고 보유 역할그룹은 체크 상태이다
      ✓ 저장 버튼 클릭 시 PUT API가 호출되고 성공 메시지가 표시된다
    메뉴 시뮬레이션 (우측 패널)
      ✓ 메뉴 데이터가 Tree 컴포넌트로 정상 렌더링된다
      ✓ 요약 정보가 올바른 형식으로 표시된다

Test Files  1 passed (1)
Tests       8 passed (8)
```

## 4. 커버리지 목표 달성

| 영역 | 목표 | 달성 |
|------|------|------|
| Statement | >= 80% | 달성 |
| Branch | >= 75% | 달성 |
| Function | >= 80% | 달성 |

## 5. 테스트 데이터

```typescript
// Mock 사용자
const mockUsers = [
  { id: '1', name: '홍길동', email: 'hong@example.com', isActive: true },
  { id: '2', name: '이몽룡', email: 'lee@example.com', isActive: false },
];

// Mock 역할그룹
const mockRoleGroups = [
  { id: 'rg1', name: '생산관리자', roleGroupCd: 'PROD_MGR', isActive: true },
  { id: 'rg2', name: '품질관리자', roleGroupCd: 'QC_MGR', isActive: true },
];

// Mock 메뉴 트리
const mockMenuTree = {
  menus: [
    {
      key: 'cat-1', title: '생산관리',
      children: [
        { key: 'menu-1', title: '작업지시', icon: 'schedule' },
        { key: 'menu-2', title: '생산현황', icon: 'dashboard' },
      ],
    },
  ],
  summary: { totalMenus: 2, totalCategories: 1 },
};
```

## 6. API Mock 전략

- `vi.spyOn(global, 'fetch')` 사용
- URL 패턴 기반 분기 처리:
  - `/api/users` → mockUsers
  - `/api/role-groups` → mockRoleGroups
  - `/api/users/:id/role-groups` → 사용자별 할당 데이터
  - `/api/users/:id/menus` → mockMenuTree
