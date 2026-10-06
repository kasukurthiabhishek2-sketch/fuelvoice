import fs from 'node:fs';
import path from 'node:path';
import { expect, test } from '@playwright/test';

const OUTPUT = path.join(process.cwd(), 'live-ux-audit', 'guardrail-search-probe');

async function measureSearch(page, viewport) {
  await page.setViewportSize(viewport);
  await page.goto('/search', { waitUntil: 'domcontentloaded' });

  const input = page.getByRole('combobox', { name: /search fuel stations/i });
  await expect(input).toBeVisible();
  await expect.poll(() => input.evaluate((element) =>
    Object.keys(element).some((key) => key.startsWith('__reactProps$'))
  )).toBe(true);

  const startedAt = Date.now();
  await input.fill('Shell Hyderabad');

  const deadline = startedAt + 12000;
  let outcome = 'unresolved';
  let firstOptionText = '';

  while (Date.now() < deadline) {
    const optionCount = await page.getByRole('option').count();
    const busy = await input.getAttribute('aria-busy');
    const noResults = await page.getByText(/No fuel stations found for/i).isVisible().catch(() => false);

    if (optionCount > 0) {
      outcome = 'results';
      firstOptionText = (await page.getByRole('option').first().innerText()).replace(/\s+/g, ' ').trim();
      break;
    }

    if (busy === 'false' && noResults) {
      outcome = 'no-results';
      break;
    }

    await page.waitForTimeout(100);
  }

  return {
    viewport,
    latencyMs: Date.now() - startedAt,
    outcome,
    firstOptionText,
    ariaBusy: await input.getAttribute('aria-busy'),
  };
}

test('measure bounded production search completion', async ({ page }) => {
  const samples = [];

  for (const viewport of [
    { width: 375, height: 812 },
    { width: 1280, height: 900 },
  ]) {
    const sample = await measureSearch(page, viewport);
    samples.push(sample);
    console.log('SEARCH_PROBE ' + JSON.stringify(sample));

    expect(sample.outcome, JSON.stringify(sample)).not.toBe('unresolved');
    if (sample.outcome === 'results') {
      expect(sample.firstOptionText).toMatch(/Hyderabad|Telangana|India/i);
    }
  }

  fs.mkdirSync(OUTPUT, { recursive: true });
  fs.writeFileSync(path.join(OUTPUT, 'baseline.json'), JSON.stringify({
    target: process.env.PRODUCTION_URL || 'https://fuelvoice.vercel.app',
    generatedAt: new Date().toISOString(),
    samples,
  }, null, 2) + '\n');
});
