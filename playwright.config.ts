import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  outputDir: './e2e/test-results',
  fullyParallel: false,
  retries: 1,
  workers: 1,
  reporter: [['html', { outputFolder: './e2e/report', open: 'never' }]],
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'on',
    video: 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 14'] },
    },
  ],
  /* Test the optimized production build so framework dev UI cannot contaminate visual evidence. */
  webServer: {
    command: 'NEXT_PUBLIC_FUELVOICE_E2E_MOCKS=true npm run build && NEXT_PUBLIC_FUELVOICE_E2E_MOCKS=true npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120000,
  },
});
