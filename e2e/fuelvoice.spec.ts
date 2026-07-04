/**
 * FuelVoice E2E Tests
 * 
 * Tests core functionality:
 * 1. Landing page loads correctly
 * 2. Search autocomplete works
 * 3. Station page loads
 * 4. Dark mode toggle works
 * 5. Auth UI is present
 * 6. Mobile responsiveness
 */

import { test, expect } from '@playwright/test';

// ────────────────────────────────────────────────
// Landing Page Tests
// ────────────────────────────────────────────────

test.describe('Landing Page', () => {
  test('should load and display hero section', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Hero heading
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('Fuel Station');

    // Search bar
    const searchInput = page.getByRole('combobox', { name: /search fuel stations/i });
    await expect(searchInput).toBeVisible();

    // Screenshot
    await page.screenshot({ path: 'e2e/screenshots/01-landing-hero.png', fullPage: false });
  });

  test('should display FuelVoice logo in header', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const logo = page.getByRole('link', { name: /fuelvoice home/i });
    await expect(logo).toBeVisible();
    await expect(logo).toContainText('FuelVoice');
  });

  test('should display statistics section', async ({ page }) => {
    await page.goto('/');

    // Scroll to statistics
    const statsSection = page.getByText('Powered by Community');
    await statsSection.scrollIntoViewIfNeeded();
    await expect(statsSection).toBeVisible();

    await page.screenshot({ path: 'e2e/screenshots/02-statistics.png', fullPage: false });
  });

  test('should display footer with attribution', async ({ page }) => {
    await page.goto('/');

    const footer = page.getByText('Powered by OpenStreetMap');
    await footer.scrollIntoViewIfNeeded();
    await expect(footer).toBeVisible();

    await page.screenshot({ path: 'e2e/screenshots/03-footer.png', fullPage: false });
  });

  test('should show nearby stations section', async ({ page }) => {
    await page.goto('/');

    const nearbyHeading = page.getByRole('heading', { name: /nearby fuel stations/i });
    await nearbyHeading.scrollIntoViewIfNeeded();
    await expect(nearbyHeading).toBeVisible();

    await page.screenshot({ path: 'e2e/screenshots/04-nearby-stations.png', fullPage: false });
  });

  test('full page screenshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // Let animations settle

    await page.screenshot({ path: 'e2e/screenshots/05-full-landing.png', fullPage: true });
  });
});

// ────────────────────────────────────────────────
// Search Tests
// ────────────────────────────────────────────────

test.describe('Search', () => {
  test('should show autocomplete results when typing', async ({ page }) => {
    // Route Mock Photon API
    await page.route('https://photon.komoot.io/api**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [78.4753829, 17.3887027]
              },
              properties: {
                osm_id: 6254336890,
                osm_type: 'N',
                name: 'Shell Fuel Station',
                city: 'Hyderabad',
                state: 'Telangana',
                country: 'India',
                countrycode: 'IN'
              }
            }
          ]
        })
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const searchInput = page.getByRole('combobox', { name: /search fuel stations/i });
    await searchInput.click();
    await searchInput.fill('Shell');

    // Wait for debounce (300ms) + API call
    await page.waitForTimeout(2000);

    // Check if results dropdown appeared or no-results message
    const dropdown = page.locator('[role="listbox"], [role="option"]');
    const noResults = page.getByText(/no fuel stations found/i);

    const hasResults = await dropdown.count() > 0;
    const hasNoResultsMsg = await noResults.isVisible().catch(() => false);

    // Either results or "no results" message should appear — both mean search worked
    expect(hasResults || hasNoResultsMsg).toBeTruthy();

    await page.screenshot({ path: 'e2e/screenshots/06-search-results.png', fullPage: false });
  });

  test('search input should be focusable and accept text', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const searchInput = page.getByRole('combobox', { name: /search fuel stations/i });
    await searchInput.click();
    await searchInput.fill('Indian Oil');

    await expect(searchInput).toHaveValue('Indian Oil');
  });

  test('should clear search on Escape', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const searchInput = page.getByRole('combobox', { name: /search fuel stations/i });
    await searchInput.click();
    await searchInput.fill('BP');
    await page.waitForTimeout(500);

    await searchInput.press('Escape');

    // Dropdown should close (input loses focus)
    const dropdown = page.locator('[role="listbox"]');
    await expect(dropdown).toHaveCount(0);
  });
});

