/**
 * @file useProcessData.ts
 * @description 공정 데이터 관리 훅
 * @task TSK-06-18
 */

import { useState, useCallback, useMemo } from 'react'
import processesData from '@/mock-data/processes.json'
import type {
  ProcessData,
  ProcessFormValues,
  ProcessSearchParams,
} from './types'

/**
 * 공정 데이터 관리 훅
 *
 * @returns 공정 목록, CRUD 함수, 상태
 */
export function useProcessData() {
  // 공정 목록 상태
  const [processes, setProcesses] = useState<ProcessData[]>(
    processesData.processes as ProcessData[]
  )

  // 로딩 상태
  const [loading, setLoading] = useState(false)

  // 에러 상태
  const [error, setError] = useState<string | null>(null)

  // 검색 파라미터
  const [searchParams, setSearchParams] = useState<ProcessSearchParams>({})

  /**
   * 공정 목록 필터링
   */
  const filteredProcesses = useMemo(() => {
    return processes.filter((process) => {
      // 공정코드 필터
      if (
        searchParams.code &&
        !process.code.toLowerCase().includes(searchParams.code.toLowerCase())
      ) {
        return false
      }

      // 공정명 필터
      if (
        searchParams.name &&
        !process.name.toLowerCase().includes(searchParams.name.toLowerCase())
      ) {
        return false
      }

      // 상태 필터
      if (searchParams.status && process.status !== searchParams.status) {
        return false
      }

      return true
    })
  }, [processes, searchParams])

  /**
   * 공정 코드 중복 확인
   */
  const isCodeDuplicate = useCallback(
    (code: string, excludeId?: string) => {
      return processes.some(
        (p) => p.code.toLowerCase() === code.toLowerCase() && p.id !== excludeId
      )
    },
    [processes]
  )

  /**
   * 기존 공정 코드 목록
   */
  const existingCodes = useMemo(() => {
    return processes.map((p) => p.code)
  }, [processes])

  /**
   * ID로 공정 조회
   */
  const getProcessById = useCallback(
    (id: string): ProcessData | undefined => {
      return processes.find((p) => p.id === id)
    },
    [processes]
  )

  /**
   * 공정 등록
   */
  const createProcess = useCallback(
    async (values: ProcessFormValues): Promise<ProcessData> => {
      setLoading(true)
      setError(null)

      try {
        // 중복 코드 확인 (BR-04)
        if (isCodeDuplicate(values.code)) {
          throw new Error('이미 사용 중인 공정코드입니다')
        }

        // 시뮬레이션 딜레이
        await new Promise((resolve) => setTimeout(resolve, 500))

        const newProcess: ProcessData = {
          id: String(Date.now()),
          code: values.code,
          name: values.name,
          status: values.status,
          order: values.order || processes.length + 1,
          description: values.description,
          equipmentCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          equipment: [],
          history: [
            {
              id: String(Date.now()),
              action: 'create',
              timestamp: new Date().toISOString(),
              user: '현재 사용자',
              changes: '공정 생성',
            },
          ],
        }

        setProcesses((prev) => [...prev, newProcess])
        return newProcess
      } catch (err) {
        const message = err instanceof Error ? err.message : '등록에 실패했습니다'
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [isCodeDuplicate, processes.length]
  )

  /**
   * 공정 수정
   */
  const updateProcess = useCallback(
    async (id: string, values: ProcessFormValues): Promise<ProcessData> => {
      setLoading(true)
      setError(null)

      try {
        // 중복 코드 확인 (BR-04)
        if (isCodeDuplicate(values.code, id)) {
          throw new Error('이미 사용 중인 공정코드입니다')
        }

        // 시뮬레이션 딜레이
        await new Promise((resolve) => setTimeout(resolve, 500))

        let updatedProcess: ProcessData | undefined

        setProcesses((prev) =>
          prev.map((p) => {
            if (p.id === id) {
              updatedProcess = {
                ...p,
                code: values.code,
                name: values.name,
                status: values.status,
                order: values.order ?? p.order,
                description: values.description,
                updatedAt: new Date().toISOString(),
                history: [
                  ...(p.history || []),
                  {
                    id: String(Date.now()),
                    action: 'update' as const,
                    timestamp: new Date().toISOString(),
                    user: '현재 사용자',
                    changes: '공정 정보 수정',
                  },
                ],
              }
              return updatedProcess
            }
            return p
          })
        )

        if (!updatedProcess) {
          throw new Error('공정을 찾을 수 없습니다')
        }

        return updatedProcess
      } catch (err) {
        const message = err instanceof Error ? err.message : '수정에 실패했습니다'
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [isCodeDuplicate]
  )

  /**
   * 공정 삭제
   */
  const deleteProcess = useCallback(async (id: string): Promise<void> => {
    setLoading(true)
    setError(null)

    try {
      // 시뮬레이션 딜레이
      await new Promise((resolve) => setTimeout(resolve, 500))

      setProcesses((prev) => prev.filter((p) => p.id !== id))
    } catch (err) {
      const message = err instanceof Error ? err.message : '삭제에 실패했습니다'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * 다중 삭제
   */
  const deleteProcesses = useCallback(
    async (ids: string[]): Promise<void> => {
      setLoading(true)
      setError(null)

      try {
        // 시뮬레이션 딜레이
        await new Promise((resolve) => setTimeout(resolve, 500))

        setProcesses((prev) => prev.filter((p) => !ids.includes(p.id)))
      } catch (err) {
        const message = err instanceof Error ? err.message : '삭제에 실패했습니다'
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  /**
   * 데이터 새로고침
   */
  const refetch = useCallback(() => {
    setProcesses(processesData.processes as ProcessData[])
    setError(null)
  }, [])

  return {
    // 데이터
    processes: filteredProcesses,
    allProcesses: processes,
    existingCodes,

    // 상태
    loading,
    error,

    // 검색
    searchParams,
    setSearchParams,

    // CRUD
    getProcessById,
    createProcess,
    updateProcess,
    deleteProcess,
    deleteProcesses,
    isCodeDuplicate,

    // 기타
    refetch,
  }
}
