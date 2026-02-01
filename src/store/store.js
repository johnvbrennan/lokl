// ============================================
// CENTRALIZED STATE STORE
// Implements observer pattern for state management
// ============================================

/**
 * Creates a centralized state store with immutability and observer pattern
 * @param {Object} initialState - The initial state object
 * @param {Object} options - Configuration options
 * @returns {Object} Store instance with getState, setState, subscribe methods
 */
export function createStore(initialState = {}, options = {}) {
    const {
        enableDevTools = import.meta.env?.DEV ?? false,
        enableHistory = import.meta.env?.DEV ?? false,
        historyLimit = 10,
        enableLogging = import.meta.env?.DEV ?? false
    } = options;

    // Private state - sealed to prevent external mutation
    let state = deepFreeze(deepClone(initialState));

    // Subscribers list for observer pattern
    const subscribers = new Set();

    // State history for debugging (dev only)
    const history = enableHistory ? [] : null;

    // Performance metrics
    const metrics = {
        updateCount: 0,
        lastUpdateTime: null,
        subscriberNotifyTime: 0
    };

    /**
     * Get current state (returns frozen copy)
     * @returns {Object} Current state (immutable)
     */
    function getState() {
        return state;
    }

    /**
     * Update state with new values
     * @param {Object|Function} update - Object to merge or function that receives current state
     * @param {string} actionName - Optional name for debugging
     */
    function setState(update, actionName = 'unknown') {
        const startTime = performance.now();

        // Save previous state to history (dev only)
        if (enableHistory && history.length >= historyLimit) {
            history.shift();
        }

        const previousState = state;

        // Handle function updates
        const updates = typeof update === 'function'
            ? update(deepClone(state))
            : update;

        // Merge updates with deep clone
        const newState = deepMerge(deepClone(state), updates);

        // Freeze new state for immutability
        state = deepFreeze(newState);

        // Save to history
        if (enableHistory) {
            history.push({
                state: previousState,
                action: actionName,
                timestamp: Date.now(),
                updates: updates
            });
        }

        // Log state change (dev only)
        if (enableLogging) {
            console.groupCollapsed(`🔄 State Update: ${actionName}`);
            console.log('Previous:', previousState);
            console.log('Updates:', updates);
            console.log('New State:', state);
            console.groupEnd();
        }

        // Update metrics
        metrics.updateCount++;
        metrics.lastUpdateTime = Date.now();

        // Notify all subscribers
        const notifyStart = performance.now();
        subscribers.forEach(callback => {
            try {
                callback(state, previousState);
            } catch (error) {
                console.error('Error in state subscriber:', error);
            }
        });
        metrics.subscriberNotifyTime = performance.now() - notifyStart;

        if (enableLogging && metrics.subscriberNotifyTime > 16) {
            console.warn(`⚠️ Slow subscriber notifications: ${metrics.subscriberNotifyTime.toFixed(2)}ms`);
        }
    }

    /**
     * Subscribe to state changes
     * @param {Function} callback - Function to call on state change (receives newState, oldState)
     * @returns {Function} Unsubscribe function
     */
    function subscribe(callback) {
        if (typeof callback !== 'function') {
            throw new Error('Subscriber must be a function');
        }

        subscribers.add(callback);

        // Return unsubscribe function
        return () => {
            subscribers.delete(callback);
        };
    }

    /**
     * Get store metadata and debug info
     * @returns {Object} Store metadata
     */
    function getMetadata() {
        return {
            subscribers: subscribers.size,
            updateCount: metrics.updateCount,
            lastUpdateTime: metrics.lastUpdateTime,
            historySize: history ? history.length : 0
        };
    }

    /**
     * Get state history (dev only)
     * @returns {Array} State history
     */
    function getHistory() {
        if (!enableHistory) {
            console.warn('State history is disabled in production');
            return [];
        }
        return [...history];
    }

    /**
     * Clear all subscribers (useful for cleanup)
     */
    function clearSubscribers() {
        subscribers.clear();
    }

    // Create store instance
    const store = {
        getState,
        setState,
        subscribe,
        getMetadata,
        getHistory,
        clearSubscribers
    };

    // Expose to window in dev mode
    if (enableDevTools && typeof window !== 'undefined') {
        window.__LOKL_STORE__ = store;

        // Add convenience debug helpers
        window.__LOKL_DEBUG__ = {
            // Get current state
            state: () => store.getState(),

            // Get game state only
            game: () => store.getState().game,

            // Get statistics
            stats: () => store.getState().statistics,

            // Get settings
            settings: () => store.getState().settings,

            // Get store metadata
            meta: () => store.getMetadata(),

            // Get state history
            history: () => store.getHistory(),

            // Log current state
            log: () => {
                console.log('📊 Current State:', store.getState());
            },

            // Log last N history entries
            logHistory: (n = 5) => {
                const hist = store.getHistory();
                console.log(`📜 Last ${n} State Changes:`, hist.slice(-n));
            },

            // Clear state (reset to initial)
            reset: () => {
                console.warn('⚠️ Resetting state to initial values');
                window.location.reload();
            }
        };

        console.log('🛠️ Dev tools enabled!');
        console.log('📦 Store: window.__LOKL_STORE__');
        console.log('🔍 Debug helpers: window.__LOKL_DEBUG__');
        console.log('   - __LOKL_DEBUG__.state() - Get current state');
        console.log('   - __LOKL_DEBUG__.game() - Get game state');
        console.log('   - __LOKL_DEBUG__.stats() - Get statistics');
        console.log('   - __LOKL_DEBUG__.log() - Log current state');
        console.log('   - __LOKL_DEBUG__.history() - Get state history');
    }

    return store;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Deep clone an object
 * @param {*} obj - Object to clone
 * @returns {*} Cloned object
 */
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    if (obj instanceof Set) return new Set([...obj].map(item => deepClone(item)));
    if (obj instanceof Map) return new Map([...obj].map(([k, v]) => [k, deepClone(v)]));

    const cloned = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            cloned[key] = deepClone(obj[key]);
        }
    }
    return cloned;
}

/**
 * Deep merge two objects
 * @param {Object} target - Target object
 * @param {Object} source - Source object
 * @returns {Object} Merged object
 */
function deepMerge(target, source) {
    if (!source || typeof source !== 'object') return target;

    for (const key in source) {
        if (source.hasOwnProperty(key)) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                target[key] = target[key] || {};
                deepMerge(target[key], source[key]);
            } else {
                target[key] = source[key];
            }
        }
    }
    return target;
}

/**
 * Deep freeze an object for immutability
 * @param {Object} obj - Object to freeze
 * @returns {Object} Frozen object
 */
function deepFreeze(obj) {
    // Skip freezing in production for performance
    if (!import.meta.env?.DEV) return obj;

    if (obj === null || typeof obj !== 'object') return obj;

    Object.freeze(obj);

    Object.getOwnPropertyNames(obj).forEach(prop => {
        if (obj[prop] !== null && typeof obj[prop] === 'object' && !Object.isFrozen(obj[prop])) {
            deepFreeze(obj[prop]);
        }
    });

    return obj;
}
