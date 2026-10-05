import fs from 'node:fs';
import path from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const OUTPUT = path.resolve(process.cwd(), process.env.LIVE_UX_OUTPUT_DIR || 'live-ux-audit/baseline');
const STATION_ID = 'node_2817379324';

function attachSignals(page) {
  const signals = { consoleErrors: [], pageErrors: [], failedRequests: [], badResponses: [] };

  page.on('console', message => {
    if (message.type() === 'error') signals.consoleErrors.push(message.text());
  });
  page.on('pageerror', error => signals.pageErrors.push(error.message));
  page.on('requestfailed', request => {
    signals.failedRequests.push(request.method() + ' ' + request.url() + ' :: ' + (request.failure()?.errorText || 'failed'));
  });
  page.on('response', response => {
    if (response.status() >= 400) signals.badResponses.push(String(response.status()) + ' ' + response.url());
  });

  return signals;
}

async function settle(page) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1200);
}

async function capture(page, testInfo, scenario, signals) {
  await settle(page);

  const axe = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  const metrics = await page.evaluate(() => {
    const visible = (element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0;
    };

    const interactive = Array.from(document.querySelectorAll(
      'a[href], button, input, textarea, select, [role="button"], [role="link"], [role="radio"], [role="checkbox"], [role="option"]'
    ))
      .filter(visible)
      .map(element => {
        const rect = element.getBoundingClientRect();
        const name =
          element.getAttribute('aria-label') ||
          element.getAttribute('title') ||
          (element.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 100);

        return {
          tag: element.tagName.toLowerCase(),
          role: element.getAttribute('role'),
          name,
          width: Math.round(rect.width * 10) / 10,
          height: Math.round(rect.height * 10) / 10,
          x: Math.round(rect.x),
          y: Math.round(rect.y),
        };
      });

    const nav = performance.getEntriesByType('navigation')[0];

    return {
      title: document.title,
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      scrollWidth: document.documentElement.scrollWidth,
      scrollHeight: document.documentElement.scrollHeight,
      headings: Array.from(document.querySelectorAll('h1,h2,h3'))
        .filter(visible)
        .map(h => ({
          level: h.tagName.toLowerCase(),
          text: (h.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 160),
        })),
      interactive,
      undersizedTargets: interactive.filter(item => item.width < 24 || item.height < 24),
      navigation: nav ? {
        domContentLoadedMs: Math.round(nav.domContentLoadedEventEnd),
        loadMs: Math.round(nav.loadEventEnd),
        responseStartMs: Math.round(nav.responseStart),
        transferSize: nav.transferSize,
      } : null,
      resourceCount: performance.getEntriesByType('resource').length,
    };
  });

  fs.mkdirSync(path.join(OUTPUT, 'screenshots'), { recursive: true });
  fs.mkdirSync(path.join(OUTPUT, 'records'), { recursive: true });

  const key = testInfo.project.name + '-' + scenario;
  await page.screenshot({
    path: path.join(OUTPUT, 'screenshots', key + '.png'),
    fullPage: true,
  });

  fs.writeFileSync(
    path.join(OUTPUT, 'records', key + '.json'),
    JSON.stringify({
      project: testInfo.project.name,
      scenario,
      url: page.url(),
      metrics,
      signals,
      axeViolations: axe.violations.map(v => ({
        id: v.id,
        impact: v.impact,
        help: v.help,
        nodes: v.nodes.map(n => ({
          target: n.target,
          html: n.html.slice(0, 500),
        })),
      })),
    }, null, 2) + '\n',
  );

  expect(metrics.scrollWidth, 'document overflow in ' + key).toBeLessThanOrEqual(metrics.innerWidth + 1);
  expect(signals.pageErrors, 'page errors in ' + key).toEqual([]);
}

