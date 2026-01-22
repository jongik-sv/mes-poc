// app/(portal)/sample/organization-tree/page.tsx
// 조직/부서 트리 샘플 페이지 (TSK-06-13)

'use client'

import { OrganizationTree } from '@/screens/sample/OrganizationTree'

export default function OrganizationTreePage() {
  return (
    <div className="h-full p-4">
      <h1 className="mb-4 text-xl font-semibold">조직/부서 트리</h1>
      <OrganizationTree />
    </div>
  )
}
