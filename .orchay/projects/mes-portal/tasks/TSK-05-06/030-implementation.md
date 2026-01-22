# TSK-05-06: 키보드 단축키 시스템 구현 보고서

## 개요

| 항목 | 내용 |
|------|------|
| Task ID | TSK-05-06 |
| Task 명 | 키보드 단축키 시스템 |
| 도메인 | frontend |
| 구현일 | 2025-01-22 |
| 상태 | 구현 완료 |

## 구현 범위

### 1. useGlobalHotkeys 훅 (`lib/hooks/useGlobalHotkeys.ts`)

react-hotkeys-hook 라이브러리를 활용한 전역 키보드 단축키 관리 훅

#### 주요 기능
- **Ctrl/Cmd+K**: 전역 검색 열기
- **?**: 단축키 도움말 열기
- **Ctrl/Cmd+W**: 현재 탭 닫기
- **Ctrl/Cmd+S**: 저장하기
- **Ctrl/Cmd+Tab**: 다음 탭으로 이동
- **Ctrl/Cmd+Shift+Tab**: 이전 탭으로 이동
- **Ctrl/Cmd+R**: 새로고침

#### API
```typescript
interface UseGlobalHotkeysOptions {
  onSearch?: () => void
  onHelp?: () => void
  onSave?: () => void
  onCloseTab?: () => void
  onNextTab?: () => void
  onPrevTab?: () => void
  onRefresh?: () => void
  disabled?: boolean
}

function useGlobalHotkeys(options: UseGlobalHotkeysOptions): void
```

#### 유틸리티 함수
- `getModifierKey()`: 플랫폼에 따른 modifier 키 반환 (Mac: ⌘, Windows: Ctrl)
- `isMacPlatform()`: Mac 플랫폼 여부 확인

### 2. HotkeyHelp 컴포넌트 (`components/common/HotkeyHelp.tsx`)

단축키 도움말을 표시하는 모달 컴포넌트

#### 주요 기능
- 카테고리별 단축키 목록 표시
- 플랫폼에 맞는 키 표기 (Mac: ⌘, Windows: Ctrl)
- 커스텀 카테고리 지원
- 접근성 준수 (ARIA 속성)

#### API
```typescript
interface HotkeyHelpProps {
  open: boolean
  onClose: () => void
  categories?: HotkeyCategory[]
}
```

### 3. KeyBadge 컴포넌트 (`components/common/KeyBadge.tsx`)

개별 키 또는 키 조합을 시각적으로 표시하는 컴포넌트

#### 주요 기능
- 키 조합 시각화 (kbd 태그)
- 플랫폼별 modifier 키 자동 변환
- 크기 옵션 (small, default, large)
- 접근성 준수 (aria-label)

#### API
```typescript
interface KeyBadgeProps {
  keys: string[]
  separator?: string
  size?: 'small' | 'default' | 'large'
  platform?: 'auto' | 'mac' | 'windows'
}
```

## 파일 목록

### 신규 생성 파일

| 파일 경로 | 설명 |
|-----------|------|
| `lib/hooks/useGlobalHotkeys.ts` | 전역 단축키 훅 |
| `lib/hooks/__tests__/useGlobalHotkeys.test.ts` | 훅 단위 테스트 |
| `components/common/HotkeyHelp.tsx` | 도움말 모달 컴포넌트 |
| `components/common/__tests__/HotkeyHelp.test.tsx` | 컴포넌트 테스트 |
| `components/common/KeyBadge.tsx` | 키 배지 컴포넌트 |
| `components/common/__tests__/KeyBadge.test.tsx` | 컴포넌트 테스트 |

### 수정 파일

| 파일 경로 | 변경 내용 |
|-----------|-----------|
| `lib/hooks/index.ts` | useGlobalHotkeys 및 관련 타입 export 추가 |
| `components/common/index.ts` | HotkeyHelp, KeyBadge export 추가 |
| `app/(portal)/layout.tsx` | 전역 단축키 및 도움말 모달 통합 |

## 기술적 결정 사항

### 1. react-hotkeys-hook 라이브러리 선택

**이유**:
- React 훅 기반의 가벼운 API
- mod 키워드로 크로스 플랫폼 지원 (Mac: Cmd, Windows: Ctrl)
- enableOnFormTags 옵션으로 입력 필드 예외 처리
- 브라우저 기본 동작 방지 지원

### 2. HOTKEY_CATEGORIES 상수 정의

단축키 목록을 상수로 정의하여 HotkeyHelp 컴포넌트와 공유, 일관성 유지

### 3. 플랫폼 감지 방식

`navigator.platform`을 사용하여 Mac/Windows 구분:
- Mac: 'Mac', 'iPhone', 'iPod', 'iPad' 포함
- 기타: Windows로 간주

## 테스트 결과

| 구분 | 테스트 수 | 통과 | 실패 |
|------|----------|------|------|
| useGlobalHotkeys | 13 | 13 | 0 |
| HotkeyHelp | 14 | 14 | 0 |
| KeyBadge | 13 | 13 | 0 |
| **합계** | **40** | **40** | **0** |

## 사용 예시

### 포털 레이아웃에서의 사용

```tsx
import { useGlobalHotkeys } from '@/lib/hooks'
import { HotkeyHelp } from '@/components/common'

function PortalLayout() {
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const { closeTab, tabs, activeTabId, setActiveTab } = useMDI()

  useGlobalHotkeys({
    onSearch: () => setIsSearchOpen(true),
    onHelp: () => setIsHelpOpen(true),
    onCloseTab: () => {
      if (activeTabId && activeTabId !== 'dashboard') {
        closeTab(activeTabId)
      }
    },
    onNextTab: () => {
      // 다음 탭으로 이동 로직
    },
    onPrevTab: () => {
      // 이전 탭으로 이동 로직
    },
  })

  return (
    <>
      {/* 레이아웃 내용 */}
      <HotkeyHelp open={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </>
  )
}
```

## 접근성 준수 사항

- HotkeyHelp 모달: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- 단축키 목록: `role="list"`, `role="listitem"`, `role="group"`
- KeyBadge: `role="img"`, `aria-label` (키 설명)
- 입력 필드에서는 단축키 비활성화 안내 메시지 포함

## 알려진 제한 사항

1. **Ctrl+Tab**: 일부 브라우저에서 탭 전환 기본 동작과 충돌할 수 있음
2. **서버 사이드 렌더링**: `navigator.platform`은 클라이언트에서만 사용 가능

## 다음 단계

1. E2E 테스트 추가 (통합테스트 단계에서)
2. 사용자 커스텀 단축키 설정 기능 (향후 확장)
