import { test, expect } from '@playwright/test';

test.describe('Bike Tour Germany App - End to End', () => {
  test('loads bike app, computes initial route along Elberadweg, and shows cycling metrics', async ({ page }) => {
    await page.goto('/');

    // Verify title and header
    await expect(page).toHaveTitle(/RadTour Deutschland/);
    await expect(page.locator('h1')).toContainText('RadTour Germany');

    // Verify Leaflet Map loaded
    const map = page.locator('#bike-map');
    await expect(map).toBeVisible();
    await expect(page.locator('.leaflet-container')).toBeVisible();

    // Verify initial route calculation completes with metrics
    const routeCard = page.locator('text=Routendaten');
    await expect(routeCard).toBeVisible({ timeout: 15000 });

    // Verify Cycling ways ratio badge is shown
    await expect(page.locator('text=Radwege / ruhig')).toBeVisible();

    // Verify elevation profile is displayed
    await expect(page.locator('text=Höhenprofil')).toBeVisible();
  });

  test('switches routing profiles and updates route', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Routendaten')).toBeVisible({ timeout: 15000 });

    // Switch to Radfernwege profile
    const radfernwegeBtn = page.locator('button:has-text("Radfernwege")');
    await radfernwegeBtn.click();
    await expect(radfernwegeBtn).toHaveClass(/border-emerald-500/);

    // Switch to Gravel profile
    const gravelBtn = page.locator('button:has-text("Gravel & Wald")');
    await gravelBtn.click();
    await expect(gravelBtn).toHaveClass(/border-emerald-500/);
  });

  test('loads curated German preset tour (Berliner Mauerradweg)', async ({ page }) => {
    await page.goto('/');

    // Switch to Touren tab
    await page.click('button:has-text("Touren")');

    // Find Berliner Mauerradweg and click "Tour in Planer laden"
    const berlinTourHeading = page.locator('h3:has-text("Berliner Mauerradweg")');
    await expect(berlinTourHeading).toBeVisible();

    const loadBtn = page.getByRole('button', { name: 'Tour in Planer laden' }).nth(1);
    await loadBtn.click();

    // Automatically switched back to Planer tab and loaded Berlin waypoints
    await expect(page.locator('input[value*="Brandenburger Tor"]')).toBeVisible({ timeout: 15000 });
  });

  test('runs live turn-by-turn navigation HUD and simulation', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Routendaten')).toBeVisible({ timeout: 15000 });

    // Start navigation
    const startNavBtn = page.getByRole('button', { name: 'Navigation & Tour starten' });
    await startNavBtn.click();

    // Verify Navigation HUD appears
    await expect(page.locator('text=GPS-Simulation Aktiv')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Tempo')).toBeVisible();
    await expect(page.locator('text=Rest')).toBeVisible();
    await expect(page.getByText('ETA', { exact: true })).toBeVisible();


    // Test simulation speed multiplier
    const speed5xBtn = page.locator('button:has-text("5x")');
    await speed5xBtn.click();
    await expect(speed5xBtn).toHaveClass(/bg-emerald-600/);

    // Test pausing simulation
    const pauseBtn = page.locator('button:has-text("Pause")');
    await pauseBtn.click();
    await expect(page.getByRole('button', { name: 'Start', exact: true })).toBeVisible();


    // Close navigation
    const closeBtn = page.locator('button[title="Navigation beenden"]');
    await closeBtn.click();
    await expect(page.locator('text=GPS-Simulation Aktiv')).not.toBeVisible();
  });

  test('switches map layers and POI overlays', async ({ page }) => {
    await page.goto('/');

    // Switch to Karten tab
    await page.click('button:has-text("Karten")');
    await expect(page.locator('text=Basiskarte')).toBeVisible();

    // Switch to OSM Standard
    const osmBtn = page.locator('button:has-text("OpenStreetMap Standard")');
    await osmBtn.click();
    await expect(osmBtn).toHaveClass(/border-emerald-500/);

    // Toggle POI buttons
    const toolBtn = page.locator('button[title*="Fahrrad-Reparaturstationen"]');
    await toolBtn.click();
    const waterBtn = page.locator('button[title*="Trinkwasserbrunnen"]');
    await waterBtn.click();
  });

  test('inspects underground composition, Bundesstraße detection, and way types breakdown', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Routendaten')).toBeVisible({ timeout: 15000 });

    // Click on the quick banner or the "Wege" tab
    await page.click('button:has-text("Wege- & Oberflächen-Details")');

    // Verify Underground & Way type breakdown is visible
    await expect(page.locator('text=Wegearten & Straßenklassen')).toBeVisible();
    await expect(page.locator('text=Bundesstraße (B-Straße)')).toBeVisible();
    await expect(page.locator('text=Radweg & Radfahrstreifen')).toBeVisible();

    // Verify Surface / Underground breakdown is visible
    await expect(page.locator('text=Untergrund & Oberflächenbelag')).toBeVisible();
    await expect(page.locator('text=Asphalt & Beton')).toBeVisible();

    // Verify "Wo verläuft was?" chronological segments
    await expect(page.locator('text=Wo verläuft was?')).toBeVisible();
    const firstSeg = page.locator('div:has-text("km 0")').first();
    await expect(firstSeg).toBeVisible();

    // Hover or click first segment to highlight on map
    await firstSeg.click();

    // Test route coloring mode buttons
    const byWayTypeBtn = page.locator('button:has-text("Nach Wegeart")');
    await byWayTypeBtn.click();
    await expect(byWayTypeBtn).toHaveClass(/bg-emerald-600/);

    const bySurfaceBtn = page.locator('button:has-text("Nach Belag")');
    await bySurfaceBtn.click();
    await expect(bySurfaceBtn).toHaveClass(/bg-emerald-600/);
  });

  test('verifies offline map caching UI and pre-caching button', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Routendaten')).toBeVisible({ timeout: 15000 });

    // Open Karten tab
    await page.click('button:has-text("Karten")');

    // Verify Offline-Karten & Cache section
    await expect(page.locator('text=Offline-Karten & Cache')).toBeVisible();
    await expect(page.locator('text=Kartenkacheln')).toBeVisible();
    await expect(page.locator('text=Routen & POIs')).toBeVisible();

    // Verify Pre-cache button is available for active route
    const precacheBtn = page.locator('button:has-text("Offline-Karten für diese Tour laden")');
    await expect(precacheBtn).toBeVisible();

    // Verify Clear Cache button exists
    const clearBtn = page.locator('button:has-text("Leeren")');
    await expect(clearBtn).toBeVisible();
  });
});