async function recordKeyboardSequence(page, count = 16) {
  const sequence = [];

  for (let i = 0; i < count; i += 1) {
    await page.keyboard.press('Tab');

    sequence.push(await page.evaluate(() => {
      const element = document.activeElement;
      if (!element) return null;

      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);

      return {
        tag: element.tagName.toLowerCase(),
        role: element.getAttribute('role'),
        name:
          element.getAttribute('aria-label') ||
          element.getAttribute('title') ||
          (element.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 100),
        id: element.id,
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        outlineWidth: style.outlineWidth,
        outlineStyle: style.outlineStyle,
        boxShadow: style.boxShadow,
      };
    }));
  }

  return sequence;
}

test('home production surface and both themes', async ({ page }, testInfo) => {
  const signals = attachSignals(page);

  await page.goto('/');
  await expect(page.getByRole('link', { name: /FuelVoice home/i })).toBeVisible();
  await capture(page, testInfo, 'home-default', signals);

  const theme = page.getByRole('button', { name: /Switch to (dark|light) mode/i });
  if (await theme.count()) {
    await theme.click();
    await page.waitForTimeout(250);
    await capture(page, testInfo, 'home-theme-toggled', signals);
  }
});

test('search production interaction', async ({ page }, testInfo) => {
  const signals = attachSignals(page);

  await page.goto('/search');
  const input = page.getByRole('combobox', { name: /search fuel stations/i });

  await expect(input).toBeVisible();
  await input.focus();
  await capture(page, testInfo, 'search-focused', signals);

  await input.fill('Shell Hyderabad');
  await page.waitForTimeout(3500);
  await capture(page, testInfo, 'search-query', signals);

  if (await page.getByRole('option').count()) {
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Escape');
  }
});

test('known production station surface', async ({ page }, testInfo) => {
  const signals = attachSignals(page);

  await page.goto('/station/' + STATION_ID);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 20000 });
  await capture(page, testInfo, 'station-default', signals);

  const reviews = page.getByRole('heading', { name: 'Reviews', exact: true });
  if (await reviews.count()) {
    await reviews.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await capture(page, testInfo, 'station-reviews', signals);
  }
});

test('signed-out admin recovery', async ({ page }, testInfo) => {
  const signals = attachSignals(page);

  await page.goto('/admin');
  await expect(page.getByRole('heading', { name: /Access Denied|Admin Only|Admin Panel/i })).toBeVisible({ timeout: 15000 });
  await capture(page, testInfo, 'admin-signed-out', signals);
});

test('404 recovery', async ({ page }, testInfo) => {
  const signals = attachSignals(page);

  await page.goto('/live-ux-audit-not-a-route');
  await expect(page.getByRole('heading', { name: /Page Not Found/i })).toBeVisible();
  await capture(page, testInfo, 'not-found', signals);
});

test('keyboard-only home navigation exposes visible focus', async ({ page }, testInfo) => {
  const signals = attachSignals(page);

  await page.goto('/');
  await settle(page);

  const keyboard = await recordKeyboardSequence(page, 18);

  fs.mkdirSync(path.join(OUTPUT, 'records'), { recursive: true });
  fs.writeFileSync(
    path.join(OUTPUT, 'records', testInfo.project.name + '-keyboard-home.json'),
    JSON.stringify({
      project: testInfo.project.name,
      scenario: 'keyboard-home',
      url: page.url(),
      keyboard,
      signals,
    }, null, 2) + '\n',
  );

  const focusless = keyboard.filter(item => item && item.outlineWidth === '0px' && item.boxShadow === 'none');
  expect(focusless.length, JSON.stringify(focusless, null, 2)).toBe(0);
});

