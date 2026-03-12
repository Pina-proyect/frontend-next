import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';


export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./setupTests.ts'],
    pool: 'vmThreads',
    maxWorkers: 1,
    isolate: false,
    include: ['__tests__/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      reporter: ['text', 'html', 'lcov'],
      exclude: ['e2e/**', 'playwright.config.ts'],
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});