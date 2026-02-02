import { describe, it, expect } from 'vitest';
import { COUNTIES, COUNTY_NAMES } from '../../../src/data/counties.js';
import { COUNTY_ADJACENCY, areAdjacent } from '../../../src/data/adjacency.js';

describe('counties.js', () => {
  describe('COUNTIES', () => {
    it('should have 33 entries (32 counties + Derry/Londonderry both listed)', () => {
      const countyCount = Object.keys(COUNTIES).length;
      expect(countyCount).toBe(33);
    });

    it('should have all required properties for each county', () => {
      Object.entries(COUNTIES).forEach(([name, county]) => {
        expect(county).toHaveProperty('lat');
        expect(county).toHaveProperty('lng');
        expect(county).toHaveProperty('province');
        expect(county).toHaveProperty('fact');
      });
    });

    it('should have valid latitude values (49-56 for Ireland)', () => {
      Object.entries(COUNTIES).forEach(([name, county]) => {
        expect(county.lat).toBeGreaterThan(49);
        expect(county.lat).toBeLessThan(56);
      });
    });

    it('should have valid longitude values (-11 to -5 for Ireland)', () => {
      Object.entries(COUNTIES).forEach(([name, county]) => {
        expect(county.lng).toBeGreaterThan(-11);
        expect(county.lng).toBeLessThan(-5);
      });
    });

    it('should have valid province values', () => {
      const validProvinces = ['Ulster', 'Munster', 'Leinster', 'Connacht'];

      Object.entries(COUNTIES).forEach(([name, county]) => {
        expect(validProvinces).toContain(county.province);
      });
    });

    it('should have non-empty fun facts', () => {
      Object.entries(COUNTIES).forEach(([name, county]) => {
        expect(county.fact).toBeTruthy();
        expect(county.fact.length).toBeGreaterThan(0);
      });
    });

    it('should include all Republic of Ireland counties', () => {
      const republicCounties = [
        'Carlow', 'Dublin', 'Kildare', 'Kilkenny', 'Laois', 'Longford',
        'Louth', 'Meath', 'Offaly', 'Westmeath', 'Wexford', 'Wicklow',
        'Clare', 'Cork', 'Kerry', 'Limerick', 'Tipperary', 'Waterford',
        'Galway', 'Leitrim', 'Mayo', 'Roscommon', 'Sligo',
        'Cavan', 'Donegal', 'Monaghan'
      ];

      republicCounties.forEach(county => {
        expect(COUNTIES).toHaveProperty(county);
      });
    });

    it('should include all Northern Ireland counties', () => {
      const niCounties = ['Antrim', 'Armagh', 'Down', 'Fermanagh', 'Tyrone'];

      // Note: Derry appears twice as 'Derry' and 'Londonderry'
      const derry = COUNTIES['Derry'] || COUNTIES['Londonderry'];
      expect(derry).toBeDefined();

      niCounties.forEach(county => {
        expect(COUNTIES).toHaveProperty(county);
      });
    });

    it('should have correct distribution across provinces', () => {
      const provinceCount = {
        Ulster: 0,
        Munster: 0,
        Leinster: 0,
        Connacht: 0
      };

      Object.values(COUNTIES).forEach(county => {
        provinceCount[county.province]++;
      });

      // Ulster should have most counties (9 in NI + 3 in ROI = 12, but with Derry/Londonderry counting)
      expect(provinceCount.Ulster).toBeGreaterThan(8);

      // Leinster should have 12 counties
      expect(provinceCount.Leinster).toBe(12);

      // Munster should have 6 counties
      expect(provinceCount.Munster).toBe(6);

      // Connacht should have 5 counties
      expect(provinceCount.Connacht).toBe(5);
    });
  });

  describe('COUNTY_NAMES', () => {
    it('should be an array of 33 county names (includes both Derry and Londonderry)', () => {
      expect(Array.isArray(COUNTY_NAMES)).toBe(true);
      expect(COUNTY_NAMES.length).toBe(33);
    });

    it('should be sorted alphabetically', () => {
      const sorted = [...COUNTY_NAMES].sort();
      expect(COUNTY_NAMES).toEqual(sorted);
    });

    it('should contain all counties from COUNTIES', () => {
      const countyKeys = Object.keys(COUNTIES).sort();
      expect(COUNTY_NAMES).toEqual(countyKeys);
    });

    it('should have no duplicates', () => {
      const uniqueNames = new Set(COUNTY_NAMES);
      expect(uniqueNames.size).toBe(COUNTY_NAMES.length);
    });
  });

  describe('Data integrity', () => {
    it('should have coordinates that make geographic sense', () => {
      // Cork should be in the south
      expect(COUNTIES.Cork.lat).toBeLessThan(COUNTIES.Dublin.lat);

      // Donegal should be in the north
      expect(COUNTIES.Donegal.lat).toBeGreaterThan(COUNTIES.Dublin.lat);

      // Galway should be in the west
      expect(COUNTIES.Galway.lng).toBeLessThan(COUNTIES.Dublin.lng);

      // Wicklow should be in the east
      expect(COUNTIES.Wicklow.lng).toBeGreaterThan(COUNTIES.Galway.lng);
    });

    it('should have consistent naming between COUNTIES and COUNTY_ADJACENCY', () => {
      const countyKeys = Object.keys(COUNTIES);
      const adjacencyKeys = Object.keys(COUNTY_ADJACENCY);

      // All counties in COUNTY_ADJACENCY should be in COUNTIES
      adjacencyKeys.forEach(county => {
        expect(countyKeys).toContain(county);
      });

      // Note: COUNTIES has both 'Derry' and 'Londonderry', but COUNTY_ADJACENCY only uses 'Londonderry'
      // So we can't check the reverse without accounting for this
      const countyKeysWithoutDerry = countyKeys.filter(c => c !== 'Derry');
      countyKeysWithoutDerry.forEach(county => {
        expect(adjacencyKeys).toContain(county);
      });
    });
  });
});

