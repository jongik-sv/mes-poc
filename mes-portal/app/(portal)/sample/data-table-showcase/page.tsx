// app/(portal)/sample/data-table-showcase/page.tsx
// 데이터 테이블 종합 샘플 페이지 (TSK-06-20)

import { DataTableShowcase } from '@/screens/sample/DataTableShowcase'

export const metadata = {
  title: '데이터 테이블 종합 | MES Portal',
  description: '12개 테이블 기능을 모두 보여주는 종합 샘플',
}

export default function DataTableShowcasePage() {
  return <DataTableShowcase />
}
