/**
 * Test utilities for shared testing functionality
 */

/**
 * Create a mock localStorage implementation
 */
export function createMockLocalStorage() {
  let store = {};

  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    }
  };
}

/**
 * Create a mock DOM element with common properties
 */
export function createMockElement(tagName = 'div', props = {}) {
  const element = {
    tagName: tagName.toUpperCase(),
    classList: {
      _classes: new Set(),
      add: function(...classes) {
        classes.forEach(c => this._classes.add(c));
      },
      remove: function(...classes) {
        classes.forEach(c => this._classes.delete(c));
      },
      contains: function(className) {
        return this._classes.has(className);
      },
      toggle: function(className) {
        if (this._classes.has(className)) {
          this._classes.delete(className);
        } else {
          this._classes.add(className);
        }
      }
    },
    style: {},
    innerHTML: '',
    textContent: '',
    value: '',
    disabled: false,
    children: [],
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    setAttribute: vi.fn(),
    getAttribute: vi.fn(),
    ...props
  };

  return element;
}

/**
 * Wait for a condition to be true
 */
export async function waitFor(condition, timeout = 1000) {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (condition()) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, 10));
  }

  throw new Error('Timeout waiting for condition');
}

/**
 * Create a spy function that tracks calls
 */
export function createSpy() {
  const calls = [];
  const spy = (...args) => {
    calls.push(args);
    return spy.returnValue;
  };

  spy.calls = calls;
  spy.returnValue = undefined;
  spy.callCount = () => calls.length;
  spy.calledWith = (...args) => {
    return calls.some(call =>
      call.length === args.length &&
      call.every((arg, i) => arg === args[i])
    );
  };

  return spy;
}
