/**
 * @file confirm.ts
 * @description 확인 다이얼로그 유틸리티 함수
 * @task TSK-05-02
 *
 * 삭제, 저장되지 않은 변경사항 경고, 일괄 작업 확인을 위한 재사용 가능한 다이얼로그 함수 제공
 *
 * @requirements
 * - FR-001: 삭제 확인 다이얼로그
 * - FR-002: 저장되지 않은 변경사항 경고
 * - FR-003: 일괄 작업 확인
 *
 * @businessRules
 * - BR-001: 삭제 작업은 항상 확인 필요
 * - BR-002: 위험 작업은 빨간색 버튼
 * - BR-003: 일괄 작업은 건수 명시
 * - BR-004: 변경사항 있으면 이탈 시 경고
 */

import { Modal } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { createElement, type ReactNode } from 'react';

/**
 * 삭제 확인 옵션
 */
export interface ConfirmDeleteOptions {
  /** 다이얼로그 제목 (기본값: "삭제 확인") */
  title?: string;
  /** 다이얼로그 내용 */
  content?: ReactNode;
  /** 삭제 대상 항목명 (content가 없을 때 사용) */
  itemName?: string;
  /** 확인 버튼 텍스트 (기본값: "삭제") */
  okText?: string;
  /** 취소 버튼 텍스트 (기본값: "취소") */
  cancelText?: string;
}

/**
 * 변경사항 폐기 확인 옵션
 */
export interface ConfirmDiscardOptions {
  /** 폼의 dirty 상태 */
  isDirty: boolean;
  /** 다이얼로그 제목 (기본값: "저장되지 않은 변경사항") */
  title?: string;
  /** 다이얼로그 내용 */
  content?: ReactNode;
  /** 확인 버튼 텍스트 (기본값: "나가기") */
  okText?: string;
  /** 취소 버튼 텍스트 (기본값: "계속 수정") */
  cancelText?: string;
}

/**
 * 일괄 작업 확인 옵션
 */
export interface ConfirmBulkDeleteOptions {
  /** 선택된 항목 수 */
  count: number;
  /** 작업명 (기본값: "삭제") */
  action?: string;
  /** 다이얼로그 제목 */
  title?: string;
  /** 확인 버튼 텍스트 */
  okText?: string;
  /** 취소 버튼 텍스트 (기본값: "취소") */
  cancelText?: string;
}

/**
 * 삭제 확인 다이얼로그
 *
 * @description 데이터 삭제 전 사용자 확인을 받는 다이얼로그를 표시합니다.
 * 위험 작업으로 분류되어 확인 버튼이 빨간색으로 표시됩니다.
 *
 * @param options - 다이얼로그 옵션
 * @returns Promise<boolean> - 확인 시 true, 취소 시 false
 *
 * @example
 * ```tsx
 * const confirmed = await confirmDelete({
 *   itemName: '사용자 "홍길동"',
 * });
 * if (confirmed) {
 *   // 삭제 진행
 * }
 * ```
 */
export function confirmDelete(options: ConfirmDeleteOptions): Promise<boolean> {
  const {
    title = '삭제 확인',
    content,
    itemName,
    okText = '삭제',
    cancelText = '취소',
  } = options;

  const dialogContent =
    content ??
    (itemName
      ? `${itemName}을(를) 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`
      : '정말 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.');

  return new Promise<boolean>((resolve) => {
    Modal.confirm({
      title,
      icon: createElement(ExclamationCircleFilled),
      content: dialogContent,
      okText,
      cancelText,
      okButtonProps: {
        danger: true,
      },
      onOk() {
        resolve(true);
      },
      onCancel() {
        resolve(false);
      },
    });
  });
}

/**
 * 저장되지 않은 변경사항 폐기 확인 다이얼로그
 *
 * @description 폼에 저장되지 않은 변경사항이 있을 때 페이지 이탈을 확인하는 다이얼로그를 표시합니다.
 * isDirty가 false이면 다이얼로그 없이 즉시 true를 반환합니다.
 *
 * @param options - 다이얼로그 옵션
 * @returns Promise<boolean> - 나가기 확인 시 true, 계속 수정 시 false
 *
 * @example
 * ```tsx
 * const canLeave = await confirmDiscard({
 *   isDirty: form.isFieldsTouched(),
 * });
 * if (canLeave) {
 *   router.push('/list');
 * }
 * ```
 */
export function confirmDiscard(
  options: ConfirmDiscardOptions
): Promise<boolean> {
  const {
    isDirty,
    title = '저장되지 않은 변경사항',
    content,
    okText = '나가기',
    cancelText = '계속 수정',
  } = options;

  // dirty 상태가 아니면 바로 진행
  if (!isDirty) {
    return Promise.resolve(true);
  }

  const dialogContent =
    content ?? '저장하지 않은 내용이 있습니다.\n페이지를 벗어나면 변경사항이 사라집니다.';

  return new Promise<boolean>((resolve) => {
    Modal.confirm({
      title,
      icon: createElement(ExclamationCircleFilled),
      content: dialogContent,
      okText,
      cancelText,
      onOk() {
        resolve(true);
      },
      onCancel() {
        resolve(false);
      },
    });
  });
}

/**
 * 일괄 작업 확인 다이얼로그
 *
 * @description 여러 건의 데이터에 대한 작업 전 확인을 받는 다이얼로그를 표시합니다.
 * 정확한 건수가 메시지에 표시됩니다.
 *
 * @param options - 다이얼로그 옵션
 * @returns Promise<boolean> - 확인 시 true, 취소 시 false
 *
 * @example
 * ```tsx
 * const confirmed = await confirmBulkDelete({
 *   count: selectedRows.length,
 *   action: '삭제',
 * });
 * if (confirmed) {
 *   // 일괄 삭제 진행
 * }
 * ```
 */
export function confirmBulkDelete(
  options: ConfirmBulkDeleteOptions
): Promise<boolean> {
  const {
    count,
    action = '삭제',
    title = `일괄 ${action} 확인`,
    okText = action,
    cancelText = '취소',
  } = options;

  const dialogContent = `선택한 ${count}건을 ${action}하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`;

  return new Promise<boolean>((resolve) => {
    Modal.confirm({
      title,
      icon: createElement(ExclamationCircleFilled),
      content: dialogContent,
      okText,
      cancelText,
      okButtonProps: {
        danger: true,
      },
      onOk() {
        resolve(true);
      },
      onCancel() {
        resolve(false);
      },
    });
  });
}
