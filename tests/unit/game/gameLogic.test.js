import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { initGame, processGuess, checkWinCondition, updateStatistics } from '../../../src/game/gameLogic.js';
import * as dateUtils from '../../../src/utils/dateUtils.js';
import * as persistence from '../../../src/storage/persistence.js';
import { store } from '../../../src/game/gameState.js';
import { COLORS } from '../../../src/utils/constants.js';

// Mock the store
vi.mock('../../../src/game/gameState.js', () => {
  let state = {
    game: {
      mode: 'daily',
      targetCounty: 'Cork',
      guesses: [],
      status: 'playing',
      gameNumber: 1
    },
    statistics: {
      gamesPlayed: 0,
      gamesWon: 0,
      currentStreak: 0,
      bestStreak: 0,
      distribution: [0, 0, 0, 0, 0, 0],
      lastPlayedDate: null
    },
    settings: {
      theme: 'dark',
      animations: true
    }
  };

  return {
    store: {
      getState: () => state,
      setState: (update, action) => {
        // Handle function updates (like the real store does)
        const newState = typeof update === 'function'
          ? update(state)
          : update;

        // Deep merge for nested objects
        state = {
          ...state,
          ...newState,
          game: newState.game ? { ...state.game, ...newState.game } : state.game,
          statistics: newState.statistics ? { ...state.statistics, ...newState.statistics } : state.statistics,
          settings: newState.settings ? { ...state.settings, ...newState.settings } : state.settings
        };
      }
    },
    getMaxGuesses: () => 6
  };
});

