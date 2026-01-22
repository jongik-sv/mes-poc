// components/common/HotkeyHelp.tsx
// TSK-05-06: 키보드 단축키 도움말 모달 컴포넌트
'use client'

import { Modal, Typography, Divider, theme } from 'antd'
import { KeyBadge } from './KeyBadge'
import {
  HOTKEY_CATEGORIES,
  type HotkeyCategory,
} from '@/lib/hooks/useGlobalHotkeys'

const { Title, Text } = Typography

export interface HotkeyHelpProps {
  /** 모달 열림 상태 */
  open: boolean
  /** 모달 닫기 콜백 */
  onClose: () => void
  /** 커스텀 카테고리 (선택) */
  categories?: HotkeyCategory[]
}

/**
 * 키보드 단축키 도움말 모달
 *
 * ? 키 또는 메뉴에서 접근하여 사용 가능한 단축키 목록을 표시합니다.
 *
 * @example
 * ```tsx
 * const [open, setOpen] = useState(false)
 *
 * <HotkeyHelp
 *   open={open}
 *   onClose={() => setOpen(false)}
 * />
 * ```
 */
export function HotkeyHelp({
  open,
  onClose,
  categories = HOTKEY_CATEGORIES,
}: HotkeyHelpProps) {
  const { token } = theme.useToken()

  // data-testid용 ID 생성 함수
  const getItemTestId = (label: string) => {
    const id = label
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
    return `hotkey-item-${id}`
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <span id="hotkey-help-title" className="text-base font-semibold">
          키보드 단축키
        </span>
      }
      footer={null}
      width={480}
      centered
      destroyOnHidden
      aria-labelledby="hotkey-help-title"
      data-testid="hotkey-help-modal"
      styles={{
        body: {
          maxHeight: '60vh',
          overflowY: 'auto',
          padding: '16px 24px',
        },
      }}
    >
      <div data-testid="hotkey-list" role="list">
        {categories.map((category, categoryIndex) => (
          <div key={category.id} role="group" aria-labelledby={`category-${category.id}`}>
            {/* 카테고리 제목 */}
            <Title
              level={5}
              id={`category-${category.id}`}
              style={{
                marginTop: categoryIndex === 0 ? 0 : 24,
                marginBottom: 12,
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {category.title}
            </Title>

            {/* 단축키 목록 */}
            {category.items.map((item, itemIndex) => (
              <div
                key={`${category.id}-${itemIndex}`}
                role="listitem"
                data-testid={
                  item.label === '전역 검색 열기'
                    ? 'hotkey-item-global-search'
                    : getItemTestId(item.label)
                }
                className="flex justify-between items-center py-3"
                style={{
                  borderBottom:
                    itemIndex < category.items.length - 1
                      ? `1px solid ${token.colorBorderSecondary}`
                      : 'none',
                }}
              >
                {/* 단축키 설명 */}
                <Text
                  style={{
                    color: token.colorTextSecondary,
                    fontSize: 14,
                  }}
                >
                  {item.label}
                </Text>

                {/* 키 배지 */}
                <KeyBadge keys={item.keys} />
              </div>
            ))}
          </div>
        ))}

        {/* 안내 메시지 */}
        <Divider style={{ margin: '16px 0' }} />
        <Text
          type="secondary"
          style={{ fontSize: 12, display: 'block', textAlign: 'center' }}
        >
          💡 입력 필드에서는 일부 단축키가 비활성화됩니다
        </Text>
      </div>
    </Modal>
  )
}
