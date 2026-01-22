/**
 * @file toast.ts
 * @description Toast 알림 유틸리티 함수
 * @task TSK-05-03
 *
 * 성공/정보/경고/에러 메시지를 표시하는 재사용 가능한 Toast 함수 제공
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

import { message } from 'antd';

/**
 * Toast 기본 지속 시간 (초)
 * 성공/정보 메시지에 사용
 */
export const DEFAULT_DURATION = 3;

/**
 * 에러 Toast 지속 시간 (초)
 * 에러 메시지는 사용자가 충분히 인지할 수 있도록 더 오래 표시
 */
export const ERROR_DURATION = 5;

/**
 * 경고 Toast 지속 시간 (초)
 * 경고 메시지도 에러와 동일하게 더 오래 표시
 */
export const WARNING_DURATION = 5;

/**
 * 로딩 Toast 최대 타임아웃 (밀리초)
 * hideToast가 호출되지 않는 예외 상황을 대비
 */
export const LOADING_TIMEOUT = 30000;

/**
 * Toast 옵션 인터페이스
 */
export interface ToastOptions {
  /** 표시할 메시지 (필수) */
  content: string;
  /** 자동 닫힘 시간 (초), 0이면 자동 닫힘 안 함 */
  duration?: number;
  /** 고유 키 (중복 방지, Toast 업데이트용) */
  key?: string;
  /** 닫힘 콜백 */
  onClose?: () => void;
  /** 커스텀 CSS 클래스 */
  className?: string;
}

/**
 * 함수 오버로드를 위한 옵션 타입
 */
type ToastShowOptions = Omit<ToastOptions, 'content'>;

// 로딩 타임아웃 관리를 위한 Map
const loadingTimers = new Map<string, ReturnType<typeof setTimeout>>();

/**
 * 옵션 또는 문자열을 ToastOptions로 변환
 */
function normalizeOptions(
  contentOrOptions: string | ToastOptions,
  options?: ToastShowOptions,
  defaultDuration: number = DEFAULT_DURATION
): ToastOptions {
  if (typeof contentOrOptions === 'string') {
    return {
      content: contentOrOptions,
      duration: defaultDuration,
      ...options,
    };
  }
  return {
    duration: defaultDuration,
    ...contentOrOptions,
  };
}

/**
 * 성공 Toast 표시
 *
 * @description 작업 성공 시 녹색 체크 아이콘과 함께 메시지를 표시합니다.
 * 기본 3초 후 자동으로 사라집니다.
 *
 * @param contentOrOptions - 메시지 문자열 또는 ToastOptions 객체
 * @param options - 추가 옵션 (contentOrOptions가 문자열일 때)
 *
 * @example
 * ```tsx
 * // 간단한 사용
 * showSuccess('저장되었습니다.');
 *
 * // 옵션 사용
 * showSuccess('저장되었습니다.', { duration: 5 });
 *
 * // 객체 형태
 * showSuccess({ content: '완료', key: 'save', onClose: () => {} });
 * ```
 */
export function showSuccess(content: string, options?: ToastShowOptions): void;
export function showSuccess(options: ToastOptions): void;
export function showSuccess(
  contentOrOptions: string | ToastOptions,
  options?: ToastShowOptions
): void {
  const normalizedOptions = normalizeOptions(contentOrOptions, options, DEFAULT_DURATION);
  message.success(normalizedOptions);
}

/**
 * 정보 Toast 표시
 *
 * @description 일반 정보를 파란색 정보 아이콘과 함께 표시합니다.
 * 기본 3초 후 자동으로 사라집니다.
 *
 * @param contentOrOptions - 메시지 문자열 또는 ToastOptions 객체
 * @param options - 추가 옵션 (contentOrOptions가 문자열일 때)
 *
 * @example
 * ```tsx
 * showInfo('새로운 업데이트가 있습니다.');
 * ```
 */
export function showInfo(content: string, options?: ToastShowOptions): void;
export function showInfo(options: ToastOptions): void;
export function showInfo(
  contentOrOptions: string | ToastOptions,
  options?: ToastShowOptions
): void {
  const normalizedOptions = normalizeOptions(contentOrOptions, options, DEFAULT_DURATION);
  message.info(normalizedOptions);
}

