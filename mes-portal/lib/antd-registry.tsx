// lib/antd-registry.tsx
// Ant Design SSR 레지스트리 - SSR 시 스타일 플래시 방지
'use client'

import { createCache, extractStyle, StyleProvider } from '@ant-design/cssinjs'
import type Entity from '@ant-design/cssinjs/es/Cache'
import { useServerInsertedHTML } from 'next/navigation'
import { useMemo, useRef } from 'react'

export function AntdRegistry({ children }: React.PropsWithChildren) {
  const cache = useMemo<Entity>(() => createCache(), [])
  const isServerInserted = useRef<boolean>(false)

  useServerInsertedHTML(() => {
    // 서버에서 이미 삽입된 경우 중복 삽입 방지
    if (isServerInserted.current) {
      return
    }
    isServerInserted.current = true
    return (
      <style
        id="antd"
        dangerouslySetInnerHTML={{ __html: extractStyle(cache, true) }}
      />
    )
  })

  return <StyleProvider cache={cache}>{children}</StyleProvider>
}
