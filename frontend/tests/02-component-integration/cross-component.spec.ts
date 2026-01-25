// Cross-Component Workflow E2E Tests
// Tests for workflows that span multiple NATO COPD components

import { test, expect } from '@playwright/test';
import { 
  NavigationHelper, 
  TargetHelper, 
  JTBHelper,
  BDAHelper,
  DecisionGatesHelper,
  AssertionHelper,
  PerformanceHelper
} from '../helpers/testHelpers';
import { testTargets, testUsers } from '../fixtures/testData';

test.describe('Cross-Component Workflows', () => {
  
  test('should validate target based on intelligence reports', async ({ page }) => {
    console.log('🔍 Testing: Intelligence to Target Validation');
    
    // Set up J2 Intelligence Officer role
    await page.addInitScript(() => {
      window.localStorage.setItem('auth_token', 'test-token-j2');
      window.localStorage.setItem('user_role', 'J2_OFFICER');
      window.localStorage.setItem('user_clearance', 'SECRET');
    });
    
    // Step 1: Create intelligence report
    await page.goto('/smartops/intelligence');
    await page.click('[data-testid="create-intel-report"]');
    await page.fill('[data-testid="intel-source"]', 'SIGINT');
    await page.fill('[data-testid="intel-reliability"]', 'A');
    await page.fill('[data-testid="target-location"]', '31.7683N, 35.2137E');
    await page.fill('[data-testid="intel-description"]', 'Confirmed enemy command center');
    await page.click('[data-testid="submit-intel-report"]');
    
    // Get intel report ID
    const intelId = await page.locator('[data-testid="intel-id"]').textContent();
    
    // Step 2: Navigate to target nomination
    await NavigationHelper.goToTargetNomination(page);
    await page.fill('[data-testid="target-name"]', 'INTEL-VALIDATED-001');
    await page.selectOption('[data-testid="target-type"]', 'HVT');
    await page.fill('[data-testid="target-coordinates"]', '31.7683N, 35.2137E');
    
    // Step 3: Link intelligence report to target
    await page.click('[data-testid="link-intel-report"]');
    await page.selectOption('[data-testid="intel-report-select"]', intelId);
    await page.click('[data-testid="confirm-intel-link"]');
    
    // Step 4: Submit target nomination
    await page.click('[data-testid="submit-nomination"]');
    const targetId = await page.locator('[data-testid="target-id"]').textContent();
    
    // Step 5: Verify target shows intelligence link
    await page.goto(`/smartops/target/${targetId}`);
    await expect(page.locator('[data-testid="linked-intel-reports"]')).toBeVisible();
    await expect(page.locator('[data-testid="intel-source-badge"]')).toHaveText('SIGINT');
    await expect(page.locator('[data-testid="intel-reliability-score"]')).toHaveText('A');
    
    // Step 6: Verify intelligence panel shows target
    await page.goto('/smartops/intelligence');
    await expect(page.locator(`[data-testid="intel-target-${targetId}"]`)).toBeVisible();
  });

  test('should reject target with conflicting intelligence', async ({ page }) => {
    console.log('❌ Testing: Conflicting Intelligence Detection');
    
    // Set up J2 role
    await page.addInitScript(() => {
      window.localStorage.setItem('auth_token', 'test-token-j2');
      window.localStorage.setItem('user_role', 'J2_OFFICER');
      window.localStorage.setItem('user_clearance', 'SECRET');
    });
    
    // Create conflicting intelligence
    await page.goto('/smartops/intelligence');
    await page.click('[data-testid="create-intel-report"]');
    await page.fill('[data-testid="intel-source"]', 'HUMINT-1');
    await page.fill('[data-testid="target-location"]', '31.7683N, 35.2137E');
    await page.fill('[data-testid="intel-description"]', 'No target at location - empty building');
    await page.click('[data-testid="submit-intel-report"]');
    
    // Create target at same location
    await TargetHelper.createTarget(page, {
      name: 'CONFLICT-001',
      type: 'HVT',
      coordinates: '31.7683N, 35.2137E',
      description: 'Enemy command center'
    });
    
    // Navigate to intelligence integration panel
    await page.goto('/smartops/intelligence');
    await page.click('[data-testid="view-conflicts"]');
    
    // Verify conflict detected
    await expect(page.locator('[data-testid="intel-conflict-warning"]')).toBeVisible();
    await expect(page.locator('[data-testid="conflict-reason"]')).toContainText('Conflicting intelligence sources');
    
    // Verify target flagged for review
    await page.goto('/smartops/targeting-cell-dashboard');
    await expect(page.locator('[data-testid="target-CONFLICT-001"]')).toHaveText('NEEDS REVIEW');
    await expect(page.locator('[data-testid="conflict-badge"]')).toBeVisible();
  });

  test('should complete weapons release to BDA assessment workflow', async ({ page }) => {
    console.log('💥 Testing: Weapons Release → BDA Assessment');
    
    // Step 1: Create and approve target (as JTB Chair)
    await page.addInitScript(() => {
      window.localStorage.setItem('auth_token', 'test-token-jtb-chair');
      window.localStorage.setItem('user_role', 'JTB_CHAIR');
      window.localStorage.setItem('user_clearance', 'SECRET');
    });
    
    const targetId = await TargetHelper.createTarget(page, testTargets.hvt);
    await TargetHelper.updateTargetStatus(page, targetId, 'APPROVED');
    
    // Step 2: Engage target (as Weapons Officer)
    await page.addInitScript(() => {
      window.localStorage.setItem('user_role', 'WEAPONS_OFFICER');
    });
    
    await page.goto('/smartops/weapons-control');
    await page.click(`[data-testid="engage-target-${targetId}"]`);
    await page.fill('[data-testid="weapon-system"]', 'F-35A');
    await page.fill('[data-testid="munition-type"]', 'GBU-12');
    await page.fill('[data-testid="engagement-time"]', new Date().toISOString());
    await page.click('[data-testid="confirm-engagement"]');
    
    const strikeId = await page.locator('[data-testid="strike-id"]').textContent();
    
    // Verify target status updated
    await expect(page.locator(`[data-testid="target-status-${targetId}"]`)).toHaveText('ENGAGED');
    
    // Step 3: Create BDA report (as BDA Analyst)
    await page.addInitScript(() => {
      window.localStorage.setItem('user_role', 'BDA_ANALYST');
    });
    
    await NavigationHelper.goToBDAWorkbench(page);
    
    // Step 4: Verify BDA shows engaged target with strike details
    await expect(page.locator(`[data-testid="target-${targetId}-in-bda"]`)).toBeVisible();
    await page.click(`[data-testid="create-bda-for-${targetId}"]`);
    
    // Step 5: Verify pre-filled strike information
    await expect(page.locator('[data-testid="target-select"]')).toHaveValue(targetId);
    await expect(page.locator('[data-testid="strike-id"]')).toHaveValue(strikeId);
    
    // Step 6: Complete BDA
    await page.selectOption('[data-testid="bda-status"]', 'ASSESSING');
    await page.fill('[data-testid="effectiveness-pct"]', '85');
    await page.fill('[data-testid="bda-description"]', 'Target successfully engaged, secondary explosions observed');
    await page.click('[data-testid="submit-bda"]');
    
    const bdaId = await page.locator('[data-testid="bda-id"]').textContent();
    
    // Step 7: Complete assessment
    await page.goto(`/smartops/bda/${bdaId}`);
    await page.click('[data-testid="complete-assessment"]');
    await page.selectOption('[data-testid="final-effectiveness"]', 'HIGH');
    await page.click('[data-testid="submit-final-assessment"]');
    
    // Step 8: Verify complete workflow end-to-end
    await page.goto(`/smartops/target/${targetId}`);
    await AssertionHelper.verifyTargetStatus(page, 'ASSESSED');
    
    // Verify timeline shows complete workflow
    await page.click('[data-testid="view-timeline"]');
    await expect(page.locator('[data-testid="timeline-nominated"]')).toBeVisible();
    await expect(page.locator('[data-testid="timeline-approved"]')).toBeVisible();
    await expect(page.locator('[data-testid="timeline-engaged"]')).toBeVisible();
    await expect(page.locator('[data-testid="timeline-assessed"]')).toBeVisible();
  });

  test('should update target status based on real-time intelligence', async ({ page }) => {
    console.log('📡 Testing: Real-time Intelligence Updates');
    
    // Set up J2 role
    await page.addInitScript(() => {
      window.localStorage.setItem('auth_token', 'test-token-j2');
      window.localStorage.setItem('user_role', 'J2_OFFICER');
      window.localStorage.setItem('user_clearance', 'SECRET');
    });
    
    // Create target
    const targetId = await TargetHelper.createTarget(page, {
      name: 'REALTIME-001',
      type: 'TST',
      priority: 'TIME_CRITICAL',
      coordinates: '31.7500N, 35.2000E',
      tst_deadline: new Date(Date.now() + 30 * 60 * 1000)
    });
    
    // Navigate to intelligence panel
    await page.goto('/smartops/intelligence');
    
    // Simulate real-time intelligence update
    await page.click('[data-testid="add-realtime-intel"]');
    await page.fill('[data-testid="target-select"]', targetId);
    await page.fill('[data-testid="intel-update"]', 'Target location confirmed, preparing for strike');
    await page.fill('[data-testid="confidence-level"]', 'HIGH');
    await page.click('[data-testid="submit-intel-update"]');
    
    // Verify target status updated in real-time
    await page.goto('/smartops/targeting-cell-dashboard');
    
    // Wait for auto-refresh (30s)
    await page.waitForTimeout(35000);
    
    // Verify target shows updated intelligence
    await expect(page.locator(`[data-testid="target-${targetId}"]`)).toContainText('HIGH CONFIDENCE');
    await expect(page.locator('[data-testid="intel-updated-badge"]')).toBeVisible();
    
    // Verify alternative analysis panel reflects new intelligence
    await page.goto('/smartops/alternative-analysis');
    await expect(page.locator(`[data-testid="target-${targetId}-confidence"]`)).toHaveText('HIGH');
  });

  test('should verify data consistency across all components after status change', async ({ page }) => {
    console.log('✅ Testing: Component Data Consistency');
    
    // Set up JTB chair role
    await page.addInitScript(() => {
      window.localStorage.setItem('auth_token', 'test-token-jtb-chair');
      window.localStorage.setItem('user_role', 'JTB_CHAIR');
      window.localStorage.setItem('user_clearance', 'SECRET');
    });
    
    // Create and validate target
    const targetId = await TargetHelper.createTarget(page, {
      name: 'CONSISTENCY-001',
      type: 'HVT',
      priority: 'CRITICAL'
    });
    
    await TargetHelper.updateTargetStatus(page, targetId, 'VALIDATED');
    
    // Verify status consistent across all components
    
    // Component 1: Target List
    await NavigationHelper.goToTargetingDashboard(page);
    await expect(page.locator(`[data-testid="target-${targetId}-status"]`)).toHaveText('VALIDATED');
    
    // Component 2: Intelligence Panel
    await page.goto('/smartops/intelligence');
    await expect(page.locator(`[data-testid="linked-target-${targetId}-status"]`)).toHaveText('VALIDATED');
    
    // Component 3: Risk Monitor
    await page.goto('/smartops/risk-monitor');
    await expect(page.locator(`[data-testid="target-${targetId}-risk-badge"]`)).toBeVisible();
    await expect(page.locator(`[data-testid="target-${targetId}-status"]`)).toHaveText('VALIDATED');
    
    // Component 4: Asset Management
    await page.goto('/smartops/asset-management');
    await expect(page.locator(`[data-testid="target-${targetId}-in-assets"]`)).toHaveText('VALIDATED');
    
    // Component 5: JTB Session
    await page.goto('/smartops/jtb-session');
    await expect(page.locator(`[data-testid="target-${targetId}-in-jtb-status"]`)).toHaveText('VALIDATED');
    
    // Approve target and verify consistency again
    await JTBHelper.approveTarget(page, targetId, targetId);
    
    // Component 1: Target List
    await NavigationHelper.goToTargetingDashboard(page);
    await expect(page.locator(`[data-testid="target-${targetId}-status"]`)).toHaveText('APPROVED');
    
    // Component 2: Intelligence Panel
    await page.goto('/smartops/intelligence');
    await expect(page.locator(`[data-testid="linked-target-${targetId}-status"]`)).toHaveText('APPROVED');
    
    // Component 3: Risk Monitor
    await page.goto('/smartops/risk-monitor');
    await expect(page.locator(`[data-testid="target-${targetId}-status"]`)).toHaveText('APPROVED');
    
    // Component 4: Effects Assessment
    await page.goto('/smartops/effects-assessment');
    await expect(page.locator(`[data-testid="target-${targetId}-status"]`)).toHaveText('APPROVED');
    
    // Component 5: Decision Gates
    await page.goto('/smartops/decision-gates');
    await expect(page.locator(`[data-testid="target-${targetId}-decision-gate-status"]`)).toBeVisible();
  });

  test('should measure performance of cross-component workflow', async ({ page }) => {
    console.log('⚡ Testing: Cross-Component Workflow Performance');
    
    // Set up user
    await page.addInitScript(() => {
      window.localStorage.setItem('auth_token', 'test-token');
      window.localStorage.setItem('user_role', 'TARGETEER');
      window.localStorage.setItem('user_clearance', 'SECRET');
    });
    
    const workflowStartTime = Date.now();
    
    // Step 1: Create target
    const createStartTime = Date.now();
    const targetId = await TargetHelper.createTarget(page, {
      name: 'PERF-001',
      type: 'STANDARD'
    });
    const createTime = Date.now() - createStartTime;
    console.log(`Target creation: ${createTime}ms`);
    expect(createTime).toBeLessThan(3000); // 3 seconds
    
    // Step 2: Navigate to intelligence panel
    const intelNavStartTime = Date.now();
    await page.goto('/smartops/intelligence');
    await page.waitForLoadState('networkidle');
    const intelNavTime = Date.now() - intelNavStartTime;
    console.log(`Intelligence nav: ${intelNavTime}ms`);
    expect(intelNavTime).toBeLessThan(2000); // 2 seconds
    
    // Step 3: Navigate to risk monitor
    const riskNavStartTime = Date.now();
    await page.goto('/smartops/risk-monitor');
    await page.waitForLoadState('networkidle');
    const riskNavTime = Date.now() - riskNavStartTime;
    console.log(`Risk nav: ${riskNavTime}ms`);
    expect(riskNavTime).toBeLessThan(2000); // 2 seconds
    
    // Step 4: Navigate to decision gates
    const gatesNavStartTime = Date.now();
    await page.goto('/smartops/decision-gates');
    await page.waitForLoadState('networkidle');
    const gatesNavTime = Date.now() - gatesNavStartTime;
    console.log(`Decision gates nav: ${gatesNavTime}ms`);
    expect(gatesNavTime).toBeLessThan(2000); // 2 seconds
    
    const workflowEndTime = Date.now();
    const totalWorkflowTime = workflowEndTime - workflowStartTime;
    
    console.log(`Total workflow time: ${totalWorkflowTime}ms`);
    expect(totalWorkflowTime).toBeLessThan(15000); // 15 seconds total
  });
});