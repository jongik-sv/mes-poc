/**
 * @file index.tsx
 * @description 설정 마법사 샘플 메인 컴포넌트
 * @task TSK-06-09
 *
 * @requirements
 * - FR-001: 기본정보 입력 (Step 1)
 * - FR-002: 상세설정 입력 (Step 2)
 * - FR-003: 확인 화면 (Step 3)
 * - FR-004: 완료 화면 (Step 4)
 * - FR-005: 4단계 순차 진행
 * - FR-006: 단계별 유효성 검사
 * - FR-007: 이전/다음 네비게이션
 * - FR-008: 마법사 취소
 *
 * @businessRules
 * - BR-001: 단계별 순차 진행 필수
 * - BR-002: 다음 이동 전 유효성 검사 필수
 * - BR-003: 이전 단계 데이터 유지
 * - BR-004: 완료된 단계만 Steps 클릭 가능
 * - BR-005: 입력 데이터 있을 때 이탈 확인
 *
 * @testIds
 * - setting-wizard-page: 페이지 컨테이너
 */

'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { Form, message, Card, Steps } from 'antd'
import { useRouter } from 'next/navigation'
import { useMDI } from '@/lib/mdi/context'
import { BasicInfoStep } from './BasicInfoStep'
import { DetailSettingsStep } from './DetailSettingsStep'
import { ConfirmationStep } from './ConfirmationStep'
import { CompleteStep } from './CompleteStep'
import { WizardNavigation } from './WizardNavigation'
import type {
  SettingWizardData,
  BasicInfoData,
  DetailSettingsData,
  WizardConfigData,
} from './types'

interface SettingWizardProps {
  config: WizardConfigData
}

// 단계 정의
const STEP_BASIC_INFO = 0
const STEP_DETAIL_SETTINGS = 1
const STEP_CONFIRMATION = 2
const STEP_COMPLETE = 3

