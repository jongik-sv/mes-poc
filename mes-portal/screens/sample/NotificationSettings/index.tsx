'use client'

// NotificationSettings/index.tsx
// TSK-06-19: 알림 설정 관리 메인 컴포넌트

import { useState, useCallback, useEffect, useMemo } from 'react'
import { Card, Button, Space, Typography, Modal, message, Spin } from 'antd'
import { ExclamationCircleOutlined, ReloadOutlined } from '@ant-design/icons'
import { useGlobalHotkeys, getModifierKey } from '@/lib/hooks'
import CategorySettings from './CategorySettings'
import RecipientTable from './RecipientTable'
import {
  DEFAULT_SETTINGS,
  type NotificationCategory,
  type NotificationRecipient,
  type NotificationSettingsData,
} from './types'
import initialSettings from '@/mock-data/notification-settings.json'

const { Title, Text } = Typography

/**
 * 이메일 유효성 검사 정규식
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * 고유 ID 생성
 */
function generateId(): string {
  return `r${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

/**
 * 알림 설정 관리 화면
 * - 알림 카테고리별 활성화/비활성화
 * - 알림 수신자 추가/삭제/편집
 * - Ctrl+S 저장, 미저장 경고, 기본값 복원
 */
export default function NotificationSettings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<NotificationCategory[]>([])
  const [recipients, setRecipients] = useState<NotificationRecipient[]>([])
  const [originalData, setOriginalData] = useState<NotificationSettingsData | null>(null)
  const [emailErrors, setEmailErrors] = useState<Record<string, string>>({})

  const modifierKey = getModifierKey()

  // 변경 여부 확인
  const isDirty = useMemo(() => {
    if (!originalData) return false
    const categoriesChanged =
      JSON.stringify(categories) !== JSON.stringify(originalData.categories)
    const recipientsChanged =
      JSON.stringify(recipients.map(({ isNew, ...r }) => r)) !==
      JSON.stringify(originalData.recipients)
    return categoriesChanged || recipientsChanged
  }, [categories, recipients, originalData])

  // 유효성 검사
  const validateAll = useCallback((): boolean => {
    const errors: Record<string, string> = {}
    const emails = new Set<string>()

    for (const recipient of recipients) {
      // 이름 검사
      if (!recipient.name.trim()) {
        errors[recipient.id] = '이름을 입력해주세요'
        continue
      }
      if (recipient.name.trim().length < 2 || recipient.name.trim().length > 50) {
        errors[recipient.id] = '이름은 2-50자 사이로 입력해주세요'
        continue
      }

      // 이메일 형식 검사
      if (!recipient.email.trim()) {
        errors[recipient.id] = '이메일을 입력해주세요'
        continue
      }
      if (!EMAIL_REGEX.test(recipient.email)) {
        errors[recipient.id] = '올바른 이메일 형식이 아닙니다'
        continue
      }

      // 이메일 중복 검사
      if (emails.has(recipient.email.toLowerCase())) {
        errors[recipient.id] = '이미 등록된 이메일입니다'
        continue
      }
      emails.add(recipient.email.toLowerCase())
    }

    setEmailErrors(errors)
    return Object.keys(errors).length === 0
  }, [recipients])

  // 초기 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        // Mock 데이터 로드
        const data = initialSettings as NotificationSettingsData
        setCategories(data.categories)
        setRecipients(data.recipients)
        setOriginalData(data)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // beforeunload 이벤트 등록
  useEffect(() => {
    if (!isDirty) return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
      return ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  // 카테고리 토글
  const handleCategoryChange = useCallback((id: string, enabled: boolean) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, enabled } : cat))
    )
  }, [])

  // 수신자 추가
  const handleAddRecipient = useCallback(() => {
    const newRecipient: NotificationRecipient = {
      id: generateId(),
      name: '',
      email: '',
      isNew: true,
    }
    setRecipients((prev) => [...prev, newRecipient])
  }, [])

  // 수신자 삭제
  const handleDeleteRecipient = useCallback((id: string) => {
    setRecipients((prev) => prev.filter((r) => r.id !== id))
    setEmailErrors((prev) => {
      const { [id]: _, ...rest } = prev
      return rest
    })
  }, [])

  // 수신자 정보 변경
  const handleRecipientChange = useCallback(
    (id: string, field: 'name' | 'email', value: string) => {
      setRecipients((prev) =>
        prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
      )
      // 변경 시 해당 에러 클리어
      if (emailErrors[id]) {
        setEmailErrors((prev) => {
          const { [id]: _, ...rest } = prev
          return rest
        })
      }
    },
    [emailErrors]
  )

  // 저장
  const handleSave = useCallback(async () => {
    if (!validateAll()) {
      message.error('입력 값을 확인해주세요')
      return
    }

    setSaving(true)
    try {
      // Mock 저장 (실제로는 API 호출)
      await new Promise((resolve) => setTimeout(resolve, 500))

      // isNew 플래그 제거
      const savedRecipients = recipients.map(({ isNew, ...r }) => r)
      setRecipients(savedRecipients)
      setOriginalData({ categories, recipients: savedRecipients })

      message.success('저장되었습니다')
    } catch {
      message.error('저장에 실패했습니다. 다시 시도해주세요')
    } finally {
      setSaving(false)
    }
  }, [categories, recipients, validateAll])

  // 취소
  const handleCancel = useCallback(() => {
    if (isDirty) {
      Modal.confirm({
        title: '저장되지 않은 변경사항',
        icon: <ExclamationCircleOutlined />,
        content: '저장하지 않은 변경사항이 있습니다. 저장하지 않고 이동하면 변경사항이 손실됩니다.',
        okText: '저장 후 이동',
        cancelText: '저장 안 함',
        onOk: async () => {
          await handleSave()
          // 저장 성공 후 이동 로직
        },
        onCancel: () => {
          // 변경사항 폐기
          if (originalData) {
            setCategories(originalData.categories)
            setRecipients(originalData.recipients)
            setEmailErrors({})
          }
        },
      })
    } else {
      // 변경사항 없으면 바로 이동
      if (originalData) {
        setCategories(originalData.categories)
        setRecipients(originalData.recipients)
      }
    }
  }, [isDirty, originalData, handleSave])

  // 기본값 복원
  const handleRestoreDefaults = useCallback(() => {
    Modal.confirm({
      title: '기본값 복원',
      icon: <ReloadOutlined />,
      content: '모든 알림 설정이 기본값으로 초기화됩니다. 이 작업은 취소할 수 없습니다.',
      okText: '복원',
      cancelText: '취소',
      onOk: () => {
        setCategories(DEFAULT_SETTINGS.categories)
        setRecipients(DEFAULT_SETTINGS.recipients)
        setEmailErrors({})
        message.info('기본값으로 복원되었습니다. 저장하려면 저장 버튼을 클릭하세요.')
      },
    })
  }, [])

  // 전역 단축키 등록
  useGlobalHotkeys({
    onSave: handleSave,
    disabled: saving || loading,
  })

  if (loading) {
    return (
      <div
        className="flex items-center justify-center h-96"
        data-testid="notification-settings-loading"
      >
        <Spin size="large" tip="불러오는 중..." />
      </div>
    )
  }

  return (
    <div className="p-6" data-testid="notification-settings-page">
      <Card>
        <div className="flex justify-between items-center mb-6">
          <Title level={4} className="m-0">
            알림 설정
          </Title>
          <Button
            onClick={handleRestoreDefaults}
            data-testid="restore-defaults-btn"
          >
            기본값 복원
          </Button>
        </div>

        <CategorySettings
          categories={categories}
          onChange={handleCategoryChange}
        />

        <RecipientTable
          recipients={recipients}
          onAdd={handleAddRecipient}
          onDelete={handleDeleteRecipient}
          onChange={handleRecipientChange}
          emailErrors={emailErrors}
        />

        <div className="mt-6 flex justify-between items-center">
          <Text type="secondary" className="text-sm">
            {modifierKey}+S로 빠르게 저장할 수 있습니다
          </Text>
          <Space>
            <Button onClick={handleCancel} data-testid="cancel-btn">
              취소
            </Button>
            <Button
              type="primary"
              onClick={handleSave}
              loading={saving}
              data-testid="save-btn"
            >
              저장
            </Button>
          </Space>
        </div>
      </Card>

      {/* 저장 성공 토스트 (message.success로 대체) */}
      <div data-testid="success-toast" style={{ display: 'none' }} />
    </div>
  )
}
