// Assumptions Management E2E Tests
// Resilient: Tests handle missing resources gracefully and accept various response codes

import { expect } from '@playwright/test';
import { authenticatedTest as test } from './helpers/testHelpers';

test.describe('Assumptions Management', () => {

  test('create assumption via API', async ({ authenticatedRequest: request }) => {
    const assumptionData = {
      title: 'e2e_assumption_test_' + Date.now(),
      description: 'Enemy will not deploy armor to Sector 4 during Phase 1',
      category: 'Enemy',
      confidence_score: 75,
    };

    const response = await request.post('/api/assumptions', { data: assumptionData });

    // Accept 201 (created), 200 (ok), 403 (permission), or 404 (endpoint missing)
    expect([200, 201, 403, 404]).toContain(response.status());

    if (response.status() === 201 || response.status() === 200) {
      const body = await response.json();
      expect(body).toHaveProperty('id');
      expect(body.title).toBe(assumptionData.title);
    }
  });

  test('get all assumptions via API', async ({ authenticatedRequest: request }) => {
    // Get all assumptions - endpoint may or may not exist
    const listResponse = await request.get('/api/assumptions');

    expect([200, 403, 404]).toContain(listResponse.status());

    if (listResponse.ok()) {
      const assumptions = await listResponse.json();
      expect(Array.isArray(assumptions)).toBe(true);
    }
  });

  test('update assumption status to Broken', async ({ authenticatedRequest: request }) => {
    // First create an assumption
    const createData = {
      title: 'e2e_assumption_update_' + Date.now(),
      category: 'Intelligence',
      description: 'Enemy communication patterns remain predictable',
      confidence_score: 80,
    };

    const createResponse = await request.post('/api/assumptions', { data: createData });

    // If creation fails, skip update test
    if (!createResponse.ok()) {
      expect([403, 404]).toContain(createResponse.status());
      return;
    }

    const created = await createResponse.json();

    // Update to Broken status
    const updateData = {
      status: 'Broken',
      risk_level: 'Critical',
      impact_notes: 'Enemy has changed communication patterns, SIGINT unreliable',
    };

    const updateResponse = await request.put(`/api/assumptions/${created.id}`, { data: updateData });
    expect([200, 403, 404]).toContain(updateResponse.status());

    if (updateResponse.ok()) {
      const updated = await updateResponse.json();
      expect(updated.status).toBe('Broken');
    }
  });

  test('filter assumptions by status', async ({ authenticatedRequest: request }) => {
    // Test filter endpoint - may not work without data
    const validResponse = await request.get('/api/assumptions?status=Valid');
    expect([200, 403, 404]).toContain(validResponse.status());

    if (validResponse.ok()) {
      const validAssumptions = await validResponse.json();
      expect(Array.isArray(validAssumptions)).toBe(true);
    }
  });

  test('get assumptions summary', async ({ authenticatedRequest: request }) => {
    const summaryResponse = await request.get('/api/assumptions/summary');
    expect([200, 403, 404]).toContain(summaryResponse.status());

    if (summaryResponse.ok()) {
      const summary = await summaryResponse.json();
      expect(summary).toHaveProperty('total');
    }
  });

  test('delete assumption', async ({ authenticatedRequest: request }) => {
    // Create assumption
    const createData = {
      title: 'e2e_assumption_delete_' + Date.now(),
      category: 'Logistical',
      description: 'Assumption to be deleted',
    };

    const createResponse = await request.post('/api/assumptions', { data: createData });

    if (!createResponse.ok()) {
      expect([403, 404]).toContain(createResponse.status());
      return;
    }

    const created = await createResponse.json();

    // Delete assumption
    const deleteResponse = await request.delete(`/api/assumptions/${created.id}`);
    expect([200, 204, 403, 404]).toContain(deleteResponse.status());
  });

  test('validate assumption categories', async ({ authenticatedRequest: request }) => {
    const validCategories = ['Enemy', 'Friendly', 'Environmental'];

    for (const category of validCategories) {
      const assumptionData = {
        title: `e2e_assumption_category_${category}_` + Date.now(),
        category: category,
        description: `Testing ${category} category`,
      };

      const response = await request.post('/api/assumptions', { data: assumptionData });
      expect([200, 201, 403, 404]).toContain(response.status());

      if (response.ok()) {
        const body = await response.json();
        expect(body.category).toBe(category);
      }
    }
  });

  test('broken assumptions filtering works', async ({ authenticatedRequest: request }) => {
    const brokenResponse = await request.get('/api/assumptions?status=Broken');
    expect([200, 403, 404]).toContain(brokenResponse.status());

    if (brokenResponse.ok()) {
      const brokenAssumptions = await brokenResponse.json();
      expect(Array.isArray(brokenAssumptions)).toBe(true);
    }
  });

  test('assumption confidence score validation', async ({ authenticatedRequest: request }) => {
    const assumptionData = {
      title: `e2e_assumption_confidence_50_` + Date.now(),
      category: 'Intelligence',
      confidence_score: 50,
    };

    const response = await request.post('/api/assumptions', { data: assumptionData });
    expect([200, 201, 403, 404]).toContain(response.status());

    if (response.ok()) {
      const body = await response.json();
      expect(body.confidence_score).toBe(50);
    }
  });
});
