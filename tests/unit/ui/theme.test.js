import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getCurrentTheme, updateThemeButton } from '../../../src/ui/theme.js';

// Mock the store
vi.mock('../../../src/game/gameState.js', () => {
  let mockState = {
    settings: {
      theme: 'light'
    }
  };

  return {
    store: {
      getState: () => mockState,
      setState: (newState) => {
        mockState = { ...mockState, ...newState };
      },
      subscribe: vi.fn()
    }
  };
});

// Mock store actions
vi.mock('../../../src/store/actions.js', () => ({
  setTheme: (theme) => ({ settings: { theme } }),
  toggleTheme: () => ({ settings: { theme: 'dark' } })
}));

describe('theme.js', () => {
  beforeEach(() => {
    // Mock document methods
    document.documentElement.setAttribute = vi.fn();
    document.getElementById = vi.fn();
  });

  describe('getCurrentTheme', () => {
    it('should return current theme from store', () => {
      const theme = getCurrentTheme();
      expect(theme).toBe('light');
    });
  });

  describe('updateThemeButton', () => {
    it('should update button when element exists', () => {
      const mockIcon = { textContent: '' };
      const mockButton = {
        querySelector: vi.fn(() => mockIcon),
        title: ''
      };

      document.getElementById = vi.fn(() => mockButton);

      updateThemeButton('dark');

      expect(mockIcon.textContent).toBe('☀️');
      expect(mockButton.title).toBe('Switch to Light Mode');
    });

    it('should update button with light theme', () => {
      const mockIcon = { textContent: '' };
      const mockButton = {
        querySelector: vi.fn(() => mockIcon),
        title: ''
      };

      document.getElementById = vi.fn(() => mockButton);

      updateThemeButton('light');

      expect(mockIcon.textContent).toBe('🌙');
      expect(mockButton.title).toBe('Switch to Dark Mode');
    });

    it('should handle missing button gracefully', () => {
      document.getElementById = vi.fn(() => null);

      expect(() => {
        updateThemeButton('dark');
      }).not.toThrow();
    });

    it('should handle missing icon gracefully', () => {
      const mockButton = {
        querySelector: vi.fn(() => null),
        title: ''
      };

      document.getElementById = vi.fn(() => mockButton);

      expect(() => {
        updateThemeButton('dark');
      }).not.toThrow();

      expect(mockButton.title).toBe('Switch to Light Mode');
    });

    it('should read theme from store if not provided', () => {
      const mockIcon = { textContent: '' };
      const mockButton = {
        querySelector: vi.fn(() => mockIcon),
        title: ''
      };

      document.getElementById = vi.fn(() => mockButton);

      updateThemeButton(); // No theme parameter

      // Should use 'light' from store
      expect(mockIcon.textContent).toBe('🌙');
    });
  });
});
