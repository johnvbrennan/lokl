// ============================================
// REGION DATA LOADER
// Handles dynamic loading of region-specific data
// ============================================

import { REGIONS, DEFAULT_REGION } from './regionConfig.js';

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
 * Region Data Loader
 * Dynamically loads region-specific data modules
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

        try {
            // Dynamically import data and adjacency modules
            const dataModule = await import(/* @vite-ignore */ config.dataModule);
            const adjacencyModule = await import(/* @vite-ignore */ config.adjacencyModule);

            // Extract the actual data (handle both default and named exports)
            const data = dataModule.COUNTIES || dataModule.COUNTRIES || dataModule.default;
            const adjacency = adjacencyModule.COUNTY_ADJACENCY || adjacencyModule.COUNTRY_ADJACENCY || adjacencyModule.default;

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
        } catch (error) {
            console.error(`❌ Failed to load region '${regionId}':`, error);

            // Fallback to default region if loading fails
            if (regionId !== DEFAULT_REGION) {
                console.log(`🔄 Falling back to default region '${DEFAULT_REGION}'`);
                return this.loadRegion(DEFAULT_REGION);
            }

            throw error;
        }
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
