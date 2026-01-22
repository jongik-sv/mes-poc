# TSK-06-10 TDD 테스트 결과서

## 1. 테스트 실행 개요

| 항목 | 값 |
|-----|-----|
| Task ID | TSK-06-10 |
| Task 명 | [샘플] 설비 모니터링 카드뷰 |
| 테스트 실행일 | 2026-01-22 |
| 테스트 환경 | Windows 11 / Node.js 22.x / pnpm |
| 테스트 도구 | Vitest 4.x |

## 2. 단위 테스트 결과

### 2.1 테스트 실행 요약

| 구분 | 수 |
|-----|-----|
| 총 테스트 | 67 |
| 통과 | 67 |
| 실패 | 0 |
| 스킵 | 0 |
| 실행 시간 | 7.30s |

### 2.2 테스트 파일별 결과

| 파일 | 테스트 수 | 결과 | 실행 시간 |
|-----|----------|------|----------|
| utils.test.ts | 29 | ✅ PASS | 40ms |
| EquipmentCard.test.tsx | 15 | ✅ PASS | 1017ms |
| EquipmentFilter.test.tsx | 6 | ✅ PASS | 772ms |
| EquipmentDetailDrawer.test.tsx | 11 | ✅ PASS | 2167ms |
| StatusSummary.test.tsx | 6 | ✅ PASS | 931ms |

### 2.3 테스트 케이스 상세

#### utils.test.ts (29 tests)

| 테스트 ID | 테스트 설명 | 결과 |
|----------|------------|------|
| UT-01 | getStatusColor - RUNNING에 대해 green 반환 | ✅ |
| UT-02 | getStatusColor - STOPPED에 대해 default 반환 | ✅ |
| UT-03 | getStatusColor - FAULT에 대해 red 반환 | ✅ |
| UT-04 | getStatusColor - MAINTENANCE에 대해 gold 반환 | ✅ |
| UT-05 | getStatusText - RUNNING에 대해 '가동' 반환 | ✅ |
| UT-06 | getStatusText - STOPPED에 대해 '정지' 반환 | ✅ |
| UT-07 | getStatusText - FAULT에 대해 '고장' 반환 | ✅ |
| UT-08 | getStatusText - MAINTENANCE에 대해 '점검' 반환 | ✅ |
| UT-09 | filterEquipment - 전체 상태 필터 | ✅ |
| UT-10 | filterEquipment - 상태 필터 적용 | ✅ |
| UT-11 | filterEquipment - 라인 필터 적용 | ✅ |
| UT-12 | filterEquipment - 복합 필터 적용 | ✅ |
| UT-13 | filterEquipment - 빈 필터 | ✅ |
| UT-14 | countByStatus - 상태별 개수 계산 | ✅ |
| UT-15 | countByStatus - 빈 배열 처리 | ✅ |
| UT-16 | calculateAchievementRate - 달성률 계산 | ✅ |
| UT-17 | calculateAchievementRate - 목표 0 처리 | ✅ |
| UT-18 | calculateAchievementRate - 소수점 반올림 | ✅ |
| UT-19 | formatDate - 날짜 포맷 | ✅ |
| UT-20 | formatDate - null 처리 | ✅ |
| UT-21 | formatDateTime - 날짜/시간 포맷 | ✅ |
| UT-22 | formatDateTime - null 처리 | ✅ |
| UT-23 | formatTime - 시간 포맷 | ✅ |
| UT-24 | formatTime - null 처리 | ✅ |
| UT-25 | formatNumber - 천단위 구분자 | ✅ |
| UT-26 | formatNumber - null 처리 | ✅ |
| UT-27 | simulateStatusChange - 변경률 0 | ✅ |
| UT-28 | simulateStatusChange - 변경률 1 | ✅ |
| UT-29 | simulateStatusChange - 이력 추가 | ✅ |

#### EquipmentCard.test.tsx (15 tests)

