import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.test.ts',
        '**/*.config.ts',
        '**/*.config.js',
        '**/types.ts',
        'src/index.ts', // Entry point, tested manually
      ],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 80, // Set to 80% due to extensive defensive programming in API clients
        statements: 90,
      },
    },
  },
});

