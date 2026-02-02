import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Use jsdom environment for DOM testing
    environment: 'jsdom',

    // Global test utilities available in all test files
    globals: true,

    // Test file patterns
    include: ['**/*.test.js'],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],

      // Coverage thresholds - minimum 80%
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80
      },

      // Include source files
      include: ['src/**/*.js'],

      // Exclude test files and config
      exclude: [
        'tests/**',
        '**/*.test.js',
        '**/*.config.js',
        'dist/**',
        'node_modules/**'
      ]
    },

    // Enable watch mode for development
    watch: false
  }
});
