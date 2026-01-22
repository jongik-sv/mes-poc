// screens/sample/EquipmentMonitor/index.tsx
// 설비 모니터링 카드뷰 메인 화면 (TSK-06-10)

'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Row, Col, Typography, Spin, Empty, Switch, Space } from 'antd'
import { SyncOutlined } from '@ant-design/icons'
import type { Equipment, EquipmentFilterState, Line, EquipmentListResponse } from './types'
import { EquipmentCard } from './EquipmentCard'
import { EquipmentDetailDrawer } from './EquipmentDetailDrawer'
import { EquipmentFilter } from './EquipmentFilter'
import { StatusSummary } from './StatusSummary'
import { filterEquipment, countByStatus, simulateStatusChange } from './utils'

const { Title, Text } = Typography

// 실시간 갱신 간격 (5초)
const REFRESH_INTERVAL = 5000

/**
 * 설비 모니터링 카드뷰 화면
 *
 * 설비 현황을 카드 그리드로 표시하고 실시간 상태 갱신을 시뮬레이션합니다.
 * - 상태 요약 표시
 * - 상태/라인 필터링
 * - 실시간 갱신 토글 (5초 간격)
 * - 설비 상세 정보 Drawer
 */
export function EquipmentMonitor() {
  const [loading, setLoading] = useState(true)
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [lines, setLines] = useState<Line[]>([])
  const [filter, setFilter] = useState<EquipmentFilterState>({
    status: 'all',
    lineId: 'all',
  })
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // 데이터 로드
  const loadData = useCallback(async () => {
    try {
      const response = await fetch('/mock-data/equipment.json')
      const data: EquipmentListResponse = await response.json()
      setEquipment(data.equipment)
      setLines(data.lines)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to load equipment data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // 초기 로드
  useEffect(() => {
    loadData()
  }, [loadData])

  // 실시간 갱신 시뮬레이션
  useEffect(() => {
    if (autoRefresh && !loading) {
      intervalRef.current = setInterval(() => {
        setEquipment((prev) => {
          const updated = simulateStatusChange(prev, 0.05)
          setLastUpdated(new Date())
          return updated
        })
      }, REFRESH_INTERVAL)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [autoRefresh, loading])

  // 필터 변경 핸들러
  const handleFilterChange = useCallback((newFilter: EquipmentFilterState) => {
    setFilter(newFilter)
  }, [])

  // 필터 초기화 핸들러
  const handleFilterReset = useCallback(() => {
    setFilter({ status: 'all', lineId: 'all' })
  }, [])

  // 카드 클릭 핸들러
  const handleCardClick = useCallback((eq: Equipment) => {
    setSelectedEquipment(eq)
    setDrawerOpen(true)
  }, [])

  // Drawer 닫기 핸들러
  const handleDrawerClose = useCallback(() => {
    setDrawerOpen(false)
    setSelectedEquipment(null)
  }, [])

  // 실시간 갱신 토글 핸들러
  const handleAutoRefreshToggle = useCallback((checked: boolean) => {
    setAutoRefresh(checked)
  }, [])

  // 필터링된 설비 목록
  const filteredEquipment = filterEquipment(equipment, filter)

  // 상태별 개수 (필터링 전 전체 기준)
  const statusCounts = countByStatus(equipment)

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spin size="large" tip="설비 정보를 불러오는 중..." />
      </div>
    )
  }

  return (
    <div data-testid="equipment-monitor" className="p-4">
      {/* 헤더 */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
        <Title level={4} style={{ margin: 0 }}>
          설비 모니터링
        </Title>
        <Space>
          {lastUpdated && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              마지막 갱신: {lastUpdated.toLocaleTimeString('ko-KR')}
            </Text>
          )}
          <Space>
            <SyncOutlined spin={autoRefresh} />
            <Text type="secondary">실시간 갱신</Text>
            <Switch
              data-testid="auto-refresh-toggle"
              checked={autoRefresh}
              onChange={handleAutoRefreshToggle}
              size="small"
            />
          </Space>
        </Space>
      </div>

      {/* 상태 요약 */}
      <StatusSummary counts={statusCounts} />

      {/* 필터 */}
      <EquipmentFilter
        filter={filter}
        lines={lines}
        onFilterChange={handleFilterChange}
        onReset={handleFilterReset}
      />

      {/* 설비 카드 그리드 */}
      {filteredEquipment.length === 0 ? (
        <Empty
          data-testid="equipment-empty"
          description="조건에 맞는 설비가 없습니다."
          style={{ marginTop: '48px' }}
        />
      ) : (
        <Row gutter={[16, 16]} data-testid="equipment-grid">
          {filteredEquipment.map((eq) => (
            <Col key={eq.id} xs={24} sm={12} md={8} lg={6}>
              <EquipmentCard
                equipment={eq}
                onClick={handleCardClick}
              />
            </Col>
          ))}
        </Row>
      )}

      {/* 상세 정보 Drawer */}
      <EquipmentDetailDrawer
        equipment={selectedEquipment}
        open={drawerOpen}
        onClose={handleDrawerClose}
      />
    </div>
  )
}

export default EquipmentMonitor
