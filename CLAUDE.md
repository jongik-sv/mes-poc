# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 무조건 지켜야하는 기본 규칙
- 한국어로 대답해.
- PRD, TRD, WBS를 만들때 AskUserQuestion 도구로 애매한 것이 있을 때 즉시 유저에게 질문을 할 것
<!-- - 화면 작업에는 vercel-react-best-practices, web-design-guidelines 스킬 사용 -->
- UI 작업은 ui-ux-pro-max 스킬(Claude Code)을 반드시 사용, 스킬이 없으면 ui-ux-pro-max 명령어를 사용한다.
- 코드 작업은 반드시 context7 mcp로 정합성을 확인 작업한다.
- 특별한 지시가 없으면 코드는 TDD로 개발한다.

## 프로젝트 구조

```
mes-poc/
├── mes-portal/              # Next.js 16 MES 포털 애플리케이션
│   ├── app/                 # Next.js App Router
│   │   ├── (portal)/       # 포털 메인 라우트 그룹
│   │   └── globals.css     # 전역 CSS Variables + TailwindCSS
│   ├── components/         # 공유 컴포넌트
│   │   ├── layout/        # 레이아웃 (Header, Sidebar, Footer)
│   │   └── providers/     # ThemeProvider 등
│   └── lib/               # 유틸리티 및 설정
│       ├── theme/         # Ant Design 테마 중앙 관리
│       └── antd-registry.tsx  # Ant Design SSR 레지스트리
└── .orchay/                 # 프로젝트 관리 시스템
    └── projects/mes-portal/
        ├── prd.md          # 제품 요구사항 정의서
        ├── trd.md          # 기술 요구사항 정의서
        ├── wbs.yaml        # 작업 분류 체계
        └── tasks/          # Task별 설계/구현 문서
```

## 명령어

### mes-portal 디렉토리에서 실행

```bash
# 개발 서버
pnpm dev

# 빌드
pnpm build

# 린트
pnpm lint

# 테스트 실행
pnpm test              # watch 모드
pnpm test:run          # 단일 실행
pnpm test:coverage     # 커버리지 포함

# 단일 테스트 파일 실행
pnpm test components/layout/__tests__/PortalLayout.test.tsx
```

## 기술 스택 (TRD 기준)

- **프레임워크**: Next.js 16.x (App Router), React 19.x, TypeScript 5.x
- **UI**: Ant Design 6.x, TailwindCSS 4.x, @ant-design/icons
- **테마**: next-themes (라이트/다크 모드)
- **테스트**: Vitest, @testing-library/react
- **패키지 매니저**: pnpm

## 스타일링 규칙 (TRD 섹션 1.5)

### 적용 우선순위

1. Ant Design Token (`ConfigProvider theme={{ token }}`)
2. CSS Variables (`var(--header-height)` 등)
3. TailwindCSS (간격/정렬/플렉스 보조용)
4. Ant Design 컴포넌트 props

### 금지 사항

- 개별 컴포넌트 CSS 파일 생성 금지
- 인라인 style 속성 사용 금지
- 하드코딩된 색상/크기 금지 → Token 또는 CSS Variable 사용
- !important 사용 금지

## wf 워크플로우 (`.claude/commands/wf/`)

Task 작업 시 `/wf:*` 명령어를 사용하여 표준화된 개발 프로세스 진행:

```
[  ] Todo → [dd] 상세설계 → [ap] 승인 → [im] 구현 → [vf] 검증 → [xx] 완료
```

## AI 코딩 가이드라인 (TRD 섹션 4)

### 권장

- Ant Design 컴포넌트 우선 사용 (Table, Form, Modal, Menu, Tabs, Tree 등)
- Server Components 활용, 필요 시에만 'use client'
- `@/components`, `@/lib` 등 경로 별칭 사용

### 금지

- `any` 타입 사용 금지
- `console.log` 프로덕션 코드 포함 금지
- 하드코딩된 문자열/숫자 금지

<!-- ## 테스트 트러블슈팅

### React 19 테스트 프로세스 미종료 문제

**원인:** Jest의 jsdom에 `setImmediate`가 없어서 React scheduler가 `MessageChannel` 사용 → 프로세스 미종료

**해결:** Vitest 사용 + setup 파일 최상단에 폴리필 추가

```typescript
// vitest.setup.ts (반드시 최상단)
import { setImmediate, clearImmediate } from "timers";
globalThis.setImmediate = setImmediate;
globalThis.clearImmediate = clearImmediate;
``` -->

참고: [React #26608](https://github.com/facebook/react/issues/26608)
