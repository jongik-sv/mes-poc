/**
 * @file WizardNavigation.tsx
 * @description 설정 마법사 네비게이션 컴포넌트
 * @task TSK-06-09
 *
 * @requirements
 * - FR-007: 이전/다음 네비게이션
 * - FR-008: 마법사 취소
 *
 * @testIds
 * - wizard-prev-btn: 이전 버튼
 * - wizard-next-btn: 다음 버튼
 * - wizard-finish-btn: 완료 버튼
 * - wizard-cancel-btn: 취소 버튼
 */

'use client'

import { Button, Space, Modal } from 'antd'
import { useCallback, useState } from 'react'

interface WizardNavigationProps {
  currentStep: number
  totalSteps: number
  isLoading?: boolean
  isCompleted?: boolean
  hasUnsavedData?: boolean
  onPrev: () => void
  onNext: () => void
  onFinish: () => void
  onCancel: () => void
}

// 단계 상수
const STEP_BASIC_INFO = 0
const STEP_CONFIRMATION = 2

export function WizardNavigation({
  currentStep,
  isLoading = false,
  isCompleted = false,
  hasUnsavedData = false,
  onPrev,
  onNext,
  onFinish,
  onCancel,
}: WizardNavigationProps) {
  const [hasInteracted, setHasInteracted] = useState(false)

  // 외부에서 전달된 hasUnsavedData 또는 내부 hasInteracted 플래그 사용
  const shouldConfirmCancel = hasUnsavedData || hasInteracted

  const isFirstStep = currentStep === STEP_BASIC_INFO
  const isConfirmationStep = currentStep === STEP_CONFIRMATION

  // 취소 핸들러 (이탈 확인)
  const handleCancel = useCallback(() => {
    if (shouldConfirmCancel && !isCompleted) {
      Modal.confirm({
        title: '취소 확인',
        content: '진행 중인 내용이 저장되지 않습니다. 취소하시겠습니까?',
        okText: '확인',
        cancelText: '취소',
        onOk: () => {
          onCancel()
        },
      })
    } else {
      onCancel()
    }
  }, [shouldConfirmCancel, isCompleted, onCancel])

  // 다음/완료 클릭 시 상호작용 플래그 설정
  const handleNext = useCallback(() => {
    setHasInteracted(true)
    onNext()
  }, [onNext])

  const handleFinish = useCallback(() => {
    setHasInteracted(true)
    onFinish()
  }, [onFinish])

  return (
    <div className="flex justify-between items-center pt-4 border-t border-gray-200 mt-4">
      {/* 왼쪽: 취소 버튼 */}
      <div>
        <Button
          data-testid="wizard-cancel-btn"
          onClick={handleCancel}
          disabled={isLoading}
        >
          취소
        </Button>
      </div>

      {/* 오른쪽: 이전/다음/완료 버튼 */}
      <Space>
        {/* 이전 버튼 (첫 단계가 아닐 때) */}
        {!isFirstStep && (
          <Button
            data-testid="wizard-prev-btn"
            onClick={onPrev}
            disabled={isLoading}
          >
            이전
          </Button>
        )}

        {/* 다음 버튼 (확인 단계가 아닐 때) */}
        {!isConfirmationStep && (
          <Button
            data-testid="wizard-next-btn"
            type="primary"
            onClick={handleNext}
            disabled={isLoading}
          >
            다음
          </Button>
        )}

        {/* 완료 버튼 (확인 단계에서만) */}
        {isConfirmationStep && (
          <Button
            data-testid="wizard-finish-btn"
            type="primary"
            onClick={handleFinish}
            loading={isLoading}
            disabled={isLoading}
          >
            완료
          </Button>
        )}
      </Space>
    </div>
  )
}

export default WizardNavigation
