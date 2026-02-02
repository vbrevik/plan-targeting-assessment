// ROE E2E Tests
// Purpose: Verify Ontology-backed ROE Service

import { test, expect } from '@playwright/test';
import { authenticatedTest } from './fixtures/auth';

authenticatedTest.describe('ROE Ontology Service', () => {

  authenticatedTest('POST /api/targeting/roe creates a new rule', async ({ authenticatedRequest: request }) => {
    const response = await request.post('/api/targeting/roe', {
      data: {
        name: 'E2E-ROE-TEST',
        description: 'Test Rule for E2E Verification',
        roe_type: 'MISSION_SPECIFIC',
        status: 'ACTIVE',
        created_by: 'e2e-user'
      }
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('id');
  });

  authenticatedTest('GET /api/targeting/roe returns active rules', async ({ authenticatedRequest: request }) => {
    const response = await request.get('/api/targeting/roe');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
    // Should contain at least the rule we just created if tests run sequentially, or we can't guarantee count but can guarantee structure
    if (data.length > 0) {
      expect(data[0]).toHaveProperty('id');
      expect(data[0]).toHaveProperty('roe_type');
    }
  });

  authenticatedTest('POST /api/targeting/roe/check validates compliance', async ({ authenticatedRequest: request }) => {
    // 1. Create a target first
    const targetRes = await request.post('/api/targeting/targets', {
      data: {
        name: 'ROE-TEST-TARGET',
        target_type: 'HVT',
        priority: 'HIGH',
        coordinates: '34.56, 69.12',
        description: 'Target for ROE E2E',
        classification: 'SECRET'
      }
    });

    // Check if target creation failed - if so, fail test with clear message
    expect(targetRes.ok(), `Failed to create target: ${targetRes.status()}`).toBeTruthy();
    const target = await targetRes.json();
    const targetId = target.id;

    // 2. Check compliance against this target
    const response = await request.post('/api/targeting/roe/check', {
      data: {
        target_id: targetId,
        proposed_action: 'KINETIC_STRIKE'
      }
    });

    // We expect success (200) even if not compliant, as long as the service runs
    expect(response.ok()).toBeTruthy();
    const result = await response.json();

    expect(result).toHaveProperty('compliant');
    expect(result).toHaveProperty('violated_rules');
    expect(typeof result.compliant).toBe('boolean');
  });

});
