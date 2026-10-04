import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './ux-audit/final',
  testMatch: 'accessibility.spec.mjs',
  outputDir: './ux-audit/final/a11y-test-results',
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: [['line']],
  timeout: 45000,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [
    {
      name: 'a11y-375',
      use: { ...devices['Desktop Chrome'], viewport: { width: 375, height: 812 } },
    },
    {
      name: 'a11y-1280',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 900 } },
    },
  ],
  webServer: {
    command: 'NEXT_PUBLIC_FUELVOICE_E2E_MOCKS=true npm run build && NEXT_PUBLIC_FUELVOICE_E2E_MOCKS=true npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120000,
  },
});
