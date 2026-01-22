// components/templates/ListTemplate/SearchForm.tsx
// 검색 폼 컴포넌트 (TSK-06-01)

'use client'

import React from 'react'
import {
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Checkbox,
  Button,
  Row,
  Col,
  Space,
} from 'antd'
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import type { SearchFormProps, SearchFieldDefinition } from './types'

const { RangePicker } = DatePicker

/**
 * 필드 타입별 기본 span 값
 */
const DEFAULT_SPAN_BY_TYPE: Record<string, number> = {
  dateRange: 8,
  default: 6,
}

/**
 * 검색 필드 렌더링
 */
function renderField(field: SearchFieldDefinition, value: unknown, onChange: (v: unknown) => void) {
  const commonProps = {
    placeholder: field.placeholder,
    style: { width: '100%' },
  }

  switch (field.type) {
    case 'text':
      return (
        <Input
          {...commonProps}
          value={value as string | undefined}
          onChange={(e) => onChange(e.target.value)}
          allowClear
          data-testid={`search-${field.name}-input`}
        />
      )

    case 'select':
      return (
        <Select
          {...commonProps}
          value={value}
          onChange={onChange}
          allowClear
          options={field.options}
          data-testid={`search-${field.name}-select`}
        />
      )

    case 'multiSelect':
      return (
        <Select
          {...commonProps}
          mode="multiple"
          value={value as string[]}
          onChange={onChange}
          allowClear
          options={field.options}
          data-testid={`search-${field.name}-select`}
        />
      )

    case 'date':
      return (
        <DatePicker
          {...commonProps}
          value={value as any}
          onChange={onChange}
          data-testid={`search-${field.name}-date`}
        />
      )

    case 'dateRange':
      return (
        <RangePicker
          {...commonProps}
          placeholder={
            (commonProps.placeholder
              ? [commonProps.placeholder, commonProps.placeholder]
              : undefined) as [string, string] | undefined
          }
          value={value as any}
          onChange={onChange}
          data-testid={`search-${field.name}-daterange`}
        />
      )

    case 'number':
      return (
        <InputNumber
          {...commonProps}
          value={value as number | undefined}
          onChange={onChange}
          data-testid={`search-${field.name}-number`}
        />
      )

    case 'checkbox':
      return (
        <Checkbox
          checked={value as boolean}
          onChange={(e) => onChange(e.target.checked)}
          data-testid={`search-${field.name}-checkbox`}
        >
          {field.label}
        </Checkbox>
      )

    default:
      return null
  }
}

/**
 * SearchForm 컴포넌트
 *
 * 검색 조건 입력 폼을 렌더링합니다.
 * 반응형 그리드 레이아웃을 사용하여 다양한 화면 크기에 대응합니다.
 */
export function SearchForm({
  fields,
  values,
  onChange,
  onSearch,
  onReset,
  loading,
  extra,
}: SearchFormProps) {
  /**
   * 필드 값 변경 핸들러
   */
  const handleFieldChange = (name: string, value: unknown) => {
    onChange({ ...values, [name]: value })
  }

  /**
   * Enter 키 입력 시 검색 실행
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onSearch()
    }
  }

  return (
    <Form
      layout="vertical"
      data-testid="search-form"
      onKeyDown={handleKeyDown}
    >
      <Row gutter={[16, 16]}>
        {fields.map((field) => {
          const span = field.span || DEFAULT_SPAN_BY_TYPE[field.type] || DEFAULT_SPAN_BY_TYPE.default

          // checkbox는 라벨 없이 렌더링
          if (field.type === 'checkbox') {
            return (
              <Col
                key={field.name}
                xs={24}
                sm={12}
                md={8}
                lg={span}
              >
                <Form.Item style={{ marginBottom: 0 }}>
                  {renderField(field, values[field.name], (v) => handleFieldChange(field.name, v))}
                </Form.Item>
              </Col>
            )
          }

          return (
            <Col
              key={field.name}
              xs={24}
              sm={12}
              md={8}
              lg={span}
            >
              <Form.Item
                label={field.label}
                style={{ marginBottom: 0 }}
              >
                {renderField(field, values[field.name], (v) => handleFieldChange(field.name, v))}
              </Form.Item>
            </Col>
          )
        })}
      </Row>

      <Row justify="end" style={{ marginTop: 16 }}>
        <Space>
          {extra}
          <Button
            data-testid="reset-btn"
            icon={<ReloadOutlined />}
            onClick={onReset}
            disabled={loading}
          >
            초기화
          </Button>
          <Button
            type="primary"
            data-testid="search-btn"
            icon={<SearchOutlined />}
            onClick={onSearch}
            loading={loading}
            disabled={loading}
          >
            검색
          </Button>
        </Space>
      </Row>
    </Form>
  )
}

export default SearchForm