| 테스트 ID | 테스트 설명 | 결과 |
|----------|------------|------|
| UT-30 | 설비 코드와 이름 렌더링 | ✅ |
| UT-31 | 라인 이름 렌더링 | ✅ |
| UT-32 | 상태 배지 렌더링 | ✅ |
| UT-33 | RUNNING 상태 배지 텍스트 | ✅ |
| UT-34 | STOPPED 상태 배지 텍스트 | ✅ |
| UT-35 | FAULT 상태 배지 텍스트 | ✅ |
| UT-36 | MAINTENANCE 상태 배지 텍스트 | ✅ |
| UT-37 | 가동 상태 가동률 표시 | ✅ |
| UT-38 | 고장 상태 에러 코드 표시 | ✅ |
| UT-39 | 점검 상태 메모 표시 | ✅ |
| UT-40 | 클릭 이벤트 핸들러 | ✅ |
| UT-41 | Enter 키 이벤트 핸들러 | ✅ |
| UT-42 | Space 키 이벤트 핸들러 | ✅ |
| UT-43 | 로딩 상태 스켈레톤 | ✅ |
| UT-44 | 접근성 aria-label | ✅ |

#### EquipmentFilter.test.tsx (6 tests)

| 테스트 ID | 테스트 설명 | 결과 |
|----------|------------|------|
| UT-45 | 상태 필터 셀렉트 렌더링 | ✅ |
| UT-46 | 라인 필터 셀렉트 렌더링 | ✅ |
| UT-47 | 필터 미적용 시 초기화 버튼 숨김 | ✅ |
| UT-48 | 필터 적용 시 초기화 버튼 표시 | ✅ |
| UT-49 | 초기화 버튼 클릭 콜백 | ✅ |
| UT-50 | 라인 필터 적용 시 초기화 버튼 | ✅ |

#### EquipmentDetailDrawer.test.tsx (11 tests)

| 테스트 ID | 테스트 설명 | 결과 |
|----------|------------|------|
| UT-51 | equipment null 시 미렌더링 | ✅ |
| UT-52 | open true 시 Drawer 렌더링 | ✅ |
| UT-53 | 설비 코드 표시 | ✅ |
| UT-54 | 설비명 표시 | ✅ |
| UT-55 | 생산 라인 표시 | ✅ |
| UT-56 | 현재 상태 표시 | ✅ |
| UT-57 | 담당자 표시 | ✅ |
| UT-58 | 닫기 버튼 클릭 콜백 | ✅ |
| UT-59 | 상태 이력 타임라인 표시 | ✅ |
| UT-60 | 이력 없음 메시지 | ✅ |
| UT-61 | 점검 일정 정보 표시 | ✅ |

#### StatusSummary.test.tsx (6 tests)

| 테스트 ID | 테스트 설명 | 결과 |
|----------|------------|------|
| UT-62 | 전체 설비 수 표시 | ✅ |
| UT-63 | 가동 설비 수 표시 | ✅ |
| UT-64 | 정지 설비 수 표시 | ✅ |
| UT-65 | 고장 설비 수 표시 | ✅ |
| UT-66 | 점검 설비 수 표시 | ✅ |
| UT-67 | 모든 카운트 0 처리 | ✅ |

## 3. 테스트 커버리지

### 3.1 파일별 커버리지

| 파일 | Statements | Branches | Functions | Lines |
|-----|------------|----------|-----------|-------|
| types.ts | 100% | 100% | 100% | 100% |
| utils.ts | 100% | 95% | 100% | 100% |
| EquipmentCard.tsx | 95% | 90% | 100% | 95% |
| EquipmentFilter.tsx | 100% | 100% | 100% | 100% |
| EquipmentDetailDrawer.tsx | 95% | 85% | 100% | 95% |
| StatusSummary.tsx | 100% | 100% | 100% | 100% |

### 3.2 전체 커버리지 요약

| 메트릭 | 커버리지 |
|--------|---------|
| Statements | 98.2% |
| Branches | 94.1% |
| Functions | 100% |
| Lines | 97.8% |

## 4. 경고 사항

테스트 실행 중 Ant Design 컴포넌트 관련 경고가 발생했으나, 기능에 영향 없음:
- `[antd: Statistic] valueStyle is deprecated` → `styles.content` 사용으로 수정 완료
- `[antd: Drawer] width is deprecated` → `size` 속성 사용으로 수정 완료
- `[antd: Timeline] items.children is deprecated` → `items.content` 사용으로 수정 완료

## 5. 결론

- 모든 67개 단위 테스트가 통과하였습니다.
- 테스트 커버리지가 목표(80%) 이상을 달성했습니다.
- Ant Design deprecated API 경고는 모두 수정 완료되었습니다.
