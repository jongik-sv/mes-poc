/**
 * @file CompleteStep.tsx
 * @description 설정 마법사 4단계: 완료
 * @task TSK-06-09
 *
 * @requirements
 * - FR-004: 완료 화면 (성공 메시지)
 *
 * @testIds
 * - wizard-result: 완료 결과 영역
 * - go-dashboard-btn: 대시보드 이동 버튼
 * - restart-wizard-btn: 다시 시작 버튼
 */

'use client'

import { Result, Button, Space } from 'antd'
import { DashboardOutlined, ReloadOutlined } from '@ant-design/icons'
import type { CompleteStepProps } from './types'

export function CompleteStep({
  message = '설정이 완료되었습니다!',
  description = '시스템 설정이 성공적으로 저장되었습니다. 이제 대시보드로 이동하여 사용할 수 있습니다.',
  onGoDashboard,
  onRestart,
}: CompleteStepProps) {
  return (
    <div data-testid="wizard-result">
      <Result
        status="success"
        title={message}
        subTitle={description}
        extra={
          <Space>
            {onGoDashboard && (
              <Button
                type="primary"
                icon={<DashboardOutlined />}
                onClick={onGoDashboard}
                data-testid="go-dashboard-btn"
              >
                대시보드로 이동
              </Button>
            )}
            {onRestart && (
              <Button
                icon={<ReloadOutlined />}
                onClick={onRestart}
                data-testid="restart-wizard-btn"
              >
                다시 시작
              </Button>
            )}
          </Space>
        }
      />
    </div>
  )
}

export default CompleteStep
