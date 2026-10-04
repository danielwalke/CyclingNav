import { test, expect } from '@playwright/test';

const ARTIFACT_DIR = 'C:/Users/danie/.gemini/antigravity-cli/brain/a3374bd7-9a30-48e4-947c-c5df968bc1b5';

test.describe('D-Route and Cycling Network Breakdown Verification', () => {
  test('verifies Bremen to Dortmund route network breakdown and D-Route statistics', async ({ page }) => {
    // Navigate to dev server
    await page.goto('http://localhost:5173');

    // Wait for map and initial route to compute
    await expect(page.locator('#bike-map')).toBeVisible();
    await expect(page.locator('text=Routendaten')).toBeVisible({ timeout: 20000 });

    // Verify D-Netz percentage breakdown is rendered in Planner Routendaten card
    const dRouteSection = page.locator('text=Radnetz & D-Routen Anteil');
    await expect(dRouteSection).toBeVisible();

    // Verify D-Netz badge / share
    const dNetzPill = page.locator('text=D-Netz');
    await expect(dNetzPill.first()).toBeVisible();

    // Verify D7 is listed
    const d7Share = page.locator('span:has-text("D7")');
    await expect(d7Share.first()).toBeVisible();

    // Scroll Routendaten card into view so the D-Netz percentage bar is centered
    await dRouteSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // Take screenshot of Planner with D-Route summary
    await page.screenshot({
      path: `${ARTIFACT_DIR}/d_route_network_breakdown_planner.png`,
      fullPage: false
    });

    // Switch to Wege & Untergrund tab
    await page.click('button:has-text("Wege")');

    // Verify Wege tab has loaded the D-Netz section
    await expect(page.locator('text=Radnetz Deutschland & D-Routen')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=D-Netz Anteil')).toBeVisible();

    // Verify D-Route details (e.g. Pilgerroute EV3)
    await expect(page.locator('text=Pilgerroute').first()).toBeVisible();

    // Take screenshot of the Wege tab with full network breakdown
    await page.screenshot({
      path: `${ARTIFACT_DIR}/d_route_network_breakdown_wege.png`,
      fullPage: false
    });

    // Click "🚴 Nach D-Route / Netz" to color map by D-Route
    const dRouteColorBtn = page.locator('button:has-text("Nach D-Route / Netz")');
    await expect(dRouteColorBtn).toBeVisible();
    await dRouteColorBtn.click();
    await expect(dRouteColorBtn).toHaveClass(/bg-indigo-600/);

    // Give Leaflet time to render polylines with new colors
    await page.waitForTimeout(1000);

    // Take screenshot of map with D-Route colored route
    await page.screenshot({
      path: `${ARTIFACT_DIR}/d_route_map_color_mode.png`,
      fullPage: false
    });

    // Scroll down the Wege tab to show all shares (RCN, LCN, Sonstige)
    const otherShare = page.locator('text=Kommunales Radnetz').first();
    if (await otherShare.isVisible()) {
      await otherShare.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      await page.screenshot({
        path: `${ARTIFACT_DIR}/d_route_network_breakdown_wege_scrolled.png`,
        fullPage: false
      });
    }

    // Scroll to Wegearten section showing separate Radweg vs Radfahrstreifen
    const radstreifenCard = page.locator('text=Radfahrstreifen & Schutzstreifen').first();
    if (await radstreifenCard.isVisible()) {
      await radstreifenCard.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      await page.screenshot({
        path: `${ARTIFACT_DIR}/wegearten_radweg_vs_radfahrstreifen.png`,
        fullPage: false
      });
    }
  });
});