describe('adjacency.js', () => {
  describe('COUNTY_ADJACENCY', () => {
    it('should have 32 counties in adjacency map', () => {
      const countyCount = Object.keys(COUNTY_ADJACENCY).length;
      expect(countyCount).toBe(32);
    });

    it('should have array of neighbors for each county', () => {
      Object.entries(COUNTY_ADJACENCY).forEach(([county, neighbors]) => {
        expect(Array.isArray(neighbors)).toBe(true);
        expect(neighbors.length).toBeGreaterThan(0);
      });
    });

    it('should have bidirectional adjacency', () => {
      Object.entries(COUNTY_ADJACENCY).forEach(([county, neighbors]) => {
        neighbors.forEach(neighbor => {
          expect(COUNTY_ADJACENCY[neighbor]).toContain(county);
        });
      });
    });

    it('should not list county as adjacent to itself', () => {
      Object.entries(COUNTY_ADJACENCY).forEach(([county, neighbors]) => {
        expect(neighbors).not.toContain(county);
      });
    });

    it('should have no duplicate neighbors', () => {
      Object.entries(COUNTY_ADJACENCY).forEach(([county, neighbors]) => {
        const uniqueNeighbors = new Set(neighbors);
        expect(uniqueNeighbors.size).toBe(neighbors.length);
      });
    });

    it('should have realistic neighbor counts', () => {
      // No county should have more than 8 neighbors
      Object.entries(COUNTY_ADJACENCY).forEach(([county, neighbors]) => {
        expect(neighbors.length).toBeLessThanOrEqual(8);
      });

      // Most counties should have 2-6 neighbors
      const neighborCounts = Object.values(COUNTY_ADJACENCY).map(n => n.length);
      const avgNeighbors = neighborCounts.reduce((a, b) => a + b, 0) / neighborCounts.length;
      expect(avgNeighbors).toBeGreaterThan(2);
      expect(avgNeighbors).toBeLessThan(6);
    });

    it('should have all neighbor names exist in COUNTIES', () => {
      const countyNames = Object.keys(COUNTIES);

      Object.entries(COUNTY_ADJACENCY).forEach(([county, neighbors]) => {
        neighbors.forEach(neighbor => {
          expect(countyNames).toContain(neighbor);
        });
      });
    });

    it('should correctly identify specific known adjacencies', () => {
      // Cork borders Kerry, Limerick, Tipperary, Waterford
      expect(COUNTY_ADJACENCY.Cork).toContain('Kerry');
      expect(COUNTY_ADJACENCY.Cork).toContain('Limerick');
      expect(COUNTY_ADJACENCY.Cork).toContain('Tipperary');
      expect(COUNTY_ADJACENCY.Cork).toContain('Waterford');

      // Dublin borders Meath, Kildare, Wicklow
      expect(COUNTY_ADJACENCY.Dublin).toContain('Meath');
      expect(COUNTY_ADJACENCY.Dublin).toContain('Kildare');
      expect(COUNTY_ADJACENCY.Dublin).toContain('Wicklow');

      // Kerry only borders Cork and Limerick
      expect(COUNTY_ADJACENCY.Kerry).toContain('Cork');
      expect(COUNTY_ADJACENCY.Kerry).toContain('Limerick');
      expect(COUNTY_ADJACENCY.Kerry.length).toBe(2);
    });
  });

  describe('areAdjacent function', () => {
    it('should return true for adjacent counties', () => {
      expect(areAdjacent('Cork', 'Kerry')).toBe(true);
      expect(areAdjacent('Dublin', 'Wicklow')).toBe(true);
      expect(areAdjacent('Galway', 'Mayo')).toBe(true);
    });

    it('should return false for non-adjacent counties', () => {
      expect(areAdjacent('Cork', 'Dublin')).toBe(false);
      expect(areAdjacent('Kerry', 'Donegal')).toBe(false);
    });

    it('should be bidirectional', () => {
      expect(areAdjacent('Cork', 'Kerry')).toBe(areAdjacent('Kerry', 'Cork'));
      expect(areAdjacent('Dublin', 'Wicklow')).toBe(areAdjacent('Wicklow', 'Dublin'));
    });

    it('should return false for same county', () => {
      expect(areAdjacent('Cork', 'Cork')).toBe(false);
    });

    it('should return false for null or undefined', () => {
      expect(areAdjacent(null, 'Cork')).toBe(false);
      expect(areAdjacent('Cork', null)).toBe(false);
      expect(areAdjacent(undefined, 'Cork')).toBe(false);
      expect(areAdjacent('Cork', undefined)).toBe(false);
    });

    it('should return false for non-existent counties', () => {
      expect(areAdjacent('NotACounty', 'Cork')).toBe(false);
      expect(areAdjacent('Cork', 'NotACounty')).toBe(false);
    });
  });
});
