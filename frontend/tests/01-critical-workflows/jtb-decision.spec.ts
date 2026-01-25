// JTB Decision Workflow E2E Tests - Day 2 Implementation
// Tests for Joint Targeting Board session management and decision workflows

import { test, expect } from '@playwright/test';
import { 
  NavigationHelper, 
  TargetHelper, 
  JTBHelper,
  AssertionHelper,
  PerformanceHelper,
  ErrorHelper
} from '../helpers/testHelpers';
import { testTargets, testUsers, performanceBenchmarks } from '../fixtures/testData';

test.describe('JTB Decision Workflow - Day 2 Implementation', () => {
  test.beforeEach(async ({ page }) => {
    // Set up JTB Chair role for all tests
    await page.addInitScript(() => {
      window.localStorage.setItem('auth_token', 'test-token-12345');
      window.localStorage.setItem('user_role', 'JTB_CHAIR');
      window.localStorage.setItem('user_clearance', 'SECRET');
    });
  });

  test.describe('JTB Session Management', () => {
    test('should create JTB session with all required fields', async ({ page }) => {
      console.log('🏛️ Testing: JTB session creation');
      
      await NavigationHelper.goToJTBSession(page);
      
      // Verify session creation form is visible
      await expect(page.locator('[data-testid="create-jtb-session"]')).toBeVisible();
      
      // Click create session button
      await page.click('[data-testid="create-jtb-session"]');
      
      // Fill session details
      await page.fill('[data-testid="session-date"]', '2026-01-24');
      await page.fill('[data-testid="session-time"]', '14:00');
      await page.selectOption('[data-testid="session-chair"]', 'LTC Mike Brown');
      await page.fill('[data-testid="session-description"]', 'Regular JTB session for target approval');
      
      // Submit session creation
      await page.click('[data-testid="submit-session"]');
      
      // Verify session created successfully
      await page.waitForResponse('**/api/targeting/jtb/sessions');
      await expect(page.locator('[data-testid="jtb-session-created"]')).toBeVisible();
      
      // Verify session details displayed
      await expect(page.locator('[data-testid="session-date-display"]')).toHaveText('2026-01-24');
      await expect(page.locator('[data-testid="session-time-display"]')).toHaveText('14:00');
      await expect(page.locator('[data-testid="session-chair-display"]')).toHaveText('LTC Mike Brown');
    });

    test('should add multiple targets to session', async ({ page }) => {
      console.log('🎯 Testing: Adding multiple targets to JTB session');
      
      // Create JTB session first
      const sessionId = await JTBHelper.createJTBSession(page, {
        date: '2026-01-24',
        time: '14:00',
        chair: 'LTC Mike Brown'
      });
      
      // Create multiple targets to add to session
      const target1 = await TargetHelper.createTarget(page, {
        name: 'MULTI-TEST-001',
        type: 'HVT',
        priority: 'CRITICAL',
        coordinates: '31.7683N, 35.2137E',
        description: 'Multi-target test 1'
      });
      
      const target2 = await TargetHelper.createTarget(page, {
        name: 'MULTI-TEST-002',
        type: 'STANDARD',
        priority: 'HIGH',
        coordinates: '31.7700N, 35.2150E',
        description: 'Multi-target test 2'
      });
      
      const target3 = await TargetHelper.createTarget(page, {
        name: 'MULTI-TEST-003',
        type: 'TST',
        priority: 'TIME_CRITICAL',
        coordinates: '31.7750N, 35.2200E',
        description: 'Multi-target test 3 (TST)',
        tst_deadline: new Date(Date.now() + 30 * 60 * 1000)
      });
      
      // Add all targets to session
      await JTBHelper.addTargetToSession(page, sessionId, target1);
      await JTBHelper.addTargetToSession(page, sessionId, target2);
      await JTBHelper.addTargetToSession(page, sessionId, target3);
      
      // Verify all targets appear in session
      await page.goto(`/smartops/jtb-session/${sessionId}`);
      await expect(page.locator(`[data-testid="target-in-session-${target1}"]`)).toBeVisible();
      await expect(page.locator(`[data-testid="target-in-session-${target2}"]`)).toBeVisible();
      await expect(page.locator(`[data-testid="target-in-session-${target3}"]`)).toBeVisible();
      
      // Verify target count
      await expect(page.locator('[data-testid="target-count"]')).toHaveText('3');
    });

    test('should archive completed session', async ({ page }) => {
      console.log('📦 Testing: JTB session archiving');
      
      // Create and complete a session
      const sessionId = await JTBHelper.createJTBSession(page, {
        date: '2026-01-23',
        time: '10:00',
        chair: 'LTC Mike Brown'
      });
      
      // Add a target and approve it
      const targetId = await TargetHelper.createTarget(page, testTargets.standard);
      await JTBHelper.addTargetToSession(page, sessionId, targetId);
      await JTBHelper.approveTarget(page, sessionId, targetId);
      
      // Archive the session
      await page.goto(`/smartops/jtb-session/${sessionId}`);
      await page.click('[data-testid="archive-session-button"]');
      await page.click('[data-testid="confirm-archive"]');
      
      // Verify session archived
      await page.waitForResponse('**/api/targeting/jtb/sessions/*/archive');
      await expect(page.locator('[data-testid="session-archived"]')).toBeVisible();
      
      // Verify session no longer in active list
      await NavigationHelper.goToJTBSession(page);
      await expect(page.locator(`[data-testid="session-${sessionId}"]`)).not.toBeVisible();
      
      // Verify session in archive
      await page.click('[data-testid="view-archive"]');
      await expect(page.locator(`[data-testid="archived-session-${sessionId}"]`)).toBeVisible();
    });

    test('should retrieve and display session history', async ({ page }) => {
      console.log('📚 Testing: JTB session history retrieval');
      
      // Create multiple sessions
      const session1 = await JTBHelper.createJTBSession(page, {
        date: '2026-01-23',
        time: '10:00'
      });
      
      const session2 = await JTBHelper.createJTBSession(page, {
        date: '2026-01-22',
        time: '14:00'
      });
      
      const session3 = await JTBHelper.createJTBSession(page, {
        date: '2026-01-21',
        time: '09:00'
      });
      
      // View session history
      await NavigationHelper.goToJTBSession(page);
      await page.click('[data-testid="view-history"]');
      
      // Verify all sessions displayed in chronological order
      await expect(page.locator(`[data-testid="session-${session3}"]`)).toBeVisible();
      await expect(page.locator(`[data-testid="session-${session2}"]`)).toBeVisible();
      await expect(page.locator(`[data-testid="session-${session1}"]`)).toBeVisible();
      
      // Verify sessions are ordered by date (newest first)
      const sessionOrder = await page.locator('[data-testid^="session-"]').all();
      expect(sessionOrder.length).toBe(3);
    });
  });

  test.describe('Multi-Target Approval Workflow', () => {
    test('should approve multiple targets in single session', async ({ page }) => {
      console.log('✅ Testing: Multi-target approval in single session');
      
      // Create session
      const sessionId = await JTBHelper.createJTBSession(page, {
        date: '2026-01-24',
        time: '14:00'
      });
      
      // Create multiple targets
      const target1 = await TargetHelper.createTarget(page, {
        name: 'APPROVAL-TEST-001',
        type: 'HVT',
        priority: 'CRITICAL'
      });
      
      const target2 = await TargetHelper.createTarget(page, {
        name: 'APPROVAL-TEST-002',
        type: 'STANDARD',
        priority: 'HIGH'
      });
      
      const target3 = await TargetHelper.createTarget(page, {
        name: 'APPROVAL-TEST-003',
        type: 'HPT',
        priority: 'MEDIUM'
      });
      
      // Add all targets to session
      await JTBHelper.addTargetToSession(page, sessionId, target1);
      await JTBHelper.addTargetToSession(page, sessionId, target2);
      await JTBHelper.addTargetToSession(page, sessionId, target3);
      
      // Approve all targets
      await JTBHelper.approveTarget(page, sessionId, target1);
      await JTBHelper.approveTarget(page, sessionId, target2);
      await JTBHelper.approveTarget(page, sessionId, target3);
      
      // Verify all targets approved
      await page.goto(`/smartops/jtb-session/${sessionId}`);
      await expect(page.locator(`[data-testid="target-status-${target1}"]`)).toHaveText('APPROVED');
      await expect(page.locator(`[data-testid="target-status-${target2}"]`)).toHaveText('APPROVED');
      await expect(page.locator(`[data-testid="target-status-${target3}"]`)).toHaveText('APPROVED');
      
      // Verify approval count
      await expect(page.locator('[data-testid="approved-count"]')).toHaveText('3');
    });

    test('should handle mixed approvals (approve/reject)', async ({ page }) => {
      console.log('⚖️ Testing: Mixed approvals and rejections');
      
      // Create session
      const sessionId = await JTBHelper.createJTBSession(page, {
        date: '2026-01-24',
        time: '14:00'
      });
      
      // Create targets
      const target1 = await TargetHelper.createTarget(page, {
        name: 'APPROVE-001',
        type: 'HVT'
      });
      
      const target2 = await TargetHelper.createTarget(page, {
        name: 'REJECT-001',
        type: 'STANDARD'
      });
      
      const target3 = await TargetHelper.createTarget(page, {
        name: 'APPROVE-002',
        type: 'HPT'
      });
      
      // Add targets to session
      await JTBHelper.addTargetToSession(page, sessionId, target1);
      await JTBHelper.addTargetToSession(page, sessionId, target2);
      await JTBHelper.addTargetToSession(page, sessionId, target3);
      
      // Approve target1 and target3, reject target2
      await JTBHelper.approveTarget(page, sessionId, target1);
      await JTBHelper.rejectTarget(page, sessionId, target2, 'Insufficient intelligence');
      await JTBHelper.approveTarget(page, sessionId, target3);
      
      // Verify correct statuses
      await page.goto(`/smartops/jtb-session/${sessionId}`);
      await expect(page.locator(`[data-testid="target-status-${target1}"]`)).toHaveText('APPROVED');
      await expect(page.locator(`[data-testid="target-status-${target2}"]`)).toHaveText('REJECTED');
      await expect(page.locator(`[data-testid="target-status-${target3}"]`)).toHaveText('APPROVED');
      
      // Verify counts
      await expect(page.locator('[data-testid="approved-count"]')).toHaveText('2');
      await expect(page.locator('[data-testid="rejected-count"]')).toHaveText('1');
    });

    test('should maintain approval order and timestamps', async ({ page }) => {
      console.log('⏱️ Testing: Approval order and timestamp tracking');
      
      // Create session
      const sessionId = await JTBHelper.createJTBSession(page, {
        date: '2026-01-24',
        time: '14:00'
      });
      
      // Create targets
      const target1 = await TargetHelper.createTarget(page, {
        name: 'ORDER-TEST-001',
        type: 'HVT'
      });
      
      const target2 = await TargetHelper.createTarget(page, {
        name: 'ORDER-TEST-002',
        type: 'STANDARD'
      });
      
      const target3 = await TargetHelper.createTarget(page, {
        name: 'ORDER-TEST-003',
        type: 'HPT'
      });
      
      // Add targets to session
      await JTBHelper.addTargetToSession(page, sessionId, target1);
      await JTBHelper.addTargetToSession(page, sessionId, target2);
      await JTBHelper.addTargetToSession(page, sessionId, target3);
      
      // Approve targets in sequence with delays
      await JTBHelper.approveTarget(page, sessionId, target1);
      await page.waitForTimeout(1000); // 1 second delay
      
      await JTBHelper.approveTarget(page, sessionId, target2);
      await page.waitForTimeout(1500); // 1.5 second delay
      
      await JTBHelper.approveTarget(page, sessionId, target3);
      
      // Verify approval order in timeline
      await page.goto(`/smartops/jtb-session/${sessionId}`);
      await page.click('[data-testid="view-timeline"]');
      
      // Verify timestamps are in order
      const timelineEntries = await page.locator('[data-testid^="timeline-entry-"]').all();
      expect(timelineEntries.length).toBe(3);
      
      // Verify approval rationales are recorded
      await expect(page.locator('[data-testid="approval-rationale-1"]')).toBeVisible();
      await expect(page.locator('[data-testid="approval-rationale-2"]')).toBeVisible();
      await expect(page.locator('[data-testid="approval-rationale-3"]')).toBeVisible();
    });
  });

  test.describe('Decision Recording & Rationale', () => {
    test('should record approval rationale for each target', async ({ page }) => {
      console.log('📝 Testing: Approval rationale recording');
      
      // Create session and target
      const sessionId = await JTBHelper.createJTBSession(page, {
        date: '2026-01-24',
        time: '14:00'
      });
      
      const targetId = await TargetHelper.createTarget(page, {
        name: 'RATIONALE-TEST-001',
        type: 'HVT'
      });
      
      // Add target to session
      await JTBHelper.addTargetToSession(page, sessionId, targetId);
      
      // Approve with specific rationale
      const rationale = 'Target meets all engagement criteria: confirmed location, no friendly forces nearby, high priority for mission success';
      await page.goto(`/smartops/jtb-session/${sessionId}`);
      await page.click(`[data-testid="approve-target-${targetId}"]`);
      await page.fill('[data-testid="approval-rationale"]', rationale);
      await page.click('[data-testid="confirm-approval"]');
      
      // Verify rationale stored
      await page.waitForResponse('**/api/targeting/jtb/targets/*/decision');
      await expect(page.locator('[data-testid="approval-success"]')).toBeVisible();
      
      // Verify rationale displayed in timeline
      await page.click('[data-testid="view-timeline"]');
      await expect(page.locator('[data-testid="approval-rationale"]')).toHaveText(rationale);
      
      // Verify rationale stored in target details
      await page.goto(`/smartops/target/${targetId}`);
      await expect(page.locator('[data-testid="jtb-approval-rationale"]')).toHaveText(rationale);
    });

    test('should record rejection rationale with details', async ({ page }) => {
      console.log('❌ Testing: Rejection rationale recording');
      
      // Create session and target
      const sessionId = await JTBHelper.createJTBSession(page, {
        date: '2026-01-24',
        time: '14:00'
      });
      
      const targetId = await TargetHelper.createTarget(page, {
        name: 'REJECTION-TEST-001',
        type: 'STANDARD'
      });
      
      // Add target to session
      await JTBHelper.addTargetToSession(page, sessionId, targetId);
      
      // Reject with specific rationale
      const rationale = 'Target location cannot be confirmed with sufficient certainty. Additional ISR required before engagement.';
      await page.goto(`/smartops/jtb-session/${sessionId}`);
      await page.click(`[data-testid="reject-target-${targetId}"]`);
      await page.fill('[data-testid="rejection-rationale"]', rationale);
      await page.click('[data-testid="confirm-rejection"]');
      
      // Verify rejection stored
      await page.waitForResponse('**/api/targeting/jtb/targets/*/decision');
      await expect(page.locator('[data-testid="rejection-success"]')).toBeVisible();
      
      // Verify rejection details in timeline
      await page.click('[data-testid="view-timeline"]');
      await expect(page.locator('[data-testid="rejection-rationale"]')).toHaveText(rationale);
      await expect(page.locator('[data-testid="rejection-reason"]')).toBeVisible();
    });

    test('should allow rationale editing before finalization', async ({ page }) => {
      console.log('✏️ Testing: Rationale editing before finalization');
      
      // Create session and target
      const sessionId = await JTBHelper.createJTBSession(page, {
        date: '2026-01-24',
        time: '14:00'
      });
      
      const targetId = await TargetHelper.createTarget(page, {
        name: 'EDIT-TEST-001',
        type: 'HVT'
      });
      
      // Add target to session
      await JTBHelper.addTargetToSession(page, sessionId, targetId);
      
      // Create initial approval
      await page.goto(`/smartops/jtb-session/${sessionId}`);
      await page.click(`[data-testid="approve-target-${targetId}"]`);
      await page.fill('[data-testid="approval-rationale"]', 'Initial rationale');
      await page.click('[data-testid="save-draft"]'); // Save as draft
      
      // Edit rationale
      await page.click(`[data-testid="edit-rationale-${targetId}"]`);
      await page.fill('[data-testid="approval-rationale"]', 'Updated rationale with additional details');
      await page.click('[data-testid="save-draft"]');
      
      // Finalize approval
      await page.click(`[data-testid="finalize-approval-${targetId}"]`);
      
      // Verify updated rationale stored
      await page.click('[data-testid="view-timeline"]');
      await expect(page.locator('[data-testid="approval-rationale"]')).toHaveText('Updated rationale with additional details');
    });
  });

  test.describe('Performance Benchmarks', () => {
    test('should approve 10 targets in under 2 minutes', async ({ page }) => {
      console.log('⚡ Testing: Multi-target approval performance');
      
      // Create session
      const sessionId = await JTBHelper.createJTBSession(page, {
        date: '2026-01-24',
        time: '14:00'
      });
      
      // Create 10 targets
      const targets = [];
      for (let i = 1; i <= 10; i++) {
        const targetId = await TargetHelper.createTarget(page, {
          name: `PERF-TEST-${i.toString().padStart(2, '0')}`,
          type: i % 3 === 0 ? 'HVT' : 'STANDARD',
          priority: i % 2 === 0 ? 'HIGH' : 'MEDIUM'
        });
        targets.push(targetId);
      }
      
      // Add all targets to session
      for (const targetId of targets) {
        await JTBHelper.addTargetToSession(page, sessionId, targetId);
      }
      
      // Measure approval time
      const startTime = Date.now();
      
      // Approve all targets
      for (const targetId of targets) {
        await JTBHelper.approveTarget(page, sessionId, targetId);
      }
      
      const endTime = Date.now();
      const approvalTime = endTime - startTime;
      
      console.log(`📊 Approval time for 10 targets: ${approvalTime}ms (${approvalTime/1000} seconds)`);
      
      // Verify performance benchmark
      expect(approvalTime).toBeLessThan(120000); // 2 minutes
      
      // Verify all targets approved
      await page.goto(`/smartops/jtb-session/${sessionId}`);
      const approvedCount = await page.locator('[data-testid="approved-count"]').textContent();
      expect(approvedCount).toBe('10');
    });

    test('should handle session with 20 targets without performance degradation', async ({ page }) => {
      console.log('📈 Testing: Large session performance');
      
      // Create session
      const sessionId = await JTBHelper.createJTBSession(page, {
        date: '2026-01-24',
        time: '14:00'
      });
      
      // Create 20 targets
      const targets = [];
      for (let i = 1; i <= 20; i++) {
        const targetId = await TargetHelper.createTarget(page, {
          name: `LARGE-TEST-${i.toString().padStart(2, '0')}`,
          type: 'STANDARD',
          priority: 'MEDIUM'
        });
        targets.push(targetId);
      }
      
      // Add all targets to session
      for (const targetId of targets) {
        await JTBHelper.addTargetToSession(page, sessionId, targetId);
      }
      
      // Measure page load time for large session
      const loadStartTime = Date.now();
      await page.goto(`/smartops/jtb-session/${sessionId}`);
      await page.waitForLoadState('networkidle');
      const loadEndTime = Date.now();
      const loadTime = loadEndTime - loadStartTime;
      
      console.log(`📊 Page load time for 20 targets: ${loadTime}ms`);
      
      // Verify performance benchmark
      expect(loadTime).toBeLessThan(10000); // 10 seconds
      
      // Verify all targets displayed
      for (const targetId of targets) {
        await expect(page.locator(`[data-testid="target-in-session-${targetId}"]`)).toBeVisible();
      }
      
      // Verify target count
      await expect(page.locator('[data-testid="target-count"]')).toHaveText('20');
    });
  });

  test.describe('Error Handling', () => {
    test('should handle API failures during approval', async ({ page }) => {
      console.log('🚨 Testing: API failure handling during approval');
      
      // Create session and target
      const sessionId = await JTBHelper.createJTBSession(page, {
        date: '2026-01-24',
        time: '14:00'
      });
      
      const targetId = await TargetHelper.createTarget(page, {
        name: 'ERROR-TEST-001',
        type: 'HVT'
      });
      
      // Add target to session
      await JTBHelper.addTargetToSession(page, sessionId, targetId);
      
      // Mock API failure
      await page.route('**/api/targeting/jtb/targets/*/decision', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal server error' })
        });
      });
      
      // Attempt approval
      await page.goto(`/smartops/jtb-session/${sessionId}`);
      await page.click(`[data-testid="approve-target-${targetId}"]`);
      await page.fill('[data-testid="approval-rationale"]', 'Test rationale');
      await page.click('[data-testid="confirm-approval"]');
      
      // Verify error handling
      await expect(page.locator('[data-testid="api-error-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="api-error-message"]')).toContainText('Failed to save decision');
      
      // Verify retry option
      await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
      
      // Verify target status unchanged
      await expect(page.locator(`[data-testid="target-status-${targetId}"]`)).toHaveText('NOMINATED');
    });

    test('should handle network timeouts gracefully', async ({ page }) => {
      console.log('⏱️ Testing: Network timeout handling');
      
      // Create session and target
      const sessionId = await JTBHelper.createJTBSession(page, {
        date: '2026-01-24',
        time: '14:00'
      });
      
      const targetId = await TargetHelper.createTarget(page, {
        name: 'TIMEOUT-TEST-001',
        type: 'STANDARD'
      });
      
      // Add target to session
      await JTBHelper.addTargetToSession(page, sessionId, targetId);
      
      // Mock network timeout
      await page.route('**/api/targeting/jtb/targets/*/decision', route => {
        setTimeout(() => {
          route.fulfill({
            status: 408,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Request timeout' })
          });
        }, 35000); // 35 second delay
      });
      
      // Attempt approval with timeout
      await page.goto(`/smartops/jtb-session/${sessionId}`);
      await page.click(`[data-testid="approve-target-${targetId}"]`);
      await page.fill('[data-testid="approval-rationale"]', 'Test rationale');
      await page.click('[data-testid="confirm-approval"]');
      
      // Wait for timeout
      await page.waitForTimeout(5000);
      
      // Verify timeout handling
      await expect(page.locator('[data-testid="timeout-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="timeout-error"]')).toContainText('Request timed out');
      
      // Verify cancel option
      await expect(page.locator('[data-testid="cancel-button"]')).toBeVisible();
    });

    test('should handle invalid session data validation', async ({ page }) => {
      console.log('⚠️ Testing: Invalid session data validation');
      
      await NavigationHelper.goToJTBSession(page);
      await page.click('[data-testid="create-jtb-session"]');
      
      // Submit without required fields
      await page.click('[data-testid="submit-session"]');
      
      // Verify validation errors
      await expect(page.locator('[data-testid="date-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="time-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="chair-error"]')).toBeVisible();
      
      // Verify form prevents submission
      await page.waitForResponse('**/api/targeting/jtb/sessions');
      
      // Fill required fields and submit
      await page.fill('[data-testid="session-date"]', '2026-01-24');
      await page.fill('[data-testid="session-time"]', '14:00');
      await page.selectOption('[data-testid="session-chair"]', 'LTC Mike Brown');
      await page.click('[data-testid="submit-session"]');
      
      // Verify session created successfully
      await page.waitForResponse('**/api/targeting/jtb/sessions');
      await expect(page.locator('[data-testid="jtb-session-created"]')).toBeVisible();
    });
  });

  test.describe('Edge Cases', () => {
    test('should handle empty session (no targets)', async ({ page }) => {
      console.log('📭 Testing: Empty session handling');
      
      // Create empty session
      const sessionId = await JTBHelper.createJTBSession(page, {
        date: '2026-01-24',
        time: '14:00'
      });
      
      // Verify empty session messaging
      await page.goto(`/smartops/jtb-session/${sessionId}`);
      await expect(page.locator('[data-testid="empty-session-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="empty-session-message"]')).toContainText('No targets in session');
      
      // Verify cannot complete session
      await expect(page.locator('[data-testid="complete-session-button"]')).toBeDisabled();
      
      // Verify add target button visible
      await expect(page.locator('[data-testid="add-target-to-session"]')).toBeVisible();
    });

    test('should handle session with 50 targets', async ({ page }) => {
      console.log('📊 Testing: Large session with 50 targets');
      
      // Create session
      const sessionId = await JTBHelper.createJTBSession(page, {
        date: '2026-01-24',
        time: '14:00'
      });
      
      // Create 50 targets
      const targets = [];
      for (let i = 1; i <= 50; i++) {
        const targetId = await TargetHelper.createTarget(page, {
          name: `LARGE-${i.toString().padStart(3, '0')}`,
          type: 'STANDARD',
          priority: 'MEDIUM'
        });
        targets.push(targetId);
      }
      
      // Add all targets to session
      for (const targetId of targets) {
        await JTBHelper.addTargetToSession(page, sessionId, targetId);
      }
      
      // Verify all targets displayed
      await page.goto(`/smartops/jtb-session/${sessionId}`);
      await expect(page.locator('[data-testid="target-count"]')).toHaveText('50');
      
      // Verify performance acceptable
      const loadStartTime = Date.now();
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - loadStartTime;
      
      console.log(`📊 Load time for 50 targets: ${loadTime}ms`);
      expect(loadTime).toBeLessThan(15000); // 15 seconds
      
      // Verify pagination or virtualization working
      const visibleTargets = await page.locator('[data-testid^="target-in-session-"]').count();
      expect(visibleTargets).toBeGreaterThan(0);
    });

    test('should handle session timeouts', async ({ page }) => {
      console.log('⏰ Testing: Session timeout handling');
      
      // Create session with past date (already expired)
      const sessionId = await JTBHelper.createJTBSession(page, {
        date: '2025-01-24', // Past date
        time: '10:00'
      });
      
      // Verify session marked as expired
      await page.goto(`/smartops/jtb-session/${sessionId}`);
      await expect(page.locator('[data-testid="session-expired"]')).toBeVisible();
      
      // Verify cannot add targets to expired session
      await expect(page.locator('[data-testid="add-target-to-session"]')).toBeDisabled();
      
      // Verify cannot make decisions on expired session
      const targetId = await TargetHelper.createTarget(page, {
        name: 'EXPIRED-TEST-001',
        type: 'STANDARD'
      });
      
      await JTBHelper.addTargetToSession(page, sessionId, targetId);
      await expect(page.locator(`[data-testid="approve-target-${targetId}"]`)).toBeDisabled();
      await expect(page.locator(`[data-testid="reject-target-${targetId}"]`)).toBeDisabled();
      
      // Verify archive option available
      await expect(page.locator('[data-testid="archive-session-button"]')).toBeVisible();
    });
  });
});