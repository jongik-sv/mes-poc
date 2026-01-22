// app/(portal)/sample/equipment-monitor/page.tsx
// 설비 모니터링 카드뷰 페이지 (TSK-06-10)

import { EquipmentMonitor } from '@/screens/sample/EquipmentMonitor'

export const metadata = {
  title: '설비 모니터링 | MES Portal',
  description: '설비 현황을 카드 형태로 모니터링하는 샘플 화면',
}

export default function EquipmentMonitorPage() {
  return <EquipmentMonitor />
}
