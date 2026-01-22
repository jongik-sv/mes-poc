/**
 * @file WizardTemplate.tsx
 * @description WizardTemplate 메인 컴포넌트
 * @task TSK-06-06
 *
 * @requirements
 * - FR-001: 단계 표시 (Steps 컴포넌트)
 * - FR-002: 이전/다음 네비게이션
 * - FR-003: 단계별 유효성 검사
 * - FR-004: 최종 확인 화면
 * - FR-005: 완료 처리
 * - FR-006: 진행 상황 시각화
 *
 * @businessRules
 * - BR-001: 단계별 순차 진행 필수
 * - BR-002: 다음 이동 전 유효성 검사 필수
 * - BR-003: 이전 단계 이동은 항상 허용
 * - BR-004: 완료된 단계만 Steps 클릭 가능
 * - BR-005: 데이터 있을 때 이탈 확인 필수
 * - BR-006: 완료 버튼은 마지막 단계에서만 표시
 * - BR-007: 완료 처리 중 중복 클릭 방지
 * - BR-008: 단계 간 데이터는 유지
 *
 * @example
 * ```tsx
 * <WizardTemplate
 *   title="설정 마법사"
 *   steps={[
 *     { key: 'basic', title: '기본정보', content: <BasicForm /> },
 *     { key: 'detail', title: '상세설정', content: <DetailForm /> },
 *   ]}
 *   onFinish={handleFinish}
 *   onCancel={() => router.back()}
 * />
 * ```
 */

'use client'

import { useCallback, useState, useEffect, useMemo } from 'react'
import { Card, Modal, Result } from 'antd'
import { WizardSteps } from './WizardSteps'
import { WizardContent } from './WizardContent'
import { WizardNavigation } from './WizardNavigation'
import type { WizardTemplateProps, WizardStep, WizardContextValue } from './types'

