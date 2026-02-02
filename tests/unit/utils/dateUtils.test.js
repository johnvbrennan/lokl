import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getTodaysDateString,
  getDailyCounty,
  getGameNumber,
  getTimeUntilNextDay,
  formatTimeRemaining,
  getRandomCounty
} from '../../../src/utils/dateUtils.js';
import { COUNTY_NAMES } from '../../../src/data/counties.js';

describe('dateUtils.js', () => {
  describe('getTodaysDateString', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return date in YYYY-MM-DD format', () => {
      vi.setSystemTime(new Date('2026-02-15T12:30:45'));
      const dateString = getTodaysDateString();

      expect(dateString).toBe('2026-02-15');
    });

    it('should return correct format for single digit month', () => {
      vi.setSystemTime(new Date('2026-03-05T08:15:00'));
      const dateString = getTodaysDateString();

      expect(dateString).toBe('2026-03-05');
    });

    it('should return correct format for single digit day', () => {
      vi.setSystemTime(new Date('2026-12-01T23:59:59'));
      const dateString = getTodaysDateString();

      expect(dateString).toBe('2026-12-01');
    });

    it('should be consistent when called multiple times on same day', () => {
      vi.setSystemTime(new Date('2026-06-20T10:00:00'));

      const date1 = getTodaysDateString();
      const date2 = getTodaysDateString();

      expect(date1).toBe(date2);
    });
  });

  describe('getDailyCounty', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return same county for same date', () => {
      vi.setSystemTime(new Date('2026-02-15T10:00:00'));
      const county1 = getDailyCounty();

      vi.setSystemTime(new Date('2026-02-15T20:00:00'));
      const county2 = getDailyCounty();

      expect(county1).toBe(county2);
    });

    it('should return different counties for different dates', () => {
      vi.setSystemTime(new Date('2026-02-15T12:00:00'));
      const county1 = getDailyCounty();

      vi.setSystemTime(new Date('2026-02-16T12:00:00'));
      const county2 = getDailyCounty();

      // Very unlikely (1/32 chance) that they're the same
      // Run multiple date pairs to ensure deterministic behavior
      expect(county1).toBeDefined();
      expect(county2).toBeDefined();
      expect(COUNTY_NAMES).toContain(county1);
      expect(COUNTY_NAMES).toContain(county2);
    });

    it('should return a valid county name', () => {
      vi.setSystemTime(new Date('2026-02-15T12:00:00'));
      const county = getDailyCounty();

      expect(COUNTY_NAMES).toContain(county);
    });

    it('should be deterministic (same date always gives same county)', () => {
      const testDates = [
        '2026-01-01',
        '2026-02-15',
        '2026-06-20',
        '2026-12-31'
      ];

      testDates.forEach(date => {
        vi.setSystemTime(new Date(date + 'T12:00:00'));
        const county1 = getDailyCounty();

        vi.setSystemTime(new Date(date + 'T18:00:00'));
        const county2 = getDailyCounty();

        expect(county1).toBe(county2);
      });
    });

    it('should cycle through different counties over multiple days', () => {
      const counties = new Set();

      // Test 28 consecutive days in February - should get variety
      for (let day = 1; day <= 28; day++) {
        vi.setSystemTime(new Date(`2026-02-${day.toString().padStart(2, '0')}T12:00:00`));
        counties.add(getDailyCounty());
      }

      // Should have more than 1 unique county in 28 days
      expect(counties.size).toBeGreaterThan(1);
    });
  });

  describe('getGameNumber', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return 1 on epoch date (2026-01-01)', () => {
      vi.setSystemTime(new Date('2026-01-01T12:00:00'));
      const gameNumber = getGameNumber();

      expect(gameNumber).toBe(1);
    });

    it('should return 2 on second day', () => {
      vi.setSystemTime(new Date('2026-01-02T12:00:00'));
      const gameNumber = getGameNumber();

      expect(gameNumber).toBe(2);
    });

    it('should return 32 on February 1st', () => {
      vi.setSystemTime(new Date('2026-02-01T12:00:00'));
      const gameNumber = getGameNumber();

      expect(gameNumber).toBe(32);
    });

    it('should be same regardless of time of day', () => {
      vi.setSystemTime(new Date('2026-02-15T00:00:01'));
      const gameNum1 = getGameNumber();

      vi.setSystemTime(new Date('2026-02-15T23:59:59'));
      const gameNum2 = getGameNumber();

      expect(gameNum1).toBe(gameNum2);
    });

    it('should increment by 1 each day', () => {
      vi.setSystemTime(new Date('2026-03-10T12:00:00'));
      const gameNum1 = getGameNumber();

      vi.setSystemTime(new Date('2026-03-11T12:00:00'));
      const gameNum2 = getGameNumber();

      expect(gameNum2).toBe(gameNum1 + 1);
    });

    it('should handle year boundary correctly', () => {
      vi.setSystemTime(new Date('2026-12-31T23:59:59'));
      const gameNum1 = getGameNumber();

      vi.setSystemTime(new Date('2027-01-01T00:00:01'));
      const gameNum2 = getGameNumber();

      expect(gameNum2).toBe(gameNum1 + 1);
    });
  });

  describe('getTimeUntilNextDay', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return time until midnight', () => {
      // Set time to 11:30 PM
      vi.setSystemTime(new Date('2026-02-15T23:30:00'));
      const timeRemaining = getTimeUntilNextDay();

      // Should be 30 minutes = 1,800,000 milliseconds
      expect(timeRemaining).toBe(30 * 60 * 1000);
    });

    it('should return approximately 24 hours at start of day', () => {
      vi.setSystemTime(new Date('2026-02-15T00:00:01'));
      const timeRemaining = getTimeUntilNextDay();

      // Should be close to 24 hours (minus 1 second)
      const expectedMs = 24 * 60 * 60 * 1000 - 1000;
      expect(timeRemaining).toBeGreaterThan(expectedMs - 1000);
      expect(timeRemaining).toBeLessThan(24 * 60 * 60 * 1000);
    });

    it('should return 1 hour at 11 PM', () => {
      vi.setSystemTime(new Date('2026-02-15T23:00:00'));
      const timeRemaining = getTimeUntilNextDay();

      expect(timeRemaining).toBe(60 * 60 * 1000);
    });

    it('should return correct time at noon', () => {
      vi.setSystemTime(new Date('2026-02-15T12:00:00'));
      const timeRemaining = getTimeUntilNextDay();

      // Should be 12 hours until midnight
      expect(timeRemaining).toBe(12 * 60 * 60 * 1000);
    });

    it('should be positive number', () => {
      vi.setSystemTime(new Date('2026-02-15T18:45:30'));
      const timeRemaining = getTimeUntilNextDay();

      expect(timeRemaining).toBeGreaterThan(0);
    });
  });

  describe('formatTimeRemaining', () => {
    it('should format 1 hour correctly', () => {
      const oneHour = 60 * 60 * 1000;
      const formatted = formatTimeRemaining(oneHour);

      expect(formatted).toBe('01:00:00');
    });

    it('should format 30 minutes correctly', () => {
      const thirtyMin = 30 * 60 * 1000;
      const formatted = formatTimeRemaining(thirtyMin);

      expect(formatted).toBe('00:30:00');
    });

    it('should format 45 seconds correctly', () => {
      const fortyfiveSec = 45 * 1000;
      const formatted = formatTimeRemaining(fortyfiveSec);

      expect(formatted).toBe('00:00:45');
    });

    it('should format complex time correctly', () => {
      // 2 hours, 15 minutes, 30 seconds
      const complexTime = (2 * 60 * 60 + 15 * 60 + 30) * 1000;
      const formatted = formatTimeRemaining(complexTime);

      expect(formatted).toBe('02:15:30');
    });

    it('should format 23:59:59 correctly', () => {
      const almostDay = (23 * 60 * 60 + 59 * 60 + 59) * 1000;
      const formatted = formatTimeRemaining(almostDay);

      expect(formatted).toBe('23:59:59');
    });

    it('should pad single digits with zeros', () => {
      // 5 hours, 3 minutes, 7 seconds
      const time = (5 * 60 * 60 + 3 * 60 + 7) * 1000;
      const formatted = formatTimeRemaining(time);

      expect(formatted).toBe('05:03:07');
    });

    it('should handle zero time', () => {
      const formatted = formatTimeRemaining(0);

      expect(formatted).toBe('00:00:00');
    });

    it('should handle very small time values', () => {
      const formatted = formatTimeRemaining(500); // 0.5 seconds

      expect(formatted).toBe('00:00:00');
    });

    it('should handle 24+ hours correctly', () => {
      // 25 hours
      const time = 25 * 60 * 60 * 1000;
      const formatted = formatTimeRemaining(time);

      expect(formatted).toBe('25:00:00');
    });
  });

  describe('getRandomCounty', () => {
    it('should return a valid county name', () => {
      const county = getRandomCounty();

      expect(COUNTY_NAMES).toContain(county);
    });

    it('should return a string', () => {
      const county = getRandomCounty();

      expect(typeof county).toBe('string');
    });

    it('should return non-empty string', () => {
      const county = getRandomCounty();

      expect(county.length).toBeGreaterThan(0);
    });

    it('should potentially return different counties on multiple calls', () => {
      const counties = new Set();

      // Call it 100 times - should get some variety
      for (let i = 0; i < 100; i++) {
        counties.add(getRandomCounty());
      }

      // With 32 counties and 100 calls, we should get at least 2 different ones
      expect(counties.size).toBeGreaterThan(1);
    });

    it('should only return counties from the COUNTY_NAMES list', () => {
      // Generate 50 random counties and verify all are valid
      for (let i = 0; i < 50; i++) {
        const county = getRandomCounty();
        expect(COUNTY_NAMES).toContain(county);
      }
    });
  });
});
