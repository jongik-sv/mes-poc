/**
 * @file confirm.spec.ts
 * @description 확인 다이얼로그 유틸리티 함수 단위 테스트
 * @task TSK-05-02
 * @requirements FR-001, FR-002, FR-003, BR-001, BR-002, BR-003, BR-004
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Modal } from 'antd';
import { confirmDelete, confirmDiscard, confirmBulkDelete } from '../confirm';

// Modal.confirm 모킹
vi.mock('antd', async () => {
  const actual = await vi.importActual<typeof import('antd')>('antd');
  return {
    ...actual,
    Modal: {
      ...actual.Modal,
      confirm: vi.fn(),
    },
  };
});

describe('confirmDelete', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * UT-001: 확인 클릭 시 Promise resolve
   * @requirement FR-001, BR-001
   */
  it('should resolve when OK clicked', async () => {
    const mockConfirm = vi.mocked(Modal.confirm);

    // OK 클릭 시뮬레이션
    mockConfirm.mockImplementation((config) => {
      // onOk 콜백 즉시 호출
      if (config?.onOk) {
        config.onOk();
      }
      return { destroy: vi.fn(), update: vi.fn() };
    });

    const result = await confirmDelete({
      title: '삭제 확인',
      content: '정말 삭제하시겠습니까?',
    });

    expect(result).toBe(true);
    expect(mockConfirm).toHaveBeenCalledTimes(1);
  });

  /**
   * UT-002: 삭제 버튼 danger 스타일 적용
   * @requirement FR-001, BR-002
   */
  it('should render danger button', () => {
    const mockConfirm = vi.mocked(Modal.confirm);
    mockConfirm.mockImplementation(() => ({ destroy: vi.fn(), update: vi.fn() }));

    confirmDelete({
      title: '삭제 확인',
      content: '정말 삭제하시겠습니까?',
    });

    expect(mockConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        okButtonProps: expect.objectContaining({
          danger: true,
        }),
      })
    );
  });

  it('should reject when Cancel clicked', async () => {
    const mockConfirm = vi.mocked(Modal.confirm);

    mockConfirm.mockImplementation((config) => {
      // onCancel 콜백 호출
      if (config?.onCancel) {
        config.onCancel();
      }
      return { destroy: vi.fn(), update: vi.fn() };
    });

    const result = await confirmDelete({
      title: '삭제 확인',
      content: '정말 삭제하시겠습니까?',
    });

    expect(result).toBe(false);
  });

  it('should use default title and okText when not provided', () => {
    const mockConfirm = vi.mocked(Modal.confirm);
    mockConfirm.mockImplementation(() => ({ destroy: vi.fn(), update: vi.fn() }));

    confirmDelete({
      content: '정말 삭제하시겠습니까?',
    });

    expect(mockConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '삭제 확인',
        okText: '삭제',
        cancelText: '취소',
      })
    );
  });

  it('should use custom itemName in message', () => {
    const mockConfirm = vi.mocked(Modal.confirm);
    mockConfirm.mockImplementation(() => ({ destroy: vi.fn(), update: vi.fn() }));

    confirmDelete({
      itemName: '사용자 "홍길동"',
    });

    expect(mockConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.stringContaining('사용자 "홍길동"'),
      })
    );
  });
});

describe('confirmDiscard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * UT-003: dirty=true일 때 확인 다이얼로그 표시
   * @requirement FR-002, BR-004
   */
  it('should show dialog when dirty', async () => {
    const mockConfirm = vi.mocked(Modal.confirm);

    mockConfirm.mockImplementation((config) => {
      if (config?.onOk) {
        config.onOk();
      }
      return { destroy: vi.fn(), update: vi.fn() };
    });

    await confirmDiscard({ isDirty: true });

    expect(mockConfirm).toHaveBeenCalledTimes(1);
    expect(mockConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.stringContaining('저장하지 않은'),
      })
    );
  });

  /**
   * UT-004: dirty=false일 때 경고 없이 즉시 resolve
   * @requirement FR-002, BR-004
   */
  it('should proceed without dialog when not dirty', async () => {
    const mockConfirm = vi.mocked(Modal.confirm);

    const result = await confirmDiscard({ isDirty: false });

    expect(result).toBe(true);
    expect(mockConfirm).not.toHaveBeenCalled();
  });

  it('should return false when cancel clicked', async () => {
    const mockConfirm = vi.mocked(Modal.confirm);

    mockConfirm.mockImplementation((config) => {
      if (config?.onCancel) {
        config.onCancel();
      }
      return { destroy: vi.fn(), update: vi.fn() };
    });

    const result = await confirmDiscard({ isDirty: true });

    expect(result).toBe(false);
  });

  it('should use custom title when provided', () => {
    const mockConfirm = vi.mocked(Modal.confirm);
    mockConfirm.mockImplementation(() => ({ destroy: vi.fn(), update: vi.fn() }));

    confirmDiscard({
      isDirty: true,
      title: '변경사항 경고',
    });

    expect(mockConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '변경사항 경고',
      })
    );
  });
});

describe('confirmBulkDelete', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * UT-005: 건수가 메시지에 표시됨
   * @requirement FR-003, BR-003
   */
  it('should display count in message', () => {
    const mockConfirm = vi.mocked(Modal.confirm);
    mockConfirm.mockImplementation(() => ({ destroy: vi.fn(), update: vi.fn() }));

    confirmBulkDelete({ count: 50 });

    expect(mockConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.stringContaining('50건'),
      })
    );
  });

  /**
   * UT-006: 취소 클릭 시 Promise reject(false 반환)
   * @requirement FR-003, BR-003
   */
  it('should return false when canceled', async () => {
    const mockConfirm = vi.mocked(Modal.confirm);

    mockConfirm.mockImplementation((config) => {
      if (config?.onCancel) {
        config.onCancel();
      }
      return { destroy: vi.fn(), update: vi.fn() };
    });

    const result = await confirmBulkDelete({ count: 10 });

    expect(result).toBe(false);
  });

  it('should return true when confirmed', async () => {
    const mockConfirm = vi.mocked(Modal.confirm);

    mockConfirm.mockImplementation((config) => {
      if (config?.onOk) {
        config.onOk();
      }
      return { destroy: vi.fn(), update: vi.fn() };
    });

    const result = await confirmBulkDelete({ count: 5 });

    expect(result).toBe(true);
  });

  it('should render danger button for bulk delete', () => {
    const mockConfirm = vi.mocked(Modal.confirm);
    mockConfirm.mockImplementation(() => ({ destroy: vi.fn(), update: vi.fn() }));

    confirmBulkDelete({ count: 3 });

    expect(mockConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        okButtonProps: expect.objectContaining({
          danger: true,
        }),
      })
    );
  });

  it('should use custom action name when provided', () => {
    const mockConfirm = vi.mocked(Modal.confirm);
    mockConfirm.mockImplementation(() => ({ destroy: vi.fn(), update: vi.fn() }));

    confirmBulkDelete({
      count: 5,
      action: '상태 변경',
    });

    expect(mockConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.stringContaining('상태 변경'),
      })
    );
  });

  it('should handle different count values correctly', () => {
    const mockConfirm = vi.mocked(Modal.confirm);
    mockConfirm.mockImplementation(() => ({ destroy: vi.fn(), update: vi.fn() }));

    // 1건
    confirmBulkDelete({ count: 1 });
    expect(mockConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.stringContaining('1건'),
      })
    );

    vi.clearAllMocks();

    // 100건
    confirmBulkDelete({ count: 100 });
    expect(mockConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.stringContaining('100건'),
      })
    );
  });
});