export function WizardTemplate<T extends Record<string, unknown> = Record<string, unknown>>({
  // 단계 정의
  steps: userSteps,
  initialStep = 0,
  initialData,

  // Steps 설정
  direction = 'horizontal',
  size,
  type,
  progressDot,
  allowStepClick = true,

  // 액션
  onFinish,
  onCancel,
  onStepChange,
  onDataChange,

  // 상태
  loading = false,

  // 버튼 텍스트
  prevButtonText = '이전',
  nextButtonText = '다음',
  finishButtonText = '완료',
  cancelButtonText = '취소',
  showCancel = true,
  showPrev = true,
  extraButtons,

  // 이탈 경고
  enableLeaveConfirm = true,
  leaveConfirmMessage = '진행 중인 내용이 저장되지 않습니다. 취소하시겠습니까?',

  // 헤더
  title,
  extra,

  // 확인 단계
  autoConfirmStep = false,
  confirmStepTitle = '확인',
  renderConfirmation,

  // 완료 단계
  autoFinishStep = false,
  finishStepTitle = '완료',
  finishMessage = '완료되었습니다!',
  finishActions,

  // 스타일
  className,
  style,
  stepsClassName,
  contentClassName,
}: WizardTemplateProps<T>) {
  // 상태
  const [currentStep, setCurrentStep] = useState(initialStep)
  const [data, setDataState] = useState<T>((initialData as T) || ({} as T))
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [isFinishing, setIsFinishing] = useState(false)

  // 자동 생성 단계 포함한 전체 단계 목록 구성
  const steps: WizardStep[] = useMemo(() => {
    const result = [...userSteps]

    // 확인 단계 자동 생성
    if (autoConfirmStep) {
      result.push({
        key: '__confirm__',
        title: confirmStepTitle,
        content: (context: WizardContextValue) => {
          if (renderConfirmation) {
            return renderConfirmation(context.data as T)
          }
          return <div data-testid="wizard-confirmation">확인 단계</div>
        },
      })
    }

    // 완료 단계 자동 생성
    if (autoFinishStep) {
      result.push({
        key: '__finish__',
        title: finishStepTitle,
        content: (
          <div data-testid="wizard-result">
            <Result
              status="success"
              title={finishMessage}
              extra={finishActions}
            />
          </div>
        ),
      })
    }

    return result
  }, [
    userSteps,
    autoConfirmStep,
    confirmStepTitle,
    renderConfirmation,
    autoFinishStep,
    finishStepTitle,
    finishMessage,
    finishActions,
  ])

  // 초기 단계 이전까지 완료 상태로 설정
  useEffect(() => {
    if (initialStep > 0) {
      const completed = new Set<number>()
      for (let i = 0; i < initialStep; i++) {
        completed.add(i)
      }
      setCompletedSteps(completed)
    }
  }, [initialStep])

  // 데이터 변경 핸들러
  const setData = useCallback(
    (newData: Partial<T>) => {
      setDataState((prev) => {
        const updated = { ...prev, ...newData }
        onDataChange?.(updated as T)
        return updated as T
      })
    },
    [onDataChange]
  )

  const getStepData = useCallback(
    (stepKey: string) => {
      return data[stepKey as keyof T]
    },
    [data]
  )

  const setStepData = useCallback(
    (stepKey: string, stepData: unknown) => {
      setDataState((prev) => {
        const updated = { ...prev, [stepKey]: stepData }
        onDataChange?.(updated as T)
        return updated as T
      })
    },
    [onDataChange]
  )

  // 다음 단계 이동 핸들러
  const handleNext = useCallback(async () => {
    const step = steps[currentStep]

    // 유효성 검사 실행
    if (step.validate) {
      const isValid = await step.validate()
      if (!isValid) {
        return
      }
    }

    // 현재 단계를 완료 상태로 표시
    setCompletedSteps((prev) => new Set([...prev, currentStep]))

    // 다음 단계로 이동
    const nextStep = Math.min(currentStep + 1, steps.length - 1)
    if (nextStep !== currentStep) {
      onStepChange?.(nextStep, currentStep)
      setCurrentStep(nextStep)
    }
  }, [currentStep, steps, onStepChange])

  // 이전 단계 이동 핸들러
  const handlePrev = useCallback(() => {
    const prevStep = Math.max(currentStep - 1, 0)
    if (prevStep !== currentStep) {
      onStepChange?.(prevStep, currentStep)
      setCurrentStep(prevStep)
    }
  }, [currentStep, onStepChange])

  // 특정 단계로 이동 핸들러
  const handleGoTo = useCallback(
    (step: number) => {
      // 완료된 단계 또는 현재 단계보다 이전 단계만 이동 가능
      if (completedSteps.has(step) || step < currentStep) {
        onStepChange?.(step, currentStep)
        setCurrentStep(step)
      }
    },
    [completedSteps, currentStep, onStepChange]
  )

  // 완료 핸들러
  const handleFinish = useCallback(async () => {
    if (isFinishing) {
      return // 중복 클릭 방지
    }

    setIsFinishing(true)
    try {
      await onFinish(data)
    } catch (error) {
      // 에러 발생 시 로깅만 수행
    } finally {
      setIsFinishing(false)
    }
  }, [data, isFinishing, onFinish])

  // 취소 핸들러
  const handleCancelClick = useCallback(() => {
    if (!onCancel) return

    // 이탈 경고가 활성화되어 있고 데이터가 있는 경우
    const hasData = Object.keys(data).length > 0

    if (enableLeaveConfirm && hasData) {
      Modal.confirm({
        title: '취소 확인',
        content: leaveConfirmMessage,
        okText: '확인',
        cancelText: '취소',
        onOk: () => {
          onCancel()
        },
      })
    } else {
      onCancel()
    }
  }, [onCancel, enableLeaveConfirm, leaveConfirmMessage, data])

  // Context 값 생성 (모든 핸들러 정의 후)
  const contextValue = useMemo<WizardContextValue<T>>(
    () => ({
      data,
      setData,
      getStepData,
      setStepData,
      currentStep,
      totalSteps: steps.length,
      completedSteps,
      goNext: handleNext,
      goPrev: handlePrev,
      goTo: handleGoTo,
      cancel: handleCancelClick,
      registerStepForm: () => {},
      unregisterStepForm: () => {},
      isFinishing,
    }),
    [
      data,
      setData,
      getStepData,
      setStepData,
      currentStep,
      steps.length,
      completedSteps,
      handleNext,
      handlePrev,
      handleGoTo,
      handleCancelClick,
      isFinishing,
    ]
  )

  // 페이지 이탈 경고 (beforeunload)
  useEffect(() => {
    if (!enableLeaveConfirm) return

    const hasData = Object.keys(data).length > 0
    if (!hasData) return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
      return ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [enableLeaveConfirm, data])

  return (
    <div
      data-testid="wizard-template-container"
      className={className}
      style={style}
    >
      <Card
        title={title}
        extra={extra}
      >
        {/* Steps 영역 */}
        <WizardSteps
          steps={steps}
          currentStep={currentStep}
          completedSteps={completedSteps}
          direction={direction}
          size={size}
          type={type}
          progressDot={progressDot}
          allowStepClick={allowStepClick}
          onStepClick={handleGoTo}
          className={stepsClassName}
        />

        {/* 콘텐츠 영역 */}
        <div className="py-6">
          <WizardContent
            steps={steps}
            currentStep={currentStep}
            context={contextValue}
            className={contentClassName}
          />
        </div>

        {/* 네비게이션 버튼 영역 */}
        <WizardNavigation
          currentStep={currentStep}
          totalSteps={steps.length}
          loading={loading}
          isFinishing={isFinishing}
          showCancel={showCancel}
          showPrev={showPrev}
          prevButtonText={prevButtonText}
          nextButtonText={nextButtonText}
          finishButtonText={finishButtonText}
          cancelButtonText={cancelButtonText}
          extraButtons={extraButtons}
          onPrev={handlePrev}
          onNext={handleNext}
          onFinish={handleFinish}
          onCancel={onCancel ? handleCancelClick : undefined}
        />
      </Card>
    </div>
  )
}

export default WizardTemplate
