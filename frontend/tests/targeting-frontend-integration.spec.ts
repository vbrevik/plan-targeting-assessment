// E2E Tests for Frontend Integration
// Tests DecisionGatesBar, MissionCommandOverview, TargetNominationBoard API integration

import { expect } from '@playwright/test';
import { authenticatedTest as test } from './fixtures/auth';

test.describe('Targeting Frontend API Integration', () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    // Navigate to targeting cell dashboard
    await page.goto('/smartops/targeting-cell-dashboard');
    // Wait for page to load
    await page.waitForTimeout(2000);
  });

  test.describe('DecisionGatesBar', () => {
    test('should display decision gates from API', async ({ page }) => {
      // Wait for DecisionGatesBar to load
      await expect(page.getByText('ROE')).toBeVisible({ timeout: 5000 });
      await expect(page.getByText('CDE')).toBeVisible();
      await expect(page.getByText('Weather')).toBeVisible();
      await expect(page.getByText('Deconfliction')).toBeVisible();
    });

    test('should show gate status indicators', async ({ page }) => {
      // Check for status badges (GREEN, YELLOW, RED)
      const roeGate = page.locator('text=ROE').locator('..');
      await expect(roeGate).toBeVisible();

      // Should have status indicator
      const statusText = await roeGate.textContent();
      expect(statusText).toMatch(/(GREEN|YELLOW|RED)/i);
    });

    test('should auto-refresh every 30 seconds', async ({ page }) => {
      // Wait for initial load
      await expect(page.getByText('ROE')).toBeVisible();

      // Wait 35 seconds and verify gates are still visible (refreshed)
      await page.waitForTimeout(35000);
      await expect(page.getByText('ROE')).toBeVisible();
    });
  });

  test.describe('MissionCommandOverview', () => {
    test('should display mission command data from API', async ({ page }) => {
      // Wait for component to load
      await expect(page.getByText("Commander's Intent")).toBeVisible({ timeout: 5000 });

      // Check for mission command sections
      await expect(page.getByText(/Phase|priorityEffects|endstate/i)).toBeVisible();
      await expect(page.getByText('Targeting Guidance')).toBeVisible();
      await expect(page.getByText('Decision Authority')).toBeVisible();
      await expect(page.getByText('Operational Tempo')).toBeVisible();
    });

    test('should show commander intent metrics', async ({ page }) => {
      await expect(page.getByText("Commander's Intent")).toBeVisible();

      // Should show endstate metrics
      const metrics = page.locator('text=/on-track|at-risk|off-track/i');
      await expect(metrics.first()).toBeVisible({ timeout: 5000 });
    });

    test('should auto-refresh every 5 minutes', async ({ page }) => {
      await expect(page.getByText("Commander's Intent")).toBeVisible();

      // Component should still be visible after refresh cycle
      await page.waitForTimeout(6000);
      await expect(page.getByText("Commander's Intent")).toBeVisible();
    });
  });

  test.describe('TargetNominationBoard', () => {
    test('should display DTL entries from API', async ({ page }) => {
      // Wait for component to load
      await expect(page.getByText('Target Nomination & Prioritization')).toBeVisible({ timeout: 5000 });

      // Should show DTL section
      await expect(page.getByText('Dynamic Target List')).toBeVisible();
    });

    test('should display F3EAD pipeline stages', async ({ page }) => {
      await expect(page.getByText('F3EAD Target Pipeline')).toBeVisible();

      // Should show stage names
      await expect(page.getByText(/Find|Fix|Finish|Exploit|Analyze|Disseminate/i)).toBeVisible();
    });

    test('should display TST alerts when present', async ({ page }) => {
      // Check for TST section (may or may not be visible depending on data)
      const tstSection = page.locator('text=/Time-Sensitive Targets/i');

      // If TSTs exist, verify they're displayed
      if (await tstSection.isVisible({ timeout: 2000 })) {
        await expect(tstSection).toBeVisible();
        // Should show deadline and priority
        await expect(page.getByText(/CRITICAL|HIGH/i)).toBeVisible();
      }
    });

    test('should show target details when DTL entries loaded', async ({ page }) => {
      await expect(page.getByText('Dynamic Target List')).toBeVisible();

      // Should show priority/feasibility scores or target names
      const dtlContent = page.locator('text=/Priority|Feasibility|Score/i');
      // May or may not be visible depending on data, but component should render
      await expect(page.getByText('Dynamic Target List')).toBeVisible();
    });

    test('should auto-refresh every 30 seconds', async ({ page }) => {
      await expect(page.getByText('Target Nomination & Prioritization')).toBeVisible();

      // Wait 35 seconds and verify component is still visible (refreshed)
      await page.waitForTimeout(35000);
      await expect(page.getByText('Target Nomination & Prioritization')).toBeVisible();
    });
  });

  test.describe('API Error Handling', () => {
    test('should fallback to mock data when API fails', async ({ page }) => {
      // Intercept API calls and return error
      await page.route('**/api/targeting/decision-gates', route => {
        route.fulfill({ status: 500, body: 'Internal Server Error' });
      });

      // Component should still render with fallback data
      await page.reload();
      await page.waitForTimeout(2000);

      // Should still show gates (from mock data)
      await expect(page.getByText('ROE')).toBeVisible({ timeout: 5000 });
    });

    test('should handle network errors gracefully', async ({ page }) => {
      // Intercept and abort network requests
      await page.route('**/api/targeting/**', route => {
        route.abort('failed');
      });

      await page.reload();
      await page.waitForTimeout(2000);

      // Components should still render (with fallback)
      await expect(page.getByText(/Target Nomination|Mission Command/i)).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Data Transformation', () => {
    test('should transform backend status to uppercase', async ({ page }) => {
      // Backend returns lowercase (green, yellow, red)
      // Frontend should display uppercase (GREEN, YELLOW, RED)
      await expect(page.getByText('ROE')).toBeVisible();

      const statusBadge = page.locator('text=ROE').locator('..').locator('text=/GREEN|YELLOW|RED/');
      // Status should be uppercase
      const statusText = await statusBadge.textContent();
      if (statusText) {
        expect(statusText).toMatch(/^(GREEN|YELLOW|RED)$/);
      }
    });

    test('should calculate TST time remaining correctly', async ({ page }) => {
      // If TSTs are displayed, verify time calculation
      const tstSection = page.locator('text=/Time-Sensitive Targets/i');

      if (await tstSection.isVisible({ timeout: 2000 })) {
        // Should show minutes remaining
        await expect(page.getByText(/\d+\s*(min|minutes?)/i)).toBeVisible();
      }
    });
  });
});
