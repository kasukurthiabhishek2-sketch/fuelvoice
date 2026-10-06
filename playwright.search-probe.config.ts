import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './live-ux-audit',
  testMatch: 'search-latency-probe.spec.mjs',
  outputDir: './live-ux-audit/guardrail-search-probe/test-results',
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: [['line']],
  timeout: 45000,
  expect: { timeout: 12000 },
  use: {
    ...devices['Desktop Chrome'],
    baseURL: process.env.PRODUCTION_URL || 'https://fuelvoice.vercel.app',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },
});
