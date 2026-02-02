import { describe, it, expect } from 'vitest';
import {
  getGameState,
  getStatistics,
  getSettings,
  getUIState,
  getCurrentGuesses,
  getTargetCounty,
  getGameStatus,
  getGameMode,
  getGameNumber,
  getTheme,
  getDifficulty
} from '../../../src/store/selectors.js';

describe('selectors.js', () => {
  const mockState = {
    game: {
      targetCounty: 'Cork',
      guesses: [
        { county: 'Dublin', distance: 219, direction: '↙', color: '#2980b9' }
      ],
      status: 'playing',
      mode: 'daily',
      gameNumber: 42
    },
    statistics: {
      gamesPlayed: 10,
      gamesWon: 7,
      currentStreak: 3,
      bestStreak: 5,
      distribution: [1, 2, 2, 1, 1, 0],
      lastPlayedDate: '2026-02-14'
    },
    settings: {
      difficulty: 'hard',
      theme: 'dark'
    },
    ui: {
      isLoading: true,
      activeModal: 'help',
      showConfetti: false,
      autocomplete: {
        isOpen: true,
        selectedIndex: 2,
        matches: ['Cork', 'Carlow']
      },
      toast: {
        message: 'Test message',
        visible: true
      }
    }
  };

  describe('getGameState', () => {
    it('should return game state', () => {
      const gameState = getGameState(mockState);
      expect(gameState).toEqual(mockState.game);
    });
  });

  describe('getStatistics', () => {
    it('should return statistics', () => {
      const stats = getStatistics(mockState);
      expect(stats).toEqual(mockState.statistics);
    });
  });

  describe('getSettings', () => {
    it('should return settings', () => {
      const settings = getSettings(mockState);
      expect(settings).toEqual(mockState.settings);
    });
  });

  describe('getUIState', () => {
    it('should return UI state', () => {
      const ui = getUIState(mockState);
      expect(ui).toEqual(mockState.ui);
    });
  });

  describe('getCurrentGuesses', () => {
    it('should return current guesses array', () => {
      const guesses = getCurrentGuesses(mockState);
      expect(guesses).toEqual(mockState.game.guesses);
      expect(guesses.length).toBe(1);
    });
  });

  describe('getTargetCounty', () => {
    it('should return target county name', () => {
      const target = getTargetCounty(mockState);
      expect(target).toBe('Cork');
    });
  });

  describe('getGameStatus', () => {
    it('should return game status', () => {
      const status = getGameStatus(mockState);
      expect(status).toBe('playing');
    });
  });

  describe('getGameMode', () => {
    it('should return game mode', () => {
      const mode = getGameMode(mockState);
      expect(mode).toBe('daily');
    });
  });

  describe('getGameNumber', () => {
    it('should return game number', () => {
      const gameNum = getGameNumber(mockState);
      expect(gameNum).toBe(42);
    });
  });

  describe('getTheme', () => {
    it('should return current theme', () => {
      const theme = getTheme(mockState);
      expect(theme).toBe('dark');
    });
  });

  describe('getDifficulty', () => {
    it('should return current difficulty', () => {
      const difficulty = getDifficulty(mockState);
      expect(difficulty).toBe('hard');
    });
  });
});
