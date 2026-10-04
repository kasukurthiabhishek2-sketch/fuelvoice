import { defineConfig, devices } from '@playwright/test';

const widths = [
  ['mobile', 375, 812],
  ['audit-768', 768, 1024],
  ['audit-1280', 1280, 900],
  ['audit-1920', 1920, 1080],
] as const;

export default defineConfig({
  testDir: './e2e',
  testMatch: ['fuelvoice.spec.ts', 'ux-audit-phase4.spec.ts'],
  outputDir: './ux-audit/final/e2e-results',
  fullyParallel: false,
  retries: 1,
  workers: 1,
  reporter: [['line']],
  timeout: 45000,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: widths.map(([name, width, height]) => ({
    name,
    use: {
      ...devices['Desktop Chrome'],
      viewport: { width, height },
    },
  })),
  webServer: {
    command: 'NEXT_PUBLIC_FUELVOICE_E2E_MOCKS=true npm run build && NEXT_PUBLIC_FUELVOICE_E2E_MOCKS=true npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120000,
  },
});
