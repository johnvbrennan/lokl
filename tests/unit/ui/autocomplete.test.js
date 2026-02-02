import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getAutocompleteMatches } from '../../../src/ui/autocomplete.js';

// Mock the game state
vi.mock('../../../src/game/gameState.js', () => ({
  gameState: {
    guesses: [
      { county: 'Dublin' },
      { county: 'Cork' }
    ],
    status: 'playing'
  }
}));

describe('autocomplete.js', () => {
  describe('getAutocompleteMatches', () => {
    it('should return empty array for empty input', () => {
      const matches = getAutocompleteMatches('');
      expect(matches).toEqual([]);
    });

    it('should return empty array for null input', () => {
      const matches = getAutocompleteMatches(null);
      expect(matches).toEqual([]);
    });

    it('should return matches starting with input', () => {
      const matches = getAutocompleteMatches('C');
      expect(matches.length).toBeGreaterThan(0);
      expect(matches.every(name => name.startsWith('C'))).toBe(true);
    });

    it('should be case insensitive', () => {
      const matchesLower = getAutocompleteMatches('c');
      const matchesUpper = getAutocompleteMatches('C');
      expect(matchesLower).toEqual(matchesUpper);
    });

    it('should exclude already guessed counties', () => {
      const matches = getAutocompleteMatches('D');
      expect(matches).not.toContain('Dublin');
    });

    it('should exclude Cork (already guessed)', () => {
      const matches = getAutocompleteMatches('Cor');
      expect(matches).not.toContain('Cork');
    });

    it('should return matches for partial input', () => {
      const matches = getAutocompleteMatches('Ga');
      expect(matches).toContain('Galway');
    });

    it('should return matches for single letter', () => {
      const matches = getAutocompleteMatches('K');
      // Should include Kerry, Kildare, Kilkenny, but not Cork (already guessed)
      expect(matches.some(name => name.startsWith('K'))).toBe(true);
    });

    it('should handle input with spaces', () => {
      const matches = getAutocompleteMatches('Down');
      expect(matches).toContain('Down');
    });

    it('should return empty for non-matching input', () => {
      const matches = getAutocompleteMatches('XYZ');
      expect(matches).toEqual([]);
    });

    it('should handle exact county name', () => {
      const matches = getAutocompleteMatches('Galway');
      expect(matches).toEqual(['Galway']);
    });

    it('should return multiple matches when multiple counties start with input', () => {
      const matches = getAutocompleteMatches('W');
      // Should include Waterford, Westmeath, Wexford, Wicklow
      expect(matches.length).toBeGreaterThan(1);
      expect(matches.every(name => name.startsWith('W'))).toBe(true);
    });
  });
});
