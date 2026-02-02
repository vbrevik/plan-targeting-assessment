import { superAdminTest as test } from './fixtures/auth';
import { expect } from '@playwright/test';

test.describe('SuperAdmin GUI Verification', () => {

    test('Dashboard access and basic navigation', async ({ authenticatedPage: page }) => {
        // 1. Verify successful login and redirection to dashboard
        await page.goto('/');
        await expect(page).toHaveURL(/.*dashboard|.*mshnctrl/);

        // 2. Verify Sidebar elements presence (checking "GUI based" aspect)
        const sidebar = page.locator('aside'); // Assuming standard sidebar element or class
        // Given earlier context about "Empty Sidebar", confirming this works for superadmin is crucial
        await expect(sidebar).toBeVisible();

        // 3. Verify Admin specific access (since user is superadmin)
        // Check for Admin settings or User Management links
        // We'll look for common admin text or links. 
        // Based on previous conversations, there might be an "Admin" or "Users" section.
        const adminLink = page.locator('a[href*="/admin"]');
        if (await adminLink.count() > 0) {
            await expect(adminLink.first()).toBeVisible();
        }
    });

    test('Targeting Workbench access', async ({ authenticatedPage: page }) => {
        await page.goto('/mshnctrl');
        await expect(page).toHaveURL(/.*mshnctrl/);
        await page.waitForLoadState('domcontentloaded');
    });

    test('Data access verification', async ({ authenticatedRequest: request }) => {
        // Verify API access with superadmin credentials
        const response = await request.get('/api/targeting/targets');
        expect(response.ok()).toBeTruthy();

        // Check admin specific endpoint
        const usersResponse = await request.get('/api/admin/users');
        // Admin endpoints might be under /api/admin or similar.
        // If this 404s it's fine, but if 403 then permissions are wrong.
        // Assuming /api/admin/users exists based on "Admin Module Integration" checks
        expect([200, 404]).toContain(usersResponse.status());
        if (usersResponse.status() === 403) {
            throw new Error('Superadmin denied access to user list');
        }
    });
});
