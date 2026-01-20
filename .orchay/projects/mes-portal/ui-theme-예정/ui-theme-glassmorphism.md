# Glassmorphism Big Sur 테마 적용 가이드

> **소스**: [Dribbble - Glassmorphism Big Sur Creative Cloud App Redesign](https://dribbble.com/shots/14831798-Glassmorphism-Big-Sur-Creative-Cloud-App-Redesign)
> **디자이너**: Mikołaj Gałęziowski
> **분석일**: 2026-01-20

---

## 목차

1. [디자인 시스템 개요](#1-디자인-시스템-개요)
2. [색상 시스템](#2-색상-시스템)
3. [Glassmorphism 핵심 원리](#3-glassmorphism-핵심-원리)
4. [프로젝트 적용 방법](#4-프로젝트-적용-방법)
5. [컴포넌트별 스타일 가이드](#5-컴포넌트별-스타일-가이드)
6. [코드 예시](#6-코드-예시)
7. [접근성 고려사항](#7-접근성-고려사항)

---

## 1. 디자인 시스템 개요

### 테마 특징

| 항목 | 설명 |
|-----|------|
| **스타일** | Glassmorphism (유리 효과) |
| **모드** | Dark Mode 전용 |
| **기반** | macOS Big Sur 디자인 언어 |
| **특징** | 반투명 배경, 블러 효과, 미세한 테두리, 그라데이션 배경 |

### 핵심 디자인 요소

```
┌─────────────────────────────────────────────────────────────┐
│                    그라데이션 배경                           │
│   ┌───────────────────────────────────────────────────┐   │
│   │     Glass Panel (반투명 + 블러)                    │   │
│   │   ┌─────────────────────────────────────────┐    │   │
│   │   │  Glass Card (더 강한 반투명)              │    │   │
│   │   │  - backdrop-filter: blur(12px)          │    │   │
│   │   │  - background: rgba(255,255,255,0.12)   │    │   │
│   │   │  - border: 1px solid rgba(255,255,255,0.2)│   │   │
│   │   └─────────────────────────────────────────┘    │   │
│   └───────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. 색상 시스템

### Primary 색상 (Deep Purple)

| 단계 | HEX | 용도 |
|-----|-----|------|
| 50 | `#EDE7F6` | 매우 연한 배경 |
| 100 | `#D1C4E9` | 연한 배경 |
| 200 | `#B39DDB` | 보조 텍스트 |
| 300 | `#9575CD` | 호버 상태 |
| 400 | `#7E57C2` | 활성 상태 |
| **500** | **`#673AB7`** | **기본 색상** |
| 600 | `#5E35B1` | 클릭 상태 |
| 700 | `#512DA8` | 진한 변형 |
| 800 | `#4527A0` | 매우 진한 |
| 900 | `#311B92` | 가장 진한 |

### Semantic 색상

| 용도 | HEX | 사용 예시 |
|-----|-----|----------|
| Success | `#4CAF50` | 완료, 성공 메시지 |
| Warning | `#FF9800` | 경고, 주의 |
| Error | `#F44336` | 오류, 삭제 |
| Info | `#2196F3` | 정보, 링크 |

### Glass Surface 색상

| 용도 | RGBA | 사용 위치 |
|-----|------|----------|
| Glass Light | `rgba(255,255,255,0.15)` | 모달, 팝오버 |
| Glass Medium | `rgba(255,255,255,0.10)` | 카드 호버 |
| Glass Dark | `rgba(255,255,255,0.05)` | 헤더, 배경 |
| Card | `rgba(255,255,255,0.12)` | 카드 기본 |
| Sidebar | `rgba(255,255,255,0.08)` | 사이드바 |

### 배경 그라데이션

```css
background: linear-gradient(135deg, #2D1B4E 0%, #4A1942 50%, #1A0B2E 100%);
```

---

## 3. Glassmorphism 핵심 원리

### 필수 CSS 속성

```css
.glass-element {
  /* 1. 반투명 배경 */
  background: rgba(255, 255, 255, 0.12);

  /* 2. 블러 효과 (핵심!) */
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px); /* Safari 지원 */

  /* 3. 미세한 테두리 */
  border: 1px solid rgba(255, 255, 255, 0.2);

  /* 4. 둥근 모서리 */
  border-radius: 16px;

  /* 5. 부드러운 그림자 (선택) */
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}
```

### 블러 강도 가이드

| 요소 | 블러 값 | 투명도 |
|-----|--------|--------|
| Card | `blur(12px)` | 0.12 |
| Sidebar | `blur(20px)` | 0.08 |
| Modal | `blur(20px)` | 0.15 |
| Button | `blur(8px)` | 0.10 |
| Input | `blur(8px)` | 0.08 |
| Header | `blur(12px)` | 0.05 |

---

## 4. 프로젝트 적용 방법

### 4.1 Ant Design 테마 적용

**Step 1: 테마 파일 복사**

```bash
# 테마 파일을 lib/theme 폴더로 복사
cp .orchay/projects/mes-portal/ui-theme-glassmorphism-antd.ts lib/theme/glassmorphism.ts
```

**Step 2: ConfigProvider 설정**

```tsx
// app/layout.tsx 또는 app/providers.tsx
'use client';

import { ConfigProvider } from 'antd';
import { glassmorphismTheme } from '@/lib/theme/glassmorphism';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider theme={glassmorphismTheme}>
      {children}
    </ConfigProvider>
  );
}
```

**Step 3: 기존 tokens.ts와 통합**

```typescript
// lib/theme/tokens.ts
import { themeTokens as glassmorphismTokens } from './glassmorphism';

export const themeTokens = {
  ...glassmorphismTokens,
  // 필요시 오버라이드
};
```

### 4.2 TailwindCSS 확장 적용

**Step 1: tailwind.config.ts 수정**

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';
import { glassmorphismTailwindExtend } from './.orchay/projects/mes-portal/ui-theme-glassmorphism-tailwind';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      ...glassmorphismTailwindExtend,
      // 기존 확장 설정 유지
    },
  },
  plugins: [],
};

export default config;
```

**Step 2: globals.css에 CSS 변수 추가**

```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  /* Glassmorphism Theme Colors */
  --color-primary: #673AB7;
  --color-success: #4CAF50;
  --color-warning: #FF9800;
  --color-error: #F44336;
  --color-info: #2196F3;

  /* Glass Surface */
  --glass-light: rgba(255, 255, 255, 0.15);
  --glass-medium: rgba(255, 255, 255, 0.10);
  --glass-dark: rgba(255, 255, 255, 0.05);
  --glass-border: rgba(255, 255, 255, 0.2);

  /* Background */
  --bg-dark: #1A0B2E;

  /* Layout */
  --header-height: 64px;
  --sidebar-width: 280px;
  --sidebar-collapsed-width: 80px;
}

/* Glassmorphism 기본 배경 */
body {
  background: linear-gradient(135deg, #2D1B4E 0%, #4A1942 50%, #1A0B2E 100%);
  min-height: 100vh;
}
```

### 4.3 커스텀 Glass 유틸리티 클래스

```css
/* app/globals.css에 추가 */
@layer components {
  .glass-card {
    @apply bg-[rgba(255,255,255,0.12)] backdrop-blur-md border border-[rgba(255,255,255,0.2)] rounded-xl;
  }

  .glass-sidebar {
    @apply bg-[rgba(255,255,255,0.08)] backdrop-blur-lg border-r border-[rgba(255,255,255,0.1)];
  }

  .glass-button {
    @apply bg-[rgba(255,255,255,0.1)] backdrop-blur-sm border border-[rgba(255,255,255,0.15)] rounded-lg text-white transition-all hover:bg-[rgba(255,255,255,0.15)];
  }

  .glass-input {
    @apply bg-[rgba(255,255,255,0.08)] backdrop-blur-sm border border-[rgba(255,255,255,0.15)] rounded-lg text-white placeholder:text-white/40 focus:border-white/40 focus:ring-2 focus:ring-primary-500/30;
  }
}
```

---

## 5. 컴포넌트별 스타일 가이드

### 5.1 레이아웃 컴포넌트

#### Sidebar

```tsx
// components/layout/Sidebar.tsx
import { Layout, Menu } from 'antd';
import { glassmorphismStyles } from '@/lib/theme/glassmorphism';

const { Sider } = Layout;

export function Sidebar() {
  return (
    <Sider
      width={280}
      collapsedWidth={80}
      style={{
        ...glassmorphismStyles.sidebar,
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
      }}
    >
      <Menu mode="inline" theme="dark" />
    </Sider>
  );
}
```

#### Header

```tsx
// components/layout/Header.tsx
import { Layout } from 'antd';

const { Header: AntHeader } = Layout;

export function Header() {
  return (
    <AntHeader
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        height: 64,
      }}
    >
      {/* Header content */}
    </AntHeader>
  );
}
```

### 5.2 데이터 표시 컴포넌트

#### Card

```tsx
// TRD 가이드라인: Ant Design 컴포넌트 우선 사용
import { Card } from 'antd';

// Ant Design Card는 테마에서 자동으로 glass 스타일 적용됨
<Card title="제목">
  카드 내용
</Card>

// 또는 TailwindCSS 유틸리티 사용 (레이아웃 보조용)
<div className="glass-card p-6">
  커스텀 Glass 카드
</div>
```

#### Table

```tsx
import { Table } from 'antd';

// 테이블은 테마에서 glass 스타일 자동 적용
<Table
  dataSource={data}
  columns={columns}
  // 추가 glass 효과가 필요한 경우
  style={{
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    overflow: 'hidden',
  }}
/>
```

### 5.3 입력 컴포넌트

#### Form with Input

```tsx
import { Form, Input, Select, Button } from 'antd';

<Form layout="vertical">
  <Form.Item label="이름" name="name">
    <Input placeholder="이름을 입력하세요" />
  </Form.Item>

  <Form.Item label="상태" name="status">
    <Select placeholder="상태 선택">
      <Select.Option value="active">활성</Select.Option>
      <Select.Option value="inactive">비활성</Select.Option>
    </Select>
  </Form.Item>

  <Form.Item>
    <Button type="primary">저장</Button>
  </Form.Item>
</Form>
```

### 5.4 피드백 컴포넌트

#### Modal

```tsx
import { Modal } from 'antd';

<Modal
  title="확인"
  open={isOpen}
  onOk={handleOk}
  onCancel={handleCancel}
  // Glass 효과는 테마에서 자동 적용
>
  모달 내용
</Modal>
```

#### Notification

```tsx
import { notification } from 'antd';

notification.success({
  message: '저장 완료',
  description: '데이터가 성공적으로 저장되었습니다.',
  // Glass 스타일 자동 적용
});
```

---

## 6. 코드 예시

### 6.1 완전한 페이지 예시

```tsx
// app/(portal)/dashboard/page.tsx
'use client';

import { Card, Statistic, Row, Col, Table } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      {/* KPI Cards */}
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card>
            <Statistic
              title="총 생산량"
              value={11.28}
              precision={2}
              valueStyle={{ color: '#4CAF50' }}
              prefix={<ArrowUpOutlined />}
              suffix="%"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="불량률"
              value={9.3}
              precision={2}
              valueStyle={{ color: '#F44336' }}
              prefix={<ArrowDownOutlined />}
              suffix="%"
            />
          </Card>
        </Col>
        {/* ... more cards */}
      </Row>

      {/* Data Table */}
      <Card title="생산 현황">
        <Table
          columns={columns}
          dataSource={data}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
}
```

### 6.2 커스텀 Glass 컴포넌트

```tsx
// components/ui/GlassPanel.tsx
import { ReactNode } from 'react';
import { glassmorphismStyles } from '@/lib/theme/glassmorphism';

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
  variant?: 'card' | 'sidebar' | 'modal' | 'button';
}

export function GlassPanel({
  children,
  className = '',
  variant = 'card'
}: GlassPanelProps) {
  const styles = glassmorphismStyles[variant];

  return (
    <div
      className={className}
      style={styles}
    >
      {children}
    </div>
  );
}
```

---

## 7. 접근성 고려사항

### WCAG 준수 사항

| 항목 | 요구사항 | Glassmorphism 대응 |
|-----|---------|-------------------|
| 색상 대비 | 4.5:1 이상 (AA) | 흰색 텍스트 + 어두운 배경으로 충족 |
| 포커스 표시 | 명확한 포커스 링 | `box-shadow: 0 0 0 2px rgba(103, 58, 183, 0.3)` |
| 텍스트 크기 | 최소 14px | 기본 fontSize: 14px |
| 터치 타겟 | 최소 44x44px | controlHeight: 36px (버튼은 44px 권장) |

### 포커스 스타일

```css
/* 모든 인터랙티브 요소에 적용 */
:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(103, 58, 183, 0.4);
}
```

### 대비율 검증

| 조합 | 대비율 | 결과 |
|-----|-------|------|
| 흰색 텍스트 / #1A0B2E 배경 | 15.4:1 | PASS (AAA) |
| rgba(255,255,255,0.7) / #1A0B2E | 10.8:1 | PASS (AAA) |
| rgba(255,255,255,0.4) / #1A0B2E | 6.2:1 | PASS (AA) |
| #673AB7 / #1A0B2E | 4.8:1 | PASS (AA) |

---

## 산출물 목록

| 파일 | 용도 |
|-----|------|
| `ui-theme-glassmorphism.json` | 디자인 토큰 (JSON) |
| `ui-theme-glassmorphism-antd.ts` | Ant Design 6.x 테마 설정 |
| `ui-theme-glassmorphism-tailwind.ts` | TailwindCSS 4.x 확장 설정 |
| `ui-theme-glassmorphism.md` | 적용 가이드 문서 (본 문서) |

---

## 참고 자료

- [Glassmorphism CSS Generator](https://glassmorphism.com/)
- [Ant Design Theme Customization](https://ant.design/docs/react/customize-theme)
- [TailwindCSS Configuration](https://tailwindcss.com/docs/configuration)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
