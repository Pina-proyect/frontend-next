import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';


export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./setupTests.ts'],
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