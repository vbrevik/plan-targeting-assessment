// Security & Authorization E2E Tests
// Tests for classification enforcement and role-based access control

import { test, expect } from '@playwright/test';
import {
  NavigationHelper,
  TargetHelper,
  JTBHelper,
  AssertionHelper
} from '../helpers/testHelpers';
import { testTargets, testUsers } from '../fixtures/testData';

test.describe('Security & Authorization - Classification Enforcement', () => {

  test('should enforce classification level - SECRET data only accessible to SECRET clearance', async ({ page }) => {
    console.log('🔒 Testing: SECRET classification enforcement');

    // Set up user with CONFIDENTIAL clearance
    await page.addInitScript(() => {
      window.localStorage.setItem('auth_token', 'test-token-confidential');
      window.localStorage.setItem('user_role', 'TARGETEER');
      window.localStorage.setItem('user_clearance', 'CONFIDENTIAL');
    });

    // Navigate to targeting dashboard
    await NavigationHelper.goToTargetingDashboard(page);

    // Create a SECRET target
    const secretTargetId = await TargetHelper.createTarget(page, {
      name: 'SECRET-TARGET-001',
      type: 'HVT',
      priority: 'CRITICAL',
      coordinates: '31.7683N, 35.2137E',
      description: 'SECRET - Enemy command center',
      classification: 'SECRET'
    });

    // Verify SECRET target is hidden or shows restricted access
    await page.goto(`/smartops/target/${secretTargetId}`);

    // User should see access denied warning
    await expect(page.locator('[data-testid="access-denied-warning"]')).toBeVisible();
    await expect(page.locator('[data-testid="access-denied-warning"]')).toContainText('clearance required');

    // Verify sensitive data is masked
    await expect(page.locator('[data-testid="target-description"]')).toHaveText('REDACTED');
    await expect(page.locator('[data-testid="target-coordinates"]')).toHaveText('REDACTED');
  });

  test('should allow SECRET clearance access to classified data', async ({ page }) => {
    console.log('✅ Testing: SECRET clearance access');

    // Set up user with SECRET clearance
    await page.addInitScript(() => {
      window.localStorage.setItem('auth_token', 'test-token-secret');
      window.localStorage.setItem('user_role', 'TARGETEER');
      window.localStorage.setItem('user_clearance', 'SECRET');
    });

    // Create a SECRET target
    const secretTargetId = await TargetHelper.createTarget(page, {
      name: 'SECRET-TARGET-002',
      type: 'HVT',
      priority: 'CRITICAL',
      coordinates: '31.7683N, 35.2137E',
      description: 'SECRET - Enemy command center',
      classification: 'SECRET'
    });

    // Navigate to target detail
    await page.goto(`/smartops/target/${secretTargetId}`);

    // Verify user can see SECRET data
    await expect(page.locator('[data-testid="target-description"]')).toHaveText('SECRET - Enemy command center');
    await expect(page.locator('[data-testid="target-coordinates"]')).toHaveText('31.7683N, 35.2137E');

    // Verify classification badge displayed
    await expect(page.locator('[data-testid="classification-badge"]')).toHaveText('SECRET');
  });

  test('should filter DTL entries based on user clearance', async ({ page }) => {
    console.log('🔍 Testing: DTL clearance filtering');

    // Set up user with CONFIDENTIAL clearance
    await page.addInitScript(() => {
      window.localStorage.setItem('auth_token', 'test-token-confidential');
      window.localStorage.setItem('user_role', 'TARGETEER');
      window.localStorage.setItem('user_clearance', 'CONFIDENTIAL');
    });

    // Create targets with different classifications
    await TargetHelper.createTarget(page, {
      name: 'UNCLASS-TARGET-001',
      type: 'STANDARD',
      classification: 'UNCLASSIFIED'
    });

    await TargetHelper.createTarget(page, {
      name: 'CONFIDENTIAL-TARGET-001',
      type: 'STANDARD',
      classification: 'CONFIDENTIAL'
    });

    await TargetHelper.createTarget(page, {
      name: 'SECRET-TARGET-003',
      type: 'STANDARD',
      classification: 'SECRET'
    });

    // Navigate to DTL
    await NavigationHelper.goToTargetingDashboard(page);

    // Verify only UNCLASSIFIED and CONFIDENTIAL targets are visible
    await expect(page.locator('text=UNCLASS-TARGET-001')).toBeVisible();
    await expect(page.locator('text=CONFIDENTIAL-TARGET-001')).toBeVisible();

    // SECRET target should be hidden
    await expect(page.locator('text=SECRET-TARGET-003')).not.toBeVisible();

    // Verify secret target count indicator
    await expect(page.locator('[data-testid="secret-targets-hidden"]')).toBeVisible();
    await expect(page.locator('[data-testid="secret-targets-hidden"]')).toContainText('1');
  });

  test('should prevent downgrade of target classification', async ({ page }) => {
    console.log('🚫 Testing: Classification downgrade prevention');

    // Set up user with SECRET clearance
    await page.addInitScript(() => {
      window.localStorage.setItem('auth_token', 'test-token-secret');
      window.localStorage.setItem('user_role', 'TARGETEER');
      window.localStorage.setItem('user_clearance', 'SECRET');
    });

    // Create a SECRET target
    const targetId = await TargetHelper.createTarget(page, {
      name: 'SECRET-TARGET-004',
      type: 'HVT',
      classification: 'SECRET'
    });

    // Attempt to downgrade classification to CONFIDENTIAL
    await page.goto(`/smartops/target/${targetId}`);
    await page.click('[data-testid="edit-target-button"]');
    await page.selectOption('[data-testid="target-classification"]', 'CONFIDENTIAL');
    await page.click('[data-testid="save-changes"]');

    // Verify downgrade prevented
    await expect(page.locator('[data-testid="classification-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="classification-error"]')).toContainText('Cannot downgrade classification');

    // Verify classification remains SECRET
    await page.goto(`/smartops/target/${targetId}`);

    await expect(page.locator('[data-testid="classification-badge"]')).toHaveText('SECRET');
  });

  test('should log classification access attempts for audit', async ({ page }) => {
    console.log('📝 Testing: Classification access audit logging');

    // Set up user with CONFIDENTIAL clearance
    await page.addInitScript(() => {
      window.localStorage.setItem('auth_token', 'test-token-confidential');
      window.localStorage.setItem('user_role', 'TARGETEER');
      window.localStorage.setItem('user_clearance', 'CONFIDENTIAL');
    });

    // Create a SECRET target
    const secretTargetId = await TargetHelper.createTarget(page, {
      name: 'SECRET-TARGET-005',
      classification: 'SECRET'
    });

    // Attempt to access SECRET target
    await page.goto(`/smartops/target/${secretTargetId}`);

    // Verify access denied visible
    await expect(page.locator('[data-testid="access-denied-warning"]')).toBeVisible();

    // Verify audit log entry created (check audit log page)
    await page.goto('/smartops/audit-log');
    await page.fill('[data-testid="audit-log-search"]', secretTargetId);
    await page.click('[data-testid="search-audit-log"]');

    // Verify access denied entry logged
    await expect(page.locator('[data-testid="audit-entry"]')).toContainText('ACCESS_DENIED');
    await expect(page.locator('[data-testid="audit-entry"]')).toContainText('CLEARANCE_INSUFFICIENT');
    await expect(page.locator('[data-testid="audit-entry"]')).toContainText(secretTargetId);
  });
});