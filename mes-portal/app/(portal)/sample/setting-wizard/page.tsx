/**
 * @file page.tsx
 * @description 설정 마법사 샘플 페이지
 * @task TSK-06-09
 *
 * @route /sample/setting-wizard
 */

import { SettingWizard } from '@/components/screens/sample/SettingWizard'
import wizardConfig from '@/mock-data/wizard-config.json'
import type { WizardConfigData } from '@/components/screens/sample/SettingWizard/types'

export const metadata = {
  title: '설정 마법사 | MES Portal',
  description: '설정 마법사 샘플 화면',
}

export default function SettingWizardPage() {
  return <SettingWizard config={wizardConfig as WizardConfigData} />
}
