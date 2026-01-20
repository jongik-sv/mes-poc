# TSK-01-01 - 레이아웃 컴포넌트 구조 구현 보고서

## 문서 정보

| 항목 | 내용 |
|------|------|
| Task ID | TSK-01-01 |
| 문서 버전 | 1.0 |
| 작성일 | 2026-01-20 |
| 상태 | 구현완료 |

---

## 1. 구현 개요

### 1.1 구현 범위

- PortalLayout 컴포넌트 생성 및 완성
- CSS Variables 기반 레이아웃 크기 정의
- (portal) 라우트 그룹 및 레이아웃 적용
- Ant Design Layout 컴포넌트 통합
- 반응형 사이드바 동작

### 1.2 구현 결과 요약

| 항목 | 결과 |
|------|------|
| 빌드 | 성공 |
| 타입 체크 | 통과 |
| 레이아웃 렌더링 | 정상 |

---

## 2. 생성/수정된 파일

### 2.1 신규 생성

| 파일 | 설명 |
|------|------|
| `components/layout/PortalLayout.tsx` | 메인 포털 레이아웃 컴포넌트 |
| `app/(portal)/layout.tsx` | 포털 라우트 그룹 레이아웃 |
| `app/(portal)/dashboard/page.tsx` | 대시보드 샘플 페이지 |

### 2.2 수정

| 파일 | 변경 내용 |
|------|----------|
| `app/globals.css` | CSS Variables 추가 (--header-height, --sidebar-width 등) |
| `lib/theme/index.ts` | useThemeConfig 훅 추가 |

---

## 3. 구현 상세

### 3.1 PortalLayout 컴포넌트

**파일 경로:** `components/layout/PortalLayout.tsx`

**주요 기능:**
- Ant Design Layout 컴포넌트 기반 구조
- 헤더 (60px 고정, 상단 fixed)
- 사이드바 (240px ↔ 60px 접이식)
- 컨텐츠 영역 (flex-grow)
- 푸터 (30px 고정)

**구현된 기능:**
- [x] 레이아웃 영역 분리 (Header, Sider, Content, Footer)
- [x] 사이드바 접기/펼치기 토글
- [x] localStorage 기반 사이드바 상태 유지
- [x] 반응형 동작 (768px 미만 자동 접힘)
- [x] 슬롯 기반 컴포넌트 구조 (header, sidebar, tabBar, footer props)

### 3.2 CSS Variables

**파일 경로:** `app/globals.css`

```css
:root {
  --header-height: 60px;
  --sidebar-width: 240px;
  --sidebar-collapsed-width: 60px;
  --footer-height: 30px;
  --tab-bar-height: 40px;
}
```

### 3.3 포털 라우트 구조

```
app/
├── (portal)/
│   ├── layout.tsx      # PortalLayout + ConfigProvider 적용
│   └── dashboard/
│       └── page.tsx    # 대시보드 페이지
```

---

## 4. 통합 검증 결과

### 4.1 파일 존재 확인

- [x] `mes-portal/components/layout/PortalLayout.tsx` 파일 존재
- [x] `mes-portal/app/(portal)/layout.tsx` 파일 존재
- [x] `mes-portal/app/globals.css`에 CSS Variables 정의

### 4.2 컴포넌트 통합 확인

- [x] Ant Design `Layout`, `Layout.Header`, `Layout.Sider`, `Layout.Content`, `Layout.Footer` 사용
- [x] `app/(portal)/layout.tsx`에서 `PortalLayout` import 및 적용
- [x] 사이드바 접기/펼치기 상태 관리 동작

### 4.3 스타일 확인

- [x] CSS Variables `--header-height: 60px` 적용
- [x] CSS Variables `--sidebar-width: 240px` 적용
- [x] CSS Variables `--footer-height: 30px` 적용
- [x] 사이드바 전환 시 애니메이션 동작 (transition: 0.2s)

### 4.4 빌드 검증

```
✓ Compiled successfully
✓ Generating static pages (5/5)

Route (app)
├ ○ /
├ ○ /_not-found
└ ○ /dashboard
```

---

## 5. 테스트 데이터 ID

컴포넌트에 포함된 data-testid:

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

## 6. 후속 작업

| Task ID | 내용 | 의존성 |
|---------|------|--------|
| TSK-01-02 | 헤더 컴포넌트 내부 구현 | TSK-01-01 |
| TSK-01-03 | 사이드바 메뉴 컴포넌트 | TSK-01-01 |
| TSK-01-04 | 푸터 컴포넌트 내부 구현 | TSK-01-01 |
| WP-02 | MDI 탭 바 시스템 | TSK-01-01 |

---

## 변경 이력

| 버전 | 일자 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0 | 2026-01-20 | Claude | 최초 작성 |
