import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  loadStatistics,
  saveStatistics,
  loadDailyState,
  saveDailyState,
  loadSettings,
  saveSettings,
  loadTheme,
  saveTheme
} from '../../../src/storage/persistence.js';

describe('persistence.js', () => {
  let mockLocalStorage;

  beforeEach(() => {
    // Create a fresh mock localStorage before each test
    mockLocalStorage = {
      store: {},
      getItem(key) {
        return this.store[key] || null;
      },
      setItem(key, value) {
        this.store[key] = value.toString();
      },
      removeItem(key) {
        delete this.store[key];
      },
      clear() {
        this.store = {};
      }
    };

    // Replace global localStorage with mock
    global.localStorage = mockLocalStorage;

    // Mock console.error to avoid cluttering test output
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  describe('loadStatistics', () => {
    it('should load statistics from localStorage', () => {
      const stats = {
        gamesPlayed: 10,
        gamesWon: 7,
        currentStreak: 3,
        bestStreak: 5,
        distribution: [1, 2, 2, 1, 1, 0],
        lastPlayedDate: '2026-02-14'
      };

      localStorage.setItem('loklStats', JSON.stringify(stats));

      const loaded = loadStatistics();

      expect(loaded).toEqual(stats);
    });

    it('should return default statistics if none saved', () => {
      const defaults = loadStatistics();

      expect(defaults).toEqual({
        gamesPlayed: 0,
        gamesWon: 0,
        currentStreak: 0,
        bestStreak: 0,
        distribution: [0, 0, 0, 0, 0, 0],
        lastPlayedDate: null
      });
    });

    it('should return defaults if localStorage data is corrupted', () => {
      localStorage.setItem('loklStats', 'invalid-json');

      const loaded = loadStatistics();

      expect(loaded.gamesPlayed).toBe(0);
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle localStorage errors gracefully', () => {
      vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
        throw new Error('Storage error');
      });

      const loaded = loadStatistics();

      expect(loaded.gamesPlayed).toBe(0);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('saveStatistics', () => {
    it('should save statistics to localStorage', () => {
      const stats = {
        gamesPlayed: 10,
        gamesWon: 7,
        currentStreak: 3,
        bestStreak: 5,
        distribution: [1, 2, 2, 1, 1, 0],
        lastPlayedDate: '2026-02-14'
      };

      saveStatistics(stats);

      const saved = localStorage.getItem('loklStats');
      expect(JSON.parse(saved)).toEqual(stats);
    });

    it('should handle localStorage errors gracefully', () => {
      vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
        throw new Error('Storage error');
      });

      const stats = { gamesPlayed: 5 };

      expect(() => saveStatistics(stats)).not.toThrow();
      expect(console.error).toHaveBeenCalled();
    });

    it('should overwrite existing statistics', () => {
      const oldStats = { gamesPlayed: 5 };
      const newStats = { gamesPlayed: 10 };

      saveStatistics(oldStats);
      saveStatistics(newStats);

      const saved = localStorage.getItem('loklStats');
      expect(JSON.parse(saved).gamesPlayed).toBe(10);
    });
  });

  describe('loadDailyState', () => {
    it('should load daily state from localStorage', () => {
      const dailyState = {
        date: '2026-02-15',
        guesses: [{ county: 'Dublin', distance: 219 }],
        status: 'playing'
      };

      localStorage.setItem('loklDaily', JSON.stringify(dailyState));

      const loaded = loadDailyState();

      expect(loaded).toEqual(dailyState);
    });

    it('should return null if no state saved', () => {
      const loaded = loadDailyState();

      expect(loaded).toBeNull();
    });

    it('should return null if data is corrupted', () => {
      localStorage.setItem('loklDaily', 'invalid-json');

      const loaded = loadDailyState();

      expect(loaded).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle localStorage errors gracefully', () => {
      vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
        throw new Error('Storage error');
      });

      const loaded = loadDailyState();

      expect(loaded).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('saveDailyState', () => {
    it('should save daily state to localStorage', () => {
      const dailyState = {
        date: '2026-02-15',
        guesses: [{ county: 'Dublin', distance: 219 }],
        status: 'playing'
      };

      saveDailyState(dailyState);

      const saved = localStorage.getItem('loklDaily');
      expect(JSON.parse(saved)).toEqual(dailyState);
    });

    it('should handle localStorage errors gracefully', () => {
      vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
        throw new Error('Storage error');
      });

      const state = { date: '2026-02-15' };

      expect(() => saveDailyState(state)).not.toThrow();
      expect(console.error).toHaveBeenCalled();
    });

    it('should overwrite existing daily state', () => {
      const oldState = { status: 'playing' };
      const newState = { status: 'won' };

      saveDailyState(oldState);
      saveDailyState(newState);

      const saved = localStorage.getItem('loklDaily');
      expect(JSON.parse(saved).status).toBe('won');
    });
  });

  describe('loadSettings', () => {
    it('should load settings from localStorage', () => {
      const settings = { difficulty: 'hard' };

      localStorage.setItem('loklSettings', JSON.stringify(settings));

      const loaded = loadSettings();

      expect(loaded).toEqual(settings);
    });

    it('should return default settings if none saved', () => {
      const defaults = loadSettings();

      expect(defaults).toEqual({
        difficulty: 'medium'
      });
    });

    it('should validate difficulty and reset if invalid', () => {
      const invalidSettings = { difficulty: 'impossible' };

      localStorage.setItem('loklSettings', JSON.stringify(invalidSettings));

      const loaded = loadSettings();

      expect(loaded.difficulty).toBe('medium');
      expect(console.warn).toHaveBeenCalled();
    });

    it('should return defaults if data is corrupted', () => {
      localStorage.setItem('loklSettings', 'invalid-json');

      const loaded = loadSettings();

      expect(loaded.difficulty).toBe('medium');
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle localStorage errors gracefully', () => {
      vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
        throw new Error('Storage error');
      });

      const loaded = loadSettings();

      expect(loaded.difficulty).toBe('medium');
      expect(console.error).toHaveBeenCalled();
    });

    it('should accept valid difficulty levels', () => {
      ['easy', 'medium', 'hard'].forEach(difficulty => {
        localStorage.clear();
        localStorage.setItem('loklSettings', JSON.stringify({ difficulty }));

        const loaded = loadSettings();

        expect(loaded.difficulty).toBe(difficulty);
      });
    });
  });

  describe('saveSettings', () => {
    it('should save settings to localStorage', () => {
      const settings = { difficulty: 'hard' };

      saveSettings(settings);

      const saved = localStorage.getItem('loklSettings');
      expect(JSON.parse(saved)).toEqual(settings);
    });

    it('should handle localStorage errors gracefully', () => {
      vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
        throw new Error('Storage error');
      });

      const settings = { difficulty: 'easy' };

      expect(() => saveSettings(settings)).not.toThrow();
      expect(console.error).toHaveBeenCalled();
    });

    it('should overwrite existing settings', () => {
      const oldSettings = { difficulty: 'easy' };
      const newSettings = { difficulty: 'hard' };

      saveSettings(oldSettings);
      saveSettings(newSettings);

      const saved = localStorage.getItem('loklSettings');
      expect(JSON.parse(saved).difficulty).toBe('hard');
    });
  });

  describe('loadTheme', () => {
    it('should load theme from localStorage', () => {
      localStorage.setItem('loklTheme', 'dark');

      const theme = loadTheme();

      expect(theme).toBe('dark');
    });

    it('should return light as default theme', () => {
      const theme = loadTheme();

      expect(theme).toBe('light');
    });

    it('should handle localStorage errors gracefully', () => {
      vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
        throw new Error('Storage error');
      });

      const theme = loadTheme();

      expect(theme).toBe('light');
      expect(console.error).toHaveBeenCalled();
    });

    it('should return stored theme value as-is', () => {
      localStorage.setItem('loklTheme', 'custom-theme');

      const theme = loadTheme();

      expect(theme).toBe('custom-theme');
    });
  });

  describe('saveTheme', () => {
    it('should save theme to localStorage', () => {
      saveTheme('dark');

      const saved = localStorage.getItem('loklTheme');
      expect(saved).toBe('dark');
    });

    it('should handle localStorage errors gracefully', () => {
      vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
        throw new Error('Storage error');
      });

      expect(() => saveTheme('dark')).not.toThrow();
      expect(console.error).toHaveBeenCalled();
    });

    it('should overwrite existing theme', () => {
      saveTheme('light');
      saveTheme('dark');

      const saved = localStorage.getItem('loklTheme');
      expect(saved).toBe('dark');
    });

    it('should save any string value', () => {
      const customTheme = 'custom-theme';

      saveTheme(customTheme);

      const saved = localStorage.getItem('loklTheme');
      expect(saved).toBe(customTheme);
    });
  });
});
