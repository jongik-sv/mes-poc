// components/layout/MenuIcon.tsx
// 메뉴 아이콘 컴포넌트

import type { ReactNode } from 'react'
import {
  DashboardOutlined,
  BuildOutlined,
  CheckCircleOutlined,
  ToolOutlined,
  SettingOutlined,
  UserOutlined,
  ControlOutlined,
  FileTextOutlined,
  LineChartOutlined,
  EditOutlined,
  SearchOutlined,
  WarningOutlined,
  DesktopOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  MenuOutlined,
  DatabaseOutlined,
  AppstoreOutlined,
  BarChartOutlined,
  FolderOutlined,
  HistoryOutlined,
  UnorderedListOutlined,
  SplitCellsOutlined,
  FundProjectionScreenOutlined,
  HomeOutlined,
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
  CloseOutlined,
  CheckOutlined,
  InfoCircleOutlined,
  QuestionCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons'

// 아이콘 매핑
const iconMap: Record<string, ReactNode> = {
  DashboardOutlined: <DashboardOutlined />,
  BuildOutlined: <BuildOutlined />,
  CheckCircleOutlined: <CheckCircleOutlined />,
  ToolOutlined: <ToolOutlined />,
  SettingOutlined: <SettingOutlined />,
  UserOutlined: <UserOutlined />,
  ControlOutlined: <ControlOutlined />,
  FileTextOutlined: <FileTextOutlined />,
  LineChartOutlined: <LineChartOutlined />,
  EditOutlined: <EditOutlined />,
  SearchOutlined: <SearchOutlined />,
  WarningOutlined: <WarningOutlined />,
  DesktopOutlined: <DesktopOutlined />,
  TeamOutlined: <TeamOutlined />,
  SafetyCertificateOutlined: <SafetyCertificateOutlined />,
  MenuOutlined: <MenuOutlined />,
  DatabaseOutlined: <DatabaseOutlined />,
  AppstoreOutlined: <AppstoreOutlined />,
  BarChartOutlined: <BarChartOutlined />,
  FolderOutlined: <FolderOutlined />,
  HistoryOutlined: <HistoryOutlined />,
  UnorderedListOutlined: <UnorderedListOutlined />,
  SplitCellsOutlined: <SplitCellsOutlined />,
  FundProjectionScreenOutlined: <FundProjectionScreenOutlined />,
  HomeOutlined: <HomeOutlined />,
  PlusOutlined: <PlusOutlined />,
  DeleteOutlined: <DeleteOutlined />,
  SaveOutlined: <SaveOutlined />,
  CloseOutlined: <CloseOutlined />,
  CheckOutlined: <CheckOutlined />,
  InfoCircleOutlined: <InfoCircleOutlined />,
  QuestionCircleOutlined: <QuestionCircleOutlined />,
  ExclamationCircleOutlined: <ExclamationCircleOutlined />,
}

export interface MenuIconProps {
  iconName?: string
  className?: string
}

/**
 * 아이콘 이름으로 Ant Design 아이콘 컴포넌트 반환
 */
export function MenuIcon({ iconName, className }: MenuIconProps) {
  if (!iconName) {
    return <AppstoreOutlined className={className} />
  }

  const icon = iconMap[iconName]
  if (!icon) {
    return <AppstoreOutlined className={className} />
  }

  return <span className={className}>{icon}</span>
}
