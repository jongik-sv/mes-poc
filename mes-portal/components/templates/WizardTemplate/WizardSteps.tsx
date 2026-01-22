/**
 * @file WizardSteps.tsx
 * @description WizardTemplate Steps 컴포넌트 래퍼
 * @task TSK-06-06
 *
 * @requirements
 * - FR-001: 단계 표시 (Steps 컴포넌트)
 * - FR-006: 진행 상황 시각화
 *
 * @businessRules
 * - BR-004: 완료된 단계만 Steps 클릭 가능
 */

'use client'

import { Steps } from 'antd'
import type { WizardStep } from './types'

export interface WizardStepsProps {
  steps: WizardStep[]
  currentStep: number
  completedSteps: Set<number>
  /** Steps 방향 (orientation) */
  direction?: 'horizontal' | 'vertical'
  size?: 'default' | 'small'
  type?: 'default' | 'navigation' | 'inline'
  progressDot?: boolean
  allowStepClick?: boolean
  onStepClick?: (step: number) => void
  className?: string
}

export function WizardSteps({
  steps,
  currentStep,
  completedSteps,
  direction = 'horizontal',
  size,
  type,
  progressDot,
  allowStepClick = true,
  onStepClick,
  className,
}: WizardStepsProps) {
  const handleStepChange = (step: number) => {
    // 클릭 비활성화인 경우 무시
    if (!allowStepClick) {
      return
    }

    // 미완료 단계는 클릭 불가 (BR-004)
    // 완료된 단계 또는 현재 단계보다 이전 단계만 클릭 가능
    if (completedSteps.has(step) || step < currentStep) {
      onStepClick?.(step)
    }
  }

  const items = steps.map((step, index) => {
    // 단계 상태 결정
    let status: 'wait' | 'process' | 'finish' | 'error' = 'wait'
    if (index === currentStep) {
      status = 'process'
    } else if (completedSteps.has(index)) {
      status = 'finish'
    }

    return {
      key: step.key,
      title: step.title,
      subTitle: step.subTitle,
      // Ant Design 6.x: description -> content
      content: step.description,
      icon: step.icon,
      status,
      disabled: step.disabled,
    }
  })

  return (
    <div data-testid="wizard-steps" className={className}>
      <Steps
        current={currentStep}
        // Ant Design 6.x: direction -> orientation
        orientation={direction}
        size={size}
        type={type}
        progressDot={progressDot}
        onChange={handleStepChange}
        items={items}
      />
    </div>
  )
}