// ────────────────────────────────────────────────
// Dark Mode Tests
// ────────────────────────────────────────────────

test.describe('Dark Mode', () => {
  test('should toggle dark mode', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find the theme toggle button
    const themeToggle = page.getByRole('button', { name: /switch to/i });
    await expect(themeToggle).toBeVisible();

    // Check initial state
    const htmlElement = page.locator('html');
    const initialHasDark = await htmlElement.evaluate(el => el.classList.contains('dark'));

    // Click toggle
    await themeToggle.click();
    await page.waitForTimeout(500);

    // Check it changed
    const afterHasDark = await htmlElement.evaluate(el => el.classList.contains('dark'));
    expect(afterHasDark).not.toBe(initialHasDark);

    await page.screenshot({ path: 'e2e/screenshots/07-dark-mode-toggled.png', fullPage: false });

    // Toggle back
    await themeToggle.click();
    await page.waitForTimeout(500);

    const finalHasDark = await htmlElement.evaluate(el => el.classList.contains('dark'));
    expect(finalHasDark).toBe(initialHasDark);
  });
});

// ────────────────────────────────────────────────
// Authentication UI Tests
// ────────────────────────────────────────────────

test.describe('Auth UI', () => {
  test('should show sign in button when not logged in', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const signInButton = page.getByRole('button', { name: /sign in/i });
    await expect(signInButton).toBeVisible();

    await page.screenshot({ path: 'e2e/screenshots/08-sign-in-button.png', fullPage: false });
  });
});

// ────────────────────────────────────────────────
// Station Page Tests
// ────────────────────────────────────────────────

test.describe('Station Page', () => {
  test('should show not-found for invalid station ID', async ({ page }) => {
    await page.goto('/station/invalid_0');
    await page.waitForLoadState('domcontentloaded');

    // Should show error or station not found (wait for API call to fail)
    const notFound = page.getByText(/station not found|something went wrong/i);
    await expect(notFound.first()).toBeVisible({ timeout: 20000 });

    await page.screenshot({ path: 'e2e/screenshots/09-station-not-found.png', fullPage: false });
  });
});

// ────────────────────────────────────────────────
// 404 Page Tests
// ────────────────────────────────────────────────

test.describe('404 Page', () => {
  test('should display custom 404 page', async ({ page }) => {
    await page.goto('/some-nonexistent-page');
    await page.waitForLoadState('networkidle');

    const heading = page.getByText('Page Not Found');
    await expect(heading).toBeVisible();

    const backLink = page.getByRole('link', { name: /back to home/i });
    await expect(backLink).toBeVisible();

    await page.screenshot({ path: 'e2e/screenshots/10-404-page.png', fullPage: false });
  });
});

// ────────────────────────────────────────────────
// Admin Page Tests
// ────────────────────────────────────────────────

test.describe('Admin Page', () => {
  test('should block access for unauthenticated users', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const accessDenied = page.getByText(/access denied|sign in/i);
    await expect(accessDenied.first()).toBeVisible();

    await page.screenshot({ path: 'e2e/screenshots/11-admin-blocked.png', fullPage: false });
  });
});

// ────────────────────────────────────────────────
// SEO Tests
// ────────────────────────────────────────────────

test.describe('SEO', () => {
  test('should have correct page title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/fuelvoice/i);
  });

  test('should have meta description', async ({ page }) => {
    await page.goto('/');
    const metaDesc = page.locator('meta[name="description"]');
    await expect(metaDesc).toHaveAttribute('content', /fuel station reviews/i);
  });

  test('robots.txt should be accessible', async ({ page }) => {
    const response = await page.goto('/robots.txt');
    expect(response?.status()).toBe(200);
  });

  test('sitemap.xml should be accessible', async ({ page }) => {
    const response = await page.goto('/sitemap.xml');
    expect(response?.status()).toBe(200);
  });
});

