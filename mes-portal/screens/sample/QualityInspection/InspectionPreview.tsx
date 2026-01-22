// screens/sample/QualityInspection/InspectionPreview.tsx
// 미리보기 모달 (TSK-06-12)

'use client'

import React from 'react'
import {
  Modal,
  Descriptions,
  Table,
  Tag,
  Image,
  Space,
  Divider,
  Typography,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import type {
  QualityInspectionFormData,
  DimensionItem,
  AppearanceItem,
  FunctionItem,
  InspectionType,
} from './types'
import { INSPECTION_TYPE_OPTIONS } from './types'

const { Text } = Typography

interface InspectionPreviewProps {
  open: boolean
  onClose: () => void
  onSubmit: () => void
  formData: QualityInspectionFormData | null
  loading?: boolean
}

/**
 * 검사 유형 라벨 반환
 */
function getInspectionTypeLabel(type: InspectionType): string {
  return (
    INSPECTION_TYPE_OPTIONS.find((opt) => opt.value === type)?.label || type
  )
}

/**
 * 치수 검사 테이블 컬럼
 */
const dimensionColumns: ColumnsType<DimensionItem & { key: number }> = [
  { title: 'No.', dataIndex: 'key', key: 'key', width: 50 },
  { title: '측정위치', dataIndex: 'position', key: 'position' },
  { title: '기준값(mm)', dataIndex: 'standardValue', key: 'standardValue' },
  { title: '허용오차', dataIndex: 'tolerance', key: 'tolerance' },
  { title: '측정값(mm)', dataIndex: 'measuredValue', key: 'measuredValue' },
  {
    title: '판정',
    dataIndex: 'result',
    key: 'result',
    render: (result: string) =>
      result === 'pass' ? (
        <Tag color="success">합격</Tag>
      ) : result === 'fail' ? (
        <Tag color="error">불합격</Tag>
      ) : (
        <Tag>-</Tag>
      ),
  },
]

/**
 * 외관 검사 테이블 컬럼
 */
const appearanceColumns: ColumnsType<AppearanceItem & { key: number }> = [
  { title: 'No.', dataIndex: 'key', key: 'key', width: 50 },
  { title: '검사부위', dataIndex: 'area', key: 'area' },
  { title: '검사항목', dataIndex: 'checkItem', key: 'checkItem' },
  {
    title: '결과',
    dataIndex: 'result',
    key: 'result',
    render: (result: string) =>
      result === 'pass' ? (
        <Tag color="success">합격</Tag>
      ) : (
        <Tag color="error">불합격</Tag>
      ),
  },
  {
    title: '불량유형',
    dataIndex: 'defectType',
    key: 'defectType',
    render: (val: string | undefined) => val || '-',
  },
  {
    title: '불량사유',
    dataIndex: 'defectReason',
    key: 'defectReason',
    render: (val: string | undefined) => val || '-',
  },
]

/**
 * 기능 검사 테이블 컬럼
 */
const functionColumns: ColumnsType<FunctionItem & { key: number }> = [
  { title: 'No.', dataIndex: 'key', key: 'key', width: 50 },
  { title: '테스트항목', dataIndex: 'testItem', key: 'testItem' },
  { title: '테스트조건', dataIndex: 'testCondition', key: 'testCondition' },
  { title: '측정값', dataIndex: 'measuredValue', key: 'measuredValue' },
  {
    title: '결과',
    dataIndex: 'testResult',
    key: 'testResult',
    render: (result: string) =>
      result === 'pass' ? (
        <Tag color="success">합격</Tag>
      ) : (
        <Tag color="error">불합격</Tag>
      ),
  },
  {
    title: '불량유형',
    dataIndex: 'defectType',
    key: 'defectType',
    render: (val: string | undefined) => val || '-',
  },
]

/**
 * 미리보기 모달
 */
export function InspectionPreview({
  open,
  onClose,
  onSubmit,
  formData,
  loading,
}: InspectionPreviewProps) {
  if (!formData) return null

  const {
    inspectionType,
    productCode,
    lotNumber,
    inspectionDate,
    dimensionItems,
    appearanceItems,
    functionItems,
    images,
    remarks,
  } = formData

  return (
    <Modal
      title="검사 결과 미리보기"
      open={open}
      onCancel={onClose}
      onOk={onSubmit}
      okText="저장"
      cancelText="닫기"
      width={720}
      data-testid="preview-modal"
      confirmLoading={loading}
    >
      {/* 기본 정보 */}
      <Descriptions
        title="기본 정보"
        bordered
        column={2}
        size="small"
        className="mb-4"
      >
        <Descriptions.Item label="검사 유형">
          {getInspectionTypeLabel(inspectionType)}
        </Descriptions.Item>
        <Descriptions.Item label="제품코드">{productCode}</Descriptions.Item>
        <Descriptions.Item label="로트번호">{lotNumber}</Descriptions.Item>
        <Descriptions.Item label="검사일시">
          {inspectionDate
            ? dayjs(inspectionDate).format('YYYY-MM-DD HH:mm')
            : '-'}
        </Descriptions.Item>
      </Descriptions>

      <Divider />

      {/* 검사 항목 */}
      {inspectionType === 'dimension' && dimensionItems && (
        <>
          <Text strong className="block mb-2">
            측정 항목 ({dimensionItems.length}건)
          </Text>
          <Table
            columns={dimensionColumns}
            dataSource={dimensionItems.map((item, idx) => ({
              ...item,
              key: idx + 1,
            }))}
            pagination={false}
            size="small"
            data-testid="dimension-preview-table"
          />
        </>
      )}

      {inspectionType === 'appearance' && appearanceItems && (
        <>
          <Text strong className="block mb-2">
            외관 검사 항목 ({appearanceItems.length}건)
          </Text>
          <Table
            columns={appearanceColumns}
            dataSource={appearanceItems.map((item, idx) => ({
              ...item,
              key: idx + 1,
            }))}
            pagination={false}
            size="small"
            data-testid="appearance-preview-table"
          />
        </>
      )}

      {inspectionType === 'function' && functionItems && (
        <>
          <Text strong className="block mb-2">
            기능 검사 항목 ({functionItems.length}건)
          </Text>
          <Table
            columns={functionColumns}
            dataSource={functionItems.map((item, idx) => ({
              ...item,
              key: idx + 1,
            }))}
            pagination={false}
            size="small"
            data-testid="function-preview-table"
          />
        </>
      )}

      {/* 첨부 이미지 */}
      {images && images.length > 0 && (
        <>
          <Divider />
          <Text strong className="block mb-2">
            첨부 이미지 ({images.length}개)
          </Text>
          <Space wrap>
            {images.map((file) => (
              <Image
                key={file.uid}
                src={
                  file.thumbUrl ||
                  file.url ||
                  (file.originFileObj
                    ? URL.createObjectURL(file.originFileObj)
                    : undefined)
                }
                width={80}
                height={80}
                style={{ objectFit: 'cover' }}
                alt={file.name}
              />
            ))}
          </Space>
        </>
      )}

      {/* 비고 */}
      {remarks && (
        <>
          <Divider />
          <Text strong className="block mb-2">
            비고
          </Text>
          <Text>{remarks}</Text>
        </>
      )}
    </Modal>
  )
}

export default InspectionPreview
