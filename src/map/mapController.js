// ============================================
// MAP CONTROLLER
// Manages Leaflet map interactions
// ============================================

// Map state
let map = null;
let countyLayers = {}; // Store layer references by county name
let countyColors = new Map(); // Store current fill colors by county name
let geoJsonLayer = null;
let tileLayer = null; // Store reference to current tile layer
let currentHighlightedCounty = null;

/**
 * Initialize the Leaflet map
 * @param {Function} onMapReady - Callback when map is loaded
 */
export function initMap(onMapReady) {
    // Create map centered on Ireland
    map = L.map('map', {
        center: [53.5, -7.5],
        zoom: 7,
        minZoom: 6,
        maxZoom: 10,
        zoomControl: true,
        attributionControl: true
    });

    // Add initial tile layer based on current theme
    updateMapTiles();

    // Load GeoJSON after tiles
    loadGeoJSON(onMapReady);

    // Set up resize handler to restore colors after map resize
    let resizeTimeout;
    const handleResize = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            console.log('Viewport changed, invalidating map size');
            if (map) {
                map.invalidateSize();
                // Restore colors immediately
                restoreCountyColors();

                // Also restore after short delays for mobile SVG recreation
                setTimeout(() => {
                    console.log('Delayed restore after resize (100ms)');
                    restoreCountyColors();
                }, 100);

                setTimeout(() => {
                    console.log('Second delayed restore (300ms)');
                    restoreCountyColors();
                }, 300);
            }
        }, 150); // Shorter debounce for better mobile responsiveness
    };

    window.addEventListener('resize', handleResize);

    // Mobile-specific: listen to orientation changes
    window.addEventListener('orientationchange', () => {
        console.log('Orientation changed');
        handleResize();
    });

    // Mobile-specific: listen to visual viewport changes (address bar, etc)
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', () => {
            console.log('Visual viewport changed');
            handleResize();
        });
    }
}

/**
 * Update map tile layer based on current theme
 * @param {string} theme - Current theme ('light' or 'dark')
 */
export function updateMapTiles(theme) {
    // Remove existing tile layer if it exists
    if (tileLayer && map) {
        map.removeLayer(tileLayer);
    }

    // Choose tile layer based on current theme
    const isDark = theme === 'dark';
    const tileUrl = isDark
        ? 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png';

    // Create and add the appropriate tile layer
    tileLayer = L.tileLayer(tileUrl, {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    });

    if (map) {
        tileLayer.addTo(map);
    }
}

/**
 * Load GeoJSON data for Irish counties
 * @param {Function} onMapReady - Callback when GeoJSON is loaded
 */
export function loadGeoJSON(onMapReady) {
    fetch('/assets/ireland.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('GeoJSON loaded, features:', data.features.length);

            geoJsonLayer = L.geoJSON(data, {
                style: defaultStyle,
                onEachFeature: onEachFeature
            }).addTo(map);

            // Bring counties to front
            geoJsonLayer.bringToFront();

            // Fit map to Ireland bounds
            map.fitBounds(geoJsonLayer.getBounds(), { padding: [20, 20] });

            // Hide loading indicator
            document.getElementById('loading').style.display = 'none';

            console.log('County layers loaded:', Object.keys(countyLayers).length);

            // Force map to recalculate size and re-render (critical for mobile)
            setTimeout(() => {
                map.invalidateSize(true);
                // Force all layers to redraw
                if (geoJsonLayer) {
                    geoJsonLayer.eachLayer(layer => {
                        if (layer.setStyle) {
                            const currentStyle = layer.options;
                            layer.setStyle(currentStyle);
                        }
                    });
                }
            }, 100);

            // Call callback when map is ready
            if (onMapReady) {
                onMapReady();
            }
        })
        .catch(error => {
            console.error('Failed to load GeoJSON:', error);
            console.log('To run locally, start a web server:');
            console.log('  Python: python -m http.server 8000');
            console.log('  Node:   npx serve');
            console.log('  Then open: http://localhost:8000');
            document.getElementById('loading').innerHTML =
                'Failed to load map data.<br><small>Run from a web server (see console for instructions)</small>';
        });
}

/**
 * Default style for county layers
 * @param {Object} feature - GeoJSON feature (optional)
 * @param {string} gameMode - Current game mode
 * @returns {Object} Leaflet style object
 */
