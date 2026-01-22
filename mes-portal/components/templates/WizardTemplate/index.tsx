/**
 * @file index.tsx
 * @description WizardTemplate 컴포넌트 - 마법사(Wizard) 화면 템플릿
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
 * const steps: WizardStep[] = [
 *   {
 *     key: 'basicInfo',
 *     title: '기본 정보',
 *     content: <BasicInfoStep />,
 *     validate: async () => {
 *       try {
 *         await form.validateFields();
 *         return true;
 *       } catch {
 *         return false;
 *       }
 *     },
 *   },
 *   {
 *     key: 'detailSettings',
 *     title: '상세 설정',
 *     content: <DetailSettingsStep />,
 *   },
 * ];
 *
 * <WizardTemplate
 *   title="설정 마법사"
 *   steps={steps}
 *   onFinish={handleFinish}
 *   onCancel={() => router.back()}
 *   autoConfirmStep
 *   renderConfirmation={(data) => <ConfirmationView data={data} />}
 *   autoFinishStep
 *   finishMessage="설정이 완료되었습니다!"
 * />
 * ```
 */

// 타입 re-export
export * from './types'

// 컴포넌트 export
export { WizardTemplate } from './WizardTemplate'
export { WizardProvider, useWizardContext, useWizardStep } from './WizardContext'
export { WizardSteps } from './WizardSteps'
export { WizardContent } from './WizardContent'
export { WizardNavigation } from './WizardNavigation'

// 기본 export
export { default } from './WizardTemplate'