test('production fixes stay ergonomic and discoverable', async ({ page }, testInfo) => {
  const signals = attachSignals(page);
  const viewport = page.viewportSize();
  if (!viewport) throw new Error('Viewport is required for live UX verification');

  await page.goto('/search');
  const input = page.getByRole('combobox', { name: /search fuel stations/i });
  await expect(input).toBeVisible();
  await input.fill('Shell Hyderabad');
  await page.waitForTimeout(3500);

  const clear = page.getByRole('button', { name: 'Clear search' });
  const clearBox = await clear.boundingBox();
  expect(clearBox).not.toBeNull();
  expect(clearBox.height).toBeGreaterThanOrEqual(44);

  const listbox = page.getByRole('listbox', { name: 'Fuel station search results' });
  if (await listbox.count()) {
    const box = await listbox.boundingBox();
    expect(box).not.toBeNull();
    expect(box.y + box.height).toBeLessThanOrEqual(viewport.height + 1);
    const scroll = await listbox.evaluate(element => ({
      clientHeight: element.clientHeight,
      scrollHeight: element.scrollHeight,
      overflowY: getComputedStyle(element).overflowY,
    }));
    if (scroll.scrollHeight > scroll.clientHeight) {
      expect(['auto', 'scroll']).toContain(scroll.overflowY);
    }
  }

  await page.goto('/station/' + STATION_ID);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 20000 });

  const issueFilters = page.getByRole('group', { name: 'Filter reviews by issue' });
  await expect(issueFilters).toBeVisible();
  const filterMetrics = await issueFilters.evaluate(element => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
    overflowX: getComputedStyle(element).overflowX,
    flexWrap: getComputedStyle(element).flexWrap,
  }));

  if (viewport.width >= 640) {
    expect(filterMetrics.scrollWidth).toBeLessThanOrEqual(filterMetrics.clientWidth + 1);
    expect(filterMetrics.flexWrap).toBe('wrap');
  } else {
    expect(filterMetrics.overflowX).toBe('auto');
  }

  const directions = page.getByRole('link', { name: 'Directions ↗', exact: true });
  await directions.scrollIntoViewIfNeeded();
  const directionsBox = await directions.boundingBox();
  expect(directionsBox).not.toBeNull();
  expect(directionsBox.height).toBeGreaterThanOrEqual(44);

  const locationHeading = page.getByRole('heading', { name: 'Location', exact: true });
  const detailsHeading = page.getByRole('heading', { name: 'Published station information' });
  const complaintHeading = page.getByRole('heading', { name: 'Go straight to an official channel.' });
  const verticalOrder = await Promise.all(
    [locationHeading, detailsHeading, complaintHeading].map(async locator => (await locator.boundingBox())?.y ?? Infinity)
  );
  expect(verticalOrder[0]).toBeLessThan(verticalOrder[1]);
  expect(verticalOrder[1]).toBeLessThan(verticalOrder[2]);

  if (viewport.width < 1024) {
    const quickActions = page.getByLabel('Station quick actions');
    await expect(quickActions).toBeVisible();
    await expect(quickActions.getByRole('link', { name: 'Write a review' })).toBeVisible();
    await expect(quickActions.getByRole('link', { name: 'Get directions' })).toBeVisible();
    await expect(quickActions.getByRole('link', { name: /complaint/i })).toHaveCount(0);
  }

  const map = page.locator('.leaflet-container');
  await map.scrollIntoViewIfNeeded();
  await expect(map.locator('..').getByRole('link', { name: 'Get Directions', exact: true })).toHaveCount(0);

  const footerHome = page.getByRole('contentinfo').getByRole('link', { name: 'FuelVoice', exact: true });
  await footerHome.scrollIntoViewIfNeeded();
  const footerBox = await footerHome.boundingBox();
  expect(footerBox).not.toBeNull();
  expect(footerBox.height).toBeGreaterThanOrEqual(44);

  await capture(page, testInfo, 'production-fix-verification', signals);
});

test('production search navigation is keyboard reachable', async ({ page }, testInfo) => {
  const signals = attachSignals(page);

  await page.goto('/');
  const searchLink = page.getByRole('link', { name: 'Search fuel stations' });

  let reached = false;
  for (let i = 0; i < 10; i += 1) {
    await page.keyboard.press('Tab');
    if (await searchLink.evaluate(element => element === document.activeElement)) {
      reached = true;
      break;
    }
  }

  expect(reached).toBe(true);
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/search$/);
  await capture(page, testInfo, 'keyboard-search-arrival', signals);
});
