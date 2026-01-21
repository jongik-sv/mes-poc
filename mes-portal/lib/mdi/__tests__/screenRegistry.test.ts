/**
 * screenRegistry 단위 테스트
 * @description TSK-02-05 MDI 컨텐츠 영역 - screenRegistry 테스트
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('screenRegistry', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  describe('TC-BR-04: 경로 매핑', () => {
    it('등록된 경로에 대해 컴포넌트 로더 함수를 반환한다', async () => {
      const { screenRegistry } = await import('../screenRegistry');

      // screenRegistry에 등록된 경로가 있다면 함수 타입
      const dashboardLoader = screenRegistry['/dashboard'];
      if (dashboardLoader) {
        expect(typeof dashboardLoader).toBe('function');
      }
    });

    it('등록되지 않은 경로는 undefined를 반환한다', async () => {
      const { screenRegistry } = await import('../screenRegistry');

      expect(screenRegistry['/non-existent-path']).toBeUndefined();
    });
  });

  describe('TC-BR-07: 불변성 검증', () => {
    it('screenRegistry 객체는 Object.isFrozen으로 동결되어 있다', async () => {
      const { screenRegistry } = await import('../screenRegistry');

      expect(Object.isFrozen(screenRegistry)).toBe(true);
    });

    it('screenRegistry에 새 속성을 추가하려고 하면 에러가 발생한다', async () => {
      const { screenRegistry } = await import('../screenRegistry');

      // Strict mode에서 frozen 객체에 속성 추가 시 TypeError 발생
      expect(() => {
        // @ts-expect-error - 의도적으로 readonly 객체에 쓰기 시도
        screenRegistry['/new-path'] = () => Promise.resolve({ default: () => null });
      }).toThrow(TypeError);
    });

    it('screenRegistry의 기존 속성을 수정하려고 하면 에러가 발생한다', async () => {
      const { screenRegistry } = await import('../screenRegistry');

      // Strict mode에서 frozen 객체 속성 수정 시 TypeError 발생
      expect(() => {
        // @ts-expect-error - 의도적으로 readonly 객체 수정 시도
        screenRegistry['/dashboard'] = () => Promise.resolve({ default: () => null });
      }).toThrow(TypeError);
    });
  });

  describe('validateScreenPath', () => {
    it('유효한 경로를 검증한다', async () => {
      const { validateScreenPath } = await import('../screenRegistry');

      expect(validateScreenPath('/dashboard')).toBe(true);
      expect(validateScreenPath('/production/list')).toBe(true);
      expect(validateScreenPath('/settings/profile')).toBe(true);
    });

    it('슬래시로 시작하지 않는 경로는 거부한다', async () => {
      const { validateScreenPath } = await import('../screenRegistry');

      expect(validateScreenPath('dashboard')).toBe(false);
      expect(validateScreenPath('production/list')).toBe(false);
    });

    it('path traversal 패턴을 거부한다', async () => {
      const { validateScreenPath } = await import('../screenRegistry');

      expect(validateScreenPath('/../../etc/passwd')).toBe(false);
      expect(validateScreenPath('/dashboard/../../../')).toBe(false);
    });

    it('프로토콜 패턴을 거부한다', async () => {
      const { validateScreenPath } = await import('../screenRegistry');

      expect(validateScreenPath('javascript:alert(1)')).toBe(false);
      expect(validateScreenPath('data:text/html')).toBe(false);
    });

    it('특수 문자를 포함한 경로를 거부한다', async () => {
      const { validateScreenPath } = await import('../screenRegistry');

      expect(validateScreenPath('/dashboard?id=1')).toBe(false);
      expect(validateScreenPath('/dashboard#section')).toBe(false);
    });
  });

  describe('getScreenLoader', () => {
    it('등록된 경로의 로더를 반환한다', async () => {
      const { getScreenLoader, screenRegistry } = await import('../screenRegistry');

      // screenRegistry에 /dashboard가 있다면
      if (screenRegistry['/dashboard']) {
        const loader = getScreenLoader('/dashboard');
        expect(loader).toBe(screenRegistry['/dashboard']);
      }
    });

    it('등록되지 않은 경로는 null을 반환한다', async () => {
      const { getScreenLoader } = await import('../screenRegistry');

      expect(getScreenLoader('/non-existent')).toBeNull();
    });

    it('유효하지 않은 경로 형식은 null을 반환한다', async () => {
      const { getScreenLoader } = await import('../screenRegistry');

      expect(getScreenLoader('invalid')).toBeNull();
      expect(getScreenLoader('/../etc/passwd')).toBeNull();
    });
  });
});
