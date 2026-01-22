/**
 * @file WizardNavigation.tsx
 * @description WizardTemplate 네비게이션 버튼 컴포넌트
 * @task TSK-06-06
 *
 * @requirements
 * - FR-002: 이전/다음 네비게이션
 * - FR-005: 완료 처리
 *
 * @businessRules
 * - BR-002: 첫 단계에서 이전 버튼 비활성화
 * - BR-006: 완료 버튼은 마지막 단계에서만 표시
 * - BR-007: 완료 처리 중 중복 클릭 방지
 */

'use client'

import type { ReactNode } from 'react'
import { Button, Space } from 'antd'

export interface WizardNavigationProps {
  currentStep: number
  totalSteps: number
  loading?: boolean
  isFinishing?: boolean
  showCancel?: boolean
  showPrev?: boolean
  prevButtonText?: string
  nextButtonText?: string
  finishButtonText?: string
  cancelButtonText?: string
  extraButtons?: ReactNode
  onPrev: () => void
  onNext: () => void
  onFinish: () => void
  onCancel?: () => void
}

export function WizardNavigation({
  currentStep,
  totalSteps,
  loading = false,
  isFinishing = false,
  showCancel = true,
  showPrev = true,
  prevButtonText = '이전',
  nextButtonText = '다음',
  finishButtonText = '완료',
  cancelButtonText = '취소',
  extraButtons,
  onPrev,
  onNext,
  onFinish,
  onCancel,
}: WizardNavigationProps) {
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === totalSteps - 1
  const isProcessing = loading || isFinishing

  return (
    <div
      data-testid="wizard-navigation"
      className="flex justify-between items-center pt-4 border-t border-gray-200"
    >
      {/* 왼쪽: 취소 버튼 */}
      <div>
        {showCancel && onCancel && (
          <Button
            data-testid="wizard-cancel-btn"
            onClick={onCancel}
            disabled={isProcessing}
            type="button"
          >
            {cancelButtonText}
          </Button>
        )}
      </div>

      {/* 오른쪽: 이전/다음/완료 버튼 */}
      <Space>
        {/* 추가 버튼 */}
        {extraButtons}

        {/* 이전 버튼 (첫 단계에서는 비활성화 또는 숨김) */}
        {showPrev && !isFirstStep && (
          <Button
            data-testid="wizard-prev-btn"
            onClick={onPrev}
            disabled={isProcessing}
            type="button"
          >
            {prevButtonText}
          </Button>
        )}

        {/* 다음 버튼 (마지막 단계가 아닐 때) */}
        {!isLastStep && (
          <Button
            data-testid="wizard-next-btn"
            type="primary"
            onClick={onNext}
            disabled={isProcessing}
          >
            {nextButtonText}
          </Button>
        )}

        {/* 완료 버튼 (마지막 단계에서만) */}
        {isLastStep && (
          <Button
            data-testid="wizard-finish-btn"
            type="primary"
            onClick={onFinish}
            loading={isProcessing}
            disabled={isProcessing}
          >
            {finishButtonText}
          </Button>
        )}
      </Space>
    </div>
  )
}
