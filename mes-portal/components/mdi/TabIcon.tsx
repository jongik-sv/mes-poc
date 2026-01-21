'use client';

/**
 * TabIcon 컴포넌트
 * @description TSK-02-02 탭 바 컴포넌트 - 동적 아이콘 렌더링
 */

import {
  DashboardOutlined,
  FileTextOutlined,
  BarChartOutlined,
  HomeOutlined,
  SettingOutlined,
  UserOutlined,
  TeamOutlined,
  AppstoreOutlined,
  FileOutlined,
  FolderOutlined,
  InboxOutlined,
  ToolOutlined,
  ExperimentOutlined,
  DatabaseOutlined,
  CloudOutlined,
  ShoppingCartOutlined,
  CarOutlined,
  AlertOutlined,
  BellOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import type { ReactNode } from 'react';

/**
 * 아이콘 이름 → 컴포넌트 매핑
 */
const iconMap: Record<string, ReactNode> = {
  DashboardOutlined: <DashboardOutlined />,
  FileTextOutlined: <FileTextOutlined />,
  BarChartOutlined: <BarChartOutlined />,
  HomeOutlined: <HomeOutlined />,
  SettingOutlined: <SettingOutlined />,
  UserOutlined: <UserOutlined />,
  TeamOutlined: <TeamOutlined />,
  AppstoreOutlined: <AppstoreOutlined />,
  FileOutlined: <FileOutlined />,
  FolderOutlined: <FolderOutlined />,
  InboxOutlined: <InboxOutlined />,
  ToolOutlined: <ToolOutlined />,
  ExperimentOutlined: <ExperimentOutlined />,
  DatabaseOutlined: <DatabaseOutlined />,
  CloudOutlined: <CloudOutlined />,
  ShoppingCartOutlined: <ShoppingCartOutlined />,
  CarOutlined: <CarOutlined />,
  AlertOutlined: <AlertOutlined />,
  BellOutlined: <BellOutlined />,
  CalendarOutlined: <CalendarOutlined />,
};

export interface TabIconProps {
  /** 아이콘 이름 (Ant Design 아이콘명) */
  name: string;
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 동적 아이콘 렌더링 컴포넌트
 */
export function TabIcon({ name, className }: TabIconProps) {
  const icon = iconMap[name];

  if (!icon) {
    // 기본 아이콘 (매핑되지 않은 경우)
    return <FileOutlined className={className} />;
  }

  return <span className={className}>{icon}</span>;
}
