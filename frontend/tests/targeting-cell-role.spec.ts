import { test, expect } from '@playwright/test';

test.describe('Targeting Cell Role', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the login page
    await page.goto('http://localhost:5173/login');
  });

  test('targeting cell user should only see relevant sidebar items', async ({ page }) => {
    // Login as targeting cell test user
    await page.fill('input[type="email"], input[name="identifier"]', 'targeting_cell@test.mil');
    await page.fill('input[type="password"]', 'TargetingCell2026!');
    await page.click('button[type="submit"]');

    // Wait for navigation to complete - either /smartops or /smartops/[page]
    await page.waitForURL(/\/smartops/, { timeout: 10000 });
    
    // Wait for the sidebar to be visible
    await page.waitForSelector('nav', { timeout: 5000 });

    // Check that the user can see targeting-related items
    await expect(page.getByText('COP Summary')).toBeVisible();
    await expect(page.getByText('Decision Board')).toBeVisible();
    await expect(page.getByText('Targeting Board')).toBeVisible();
    await expect(page.getByText('Strike Optimizer')).toBeVisible();
    await expect(page.getByText('BDA Workbench')).toBeVisible();
    await expect(page.getByText('ROE')).toBeVisible();
    await expect(page.getByText('Assessment')).toBeVisible();

    // Check that the user CANNOT see non-targeting items
    await expect(page.getByText('Personnel')).not.toBeVisible();
    await expect(page.getByText('Strategic Direction')).not.toBeVisible();
    await expect(page.getByText('Battle Rhythm')).not.toBeVisible();
    await expect(page.getByText('Proposals')).not.toBeVisible();
    await expect(page.getByText('OPLAN Manager')).not.toBeVisible();
    await expect(page.getByText('Campaign Design')).not.toBeVisible();
    await expect(page.getByText('Logistics')).not.toBeVisible();
  });

  test('targeting cell user can access targeting pages', async ({ page }) => {
    // Login as targeting cell test user
    await page.fill('input[type="email"], input[name="identifier"]', 'targeting_cell@test.mil');
    await page.fill('input[type="password"]', 'TargetingCell2026!');
    await page.click('button[type="submit"]');

    // Wait for navigation to complete - either /smartops or /smartops/[page]
    await page.waitForURL(/\/smartops/, { timeout: 10000 });

    // Navigate to targeting page
    await page.click('text=Targeting Board');
    await page.waitForURL('**/smartops/targeting', { timeout: 5000 });
    
    // Verify we're on the targeting page
    expect(page.url()).toContain('/smartops/targeting');

    // Navigate to strike optimizer
    await page.click('text=Strike Optimizer');
    await page.waitForURL('**/smartops/strike-optimizer', { timeout: 5000 });
    
    // Verify we're on the strike optimizer page
    expect(page.url()).toContain('/smartops/strike-optimizer');
  });

  test('targeting cell user should have correct permissions', async ({ page, request }) => {
    // Login and get the user info
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="email"], input[name="identifier"]', 'targeting_cell@test.mil');
    await page.fill('input[type="password"]', 'TargetingCell2026!');
    await page.click('button[type="submit"]');

    // Wait for navigation
    await page.waitForURL('**/smartops/**', { timeout: 10000 });

    // Check user permissions via API
    const response = await request.get('http://localhost:3000/api/auth/user', {
      headers: {
        'Cookie': await page.context().cookies().then(cookies => 
          cookies.map(c => `${c.name}=${c.value}`).join('; ')
        )
      }
    });

    expect(response.ok()).toBeTruthy();
    const userData = await response.json();
    
    // Verify user has targeting permissions
    expect(userData.permissions).toContain('targeting.view');
    expect(userData.permissions).toContain('targeting.nominate');
    expect(userData.permissions).toContain('targeting.jtb');
    expect(userData.permissions).toContain('targeting.manage');
    expect(userData.permissions).toContain('strike.view');
    expect(userData.permissions).toContain('bda.view');
    expect(userData.permissions).toContain('decision_board.view');
    expect(userData.permissions).toContain('roe.view');
    expect(userData.permissions).toContain('assessment.view');
    expect(userData.permissions).toContain('cop.view');
    
    // Verify user doesn't have admin or other non-targeting permissions
    expect(userData.permissions).not.toContain('*');
    expect(userData.permissions).not.toContain('write');
    expect(userData.permissions).not.toContain('delete');
  });
});
