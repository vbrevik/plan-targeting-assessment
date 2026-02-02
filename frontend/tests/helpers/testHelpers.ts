// Test Helpers for Targeting Workbench E2E Tests
// Provides common utility functions for test operations

import { test, expect, type Page, type APIRequestContext } from '@playwright/test';
import { type TestTarget, type TestUser, type TestBDAReport, mockApiResponses } from '../fixtures/testData';

async function getAuthToken(request: APIRequestContext): Promise<string> {
  // Use known test user - login field is 'identifier' not 'email'
  const testUsers = [
    { identifier: 'im@test.mil', password: 'Password123!' },
    { identifier: 'admin@example.com', password: 'Password123!' },
  ];

  for (const user of testUsers) {
    try {
      const loginRes = await request.post('http://localhost:3000/api/auth/login', {
        data: user
      });

      if (loginRes.ok()) {
        const body = await loginRes.json();
        if (body.access_token) {
          return body.access_token;
        }
      }
    } catch {
      // Continue to next user
    }
  }

  // Fallback token for mock environments
  console.warn('Could not authenticate, using fallback token');
  return 'test-token-12345';
}

// Custom test fixture with authenticated page
export const authenticatedTest = test.extend<{
  authenticatedPage: Page;
  authenticatedRequest: APIRequestContext;
}>({
  authenticatedPage: async ({ page, context, request }, use) => {
    const token = await getAuthToken(request);

    // Set up authentication token
    await context.addInitScript((accessToken) => {
      window.localStorage.setItem('auth_token', accessToken);
      window.localStorage.setItem('user_role', 'TARGETEER');
      window.localStorage.setItem('user_clearance', 'SECRET');
    }, token);

    await use(page);
  },
  authenticatedRequest: async ({ playwright, request }, use) => {
    const token = await getAuthToken(request);

    const apiContext = await playwright.request.newContext({
      baseURL: 'http://localhost:3000',
      extraHTTPHeaders: {
        'Authorization': `Bearer ${token}`,
      },
    });

    await use(apiContext);
    await apiContext.dispose();
  }
});

// Page navigation helpers
export class NavigationHelper {
  static async goToTargetingDashboard(page: Page) {
    await page.goto('/mshnctrl/targeting-cell-dashboard');
    await page.waitForLoadState('networkidle');
    // Wait for key components to load
    await page.waitForSelector('[data-testid="decision-gates-bar"]', { timeout: 10000 });
  }

  static async goToTargetNomination(page: Page) {
    await page.goto('/mshnctrl/targeting/nominate');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('[data-testid="target-nomination-form"]', { timeout: 10000 });
  }

  static async goToJTBSession(page: Page) {
    await page.goto('/mshnctrl/targeting/jtb');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('[data-testid="jtb-session-board"]', { timeout: 10000 });
  }

  static async goToBDAWorkbench(page: Page) {
    await page.goto('/mshnctrl/bda');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('[data-testid="bda-workbench"]', { timeout: 10000 });
  }

  static async goToMissionCommand(page: Page) {
    await page.goto('/mshnctrl/targeting/mission-command');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('[data-testid="mission-command-overview"]', { timeout: 10000 });
  }
}

// Target creation and management helpers
export class TargetHelper {
  static async createTarget(page: Page, targetData: Partial<TestTarget> = {}) {
    await NavigationHelper.goToTargetNomination(page);

    // Fill in target form
    await page.fill('[data-testid="target-name"]', targetData.name || 'TEST-TARGET-001');
    await page.selectOption('[data-testid="target-type"]', targetData.type || 'STANDARD');
    await page.selectOption('[data-testid="target-priority"]', targetData.priority || 'MEDIUM');
    await page.fill('[data-testid="target-coordinates"]', targetData.coordinates || '31.7683N, 35.2137E');
    await page.fill('[data-testid="target-description"]', targetData.description || 'Test target for E2E testing');

    // Submit form
    await page.click('[data-testid="submit-nomination"]');

    // Wait for API response and redirect
    await page.waitForResponse('**/api/targeting/targets');
    await page.waitForSelector('[data-testid="target-success-message"]', { timeout: 10000 });

    // Get created target ID from URL or success message
    const targetId = await page.locator('[data-testid="target-id"]').textContent();
    return targetId;
  }

  static async advanceTargetStage(page: Page, targetId: string, stage: string) {
    await page.goto(`/mshnctrl/target/${targetId}`);
    await page.waitForLoadState('networkidle');

    // Click advance stage button
    await page.click('[data-testid="advance-stage-button"]');

    // Confirm stage advancement
    await page.click('[data-testid="confirm-advance-stage"]');

    // Wait for API response
    await page.waitForResponse('**/api/targeting/targets/*/advance-stage');

    // Verify stage updated
    await expect(page.locator('[data-testid="f3ead-stage"]')).toHaveText(stage);
  }