/**
 * 경고 Toast 표시
 *
 * @description 주의가 필요한 상황을 주황색 경고 아이콘과 함께 표시합니다.
 * 기본 5초 후 자동으로 사라집니다 (일반 메시지보다 더 오래 표시).
 *
 * @param contentOrOptions - 메시지 문자열 또는 ToastOptions 객체
 * @param options - 추가 옵션 (contentOrOptions가 문자열일 때)
 *
 * @example
 * ```tsx
 * showWarning('5분 후 자동 로그아웃됩니다.');
 * ```
 */
export function showWarning(content: string, options?: ToastShowOptions): void;
export function showWarning(options: ToastOptions): void;
export function showWarning(
  contentOrOptions: string | ToastOptions,
  options?: ToastShowOptions
): void {
  const normalizedOptions = normalizeOptions(contentOrOptions, options, WARNING_DURATION);
  message.warning(normalizedOptions);
}

/**
 * 에러 Toast 표시
 *
 * @description 에러 발생 시 빨간색 에러 아이콘과 함께 메시지를 표시합니다.
 * 기본 5초 후 자동으로 사라집니다 (사용자가 충분히 인지할 수 있도록).
 *
 * @param contentOrOptions - 메시지 문자열 또는 ToastOptions 객체
 * @param options - 추가 옵션 (contentOrOptions가 문자열일 때)
 *
 * @example
 * ```tsx
 * // 기본 사용
 * showError('저장에 실패했습니다.');
 *
 * // 수동 닫기만 가능 (자동 닫힘 없음)
 * showError('심각한 오류가 발생했습니다.', { duration: 0 });
 * ```
 */
export function showError(content: string, options?: ToastShowOptions): void;
export function showError(options: ToastOptions): void;
export function showError(
  contentOrOptions: string | ToastOptions,
  options?: ToastShowOptions
): void {
  const normalizedOptions = normalizeOptions(contentOrOptions, options, ERROR_DURATION);
  message.error(normalizedOptions);
}

/**
 * 로딩 Toast 표시
 *
 * @description 작업 진행 중임을 로딩 스피너와 함께 표시합니다.
 * 자동으로 닫히지 않으며, hideToast로 수동으로 닫아야 합니다.
 * hideToast가 호출되지 않는 예외 상황을 대비하여 30초 후 자동 제거됩니다.
 *
 * @param content - 표시할 메시지
 * @param key - Toast 식별 키 (hideToast에서 사용)
 *
 * @example
 * ```tsx
 * const key = 'save-loading';
 * showLoading('저장 중...', key);
 * // ... API 호출
 * hideToast(key);
 * showSuccess('저장되었습니다.');
 * ```
 */
export function showLoading(content: string, key?: string): void {
  const toastKey = key ?? `loading-${Date.now()}`;

  // 기존 타이머가 있으면 제거
  const existingTimer = loadingTimers.get(toastKey);
  if (existingTimer) {
    clearTimeout(existingTimer);
  }

  message.loading({
    content,
    duration: 0,
    key: toastKey,
  });

  // 30초 타임아웃 설정 (BR-007)
  const timer = setTimeout(() => {
    message.destroy(toastKey);
    loadingTimers.delete(toastKey);
  }, LOADING_TIMEOUT);

  loadingTimers.set(toastKey, timer);
}

/**
 * 특정 Toast 숨기기
 *
 * @description key로 식별되는 특정 Toast를 즉시 닫습니다.
 * 주로 showLoading과 함께 사용됩니다.
 *
 * @param key - 닫을 Toast의 key
 *
 * @example
 * ```tsx
 * hideToast('save-loading');
 * ```
 */
export function hideToast(key: string): void {
  // 타이머가 있으면 제거
  const timer = loadingTimers.get(key);
  if (timer) {
    clearTimeout(timer);
    loadingTimers.delete(key);
  }

  message.destroy(key);
}

/**
 * 모든 Toast 닫기
 *
 * @description 현재 표시 중인 모든 Toast를 즉시 닫습니다.
 * 페이지 이동 또는 컨텍스트 전환 시 사용할 수 있습니다.
 *
 * @example
 * ```tsx
 * // 페이지 이동 전 모든 Toast 정리
 * destroyAllToasts();
 * router.push('/home');
 * ```
 */
export function destroyAllToasts(): void {
  // 모든 로딩 타이머 제거
  loadingTimers.forEach((timer) => clearTimeout(timer));
  loadingTimers.clear();

  message.destroy();
}
