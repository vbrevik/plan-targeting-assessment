// Comprehensive Targeting API E2E Tests
// Tests all actual implemented targeting endpoints

import { test, expect } from '@playwright/test';
import { authenticatedTest } from './fixtures/auth';

authenticatedTest.describe('Targeting API - Comprehensive Tests', () => {
  let targetId: string;
  let sessionId: string;

  // ============================================================================
  // TARGET CRUD OPERATIONS
  // ============================================================================

  authenticatedTest.describe('Target CRUD Operations', () => {
    authenticatedTest('Create a new target', async ({ authenticatedRequest: request }) => {
      const response = await request.post('/api/targeting/targets', {
        data: {
          name: 'E2E-TARGET-001',
          target_type: 'FACILITY',
          priority: 'HIGH',
          coordinates: '34.5678, 69.1234',
          description: 'E2E test target - command center',
          classification: 'SECRET',
          status: 'NOMINATED'
        }
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data).toHaveProperty('id');
      expect(data.name).toContain('E2E-TARGET-001');
      targetId = data.id;
    });

    authenticatedTest('Get target by ID', async ({ authenticatedRequest: request }) => {
      expect(targetId).toBeDefined();

      const response = await request.get(`/api/targeting/targets/${targetId}`);
      expect(response.ok()).toBeTruthy();

      const data = await response.json();
      expect(data.id).toBe(targetId);
      expect(data.name).toContain('E2E-TARGET-001');
      expect(data.target_type).toBe('FACILITY');
    });

    authenticatedTest('List all targets', async ({ authenticatedRequest: request }) => {
      const response = await request.get('/api/targeting/targets');
      expect(response.ok()).toBeTruthy();

      const data = await response.json();
      expect(Array.isArray(data)).toBeTruthy();
      expect(data.length).toBeGreaterThan(0);

      // Should include our test target
      const ourTarget = data.find((t: any) => t.id === targetId);
      expect(ourTarget).toBeDefined();
    });

    authenticatedTest('Update target information', async ({ authenticatedRequest: request }) => {
      expect(targetId).toBeDefined();

      const response = await request.patch(`/api/targeting/targets/${targetId}`, {
        data: {
          priority: 'CRITICAL',
          description: 'E2E test target - UPDATED priority to critical',
          status: 'VALIDATED'
        }
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.priority).toBe('CRITICAL');
      expect(data.status).toBe('VALIDATED');
    });

    authenticatedTest('Filter targets by status', async ({ authenticatedRequest: request }) => {
      const response = await request.get('/api/targeting/targets?status=VALIDATED');
      expect(response.ok()).toBeTruthy();

      const data = await response.json();
      expect(Array.isArray(data)).toBeTruthy();

      // All returned targets should have VALIDATED status
      data.forEach((target: any) => {
        expect(target.status).toBe('VALIDATED');
      });
    });

    authenticatedTest('Delete target', async ({ authenticatedRequest: request }) => {
      expect(targetId).toBeDefined();

      const response = await request.delete(`/api/targeting/targets/${targetId}`);
      expect(response.ok()).toBeTruthy();

      // Verify target is deleted
      const getResponse = await request.get(`/api/targeting/targets/${targetId}`);
      expect(getResponse.status()).toBe(404);
    });
  });

  // ============================================================================
  // JTB (JOINT TARGETING BOARD) SESSIONS
  // ============================================================================

  authenticatedTest.describe('JTB Session Management', () => {
    authenticatedTest('Create JTB session', async ({ authenticatedRequest: request }) => {
      const response = await request.post('/api/targeting/jtb/sessions', {
        data: {
          session_date: new Date().toISOString(),
          chair_user_id: 'test-user',
          description: 'E2E test JTB session',
          status: 'SCHEDULED'
        }
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data).toHaveProperty('id');
      expect(data.status).toBe('SCHEDULED');
      sessionId = data.id;
    });

    authenticatedTest('Get session by ID', async ({ authenticatedRequest: request }) => {
      expect(sessionId).toBeDefined();

      const response = await request.get(`/api/targeting/jtb/sessions/${sessionId}`);
      expect(response.ok()).toBeTruthy();

      const data = await response.json();
      expect(data.id).toBe(sessionId);
      expect(data.description).toContain('E2E test');
    });

    authenticatedTest('List all sessions', async ({ authenticatedRequest: request }) => {
      const response = await request.get('/api/targeting/jtb/sessions');
      expect(response.ok()).toBeTruthy();

      const data = await response.json();
      expect(Array.isArray(data)).toBeTruthy();

      const ourSession = data.find((s: any) => s.id === sessionId);
      expect(ourSession).toBeDefined();
    });

    authenticatedTest('Start JTB session', async ({ authenticatedRequest: request }) => {
      expect(sessionId).toBeDefined();

      const response = await request.post(`/api/targeting/jtb/sessions/${sessionId}/start`, {
        data: {}
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.status).toBe('IN_PROGRESS');
    });

    authenticatedTest('Complete JTB session', async ({ authenticatedRequest: request }) => {
      expect(sessionId).toBeDefined();

      const response = await request.post(`/api/targeting/jtb/sessions/${sessionId}/complete`, {
        data: {
          outcomes_summary: 'E2E test session completed successfully'
        }
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.status).toBe('COMPLETED');
    });
  });

  // ============================================================================
  // TARGET NOMINATIONS
  // ============================================================================

  authenticatedTest.describe('Target Nomination Workflow', () => {
    let nominationTargetId: string;

    authenticatedTest('Create target for nomination', async ({ authenticatedRequest: request }) => {
      const response = await request.post('/api/targeting/targets', {
        data: {
          name: 'NOMINATION-TARGET-001',
          target_type: 'HVT',
          priority: 'HIGH',
          coordinates: '35.1234, 70.5678',
          description: 'Target for nomination workflow test',
          classification: 'SECRET',
          status: 'NOMINATED'
        }
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      nominationTargetId = data.id;
    });

    authenticatedTest('Submit target for JTB review', async ({ authenticatedRequest: request }) => {
      expect(nominationTargetId).toBeDefined();
      expect(sessionId).toBeDefined();

      const response = await request.post('/api/targeting/nominations', {
        data: {
          target_id: nominationTargetId,
          jtb_session_id: sessionId,
          nominated_by: 'test-analyst',
          justification: 'High-value target supporting enemy operations',
          supporting_intel: 'SIGINT + IMINT confirmation'
        }
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data).toHaveProperty('id');
      expect(data.target_id).toBe(nominationTargetId);
    });
  });

  // ============================================================================
  // DTL (DYNAMIC TARGETING LIST)
  // ============================================================================

  authenticatedTest.describe('DTL Operations', () => {
    let dtlTargetId: string;

    authenticatedTest('Create DTL target', async ({ authenticatedRequest: request }) => {
      const response = await request.post('/api/targeting/targets', {
        data: {
          name: 'DTL-TARGET-001',
          target_type: 'MOBILE_UNIT',
          priority: 'CRITICAL',
          coordinates: '36.0000, 71.0000',
          description: 'Mobile target on DTL',
          classification: 'SECRET',
          status: 'DTL'
        }
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      dtlTargetId = data.id;
    });

    authenticatedTest('Get DTL targets', async ({ authenticatedRequest: request }) => {
      const response = await request.get('/api/targeting/dtl');
      expect(response.ok()).toBeTruthy();

      const data = await response.json();
      expect(Array.isArray(data)).toBeTruthy();

      // Should include our DTL target
      const ourTarget = data.find((t: any) => t.id === dtlTargetId);
      expect(ourTarget).toBeDefined();
    });

    authenticatedTest('Update DTL target location', async ({ authenticatedRequest: request }) => {
      expect(dtlTargetId).toBeDefined();

      const response = await request.patch(`/api/targeting/targets/${dtlTargetId}`, {
        data: {
          coordinates: '36.1234, 71.5678',
          last_observed: new Date().toISOString()
        }
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.coordinates).toBe('36.1234, 71.5678');
    });
  });

  // ============================================================================
  // TARGET EFFECTS & WEAPONEERING
  // ============================================================================

  authenticatedTest.describe('Target Effects', () => {
    let effectTargetId: string;

    authenticatedTest('Create target for effects planning', async ({ authenticatedRequest: request }) => {
      const response = await request.post('/api/targeting/targets', {
        data: {
          name: 'EFFECTS-TARGET-001',
          target_type: 'FACILITY',
          priority: 'HIGH',
          coordinates: '37.0000, 72.0000',
          description: 'Target for effects planning test',
          classification: 'SECRET',
          status: 'APPROVED'
        }
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      effectTargetId = data.id;
    });

    authenticatedTest('Add desired effects to target', async ({ authenticatedRequest: request }) => {
      expect(effectTargetId).toBeDefined();

      const response = await request.post('/api/targeting/effects', {
        data: {
          target_id: effectTargetId,
          desired_effect: 'NEUTRALIZE',
          effect_type: 'KINETIC',
          justification: 'Command and control facility - disrupt operations',
          assessment_criteria: 'Facility non-operational for 72 hours'
        }
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data).toHaveProperty('id');
      expect(data.desired_effect).toBe('NEUTRALIZE');
    });

    authenticatedTest('Get target effects', async ({ authenticatedRequest: request }) => {
      expect(effectTargetId).toBeDefined();

      const response = await request.get(`/api/targeting/targets/${effectTargetId}/effects`);
      expect(response.ok()).toBeTruthy();

      const data = await response.json();
      expect(Array.isArray(data)).toBeTruthy();
      expect(data.length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // COLLATERAL DAMAGE ESTIMATION (CDE)
  // ============================================================================

  authenticatedTest.describe('CDE Operations', () => {
    let cdeTargetId: string;

    authenticatedTest('Create target for CDE', async ({ authenticatedRequest: request }) => {
      const response = await request.post('/api/targeting/targets', {
        data: {
          name: 'CDE-TARGET-001',
          target_type: 'FACILITY',
          priority: 'MEDIUM',
          coordinates: '38.0000, 73.0000',
          description: 'Target near civilian area - requires CDE',
          classification: 'SECRET',
          status: 'NOMINATED'
        }
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      cdeTargetId = data.id;
    });

    authenticatedTest('Perform CDE assessment', async ({ authenticatedRequest: request }) => {
      expect(cdeTargetId).toBeDefined();

      const response = await request.post('/api/targeting/cde', {
        data: {
          target_id: cdeTargetId,
          weapon_type: 'GBU-38',
          delivery_method: 'F-16',
          civilians_within_100m: 12,
          civilians_within_500m: 45,
          risk_level: 'MEDIUM',
          mitigation_measures: 'Strike during night hours, minimize collateral'
        }
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data).toHaveProperty('id');
      expect(data.risk_level).toBe('MEDIUM');
    });
  });

  // ============================================================================
  // TIME-SENSITIVE TARGETS (TST)
  // ============================================================================

  authenticatedTest.describe('TST Workflow', () => {
    let tstTargetId: string;

    authenticatedTest('Create TST alert', async ({ authenticatedRequest: request }) => {
      const response = await request.post('/api/targeting/tst', {
        data: {
          target_name: 'TST-EMERGENT-001',
          target_type: 'HVT',
          coordinates: '39.0000, 74.0000',
          time_sensitive_window: 45, // minutes
          priority: 'CRITICAL',
          intel_source: 'SIGINT',
          description: 'High-value individual identified - limited window'
        }
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data).toHaveProperty('id');
      expect(data.time_sensitive_window).toBe(45);
      tstTargetId = data.id;
    });

    authenticatedTest('Get active TSTs', async ({ authenticatedRequest: request }) => {
      const response = await request.get('/api/targeting/tst/active');
      expect(response.ok()).toBeTruthy();

      const data = await response.json();
      expect(Array.isArray(data)).toBeTruthy();
    });

    authenticatedTest('Approve TST for engagement', async ({ authenticatedRequest: request }) => {
      expect(tstTargetId).toBeDefined();

      const response = await request.post(`/api/targeting/tst/${tstTargetId}/approve`, {
        data: {
          approved_by: 'test-commander',
          engagement_authorization: 'GRANTED',
          notes: 'E2E test - TST approved for immediate engagement'
        }
      });

      expect(response.ok()).toBeTruthy();
    });
  });

  // ============================================================================
  // REALTIME UPDATES
  // ============================================================================

  authenticatedTest.describe('Realtime Target Updates', () => {
    authenticatedTest('Get realtime target feed', async ({ authenticatedRequest: request }) => {
      const response = await request.get('/api/targeting/realtime/feed');
      expect(response.ok()).toBeTruthy();

      const data = await response.json();
      expect(data).toHaveProperty('updates');
      expect(Array.isArray(data.updates)).toBeTruthy();
    });

    authenticatedTest('Get target update history', async ({ authenticatedRequest: request }) => {
      const response = await request.get('/api/targeting/realtime/history?limit=10');
      expect(response.ok()).toBeTruthy();

      const data = await response.json();
      expect(Array.isArray(data)).toBeTruthy();
    });
  });
});