  static async updateTargetStatus(page: Page, targetId: string, status: string) {
    await page.goto(`/mshnctrl/target/${targetId}`);
    await page.waitForLoadState('networkidle');

    // Find and click status transition button
    await page.click(`[data-testid="transition-to-${status.toLowerCase()}"]`);

    // Confirm status change
    await page.click('[data-testid="confirm-status-change"]');

    // Wait for API response
    await page.waitForResponse('**/api/targeting/targets/*');

    // Verify status updated
    await expect(page.locator('[data-testid="target-status"]')).toHaveText(status);
  }

  static async getTargetDetails(page: Page, targetId: string) {
    await page.goto(`/mshnctrl/target/${targetId}`);
    await page.waitForLoadState('networkidle');

    return {
      name: await page.locator('[data-testid="target-name"]').textContent(),
      type: await page.locator('[data-testid="target-type"]').textContent(),
      status: await page.locator('[data-testid="target-status"]').textContent(),
      stage: await page.locator('[data-testid="f3ead-stage"]').textContent(),
      coordinates: await page.locator('[data-testid="target-coordinates"]').textContent()
    };
  }
}

// JTB (Joint Targeting Board) helpers
export class JTBHelper {
  static async createJTBSession(page: Page, sessionData: any = {}) {
    await NavigationHelper.goToJTBSession(page);

    // Click create new session
    await page.click('[data-testid="create-jtb-session"]');

    // Fill session details
    await page.fill('[data-testid="session-date"]', sessionData.date || '2026-01-23');
    await page.fill('[data-testid="session-time"]', sessionData.time || '14:00');
    await page.selectOption('[data-testid="session-chair"]', sessionData.chair || 'LTC Mike Brown');

    // Submit session
    await page.click('[data-testid="submit-session"]');

    // Wait for creation
    await page.waitForResponse('**/api/targeting/jtb/sessions');
    await page.waitForSelector('[data-testid="jtb-session-created"]', { timeout: 10000 });

    // Get session ID
    const sessionId = await page.locator('[data-testid="session-id"]').textContent();
    return sessionId;
  }

  static async addTargetToSession(page: Page, sessionId: string, targetId: string) {
    await page.goto(`/mshnctrl/jtb-session/${sessionId}`);
    await page.waitForLoadState('networkidle');

    // Add target to session
    await page.click('[data-testid="add-target-to-session"]');
    await page.fill('[data-testid="target-search"]', targetId);
    await page.click(`[data-testid="select-target-${targetId}"]`);
    await page.click('[data-testid="confirm-add-target"]');

    // Wait for API response
    await page.waitForResponse('**/api/targeting/jtb/sessions/*/targets');
  }

  static async approveTarget(page: Page, sessionId: string, targetId: string) {
    await page.goto(`/mshnctrl/jtb-session/${sessionId}`);
    await page.waitForLoadState('networkidle');

    // Find target and click approve
    await page.click(`[data-testid="approve-target-${targetId}"]`);

    // Fill approval rationale
    await page.fill('[data-testid="approval-rationale"]', 'Target meets all engagement criteria');

    // Confirm approval
    await page.click('[data-testid="confirm-approval"]');

    // Wait for API response
    await page.waitForResponse('**/api/targeting/jtb/targets/*/decision');

    // Verify approval
    await expect(page.locator(`[data-testid="target-status-${targetId}"]`)).toHaveText('APPROVED');
  }
}

// BDA (Battle Damage Assessment) helpers
export class BDAHelper {
  static async createBDAReport(page: Page, targetId: string, bdaData: Partial<TestBDAReport> = {}) {
    await NavigationHelper.goToBDAWorkbench(page);

    // Click create BDA
    await page.click('[data-testid="create-bda-report"]');

    // Select target
    await page.selectOption('[data-testid="target-select"]', targetId);

    // Fill BDA details
    await page.fill('[data-testid="strike-id"]', bdaData.strike_id || 'STRIKE-001');
    await page.selectOption('[data-testid="bda-status"]', bdaData.bda_status || 'ASSESSING');
    await page.fill('[data-testid="effectiveness-pct"]', (bdaData.effectiveness_pct || 85).toString());
    await page.fill('[data-testid="bda-description"]', bdaData.description || 'Target successfully engaged');

    // Upload images (if provided)
    if (bdaData.images && bdaData.images.length > 0) {
      const fileInput = page.locator('[data-testid="bda-images"]');
      await fileInput.setInputFiles(bdaData.images);
    }

    // Submit BDA
    await page.click('[data-testid="submit-bda"]');

    // Wait for API response
    await page.waitForResponse('**/api/targeting/bda/assessments');

    // Get BDA ID
    const bdaId = await page.locator('[data-testid="bda-id"]').textContent();
    return bdaId;
  }

