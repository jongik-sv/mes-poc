// app/(portal)/sample/material-history/page.tsx
// 자재 입출고 내역 페이지 (TSK-06-17)

import { MaterialHistoryScreen } from '@/screens/sample/MaterialHistory'

export const metadata = {
  title: '자재 입출고 내역 | MES Portal',
  description: '자재 입출고 내역 조회 및 관리',
}

export default function MaterialHistoryPage() {
  return <MaterialHistoryScreen />
}
