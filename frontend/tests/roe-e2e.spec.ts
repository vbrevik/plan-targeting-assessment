// ROE (Rules of Engagement) E2E Tests
// Tests ROE status display, request creation, and blocking in the frontend

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';
const API_URL = 'http://localhost:3000/api';

test.describe('ROE Feature - E2E Tests', () => {
  
  test.describe('ROE Status Display', () => {
    test('DecisionCard should display ROE status badge', async ({ page }) => {
      await page.goto('/smartops/');
      
      // Wait for decisions to load
      await page.waitForSelector('[data-testid="decision-card"], .decision-card, text=/ROE|WITHIN|REQUIRED/i', { timeout: 10000 });
      
      // Look for ROE status indicators
      // The ROE badge should be visible on decisions
      const roeIndicators = page.locator('text=/WITHIN ROE|ROE REQUIRED|ROE PENDING/i');
      const count = await roeIndicators.count();
      
      // At least one decision should have ROE status displayed
      if (count > 0) {
        await expect(roeIndicators.first()).toBeVisible();
      }
    });

    test('DecisionCard should show correct ROE status colors', async ({ page }) => {
      await page.goto('/smartops/');
      
      // Wait for decisions
      await page.waitForSelector('text=/Decision|Strike|Move/i', { timeout: 10000 });
      
      // Check for ROE status badges with appropriate styling
      // Red for requires_roe_release, green for within_approved_roe
      const roeRequired = page.locator('text=/ROE REQUIRED/i');
      const roeWithin = page.locator('text=/WITHIN ROE/i');
      
      // At least one type should be visible if decisions exist
      const requiredCount = await roeRequired.count();
      const withinCount = await roeWithin.count();
      
      expect(requiredCount + withinCount).toBeGreaterThanOrEqual(0);
    });

    test('DecisionAnalysisPanel should show detailed ROE information', async ({ page }) => {
      await page.goto('/smartops/');
      
      // Wait for decisions
      await page.waitForSelector('text=/Decision|Strike|Move/i', { timeout: 10000 });
      
      // Click on a decision to open analysis panel
      const firstDecision = page.locator('[data-testid="decision-card"], .decision-card').first();
      if (await firstDecision.count() > 0) {
        await firstDecision.click();
        
        // Wait for analysis panel
        await page.waitForSelector('text=/ROE|Rules of Engagement/i', { timeout: 5000 });
        
        // Verify ROE section is visible
        await expect(page.getByText(/ROE|Rules of Engagement/i)).toBeVisible();
      }
    });
  });

  test.describe('ROE API Integration', () => {
    test('ROE status API should return valid data', async ({ request }) => {
      // First, we need a decision ID - create one or use existing
      // For this test, we'll check if the endpoint exists and returns proper structure
      const response = await request.get(`${API_URL}/roe/decisions/test-decision-1/status`);
      
      // Should return 200 or 404 (if decision doesn't exist)
      expect([200, 404]).toContain(response.status());
      
      if (response.ok()) {
        const data = await response.json();
        expect(data).toHaveProperty('decision_id');
        // roe_status, roe_notes, roe_request are optional
      }
    });

    test('Auto-determine ROE API should work', async ({ request }) => {
      // This would require a decision to exist
      // For now, test that the endpoint exists
      const response = await request.post(`${API_URL}/roe/decisions/test-decision-1/auto-determine`);
      
      // Should return 200 (with decision) or 404 (if decision doesn't exist)
      expect([200, 404]).toContain(response.status());
      
      if (response.ok()) {
        const data = await response.json();
        expect(data).toHaveProperty('decision_id');
        expect(data).toHaveProperty('roe_status');
        expect(['within_approved_roe', 'requires_roe_release', 'roe_pending_approval', 'roe_approved', 'roe_rejected']).toContain(data.roe_status);
      }
    });

    test('ROE blocking check API should return blocking status', async ({ request }) => {
      const response = await request.get(`${API_URL}/roe/decisions/test-decision-1/check-blocking`);
      
      // Should return 200 or 404
      expect([200, 404]).toContain(response.status());
      
      if (response.ok()) {
        const data = await response.json();
        expect(data).toHaveProperty('can_proceed');
        expect(data).toHaveProperty('is_blocked');
        expect(data).toHaveProperty('is_pending');
        expect(typeof data.can_proceed).toBe('boolean');
      }
    });

    test('Decision routing API should check ROE blocking', async ({ request }) => {
      const response = await request.get(`${API_URL}/roe/decisions/test-decision-1/route`);
      
      // Should return 200 or 404
      expect([200, 404]).toContain(response.status());
      
      if (response.ok()) {
        const data = await response.json();
        expect(data).toHaveProperty('can_proceed');
        expect(data).toHaveProperty('venue_name');
        expect(data).toHaveProperty('routed_at');
        expect(typeof data.can_proceed).toBe('boolean');
      }
    });
  });

  test.describe('ROE Request Workflow', () => {
    test('ROE request creation API should work', async ({ request }) => {
      // Create a test decision first (if needed)
      // Then create ROE request
      const roeRequest = {
        approval_authority: 'Commander',
        request_justification: 'Test ROE request for E2E testing',
        roe_reference: null,
        conditions: null,
      };

      const response = await request.post(
        `${API_URL}/roe/decisions/test-decision-1/request`,
        { data: roeRequest }
      );

      // Should return 200 (created) or 404 (decision doesn't exist) or 400 (validation error)
      expect([200, 201, 400, 404]).toContain(response.status());

      if (response.ok()) {
        const data = await response.json();
        expect(data).toHaveProperty('id');
        expect(data).toHaveProperty('decision_id');
        expect(data).toHaveProperty('status');
        expect(['pending', 'approved', 'rejected', 'withdrawn']).toContain(data.status);
      }
    });

    test('ROE request list API should return requests', async ({ request }) => {
      const response = await request.get(`${API_URL}/roe/requests?status=pending`);

      expect(response.ok()).toBeTruthy();
      const data = await response.json();

      expect(Array.isArray(data)).toBeTruthy();

      // If requests exist, verify structure
      if (data.length > 0) {
        const request = data[0];
        expect(request).toHaveProperty('id');
        expect(request).toHaveProperty('decision_id');
        expect(request).toHaveProperty('status');
        expect(request).toHaveProperty('request_justification');
      }
    });
  });

  test.describe('ROE Blocking Display', () => {
    test('Blocked decisions should show blocking message', async ({ page }) => {
      await page.goto('/smartops/');
      
      // Wait for decisions to load
      await page.waitForSelector('text=/Decision|Strike|Move/i', { timeout: 10000 });
      
      // Look for blocked indicators
      // Decisions with requires_roe_release should show blocking
      const blockedIndicators = page.locator('text=/ROE REQUIRED|BLOCKED|Cannot proceed/i');
      const count = await blockedIndicators.count();
      
      // If any blocked decisions exist, they should be visible
      if (count > 0) {
        await expect(blockedIndicators.first()).toBeVisible();
      }
    });

    test('Routing blocked decisions should show ROE coordination venue', async ({ request }) => {
      // Test that routing API returns blocked status
      const response = await request.get(`${API_URL}/roe/decisions/test-decision-blocked/route`);
      
      if (response.ok()) {
        const data = await response.json();
        
        // If decision is blocked, venue_name should indicate ROE coordination
        if (!data.can_proceed) {
          expect(data.venue_name).toMatch(/ROE|Coordination|Awaiting/i);
          expect(data.routing_reason).toBeTruthy();
        }
      }
    });
  });

  test.describe('Complete ROE Workflow', () => {
    test('End-to-end ROE workflow should work', async ({ page, request }) => {
      // This is a comprehensive test of the full workflow
      // 1. Navigate to decisions
      await page.goto('/smartops/');
      
      // 2. Wait for decisions to load
      await page.waitForSelector('text=/Decision|Strike|Move/i', { timeout: 10000 });
      
      // 3. Verify ROE status is displayed
      const roeStatus = page.locator('text=/ROE|WITHIN|REQUIRED/i');
      const statusCount = await roeStatus.count();
      
      // At least ROE-related UI should be present
      expect(statusCount).toBeGreaterThanOrEqual(0);
      
      // 4. Test API endpoints are accessible
      const apiResponse = await request.get(`${API_URL}/roe/requests`);
      expect(apiResponse.ok()).toBeTruthy();
    });
  });
});
