// ============================================
// REGION DATA LOADER
// Handles loading of region-specific data
// ============================================

import { REGIONS, DEFAULT_REGION } from './regionConfig.js';
import { COUNTIES } from './counties.js';
import { COUNTY_ADJACENCY } from './adjacency.js';
import { COUNTRIES } from './countries.js';
import { COUNTRY_ADJACENCY } from './countryAdjacency.js';

/**
 * Normalize GeoJSON country names to match our data
 * Handles naming inconsistencies between GeoJSON sources and our country data
 */
const GEO_JSON_NAME_MAP = {
    'Holy See (Vatican City)': 'Vatican City',
    'The former Yugoslav Republic of Macedonia': 'North Macedonia',
    'Republic of Moldova': 'Moldova'
};

/**
 * Countries to exclude from Europe GeoJSON (not part of EU + standard Europe definition)
 */
const EXCLUDED_COUNTRIES = new Set([
    'Armenia',
    'Azerbaijan',
    'Belarus',
    'Georgia',
    'Israel',
    'Turkey',
    'Russia',
    'Faroe Islands'
]);

/**
 * Normalize a GeoJSON feature name
 * @param {string} name - Original GeoJSON name
 * @returns {string|null} - Normalized name or null if excluded
 */
function normalizeGeoJSONName(name) {
    // Check if excluded
    if (EXCLUDED_COUNTRIES.has(name)) {
        return null;
    }

    // Apply name mapping
    return GEO_JSON_NAME_MAP[name] || name;
}

/**
 * Static region data registry
 * All region data is imported upfront for reliable production builds
 */
const REGION_DATA_REGISTRY = {
    'irish-counties': {
        data: COUNTIES,
        adjacency: COUNTY_ADJACENCY
    },
    'europe': {
        data: COUNTRIES,
        adjacency: COUNTRY_ADJACENCY
    }
};

/**
 * Region Data Loader
 * Loads region-specific data from static imports
 */
export class RegionDataLoader {
    constructor() {
        this.cache = new Map(); // Cache loaded regions
    }

    /**
     * Load region data
     * @param {string} regionId - Region identifier
     * @returns {Promise<Object>} Region data object containing config, data, adjacency, and names
     */
    async loadRegion(regionId) {
        // Check cache first
        if (this.cache.has(regionId)) {
            console.log(`📦 Loading region '${regionId}' from cache`);
            return this.cache.get(regionId);
        }

        console.log(`📥 Loading region '${regionId}'...`);

        const config = REGIONS[regionId] || REGIONS[DEFAULT_REGION];
        const registryData = REGION_DATA_REGISTRY[regionId];

        if (!registryData) {
            console.error(`❌ Region '${regionId}' not found in registry`);

            // Fallback to default region if loading fails
            if (regionId !== DEFAULT_REGION) {
                console.log(`🔄 Falling back to default region '${DEFAULT_REGION}'`);
                return this.loadRegion(DEFAULT_REGION);
            }

            throw new Error(`Region '${regionId}' not found`);
        }

        // Get data and adjacency from registry
        const data = registryData.data;
        const adjacency = registryData.adjacency;

        // Create sorted list of place names
        const names = Object.keys(data).sort();

        const regionData = {
            config,
            data,
            adjacency,
            names,
            normalizeGeoJSONName: normalizeGeoJSONName // Provide normalization function
        };

        // Cache the loaded region
        this.cache.set(regionId, regionData);

        console.log(`✅ Region '${regionId}' loaded successfully (${names.length} places)`);

        return regionData;
    }

    /**
     * Clear the cache
     */
    clearCache() {
        this.cache.clear();
        console.log('🗑️ Region cache cleared');
    }

    /**
     * Preload a region (for performance optimization)
     * @param {string} regionId - Region identifier
     * @returns {Promise<void>}
     */
    async preload(regionId) {
        if (!this.cache.has(regionId)) {
            await this.loadRegion(regionId);
        }
    }
}

// Export a singleton instance
export const dataLoader = new RegionDataLoader();
