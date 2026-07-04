/**
 * Visual Debug Script — Map Petrol Bunk Diagnosis
 * Run with: node e2e/debug-map.mjs
 *
 * Uses chromium headless to take step-by-step screenshots and
 * diagnose why bunks aren't appearing on the map.
 */

import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const SCREENSHOTS_DIR = 'e2e/screenshots/debug';
mkdirSync(SCREENSHOTS_DIR, { recursive: true });

let step = 0;
async function snap(page, label) {
  step++;
  const filename = join(SCREENSHOTS_DIR, `${String(step).padStart(2,'0')}-${label.replace(/[^a-z0-9]+/gi, '_')}.png`);
  await page.screenshot({ path: filename, fullPage: false });
  console.log(`📸 [${step}] ${label} → ${filename}`);
}

async function log(msg) {
  console.log(`\n🔍 ${msg}`);
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  // Grant geolocation for Hyderabad coords
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    geolocation: { latitude: 17.3887027, longitude: 78.4753829 },
    permissions: ['geolocation'],
  });

  // Intercept and log network requests to Overpass API
  const overpassRequests = [];
  const overpassResponses = [];
  context.on('request', req => {
    if (req.url().includes('overpass')) {
      overpassRequests.push(req.url());
      console.log(`\n🌐 OVERPASS REQUEST: ${req.method()} ${req.url().slice(0,80)}...`);
    }
  });
  context.on('response', async res => {
    if (res.url().includes('overpass')) {
      try {
        const body = await res.text();
        overpassResponses.push({ status: res.status(), body: body.slice(0, 500) });
        console.log(`\n✅ OVERPASS RESPONSE: status=${res.status()}, body_preview=${body.slice(0,200)}`);
      } catch(e) {
        console.log(`\n⚠️ OVERPASS RESPONSE read error: ${e.message}`);
      }
    }
  });

  const page = await context.newPage();

  // Capture all console logs from the browser
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error') {
      console.log(`\n❌ BROWSER ERROR: ${text}`);
    } else if (!text.includes('[Fast Refresh]') && !text.includes('Download the React')) {
      console.log(`\n💬 BROWSER ${type.toUpperCase()}: ${text}`);
    }
  });

  page.on('pageerror', err => {
    console.log(`\n💥 PAGE ERROR: ${err.message}`);
  });

  try {
    // ─── STEP 1: Initial page load (no mock, no localStorage override) ───
    await log('Step 1: Load page WITHOUT mock_user flag (should call real Overpass API)');
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle', timeout: 30000 });
    await snap(page, 'initial-load');

    // ─── STEP 2: Check localStorage ───
    await log('Step 2: Check localStorage for fuelvoice:mock_user flag');
    const mockFlag = await page.evaluate(() => localStorage.getItem('fuelvoice:mock_user'));
    console.log(`  fuelvoice:mock_user = ${JSON.stringify(mockFlag)}`);

    // ─── STEP 3: Check if map section is visible ───
    await log('Step 3: Verify map section exists');
    const mapSection = await page.locator('#explore-map').isVisible();
    console.log(`  #explore-map visible = ${mapSection}`);
    await snap(page, 'after-load-map-section');

    // ─── STEP 4: Scroll to map section ───
    await log('Step 4: Scroll to map section');
    await page.locator('#explore-map').scrollIntoViewIfNeeded();
    await page.waitForTimeout(2000);
    await snap(page, 'scrolled-to-map');

    // ─── STEP 5: Check for Leaflet container ───
    await log('Step 5: Check for Leaflet map canvas');
    const leafletVisible = await page.locator('.leaflet-container').isVisible();
    console.log(`  .leaflet-container visible = ${leafletVisible}`);

    // ─── STEP 6: Check what the sidebar says ───
    await log('Step 6: Read sidebar state');
    const sidebarText = await page.locator('#explore-map').innerText().catch(() => 'N/A');
    console.log(`  Sidebar text preview: ${sidebarText.slice(0, 300)}`);
    await snap(page, 'sidebar-state');

    // ─── STEP 7: Check geolocation state ───
    await log('Step 7: Check geolocation & location state in DOM');
    await page.waitForTimeout(3000); // Let geolocation resolve
    await snap(page, 'after-geolocation-wait');

    // ─── STEP 8: Inspect what JS state says ───
    await log('Step 8: Read React state via DOM inspection');
    const hasLocationBadge = await page.locator('#explore-map').locator('text=Active').isVisible().catch(() => false);
    const visibleBunksHeader = await page.locator('text=Visible Bunks').isVisible().catch(() => false);
    const permitPromptVisible = await page.locator('text=Discover Stations Near You').isVisible().catch(() => false);
    console.log(`  "Active" badge visible = ${hasLocationBadge}`);
    console.log(`  "Visible Bunks" header visible = ${visibleBunksHeader}`);
    console.log(`  Location prompt visible = ${permitPromptVisible}`);
    await snap(page, 'after-react-state-check');

    // ─── STEP 9: Wait for bunks to load ───
    await log('Step 9: Wait 5 more seconds for Overpass API call to resolve');
    await page.waitForTimeout(5000);
    await snap(page, 'after-long-wait');

    // ─── STEP 10: Check marker count on Leaflet canvas ───
    await log('Step 10: Count station markers on the map');
    const markerCount = await page.locator('.leaflet-container .custom-marker').count();
    console.log(`  Custom markers rendered = ${markerCount}`);

    const sidebarCardCount = await page.locator('#explore-map .custom-scrollbar > div').count();
    console.log(`  Sidebar station cards = ${sidebarCardCount}`);
    await snap(page, 'marker-count-check');

    // ─── STEP 11: Simulate a forced Overpass call via browser console ───
    await log('Step 11: Manually trigger Overpass API call from browser');
    const overpassResult = await page.evaluate(async () => {
      try {
        const response = await fetch('https://overpass-api.de/api/interpreter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `data=${encodeURIComponent('[out:json][timeout:10];\n(\n  nwr["amenity"="fuel"](around:5000,17.3887027,78.4753829);\n);\nout body center;')}`,
        });
        const data = await response.json();
        return {
          ok: response.ok,
          status: response.status,
          count: data.elements ? data.elements.length : 0,
          preview: JSON.stringify(data.elements ? data.elements.slice(0, 2) : []).slice(0, 400),
        };
      } catch (e) {
        return { error: e.message };
      }
    });
    console.log(`  Overpass test call result: ${JSON.stringify(overpassResult, null, 2)}`);

    // ─── STEP 12: Check if useGeolocation hook triggered ───
    await log('Step 12: Check "Enable Location" or "Detecting" buttons');
    const enableBtn = await page.locator('text=Enable Location').isVisible().catch(() => false);
    const detectingBtn = await page.locator('text=Detecting Location').isVisible().catch(() => false);
    console.log(`  "Enable Location" button visible = ${enableBtn}`);
    console.log(`  "Detecting Location" button visible = ${detectingBtn}`);
    await snap(page, 'location-button-state');

    // ─── STEP 13: Full map section screenshot ───
    await log('Step 13: Full map section close-up screenshot');
    try {
      const mapEl = page.locator('#explore-map');
      await mapEl.screenshot({ path: join(SCREENSHOTS_DIR, '13-map-section-closeup.png') });
      console.log(`📸 [13] Map section close-up → ${SCREENSHOTS_DIR}/13-map-section-closeup.png`);
    } catch (e) {
      console.log(`  Map screenshot error: ${e.message}`);
    }

    // ─── STEP 14: Check useGeolocation hook result ───
    await log('Step 14: Log geolocation via JS API');
    const geoResult = await page.evaluate(() => {
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          pos => resolve({ ok: true, lat: pos.coords.latitude, lng: pos.coords.longitude }),
          err => resolve({ ok: false, error: err.message, code: err.code }),
          { timeout: 5000 }
        );
      });
    });
    console.log(`  Geolocation result: ${JSON.stringify(geoResult)}`);

    // ─── Summary ───
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`SUMMARY`);
    console.log(`${'═'.repeat(60)}`);
    console.log(`Overpass requests made:   ${overpassRequests.length}`);
    console.log(`Overpass responses got:   ${overpassResponses.length}`);
    overpassResponses.forEach((r, i) => console.log(`  Response ${i+1}: status=${r.status}, body=${r.body.slice(0,100)}`));
    console.log(`Leaflet container:        ${leafletVisible}`);
    console.log(`Markers on map:           ${markerCount}`);
    console.log(`Sidebar cards:            ${sidebarCardCount}`);
    console.log(`Location prompt showing:  ${permitPromptVisible}`);
    console.log(`Overpass direct test:     ${JSON.stringify(overpassResult)}`);

  } catch (err) {
    console.error(`\n💥 SCRIPT ERROR: ${err.stack}`);
    await snap(page, 'error-state');
  } finally {
    await browser.close();
    console.log(`\n✅ All screenshots saved to ${SCREENSHOTS_DIR}/`);
  }
})();