  static async uploadBDAImage(page: Page, bdaId: string, imagePath: string) {
    await page.goto(`/mshnctrl/bda/${bdaId}`);
    await page.waitForLoadState('networkidle');

    // Upload image
    const fileInput = page.locator('[data-testid="upload-image"]');
    await fileInput.setInputFiles(imagePath);

    // Wait for upload
    await page.waitForResponse('**/api/targeting/bda/assessments/*/images');

    // Verify image uploaded
    await expect(page.locator('[data-testid="image-uploaded"]')).toBeVisible();
  }
}

// Decision Gates helpers
export class DecisionGatesHelper {
  static async getGateStatus(page: Page, gateName: string) {
    const gateElement = page.locator(`[data-testid="gate-${gateName.toLowerCase()}"]`);
    return {
      name: await gateElement.locator('[data-testid="gate-name"]').textContent(),
      status: await gateElement.locator('[data-testid="gate-status"]').textContent(),
      value: await gateElement.locator('[data-testid="gate-value"]').textContent()
    };
  }

  static async waitForGateRefresh(page: Page, timeout = 35000) {
    // Wait for refresh indicator
    await page.waitForSelector('[data-testid="refresh-indicator"]', { timeout });

    // Wait for refresh to complete
    await page.waitForSelector('[data-testid="refresh-complete"]', { timeout: 5000 });
  }

  static async verifyAllGatesVisible(page: Page) {
    const gates = ['roe', 'cde', 'weather', 'deconfliction'];

    for (const gate of gates) {
      await expect(page.locator(`[data-testid="gate-${gate}"]`)).toBeVisible();
      await expect(page.locator(`[data-testid="gate-${gate}-status"]`)).toBeVisible();
    }
  }
}

// Performance measurement helpers
export class PerformanceHelper {
  static async measurePageLoad(page: Page, url: string): Promise<number> {
    const startTime = Date.now();
    await page.goto(url);
    await page.waitForLoadState('networkidle');
    const endTime = Date.now();

    return endTime - startTime;
  }

  static async measureApiResponse(page: Page, apiPattern: string): Promise<number> {
    let responseTime = 0;

    page.on('response', response => {
      if (response.url().includes(apiPattern)) {
        responseTime = Date.now() - response.request().timing().startTime;
      }
    });

    return responseTime;
  }

  static async verifyLoadTime(page: Page, maxLoadTime: number) {
    const loadTime = await PerformanceHelper.measurePageLoad(page, page.url());
    expect(loadTime).toBeLessThan(maxLoadTime);
  }
}

// API mocking helpers
export class ApiMockHelper {
  static async mockDecisionGates(page: Page) {
    await page.route('**/api/targeting/decision-gates', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockApiResponses.decisionGates)
      });
    });
  }

  static async mockTargetCreation(page: Page) {
    await page.route('**/api/targeting/targets', route => {
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(mockApiResponses.targetCreated)
      });
    });
  }

  static async mockDTLEntries(page: Page) {
    await page.route('**/api/targeting/dtl', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockApiResponses.dtlEntries)
      });
    });
  }

  static async mockMissionCommand(page: Page) {
    await page.route('**/api/targeting/mission-context', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockApiResponses.missionCommand)
      });
    });
  }
}

// Common assertions
export class AssertionHelper {
  static async verifyTargetStatus(page: Page, expectedStatus: string) {
    await expect(page.locator('[data-testid="target-status"]')).toHaveText(expectedStatus);
  }

  static async verifyF3EADStage(page: Page, expectedStage: string) {
    await expect(page.locator('[data-testid="f3ead-stage"]')).toHaveText(expectedStage);
  }

  static async verifyDecisionGateStatus(page: Page, gateName: string, expectedStatus: string) {
    await expect(page.locator(`[data-testid="gate-${gateName.toLowerCase()}-status"]`))
      .toHaveText(expectedStatus);
  }

  static async verifySuccessMessage(page: Page, message: string) {
    await expect(page.locator('[data-testid="success-message"]')).toHaveText(message);
  }

  static async verifyErrorMessage(page: Page, message: string) {
    await expect(page.locator('[data-testid="error-message"]')).toHaveText(message);
  }

  static async verifyComponentVisible(page: Page, componentTestId: string) {
    await expect(page.locator(`[data-testid="${componentTestId}"]`)).toBeVisible();
  }

  static async verifyComponentHidden(page: Page, componentTestId: string) {
    await expect(page.locator(`[data-testid="${componentTestId}"]`)).toBeHidden();
  }
}

// Error handling helpers
export class ErrorHelper {
  static async handleNetworkError(page: Page, action: () => Promise<void>) {
    try {
      await action();
    } catch (error) {
      console.log('Network error encountered:', error);
      // Take screenshot for debugging
      await page.screenshot({ path: 'error-screenshot.png' });
      throw error;
    }
  }

  static async retryAction(page: Page, action: () => Promise<void>, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        await action();
        return;
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await page.waitForTimeout(1000); // Wait 1 second before retry
      }
    }
  }
}