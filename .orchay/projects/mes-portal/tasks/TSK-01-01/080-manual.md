# TSK-01-01 - 레이아웃 컴포넌트 구조 매뉴얼

## 1. 개요

MES Portal의 기본 레이아웃 구조를 제공하는 PortalLayout 컴포넌트입니다.

### 1.1 구성 요소

| 영역 | 설명 | 고정 크기 |
|------|------|----------|
| Header | 상단 헤더 영역 | 60px |
| Sidebar | 좌측 네비게이션 | 240px / 60px (접힘) |
| Content | 메인 컨텐츠 영역 | 가변 |
| Footer | 하단 푸터 영역 | 30px |
| TabBar | MDI 탭 영역 (선택) | 40px |

---

## 2. 사용법

### 2.1 기본 사용

```tsx
// app/(portal)/layout.tsx
import { PortalLayout } from '@/components/layout/PortalLayout';

export default function PortalLayoutWrapper({ children }) {
  return <PortalLayout>{children}</PortalLayout>;
}
```

### 2.2 슬롯 활용

```tsx
import { PortalLayout } from '@/components/layout/PortalLayout';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Footer } from '@/components/layout/Footer';
import { TabBar } from '@/components/mdi/TabBar';

export default function Layout({ children }) {
  return (
    <PortalLayout
      header={<Header />}
      sidebar={<Sidebar />}
      tabBar={<TabBar />}
      footer={<Footer />}
    >
      {children}
    </PortalLayout>
  );
}
```

---

## 3. Props

| Prop | 타입 | 필수 | 설명 |
|------|------|------|------|
| children | ReactNode | O | 메인 컨텐츠 |
| header | ReactNode | X | 헤더 영역 컴포넌트 |
| sidebar | ReactNode | X | 사이드바 영역 컴포넌트 |
| tabBar | ReactNode | X | 탭 바 영역 컴포넌트 |
| footer | ReactNode | X | 푸터 영역 컴포넌트 |

---

## 4. 사이드바 토글

### 4.1 토글 버튼

사이드바 하단의 토글 버튼을 클릭하여 접기/펼치기 전환:
- 펼침 상태: 240px, 메뉴명 표시
- 접힘 상태: 60px, 아이콘만 표시

### 4.2 상태 저장

사이드바 상태는 `localStorage`에 자동 저장되어 새로고침 후에도 유지됩니다.
- 키: `portal-sidebar-collapsed`
- 값: `'true'` 또는 `'false'`

---

## 5. 반응형 동작

| 화면 크기 | 동작 |
|----------|------|
| 1024px 이상 | 사이드바 펼침 기본, 사용자 설정 유지 |
| 768px - 1023px | 사이드바 자동 접힘 |
| 768px 미만 | 사이드바 자동 접힘 |

---

## 6. CSS Variables

레이아웃 크기는 CSS Variables로 정의되어 있어 필요 시 커스터마이징 가능:

```css
:root {
  --header-height: 60px;
  --sidebar-width: 240px;
  --sidebar-collapsed-width: 60px;
  --footer-height: 30px;
  --tab-bar-height: 40px;
}
```

---

## 7. 테스트 ID

컴포넌트 테스트를 위한 data-testid:

| 요소 | data-testid |
|------|-------------|
| 전체 레이아웃 | `portal-layout` |
| 헤더 | `portal-header` |
| 사이드바 | `portal-sidebar` |
| 사이드바 토글 | `sidebar-toggle` |
| 탭 바 | `tab-bar` |
| 컨텐츠 | `portal-content` |
| 푸터 | `portal-footer` |

---

## 8. 관련 파일

| 파일 | 설명 |
|------|------|
| `components/layout/PortalLayout.tsx` | 메인 레이아웃 컴포넌트 |
| `app/(portal)/layout.tsx` | 포털 라우트 레이아웃 |
| `app/globals.css` | CSS Variables 정의 |
| `lib/theme/index.ts` | 테마 설정 |

---

## 변경 이력

| 버전 | 일자 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0 | 2026-01-20 | Claude | 최초 작성 |
