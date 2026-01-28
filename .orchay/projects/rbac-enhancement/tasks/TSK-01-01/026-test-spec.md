# TSK-01-01 테스트 명세서 - 역할그룹 정의 화면

## 1. 테스트 환경

- **프레임워크**: Vitest + @testing-library/react
- **대상 파일**: `app/(portal)/system/role-groups/page.tsx`
- **테스트 파일**: `app/(portal)/system/role-groups/__tests__/page.test.tsx`
- **API Mock**: `vi.fn()` 또는 MSW

## 2. 테스트 케이스

### TC-101: 역할그룹 목록 표시

| 항목 | 내용 |
|------|------|
| 요구사항 | FR-101 |
| 사전조건 | 페이지 렌더링, API mock 데이터 반환 |
| 동작 | 페이지 로드 |
| 검증 | 테이블에 역할그룹 코드, 이름, 시스템, 상태(Tag), 액션 버튼 표시 |

```typescript
it('역할그룹 목록을 테이블에 표시한다', async () => {
  render(<RoleGroupsPage />);
  expect(await screen.findByText('RG001')).toBeInTheDocument();
  expect(screen.getByText('생산관리자 그룹')).toBeInTheDocument();
  expect(screen.getByText('활성')).toBeInTheDocument();
});
```

### TC-102: 역할그룹 검색 및 필터

| 항목 | 내용 |
|------|------|
| 요구사항 | FR-102 |
| 사전조건 | 역할그룹 목록 로드 완료 |
| 동작 | 검색어 입력, 시스템 필터 선택, 상태 필터 선택 |
| 검증 | 필터 조건에 맞는 API 재호출 또는 클라이언트 필터링 |

```typescript
it('검색어 입력 시 필터링된 결과를 표시한다', async () => {
  render(<RoleGroupsPage />);
  const searchInput = screen.getByPlaceholderText('이름/코드 검색');
  await userEvent.type(searchInput, '생산');
  // 필터링된 결과 검증
});
```

### TC-103: 역할그룹 등록/수정/삭제

| 항목 | 내용 |
|------|------|
| 요구사항 | FR-103 |
| 사전조건 | 페이지 렌더링 완료 |

```typescript
it('등록 버튼 클릭 시 모달이 열린다', async () => {
  render(<RoleGroupsPage />);
  await userEvent.click(screen.getByText('등록'));
  expect(screen.getByText('역할그룹 등록')).toBeInTheDocument();
});

it('모달에서 저장 시 API 호출 후 목록 갱신', async () => {
  // 모달 열기 → 폼 입력 → 저장 → API mock 검증
});

it('삭제 확인 후 API 호출', async () => {
  // 삭제 버튼 클릭 → Popconfirm 확인 → API mock 검증
});
```

### TC-104: 역할그룹 선택 → 중앙 패널 갱신

| 항목 | 내용 |
|------|------|
| 요구사항 | FR-104 |
| 동작 | 역할그룹 행 클릭 |
| 검증 | 중앙 패널에 선택된 역할그룹명 표시, 할당된 역할 로드 |

```typescript
it('역할그룹 행 클릭 시 중앙 패널에 역할 목록이 표시된다', async () => {
  render(<RoleGroupsPage />);
  await userEvent.click(await screen.findByText('생산관리자 그룹'));
  expect(await screen.findByText('생산관리자')).toBeInTheDocument(); // 할당된 역할
});
```

### TC-105: 할당된 역할 + 전체 역할 테이블

| 항목 | 내용 |
|------|------|
| 요구사항 | FR-105 |
| 사전조건 | 역할그룹 선택됨 |
| 검증 | 할당된 역할 테이블과 전체 역할 테이블(체크박스 포함) 표시, 할당된 역할은 체크 상태 |

```typescript
it('전체 역할 테이블에서 할당된 역할은 체크 상태이다', async () => {
  render(<RoleGroupsPage />);
  await userEvent.click(await screen.findByText('생산관리자 그룹'));
  // 전체 역할 테이블의 체크박스 상태 검증
});
```

