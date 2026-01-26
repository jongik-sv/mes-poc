// screens/sample/DataTableShowcase/ColumnOrderSettings.tsx
// 컬럼 순서 설정 컴포넌트

'use client'

import React from 'react'
import { Button, Popover, Typography } from 'antd'
import { SettingOutlined, HolderOutlined } from '@ant-design/icons'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'

const { Text } = Typography

// 컬럼 레이블 매핑
const COLUMN_LABELS: Record<string, string> = {
  name: '제품명',
  category: '카테고리',
  quantity: '수량',
  price: '가격',
  status: '상태',
  createdAt: '생성일',
}

interface SortableColumnItemProps {
  id: string
}

function SortableColumnItem({ id }: SortableColumnItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    padding: '8px 12px',
    marginBottom: '4px',
    backgroundColor: isDragging ? 'var(--ant-color-primary-bg)' : 'var(--ant-color-bg-container)',
    border: '1px solid var(--ant-color-border)',
    borderRadius: '4px',
    cursor: 'move',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    ...(isDragging ? {
      zIndex: 9999,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    } : {}),
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <HolderOutlined className="text-gray-400" />
      <Text>{COLUMN_LABELS[id] || id}</Text>
    </div>
  )
}

interface ColumnOrderSettingsProps {
  columnOrder: string[]
  onOrderChange: (newOrder: string[]) => void
  disabled?: boolean
}

export function ColumnOrderSettings({
  columnOrder,
  onOrderChange,
  disabled = false,
}: ColumnOrderSettingsProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = columnOrder.indexOf(active.id as string)
    const newIndex = columnOrder.indexOf(over.id as string)

    if (oldIndex !== -1 && newIndex !== -1) {
      onOrderChange(arrayMove(columnOrder, oldIndex, newIndex))
    }
  }

  const content = (
    <div style={{ width: 200 }}>
      <Text type="secondary" className="block mb-2 text-xs">
        드래그하여 컬럼 순서를 변경하세요
      </Text>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext items={columnOrder} strategy={verticalListSortingStrategy}>
          {columnOrder.map((columnKey) => (
            <SortableColumnItem key={columnKey} id={columnKey} />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  )

  return (
    <Popover
      content={content}
      title="컬럼 순서 설정"
      trigger="click"
      placement="bottomRight"
    >
      <Button
        icon={<SettingOutlined />}
        disabled={disabled}
        data-testid="column-order-settings-btn"
      >
        컬럼 순서
      </Button>
    </Popover>
  )
}
