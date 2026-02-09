// ROE API Test
// Purpose: Test ROE API endpoints directly

import { expect } from '@playwright/test';
import { authenticatedTest } from './fixtures/auth';

authenticatedTest.describe('ROE API Endpoints', () => {
  const testDecisionId = 'test-decision-' + Date.now();
  let roeRequestId: string;

  authenticatedTest('Check ROE status for a decision (should return default status)', async ({ authenticatedRequest: request }) => {
    const response = await request.get(`/api/roe/decisions/${testDecisionId}/status`);

    // Should return 200 with default status even if decision doesn't exist
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('decision_id');
    expect(data.decision_id).toBe(testDecisionId);
  });

  authenticatedTest('Update ROE status for a decision', async ({ authenticatedRequest: request }) => {
    // Backend uses snake_case ROE status values:
    // within_approved_roe, requires_roe_release, roe_pending_approval, roe_approved, roe_rejected
    const response = await request.patch(`/api/roe/decisions/${testDecisionId}/status`, {
      data: {
        roe_status: 'roe_pending_approval',
        roe_notes: 'E2E test - setting status to pending approval'
      }
    });

    // Handler returns 204 No Content on success (no response body)
    expect(response.status()).toBe(204);
  });

  authenticatedTest('Auto-determine ROE status for a decision', async ({ authenticatedRequest: request }) => {
    // auto-determine requires the decision to exist as an entity in the DB.
    // With a fabricated test ID, the entity won't be found and the handler returns 404.
    const response = await request.post(`/api/roe/decisions/${testDecisionId}/auto-determine`, {
      data: {}
    });

    // Fabricated decision_id won't exist in entities table
    expect(response.status()).toBe(404);
  });

  authenticatedTest('Check if decision is blocked by ROE', async ({ authenticatedRequest: request }) => {
    const response = await request.get(`/api/roe/decisions/${testDecisionId}/check-blocking`);

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('can_proceed');
    expect(data).toHaveProperty('is_blocked');
    expect(data).toHaveProperty('is_pending');
    expect(typeof data.can_proceed).toBe('boolean');
    expect(typeof data.is_blocked).toBe('boolean');
  });

  authenticatedTest('Create ROE request for a decision', async ({ authenticatedRequest: request }) => {
    const response = await request.post(`/api/roe/decisions/${testDecisionId}/request`, {
      data: {
        decision_id: testDecisionId,
        request_justification: 'E2E test - requesting ROE approval',
        approval_authority: 'CENTCOM',
        roe_reference: 'ROE-2026-TEST',
        conditions: 'Test conditions for ROE request'
      }
    });

    // Handler returns 201 Created
    expect(response.status()).toBe(201);
    const data = await response.json();
    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('decision_id');
    expect(data).toHaveProperty('status');
    expect(data.decision_id).toBe(testDecisionId);
    expect(data.status).toBe('pending');

    // Save the request ID for later tests
    roeRequestId = data.id;
  });

  authenticatedTest('List all ROE requests', async ({ authenticatedRequest: request }) => {
    const response = await request.get('/api/roe/requests');

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();

    // Should include the request we just created
    const ourRequest = data.find((r: any) => r.id === roeRequestId);
    expect(ourRequest).toBeDefined();
    expect(ourRequest.status).toBe('pending');
  });

  authenticatedTest('List ROE requests filtered by status', async ({ authenticatedRequest: request }) => {
    const response = await request.get('/api/roe/requests?status=pending');

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();

    // All returned requests should have pending status
    data.forEach((req: any) => {
      expect(req.status).toBe('pending');
    });
  });

  authenticatedTest('Get ROE request by ID', async ({ authenticatedRequest: request }) => {
    const response = await request.get(`/api/roe/requests/${roeRequestId}`);

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.id).toBe(roeRequestId);
    expect(data.decision_id).toBe(testDecisionId);
    expect(data.status).toBe('pending');
  });

  authenticatedTest('Get ROE request by decision ID', async ({ authenticatedRequest: request }) => {
    const response = await request.get(`/api/roe/requests/decision/${testDecisionId}`);

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.id).toBe(roeRequestId);
    expect(data.decision_id).toBe(testDecisionId);
  });

  authenticatedTest('Approve ROE request', async ({ authenticatedRequest: request }) => {
    const response = await request.patch(`/api/roe/requests/${roeRequestId}`, {
      data: {
        status: 'approved',
        roe_reference: 'ROE-2026-APPROVED',
        expiration_date: new Date(Date.now() + 86400000).toISOString(),
        conditions: 'Approved with standard restrictions'
      }
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.status).toBe('approved');
    // approved_by is set from JWT claims (the authenticated user), not from the request body
    expect(data).toHaveProperty('approved_by');
    expect(data).toHaveProperty('approved_at');
    expect(data.roe_reference).toBe('ROE-2026-APPROVED');
  });

  authenticatedTest('Reject ROE request (create new one first)', async ({ authenticatedRequest: request }) => {
    // Create a new request to reject
    const createResponse = await request.post(`/api/roe/decisions/${testDecisionId}-reject/request`, {
      data: {
        decision_id: `${testDecisionId}-reject`,
        request_justification: 'E2E test - request to be rejected',
        approval_authority: 'CENTCOM'
      }
    });

    expect(createResponse.status()).toBe(201);
    const createData = await createResponse.json();
    const newRequestId = createData.id;

    // Now reject it
    const response = await request.patch(`/api/roe/requests/${newRequestId}`, {
      data: {
        status: 'rejected',
        rejection_reason: 'E2E test - rejecting for testing purposes'
      }
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.status).toBe('rejected');
    expect(data.rejection_reason).toBe('E2E test - rejecting for testing purposes');
  });

  authenticatedTest('Route decision with ROE check', async ({ authenticatedRequest: request }) => {
    // route_decision requires the decision to exist as an entity in the DB.
    // With a fabricated ID this will return 404.
    const response = await request.get(`/api/roe/decisions/${testDecisionId}/route`);

    // Fabricated decision won't exist in entities table
    expect(response.status()).toBe(404);
  });
});