function defaultStyle(feature, gameMode = null) {
    const countyName = feature?.properties?.name;

    // Check THREE sources for stored color (in priority order):
    // 1. Feature properties (most persistent)
    const featureColor = feature?.properties?._fillColor;
    const featureFillOpacity = feature?.properties?._fillOpacity;

    // 2. CountyColors Map
    const storedColor = countyName ? countyColors.get(countyName) : null;

    // Locate mode: bright borders to help find counties
    // Practice/Daily: visible borders so you can see the map
    const isLocateMode = gameMode === 'locate';
    const mapBorder = getComputedStyle(document.documentElement)
        .getPropertyValue('--map-border').trim();
    const mapBorderBright = getComputedStyle(document.documentElement)
        .getPropertyValue('--map-border-bright').trim();

    // Use stored color if available from either source
    const hasColor = featureColor || storedColor;
    const colorToUse = featureColor || storedColor?.color;
    const opacityToUse = featureFillOpacity || (storedColor ? 0.9 : 0);

    if (hasColor) {
        console.log(`🔄 defaultStyle for ${countyName}: using saved color`, colorToUse);
        return {
            fillColor: colorToUse,
            fillOpacity: opacityToUse,
            weight: isLocateMode ? 2 : 1,
            opacity: isLocateMode ? 1 : 0.6,
            color: isLocateMode ? mapBorderBright : mapBorder
        };
    }

    return {
        fillColor: 'transparent',
        fillOpacity: 0,
        weight: isLocateMode ? 2 : 1,
        opacity: isLocateMode ? 1 : 0.6,
        color: isLocateMode ? mapBorderBright : mapBorder
    };
}

/**
 * Set up event handlers for each county feature
 * @param {Object} feature - GeoJSON feature
 * @param {Object} layer - Leaflet layer
 */
function onEachFeature(feature, layer) {
    const countyName = feature.properties.name;
    countyLayers[countyName] = layer;

    // Hover effects
    layer.on({
        mouseover: function(e) {
            const layer = e.target;
            const mapHover = getComputedStyle(document.documentElement)
                .getPropertyValue('--map-hover').trim();

            layer.setStyle({
                weight: 3,
                color: mapHover
            });
            layer.bringToFront();
            // Show pointer cursor - callback will be set by caller
            const el = layer.getElement();
            if (el && layer.shouldShowPointer) {
                el.style.cursor = 'pointer';
            }
        },
        mouseout: function(e) {
            const layer = e.target;
            // Get current fill to preserve guess colors
            const currentFill = layer.options.fillColor;
            const currentFillOpacity = layer.options.fillOpacity;

            // Reset to default border style but preserve fill
            const defaultBorderStyle = defaultStyle(layer.feature, layer.gameMode);
            layer.setStyle({
                fillColor: currentFill,
                fillOpacity: currentFillOpacity,
                weight: defaultBorderStyle.weight,
                color: defaultBorderStyle.color,
                opacity: defaultBorderStyle.opacity
            });

            const el = layer.getElement();
            if (el) el.style.cursor = '';
        },
        click: function(e) {
            // Click handler will be set by caller
            if (layer.clickHandler) {
                layer.clickHandler(countyName);
            }
        }
    });
}

/**
 * Set click handler for map clicks
 * @param {Function} handler - Function to call when county is clicked
 * @param {string} gameMode - Current game mode
 * @param {string} gameStatus - Current game status
 */
export function setMapClickHandler(handler, gameMode, gameStatus) {
    Object.entries(countyLayers).forEach(([name, layer]) => {
        layer.clickHandler = handler;
        layer.gameMode = gameMode;
        layer.shouldShowPointer = gameMode === 'locate' && gameStatus === 'playing';
    });
}

/**
 * Update a county's color on the map
 * @param {string} countyName - Name of the county
 * @param {string} color - Color code
 * @param {boolean} isCorrect - Whether this is the correct answer
 */
export function updateMapCounty(countyName, color, isCorrect = false) {
    const layer = countyLayers[countyName];
    if (layer) {
        console.log(`🎨 Setting color for ${countyName}:`, color);

        // Store color in THREE places for maximum persistence:
        // 1. In the countyColors Map
        countyColors.set(countyName, { color, isCorrect });

        // 2. In the layer's feature properties (survives Leaflet re-renders)
        if (layer.feature && layer.feature.properties) {
            layer.feature.properties._fillColor = color;
            layer.feature.properties._fillOpacity = 0.9;
            layer.feature.properties._isCorrect = isCorrect;
        }

        // 3. In the layer options (Leaflet's style cache)
        layer.options.fillColor = color;
        layer.options.fillOpacity = 0.9;

        // Now set the style
        const currentStyle = layer.options;
        layer.setStyle({
            fillColor: color,
            fillOpacity: 0.9,
            weight: currentStyle.weight,
            opacity: currentStyle.opacity,
            color: currentStyle.color
        });

        // Force visual update
        layer.bringToFront();

        // Set directly on SVG element for immediate visibility
        const el = layer.getElement();
        if (el) {
            el.setAttribute('fill', color);
            el.setAttribute('fill-opacity', '0.9');
            el.style.fill = color;
            el.style.fillOpacity = '0.9';

            if (isCorrect) {
                el.classList.add('county-correct');
            }

            console.log(`✅ Color applied to ${countyName}, element fill:`, el.getAttribute('fill'));
        } else {
            console.warn(`❌ No SVG element found for ${countyName}`);
        }
    }
}

/**
 * Restore county colors from stored state (used after resize/re-render)
 */
