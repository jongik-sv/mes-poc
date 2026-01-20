# TSK-00-02: UI 라이브러리 및 테마 설정 - 기술 설계서

## 1. 개요

### 1.1 목적
MES Portal의 UI 기반을 구축하기 위해 Ant Design 6.x와 TailwindCSS 4.x를 설치하고, 테마 토큰 중앙 관리 구조를 생성하여 일관된 디자인 시스템을 확립한다.

### 1.2 범위
| 항목 | 포함 | 제외 |
|------|------|------|
| Ant Design 6.x 설치 | O | |
| SSR 레지스트리 설정 | O | |
| TailwindCSS 4.x 설치 | O | |
| 테마 토큰 중앙 관리 | O | |
| CSS Variables 설정 | O | |
| 라이트/다크 모드 전환 | O | |
| 커스텀 컴포넌트 개발 | | X |
| 차트 라이브러리 설정 | | X (별도 Task) |

### 1.3 PRD/TRD 참조
- **TRD 1.2**: UI/스타일링 스택 - Ant Design 6.x, TailwindCSS 4.x
- **TRD 1.3**: 디자인 시스템 - 테마 토큰, CSS Variables
- **TRD 1.5**: CSS 중앙 집중 관리 전략

---

## 2. 현재 상태

### 2.1 전제 조건
- TSK-00-01에서 Next.js 16.x + TypeScript 5.x + pnpm 프로젝트 생성 완료
- App Router 기본 구조 설정 완료

### 2.2 현재 구조
```
mes-portal/
├── app/
│   ├── layout.tsx      # 루트 레이아웃 (기본)
│   ├── page.tsx        # 기본 페이지
│   └── globals.css     # 기본 CSS (TailwindCSS 추가 필요)
├── package.json
└── tsconfig.json
```

---

## 3. 목표 상태

### 3.1 디렉토리 구조
```
mes-portal/
├── app/
│   ├── layout.tsx          # 루트 레이아웃 (ThemeProvider 적용)
│   ├── page.tsx            # 기본 페이지
│   └── globals.css         # CSS Variables + TailwindCSS 설정
├── lib/
│   ├── theme/
│   │   ├── index.ts        # 테마 설정 진입점 (export all)
│   │   ├── tokens.ts       # Ant Design Token 정의
│   │   ├── components.ts   # 컴포넌트별 커스텀 토큰
│   │   └── algorithms.ts   # 라이트/다크 알고리즘 설정
│   └── antd-registry.tsx   # Ant Design SSR 레지스트리
├── components/
│   └── providers/
│       └── ThemeProvider.tsx  # 테마 프로바이더 컴포넌트
├── package.json            # 의존성 추가
├── tailwind.config.ts      # TailwindCSS 설정
└── postcss.config.js       # PostCSS 설정
```

### 3.2 핵심 구성 요소

#### 3.2.1 패키지 의존성
```json
{
  "dependencies": {
    "antd": "^6.0.0",
    "@ant-design/icons": "^6.0.0",
    "@ant-design/nextjs-registry": "^1.0.0",
    "next-themes": "^0.4.0"
  },
  "devDependencies": {
    "tailwindcss": "^4.0.0",
    "@tailwindcss/postcss": "^4.0.0"
  }
}
```

#### 3.2.2 테마 토큰 구조 (lib/theme/tokens.ts)
```typescript
export const themeTokens = {
  // 색상 팔레트
  colorPrimary: '#1677ff',
  colorSuccess: '#52c41a',
  colorWarning: '#faad14',
  colorError: '#ff4d4f',
  colorInfo: '#1677ff',

  // 레이아웃
  borderRadius: 6,
  controlHeight: 32,

  // 간격
  marginXS: 8,
  marginSM: 12,
  margin: 16,
  marginMD: 20,
  marginLG: 24,
  marginXL: 32,

  // 폰트
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  fontSize: 14,
  fontSizeLG: 16,
  fontSizeSM: 12,
}
```

#### 3.2.3 CSS Variables (globals.css)
```css
:root {
  /* Ant Design Token과 동기화된 CSS Variables */
  --color-primary: #1677ff;
  --color-success: #52c41a;
  --color-warning: #faad14;
  --color-error: #ff4d4f;

  /* 레이아웃 고정값 */
  --header-height: 60px;
  --sidebar-width: 240px;
  --sidebar-collapsed-width: 60px;
  --footer-height: 30px;
  --tab-bar-height: 40px;
}

[data-theme='dark'] {
  --color-primary: #1677ff;
  --color-success: #52c41a;
  --color-warning: #faad14;
  --color-error: #ff4d4f;
}
```

---

## 4. 구현 계획

### 4.1 단계별 구현

#### Step 1: 패키지 설치
```bash
# Ant Design 및 아이콘
pnpm add antd @ant-design/icons @ant-design/nextjs-registry

# 테마 전환
pnpm add next-themes

# TailwindCSS 4.x
pnpm add -D tailwindcss @tailwindcss/postcss
```

