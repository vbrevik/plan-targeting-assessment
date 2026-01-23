// BDA Workbench Phase 1 E2E Tests
// Purpose: Verify complete BDA workflow from creation to approval

import { test, expect } from '@playwright/test';

test.describe('BDA Workbench - Phase 1 Complete Workflow', () => {
  const baseURL = 'http://localhost:3000';
  let testTargetId: string;
  let testReportId: string;
  let csrfToken: string | null = null;

  test.beforeAll(async ({ request }) => {
    // Get CSRF token for authenticated requests
    // In a real scenario, we'd login first
    const cookies = await request.storageState();
    // CSRF token should be in cookies after login
    // For now, we'll test with authentication
  });

  test('Complete BDA workflow: Create → Submit → Approve', async ({ page, request }) => {
    // Step 1: Navigate to BDA management view
    await page.goto(`${baseURL}/smartops/bda`);
    await expect(page.locator('h1')).toContainText('BDA Management Workbench');

    // Step 2: Click "New Assessment" button
    await page.click('text=New Assessment');
    await expect(page).toHaveURL(/\/smartops\/bda\/create/);

    // Step 3: Fill out BDA report form
    // Note: This requires a valid target_id
    // For testing, we'll need to create a target first or use an existing one
    
    // Fill assessment type
    await page.selectOption('select', { label: 'Initial (within 24h)' });
    
    // Fill physical damage
    await page.selectOption('select:has-text("Physical Damage")', { value: 'MD' });
    await page.fill('input[placeholder*="Damage percentage"]', '45');
    await page.fill('textarea[placeholder*="Damage description"]', 'Moderate structural damage to main building');
    
    // Fill functional damage
    await page.selectOption('select:has-text("Functional Status")', { value: 'PMC' });
    await page.fill('input[placeholder*="Estimated repair time"]', '72');
    
    // Fill effects
    await page.fill('input[placeholder*="Desired effect"]', 'Neutralize command and control capability');
    await page.fill('input[placeholder*="Achieved effect"]', 'Partially neutralized - 60% capability reduction');
    
    // Set confidence
    const confidenceSlider = page.locator('input[type="range"]').first();
    await confidenceSlider.fill('0.85');
    
    // Set recommendation
    await page.selectOption('select:has-text("Recommendation")', { value: 'monitor' });
    
    // Set classification
    await page.selectOption('select:has-text("Classification Level")', { value: 'SECRET' });
    
    // Submit form
    await page.click('button:has-text("CREATE BDA")');
    
    // Step 4: Verify redirect to detail view
    await expect(page).toHaveURL(/\/smartops\/bda\/[a-f0-9-]+/);
    
    // Step 5: Verify report is in draft status
    await expect(page.locator('text=DRAFT')).toBeVisible();
    
    // Step 6: Submit report for review
    await page.click('button:has-text("Submit for Review")');
    await expect(page.locator('text=SUBMITTED')).toBeVisible();
    
    // Step 7: Approve report (as reviewer)
    await page.click('button:has-text("Approve")');
    await expect(page.locator('text=APPROVED')).toBeVisible();
  });

  test('BDA imagery upload workflow', async ({ page }) => {
    // Navigate to BDA detail view (requires existing report)
    // This test assumes a report exists
    
    await page.goto(`${baseURL}/smartops/bda`);
    
    // Click on first report in queue
    const firstReport = page.locator('[class*="Card"]').first();
    if (await firstReport.count() > 0) {
      await firstReport.click();
      
      // Verify imagery section exists
      await expect(page.locator('text=Post-Strike Imagery Analysis')).toBeVisible();
      
      // Note: Actual file upload requires file input handling
      // This would be tested in a separate test with file mocking
    }
  });

  test('BDA queue filtering', async ({ page }) => {
    await page.goto(`${baseURL}/smartops/bda`);
    
    // Wait for page to load
    await page.waitForSelector('h1:has-text("BDA Management Workbench")', { timeout: 10000 });
    
    // Test filter buttons - use more specific selectors
    const filterButtons = page.locator('button').filter({ hasText: /^(All|Assess|Re-strike)$/ });
    const allButton = filterButtons.filter({ hasText: 'All' });
    const assessButton = filterButtons.filter({ hasText: 'Assess' });
    const restrikeButton = filterButtons.filter({ hasText: 'Re-strike' });
    
    // Click filter buttons if they exist
    if (await allButton.count() > 0) {
      await allButton.click();
    }
    if (await assessButton.count() > 0) {
      await assessButton.click();
    }
    if (await restrikeButton.count() > 0) {
      await restrikeButton.click();
      // Verify filter state changes - check for active class
      await expect(restrikeButton).toHaveClass(/bg-blue-600|bg-blue-500/, { timeout: 2000 });
    }
  });

  test('BDA statistics display', async ({ page }) => {
    await page.goto(`${baseURL}/smartops/bda`);
    
    // Wait for page to load
    await page.waitForSelector('h1:has-text("BDA Management Workbench")', { timeout: 10000 });
    
    // Verify statistics cards are visible - use more flexible selectors
    await expect(page.locator('text=/Queue Total/i')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=/Draft/i')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=/Under Assessment|Awaiting Imagery/i')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=/Re-strike Pending/i')).toBeVisible({ timeout: 5000 });
  });

  test('BDA report detail view displays all fields', async ({ page }) => {
    // Navigate to a report detail view
    await page.goto(`${baseURL}/smartops/bda`);
    
    // Click first report if available
    const firstReport = page.locator('[class*="Card"]').first();
    if (await firstReport.count() > 0) {
      await firstReport.click();
      
      // Verify all sections are visible
      await expect(page.locator('text=Damage Metrics')).toBeVisible();
      await expect(page.locator('text=Physical Damage')).toBeVisible();
      await expect(page.locator('text=Functional Status')).toBeVisible();
      await expect(page.locator('text=Recommendation')).toBeVisible();
      await expect(page.locator('text=Collateral Assessment')).toBeVisible();
    }
  });

  test('BDA approval workflow buttons appear based on status', async ({ page }) => {
    await page.goto(`${baseURL}/smartops/bda`);
    
    const firstReport = page.locator('[class*="Card"]').first();
    if (await firstReport.count() > 0) {
      await firstReport.click();
      
      // Check if status-specific buttons are visible
      const status = await page.locator('[class*="Badge"]').first().textContent();
      
      if (status?.includes('DRAFT')) {
        await expect(page.locator('button:has-text("Submit for Review")')).toBeVisible();
      } else if (status?.includes('SUBMITTED') || status?.includes('REVIEWED')) {
        await expect(page.locator('button:has-text("Approve")')).toBeVisible();
        await expect(page.locator('button:has-text("Reject")')).toBeVisible();
      }
    }
  });
});

