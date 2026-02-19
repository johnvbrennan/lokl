// ============================================
// REGION DATA LOADER
// Handles dynamic loading of region-specific data
// ============================================

import { REGIONS, DEFAULT_REGION } from './regionConfig.js';

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
            const dataModule = await import(config.dataModule);
            const adjacencyModule = await import(config.adjacencyModule);

            // Extract the actual data (handle both default and named exports)
            const data = dataModule.COUNTIES || dataModule.COUNTRIES || dataModule.default;
            const adjacency = adjacencyModule.COUNTY_ADJACENCY || adjacencyModule.COUNTRY_ADJACENCY || adjacencyModule.default;

            // Create sorted list of place names
            const names = Object.keys(data).sort();

            const regionData = {
                config,
                data,
                adjacency,
                names
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
