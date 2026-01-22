/**
 * @file ConfirmationStep.tsx
 * @description 설정 마법사 3단계: 확인
 * @task TSK-06-09
 *
 * @requirements
 * - FR-003: 확인 화면 (모든 입력 데이터 요약)
 *
 * @testIds
 * - wizard-confirmation: 확인 영역
 * - confirmation-basic-info-section: 기본정보 요약 섹션
 * - confirmation-detail-settings-section: 상세설정 요약 섹션
 * - edit-basic-info-link: 기본정보 수정 링크
 * - edit-detail-settings-link: 상세설정 수정 링크
 */

'use client'

import { Card, Descriptions, Button } from 'antd'
import { EditOutlined } from '@ant-design/icons'
import type { ConfirmationStepProps } from './types'

export function ConfirmationStep({ data, onEditStep }: ConfirmationStepProps) {
  const { basicInfo, detailSettings } = data

  return (
    <div data-testid="wizard-confirmation" className="space-y-6">
      {/* 기본 정보 섹션 */}
      <Card
        title="기본 정보"
        extra={
          onEditStep && (
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => onEditStep('basicInfo')}
              data-testid="edit-basic-info-link"
            >
              수정
            </Button>
          )
        }
        data-testid="confirmation-basic-info-section"
      >
        <Descriptions column={1} bordered>
          <Descriptions.Item label="회사명">
            {basicInfo?.companyName || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="공장명">
            {basicInfo?.factoryName || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="관리자 이메일">
            {basicInfo?.adminEmail || '-'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 상세 설정 섹션 */}
      <Card
        title="상세 설정"
        extra={
          onEditStep && (
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => onEditStep('detailSettings')}
              data-testid="edit-detail-settings-link"
            >
              수정
            </Button>
          )
        }
        data-testid="confirmation-detail-settings-section"
      >
        <Descriptions column={1} bordered>
          <Descriptions.Item label="서버 주소">
            {detailSettings?.serverAddress || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="포트 번호">
            {detailSettings?.port ?? '-'}
          </Descriptions.Item>
          <Descriptions.Item label="타임아웃">
            {detailSettings?.timeout ? `${detailSettings.timeout}초` : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="자동 재연결">
            {detailSettings?.autoReconnect ? '활성화' : '비활성화'}
          </Descriptions.Item>
          <Descriptions.Item label="디버그 모드">
            {detailSettings?.debugMode ? '활성화' : '비활성화'}
          </Descriptions.Item>
          <Descriptions.Item label="SSL 사용">
            {detailSettings?.useSSL ? '활성화' : '비활성화'}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  )
}

export default ConfirmationStep
