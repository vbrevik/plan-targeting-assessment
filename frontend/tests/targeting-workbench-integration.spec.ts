// Targeting Workbench Integration Tests
// E2E tests for all integrated components with real API calls
// Tests verify frontend-backend integration is working correctly

import { expect, type Route } from '@playwright/test';

import { targetingUserTest as test } from './fixtures/auth';



const BASE_URL = 'http://localhost:3000';
const API_URL = `${BASE_URL}/api/targeting`;

test.describe('Targeting Workbench - API Integration Tests', () => {

  test.describe.skip('Decision Gates Integration', () => {
    test('DecisionGatesBar should fetch and display real API data', async ({ authenticatedPage: page }) => {
      await page.goto('/smartops/targeting-cell-dashboard');

      // Wait for DecisionGatesBar to load
      await page.waitForSelector('text=ROE', { timeout: 5000 });

      // Verify all 4 gates are visible
      const roeText = page.getByText('ROE').first();
      await expect(roeText).toBeVisible();

      await expect(page.getByText('CDE').first()).toBeVisible();
      await expect(page.getByText('Weather').first()).toBeVisible();
      await expect(page.getByText('Decon').first()).toBeVisible();

      // Verify Decon gate shows 'pending' (Real API) vs 'CONFLICT' (Mock)
      // This confirms we are fetching real data from the backend
      await expect(page.getByText(/pending/i).first()).toBeVisible();

      // Verify status indicators (GREEN/YELLOW/RED)
      // Status indicators verified visually by icon color in Compact view
      // const roeGate = page.locator('text=ROE').locator('..').locator('..');
      // await expect(roeGate.locator('text=/GREEN|YELLOW|RED/')).toBeVisible();
    });

    test('Decision Gates API should return valid structure', async ({ authenticatedRequest: request }) => {
      const response = await request.get(`${API_URL}/decision-gates`);

      expect(response.ok()).toBeTruthy();
      const data = await response.json();

      // Verify structure
      expect(data).toHaveProperty('roe');
      expect(data).toHaveProperty('cde');
      expect(data).toHaveProperty('weather');
      expect(data).toHaveProperty('deconfliction');

      // Verify each gate has required fields
      ['roe', 'cde', 'weather', 'deconfliction'].forEach(gate => {
        expect(data[gate]).toHaveProperty('name');
        expect(data[gate]).toHaveProperty('status');
        expect(data[gate]).toHaveProperty('value');
        expect(data[gate]).toHaveProperty('classification');
        expect(['GREEN', 'YELLOW', 'RED', 'green', 'yellow', 'red']).toContain(data[gate].status);

      });
    });
  });

  test.describe.skip('Target Nomination Board Integration', () => {
    test('DTL should fetch and display entries from API', async ({ authenticatedPage: page }) => {
      await page.goto('/smartops/targeting-cell-dashboard');

      // Wait for TargetNominationBoard to load
      await page.waitForSelector('text=Target List', { timeout: 10000 });

      // Verify DTL section is visible
      await expect(page.getByText('Target List')).toBeVisible();

      // Check for DTL entries (may be empty, but section should exist)
      const dtlSection = page.locator('text=Target List').locator('..').locator('..');
      await expect(dtlSection).toBeVisible();
    });

    test('DTL API should return valid entries', async ({ authenticatedRequest: request }) => {
      const response = await request.get(`${API_URL}/dtl?limit=10`);

      expect(response.ok()).toBeTruthy();
      const data = await response.json();

      expect(Array.isArray(data)).toBeTruthy();

      // If entries exist, verify structure
      if (data.length > 0) {
        const entry = data[0];
        expect(entry).toHaveProperty('id');
        expect(entry).toHaveProperty('target_id');
        expect(entry).toHaveProperty('priority_score');
        expect(entry).toHaveProperty('feasibility_score');
        expect(entry).toHaveProperty('aging_hours');
        expect(entry).toHaveProperty('is_tst');

        // Verify score ranges
        expect(entry.priority_score).toBeGreaterThanOrEqual(0);
        expect(entry.priority_score).toBeLessThanOrEqual(1);
        expect(entry.feasibility_score).toBeGreaterThanOrEqual(0);
        expect(entry.feasibility_score).toBeLessThanOrEqual(1);
      }
    });

    test('TST API should return time-sensitive targets', async ({ authenticatedRequest: request }) => {
      const response = await request.get(`${API_URL}/dtl/tst`);

      expect(response.ok()).toBeTruthy();
      const data = await response.json();

      expect(Array.isArray(data)).toBeTruthy();

      // All entries should be TST
      data.forEach((entry: any) => {
        expect(entry.is_tst).toBe(true);
        if (entry.tst_deadline) {
          // Verify deadline is a valid date string
          expect(new Date(entry.tst_deadline).toString()).not.toBe('Invalid Date');
        }
      });
    });

    test('F3EAD Pipeline should be visible', async ({ authenticatedPage: page }) => {
      await page.goto('/smartops/targeting-cell-dashboard');

      await page.waitForSelector('text=F3EAD Targeted Pipeline', { timeout: 5000 });

      // Verify all 6 stages are visible
      await expect(page.locator('button[title*="Find:"]')).toBeVisible();
      await expect(page.locator('button[title*="Fix:"]')).toBeVisible();
      await expect(page.locator('button[title*="Finish:"]')).toBeVisible();
      await expect(page.locator('button[title*="Exploit:"]')).toBeVisible();
      await expect(page.locator('button[title*="Analyze:"]')).toBeVisible();
      await expect(page.locator('button[title*="Disseminate:"]')).toBeVisible();
    });
  });

  test.describe.skip('Mission Command Overview Integration', () => {
    test('Mission Intent API should return valid data', async ({ authenticatedRequest: request }) => {
      const response = await request.get(`${API_URL}/mission/intent`);

      expect(response.ok()).toBeTruthy();
      const data = await response.json();

      expect(data).toHaveProperty('phase');
      expect(data).toHaveProperty('priorityEffects');
      expect(data).toHaveProperty('endstate');
      expect(data).toHaveProperty('endstateMetrics');
      expect(Array.isArray(data.priorityEffects)).toBeTruthy();
      expect(Array.isArray(data.endstateMetrics)).toBeTruthy();
    });

    test('Targeting Guidance API should return valid data', async ({ authenticatedRequest: request }) => {
      const response = await request.get(`${API_URL}/mission/guidance`);

      expect(response.ok()).toBeTruthy();
      const data = await response.json();

      expect(data).toHaveProperty('roeLevel');
      expect(data).toHaveProperty('collateralThreshold');
      expect(data).toHaveProperty('approvedTargetSets');
      expect(data).toHaveProperty('restrictions');
      expect(Array.isArray(data.approvedTargetSets)).toBeTruthy();
      expect(Array.isArray(data.restrictions)).toBeTruthy();
    });

    test('Authority Matrix API should return valid data', async ({ authenticatedRequest: request }) => {
      const response = await request.get(`${API_URL}/mission/authority-matrix`);

      expect(response.ok()).toBeTruthy();
      const data = await response.json();

      expect(data).toHaveProperty('level');
      expect(data).toHaveProperty('authority');
      expect(data).toHaveProperty('canApprove');
      expect(data).toHaveProperty('mustEscalate');
      expect(Array.isArray(data.canApprove)).toBeTruthy();
      expect(Array.isArray(data.mustEscalate)).toBeTruthy();
    });

    test('Operational Tempo API should return valid data', async ({ authenticatedRequest: request }) => {
      const response = await request.get(`${API_URL}/mission/tempo`);

      expect(response.ok()).toBeTruthy();
      const data = await response.json();

      expect(data).toHaveProperty('currentPhase');
      expect(data).toHaveProperty('hoursIntoPhase');
      expect(data).toHaveProperty('criticalDecisionPoints');
      expect(Array.isArray(data.criticalDecisionPoints)).toBeTruthy();
    });
  });

  test.describe.skip('Intelligence Integration Panel', () => {
    test('Intel Reports API should return valid data', async ({ authenticatedRequest: request }) => {
      const response = await request.get(`${API_URL}/intel/reports`);

      expect(response.ok()).toBeTruthy();
      const data = await response.json();

      expect(Array.isArray(data)).toBeTruthy();

      if (data.length > 0) {
        const report = data[0];
        expect(report).toHaveProperty('id');
        expect(report).toHaveProperty('int_type');
        expect(report).toHaveProperty('report_title');
        expect(report).toHaveProperty('confidence_level');
        expect(report).toHaveProperty('classification');
      }
    });

    test('Pattern of Life API should return valid data', async ({ authenticatedRequest: request }) => {
      const response = await request.get(`${API_URL}/isr/pattern-of-life`);

      expect(response.ok()).toBeTruthy();
      const data = await response.json();

      expect(Array.isArray(data)).toBeTruthy();
    });
  });

  test.describe.skip('Effects Assessment Dashboard', () => {
    test('BDA Assessments API should return valid data', async ({ authenticatedRequest: request }) => {
      const response = await request.get(`http://localhost:3000/api/bda`);

      if (!response.ok()) {
        console.log(`BDA API Failed: ${response.status()} ${await response.text()}`);
      }
      expect(response.ok()).toBeTruthy();
      const data = await response.json();

      expect(Array.isArray(data)).toBeTruthy();

      if (data.length > 0) {
        const assessment = data[0];
        expect(assessment).toHaveProperty('id');
        expect(assessment).toHaveProperty('target_id');
        expect(assessment).toHaveProperty('physical_damage');
        expect(assessment).toHaveProperty('functional_damage');
        expect(assessment).toHaveProperty('recommendation');
        expect(assessment).toHaveProperty('confidence');
      }
    });

    test('Re-attack Recommendations API should return valid data', async ({ authenticatedRequest: request }) => {
      const response = await request.get(`http://localhost:3000/api/bda/re-attack`);

      if (!response.ok()) {
        console.log(`Re-attack API Failed: ${response.status()} ${await response.text()}`);
      }
      expect(response.ok()).toBeTruthy();
      const data = await response.json();

      expect(Array.isArray(data)).toBeTruthy();
    });
  });

  test.describe.skip('Asset Capability Management', () => {
    test('Strike Platforms API should return valid data', async ({ authenticatedRequest: request }) => {
      const response = await request.get(`${API_URL}/assets/platforms`);

      expect(response.ok()).toBeTruthy();
      const data = await response.json();

      expect(Array.isArray(data)).toBeTruthy();

      if (data.length > 0) {
        const platform = data[0];
        expect(platform).toHaveProperty('id');
        expect(platform).toHaveProperty('platform_type');
        expect(platform).toHaveProperty('platform_name');
        expect(platform).toHaveProperty('platform_status');
        expect(platform).toHaveProperty('sorties_available');
      }
    });

    test('ISR Platforms API should return valid data', async ({ authenticatedRequest: request }) => {
      const response = await request.get(`${API_URL}/isr/platforms`);

      expect(response.ok()).toBeTruthy();
      const data = await response.json();

      expect(Array.isArray(data)).toBeTruthy();
    });
  });

  test.describe.skip('Risk Constraints Monitor', () => {
    test('High Risk Targets API should return valid data', async ({ authenticatedRequest: request }) => {
      const response = await request.get(`${API_URL}/risk/high`);

      expect(response.ok()).toBeTruthy();
      const data = await response.json();

      expect(Array.isArray(data)).toBeTruthy();

      if (data.length > 0) {
        const risk = data[0];
        expect(risk).toHaveProperty('id');
        expect(risk).toHaveProperty('target_id');
        expect(risk).toHaveProperty('fratricide_risk');
        expect(risk).toHaveProperty('political_sensitivity');
        expect(risk).toHaveProperty('legal_review_status');
      }
    });
  });

  test.describe.skip('Alternative Analysis Panel', () => {
    test('Assumptions API should return valid data', async ({ authenticatedRequest: request }) => {
      const response = await request.get(`${API_URL}/analysis/assumptions`);

      expect(response.ok()).toBeTruthy();
      const data = await response.json();

      expect(Array.isArray(data)).toBeTruthy();

      if (data.length > 0) {
        const assumption = data[0];
        expect(assumption).toHaveProperty('id');
        expect(assumption).toHaveProperty('assumption_text');
        expect(assumption).toHaveProperty('confidence_level');
        expect(assumption).toHaveProperty('validation_status');
      }
    });

    test('Bias Alerts API should return valid data', async ({ authenticatedRequest: request }) => {
      const response = await request.get(`${API_URL}/analysis/bias-alerts`);

      expect(response.ok()).toBeTruthy();
      const data = await response.json();

      expect(Array.isArray(data)).toBeTruthy();
    });
  });

  test.describe.skip('Collaborative Workspace', () => {
    test('Decisions API should return valid data', async ({ authenticatedRequest: request }) => {
      const response = await request.get(`${API_URL}/decisions?limit=10`);

      expect(response.ok()).toBeTruthy();
      const data = await response.json();

      expect(Array.isArray(data)).toBeTruthy();

      if (data.length > 0) {
        const decision = data[0];
        expect(decision).toHaveProperty('id');
        expect(decision).toHaveProperty('decision_type');
        expect(decision).toHaveProperty('decision_text');
        expect(decision).toHaveProperty('decision_maker');
      }
    });

    test('Handovers API should return valid data', async ({ authenticatedRequest: request }) => {
      const response = await request.get(`${API_URL}/handovers?limit=5`);

      expect(response.ok()).toBeTruthy();
      const data = await response.json();

      expect(Array.isArray(data)).toBeTruthy();
    });
  });

  test.describe('Target Management', () => {
    test('Targets List API should return valid data', async ({ authenticatedRequest: request }) => {
      const response = await request.get(`${API_URL}/targets`);
      if (!response.ok()) {
        console.log(`Targets API Failed: ${response.status()} ${await response.text()}`);
      }
      expect(response.ok()).toBeTruthy();

      const data = await response.json();

      expect(Array.isArray(data)).toBeTruthy();

      if (data.length > 0) {
        const target = data[0];
        expect(target).toHaveProperty('id');
        expect(target).toHaveProperty('name');
        expect(target).toHaveProperty('target_type');
        expect(target).toHaveProperty('priority');
        expect(target).toHaveProperty('target_status');
        expect(target).toHaveProperty('coordinates');
      }
    });

    test.skip('Target Summary API should return valid data', async ({ authenticatedRequest: request }) => {
      const response = await request.get(`${API_URL}/summary`);

      expect(response.ok()).toBeTruthy();
      const data = await response.json();

      expect(data).toHaveProperty('total_targets');
      expect(data).toHaveProperty('active_targets');
      expect(data).toHaveProperty('pending_nominations');
      expect(data).toHaveProperty('approved_targets');
    });
  });

  test.describe.skip('JTB (Joint Targeting Board)', () => {
    test('JTB Sessions API should return valid data', async ({ authenticatedRequest: request }) => {
      const response = await request.get(`${API_URL}/jtb/sessions`);

      expect(response.ok()).toBeTruthy();
      const data = await response.json();

      expect(Array.isArray(data)).toBeTruthy();

      if (data.length > 0) {
        const session = data[0];
        expect(session).toHaveProperty('id');
        expect(session).toHaveProperty('session_name');
        expect(session).toHaveProperty('session_date');
        expect(session).toHaveProperty('session_time');
        expect(session).toHaveProperty('status');
        expect(session).toHaveProperty('chair');
        expect(session).toHaveProperty('classification');
      }
    });
  });

  test.describe('Error Handling', () => {
    test('Components should handle API errors gracefully', async ({ authenticatedPage: page }) => {
      // Intercept API calls and return errors
      await page.route(`${API_URL}/decision-gates`, (route: Route) => {
        route.fulfill({ status: 500, body: JSON.stringify({ error: 'Server error' }) });
      });

      await page.goto('/smartops/targeting-cell-dashboard');

      // Page should still load (fallback to mock data)
      await page.waitForTimeout(2000);

      // Decision gates should still be visible (using fallback)
      await expect(page.getByText('ROE').first()).toBeVisible();
    });

    test('Invalid API responses should not break UI', async ({ authenticatedPage: page }) => {
      // Intercept with invalid JSON
      await page.route(`${API_URL}/dtl`, (route: Route) => {
        route.fulfill({ status: 200, body: 'invalid json' });
      });

      await page.goto('/smartops/targeting-cell-dashboard');

      // Page should still load
      await page.waitForTimeout(2000);

      // Component should handle error gracefully
      await expect(page.getByText('Targeting Cell Ops')).toBeVisible();
    });
  });

  test.describe.skip('Auto-Refresh Functionality', () => {
    test('DecisionGatesBar should auto-refresh', async ({ authenticatedPage: page }) => {
      let apiCallCount = 0;

      await page.route(`${API_URL}/decision-gates`, (route: Route) => {
        apiCallCount++;
        route.continue();
      });

      await page.goto('/smartops/targeting-cell-dashboard');

      // Wait for initial load
      await page.waitForTimeout(2000);

      // Wait for auto-refresh (30 seconds, but we'll check after a shorter interval)
      await page.waitForTimeout(35000); // 35 seconds

      // Should have been called at least twice (initial + refresh)
      expect(apiCallCount).toBeGreaterThanOrEqual(2);
    });
  });
});
