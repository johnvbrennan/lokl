import { describe, it, expect } from 'vitest';
import { getDistance, getBearing, getProximityColor, areAdjacent } from '../../../src/utils/calculations.js';
import { COLORS, MAX_DISTANCE } from '../../../src/utils/constants.js';

describe('calculations.js', () => {
  describe('getDistance', () => {
    it('should calculate correct distance between Cork and Dublin', () => {
      const cork = { lat: 51.8985, lng: -8.4756 };
      const dublin = { lat: 53.3498, lng: -6.2603 };
      const distance = getDistance(cork, dublin);

      // Expected distance is approximately 219.5 km
      expect(distance).toBeGreaterThan(218);
      expect(distance).toBeLessThan(221);
    });

    it('should calculate correct distance between Dublin and Galway', () => {
      const dublin = { lat: 53.3498, lng: -6.2603 };
      const galway = { lat: 53.2707, lng: -9.0568 };
      const distance = getDistance(dublin, galway);

      // Expected distance is approximately 186 km
      expect(distance).toBeGreaterThan(185);
      expect(distance).toBeLessThan(187);
    });

    it('should return 0 for same location', () => {
      const cork = { lat: 51.8985, lng: -8.4756 };
      const distance = getDistance(cork, cork);

      expect(distance).toBe(0);
    });

    it('should handle negative longitude differences', () => {
      const point1 = { lat: 52.0, lng: -8.0 };
      const point2 = { lat: 52.0, lng: -7.0 };
      const distance = getDistance(point1, point2);

      expect(distance).toBeGreaterThan(0);
    });

    it('should be symmetric (distance A to B equals B to A)', () => {
      const cork = { lat: 51.8985, lng: -8.4756 };
      const dublin = { lat: 53.3498, lng: -6.2603 };

      const distanceAB = getDistance(cork, dublin);
      const distanceBA = getDistance(dublin, cork);

      expect(distanceAB).toBe(distanceBA);
    });

    it('should handle very small distances', () => {
      const point1 = { lat: 53.3498, lng: -6.2603 };
      const point2 = { lat: 53.3499, lng: -6.2604 };
      const distance = getDistance(point1, point2);

      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(1);
    });

    it('should handle maximum distances across Ireland', () => {
      // Approximate extremes: Mizen Head (southwest) to Malin Head (northeast)
      const southwest = { lat: 51.45, lng: -9.82 };
      const northeast = { lat: 55.38, lng: -7.37 };
      const distance = getDistance(southwest, northeast);

      // Should be around 470km (MAX_DISTANCE)
      expect(distance).toBeGreaterThan(400);
      expect(distance).toBeLessThan(500);
    });
  });

  describe('getBearing', () => {
    it('should return ↑ for north direction', () => {
      const from = { lat: 52.0, lng: -8.0 };
      const to = { lat: 53.0, lng: -8.0 };
      const bearing = getBearing(from, to);

      expect(bearing).toBe('↑');
    });

    it('should return ↗ for northeast direction', () => {
      const from = { lat: 52.0, lng: -8.0 };
      const to = { lat: 53.0, lng: -7.0 };
      const bearing = getBearing(from, to);

      expect(bearing).toBe('↗');
    });

    it('should return → for east direction', () => {
      const from = { lat: 52.0, lng: -8.0 };
      const to = { lat: 52.0, lng: -7.0 };
      const bearing = getBearing(from, to);

      expect(bearing).toBe('→');
    });

    it('should return ↘ for southeast direction', () => {
      const from = { lat: 52.0, lng: -8.0 };
      const to = { lat: 51.0, lng: -7.0 };
      const bearing = getBearing(from, to);

      expect(bearing).toBe('↘');
    });

    it('should return ↓ for south direction', () => {
      const from = { lat: 53.0, lng: -8.0 };
      const to = { lat: 52.0, lng: -8.0 };
      const bearing = getBearing(from, to);

      expect(bearing).toBe('↓');
    });

    it('should return ↙ for southwest direction', () => {
      const from = { lat: 52.0, lng: -7.0 };
      const to = { lat: 51.0, lng: -8.0 };
      const bearing = getBearing(from, to);

      expect(bearing).toBe('↙');
    });

    it('should return ← for west direction', () => {
      const from = { lat: 52.0, lng: -7.0 };
      const to = { lat: 52.0, lng: -8.0 };
      const bearing = getBearing(from, to);

      expect(bearing).toBe('←');
    });

    it('should return ↖ for northwest direction', () => {
      const from = { lat: 52.0, lng: -7.0 };
      const to = { lat: 53.0, lng: -8.0 };
      const bearing = getBearing(from, to);

      expect(bearing).toBe('↖');
    });

    it('should return correct bearing from Cork to Dublin (northeast)', () => {
      const cork = { lat: 51.8985, lng: -8.4756 };
      const dublin = { lat: 53.3498, lng: -6.2603 };
      const bearing = getBearing(cork, dublin);

      // Cork to Dublin should be northeast
      expect(['↑', '↗', '→']).toContain(bearing);
    });

    it('should return correct bearing from Dublin to Cork (southwest)', () => {
      const dublin = { lat: 53.3498, lng: -6.2603 };
      const cork = { lat: 51.8985, lng: -8.4756 };
      const bearing = getBearing(dublin, cork);

      // Dublin to Cork should be southwest
      expect(['↓', '↙', '←']).toContain(bearing);
    });
  });

  describe('getProximityColor', () => {
    it('should return CORRECT color for distance 0', () => {
      const color = getProximityColor(0);
      expect(color).toBe(COLORS.CORRECT);
    });

    it('should return COLD_1 for 75-100% of max distance', () => {
      const distance = MAX_DISTANCE * 0.85; // 85% of max
      const color = getProximityColor(distance);
      expect(color).toBe(COLORS.COLD_1);
    });

    it('should return COLD_2 for 55-75% of max distance', () => {
      const distance = MAX_DISTANCE * 0.65; // 65% of max
      const color = getProximityColor(distance);
      expect(color).toBe(COLORS.COLD_2);
    });

    it('should return WARM_1 for 40-55% of max distance', () => {
      const distance = MAX_DISTANCE * 0.47; // 47% of max
      const color = getProximityColor(distance);
      expect(color).toBe(COLORS.WARM_1);
    });

    it('should return WARM_2 for 25-40% of max distance', () => {
      const distance = MAX_DISTANCE * 0.32; // 32% of max
      const color = getProximityColor(distance);
      expect(color).toBe(COLORS.WARM_2);
    });

    it('should return WARM_3 for 15-25% of max distance', () => {
      const distance = MAX_DISTANCE * 0.20; // 20% of max
      const color = getProximityColor(distance);
      expect(color).toBe(COLORS.WARM_3);
    });

    it('should return HOT for 5-15% of max distance', () => {
      const distance = MAX_DISTANCE * 0.10; // 10% of max
      const color = getProximityColor(distance);
      expect(color).toBe(COLORS.HOT);
    });

    it('should return CORRECT for 0-5% of max distance', () => {
      const distance = MAX_DISTANCE * 0.02; // 2% of max
      const color = getProximityColor(distance);
      expect(color).toBe(COLORS.CORRECT);
    });

    it('should handle boundary case at 75%', () => {
      const distance = MAX_DISTANCE * 0.75;
      const color = getProximityColor(distance);
      expect(color).toBe(COLORS.COLD_1);
    });

    it('should handle boundary case at 55%', () => {
      const distance = MAX_DISTANCE * 0.55;
      const color = getProximityColor(distance);
      expect(color).toBe(COLORS.COLD_2);
    });

    it('should handle boundary case at 40%', () => {
      const distance = MAX_DISTANCE * 0.40;
      const color = getProximityColor(distance);
      expect(color).toBe(COLORS.WARM_1);
    });

    it('should handle boundary case at 25%', () => {
      const distance = MAX_DISTANCE * 0.25;
      const color = getProximityColor(distance);
      expect(color).toBe(COLORS.WARM_2);
    });

    it('should handle boundary case at 15%', () => {
      const distance = MAX_DISTANCE * 0.15;
      const color = getProximityColor(distance);
      expect(color).toBe(COLORS.WARM_3);
    });

    it('should handle boundary case at 5%', () => {
      const distance = MAX_DISTANCE * 0.05;
      const color = getProximityColor(distance);
      expect(color).toBe(COLORS.HOT);
    });

    it('should handle very small non-zero distances', () => {
      const distance = 0.1;
      const color = getProximityColor(distance);
      expect(color).toBe(COLORS.CORRECT);
    });

    it('should handle maximum distance', () => {
      const color = getProximityColor(MAX_DISTANCE);
      expect(color).toBe(COLORS.COLD_1);
    });
  });

  describe('areAdjacent', () => {
    it('should return true for adjacent counties (Cork and Kerry)', () => {
      expect(areAdjacent('Cork', 'Kerry')).toBe(true);
    });

    it('should return true for adjacent counties (Dublin and Wicklow)', () => {
      expect(areAdjacent('Dublin', 'Wicklow')).toBe(true);
    });

    it('should return true for adjacent counties (Galway and Mayo)', () => {
      expect(areAdjacent('Galway', 'Mayo')).toBe(true);
    });

    it('should return false for non-adjacent counties (Cork and Dublin)', () => {
      expect(areAdjacent('Cork', 'Dublin')).toBe(false);
    });

    it('should return false for non-adjacent counties (Kerry and Galway)', () => {
      expect(areAdjacent('Kerry', 'Galway')).toBe(false);
    });

    it('should return false for same county', () => {
      expect(areAdjacent('Cork', 'Cork')).toBe(false);
    });

    it('should return false for null input', () => {
      expect(areAdjacent(null, 'Cork')).toBe(false);
      expect(areAdjacent('Cork', null)).toBe(false);
    });

    it('should return false for undefined input', () => {
      expect(areAdjacent(undefined, 'Cork')).toBe(false);
      expect(areAdjacent('Cork', undefined)).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(areAdjacent('', 'Cork')).toBe(false);
      expect(areAdjacent('Cork', '')).toBe(false);
    });

    it('should return false for non-existent county', () => {
      expect(areAdjacent('NotACounty', 'Cork')).toBe(false);
    });

    it('should handle adjacency symmetrically (bidirectional)', () => {
      // If A is adjacent to B, then B should be adjacent to A
      expect(areAdjacent('Cork', 'Kerry')).toBe(true);
      expect(areAdjacent('Kerry', 'Cork')).toBe(true);
    });

    it('should correctly identify all Cork neighbors', () => {
      const corkNeighbors = ['Kerry', 'Limerick', 'Tipperary', 'Waterford'];

      corkNeighbors.forEach(neighbor => {
        expect(areAdjacent('Cork', neighbor)).toBe(true);
      });
    });

    it('should correctly identify all Dublin neighbors', () => {
      const dublinNeighbors = ['Meath', 'Kildare', 'Wicklow'];

      dublinNeighbors.forEach(neighbor => {
        expect(areAdjacent('Dublin', neighbor)).toBe(true);
      });
    });

    it('should correctly identify non-neighbors of Dublin', () => {
      const nonNeighbors = ['Cork', 'Kerry', 'Galway', 'Donegal', 'Antrim'];

      nonNeighbors.forEach(county => {
        expect(areAdjacent('Dublin', county)).toBe(false);
      });
    });
  });
});
