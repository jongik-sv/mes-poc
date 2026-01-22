/**
 * @file WizardContext.tsx
 * @description WizardTemplate Context Provider
 * @task TSK-06-06
 *
 * @requirements
 * - FR-001: 단계 표시 (Steps 컴포넌트)
 * - FR-002: 이전/다음 네비게이션
 * - FR-003: 단계별 유효성 검사
 *
 * @businessRules
 * - BR-008: 단계 간 데이터는 유지
 */

'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  type ReactNode,
} from 'react'
import type { FormInstance } from 'antd'
import type { WizardContextValue, WizardStep } from './types'

const WizardContext = createContext<WizardContextValue | null>(null)

export interface WizardProviderProps<T extends Record<string, unknown> = Record<string, unknown>> {
  children: ReactNode
  steps: WizardStep[]
  initialStep?: number
  initialData?: Partial<T>
  onFinish: (data: T) => Promise<void>
  onCancel?: () => void
  onStepChange?: (current: number, prev: number) => void
  onDataChange?: (data: T) => void
}

export function WizardProvider<T extends Record<string, unknown> = Record<string, unknown>>({
  children,
  steps,
  initialStep = 0,
  initialData,
  onFinish,
  onCancel,
  onStepChange,
  onDataChange,
}: WizardProviderProps<T>) {
  const [currentStep, setCurrentStep] = useState(initialStep)
  const [data, setDataState] = useState<T>((initialData as T) || ({} as T))
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [isFinishing, setIsFinishing] = useState(false)
  const [stepForms, setStepForms] = useState<Map<string, FormInstance>>(new Map())

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

  const registerStepForm = useCallback((stepKey: string, form: FormInstance) => {
    setStepForms((prev) => {
      const newMap = new Map(prev)
      newMap.set(stepKey, form)
      return newMap
    })
  }, [])

  const unregisterStepForm = useCallback((stepKey: string) => {
    setStepForms((prev) => {
      const newMap = new Map(prev)
      newMap.delete(stepKey)
      return newMap
    })
  }, [])

  const goNext = useCallback(async () => {
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

  const goPrev = useCallback(() => {
    const prevStep = Math.max(currentStep - 1, 0)
    if (prevStep !== currentStep) {
      onStepChange?.(prevStep, currentStep)
      setCurrentStep(prevStep)
    }
  }, [currentStep, onStepChange])

  const goTo = useCallback(
    (step: number) => {
      // 완료된 단계 또는 현재 단계보다 이전 단계만 이동 가능
      if (completedSteps.has(step) || step < currentStep) {
        onStepChange?.(step, currentStep)
        setCurrentStep(step)
      }
    },
    [completedSteps, currentStep, onStepChange]
  )

  const cancel = useCallback(() => {
    onCancel?.()
  }, [onCancel])

  const value = useMemo<WizardContextValue<T>>(
    () => ({
      data,
      setData,
      getStepData,
      setStepData,
      currentStep,
      totalSteps: steps.length,
      completedSteps,
      goNext,
      goPrev,
      goTo,
      cancel,
      registerStepForm,
      unregisterStepForm,
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
      goNext,
      goPrev,
      goTo,
      cancel,
      registerStepForm,
      unregisterStepForm,
      isFinishing,
    ]
  )

  return (
    <WizardContext.Provider value={value as WizardContextValue<Record<string, unknown>>}>
      {children}
    </WizardContext.Provider>
  )
}

export function useWizardContext<T extends Record<string, unknown> = Record<string, unknown>>() {
  const context = useContext(WizardContext)
  if (!context) {
    throw new Error('useWizardContext must be used within WizardProvider')
  }
  return context as WizardContextValue<T>
}

/**
 * useWizardStep 훅 - Form과 Context 결합도 감소 (ARCH-001 반영)
 *
 * 목적: 단계 컴포넌트가 Form 인스턴스를 Context에 자동 등록/해제하여
 * validate 함수와 Form 간 암묵적 결합을 제거
 */
export function useWizardStep<TStepData = unknown>(stepKey: string, form: FormInstance) {
  const { setStepData, getStepData, registerStepForm, unregisterStepForm } = useWizardContext()

  // 컴포넌트 마운트 시 Form 인스턴스 등록
  useEffect(() => {
    registerStepForm(stepKey, form)
    return () => unregisterStepForm(stepKey)
  }, [stepKey, form, registerStepForm, unregisterStepForm])

  // 초기 데이터 로드
  useEffect(() => {
    const savedData = getStepData(stepKey)
    if (savedData) {
      form.setFieldsValue(savedData as TStepData)
    }
  }, [stepKey, getStepData, form])

  // 폼 값 변경 핸들러
  const handleValuesChange = useCallback(
    (_: unknown, allValues: TStepData) => {
      setStepData(stepKey, allValues)
    },
    [stepKey, setStepData]
  )

  return { handleValuesChange }
}
