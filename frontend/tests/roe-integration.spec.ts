// ROE Integration Test
// Purpose: Test the actual ROE request/approval workflow with Decision System

import { expect } from '@playwright/test';
import { authenticatedTest } from './fixtures/auth';

authenticatedTest.describe('ROE Request Workflow Integration', () => {
  let decisionId: string;

  authenticatedTest('Create a decision for ROE testing', async ({ authenticatedRequest: request }) => {
    // Create a decision that will need ROE approval
    // Decisions are nested under /api/c2/decisions/
    // CreateDecisionRequest expects: name, description, source_id, properties
    const response = await request.post('/api/c2/decisions/', {
      data: {
        name: 'Test Decision Requiring ROE',
        description: 'E2E test decision for ROE workflow',
        source_id: 'test-source-123',
        properties: {
          urgency: 'high',
          category: 'kinetic_strike'
        }
      }
    });

    expect(response.ok(), `Failed to create decision: ${response.status()}`).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('id');
    decisionId = data.id;
  });

  authenticatedTest('Get ROE status for decision', async ({ authenticatedRequest: request }) => {
    expect(decisionId).toBeDefined();

    const response = await request.get(`/api/roe/decisions/${decisionId}/status`);
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data).toHaveProperty('decision_id');
    expect(data.decision_id).toBe(decisionId);
  });

  authenticatedTest('Auto-determine ROE status', async ({ authenticatedRequest: request }) => {
    expect(decisionId).toBeDefined();

    const response = await request.post(`/api/roe/decisions/${decisionId}/auto-determine`, {
      data: {}
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('roe_status');
    expect(data.decision_id).toBe(decisionId);
  });

  authenticatedTest('Check if decision is blocked by ROE', async ({ authenticatedRequest: request }) => {
    expect(decisionId).toBeDefined();

    const response = await request.get(`/api/roe/decisions/${decisionId}/check-blocking`);
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data).toHaveProperty('can_proceed');
    expect(data).toHaveProperty('is_blocked');
    expect(typeof data.can_proceed).toBe('boolean');
    expect(typeof data.is_blocked).toBe('boolean');
  });

  authenticatedTest('Create ROE request for decision', async ({ authenticatedRequest: request }) => {
    expect(decisionId).toBeDefined();

    const response = await request.post(`/api/roe/decisions/${decisionId}/request`, {
      data: {
        decision_id: decisionId,
        request_justification: 'E2E test - requesting ROE approval for kinetic strike',
        approval_authority: 'CENTCOM',
        roe_reference: 'ROE-2026-TEST',
        conditions: 'Weather clear, civilian evacuation confirmed'
      }
    });

    // Handler returns 201 Created
    expect(response.status()).toBe(201);
    const data = await response.json();
    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('decision_id');
    expect(data).toHaveProperty('status');
    expect(data.decision_id).toBe(decisionId);
    expect(data.status).toBe('pending');
  });

  authenticatedTest('List ROE requests', async ({ authenticatedRequest: request }) => {
    const response = await request.get('/api/roe/requests');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
    expect(data.length).toBeGreaterThan(0);

    // Should include the request we just created
    const ourRequest = data.find((r: any) => r.decision_id === decisionId);
    expect(ourRequest).toBeDefined();
    expect(ourRequest.status).toBe('pending');
  });

  authenticatedTest('Get ROE request by decision ID', async ({ authenticatedRequest: request }) => {
    expect(decisionId).toBeDefined();

    const response = await request.get(`/api/roe/requests/decision/${decisionId}`);
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data).toHaveProperty('id');
    expect(data.decision_id).toBe(decisionId);
    expect(data.status).toBe('pending');
  });

  authenticatedTest('Approve ROE request', async ({ authenticatedRequest: request }) => {
    expect(decisionId).toBeDefined();

    // First get the request ID
    const getResponse = await request.get(`/api/roe/requests/decision/${decisionId}`);
    const roeRequest = await getResponse.json();

    // Now approve it
    const response = await request.patch(`/api/roe/requests/${roeRequest.id}`, {
      data: {
        status: 'approved',
        roe_reference: 'ROE-2026-APPROVED',
        expiration_date: new Date(Date.now() + 86400000).toISOString(), // +24 hours
        conditions: 'Approved with standard ROE restrictions'
      }
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.status).toBe('approved');
    // approved_by is set from JWT claims, not from the request body
    expect(data).toHaveProperty('approved_by');
    expect(data).toHaveProperty('approved_at');
  });

  authenticatedTest('Update decision ROE status', async ({ authenticatedRequest: request }) => {
    expect(decisionId).toBeDefined();

    // Backend uses snake_case ROE status values
    const response = await request.patch(`/api/roe/decisions/${decisionId}/status`, {
      data: {
        roe_status: 'roe_approved',
        roe_notes: 'E2E test - ROE approval granted by CENTCOM'
      }
    });

    // Handler returns 204 No Content on success (no response body)
    expect(response.status()).toBe(204);
  });

  authenticatedTest('Route decision with ROE check', async ({ authenticatedRequest: request }) => {
    expect(decisionId).toBeDefined();

    const response = await request.get(`/api/roe/decisions/${decisionId}/route`);
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    // RoutingPlan returns venue_name, can_proceed, meeting_date, etc.
    expect(data).toHaveProperty('venue_name');
    expect(data).toHaveProperty('can_proceed');
    expect(typeof data.can_proceed).toBe('boolean');
    expect(data).toHaveProperty('routed_at');
  });
});
