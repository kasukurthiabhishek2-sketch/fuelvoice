import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.PRODUCTION_URL || 'https://fuelvoice.vercel.app';

const widths = [
  ['live-375', 375, 812],
  ['live-768', 768, 1024],
  ['live-1280', 1280, 900],
  ['live-1920', 1920, 1080],
] as const;

export default defineConfig({
  testDir: './e2e',
  testMatch: 'live-production-audit.spec.ts',
  outputDir: './live-ux-audit/test-results',
  fullyParallel: false,
  retries: 1,
  workers: 1,
  reporter: [['line']],
  timeout: 45000,
  expect: { timeout: 10000 },
  use: {
    baseURL,
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
});