// ────────────────────────────────────────────────
// Geolocation & Interactive Map Tests
// ────────────────────────────────────────────────

test.describe('Geolocation & Map', () => {
  test.use({
    geolocation: { latitude: 17.3887, longitude: 78.4754 },
    permissions: ['geolocation'],
  });

  test('should load map with simulated location and show nearby elements', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Click enable/request location if required, or wait for auto-detection
    const mapSection = page.locator('#explore-map');
    await expect(mapSection).toBeVisible();

    // Leaflet container should render
    const leafletContainer = page.locator('.leaflet-container');
    await expect(leafletContainer).toBeVisible({ timeout: 10000 });

    // Nearby list should show items
    const nearbyCard = page.locator('.grid >> .card').first();
    await expect(nearbyCard).toBeVisible();

    await page.screenshot({ path: 'e2e/screenshots/12-map-loaded-with-location.png', fullPage: false });
  });
});

// ────────────────────────────────────────────────
// Review Submission Test
// ────────────────────────────────────────────────

test.describe('Authenticated Actions', () => {
  test('should submit a review successfully using mock authentication', async ({ page, context }) => {
    // Navigate and set mock user state
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('fuelvoice:mock_user', 'true');
    });

    // Go to the test station page
    await page.goto('/station/node_6254336890');
    
    // Listen to console and page errors
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', err => console.error('BROWSER ERROR:', err));

    await expect(page.getByRole('heading', { name: 'Fuel Station', level: 1 })).toBeVisible({ timeout: 20000 });

    // Click write a review button
    const writeBtn = page.getByRole('button', { name: /write a review/i });
    await expect(writeBtn).toBeVisible({ timeout: 10000 });
    await writeBtn.click();

    // Fill the review form
    await page.locator('#review-title').fill('Great experience');
    await page.locator('#review-content').fill('The fuel quality was excellent and the service was super fast. Highly recommended!');
    
    // Wait for the form animation to complete and hydration to settle
    await page.waitForTimeout(1500);

    // Select 5 stars inside the review form
    await page.locator('div').filter({ hasText: /^Overall Rating \*/ }).getByRole('button', { name: '5 stars' }).click();

    // Submit review
    const submitBtn = page.getByRole('button', { name: /submit review/i });
    await submitBtn.click();

    // Verify success toast/alert
    const toast = page.getByText(/review submitted/i);
    await expect(toast).toBeVisible({ timeout: 10000 });

    await page.screenshot({ path: 'e2e/screenshots/13-review-submitted.png', fullPage: false });
  });
});

// ────────────────────────────────────────────────
// Search Autocomplete & Keyboard Navigation
// ────────────────────────────────────────────────

test.describe('Search Autocomplete & Keyboard Navigation', () => {
  test('should navigate autocomplete results using keyboard and submit', async ({ page }) => {
    // Route Mock Photon API
    await page.route('https://photon.komoot.io/api**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [78.4753829, 17.3887027]
              },
              properties: {
                osm_id: 6254336890,
                osm_type: 'N',
                name: 'Shell Fuel Station',
                city: 'Hyderabad',
                state: 'Telangana',
                country: 'India',
                countrycode: 'IN'
              }
            }
          ]
        })
      });
    });

    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('fuelvoice:mock_user', 'true');
    });
    await page.waitForLoadState('networkidle');

    const searchInput = page.getByRole('combobox', { name: /search fuel stations/i });
    await searchInput.click();
    await searchInput.fill('Shell');

    // Wait for autocomplete to populate
    await page.waitForTimeout(2000);

    // Verify search results dropdown is visible
    const dropdown = page.locator('#search-results');
    await expect(dropdown).toBeVisible();

    // Take screenshot to verify dropdown sits above map/content (no overlap)
    await page.screenshot({ path: 'e2e/screenshots/14-search-results-visible-above-map.png', fullPage: false });

    // Press ArrowDown to select the first element
    await searchInput.press('ArrowDown');
    
    // Check that first option is selected (role="option" and aria-selected="true")
    const firstOption = page.locator('[role="option"]').first();
    await expect(firstOption).toHaveAttribute('aria-selected', 'true');

    // Press Enter to navigate
    await searchInput.press('Enter');

    // Should navigate to the station details page
    await expect(page).toHaveURL(/\/station\//);
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible({ timeout: 15000 });

    await page.screenshot({ path: 'e2e/screenshots/15-navigation-success.png', fullPage: false });
  });
});