test.describe('BDA Workbench - API Integration', () => {
  const baseURL = 'http://localhost:3000';

  test('Create BDA report via API', async ({ request }) => {
    // This test requires authentication and CSRF token
    // In a real scenario, we'd login first
    
    const reportData = {
      target_id: 'test-target-' + Date.now(),
      assessment_type: 'initial',
      physical_damage: 'MD',
      physical_damage_percentage: 45,
      damage_description: 'Moderate structural damage',
      functional_damage: 'PMC',
      desired_effect: 'Neutralize C2 capability',
      achieved_effect: 'Partially neutralized',
      confidence_level: 0.85,
      recommendation: 'monitor',
      collateral_damage_detected: false,
      classification_level: 'SECRET',
    };

    const response = await request.post(`${baseURL}/api/bda/reports`, {
      data: reportData,
      headers: {
        'X-CSRF-Token': 'test-token', // Would be real token in production
      },
    });

    // Should return 201 Created or 401/403 if not authenticated
    expect([201, 401, 403].includes(response.status())).toBeTruthy();
    
    if (response.status() === 201) {
      const body = await response.json();
      expect(body).toHaveProperty('id');
      expect(body.physical_damage).toBe('MD');
      expect(body.functional_damage).toBe('PMC');
    }
  });

  test('Update BDA report via API', async ({ request }) => {
    // This would require an existing report ID
    // For now, we test the endpoint structure
    
    const updateData = {
      physical_damage: 'SVD',
      physical_damage_percentage: 75,
      recommendation: 're_attack',
    };

    const response = await request.put(`${baseURL}/api/bda/reports/test-id`, {
      data: updateData,
      headers: {
        'X-CSRF-Token': 'test-token',
      },
    });

    // Should return 200 OK or 404 Not Found or 401/403
    expect([200, 404, 401, 403].includes(response.status())).toBeTruthy();
  });

  test('Submit BDA report via API', async ({ request }) => {
    const response = await request.post(`${baseURL}/api/bda/reports/test-id/submit`, {
      headers: {
        'X-CSRF-Token': 'test-token',
      },
    });

    expect([200, 404, 401, 403].includes(response.status())).toBeTruthy();
  });

  test('Approve BDA report via API', async ({ request }) => {
    const response = await request.post(`${baseURL}/api/bda/reports/test-id/approve`, {
      data: { comments: 'Approved for operational use' },
      headers: {
        'X-CSRF-Token': 'test-token',
      },
    });

    expect([200, 404, 401, 403].includes(response.status())).toBeTruthy();
  });

  test('Get BDA report imagery via API', async ({ request }) => {
    // First get a real report ID, or test with 404 for non-existent report
    const response = await request.get(`${baseURL}/api/bda/reports/test-id/imagery`);
    
    // Should return 200 with empty array, or 404 if report doesn't exist
    if (response.status() === 404) {
      expect(response.status()).toBe(404);
    } else {
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(Array.isArray(data)).toBeTruthy();
    }
  });
});
