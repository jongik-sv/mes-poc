/**
 * @file SettingWizard Screen Wrapper
 * @description MDI에서 동적 로드 시 config를 주입하는 wrapper
 */

'use client'

import { SettingWizard } from '@/components/screens/sample/SettingWizard'
import wizardConfig from '@/mock-data/wizard-config.json'
import type { WizardConfigData } from '@/components/screens/sample/SettingWizard/types'

export default function SettingWizardScreen() {
  return <SettingWizard config={wizardConfig as WizardConfigData} />
}
