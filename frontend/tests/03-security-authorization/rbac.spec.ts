// Security & Authorization E2E Tests - Role-Based Access Control
// Tests for role-based access control enforcement

import { test, expect } from '@playwright/test';
import { 
  NavigationHelper, 
  TargetHelper, 
  JTBHelper,
  AssertionHelper
} from '../helpers/testHelpers';
import { testTargets, testUsers } from '../fixtures/testData';

test.describe('Security & Authorization - Role-Based Access Control', () => {
  
  test('should restrict target creation to authorized roles only', async ({ page }) => {
    console.log('👥 Testing: Target creation role restriction');
    
    // Set up user with READ_ONLY role (cannot create targets)
    await page.addInitScript(() => {
      window.localStorage.setItem('auth_token', 'test-token-readonly');
      window.localStorage.setItem('user_role', 'READ_ONLY');
      window.localStorage.setItem('user_clearance', 'SECRET');
    });
    
    // Navigate to target nomination page
    await NavigationHelper.goToTargetNomination(page);
    
    // Verify create target button is disabled or hidden
    await expect(page.locator('[data-testid="nominate-target-button"]')).toBeDisabled();
    
    // Verify form is not accessible
    await expect(page.locator('[data-testid="target-nomination-form"]')).not.toBeVisible();
    
    // Verify access denied message
    await expect(page.locator('[data-testid="permission-denied-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="permission-denied-message"]')).toContainText('insufficient permissions');
  });

  test('should allow target creation for authorized roles', async ({ page }) => {
    console.log('✅ Testing: Target creation authorized role');
    
    // Set up user with TARGETEER role (can create targets)
    await page.addInitScript(() => {
      window.localStorage.setItem('auth_token', 'test-token-targeteer');
      window.localStorage.setItem('user_role', 'TARGETEER');
      window.localStorage.setItem('user_clearance', 'SECRET');
    });
    
    // Create target successfully
    const targetId = await TargetHelper.createTarget(page, {
      name: 'TARGET-CREATED-001',
      type: 'STANDARD',
      priority: 'MEDIUM'
    });
    
    // Verify target created
    await page.goto(`/smartops/target/${targetId}`);
    await expect(page.locator(`[data-testid="target-name"]`)).toHaveText('TARGET-CREATED-001');
  });

  test('should restrict JTB session creation to JTB_CHAIR only', async ({ page }) => {
    console.log('🏛️ Testing: JTB session creation role restriction');
    
    // Set up user with TARGETEER role (cannot create JTB sessions)
    await page.addInitScript(() => {
      window.localStorage.setItem('auth_token', 'test-token-targeteer');
      window.localStorage.setItem('user_role', 'TARGETEER');
      window.localStorage.setItem('user_clearance', 'SECRET');
    });
    
    // Navigate to JTB sessions page
    await NavigationHelper.goToJTBSession(page);
    
    // Verify create session button is disabled
    await expect(page.locator('[data-testid="create-jtb-session"]')).toBeDisabled();
    
    // Try to access create session directly (should be blocked)
    await page.goto('/smartops/jtb/create-session');
    
    // Verify access denied
    await expect(page.locator('[data-testid="permission-denied-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="permission-denied-message"]')).toContainText('JTB chair authorization required');
  });

  test('should allow JTB session creation for JTB_CHAIR role', async ({ page }) => {
    console.log('✅ Testing: JTB session creation authorized role');
    
    // Set up user with JTB_CHAIR role
    await page.addInitScript(() => {
      window.localStorage.setItem('auth_token', 'test-token-jtb-chair');
      window.localStorage.setItem('user_role', 'JTB_CHAIR');
      window.localStorage.setItem('user_clearance', 'SECRET');
    });
    
    // Create JTB session successfully
    const sessionId = await JTBHelper.createJTBSession(page, {
      date: '2026-01-24',
      time: '14:00',
      chair: 'LTC Mike Brown'
    });
    
    // Verify session created
    await page.goto(`/smartops/jtb-session/${sessionId}`);
    await expect(page.locator('[data-testid="jtb-session-view"]')).toBeVisible();
  });

  test('should restrict target approval to JTB_CHAIR and COMMANDER only', async ({ page }) => {
    console.log('🚫 Testing: Target approval role restriction');
    
    // Set up user with TARGETEER role (cannot approve targets)
    await page.addInitScript(() => {
      window.localStorage.setItem('auth_token', 'test-token-targeteer');
      window.localStorage.setItem('user_role', 'TARGETEER');
      window.localStorage.setItem('user_clearance', 'SECRET');
    });
    
    // Create and validate target
    const targetId = await TargetHelper.createTarget(page, testTargets.standard);
    await TargetHelper.updateTargetStatus(page, targetId, 'VALIDATED');
    
    // Navigate to target detail
    await page.goto(`/smartops/target/${targetId}`);
    
    // Verify approve button is disabled or hidden
    await expect(page.locator('[data-testid="approve-target-button"]')).toBeDisabled();
    
    // Verify cannot access approval workflow
    await page.goto(`/smartops/jtb/approve/${targetId}`);
    await expect(page.locator('[data-testid="permission-denied-message"]')).toBeVisible();
  });

  test('should allow target approval for JTB_CHAIR role', async ({ page }) => {
    console.log('✅ Testing: Target approval authorized role');
    
    // Set up user with JTB_CHAIR role
    await page.addInitScript(() => {
      window.localStorage.setItem('auth_token', 'test-token-jtb-chair');
      window.localStorage.setItem('user_role', 'JTB_CHAIR');
      window.localStorage.setItem('user_clearance', 'SECRET');
    });
    
    // Create and validate target
    const targetId = await TargetHelper.createTarget(page, testTargets.standard);
    await TargetHelper.updateTargetStatus(page, targetId, 'VALIDATED');
    
    // Create JTB session
    const sessionId = await JTBHelper.createJTBSession(page);
    await JTBHelper.addTargetToSession(page, sessionId, targetId);
    
    // Approve target successfully
    await JTBHelper.approveTarget(page, sessionId, targetId);
    
    // Verify target approved
    await expect(page.locator(`[data-testid="target-status-${targetId}"]`)).toHaveText('APPROVED');
  });

  test('should prevent role escalation via direct URL access', async ({ page }) => {
    console.log('🛡️ Testing: Role escalation prevention');
    
    // Set up user with READ_ONLY role
    await page.addInitScript(() => {
      window.localStorage.setItem('auth_token', 'test-token-readonly');
      window.localStorage.setItem('user_role', 'READ_ONLY');
      window.localStorage.setItem('user_clearance', 'SECRET');
    });
    
    // Try to access admin pages directly via URL
    await page.goto('/smartops/admin/users');
    
    // Verify access denied
    await expect(page.locator('[data-testid="permission-denied-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="permission-denied-message"]')).toContainText('unauthorized access');
    
    // Try to access audit log
    await page.goto('/smartops/audit-log');
    await expect(page.locator('[data-testid="permission-denied-message"]')).toBeVisible();
    
    // Verify no admin actions can be performed
    await page.goto('/smartops/admin/config');
    await expect(page.locator('[data-testid="permission-denied-message"]')).toBeVisible();
  });

  test('should enforce role-specific action restrictions', async ({ page }) => {
    console.log('🎯 Testing: Role-specific action restrictions');
    
    // Test TARGETEER role actions
    await page.addInitScript(() => {
      window.localStorage.setItem('auth_token', 'test-token-targeteer');
      window.localStorage.setItem('user_role', 'TARGETEER');
      window.localStorage.setItem('user_clearance', 'SECRET');
    });
    
    const targetId = await TargetHelper.createTarget(page, testTargets.standard);
    
    await page.goto(`/smartops/target/${targetId}`);
    
    // TARGETEER can:
    await expect(page.locator('[data-testid="edit-target-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="update-status-button"]')).toBeVisible();
    
    // TARGETEER cannot:
    await expect(page.locator('[data-testid="approve-target-button"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="engage-target-button"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="delete-target-button"]')).not.toBeVisible();
  });

  test('should log unauthorized access attempts for RBAC violations', async ({ page }) => {
    console.log('📝 Testing: RBAC violation audit logging');
    
    // Set up user with READ_ONLY role
    await page.addInitScript(() => {
      window.localStorage.setItem('auth_token', 'test-token-readonly');
      window.localStorage.setItem('user_role', 'READ_ONLY');
      window.localStorage.setItem('user_clearance', 'SECRET');
    });
    
    // Attempt to access JTB sessions (should be denied)
    await page.goto('/smartops/jtb/create-session');
    
    // Verify access denied
    await expect(page.locator('[data-testid="permission-denied-message"]')).toBeVisible();
    
    // Check audit log for RBAC violation
    await page.goto('/smartops/audit-log');
    
    // Note: This would require admin role to view, so we'll verify the logging mechanism
    // by checking that the access attempt was recorded
    await page.fill('[data-testid="audit-log-search"]', 'RBAC_VIOLATION');
    await page.click('[data-testid="search-audit-log"]');
    
    // Verify violation entry exists
    await expect(page.locator('[data-testid="audit-entry"]')).toContainText('RBAC_VIOLATION');
  });

  test('should handle concurrent role changes gracefully', async ({ page }) => {
    console.log('🔄 Testing: Concurrent role changes');
    
    // Set up user with TARGETEER role
    await page.addInitScript(() => {
      window.localStorage.setItem('auth_token', 'test-token-targeteer');
      window.localStorage.setItem('user_role', 'TARGETEER');
      window.localStorage.setItem('user_clearance', 'SECRET');
    });
    
    const targetId = await TargetHelper.createTarget(page, testTargets.standard);
    
    // User can access target
    await page.goto(`/smartops/target/${targetId}`);
    await expect(page.locator('[data-testid="target-view"]')).toBeVisible();
    
    // Simulate role change to READ_ONLY (in real scenario, would happen via admin or timeout)
    await page.addInitScript(() => {
      window.localStorage.setItem('user_role', 'READ_ONLY');
    });
    
    // Reload page with new role
    await page.reload();
    
    // Verify access denied now
    await expect(page.locator('[data-testid="permission-denied-message"]')).toBeVisible();
  });
});