function restoreCountyColors() {
    console.log('Restoring colors for', countyColors.size, 'counties');
    let restoredCount = 0;

    countyColors.forEach((data, countyName) => {
        const layer = countyLayers[countyName];
        if (layer) {
            const currentStyle = layer.options;

            console.log(`Restoring ${countyName}:`, {
                color: data.color,
                currentFillColor: currentStyle.fillColor,
                currentFillOpacity: currentStyle.fillOpacity
            });

            layer.setStyle({
                fillColor: data.color,
                fillOpacity: 0.9,
                weight: currentStyle.weight,
                opacity: currentStyle.opacity,
                color: currentStyle.color
            });

            // Force layer to front to ensure visibility
            layer.bringToFront();

            const el = layer.getElement();
            if (el) {
                console.log(`Element for ${countyName}:`, {
                    fillAttr: el.getAttribute('fill'),
                    fillOpacityAttr: el.getAttribute('fill-opacity'),
                    fillStyle: el.style.fill,
                    fillOpacityStyle: el.style.fillOpacity
                });

                el.setAttribute('fill', data.color);
                el.setAttribute('fill-opacity', '0.9');

                // Also try setting via style for maximum compatibility
                el.style.fill = data.color;
                el.style.fillOpacity = '0.9';

                if (data.isCorrect) {
                    el.classList.add('county-correct');
                }
                restoredCount++;

                console.log(`After restore ${countyName}:`, {
                    fillAttr: el.getAttribute('fill'),
                    fillOpacityAttr: el.getAttribute('fill-opacity'),
                    fillStyle: el.style.fill,
                    fillOpacityStyle: el.style.fillOpacity
                });
            } else {
                console.warn('No element found for county:', countyName);
            }
        } else {
            console.warn('No layer found for county:', countyName);
        }
    });

    console.log('Successfully restored', restoredCount, 'counties');
}

/**
 * Reset all counties to default colors
 * @param {string} gameMode - Current game mode
 */
export function resetMapColors(gameMode) {
    console.log('🧹 Resetting all map colors');

    // Clear stored colors from Map
    countyColors.clear();

    Object.values(countyLayers).forEach(layer => {
        // Clear feature properties
        if (layer.feature && layer.feature.properties) {
            delete layer.feature.properties._fillColor;
            delete layer.feature.properties._fillOpacity;
            delete layer.feature.properties._isCorrect;
        }

        // Reset style
        layer.setStyle(defaultStyle(layer.feature, gameMode));
        layer.getElement()?.classList.remove('county-correct');
    });
}

/**
 * Highlight a specific county with white border
 * @param {string} countyName - Name of the county to highlight
 */
export function highlightCounty(countyName) {
    // Unhighlight previous county first
    if (currentHighlightedCounty && currentHighlightedCounty !== countyName) {
        unhighlightCounty(currentHighlightedCounty);
    }

    const layer = countyLayers[countyName];
    if (layer) {
        layer.setStyle({
            weight: 4,
            color: '#ffffff',
            opacity: 1
        });
        layer.bringToFront();
        currentHighlightedCounty = countyName;

        // Also pan to county if not in view
        const bounds = layer.getBounds();
        if (!map.getBounds().contains(bounds)) {
            map.panTo(bounds.getCenter());
        }
    }
}

/**
 * Remove highlight from a county
 * @param {string} countyName - Name of the county to unhighlight
 * @param {string} gameMode - Current game mode
 */
export function unhighlightCounty(countyName, gameMode) {
    const layer = countyLayers[countyName];
    if (layer) {
        // If gameMode not provided, try to get from layer's stored mode
        if (!gameMode && layer.gameMode) {
            gameMode = layer.gameMode;
        }

        // Get current style to preserve fill color (from guesses)
        const currentStyle = layer.options;
        const defaultBorderStyle = defaultStyle(layer.feature, gameMode);

        // Restore border styling but KEEP the fill color
        layer.setStyle({
            fillColor: currentStyle.fillColor,
            fillOpacity: currentStyle.fillOpacity,
            weight: defaultBorderStyle.weight,
            opacity: defaultBorderStyle.opacity,
            color: defaultBorderStyle.color
        });

        // If it's no longer the highlighted county, clear the tracking
        if (currentHighlightedCounty === countyName) {
            currentHighlightedCounty = null;
        }
    }
}

/**
 * Update all map borders (useful when theme or mode changes)
 * @param {string} gameMode - Current game mode
 */
export function updateAllMapBorders(gameMode) {
    // Update all county borders when theme changes
    if (countyLayers && Object.keys(countyLayers).length > 0) {
        Object.values(countyLayers).forEach(layer => {
            const currentStyle = defaultStyle(layer.feature, gameMode);
            layer.setStyle({
                color: currentStyle.color,
                opacity: currentStyle.opacity,
                weight: currentStyle.weight
            });
        });
    }
}

/**
 * Get the map instance (for advanced use cases)
 * @returns {Object} Leaflet map instance
 */
export function getMap() {
    return map;
}

/**
 * Get county layers object
 * @returns {Object} County layers keyed by name
 */
export function getCountyLayers() {
    return countyLayers;
}
