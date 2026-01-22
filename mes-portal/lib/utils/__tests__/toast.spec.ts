/**
 * @file toast.spec.ts
 * @description Toast 알림 유틸리티 함수 단위 테스트
 * @task TSK-05-03
 *
 * @requirements
 * - FR-001: 성공 메시지 표시 (showSuccess)
 * - FR-002: 정보 메시지 표시 (showInfo)
 * - FR-003: 경고 메시지 표시 (showWarning)
 * - FR-004: 에러 메시지 표시 (showError)
 * - FR-005: 자동 닫힘 (3-5초)
 * - FR-006: 수동 닫기 버튼
 *
 * @businessRules
 * - BR-001: API 성공 시 성공 Toast 표시
 * - BR-002: API 에러 시 에러 Toast 표시
 * - BR-003: 자동 닫힘 시간 3-5초 사이
 * - BR-004: 에러 Toast는 5초 표시
 * - BR-005: 동일 key Toast는 업데이트
 * - BR-006: API 에러 메시지 직접 표시 금지
 * - BR-007: showLoading 최대 타임아웃 30초
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { message } from 'antd';
import {
  showSuccess,
  showInfo,
  showWarning,
  showError,
  showLoading,
  hideToast,
  destroyAllToasts,
  DEFAULT_DURATION,
  ERROR_DURATION,
  WARNING_DURATION,
  LOADING_TIMEOUT,
} from '../toast';

// Ant Design message API 모킹
vi.mock('antd', async () => {
  const actual = await vi.importActual<typeof import('antd')>('antd');
  return {
    ...actual,
    message: {
      success: vi.fn(),
      info: vi.fn(),
      warning: vi.fn(),
      error: vi.fn(),
      loading: vi.fn(),
      destroy: vi.fn(),
    },
  };
});

describe('Toast 유틸리티', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('showSuccess', () => {
    /**
     * UT-001: showSuccess 성공 메시지 표시
     * @requirement FR-001
     */
    it('should display success message', () => {
      showSuccess('저장되었습니다');

      expect(message.success).toHaveBeenCalledWith(
        expect.objectContaining({
          content: '저장되었습니다',
        })
      );
    });

    /**
     * UT-002: showSuccess 기본 duration 적용 (3초)
     * @requirement FR-001, BR-003
     */
    it('should apply default duration of 3 seconds', () => {
      showSuccess('저장되었습니다');

      expect(message.success).toHaveBeenCalledWith(
        expect.objectContaining({
          duration: DEFAULT_DURATION,
        })
      );
    });

    /**
     * UT-003: showSuccess 커스텀 duration 적용
     * @requirement FR-001
     */
    it('should apply custom duration', () => {
      showSuccess('저장되었습니다', { duration: 5 });

      expect(message.success).toHaveBeenCalledWith(
        expect.objectContaining({
          duration: 5,
        })
      );
    });

    it('should support object parameter', () => {
      showSuccess({ content: '완료되었습니다', duration: 4 });

      expect(message.success).toHaveBeenCalledWith(
        expect.objectContaining({
          content: '완료되었습니다',
          duration: 4,
        })
      );
    });
  });

  describe('showInfo', () => {
    /**
     * UT-004: showInfo 정보 메시지 표시
     * @requirement FR-002
     */
    it('should display info message', () => {
      showInfo('업데이트가 있습니다');

      expect(message.info).toHaveBeenCalledWith(
        expect.objectContaining({
          content: '업데이트가 있습니다',
        })
      );
    });

    /**
     * UT-005: showInfo 기본 duration 적용 (3초)
     * @requirement FR-002, BR-003
     */
    it('should apply default duration of 3 seconds', () => {
      showInfo('정보 메시지');

      expect(message.info).toHaveBeenCalledWith(
        expect.objectContaining({
          duration: DEFAULT_DURATION,
        })
      );
    });
  });

  describe('showWarning', () => {
    /**
     * UT-006: showWarning 경고 메시지 표시
     * @requirement FR-003
     */
    it('should display warning message', () => {
      showWarning('주의가 필요합니다');

      expect(message.warning).toHaveBeenCalledWith(
        expect.objectContaining({
          content: '주의가 필요합니다',
        })
      );
    });

    /**
     * UT-007: showWarning 기본 duration 적용 (5초)
     * @requirement FR-003, BR-003
     */
    it('should apply default duration of 5 seconds', () => {
      showWarning('경고 메시지');

      expect(message.warning).toHaveBeenCalledWith(
        expect.objectContaining({
          duration: WARNING_DURATION,
        })
      );
    });
  });

  describe('showError', () => {
    /**
     * UT-008: showError 에러 메시지 표시
     * @requirement FR-004
     */
    it('should display error message', () => {
      showError('오류가 발생했습니다');

      expect(message.error).toHaveBeenCalledWith(
        expect.objectContaining({
          content: '오류가 발생했습니다',
        })
      );
    });

    /**
     * UT-009: showError 기본 duration 적용 (5초)
     * @requirement FR-004, BR-004
     */
    it('should apply default duration of 5 seconds', () => {
      showError('에러 메시지');

      expect(message.error).toHaveBeenCalledWith(
        expect.objectContaining({
          duration: ERROR_DURATION,
        })
      );
    });

    /**
     * UT-010: showError 수동 닫기 모드 (duration: 0)
     * @requirement FR-006
     */
    it('should support manual close with duration 0', () => {
      showError('심각한 오류', { duration: 0 });

      expect(message.error).toHaveBeenCalledWith(
        expect.objectContaining({
          duration: 0,
        })
      );
    });
  });

  describe('Toast 옵션', () => {
    /**
     * UT-011: 커스텀 className 적용
     * @requirement FR-001
     */
    it('should support custom className', () => {
      showInfo('알림', { className: 'custom-toast' });

      expect(message.info).toHaveBeenCalledWith(
        expect.objectContaining({
          className: 'custom-toast',
        })
      );
    });

    /**
     * UT-013: onClose 콜백 전달
     * @requirement FR-006
     */
    it('should call onClose callback when closed', () => {
      const onClose = vi.fn();
      showSuccess('완료', { onClose });

      expect(message.success).toHaveBeenCalledWith(
        expect.objectContaining({
          onClose,
        })
      );
    });

    /**
     * UT-014: key로 특정 Toast 업데이트
     * @requirement BR-005
     */
    it('should update existing toast with same key', () => {
      showSuccess('저장 중...', { key: 'save' });
      showSuccess('저장 완료', { key: 'save' });

      expect(message.success).toHaveBeenCalledTimes(2);
      expect(message.success).toHaveBeenLastCalledWith(
        expect.objectContaining({
          key: 'save',
          content: '저장 완료',
        })
      );
    });
  });

  describe('showLoading', () => {
    /**
     * UT-loading-1: showLoading 로딩 메시지 표시
     * @requirement BR-007
     */
    it('should display loading message', () => {
      showLoading('저장 중...');

      expect(message.loading).toHaveBeenCalledWith(
        expect.objectContaining({
          content: '저장 중...',
          duration: 0,
        })
      );
    });

    /**
     * UT-loading-2: showLoading key 전달
     * @requirement BR-007
     */
    it('should pass key parameter', () => {
      showLoading('저장 중...', 'save-key');

      expect(message.loading).toHaveBeenCalledWith(
        expect.objectContaining({
          key: 'save-key',
        })
      );
    });

    /**
     * UT-014 (BR-007): showLoading 30초 타임아웃
     * @requirement BR-007
     */
    it('should auto-destroy after 30 seconds', () => {
      const key = 'timeout-test';
      showLoading('로딩 중...', key);

      expect(message.destroy).not.toHaveBeenCalled();

      // 30초 경과
      vi.advanceTimersByTime(LOADING_TIMEOUT);

      expect(message.destroy).toHaveBeenCalledWith(key);
    });

    /**
     * UT-loading-3: 동일 key로 재호출 시 기존 타이머 제거
     * @requirement BR-007
     */
    it('should clear existing timer when called with same key', () => {
      const key = 'same-key';

      // 첫 번째 호출
      showLoading('로딩 중...', key);

      // 15초 경과
      vi.advanceTimersByTime(15000);

      // 동일 key로 두 번째 호출 (기존 타이머 리셋)
      showLoading('다시 로딩 중...', key);

      // 20초 추가 경과 (총 35초, 하지만 두 번째 호출 기준으로 20초)
      vi.advanceTimersByTime(20000);

      // 아직 destroy 안 됨 (두 번째 호출 기준 30초 미만)
      expect(message.destroy).not.toHaveBeenCalled();

      // 추가 10초 경과 (두 번째 호출 기준 30초 도달)
      vi.advanceTimersByTime(10000);

      expect(message.destroy).toHaveBeenCalledWith(key);
    });
  });

  describe('hideToast', () => {
    /**
     * UT-hide-1: 특정 key Toast 숨기기
     */
    it('should hide toast with specific key', () => {
      hideToast('save-key');

      expect(message.destroy).toHaveBeenCalledWith('save-key');
    });

    /**
     * UT-hide-2: hideToast 호출 시 관련 타이머 제거
     */
    it('should clear timer when hideToast is called', () => {
      const key = 'loading-key';

      // 로딩 시작
      showLoading('로딩 중...', key);

      // 10초 경과
      vi.advanceTimersByTime(10000);

      // hideToast 호출 (타이머도 함께 제거됨)
      hideToast(key);

      expect(message.destroy).toHaveBeenCalledWith(key);

      // 추가 25초 경과 (총 35초이지만 타이머가 제거되었으므로 추가 destroy 없어야 함)
      vi.clearAllMocks();
      vi.advanceTimersByTime(25000);

      // 타이머가 제거되었으므로 추가 destroy 호출 없음
      expect(message.destroy).not.toHaveBeenCalled();
    });
  });

  describe('destroyAllToasts', () => {
    /**
     * UT-015: 모든 Toast 닫기
     * @requirement FR-006
     */
    it('should destroy all toasts', () => {
      destroyAllToasts();

      expect(message.destroy).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    /**
     * 빈 메시지 처리
     */
    it('should handle empty message gracefully', () => {
      showSuccess('');

      expect(message.success).toHaveBeenCalledWith(
        expect.objectContaining({
          content: '',
        })
      );
    });

    /**
     * HTML 이스케이프 (XSS 방지)
     */
    it('should pass HTML in message as text (XSS prevention handled by Ant Design)', () => {
      showSuccess('<script>alert(1)</script>');

      expect(message.success).toHaveBeenCalledWith(
        expect.objectContaining({
          content: '<script>alert(1)</script>',
        })
      );
    });

    /**
     * 이모지 처리
     */
    it('should handle emoji in message', () => {
      showSuccess('저장 완료! 🎉');

      expect(message.success).toHaveBeenCalledWith(
        expect.objectContaining({
          content: '저장 완료! 🎉',
        })
      );
    });

    /**
     * 긴 메시지 처리
     */
    it('should handle long messages', () => {
      const longMessage = '작업이 성공적으로 완료되었습니다. '.repeat(10);
      showSuccess(longMessage);

      expect(message.success).toHaveBeenCalledWith(
        expect.objectContaining({
          content: longMessage,
        })
      );
    });
  });
});