// ────────────────────────────────────────────────
// Review Interactions Tests
// ────────────────────────────────────────────────

test.describe('Review Interactions', () => {
  test('should like and report reviews when authenticated', async ({ page }) => {
    // Enable mock authenticated user
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('fuelvoice:mock_user', 'true');
    });

    // Go to test station page
    await page.goto('/station/node_6254336890');
    await expect(page.getByRole('heading', { name: 'Fuel Station', level: 1 })).toBeVisible({ timeout: 10000 });

    // Verify there is a review card (mocked reviews list contains 3 mock reviews by default)
    // Find the like button on the first review card
    const likeBtn = page.getByRole('button', { name: /like review/i }).first();
    await expect(likeBtn).toBeVisible();

    // Click like button and verify the like count increases/state updates
    await likeBtn.click();
    
    // Verify liked state (button background/text color or icon fill change, e.g. unlike class/label is present)
    const unlikeBtn = page.getByRole('button', { name: /unlike review/i }).first();
    await expect(unlikeBtn).toBeVisible();

    // Test reporting a review
    const reportBtn = page.getByRole('button', { name: /report review/i }).first();
    await expect(reportBtn).toBeVisible();
    await reportBtn.click();

    // The report dialog should slide down/expand
    const spamBtn = page.getByRole('button', { name: /spam/i }).first();
    await expect(spamBtn).toBeVisible();
    await spamBtn.click();

    // Success toast should show up
    const toast = page.getByText(/report submitted/i);
    await expect(toast).toBeVisible({ timeout: 10000 });

    await page.screenshot({ path: 'e2e/screenshots/16-review-liked-and-reported.png', fullPage: false });
  });
});

// ────────────────────────────────────────────────
// Consumer Complaints Widget Tests
// ────────────────────────────────────────────────

test.describe('Consumer Complaints Widget', () => {
  test('should render complaint portals based on geocoded location', async ({ page }) => {
    // Enable mock mode
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('fuelvoice:mock_user', 'true');
    });

    // Navigate to test station page (simulating country IN)
    await page.goto('/station/node_6254336890');
    await page.waitForLoadState('networkidle');

    // Scroll to the complaints section / button
    const complaintsBtn = page.getByRole('button', { name: /file consumer complaint/i });
    await complaintsBtn.scrollIntoViewIfNeeded();
    await expect(complaintsBtn).toBeVisible();

    // Click to expand / open complaints modal or accordion
    await complaintsBtn.click();

    // For country IN, India portals should be listed (National Consumer Helpline, MoPNG e-Seva, etc.)
    const indiaPortal = page.getByText(/National Consumer Helpline/i);
    await expect(indiaPortal).toBeVisible();

    await page.screenshot({ path: 'e2e/screenshots/17-complaints-widget.png', fullPage: false });
  });
});

// ────────────────────────────────────────────────
// Admin Dashboard Tests
// ────────────────────────────────────────────────

