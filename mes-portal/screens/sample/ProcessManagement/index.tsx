/**
 * @file index.tsx
 * @description 공정 관리 샘플 화면 메인 컴포넌트
 * @task TSK-06-18
 *
 * @requirements
 * - 공정 목록 조회 (Table)
 * - 공정 상세 보기 (Descriptions + Tabs)
 * - 공정 등록/수정 폼 (신규/수정 모드 전환)
 * - 공정 삭제 (확인 후 삭제)
 * - 상태별 Empty/Loading/Error 처리
 *
 * 템플릿 조합:
 * - ListTemplate: 목록 화면
 * - DetailTemplate: 상세 화면
 * - FormTemplate: 등록/수정 폼
 */

'use client'

import React, { useState, useCallback } from 'react'
import { App } from 'antd'
import type { ProcessData, ViewMode, FormMode } from './types'
import { useProcessData } from './useProcessData'
import { ProcessList } from './ProcessList'
import { ProcessDetail } from './ProcessDetail'
import { ProcessForm } from './ProcessForm'

/**
 * 공정 관리 샘플 화면
 *
 * ListTemplate, DetailTemplate, FormTemplate 조합 예시
 */
export function ProcessManagement() {
  const { message } = App.useApp()

  // 데이터 관리 훅
  const {
    processes,
    existingCodes,
    loading,
    error,
    setSearchParams,
    getProcessById,
    createProcess,
    updateProcess,
    deleteProcess,
    deleteProcesses,
    refetch,
  } = useProcessData()

  // 화면 모드 상태
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [formMode, setFormMode] = useState<FormMode>('create')

  // 선택된 공정
  const [selectedProcess, setSelectedProcess] = useState<ProcessData | null>(null)

  /**
   * 검색 핸들러
   */
  const handleSearch = useCallback(
    (params: Record<string, unknown>) => {
      setSearchParams(params)
    },
    [setSearchParams]
  )

  /**
   * 신규 버튼 클릭 (UC-03)
   */
  const handleAdd = useCallback(() => {
    setSelectedProcess(null)
    setFormMode('create')
    setViewMode('form')
  }, [])

  /**
   * 삭제 핸들러 (목록에서 다중 삭제)
   */
  const handleDeleteMultiple = useCallback(
    async (rows: ProcessData[]) => {
      const ids = rows.map((r) => r.id)
      await deleteProcesses(ids)
      message.success(`${rows.length}건이 삭제되었습니다`)
    },
    [deleteProcesses, message]
  )

  /**
   * 행 클릭 (UC-02: 상세 조회)
   */
  const handleRowClick = useCallback(
    (record: ProcessData) => {
      const process = getProcessById(record.id)
      setSelectedProcess(process || null)
      setViewMode('detail')
    },
    [getProcessById]
  )

  /**
   * 수정 버튼 클릭 (UC-04)
   */
  const handleEdit = useCallback(() => {
    setFormMode('edit')
    setViewMode('form')
  }, [])

  /**
   * 삭제 핸들러 (상세에서 단일 삭제, UC-05)
   */
  const handleDelete = useCallback(async () => {
    if (!selectedProcess) return

    await deleteProcess(selectedProcess.id)
    setSelectedProcess(null)
    setViewMode('list')
  }, [selectedProcess, deleteProcess])

  /**
   * 목록으로 돌아가기
   */
  const handleBack = useCallback(() => {
    setSelectedProcess(null)
    setViewMode('list')
  }, [])

  /**
   * 폼 취소
   */
  const handleFormCancel = useCallback(() => {
    if (formMode === 'edit' && selectedProcess) {
      // 수정 모드에서 취소 시 상세로 복귀
      setViewMode('detail')
    } else {
      // 등록 모드에서 취소 시 목록으로 복귀
      setSelectedProcess(null)
      setViewMode('list')
    }
  }, [formMode, selectedProcess])

  /**
   * 폼 제출
   */
  const handleFormSubmit = useCallback(
    async (values: Parameters<typeof createProcess>[0]) => {
      if (formMode === 'create') {
        const newProcess = await createProcess(values)
        setSelectedProcess(newProcess)
        setViewMode('detail')
      } else if (selectedProcess) {
        const updatedProcess = await updateProcess(selectedProcess.id, values)
        setSelectedProcess(updatedProcess)
        setViewMode('detail')
      }
    },
    [formMode, selectedProcess, createProcess, updateProcess]
  )

  /**
   * 재시도
   */
  const handleRetry = useCallback(() => {
    refetch()
  }, [refetch])

  // 화면 모드에 따른 렌더링
  return (
    <div data-testid="process-management-page">
      {viewMode === 'list' && (
        <ProcessList
          processes={processes}
          loading={loading}
          error={error}
          onSearch={handleSearch}
          onAdd={handleAdd}
          onDelete={handleDeleteMultiple}
          onRowClick={handleRowClick}
          onRetry={handleRetry}
        />
      )}

      {viewMode === 'detail' && (
        <ProcessDetail
          process={selectedProcess}
          loading={loading}
          error={error}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onBack={handleBack}
          onRetry={handleRetry}
        />
      )}

      {viewMode === 'form' && (
        <ProcessForm
          mode={formMode}
          initialValues={selectedProcess}
          existingCodes={existingCodes}
          loading={loading}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  )
}

export default ProcessManagement
