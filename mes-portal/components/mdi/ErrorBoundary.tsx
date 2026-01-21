'use client';

/**
 * ErrorBoundary 컴포넌트
 * @description TSK-02-05 MDI 컨텐츠 영역 - 에러 격리 바운더리
 */

import { Component, ReactNode, ErrorInfo } from 'react';

interface ErrorBoundaryProps {
  /** 자식 컴포넌트 */
  children: ReactNode;
  /** 에러 발생 시 표시할 폴백 UI */
  fallback: ReactNode | ((props: { error: Error; resetErrorBoundary: () => void }) => ReactNode);
  /** 에러 발생 시 콜백 */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary 컴포넌트
 * @description 자식 컴포넌트에서 발생한 에러를 격리하여 다른 컴포넌트에 영향을 주지 않음
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.props.onError?.(error, errorInfo);
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  resetErrorBoundary = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const { fallback } = this.props;

      if (typeof fallback === 'function') {
        return fallback({
          error: this.state.error,
          resetErrorBoundary: this.resetErrorBoundary,
        });
      }

      return fallback;
    }

    return this.props.children;
  }
}