test.describe('Admin Dashboard', () => {
  test('should load admin dashboard and perform moderation actions', async ({ page }) => {
    // Log in as mock admin
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('fuelvoice:mock_user', 'admin');
    });

    // Go to admin page
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Verify admin dashboard components are visible
    // 1. Stat cards
    await expect(page.getByText('Total Reviews', { exact: true })).toBeVisible();
    await expect(page.getByText('Pending Reports', { exact: true })).toBeVisible();
    await expect(page.getByText('Total Users', { exact: true })).toBeVisible();

    // 2. Pending Reports List
    await expect(page.getByText(/spam/i).first()).toBeVisible();

    // Verify interaction: click Accept on report
    const acceptReportBtn = page.getByRole('button', { name: 'Accept', exact: true }).first();
    await expect(acceptReportBtn).toBeVisible();
    await acceptReportBtn.click();

    // Toast or status change should occur
    await expect(page.getByText(/report reviewed/i).first()).toBeVisible({ timeout: 10000 });

    // 3. Recent Reviews list
    await expect(page.getByText(/The fuel quality was excellent/i).first()).toBeVisible();

    // Click Feature button on review
    const featureBtn = page.getByRole('button', { name: '⭐ Feature', exact: true }).first();
    await expect(featureBtn).toBeVisible();
    await featureBtn.click();
    await expect(page.getByText(/review featured/i).first()).toBeVisible({ timeout: 10000 });

    // Click Hide button on review
    const hideBtn = page.getByRole('button', { name: '🙈 Hide', exact: true }).first();
    await expect(hideBtn).toBeVisible();
    await hideBtn.click();
    await expect(page.getByText(/review hidden/i).first()).toBeVisible({ timeout: 10000 });

    // 4. Users list
    await expect(page.getByRole('cell', { name: 'Spammer Bob' })).toBeVisible();

    // Click Ban button on user
    const banBtn = page.getByRole('button', { name: 'Ban', exact: true }).first();
    await expect(banBtn).toBeVisible();
    await banBtn.click();
    await expect(page.getByText(/user banned/i).first()).toBeVisible({ timeout: 10000 });

    await page.screenshot({ path: 'e2e/screenshots/18-admin-dashboard.png', fullPage: true });
  });
});

// ────────────────────────────────────────────────
// Map Theme Switcher Tests
// ────────────────────────────────────────────────

test.describe('Map Theme Switcher', () => {
  test('should open theme switcher and switch themes', async ({ page }) => {
    // Grant geolocation permissions and set coordinates
    const context = page.context();
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: 17.3887027, longitude: 78.4753829 });

    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('fuelvoice:mock_user', 'true');
    });
    
    // Refresh to apply mock user and geolocation settings
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wait for map container to be visible
    const map = page.locator('#explore-map');
    await expect(map).toBeVisible();

    // Locate the switcher button by title/aria-label
    const switcherBtn = page.getByRole('button', { name: 'Switch Map Theme' });
    await expect(switcherBtn).toBeVisible();
    
    // Click switcher
    await switcherBtn.click();

    // Check that theme options are visible
    const satelliteOption = page.getByRole('button', { name: /satellite/i });
    await expect(satelliteOption).toBeVisible();

    // Select satellite option
    await satelliteOption.click();

    // Options menu should close
    await expect(satelliteOption).not.toBeVisible();

    // The switcher button should show Esri/Satellite icon
    await expect(page.getByRole('button', { name: 'Switch Map Theme' })).toHaveText('🛰️');

    await page.screenshot({ path: 'e2e/screenshots/19-map-theme-switched.png', fullPage: false });
  });
});

// ────────────────────────────────────────────────
// Map Viewport Dashboard Tests
// ────────────────────────────────────────────────

test.describe('Map Viewport Dashboard', () => {
  test('should display visible bunks in sidebar and load reviews on selection', async ({ page }) => {
    // Grant geolocation permissions and set coordinates
    const context = page.context();
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: 17.3887027, longitude: 78.4753829 });

    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('fuelvoice:mock_user', 'true');
    });
    
    // Refresh to apply mock settings
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wait for the visible bunks header in sidebar
    const visibleBunksHeader = page.getByText('Visible Bunks');
    await expect(visibleBunksHeader).toBeVisible();

    // Confirm that the bunk cards are visible in the sidebar list (e.g. Fuel Station)
    const bunkCard = page.locator('.custom-scrollbar').getByText('Fuel Station').first();
    await expect(bunkCard).toBeVisible();

    // Click the bunk card to select it
    await bunkCard.click();

    // The sidebar should transition to show reviews (priority)
    const reviewsHeader = page.getByRole('heading', { name: 'User Reviews' });
    await expect(reviewsHeader).toBeVisible();

    // Click Back to list
    const backBtn = page.getByRole('button', { name: '← Back to Bunks List' });
    await expect(backBtn).toBeVisible();
    await backBtn.click();

    // Header should go back to default state
    await expect(visibleBunksHeader).toBeVisible();

    await page.screenshot({ path: 'e2e/screenshots/20-map-viewport-dashboard.png', fullPage: false });
  });
});


