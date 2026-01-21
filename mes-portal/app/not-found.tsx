// app/not-found.tsx
// Next.js 404 페이지 (TSK-05-01)

import { ErrorPage } from '@/components/common/ErrorPage'

export default function NotFound() {
  return <ErrorPage status={404} />
}