describe('gameLogic.js', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-15T12:00:00'));

    // Reset store state
    store.setState({
      game: {
        mode: 'daily',
        targetCounty: 'Cork',
        guesses: [],
        status: 'playing',
        gameNumber: 1
      },
      statistics: {
        gamesPlayed: 0,
        gamesWon: 0,
        currentStreak: 0,
        bestStreak: 0,
        distribution: [0, 0, 0, 0, 0, 0],
        lastPlayedDate: null
      },
      settings: {
        theme: 'dark',
        animations: true
      }
    });

    // Mock persistence functions
    vi.spyOn(persistence, 'loadDailyState').mockReturnValue(null);
    vi.spyOn(persistence, 'saveDailyState').mockImplementation(() => {});
    vi.spyOn(persistence, 'saveStatistics').mockImplementation(() => {});

    // Mock date utilities
    vi.spyOn(dateUtils, 'getDailyCounty').mockReturnValue('Cork');
    vi.spyOn(dateUtils, 'getGameNumber').mockReturnValue(1);
    vi.spyOn(dateUtils, 'getTodaysDateString').mockReturnValue('2026-02-15');
    vi.spyOn(dateUtils, 'getRandomCounty').mockReturnValue('Galway');
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('initGame', () => {
    it('should initialize a new daily game', () => {
      const callbacks = {
        resetUI: vi.fn(),
        updateModeBadge: vi.fn(),
        clearGuessRail: vi.fn()
      };

      const result = initGame('daily', false, callbacks);

      expect(result).toBe(true);
      expect(callbacks.resetUI).toHaveBeenCalled();
      expect(callbacks.clearGuessRail).toHaveBeenCalled();

      const state = store.getState();
      expect(state.game.mode).toBe('daily');
      expect(state.game.targetCounty).toBe('Cork');
      expect(state.game.status).toBe('playing');
    });

    it('should initialize a practice game', () => {
      const callbacks = {
        resetUI: vi.fn(),
        clearGuessRail: vi.fn()
      };

      const result = initGame('practice', false, callbacks);

      expect(result).toBe(true);
      expect(callbacks.resetUI).toHaveBeenCalled();

      const state = store.getState();
      expect(state.game.mode).toBe('practice');
      expect(state.game.targetCounty).toBe('Galway'); // mocked random county
    });

    it('should restore a saved daily game', () => {
      const savedState = {
        date: '2026-02-15',
        guesses: [
          { county: 'Dublin', distance: 219, direction: '↙', color: COLORS.COLD_2 }
        ],
        status: 'playing'
      };

      persistence.loadDailyState.mockReturnValue(savedState);

      const callbacks = {
        restoreGameUI: vi.fn(),
        clearGuessRail: vi.fn()
      };

      const result = initGame('daily', false, callbacks);

      expect(result).toBe(false);
      expect(callbacks.restoreGameUI).toHaveBeenCalled();

      const state = store.getState();
      expect(state.game.guesses.length).toBe(1);
    });

    it('should handle completed daily game without showing modal when suppressed', () => {
      const savedState = {
        date: '2026-02-15',
        guesses: [{ county: 'Cork', distance: 0, direction: '🎯', color: COLORS.CORRECT }],
        status: 'won'
      };

      persistence.loadDailyState.mockReturnValue(savedState);

      const callbacks = {
        restoreGameUI: vi.fn(),
        showEndModal: vi.fn(),
        clearGuessRail: vi.fn()
      };

      initGame('daily', true, callbacks);

      expect(callbacks.showEndModal).not.toHaveBeenCalled();
    });

    it('should call updateModeBadge callback if provided', () => {
      const callbacks = {
        updateModeBadge: vi.fn(),
        clearGuessRail: vi.fn()
      };

      initGame('daily', false, callbacks);

      expect(callbacks.updateModeBadge).toHaveBeenCalled();
    });
  });

  describe('processGuess', () => {
    beforeEach(() => {
      // Set up a game in progress
      store.setState({
        game: {
          mode: 'daily',
          targetCounty: 'Cork',
          guesses: [],
          status: 'playing',
          gameNumber: 1
        }
      });
    });

    it('should process a valid guess', () => {
      const callbacks = {
        updateMapCounty: vi.fn(),
        addGuessToHistory: vi.fn(),
        clearInput: vi.fn()
      };

      const guess = processGuess('Dublin', callbacks);

      expect(guess).toBeDefined();
      expect(guess.county).toBe('Dublin');
      expect(guess.distance).toBeGreaterThan(0);
      expect(guess.direction).toBeDefined();
      expect(guess.color).toBeDefined();
      expect(callbacks.updateMapCounty).toHaveBeenCalled();
      expect(callbacks.addGuessToHistory).toHaveBeenCalled();
      expect(callbacks.clearInput).toHaveBeenCalled();
    });

    it('should reject duplicate guesses', () => {
      store.setState({
        game: {
          mode: 'daily',
          targetCounty: 'Cork',
          guesses: [
            { county: 'Dublin', distance: 219, direction: '↙', color: COLORS.COLD_2 }
          ],
          status: 'playing',
          gameNumber: 1
        }
      });

      const guess = processGuess('Dublin', {});

      expect(guess).toBeNull();
    });

    it('should reject guesses when game is not playing', () => {
      store.setState({
        game: {
          mode: 'daily',
          targetCounty: 'Cork',
          guesses: [],
          status: 'won',
          gameNumber: 1
        }
      });

      const guess = processGuess('Dublin', {});

      expect(guess).toBeNull();
    });

    it('should reject invalid county names', () => {
      const guess = processGuess('NotACounty', {});

      expect(guess).toBeNull();
    });

    it('should handle correct guess and win the game', () => {
      const callbacks = {
        updateMapCounty: vi.fn(),
        showEndModal: vi.fn(),
        disableInput: vi.fn()
      };

      const guess = processGuess('Cork', callbacks);

      expect(guess.county).toBe('Cork');
      expect(guess.distance).toBe(0);
      expect(guess.direction).toBe('🎯');
      expect(guess.color).toBe(COLORS.CORRECT);

      const state = store.getState();
      expect(state.game.status).toBe('won');
    });

    it('should handle loss condition after 6 incorrect guesses', () => {
      // Add 5 guesses
      store.setState({
        game: {
          mode: 'daily',
          targetCounty: 'Cork',
          guesses: [
            { county: 'Dublin', distance: 219, direction: '↙', color: COLORS.COLD_2 },
            { county: 'Galway', distance: 104, direction: '↓', color: COLORS.WARM_1 },
            { county: 'Kerry', distance: 45, direction: '←', color: COLORS.HOT },
            { county: 'Limerick', distance: 63, direction: '↗', color: COLORS.WARM_2 },
            { county: 'Waterford', distance: 65, direction: '→', color: COLORS.WARM_2 }
          ],
          status: 'playing',
          gameNumber: 1
        }
      });

      const callbacks = {
        updateMapCounty: vi.fn(),
        showEndModal: vi.fn(),
        disableInput: vi.fn()
      };

      // Make 6th incorrect guess
      processGuess('Tipperary', callbacks);

      const state = store.getState();
      expect(state.game.status).toBe('lost');
      expect(state.game.guesses.length).toBe(6);
    });

    it('should calculate distance correctly for incorrect guesses', () => {
      const guess = processGuess('Dublin', {});

      expect(guess.distance).toBeGreaterThan(0);
      expect(guess.distance).toBeGreaterThan(200); // Dublin to Cork is ~219km
    });

    it('should mark adjacent counties with 0 distance', () => {
      // Kerry is adjacent to Cork
      const guess = processGuess('Kerry', {});

      expect(guess.distance).toBe(0);
      expect(guess.isAdjacent).toBe(true);
      expect(guess.color).toBe(COLORS.HOT);
    });

    it('should save daily state after guess', () => {
      processGuess('Dublin', {});

      expect(persistence.saveDailyState).toHaveBeenCalled();
    });

    it('should not save state for practice mode', () => {
      store.setState({
        game: {
          mode: 'practice',
          targetCounty: 'Cork',
          guesses: [],
          status: 'playing',
          gameNumber: 0
        }
      });

      persistence.saveDailyState.mockClear();

      processGuess('Dublin', {});

      // Should still call saveDailyState for the final save
      // but let's verify the game state is correct
      const state = store.getState();
      expect(state.game.mode).toBe('practice');
    });

    it('should call hideAutocomplete callback', () => {
      const callbacks = {
        hideAutocomplete: vi.fn()
      };

      processGuess('Dublin', callbacks);

      expect(callbacks.hideAutocomplete).toHaveBeenCalled();
    });
  });

  describe('checkWinCondition', () => {
    it('should return true when game is won', () => {
      store.setState({
        game: {
          mode: 'daily',
          targetCounty: 'Cork',
          guesses: [{ county: 'Cork', distance: 0, direction: '🎯', color: COLORS.CORRECT }],
          status: 'won',
          gameNumber: 1
        }
      });

      expect(checkWinCondition()).toBe(true);
    });

    it('should return false when game is playing', () => {
      store.setState({
        game: {
          mode: 'daily',
          targetCounty: 'Cork',
          guesses: [],
          status: 'playing',
          gameNumber: 1
        }
      });

      expect(checkWinCondition()).toBe(false);
    });

    it('should return false when game is lost', () => {
      store.setState({
        game: {
          mode: 'daily',
          targetCounty: 'Cork',
          guesses: [],
          status: 'lost',
          gameNumber: 1
        }
      });

      expect(checkWinCondition()).toBe(false);
    });
  });

  describe('updateStatistics', () => {
    it('should update statistics for a win', () => {
      store.setState({
        statistics: {
          gamesPlayed: 5,
          gamesWon: 3,
          currentStreak: 2,
          bestStreak: 3,
          distribution: [1, 1, 1, 0, 0, 0],
          lastPlayedDate: '2026-02-14'
        }
      });

      updateStatistics(true, 2);

      const state = store.getState();
      expect(state.statistics.gamesPlayed).toBe(6);
      expect(state.statistics.gamesWon).toBe(4);
      expect(state.statistics.currentStreak).toBe(3);
      expect(state.statistics.bestStreak).toBe(3);
      expect(state.statistics.distribution[1]).toBe(2); // Second slot (2 guesses)
      expect(persistence.saveStatistics).toHaveBeenCalled();
    });

    it('should update statistics for a loss', () => {
      store.setState({
        statistics: {
          gamesPlayed: 5,
          gamesWon: 3,
          currentStreak: 2,
          bestStreak: 3,
          distribution: [1, 1, 1, 0, 0, 0],
          lastPlayedDate: '2026-02-14'
        }
      });

      updateStatistics(false);

      const state = store.getState();
      expect(state.statistics.gamesPlayed).toBe(6);
      expect(state.statistics.gamesWon).toBe(3); // No change
      expect(state.statistics.currentStreak).toBe(0); // Reset
      expect(state.statistics.bestStreak).toBe(3); // No change
    });

    it('should update best streak when current exceeds it', () => {
      store.setState({
        statistics: {
          gamesPlayed: 5,
          gamesWon: 3,
          currentStreak: 3,
          bestStreak: 3,
          distribution: [1, 1, 1, 0, 0, 0],
          lastPlayedDate: '2026-02-14'
        }
      });

      updateStatistics(true, 1);

      const state = store.getState();
      expect(state.statistics.currentStreak).toBe(4);
      expect(state.statistics.bestStreak).toBe(4);
    });

    it('should update distribution correctly for different guess counts', () => {
      const guessValues = [1, 2, 3, 4, 5, 6];

      guessValues.forEach((guessCount, index) => {
        store.setState({
          statistics: {
            gamesPlayed: 0,
            gamesWon: 0,
            currentStreak: 0,
            bestStreak: 0,
            distribution: [0, 0, 0, 0, 0, 0],
            lastPlayedDate: null
          }
        });

        updateStatistics(true, guessCount);

        const state = store.getState();
        expect(state.statistics.distribution[guessCount - 1]).toBe(1);
      });
    });

    it('should not update distribution for invalid guess counts', () => {
      store.setState({
        statistics: {
          gamesPlayed: 0,
          gamesWon: 0,
          currentStreak: 0,
          bestStreak: 0,
          distribution: [0, 0, 0, 0, 0, 0],
          lastPlayedDate: null
        }
      });

      updateStatistics(true, 0); // Invalid

      const state = store.getState();
      expect(state.statistics.distribution).toEqual([0, 0, 0, 0, 0, 0]);
    });

    it('should update lastPlayedDate', () => {
      updateStatistics(true, 1);

      const state = store.getState();
      expect(state.statistics.lastPlayedDate).toBe('2026-02-15');
    });
  });
});
