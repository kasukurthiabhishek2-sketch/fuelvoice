/**
 * Drag simulation test — verifies on-drag dynamic station fetching
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const DIR = 'e2e/screenshots/debug-drag';
mkdirSync(DIR, { recursive: true });

let step = 0;
const snap = async (page, label) => {
  step++;
  const f = `${DIR}/${String(step).padStart(2,'0')}-${label.replace(/[^a-z0-9]+/gi,'_')}.png`;
  await page.screenshot({ path: f, fullPage: false });
  console.log(`📸 [${step}] ${label} → ${f}`);
};

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    geolocation: { latitude: 17.3887027, longitude: 78.4753829 },
    permissions: ['geolocation'],
  });

  const overpassCalls = [];
  context.on('request', req => {
    if (req.url().includes('overpass-api.de')) {
      overpassCalls.push(req.url());
      console.log(`\n🌐 Overpass call #${overpassCalls.length}`);
    }
  });

  const page = await context.newPage();
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.text().includes('FuelVoice')) {
      console.log(`  BROWSER: ${msg.text()}`);
    }
  });

  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle', timeout: 30000 });
  await page.locator('#explore-map').scrollIntoViewIfNeeded();
  await page.waitForTimeout(4000); // wait for initial Overpass fetch
  await snap(page, '1-initial-load');

  const initialOverpassCount = overpassCalls.length;
  console.log(`\n✅ Initial Overpass calls: ${initialOverpassCount}`);

  // Read initial sidebar count
  const initialCount = await page.locator('.custom-scrollbar > div').count();
  console.log(`📋 Initial sidebar station cards: ${initialCount}`);

  // Simulate map drag — pan far north-east (about 5km away)
  console.log('\n🖱️  Simulating map drag...');
  const mapEl = page.locator('.leaflet-container');
  const box = await mapEl.boundingBox();
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;

  // Drag: move map ~300px left and ~200px up (pans the viewport significantly)
  await page.mouse.move(cx, cy);
  await page.mouse.down();
  await page.mouse.move(cx - 300, cy - 200, { steps: 20 });
  await page.mouse.up();

  await snap(page, '2-after-drag');
  console.log('\n⏳ Waiting for debounce + Overpass fetch (2s)...');
  await page.waitForTimeout(3000);

  const afterDragOverpassCount = overpassCalls.length;
  const afterDragCount = await page.locator('.custom-scrollbar > div').count();
  await snap(page, '3-after-area-fetch');

  console.log(`\n📊 RESULTS:`);
  console.log(`  Overpass calls before drag: ${initialOverpassCount}`);
  console.log(`  Overpass calls after drag:  ${afterDragOverpassCount}`);
  console.log(`  New Overpass calls on drag: ${afterDragOverpassCount - initialOverpassCount}`);
  console.log(`  Sidebar cards after drag:   ${afterDragCount}`);
  console.log(`  New stations loaded:        ${afterDragCount - initialCount}`);

  if (afterDragOverpassCount > initialOverpassCount) {
    console.log('\n✅ SUCCESS: Dynamic on-drag fetching is working!');
  } else {
    console.log('\n❌ ISSUE: No new Overpass call triggered on drag');
  }

  await browser.close();
})();