export function SettingWizard({ config }: SettingWizardProps) {
  const router = useRouter()
  const { closeTab } = useMDI()

  // Form 인스턴스
  const [basicInfoForm] = Form.useForm<BasicInfoData>()
  const [detailSettingsForm] = Form.useForm<DetailSettingsData>()

  // 현재 단계
  const [currentStep, setCurrentStep] = useState(STEP_BASIC_INFO)

  // 완료된 단계
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())

  // 전체 데이터 상태
  const [wizardData, setWizardData] = useState<Partial<SettingWizardData>>({
    basicInfo: config.defaults.basicInfo,
    detailSettings: config.defaults.detailSettings,
  })

  // 완료 상태
  const [isCompleted, setIsCompleted] = useState(false)

  // 로딩 상태
  const [isLoading, setIsLoading] = useState(false)

  // 저장되지 않은 데이터 여부 (Form 필드 변경 여부)
  const [hasUnsavedData, setHasUnsavedData] = useState(false)

  // 기본정보 데이터 동기화
  useEffect(() => {
    if (currentStep === STEP_BASIC_INFO && wizardData.basicInfo) {
      basicInfoForm.setFieldsValue(wizardData.basicInfo)
    }
  }, [currentStep, wizardData.basicInfo, basicInfoForm])

  // 상세설정 데이터 동기화
  useEffect(() => {
    if (currentStep === STEP_DETAIL_SETTINGS && wizardData.detailSettings) {
      detailSettingsForm.setFieldsValue(wizardData.detailSettings)
    }
  }, [currentStep, wizardData.detailSettings, detailSettingsForm])

  // 다음 단계 이동
  const handleNext = useCallback(async () => {
    try {
      if (currentStep === STEP_BASIC_INFO) {
        const values = await basicInfoForm.validateFields()
        setWizardData((prev) => ({ ...prev, basicInfo: values }))
        setCompletedSteps((prev) => new Set([...prev, STEP_BASIC_INFO]))
        setCurrentStep(STEP_DETAIL_SETTINGS)
      } else if (currentStep === STEP_DETAIL_SETTINGS) {
        const values = await detailSettingsForm.validateFields()
        setWizardData((prev) => ({ ...prev, detailSettings: values }))
        setCompletedSteps((prev) => new Set([...prev, STEP_DETAIL_SETTINGS]))
        setCurrentStep(STEP_CONFIRMATION)
      }
    } catch {
      // 유효성 검사 실패 - Form이 자동으로 에러 표시
    }
  }, [currentStep, basicInfoForm, detailSettingsForm])

  // 이전 단계 이동
  const handlePrev = useCallback(() => {
    if (currentStep > STEP_BASIC_INFO && currentStep < STEP_COMPLETE) {
      setCurrentStep((prev) => prev - 1)
    }
  }, [currentStep])

  // 완료 핸들러
  const handleFinish = useCallback(async () => {
    setIsLoading(true)
    try {
      // Mock 저장 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 500))
      message.success('설정이 완료되었습니다!')
      setCompletedSteps((prev) => new Set([...prev, STEP_CONFIRMATION]))
      setIsCompleted(true)
      setCurrentStep(STEP_COMPLETE)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 취소 핸들러
  const handleCancel = useCallback(() => {
    closeTab('/sample/setting-wizard')
  }, [closeTab])

  // 대시보드 이동 핸들러
  const handleGoDashboard = useCallback(() => {
    router.push('/dashboard')
    closeTab('/sample/setting-wizard')
  }, [router, closeTab])

  // 마법사 재시작 핸들러
  const handleRestart = useCallback(() => {
    setWizardData({
      basicInfo: config.defaults.basicInfo,
      detailSettings: config.defaults.detailSettings,
    })
    setCompletedSteps(new Set())
    setIsCompleted(false)
    setCurrentStep(STEP_BASIC_INFO)
    basicInfoForm.resetFields()
    detailSettingsForm.resetFields()
  }, [config.defaults, basicInfoForm, detailSettingsForm])

  // Steps 클릭 핸들러
  const handleStepClick = useCallback(
    (step: number) => {
      // 완료된 단계 또는 현재 단계보다 이전 단계만 이동 가능
      if (completedSteps.has(step) || step < currentStep) {
        setCurrentStep(step)
      }
    },
    [completedSteps, currentStep]
  )

  // 확인 단계에서 수정 클릭 핸들러
  const handleEditStep = useCallback((stepKey: string) => {
    const stepIndex = stepKey === 'basicInfo' ? STEP_BASIC_INFO : STEP_DETAIL_SETTINGS
    setCurrentStep(stepIndex)
  }, [])

  // Steps 아이템 정의
  const stepItems = useMemo(
    () => [
      {
        title: '기본 정보',
        description: '회사 및 공장 정보',
      },
      {
        title: '상세 설정',
        description: '연결 및 옵션 설정',
      },
      {
        title: '확인',
        description: '설정 내용 확인',
      },
      {
        title: '완료',
        description: '설정 완료',
      },
    ],
    []
  )

  // 현재 단계 콘텐츠 렌더링
  const renderStepContent = () => {
    switch (currentStep) {
      case STEP_BASIC_INFO:
        return (
          <BasicInfoStep
            form={basicInfoForm}
            initialValues={wizardData.basicInfo}
            onValuesChange={() => setHasUnsavedData(true)}
          />
        )
      case STEP_DETAIL_SETTINGS:
        return (
          <DetailSettingsStep
            form={detailSettingsForm}
            initialValues={wizardData.detailSettings}
            onValuesChange={() => setHasUnsavedData(true)}
          />
        )
      case STEP_CONFIRMATION:
        return (
          <ConfirmationStep
            data={wizardData as SettingWizardData}
            onEditStep={handleEditStep}
          />
        )
      case STEP_COMPLETE:
        return (
          <CompleteStep
            message={config.messages.success}
            description={config.messages.successDescription}
            onGoDashboard={handleGoDashboard}
            onRestart={handleRestart}
          />
        )
      default:
        return null
    }
  }

  return (
    <div data-testid="setting-wizard-page">
      <Card title="설정 마법사">
        {/* Steps 영역 */}
        <Steps
          data-testid="wizard-steps"
          current={currentStep}
          items={stepItems.map((item, index) => ({
            ...item,
            status: completedSteps.has(index)
              ? 'finish'
              : index === currentStep
                ? 'process'
                : 'wait',
            'data-testid': `wizard-step-${['basic-info', 'detail-settings', 'confirmation', 'complete'][index]}`,
          }))}
          onChange={handleStepClick}
          className="mb-6"
        />

        {/* 콘텐츠 영역 */}
        <div data-testid="wizard-content" className="py-4">
          {renderStepContent()}
        </div>

        {/* 네비게이션 영역 (완료 단계에서는 숨김) */}
        {currentStep !== STEP_COMPLETE && (
          <WizardNavigation
            currentStep={currentStep}
            totalSteps={4}
            isLoading={isLoading}
            isCompleted={isCompleted}
            hasUnsavedData={hasUnsavedData}
            onPrev={handlePrev}
            onNext={handleNext}
            onFinish={handleFinish}
            onCancel={handleCancel}
          />
        )}
      </Card>
    </div>
  )
}

export default SettingWizard