### TC-106: 역할 등록/수정/삭제

| 항목 | 내용 |
|------|------|
| 요구사항 | FR-106 |

```typescript
it('역할 등록 모달에서 저장 시 역할이 생성된다', async () => {
  // 중앙 패널 등록 버튼 → 모달 → 폼 입력 → 저장 → API 검증
});
```

### TC-107: 역할 할당 저장

| 항목 | 내용 |
|------|------|
| 요구사항 | FR-107 |
| 사전조건 | 역할그룹 선택, 전체 역할 체크박스 변경 |
| 동작 | [할당 저장] 클릭 |
| 검증 | POST API 호출 (selectedRoleIds), 성공 시 할당 테이블 갱신 |

```typescript
it('역할 할당 저장 시 선택된 역할 ID로 API 호출', async () => {
  // 체크박스 변경 → 할당 저장 클릭 → API mock 검증
});
```

### TC-108: 할당된 역할 클릭 → 우측 패널 갱신

| 항목 | 내용 |
|------|------|
| 요구사항 | FR-108 |

```typescript
it('할당된 역할 클릭 시 우측 패널에 권한 목록이 표시된다', async () => {
  render(<RoleGroupsPage />);
  // 역할그룹 선택 → 할당된 역할 클릭 → 우측 패널 검증
});
```

### TC-109: 할당된 권한 + 전체 권한 테이블

| 항목 | 내용 |
|------|------|
| 요구사항 | FR-109 |
| 사전조건 | 역할 선택됨 |
| 검증 | 할당된 권한 테이블 + 전체 권한 테이블(체크박스) 표시 |

### TC-110: 권한 등록/수정/삭제

| 항목 | 내용 |
|------|------|
| 요구사항 | FR-110 |

```typescript
it('권한 등록 모달에서 유형 선택이 가능하다', async () => {
  // 우측 패널 등록 → 모달 → 유형 Select (메뉴/API/데이터) 검증
});
```

### TC-111: 권한 할당 저장

| 항목 | 내용 |
|------|------|
| 요구사항 | FR-111 |

```typescript
it('권한 할당 저장 시 선택된 권한 ID로 API 호출', async () => {
  // 체크박스 변경 → 할당 저장 → PUT API mock 검증
});
```

### TC-112: 전체 레이아웃

| 항목 | 내용 |
|------|------|
| 요구사항 | FR-112 |
| 검증 | 3-column 레이아웃 렌더링 (35%/33%/32%) |

```typescript
it('3-column 레이아웃이 렌더링된다', () => {
  render(<RoleGroupsPage />);
  expect(screen.getByText('역할그룹 목록')).toBeInTheDocument();
  expect(screen.getByText('역할 관리')).toBeInTheDocument();
  expect(screen.getByText('권한 관리')).toBeInTheDocument();
});
```

### TC-113: 미선택 시 안내 메시지

| 항목 | 내용 |
|------|------|
| 요구사항 | BR-101 |
| 검증 | 초기 로드 시 중앙/우측 패널에 Empty 안내 메시지 표시 |

```typescript
it('초기 상태에서 중앙/우측 패널에 안내 메시지가 표시된다', () => {
  render(<RoleGroupsPage />);
  expect(screen.getByText('역할그룹을 선택하면 역할 목록이 표시됩니다.')).toBeInTheDocument();
  expect(screen.getByText('역할을 선택하면 권한 목록이 표시됩니다.')).toBeInTheDocument();
});
```

## 3. 테스트 커버리지 목표

| 영역 | 목표 |
|------|------|
| 렌더링 | 100% — 모든 패널/테이블/모달 렌더링 검증 |
| 사용자 상호작용 | 90% — 클릭, 입력, 체크박스, 모달 열기/닫기 |
| API 호출 | 100% — 모든 CRUD + 할당 저장 API mock 검증 |
| 상태 전이 | 100% — 미선택 → 역할그룹 선택 → 역할 선택 |
| 에러 처리 | API 실패 시 에러 메시지 표시 검증 |
