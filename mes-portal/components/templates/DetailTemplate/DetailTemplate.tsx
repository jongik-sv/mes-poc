// components/templates/DetailTemplate/DetailTemplate.tsx
// 상세 화면 템플릿 메인 컴포넌트 (TSK-06-02)

'use client'

import React, { useState, useCallback } from 'react'
import { Modal, App } from 'antd'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import type { DetailTemplateProps } from './types'
import { DetailHeader } from './DetailHeader'
import { DetailDescriptions } from './DetailDescriptions'
import { DetailTabs } from './DetailTabs'
import { DetailFooter } from './DetailFooter'
import { DetailError } from './DetailError'
import { DetailSkeleton } from './DetailSkeleton'

/**
 * DetailTemplate 컴포넌트
 *
 * 상세 화면의 표준 템플릿을 제공합니다.
 *
 * 주요 기능:
 * - 헤더 영역 (제목, 수정/삭제 버튼)
 * - 기본 정보 영역 (Ant Design Descriptions)
 * - 탭 기반 관련 정보 영역 (Ant Design Tabs)
 * - 하단 버튼 영역 (목록으로 돌아가기)
 * - 로딩/에러 상태 처리
 * - 삭제 확인 다이얼로그
 *
 * @example
 * ```tsx
 * <DetailTemplate
 *   title="사용자 상세"
 *   subtitle={user?.name}
 *   loading={loading}
 *   onEdit={() => router.push(`/users/${id}/edit`)}
 *   onDelete={async () => {
 *     await deleteUser(id)
 *     router.push('/users')
 *   }}
 *   onBack={() => router.push('/users')}
 *   descriptions={{
 *     items: [
 *       { key: 'name', label: '이름', children: user?.name },
 *       { key: 'email', label: '이메일', children: user?.email },
 *     ],
 *   }}
 *   tabs={[
 *     { key: 'history', label: '활동 이력', children: <HistoryTable /> },
 *   ]}
 * />
 * ```
 */
export function DetailTemplate<T = Record<string, unknown>>({
  // 헤더
  title,
  subtitle,
  titleIcon,
  onEdit,
  onDelete,
  onBack,
  extra,

  // 기본 정보
  descriptions,
  descriptionsTitle = '기본 정보',

  // 탭
  tabs,
  defaultActiveTab,
  onTabChange,
  destroyInactiveTabPane = false,
  lazyLoadTabs = false,

  // 상태
  loading = false,
  error,

  // 레이아웃
  className,
  gutter = 24,

  // 삭제 다이얼로그
  deleteConfirmMessage = '정말 삭제하시겠습니까?',
  deleteConfirmTitle = '삭제 확인',

  // 권한
  permissions,
}: DetailTemplateProps<T>) {
  const { message } = App.useApp()
  const [deleting, setDeleting] = useState(false)

  /**
   * 수정 버튼 표시 여부
   * - onEdit이 제공되어야 함
   * - permissions.canEdit가 false가 아니어야 함
   */
  const showEdit = Boolean(onEdit) && permissions?.canEdit !== false

  /**
   * 삭제 버튼 표시 여부
   * - onDelete가 제공되어야 함
   * - permissions.canDelete가 false가 아니어야 함
   */
  const showDelete = Boolean(onDelete) && permissions?.canDelete !== false

  /**
   * 삭제 확인 다이얼로그 표시 및 처리
   * BR-01: 삭제 시 확인 다이얼로그 필수 표시
   * BR-06: 삭제 중 중복 클릭 방지
   */
  const handleDelete = useCallback(() => {
    if (!onDelete || deleting) return

    Modal.confirm({
      title: deleteConfirmTitle,
      icon: <ExclamationCircleOutlined />,
      content: deleteConfirmMessage,
      okText: '삭제',
      okType: 'danger',
      cancelText: '취소',
      onOk: async () => {
        try {
          setDeleting(true)
          await onDelete()
          message.success('삭제되었습니다')
        } catch (err) {
          message.error('삭제에 실패했습니다. 다시 시도해주세요.')
          throw err
        } finally {
          setDeleting(false)
        }
      },
    })
  }, [onDelete, deleting, deleteConfirmTitle, deleteConfirmMessage, message])

  // 에러 상태 표시
  if (error) {
    return (
      <div
        className={className}
        data-testid="detail-template-container"
        style={{ padding: gutter }}
      >
        <DetailError
          error={error}
          onBack={onBack}
        />
      </div>
    )
  }

  // 로딩 상태 표시
  if (loading) {
    return (
      <div
        className={className}
        data-testid="detail-template-container"
        style={{ padding: gutter }}
      >
        <DetailSkeleton
          showTabs={Boolean(tabs && tabs.length > 0)}
          tabCount={tabs?.length || 3}
        />
      </div>
    )
  }

  return (
    <div
      className={className}
      data-testid="detail-template-container"
      style={{ padding: gutter }}
    >
      {/* 헤더 영역 */}
      <DetailHeader
        title={title}
        subtitle={subtitle}
        titleIcon={titleIcon}
        onEdit={onEdit}
        onDelete={handleDelete}
        showEdit={showEdit}
        showDelete={showDelete}
        extra={extra}
        loading={loading}
      />

      {/* 기본 정보 영역 */}
      <DetailDescriptions
        descriptionsProps={descriptions}
        title={descriptionsTitle}
        loading={loading}
      />

      {/* 탭 영역 (선택적) */}
      {tabs && tabs.length > 0 && (
        <DetailTabs
          tabs={tabs}
          defaultActiveKey={defaultActiveTab}
          onChange={onTabChange}
          destroyInactiveTabPane={destroyInactiveTabPane}
          lazyLoad={lazyLoadTabs}
          loading={loading}
        />
      )}

      {/* 하단 영역 */}
      <DetailFooter onBack={onBack} />
    </div>
  )
}

export default DetailTemplate
