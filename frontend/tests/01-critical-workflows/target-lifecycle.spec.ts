// Target Lifecycle E2E Tests - Day 1 Implementation
// Tests the complete target workflow: Nomination → Validation → Approval → Engagement → Assessment

import { test, expect } from '@playwright/test';
import { 
  NavigationHelper, 
  TargetHelper, 
  JTBHelper, 
  BDAHelper, 
  DecisionGatesHelper,
  AssertionHelper,
  PerformanceHelper,
  ErrorHelper
} from '../helpers/testHelpers';
import { testTargets, testUsers, performanceBenchmarks } from '../fixtures/testData';

test.describe('Target Lifecycle - Critical Workflows', () => {
  test.beforeEach(async ({ page }) => {
    // Set up authentication
    await page.addInitScript(() => {
      window.localStorage.setItem('auth_token', 'test-token-12345');
      window.localStorage.setItem('user_role', 'TARGETEER');
      window.localStorage.setItem('user_clearance', 'SECRET');
    });
  });

  test.describe('Target Nomination Workflow', () => {
    test('should create a standard target with all required fields', async ({ page }) => {
      console.log('🎯 Testing: Standard target creation');
      
      await NavigationHelper.goToTargetNomination(page);
      
      // Verify form is loaded
      await expect(page.locator('[data-testid="target-nomination-form"]')).toBeVisible();
      
      // Fill in target details
      await page.fill('[data-testid="target-name"]', testTargets.standard.name);
      await page.selectOption('[data-testid="target-type"]', testTargets.standard.type);
      await page.selectOption('[data-testid="target-priority"]', testTargets.standard.priority);
      await page.fill('[data-testid="target-coordinates"]', testTargets.standard.coordinates);
      await page.fill('[data-testid="target-description"]', testTargets.standard.description);
      
      // Submit nomination
      await page.click('[data-testid="submit-nomination"]');
      
      // Verify success
      await expect(page.locator('[data-testid="target-success-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="target-success-message"]')).toContainText('Target created successfully');
      
      // Verify target appears in DTL
      await NavigationHelper.goToTargetingDashboard(page);
      await expect(page.locator(`text=${testTargets.standard.name}`)).toBeVisible();
    });

    test('should create a Time-Sensitive Target (TST) with deadline', async ({ page }) => {
      console.log('⏰ Testing: TST creation with deadline');
      
      await NavigationHelper.goToTargetNomination(page);
      
      // Fill in TST details
      await page.fill('[data-testid="target-name"]', testTargets.tst.name);
      await page.selectOption('[data-testid="target-type"]', testTargets.tst.type);
      await page.selectOption('[data-testid="target-priority"]', 'TIME_CRITICAL');
      await page.fill('[data-testid="target-coordinates"]', testTargets.tst.coordinates);
      await page.fill('[data-testid="target-description"]', testTargets.tst.description);
      
      // Set TST deadline (25 minutes from now)
      const deadline = new Date(Date.now() + 25 * 60 * 1000);
      await page.fill('[data-testid="tst-deadline"]', deadline.toISOString());
      
      // Submit nomination
      await page.click('[data-testid="submit-nomination"]');
      
      // Verify TST created successfully
      await expect(page.locator('[data-testid="target-success-message"]')).toBeVisible();
      
      // Verify TST alert appears on dashboard
      await NavigationHelper.goToTargetingDashboard(page);
      await expect(page.locator('[data-testid="tst-alert"]')).toBeVisible();
      await expect(page.locator(`text=${testTargets.tst.name}`)).toBeVisible();
      await expect(page.locator('[data-testid="tst-countdown"]')).toBeVisible();
    });

    test('should validate target coordinates format', async ({ page }) => {
      console.log('📍 Testing: Target coordinate validation');
      
      await NavigationHelper.goToTargetNomination(page);
      
      // Fill in form with invalid coordinates
      await page.fill('[data-testid="target-name"]', 'INVALID-COORD-001');
      await page.selectOption('[data-testid="target-type"]', 'STANDARD');
      await page.fill('[data-testid="target-coordinates"]', 'invalid-coordinates');
      await page.fill('[data-testid="target-description"]', 'Test invalid coordinates');
      
      // Submit form
      await page.click('[data-testid="submit-nomination"]');
      
      // Verify validation error
      await expect(page.locator('[data-testid="coordinate-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="coordinate-error"]')).toContainText('Invalid coordinate format');
    });

    test('should meet performance benchmark for target creation', async ({ page }) => {
      console.log('⚡ Testing: Target creation performance');
      
      const startTime = Date.now();
      
      await NavigationHelper.goToTargetNomination(page);
      await page.fill('[data-testid="target-name"]', 'PERF-TEST-001');
      await page.selectOption('[data-testid="target-type"]', 'STANDARD');
      await page.fill('[data-testid="target-coordinates"]', '31.7683N, 35.2137E');
      await page.fill('[data-testid="target-description"]', 'Performance test target');
      await page.click('[data-testid="submit-nomination"]');
      
      // Wait for success
      await expect(page.locator('[data-testid="target-success-message"]')).toBeVisible();
      
      const endTime = Date.now();
      const creationTime = endTime - startTime;
      
      console.log(`📊 Target creation time: ${creationTime}ms`);
      expect(creationTime).toBeLessThan(performanceBenchmarks.targetCreation);
    });
  });

  test.describe('Target Validation Workflow', () => {
    test('should validate target through J2 intelligence review', async ({ page }) => {
      console.log('🔍 Testing: Target validation by J2');
      
      // First create a target
      const targetId = await TargetHelper.createTarget(page, testTargets.standard);
      
      // Navigate to target detail
      await page.goto(`/smartops/target/${targetId}`);
      await page.waitForLoadState('networkidle');
      
      // Verify initial status
      await AssertionHelper.verifyTargetStatus(page, 'NOMINATED');
      
      // Switch to J2 role for validation
      await page.addInitScript(() => {
        window.localStorage.setItem('user_role', 'J2_OFFICER');
      });
      
      // Click validate target button
      await page.click('[data-testid="validate-target-button"]');
      
      // Fill validation rationale
      await page.fill('[data-testid="validation-rationale"]', 'Target confirmed through multiple intelligence sources');
      
      // Submit validation
      await page.click('[data-testid="confirm-validation"]');
      
      // Verify status updated
      await expect(page.locator('[data-testid="validation-success"]')).toBeVisible();
      await AssertionHelper.verifyTargetStatus(page, 'VALIDATED');
    });

    test('should reject target with insufficient intelligence', async ({ page }) => {
      console.log('❌ Testing: Target rejection due to insufficient intel');
      
      // Create a target with minimal information
      const targetId = await TargetHelper.createTarget(page, {
        name: 'MINIMAL-INTEL-001',
        type: 'STANDARD',
        coordinates: '31.7683N, 35.2137E',
        description: 'Target with minimal intelligence'
      });
      
      // Navigate to target detail as J2
      await page.addInitScript(() => {
        window.localStorage.setItem('user_role', 'J2_OFFICER');
      });
      await page.goto(`/smartops/target/${targetId}`);
      
      // Click reject target button
      await page.click('[data-testid="reject-target-button"]');
      
      // Fill rejection rationale
      await page.fill('[data-testid="rejection-rationale"]', 'Insufficient intelligence to validate target');
      
      // Submit rejection
      await page.click('[data-testid="confirm-rejection"]');
      
      // Verify status updated to REJECTED
      await expect(page.locator('[data-testid="rejection-success"]')).toBeVisible();
      await AssertionHelper.verifyTargetStatus(page, 'REJECTED');
    });
  });

  test.describe('JTB Approval Workflow', () => {
    test('should approve target through Joint Targeting Board', async ({ page }) => {
      console.log('🏛️ Testing: JTB target approval');
      
      // Create and validate a target first
      const targetId = await TargetHelper.createTarget(page, testTargets.hvt);
      
      // Create JTB session
      const sessionId = await JTBHelper.createJTBSession(page, {
        date: '2026-01-23',
        time: '14:00',
        chair: 'LTC Mike Brown'
      });
      
      // Add target to JTB session
      await JTBHelper.addTargetToSession(page, sessionId, targetId);
      
      // Approve target in JTB
      await JTBHelper.approveTarget(page, sessionId, targetId);
      
      // Verify target status updated to APPROVED
      await page.goto(`/smartops/target/${targetId}`);
      await AssertionHelper.verifyTargetStatus(page, 'APPROVED');
      
      // Verify JTB decision recorded
      await expect(page.locator('[data-testid="jtb-decision-recorded"]')).toBeVisible();
      await expect(page.locator('[data-testid="jtb-approval-rationale"]')).toBeVisible();
    });

    test('should handle TST rapid approval (<30 minutes)', async ({ page }) => {
      console.log('🚀 Testing: TST rapid approval workflow');
      
      // Create TST
      const targetId = await TargetHelper.createTarget(page, testTargets.tst);
      
      // Create emergency JTB session for TST
      const sessionId = await JTBHelper.createJTBSession(page, {
        date: '2026-01-23',
        time: '13:30',
        chair: 'LTC Mike Brown'
      });
      
      // Add TST to session
      await JTBHelper.addTargetToSession(page, sessionId, targetId);
      
      // Measure approval time
      const approvalStartTime = Date.now();
      
      // Rapid approval process
      await page.goto(`/smartops/jtb-session/${sessionId}`);
      await page.click(`[data-testid="tst-rapid-approve-${targetId}"]`);
      await page.fill('[data-testid="tst-approval-rationale"]', 'Time-sensitive target - immediate threat');
      await page.click('[data-testid="confirm-tst-approval"]');
      
      const approvalEndTime = Date.now();
      const approvalTime = (approvalEndTime - approvalStartTime) / 1000;
      
      // Verify rapid approval
      await expect(page.locator('[data-testid="tst-approval-success"]')).toBeVisible();
      
      console.log(`⏱️ TST approval time: ${approvalTime} seconds`);
      expect(approvalTime).toBeLessThan(30); // Must be under 30 seconds for test
    });
  });

  test.describe('Target Engagement Workflow', () => {
    test('should engage approved target and update status', async ({ page }) => {
      console.log('🎯 Testing: Target engagement');
      
      // Create, validate, and approve a target
      const targetId = await TargetHelper.createTarget(page, testTargets.hvt);
      
      // Simulate validation and approval (in real workflow, this would be done by J2/JTB)
      await TargetHelper.updateTargetStatus(page, targetId, 'VALIDATED');
      await TargetHelper.updateTargetStatus(page, targetId, 'APPROVED');
      
      // Navigate to weapons control for engagement
      await page.goto('/smartops/weapons-control');
      await page.waitForLoadState('networkidle');
      
      // Find approved target and engage
      await page.click(`[data-testid="engage-target-${targetId}"]`);
      
      // Fill engagement details
      await page.fill('[data-testid="weapon-system"]', 'F-35A');
      await page.fill('[data-testid="munition-type"]', 'GBU-12');
      await page.fill('[data-testid="engagement-time"]', new Date().toISOString());
      
      // Confirm engagement
      await page.click('[data-testid="confirm-engagement"]');
      
      // Verify engagement success
      await expect(page.locator('[data-testid="engagement-success"]')).toBeVisible();
      
      // Verify target status updated to ENGAGED
      await page.goto(`/smartops/target/${targetId}`);
      await AssertionHelper.verifyTargetStatus(page, 'ENGAGED');
      
      // Verify engagement details recorded
      await expect(page.locator('[data-testid="engagement-details"]')).toBeVisible();
    });

    test('should verify decision gates status before engagement', async ({ page }) => {
      console.log('🚦 Testing: Decision gates verification before engagement');
      
      // Create approved target
      const targetId = await TargetHelper.createTarget(page, testTargets.hvt);
      await TargetHelper.updateTargetStatus(page, targetId, 'APPROVED');
      
      // Navigate to engagement
      await page.goto('/smartops/weapons-control');
      await page.click(`[data-testid="engage-target-${targetId}"]`);
      
      // Verify decision gates are checked
      await expect(page.locator('[data-testid="decision-gates-check"]')).toBeVisible();
      
      // Verify all gates are GREEN for engagement
      await DecisionGatesHelper.verifyAllGatesVisible(page);
      await AssertionHelper.verifyDecisionGateStatus(page, 'roe', 'GREEN');
      await AssertionHelper.verifyDecisionGateStatus(page, 'cde', 'GREEN');
      await AssertionHelper.verifyDecisionGateStatus(page, 'weather', 'GREEN');
      await AssertionHelper.verifyDecisionGateStatus(page, 'deconfliction', 'GREEN');
      
      // Proceed with engagement
      await page.click('[data-testid="confirm-engagement"]');
      await expect(page.locator('[data-testid="engagement-success"]')).toBeVisible();
    });
  });

  test.describe('BDA Assessment Workflow', () => {
    test('should create BDA report for engaged target', async ({ page }) => {
      console.log('📊 Testing: BDA report creation');
      
      // Create and engage target
      const targetId = await TargetHelper.createTarget(page, testTargets.hvt);
      await TargetHelper.updateTargetStatus(page, targetId, 'ENGAGED');
      
      // Navigate to BDA workbench
      await NavigationHelper.goToBDAWorkbench(page);
      
      // Create BDA report
      const bdaId = await BDAHelper.createBDAReport(page, targetId, {
        strike_id: 'STRIKE-001',
        bda_status: 'ASSESSING',
        effectiveness_pct: 85,
        description: 'Target successfully destroyed with secondary explosions observed'
      });
      
      // Verify BDA report created
      await expect(page.locator('[data-testid="bda-success-message"]')).toBeVisible();
      
      // Upload BDA image
      await BDAHelper.uploadBDAImage(page, bdaId, 'test-assets/post-strike-image.jpg');
      
      // Complete BDA assessment
      await page.goto(`/smartops/bda/${bdaId}`);
      await page.click('[data-testid="complete-assessment"]');
      await page.selectOption('[data-testid="final-effectiveness"]', 'HIGH');
      await page.fill('[data-testid="assessment-summary"]', 'Target destroyed, mission accomplished');
      await page.click('[data-testid="submit-final-assessment"]');
      
      // Verify BDA completed
      await expect(page.locator('[data-testid="bda-completed"]')).toBeVisible();
      
      // Verify target status updated to ASSESSED
      await page.goto(`/smartops/target/${targetId}`);
      await AssertionHelper.verifyTargetStatus(page, 'ASSESSED');
    });

    test('should handle re-attack recommendation for partial success', async ({ page }) => {
      console.log('🔄 Testing: Re-attack recommendation for partial BDA');
      
      // Create and engage target
      const targetId = await TargetHelper.createTarget(page, testTargets.standard);
      await TargetHelper.updateTargetStatus(page, targetId, 'ENGAGED');
      
      // Create BDA with partial success
      const bdaId = await BDAHelper.createBDAReport(page, targetId, {
        strike_id: 'STRIKE-002',
        bda_status: 'COMPLETE',
        effectiveness_pct: 40,
        description: 'Target damaged but still functional'
      });
      
      // Complete assessment with re-attack recommendation
      await page.goto(`/smartops/bda/${bdaId}`);
      await page.click('[data-testid="complete-assessment"]');
      await page.selectOption('[data-testid="final-effectiveness"]', 'LOW');
      await page.check('[data-testid="recommend-reattack"]');
      await page.fill('[data-testid="reattack-rationale"]', 'Target still operational, re-attack recommended');
      await page.click('[data-testid="submit-final-assessment"]');
      
      // Verify re-attack recommendation created
      await expect(page.locator('[data-testid="reattack-recommendation-created"]')).toBeVisible();
      
      // Verify target returned to APPROVED status for re-attack
      await page.goto(`/smartops/target/${targetId}`);
      await AssertionHelper.verifyTargetStatus(page, 'APPROVED');
      await expect(page.locator('[data-testid="reattack-flag"]')).toBeVisible();
    });
  });

  test.describe('Complete Target Lifecycle End-to-End', () => {
    test('should complete full target lifecycle: Nomination → Assessment', async ({ page }) => {
      console.log('🎯 Testing: Complete target lifecycle workflow');
      
      // Step 1: Nominate target
      const targetId = await TargetHelper.createTarget(page, testTargets.hvt);
      await AssertionHelper.verifyTargetStatus(page, 'NOMINATED');
      
      // Step 2: Validate target (J2 workflow)
      await page.addInitScript(() => {
        window.localStorage.setItem('user_role', 'J2_OFFICER');
      });
      await page.goto(`/smartops/target/${targetId}`);
      await page.click('[data-testid="validate-target-button"]');
      await page.fill('[data-testid="validation-rationale"]', 'Target confirmed through multiple intelligence sources');
      await page.click('[data-testid="confirm-validation"]');
      await AssertionHelper.verifyTargetStatus(page, 'VALIDATED');
      
      // Step 3: Approve target (JTB workflow)
      await page.addInitScript(() => {
        window.localStorage.setItem('user_role', 'JTB_CHAIR');
      });
      const sessionId = await JTBHelper.createJTBSession(page);
      await JTBHelper.addTargetToSession(page, sessionId, targetId);
      await JTBHelper.approveTarget(page, sessionId, targetId);
      await AssertionHelper.verifyTargetStatus(page, 'APPROVED');
      
      // Step 4: Engage target
      await page.addInitScript(() => {
        window.localStorage.setItem('user_role', 'WEAPONS_OFFICER');
      });
      await page.goto('/smartops/weapons-control');
      await page.click(`[data-testid="engage-target-${targetId}"]`);
      await page.fill('[data-testid="weapon-system"]', 'F-35A');
      await page.fill('[data-testid="munition-type"]', 'GBU-12');
      await page.click('[data-testid="confirm-engagement"]');
      await AssertionHelper.verifyTargetStatus(page, 'ENGAGED');
      
      // Step 5: Assess BDA
      await page.addInitScript(() => {
        window.localStorage.setItem('user_role', 'BDA_ANALYST');
      });
      const bdaId = await BDAHelper.createBDAReport(page, targetId, {
        strike_id: 'STRICE-001',
        effectiveness_pct: 90,
        description: 'Target destroyed successfully'
      });
      await page.goto(`/smartops/bda/${bdaId}`);
      await page.click('[data-testid="complete-assessment"]');
      await page.selectOption('[data-testid="final-effectiveness"]', 'HIGH');
      await page.click('[data-testid="submit-final-assessment"]');
      
      // Step 6: Verify final status
      await page.goto(`/smartops/target/${targetId}`);
      await AssertionHelper.verifyTargetStatus(page, 'ASSESSED');
      
      // Verify complete lifecycle recorded
      await expect(page.locator('[data-testid="lifecycle-complete"]')).toBeVisible();
      await expect(page.locator('[data-testid="target-timeline"]')).toBeVisible();
      
      console.log('✅ Complete target lifecycle workflow successful');
    });

    test('should meet performance benchmarks for complete lifecycle', async ({ page }) => {
      console.log('⚡ Testing: Complete lifecycle performance');
      
      const lifecycleStartTime = Date.now();
      
      // Execute complete lifecycle (streamlined version)
      const targetId = await TargetHelper.createTarget(page, testTargets.standard);
      await TargetHelper.updateTargetStatus(page, targetId, 'VALIDATED');
      await TargetHelper.updateTargetStatus(page, targetId, 'APPROVED');
      await TargetHelper.updateTargetStatus(page, targetId, 'ENGAGED');
      
      const bdaId = await BDAHelper.createBDAReport(page, targetId, {
        strike_id: 'PERF-STRIKE-001',
        effectiveness_pct: 85
      });
      
      const lifecycleEndTime = Date.now();
      const lifecycleTime = lifecycleEndTime - lifecycleStartTime;
      
      console.log(`📊 Complete lifecycle time: ${lifecycleTime}ms`);
      
      // Verify performance is within acceptable limits
      expect(lifecycleTime).toBeLessThan(30000); // 30 seconds for complete lifecycle
    });
  });

  test.describe('Error Handling and Edge Cases', () => {
    test('should handle API failures gracefully', async ({ page }) => {
      console.log('🚨 Testing: API failure handling');
      
      // Mock API failure
      await page.route('**/api/targeting/targets', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal server error' })
        });
      });
      
      await NavigationHelper.goToTargetNomination(page);
      await page.fill('[data-testid="target-name"]', 'ERROR-TEST-001');
      await page.click('[data-testid="submit-nomination"]');
      
      // Verify error handling
      await expect(page.locator('[data-testid="api-error-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="api-error-message"]')).toContainText('Failed to create target');
    });

    test('should handle network timeouts', async ({ page }) => {
      console.log('⏱️ Testing: Network timeout handling');
      
      // Mock network timeout
      await page.route('**/api/targeting/targets', route => {
        // Don't respond to simulate timeout
        setTimeout(() => {
          route.fulfill({
            status: 408,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Request timeout' })
          });
        }, 35000);
      });
      
      await NavigationHelper.goToTargetNomination(page);
      await page.fill('[data-testid="target-name"]', 'TIMEOUT-TEST-001');
      await page.click('[data-testid="submit-nomination"]');
      
      // Verify timeout handling
      await expect(page.locator('[data-testid="timeout-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
    });

    test('should handle concurrent target creation', async ({ page }) => {
      console.log('🔄 Testing: Concurrent target creation');
      
      // Create multiple targets rapidly
      const targetPromises = [];
      for (let i = 0; i < 3; i++) {
        targetPromises.push(
          TargetHelper.createTarget(page, {
            name: `CONCURRENT-${i + 1}`,
            type: 'STANDARD',
            coordinates: `31.${7683 + i}N, 35.${2137 + i}E`,
            description: `Concurrent test target ${i + 1}`
          })
        );
      }
      
      const targetIds = await Promise.all(targetPromises);
      
      // Verify all targets created successfully
      expect(targetIds).toHaveLength(3);
      
      // Verify targets appear in dashboard
      await NavigationHelper.goToTargetingDashboard(page);
      for (let i = 0; i < 3; i++) {
        await expect(page.locator(`text=CONCURRENT-${i + 1}`)).toBeVisible();
      }
    });
  });
});