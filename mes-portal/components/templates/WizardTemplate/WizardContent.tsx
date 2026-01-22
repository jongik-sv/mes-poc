/**
 * @file WizardContent.tsx
 * @description WizardTemplate 콘텐츠 영역 컴포넌트
 * @task TSK-06-06
 *
 * @requirements
 * - FR-001: 단계별 콘텐츠 표시
 * - FR-004: 최종 확인 화면
 */

'use client'

import type { ReactNode } from 'react'
import type { WizardStep, WizardContextValue } from './types'

export interface WizardContentProps<T extends Record<string, unknown> = Record<string, unknown>> {
  steps: WizardStep[]
  currentStep: number
  context: WizardContextValue<T>
  className?: string
}

export function WizardContent<T extends Record<string, unknown> = Record<string, unknown>>({
  steps,
  currentStep,
  context,
  className,
}: WizardContentProps<T>) {
  const step = steps[currentStep]

  if (!step) {
    return null
  }

  // content가 함수인 경우 context를 전달하여 호출
  const content: ReactNode =
    typeof step.content === 'function'
      ? step.content(context as WizardContextValue<Record<string, unknown>>)
      : step.content

  return (
    <div data-testid="wizard-content" className={className}>
      {content}
    </div>
  )
}