#### Step 2: TailwindCSS 설정
- `postcss.config.js` 생성
- `tailwind.config.ts` 생성
- `globals.css`에 TailwindCSS 디렉티브 추가

#### Step 3: Ant Design SSR 레지스트리 설정
- `lib/antd-registry.tsx` 생성
- `@ant-design/nextjs-registry` 활용
- SSR 시 스타일 플래시 방지

#### Step 4: 테마 토큰 시스템 구축
- `lib/theme/tokens.ts` - 기본 토큰 정의
- `lib/theme/components.ts` - 컴포넌트별 토큰
- `lib/theme/algorithms.ts` - 라이트/다크 알고리즘
- `lib/theme/index.ts` - 통합 내보내기

#### Step 5: ThemeProvider 컴포넌트 생성
- `components/providers/ThemeProvider.tsx`
- next-themes + Ant Design ConfigProvider 통합
- 라이트/다크 모드 전환 지원

#### Step 6: 루트 레이아웃 업데이트
- `app/layout.tsx`에 AntdRegistry, ThemeProvider 적용
- Ant Design 기본 스타일 적용

#### Step 7: 검증 페이지 작성
- 기본 Ant Design 컴포넌트 렌더링 확인 (Button, Input)
- TailwindCSS 유틸리티 클래스 적용 확인
- 테마 전환 버튼으로 라이트/다크 모드 동작 확인

### 4.2 파일별 구현 내용

| 파일 | 역할 | 주요 내용 |
|------|------|----------|
| `postcss.config.js` | PostCSS 설정 | TailwindCSS 플러그인 등록 |
| `tailwind.config.ts` | TailwindCSS 설정 | content 경로, 커스텀 테마 |
| `lib/antd-registry.tsx` | SSR 레지스트리 | Ant Design 스타일 SSR 지원 |
| `lib/theme/tokens.ts` | 테마 토큰 | 색상, 간격, 폰트 정의 |
| `lib/theme/algorithms.ts` | 테마 알고리즘 | 라이트/다크 모드 알고리즘 |
| `lib/theme/components.ts` | 컴포넌트 토큰 | 컴포넌트별 커스텀 스타일 |
| `lib/theme/index.ts` | 테마 진입점 | 모든 테마 설정 내보내기 |
| `components/providers/ThemeProvider.tsx` | 테마 프로바이더 | ConfigProvider + ThemeProvider |
| `app/globals.css` | 전역 CSS | CSS Variables + TailwindCSS |
| `app/layout.tsx` | 루트 레이아웃 | 프로바이더 적용 |

---

## 5. 수용 기준 (Acceptance Criteria)

| # | 기준 | 검증 방법 |
|---|------|----------|
| AC-1 | Ant Design 컴포넌트 렌더링 확인 | Button, Input 컴포넌트가 정상 표시 |
| AC-2 | TailwindCSS 유틸리티 클래스 적용 확인 | `flex`, `gap-4` 등 클래스 동작 |
| AC-3 | 라이트/다크 모드 전환 동작 | 테마 버튼 클릭 시 모드 전환 |
| AC-4 | SSR 시 스타일 플래시 없음 | 페이지 새로고침 시 FOUC 없음 |

---

## 6. 통합 검사 항목 (Integration Checklist)

| # | 검사 항목 | 예상 위치 |
|---|----------|----------|
| IC-1 | lib/theme/tokens.ts 파일 존재 및 토큰 정의 | `lib/theme/tokens.ts` |
| IC-2 | lib/theme/index.ts 내보내기 확인 | `lib/theme/index.ts` |
| IC-3 | lib/antd-registry.tsx SSR 레지스트리 설정 | `lib/antd-registry.tsx` |
| IC-4 | app/globals.css CSS Variables 정의 | `app/globals.css` |
| IC-5 | ConfigProvider로 테마 적용 확인 | `components/providers/ThemeProvider.tsx` |

---

## 7. 기술 스택 상세

| 기술 | 버전 | 용도 |
|------|------|------|
| Ant Design | 6.x | UI 컴포넌트 라이브러리 |
| @ant-design/icons | 6.x | 아이콘 |
| @ant-design/nextjs-registry | 1.x | SSR 스타일 레지스트리 |
| TailwindCSS | 4.x | 유틸리티 CSS 프레임워크 |
| next-themes | 0.4.x | 테마 전환 지원 |

---

## 8. 위험 요소 및 대응

| 위험 | 영향 | 대응 방안 |
|------|------|----------|
| Ant Design 6.x + React 19 호환성 | 중 | Ant Design 6.0 공식 지원 확인됨 |
| TailwindCSS 4.x 신규 버전 이슈 | 중 | PostCSS 플러그인 방식 사용 |
| SSR 스타일 플래시 | 고 | @ant-design/nextjs-registry 필수 사용 |
| 다크 모드 토큰 불일치 | 저 | CSS Variables와 Ant Design Token 동기화 |

---

## 변경 이력

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0 | 2026-01-20 | AI | 초안 작성 |
