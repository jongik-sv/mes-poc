/**
 * Placeholder Screen
 * @description 아직 구현되지 않은 화면용 플레이스홀더
 */

'use client';

import { Result, Button } from 'antd';
import { ToolOutlined } from '@ant-design/icons';

interface PlaceholderScreenProps {
  title: string;
  description?: string;
}

export default function PlaceholderScreen({
  title,
  description = '해당 기능은 현재 개발 중입니다.',
}: PlaceholderScreenProps) {
  return (
    <div className="h-full flex items-center justify-center" data-testid="placeholder-screen">
      <Result
        icon={<ToolOutlined style={{ color: '#1890ff' }} />}
        title={title}
        subTitle={description}
        extra={
          <Button type="primary" disabled>
            준비 중
          </Button>
        }
      />
    </div>
  );
}

// 각 메뉴별 Placeholder 컴포넌트들
export function WorkOrderScreen() {
  return <PlaceholderScreen title="작업 지시" />;
}

export function ProductionStatusScreen() {
  return <PlaceholderScreen title="생산 현황" />;
}

export function ProductionResultScreen() {
  return <PlaceholderScreen title="실적 입력" />;
}

export function InspectionScreen() {
  return <PlaceholderScreen title="검사 관리" />;
}

export function DefectScreen() {
  return <PlaceholderScreen title="불량 관리" />;
}

export function EquipmentStatusScreen() {
  return <PlaceholderScreen title="설비 현황" />;
}

export function MaintenanceScreen() {
  return <PlaceholderScreen title="유지보수" />;
}

export function UserListScreen() {
  return <PlaceholderScreen title="사용자 관리" />;
}

export function RoleScreen() {
  return <PlaceholderScreen title="역할 관리" />;
}

export function MenuManageScreen() {
  return <PlaceholderScreen title="메뉴 관리" />;
}

export function CodeManageScreen() {
  return <PlaceholderScreen title="코드 관리" />;
}

export function SettingWizardScreen() {
  return <PlaceholderScreen title="설정 마법사" description="설정 마법사 화면은 현재 개발 중입니다." />;
}
