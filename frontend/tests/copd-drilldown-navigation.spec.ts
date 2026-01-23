// Targeting Dashboard Drill-Down Navigation E2E Tests
// Tests click-to-navigate functionality for all COPD components

import { test, expect } from '@playwright/test';

test.describe('COPD Component Drill-Down Navigation', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to targeting cell dashboard
        await page.goto('/smartops/targeting-cell-dashboard');
        // Wait for page to fully load
        // Wait for page to load (avoid networkidle due to polling)
        await page.waitForLoadState('domcontentloaded');
        // Explicitly wait for the gates container or a known element
        await expect(page.locator('button').filter({ hasText: /ROE/i }).first()).toBeVisible({ timeout: 10000 });
    });

    test.describe('DecisionGatesBarCompact Navigation', () => {
        test('clicking ROE gate navigates to ROE manager', async ({ page }) => {
            const roeButton = page.getByRole('button', { name: /ROE/i }).first();
            await expect(roeButton).toBeVisible();

            await roeButton.click();

            // Should navigate to ROE Manager
            await expect(page).toHaveURL(/\/smartops\/roe/);
            await expect(page.getByText(/ROE Manager/i)).toBeVisible();
        });

        test('clicking CDE gate navigates to CDE manager', async ({ page }) => {
            const cdeButton = page.getByRole('button', { name: /CDE/i }).first();
            await expect(cdeButton).toBeVisible();

            await cdeButton.click();

            // Should navigate to CDE Manager
            await expect(page).toHaveURL(/\/smartops\/cde/);
            await expect(page.getByText(/Collateral Damage Estimation/i)).toBeVisible();
        });

        test('clicking Weather gate navigates to weather page', async ({ page }) => {
            const weatherButton = page.getByRole('button', { name: /Weather/i }).first();
            await expect(weatherButton).toBeVisible();

            await weatherButton.click();

            // Should navigate to weather page
            await expect(page).toHaveURL(/\/smartops\/weather/);
        });

        test('clicking Decon gate navigates to collaboration page', async ({ page }) => {
            const deconButton = page.getByRole('button', { name: /Decon/i }).first();
            await expect(deconButton).toBeVisible();

            await deconButton.click();

            // Should navigate to collaboration page
            await expect(page).toHaveURL(/\/smartops\/targeting\/collaboration/);
        });
    });

    test.describe('All Gates Drill-Down - Full Verification', () => {
        test('all 4 decision gates should be clickable and navigate correctly', async ({ page }) => {
            const gatesConfig = [
                { pattern: /ROE/i, expectedUrl: /\/smartops\/roe/ },
                { pattern: /CDE/i, expectedUrl: /\/smartops\/cde/ },
                { pattern: /Weather/i, expectedUrl: /\/smartops\/weather/ },
                { pattern: /Decon/i, expectedUrl: /\/smartops\/targeting\/collaboration/ },
            ];

            for (const gate of gatesConfig) {
                await page.goto('/smartops/targeting-cell-dashboard');
                await page.waitForLoadState('domcontentloaded');
                await expect(page.locator('button').filter({ hasText: /ROE/i }).first()).toBeVisible();

                const button = page.getByRole('button', { name: gate.pattern }).first();
                await expect(button).toBeVisible();
                await expect(button).toBeEnabled();

                await button.click();
                await expect(page).toHaveURL(gate.expectedUrl);
            }
        });
    });

    test.describe('Navigation Round-Trip', () => {
        test('can navigate to ROE and back to dashboard', async ({ page }) => {
            await page.getByRole('button', { name: /ROE/i }).first().click();
            await expect(page).toHaveURL(/\/smartops\/roe/);

            await page.goto('/smartops/targeting-cell-dashboard');
            await expect(page).toHaveURL(/\/smartops\/targeting-cell-dashboard/);
        });
    });
});
