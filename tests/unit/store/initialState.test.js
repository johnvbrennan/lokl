import { describe, it, expect } from 'vitest';
import {
  getInitialState,
  getDefaultGameState,
  getDefaultStatistics,
  getDefaultSettings,
  getDefaultUIState
} from '../../../src/store/initialState.js';

describe('initialState.js', () => {
  describe('getInitialState', () => {
    it('should return complete initial state structure', () => {
      const state = getInitialState();

      expect(state).toHaveProperty('game');
      expect(state).toHaveProperty('statistics');
      expect(state).toHaveProperty('settings');
      expect(state).toHaveProperty('ui');
    });

    it('should have correct game defaults', () => {
      const state = getInitialState();

      expect(state.game.targetCounty).toBeNull();
      expect(state.game.guesses).toEqual([]);
      expect(state.game.status).toBe('playing');
      expect(state.game.mode).toBe('daily');
      expect(state.game.gameNumber).toBe(0);
    });

    it('should have correct statistics defaults', () => {
      const state = getInitialState();

      expect(state.statistics.gamesPlayed).toBe(0);
      expect(state.statistics.gamesWon).toBe(0);
      expect(state.statistics.currentStreak).toBe(0);
      expect(state.statistics.bestStreak).toBe(0);
      expect(state.statistics.distribution).toEqual([0, 0, 0, 0, 0, 0]);
      expect(state.statistics.lastPlayedDate).toBeNull();
    });

    it('should have correct settings defaults', () => {
      const state = getInitialState();

      expect(state.settings.difficulty).toBe('medium');
      expect(state.settings.theme).toBe('light');
    });

    it('should have correct UI defaults', () => {
      const state = getInitialState();

      expect(state.ui.isLoading).toBe(false);
      expect(state.ui.activeModal).toBeNull();
      expect(state.ui.showConfetti).toBe(false);
      expect(state.ui.autocomplete.isOpen).toBe(false);
      expect(state.ui.autocomplete.selectedIndex).toBe(-1);
      expect(state.ui.autocomplete.matches).toEqual([]);
      expect(state.ui.toast.message).toBeNull();
      expect(state.ui.toast.visible).toBe(false);
    });
  });

  describe('getDefaultGameState', () => {
    it('should return default game state with daily mode', () => {
      const gameState = getDefaultGameState();

      expect(gameState.targetCounty).toBeNull();
      expect(gameState.guesses).toEqual([]);
      expect(gameState.status).toBe('playing');
      expect(gameState.mode).toBe('daily');
      expect(gameState.gameNumber).toBe(0);
    });

    it('should accept custom mode', () => {
      const practiceState = getDefaultGameState('practice');
      expect(practiceState.mode).toBe('practice');

      const locateState = getDefaultGameState('locate');
      expect(locateState.mode).toBe('locate');
    });
  });

  describe('getDefaultStatistics', () => {
    it('should return default statistics', () => {
      const stats = getDefaultStatistics();

      expect(stats.gamesPlayed).toBe(0);
      expect(stats.gamesWon).toBe(0);
      expect(stats.currentStreak).toBe(0);
      expect(stats.bestStreak).toBe(0);
      expect(stats.distribution).toEqual([0, 0, 0, 0, 0, 0]);
      expect(stats.lastPlayedDate).toBeNull();
    });

    it('should return a new object each time', () => {
      const stats1 = getDefaultStatistics();
      const stats2 = getDefaultStatistics();

      expect(stats1).not.toBe(stats2);
      expect(stats1).toEqual(stats2);
    });
  });

  describe('getDefaultSettings', () => {
    it('should return default settings', () => {
      const settings = getDefaultSettings();

      expect(settings.difficulty).toBe('medium');
      expect(settings.theme).toBe('light');
    });
  });

  describe('getDefaultUIState', () => {
    it('should return default UI state', () => {
      const ui = getDefaultUIState();

      expect(ui.isLoading).toBe(false);
      expect(ui.activeModal).toBeNull();
      expect(ui.showConfetti).toBe(false);
    });

    it('should have autocomplete defaults', () => {
      const ui = getDefaultUIState();

      expect(ui.autocomplete.isOpen).toBe(false);
      expect(ui.autocomplete.selectedIndex).toBe(-1);
      expect(ui.autocomplete.matches).toEqual([]);
    });

    it('should have toast defaults', () => {
      const ui = getDefaultUIState();

      expect(ui.toast.message).toBeNull();
      expect(ui.toast.visible).toBe(false);
    });
  });
});
