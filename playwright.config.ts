import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  // La suite qa-full requiere un backend real (login por API) y no puede correr
  // en el CI del frontend (que mockea el backend). Se ejecuta manualmente con:
  //   npx playwright test e2e/qa-full.spec.ts --project=chromium
  testIgnore: ['e2e/qa-full.spec.ts'],
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:4011',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});