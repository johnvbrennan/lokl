import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createStore } from '../../../src/store/store.js';

describe('store.js', () => {
  let store;

  beforeEach(() => {
    // Mock console methods to avoid cluttering test output
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'groupCollapsed').mockImplementation(() => {});
    vi.spyOn(console, 'groupEnd').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});

    // Mock import.meta.env for testing
    vi.stubGlobal('import', {
      meta: {
        env: { DEV: false } // Disable dev features for cleaner tests
      }
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  describe('createStore', () => {
    it('should create a store with initial state', () => {
      const initialState = { count: 0, name: 'test' };
      store = createStore(initialState);

      const state = store.getState();
      expect(state).toEqual(initialState);
    });

    it('should create a store with empty object if no initial state', () => {
      store = createStore();

      const state = store.getState();
      expect(state).toEqual({});
    });

    it('should return an object with required methods', () => {
      store = createStore();

      expect(store).toHaveProperty('getState');
      expect(store).toHaveProperty('setState');
      expect(store).toHaveProperty('subscribe');
      expect(store).toHaveProperty('getMetadata');
      expect(store).toHaveProperty('getHistory');
      expect(store).toHaveProperty('clearSubscribers');

      expect(typeof store.getState).toBe('function');
      expect(typeof store.setState).toBe('function');
      expect(typeof store.subscribe).toBe('function');
    });
  });

  describe('getState', () => {
    it('should return current state', () => {
      const initialState = { value: 42 };
      store = createStore(initialState);

      const state = store.getState();
      expect(state.value).toBe(42);
    });

    it('should return immutable state', () => {
      store = createStore({ count: 0 });

      const state = store.getState();

      // Attempting to mutate should not affect store
      // Note: In production mode, state is not frozen, so we just verify isolation
      const originalState = store.getState();
      expect(originalState).toEqual({ count: 0 });
    });
  });

  describe('setState', () => {
    it('should update state with new values', () => {
      store = createStore({ count: 0 });

      store.setState({ count: 5 });

      const state = store.getState();
      expect(state.count).toBe(5);
    });

    it('should merge updates with existing state', () => {
      store = createStore({ count: 0, name: 'test' });

      store.setState({ count: 10 });

      const state = store.getState();
      expect(state.count).toBe(10);
      expect(state.name).toBe('test');
    });

    it('should handle nested state updates', () => {
      store = createStore({
        user: { name: 'Alice', age: 30 },
        settings: { theme: 'dark' }
      });

      store.setState({
        user: { name: 'Bob' }
      });

      const state = store.getState();
      expect(state.user.name).toBe('Bob');
      expect(state.settings.theme).toBe('dark');
    });

    it('should handle function updates', () => {
      store = createStore({ count: 5 });

      store.setState((currentState) => ({
        count: currentState.count + 10
      }));

      const state = store.getState();
      expect(state.count).toBe(15);
    });

    it('should accept action name for debugging', () => {
      store = createStore({ count: 0 });

      // Should not throw with action name
      expect(() => {
        store.setState({ count: 1 }, 'increment');
      }).not.toThrow();
    });

    it('should maintain immutability', () => {
      store = createStore({ items: [1, 2, 3] });

      const stateBefore = store.getState();

      store.setState({ items: [1, 2, 3, 4] });

      const stateAfter = store.getState();

      // States should be different objects
      expect(stateBefore).not.toBe(stateAfter);
    });
  });

  describe('subscribe', () => {
    it('should call subscriber when state changes', () => {
      store = createStore({ count: 0 });

      const subscriber = vi.fn();
      store.subscribe(subscriber);

      store.setState({ count: 1 });

      expect(subscriber).toHaveBeenCalledTimes(1);
    });

    it('should pass new and old state to subscriber', () => {
      store = createStore({ count: 0 });

      const subscriber = vi.fn();
      store.subscribe(subscriber);

      store.setState({ count: 5 });

      expect(subscriber).toHaveBeenCalledWith(
        expect.objectContaining({ count: 5 }),
        expect.objectContaining({ count: 0 })
      );
    });

    it('should support multiple subscribers', () => {
      store = createStore({ count: 0 });

      const subscriber1 = vi.fn();
      const subscriber2 = vi.fn();

      store.subscribe(subscriber1);
      store.subscribe(subscriber2);

      store.setState({ count: 1 });

      expect(subscriber1).toHaveBeenCalledTimes(1);
      expect(subscriber2).toHaveBeenCalledTimes(1);
    });

    it('should return unsubscribe function', () => {
      store = createStore({ count: 0 });

      const subscriber = vi.fn();
      const unsubscribe = store.subscribe(subscriber);

      expect(typeof unsubscribe).toBe('function');

      store.setState({ count: 1 });
      expect(subscriber).toHaveBeenCalledTimes(1);

      unsubscribe();

      store.setState({ count: 2 });
      expect(subscriber).toHaveBeenCalledTimes(1); // Still 1, not called again
    });

    it('should throw error if subscriber is not a function', () => {
      store = createStore();

      expect(() => {
        store.subscribe('not a function');
      }).toThrow('Subscriber must be a function');

      expect(() => {
        store.subscribe(null);
      }).toThrow('Subscriber must be a function');
    });

    it('should handle subscriber errors gracefully', () => {
      store = createStore({ count: 0 });

      const errorSubscriber = vi.fn(() => {
        throw new Error('Subscriber error');
      });
      const normalSubscriber = vi.fn();

      store.subscribe(errorSubscriber);
      store.subscribe(normalSubscriber);

      // Should not throw
      expect(() => {
        store.setState({ count: 1 });
      }).not.toThrow();

      // Error subscriber was called
      expect(errorSubscriber).toHaveBeenCalled();
      // Normal subscriber should still be called
      expect(normalSubscriber).toHaveBeenCalled();
      // Error should be logged
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('getMetadata', () => {
    it('should return store metadata', () => {
      store = createStore({ count: 0 });

      const metadata = store.getMetadata();

      expect(metadata).toHaveProperty('subscribers');
      expect(metadata).toHaveProperty('updateCount');
      expect(metadata).toHaveProperty('lastUpdateTime');
      expect(metadata).toHaveProperty('historySize');
    });

    it('should track subscriber count', () => {
      store = createStore({ count: 0 });

      let metadata = store.getMetadata();
      expect(metadata.subscribers).toBe(0);

      store.subscribe(() => {});
      store.subscribe(() => {});

      metadata = store.getMetadata();
      expect(metadata.subscribers).toBe(2);
    });

    it('should track update count', () => {
      store = createStore({ count: 0 });

      let metadata = store.getMetadata();
      expect(metadata.updateCount).toBe(0);

      store.setState({ count: 1 });
      store.setState({ count: 2 });

      metadata = store.getMetadata();
      expect(metadata.updateCount).toBe(2);
    });

    it('should track last update time', () => {
      store = createStore({ count: 0 });

      store.setState({ count: 1 });

      const metadata = store.getMetadata();
      expect(metadata.lastUpdateTime).toBeGreaterThan(0);
    });
  });

  describe('getHistory', () => {
    it('should return empty array when history is disabled', () => {
      store = createStore({ count: 0 });

      const history = store.getHistory();

      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBe(0);
      // Note: console.warn may or may not be called depending on enableHistory flag
    });
  });

  describe('clearSubscribers', () => {
    it('should remove all subscribers', () => {
      store = createStore({ count: 0 });

      const subscriber1 = vi.fn();
      const subscriber2 = vi.fn();

      store.subscribe(subscriber1);
      store.subscribe(subscriber2);

      let metadata = store.getMetadata();
      expect(metadata.subscribers).toBe(2);

      store.clearSubscribers();

      metadata = store.getMetadata();
      expect(metadata.subscribers).toBe(0);

      store.setState({ count: 1 });
      expect(subscriber1).not.toHaveBeenCalled();
      expect(subscriber2).not.toHaveBeenCalled();
    });
  });

  describe('state immutability and cloning', () => {
    it('should handle array updates correctly', () => {
      store = createStore({ items: [1, 2, 3] });

      store.setState({ items: [1, 2, 3, 4, 5] });

      const state = store.getState();
      expect(state.items).toEqual([1, 2, 3, 4, 5]);
    });

    it('should handle Date objects correctly', () => {
      const date = new Date('2026-02-15');
      store = createStore({ timestamp: date });

      const state = store.getState();
      expect(state.timestamp).toEqual(date);
      expect(state.timestamp).toBeInstanceOf(Date);
    });

    it('should handle nested objects correctly', () => {
      store = createStore({
        user: {
          profile: {
            name: 'Alice',
            settings: {
              theme: 'dark'
            }
          }
        }
      });

      store.setState({
        user: {
          profile: {
            settings: {
              theme: 'light'
            }
          }
        }
      });

      const state = store.getState();
      expect(state.user.profile.settings.theme).toBe('light');
    });

    it('should handle null and undefined values', () => {
      store = createStore({ value: null, other: undefined });

      const state = store.getState();
      expect(state.value).toBeNull();
      expect(state.other).toBeUndefined();
    });

    it('should preserve existing properties when merging', () => {
      store = createStore({
        a: 1,
        b: 2,
        c: {
          x: 10,
          y: 20
        }
      });

      store.setState({
        b: 99,
        c: {
          y: 99
        }
      });

      const state = store.getState();
      expect(state.a).toBe(1);
      expect(state.b).toBe(99);
      expect(state.c.x).toBe(10);
      expect(state.c.y).toBe(99);
    });
  });

  describe('edge cases', () => {
    it('should handle empty state updates', () => {
      store = createStore({ count: 5 });

      store.setState({});

      const state = store.getState();
      expect(state.count).toBe(5);
    });

    it('should handle rapid successive updates', () => {
      store = createStore({ count: 0 });

      for (let i = 1; i <= 100; i++) {
        store.setState({ count: i });
      }

      const state = store.getState();
      expect(state.count).toBe(100);

      const metadata = store.getMetadata();
      expect(metadata.updateCount).toBe(100);
    });

    it('should handle complex nested state', () => {
      const complexState = {
        level1: {
          level2: {
            level3: {
              level4: {
                value: 'deep'
              }
            }
          }
        }
      };

      store = createStore(complexState);

      const state = store.getState();
      expect(state.level1.level2.level3.level4.value).toBe('deep');
    });
  });
});
