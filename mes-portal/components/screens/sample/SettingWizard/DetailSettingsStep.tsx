/**
 * @file DetailSettingsStep.tsx
 * @description 설정 마법사 2단계: 상세설정 입력
 * @task TSK-06-09
 *
 * @requirements
 * - FR-002: 상세설정 입력 (서버 주소, 포트, 타임아웃, 옵션)
 * - BR-002: 다음 이동 전 유효성 검사 필수
 *
 * @testIds
 * - server-address-input: 서버 주소 입력 필드
 * - port-input: 포트 번호 입력 필드
 * - timeout-input: 타임아웃 입력 필드
 * - auto-reconnect-checkbox: 자동 재연결 체크박스
 * - debug-mode-checkbox: 디버그 모드 체크박스
 * - use-ssl-checkbox: SSL 사용 체크박스
 */

'use client'

import { Form, Input, InputNumber, Checkbox, Row, Col, Typography } from 'antd'
import type { FormInstance } from 'antd'
import type { DetailSettingsData } from './types'

const { Title } = Typography

// IPv4 패턴
const IPv4_PATTERN =
  /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/

// 도메인 패턴
const DOMAIN_PATTERN =
  /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/

// 서버 주소 유효성 검사 함수
const isValidServerAddress = (value: string) =>
  IPv4_PATTERN.test(value) || DOMAIN_PATTERN.test(value)

interface DetailSettingsStepProps {
  form: FormInstance<DetailSettingsData>
  initialValues?: Partial<DetailSettingsData>
  onValuesChange?: () => void
}

export function DetailSettingsStep({
  form,
  initialValues,
  onValuesChange,
}: DetailSettingsStepProps) {
  return (
    <div data-testid="wizard-step-detail-settings-content">
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        requiredMark
        onValuesChange={onValuesChange}
      >
        <Title level={5} className="mb-4">
          연결 정보
        </Title>

        <Form.Item
          name="serverAddress"
          label="서버 주소"
          rules={[
            { required: true, message: '서버 주소를 입력해주세요' },
            { max: 253, message: '서버 주소는 253자 이하로 입력해주세요' },
            {
              validator: (_, value) => {
                if (!value) return Promise.resolve()
                if (isValidServerAddress(value)) {
                  return Promise.resolve()
                }
                return Promise.reject(
                  new Error('올바른 서버 주소 형식이 아닙니다')
                )
              },
            },
          ]}
        >
          <Input
            data-testid="server-address-input"
            placeholder="192.168.1.100 또는 server.example.com"
            maxLength={253}
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="port"
              label="포트 번호"
              rules={[
                { required: true, message: '포트 번호를 입력해주세요' },
                {
                  type: 'number',
                  min: 1,
                  max: 65535,
                  message: '1-65535 사이의 숫자를 입력해주세요',
                },
              ]}
            >
              <InputNumber
                data-testid="port-input"
                placeholder="8080"
                className="w-full"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="timeout"
              label="타임아웃(초)"
              rules={[
                {
                  type: 'number',
                  min: 1,
                  max: 300,
                  message: '1-300 사이의 숫자를 입력해주세요',
                },
              ]}
            >
              <InputNumber
                data-testid="timeout-input"
                placeholder="30"
                className="w-full"
              />
            </Form.Item>
          </Col>
        </Row>

        <Title level={5} className="mb-4 mt-6">
          옵션 설정
        </Title>

        <Form.Item
          name="autoReconnect"
          valuePropName="checked"
        >
          <Checkbox data-testid="auto-reconnect-checkbox">
            자동 재연결 활성화
          </Checkbox>
        </Form.Item>

        <Form.Item
          name="debugMode"
          valuePropName="checked"
        >
          <Checkbox data-testid="debug-mode-checkbox">
            디버그 모드 활성화
          </Checkbox>
        </Form.Item>

        <Form.Item
          name="useSSL"
          valuePropName="checked"
        >
          <Checkbox data-testid="use-ssl-checkbox">SSL 사용</Checkbox>
        </Form.Item>
      </Form>
    </div>
  )
}

export default DetailSettingsStep
